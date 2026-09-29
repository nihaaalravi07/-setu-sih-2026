from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..helpers import log_audit, log_event, loads

router = APIRouter(prefix="/api/officer", tags=["officer"])


@router.get("/applications")
def officer_dashboard(db: Session = Depends(get_db)):
    apps = db.query(models.Application).all()
    total = len(apps)
    pending = len([a for a in apps if a.status in ("awaiting_consent", "verifying")])
    verified = len([a for a in apps if a.status == "ready_for_processing"])
    reviews = db.query(models.IdentityMatch).filter(models.IdentityMatch.status == "pending_review").count()

    recent = sorted(apps, key=lambda a: a.created_at, reverse=True)
    recent_out = [
        {
            "id": a.id,
            "citizen_name": a.citizen.name,
            "scheme_name": a.scheme_name,
            "status": a.status,
            "created_at": a.created_at.isoformat(),
        } for a in recent
    ]

    return {
        "stats": {
            "total_applications": total,
            "pending_applications": pending,
            "verified_applications": verified,
            "identity_reviews": reviews,
        },
        "applications": recent_out,
    }


@router.get("/reviews")
def list_reviews(db: Session = Depends(get_db)):
    matches = db.query(models.IdentityMatch).filter(models.IdentityMatch.status == "pending_review").all()
    out = []
    for m in matches:
        app = m.application
        out.append({
            "id": m.id,
            "application_id": app.id,
            "citizen_name": app.citizen.name,
            "scheme_name": app.scheme_name,
            "department": m.department,
            "confidence_score": m.confidence_score,
            "reason": m.reason,
            "matched_fields": loads(m.matched_fields),
            "differing_fields": loads(m.differing_fields),
            "setu_record": loads(m.setu_record),
            "department_record": loads(m.department_record),
        })
    return out


@router.get("/reviews/{review_id}")
def get_review(review_id: int, db: Session = Depends(get_db)):
    m = db.query(models.IdentityMatch).filter(models.IdentityMatch.id == review_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Review not found")
    app = m.application
    return {
        "id": m.id,
        "application_id": app.id,
        "citizen_name": app.citizen.name,
        "scheme_name": app.scheme_name,
        "department": m.department,
        "confidence_score": m.confidence_score,
        "status": m.status,
        "reason": m.reason,
        "matched_fields": loads(m.matched_fields),
        "differing_fields": loads(m.differing_fields),
        "setu_record": loads(m.setu_record),
        "department_record": loads(m.department_record),
    }


def _resolve_application_after_review(app: models.Application, db: Session):
    remaining_review = any(m.status == "pending_review" for m in app.identity_matches)
    if not remaining_review:
        any_rejected = any(m.status == "rejected" for m in app.identity_matches)
        app.status = "ready_for_processing" if not any_rejected else "identity_review"
        if not any_rejected:
            log_event(db, app.id, "identity_resolved", "Officer confirmed identity match; identity resolved")
            log_event(db, app.id, "ready_for_processing", "Application ready for processing")


@router.post("/reviews/{review_id}/approve")
def approve_review(review_id: int, payload: schemas.ReviewDecision, db: Session = Depends(get_db)):
    m = db.query(models.IdentityMatch).filter(models.IdentityMatch.id == review_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Review not found")

    m.status = "confirmed"
    app = m.application
    log_event(db, app.id, "identity_review_approved", f"Officer confirmed {m.department} identity match ({m.confidence_score}% confidence)")
    log_audit(db, actor=payload.officer, action="identity_match_approved",
              details=f"Application #{app.id}: {m.department} match confirmed by officer")

    _resolve_application_after_review(app, db)
    db.commit()
    return {"status": "confirmed", "application_status": app.status}


@router.post("/reviews/{review_id}/reject")
def reject_review(review_id: int, payload: schemas.ReviewDecision, db: Session = Depends(get_db)):
    m = db.query(models.IdentityMatch).filter(models.IdentityMatch.id == review_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Review not found")

    m.status = "rejected"
    app = m.application
    log_event(db, app.id, "identity_review_rejected", f"Officer rejected {m.department} identity match ({m.confidence_score}% confidence)")
    log_audit(db, actor=payload.officer, action="identity_match_rejected",
              details=f"Application #{app.id}: {m.department} match rejected by officer")

    _resolve_application_after_review(app, db)
    db.commit()
    return {"status": "rejected", "application_status": app.status}
