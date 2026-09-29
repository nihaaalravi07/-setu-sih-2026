import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..helpers import log_audit, log_event, dumps, loads
from ..verification import verify_application

router = APIRouter(prefix="/api", tags=["applications"])


def _serialize_application(app: models.Application, db: Session):
    return {
        "id": app.id,
        "citizen_id": app.citizen_id,
        "citizen_name": app.citizen.name,
        "scheme_name": app.scheme_name,
        "status": app.status,
        "created_at": app.created_at.isoformat(),
        "consent": {
            "granted": app.consent.granted,
            "purposes": loads(app.consent.purposes),
            "timestamp": app.consent.timestamp.isoformat(),
        } if app.consent else None,
        "verifications": [
            {
                "id": v.id,
                "department": v.department,
                "source_format": v.source_format,
                "source_record_id": v.source_record_id,
                "verification_status": v.verification_status,
                "confidence_score": v.confidence_score,
                "canonical_data": loads(v.canonical_data),
                "timestamp": v.timestamp.isoformat(),
            } for v in app.verifications
        ],
        "identity_matches": [
            {
                "id": m.id,
                "department": m.department,
                "confidence_score": m.confidence_score,
                "status": m.status,
                "reason": m.reason,
                "matched_fields": loads(m.matched_fields),
                "differing_fields": loads(m.differing_fields),
            } for m in app.identity_matches
        ],
    }


@router.post("/applications")
def create_application(payload: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    citizen = db.query(models.User).filter(models.User.id == payload.citizen_id).first()
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")

    application = models.Application(
        citizen_id=payload.citizen_id,
        scheme_name=payload.scheme_name,
        status="awaiting_consent",
    )
    db.add(application)
    db.flush()

    log_event(db, application.id, "application_submitted", f"Application submitted for {payload.scheme_name}")
    log_audit(db, actor=citizen.username, action="application_created", details=f"Application #{application.id} ({payload.scheme_name})")
    db.commit()
    db.refresh(application)
    return _serialize_application(application, db)


@router.get("/applications/{application_id}")
def get_application(application_id: int, db: Session = Depends(get_db)):
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return _serialize_application(app, db)


@router.post("/applications/{application_id}/consent")
def submit_consent(application_id: int, payload: schemas.ConsentRequest, db: Session = Depends(get_db)):
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    consent_ref = f"CONSENT-{uuid.uuid4().hex[:8].upper()}"
    consent = models.Consent(
        application_id=application_id,
        granted=payload.granted,
        purposes=dumps(payload.purposes),
    )
    db.add(consent)

    if payload.granted:
        app.status = "verifying"
        log_event(db, application_id, "consent_granted", "Citizen granted purpose-bound consent for department verification")
    else:
        app.status = "cancelled"
        log_event(db, application_id, "consent_denied", "Citizen declined consent")

    log_audit(db, actor=app.citizen.username, action="consent_submitted", details=f"Application #{application_id}: granted={payload.granted}")
    db.commit()

    result = _serialize_application(app, db)
    result["consent_reference"] = consent_ref
    return result


@router.post("/applications/{application_id}/verify")
def run_verification(application_id: int, db: Session = Depends(get_db)):
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if not app.consent or not app.consent.granted:
        raise HTTPException(status_code=400, detail="Consent required before verification")

    verify_application(db, app)
    db.commit()
    db.refresh(app)
    return _serialize_application(app, db)


@router.get("/applications/{application_id}/timeline")
def get_timeline(application_id: int, db: Session = Depends(get_db)):
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    events = sorted(app.events, key=lambda e: e.timestamp)
    return [
        {"id": e.id, "type": e.type, "description": e.description, "timestamp": e.timestamp.isoformat()}
        for e in events
    ]


@router.get("/citizens/{citizen_id}/applications")
def list_citizen_applications(citizen_id: int, db: Session = Depends(get_db)):
    apps = db.query(models.Application).filter(models.Application.citizen_id == citizen_id).all()
    return [_serialize_application(a, db) for a in apps]
