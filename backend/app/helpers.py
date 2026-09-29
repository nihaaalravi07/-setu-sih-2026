import json
from . import models


def log_audit(db, actor: str, action: str, details: str = ""):
    db.add(models.AuditLog(actor=actor, action=action, details=details))


def log_event(db, application_id: int, type_: str, description: str):
    db.add(models.Event(application_id=application_id, type=type_, description=description))


def dumps(obj) -> str:
    return json.dumps(obj)


def loads(s):
    return json.loads(s) if s else None
