"""Seeds the SQLite database with deterministic demo data.
Run directly: python -m app.seed

Seeds two demo applications, each taken all the way through consent and
verification via the same `verify_application` engine the live API uses —
so confidence scores are always the real computed values, never faked:

  - Rahul Kumar (app #1, "Higher Education Scholarship"): all three
    department records match cleanly -> auto-confirmed, ready for processing.
  - Priya Sharma (app #2, "Healthcare Subsidy Scheme"): the Health
    department record has a different mobile number -> ambiguous match,
    lands in the officer identity review queue.
"""
from .database import Base, engine, SessionLocal
from . import models
from .helpers import log_audit, log_event, dumps
from .verification import verify_application

CONSENT_PURPOSES = ["income_verification", "eligibility_verification", "address_verification"]


def _submit_and_verify(db, citizen: models.User, scheme_name: str) -> models.Application:
    """Mirrors POST /applications -> POST /consent -> POST /verify, using ORM
    calls directly instead of HTTP, but the exact same underlying logic."""
    application = models.Application(citizen_id=citizen.id, scheme_name=scheme_name, status="awaiting_consent")
    db.add(application)
    db.flush()

    log_event(db, application.id, "application_submitted", f"Application submitted for {scheme_name}")
    log_audit(db, actor=citizen.username, action="application_created", details=f"Application #{application.id} ({scheme_name})")

    consent = models.Consent(application_id=application.id, granted=True, purposes=dumps(CONSENT_PURPOSES))
    db.add(consent)
    application.status = "verifying"
    log_event(db, application.id, "consent_granted", "Citizen granted purpose-bound consent for department verification")
    log_audit(db, actor=citizen.username, action="consent_submitted", details=f"Application #{application.id}: granted=True")
    db.flush()

    verify_application(db, application)
    db.flush()
    return application


def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    citizen1 = models.User(
        username="rahul", password="demo123", role="citizen",
        name="Rahul Kumar", dob="2004-08-14", mobile="9876543210",
    )
    citizen2 = models.User(
        username="priya", password="demo123", role="citizen",
        name="Priya Sharma", dob="1998-03-22", mobile="9123456780",
    )
    officer = models.User(
        username="officer", password="demo123", role="officer",
        name="Officer Anita Singh", dob=None, mobile=None,
    )
    db.add_all([citizen1, citizen2, officer])
    db.flush()

    log_audit(db, actor="system", action="seed", details="Demo database seeded")

    # Deterministic demo application #1 — clean, high-confidence match.
    _submit_and_verify(db, citizen1, "Higher Education Scholarship")

    # Deterministic demo application #2 — ambiguous Health match, lands in review queue.
    _submit_and_verify(db, citizen2, "Healthcare Subsidy Scheme")

    db.commit()
    db.close()
    print("Seed complete.")


if __name__ == "__main__":
    seed()
