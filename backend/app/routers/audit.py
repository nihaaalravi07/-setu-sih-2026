from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db

router = APIRouter(prefix="/api", tags=["audit"])


@router.get("/audit")
def list_audit(db: Session = Depends(get_db)):
    logs = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).all()
    return [
        {"id": l.id, "actor": l.actor, "action": l.action, "details": l.details, "timestamp": l.timestamp.isoformat()}
        for l in logs
    ]
