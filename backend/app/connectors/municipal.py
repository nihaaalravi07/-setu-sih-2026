"""Simulated Municipal Department connector — flat-file CSV source."""
import csv
import os

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "municipal.csv")


def fetch_records():
    with open(DATA_PATH, newline="") as f:
        return list(csv.DictReader(f))


def normalize(record: dict) -> dict:
    """Converts a Municipal CSV record into the SETU canonical shape."""
    return {
        "name": record["name"],
        "dob": record["dob"],
        "mobile": record["mobile"],
        "status": record["status"],
        "source_record_id": record["record_id"],
        "source_format": "CSV",
        "extra": {"address": record.get("address")},
    }


def find_and_normalize(name_hint: str = None, mobile_hint: str = None):
    for r in fetch_records():
        if mobile_hint and r["mobile"] == mobile_hint:
            return normalize(r)
        if name_hint and name_hint.split()[0].lower() in r["name"].lower():
            return normalize(r)
    return None
