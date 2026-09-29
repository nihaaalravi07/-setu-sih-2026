"""Simulated Revenue Department connector — REST JSON source."""
import json
import os

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "revenue.json")


def fetch_records():
    """Simulates a REST API call returning JSON records."""
    with open(DATA_PATH) as f:
        return json.load(f)


def normalize(record: dict) -> dict:
    """Converts a Revenue REST JSON record into the SETU canonical shape."""
    return {
        "name": record["name"],
        "dob": record["dob"],  # already ISO yyyy-mm-dd
        "mobile": record["mobile"],
        "status": record["status"],
        "source_record_id": record["record_id"],
        "source_format": "REST_JSON",
        "extra": {"income": record.get("income")},
    }


def find_and_normalize(name_hint: str = None, mobile_hint: str = None):
    """Looks up a record by loose hints (name substring or mobile) and normalizes it."""
    for r in fetch_records():
        if mobile_hint and r["mobile"] == mobile_hint:
            return normalize(r)
        if name_hint and name_hint.split()[0].lower() in r["name"].lower():
            return normalize(r)
    return None
