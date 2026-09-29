"""Shared verification engine: connects to the three department connectors,
runs identity resolution, and writes verifications/identity_matches/events.

Used by both the `/applications/{id}/verify` endpoint and `seed.py`, so that
demo data seeded at startup goes through the exact same connector + matching
logic as a live request — confidence scores are never faked or hardcoded.
"""
from . import models
from .helpers import log_audit, log_event, dumps
from .connectors import revenue, health, municipal
from .matching import resolve_identity

DEPARTMENTS = [
    ("revenue", revenue),
    ("health", health),
    ("municipal", municipal),
]


def verify_application(db, application: "models.Application") -> bool:
    """Runs department verification + identity resolution for an application
    that has already granted consent. Idempotent — no-ops if verifications
    already exist. Returns True if verification actually ran.
    """
    if application.verifications:
        return False

    citizen = application.citizen
    consent_ref = f"CONSENT-APP{application.id}"
    setu_profile = {"name": citizen.name, "dob": citizen.dob, "mobile": citizen.mobile}

    review_needed = False

    for dept_name, connector in DEPARTMENTS:
        record = connector.find_and_normalize(name_hint=citizen.name, mobile_hint=citizen.mobile)
        if not record:
            continue

        match = resolve_identity(setu_profile, {
            "name": record["name"], "dob": record["dob"], "mobile": record["mobile"],
        })

        verification = models.DepartmentVerification(
            application_id=application.id,
            department=dept_name,
            source_format=record["source_format"],
            source_record_id=record["source_record_id"],
            verification_status="verified" if match["status"] != "rejected" else "failed",
            confidence_score=match["confidence_score"],
            canonical_data=dumps(record),
            consent_reference=consent_ref,
        )
        db.add(verification)

        identity_match = models.IdentityMatch(
            application_id=application.id,
            department=dept_name,
            confidence_score=match["confidence_score"],
            status=match["status"],
            reason=match["reason"],
            matched_fields=dumps(match["matched_fields"]),
            differing_fields=dumps(match["differing_fields"]),
            setu_record=dumps(setu_profile),
            department_record=dumps(record),
        )
        db.add(identity_match)

        log_event(db, application.id, "department_verification",
                   f"{dept_name.title()} verification completed ({record['source_format']}) — confidence {match['confidence_score']}%")

        if match["status"] == "pending_review":
            review_needed = True

        log_audit(db, actor="setu-system", action="department_verification",
                   details=f"Application #{application.id}: {dept_name} -> {match['status']} ({match['confidence_score']}%)")

    if review_needed:
        application.status = "identity_review"
        log_event(db, application.id, "identity_review_required", "One or more department matches require officer review")
    else:
        application.status = "ready_for_processing"
        log_event(db, application.id, "identity_resolved", "Identity resolved across all departments")
        log_event(db, application.id, "ready_for_processing", "Application ready for processing")

    log_audit(db, actor="setu-system", action="verification_run", details=f"Application #{application.id} verification complete")
    return True
