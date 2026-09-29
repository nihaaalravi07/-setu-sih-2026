"""Deterministic identity resolution: compares a citizen's SETU profile against
a department record and produces a confidence score + human-readable reasons.
No ML — simple weighted field comparison, intentionally transparent for a demo.
"""
from difflib import SequenceMatcher


def name_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


def resolve_identity(setu_profile: dict, department_record: dict) -> dict:
    """
    setu_profile / department_record: {name, dob, mobile}
    Returns: {confidence_score, status, reason, matched_fields, differing_fields}
    """
    matched, differing = [], []

    dob_match = setu_profile["dob"] == department_record["dob"]
    (matched if dob_match else differing).append("dob")

    mobile_match = setu_profile["mobile"] == department_record["mobile"]
    (matched if mobile_match else differing).append("mobile")

    name_sim = name_similarity(setu_profile["name"], department_record["name"])
    name_match = name_sim >= 0.6
    (matched if name_match else differing).append("name")

    score = (0.45 * (1 if dob_match else 0) + 0.35 * (1 if mobile_match else 0) + 0.20 * name_sim) * 100
    score = round(score, 1)

    if score >= 90:
        status = "auto_confirmed"
        reason = "Strong match on DOB, mobile and name across records."
    elif score >= 55:
        status = "pending_review"
        parts = []
        if not mobile_match:
            parts.append("mobile number differs")
        if name_sim < 0.85:
            parts.append("name variation")
        if not dob_match:
            parts.append("DOB mismatch")
        reason = ", ".join(parts).capitalize() + " — requires officer confirmation."
    else:
        status = "rejected"
        reason = "Insufficient matching evidence across identifying fields."

    return {
        "confidence_score": score,
        "status": status,
        "reason": reason,
        "matched_fields": matched,
        "differing_fields": differing,
    }
