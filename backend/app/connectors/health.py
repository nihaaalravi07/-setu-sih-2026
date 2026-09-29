"""Simulated Health Department connector — legacy SOAP/XML source."""
import os
import xml.etree.ElementTree as ET
from datetime import datetime

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "health.xml")


def fetch_records():
    """Parses the legacy SOAP-style XML response into raw dicts."""
    tree = ET.parse(DATA_PATH)
    ns = {"soap": "http://schemas.xmlsoap.org/soap/envelope/"}
    records = []
    for rec in tree.getroot().find("soap:Body", ns).find("HealthRecordsResponse"):
        records.append({
            "record_id": rec.find("RecordId").text,
            "name": rec.find("PatientName").text,
            "dob": rec.find("DOB").text,  # dd-mm-yyyy legacy format
            "mobile": rec.find("ContactNumber").text,
            "status": rec.find("EligibilityStatus").text,
        })
    return records


def _to_iso_dob(dob_ddmmyyyy: str) -> str:
    return datetime.strptime(dob_ddmmyyyy, "%d-%m-%Y").strftime("%Y-%m-%d")


def normalize(record: dict) -> dict:
    """Converts a legacy XML health record into the SETU canonical shape."""
    return {
        "name": record["name"],
        "dob": _to_iso_dob(record["dob"]),
        "mobile": record["mobile"],
        "status": record["status"],
        "source_record_id": record["record_id"],
        "source_format": "LEGACY_XML",
        "extra": {},
    }


def find_and_normalize(name_hint: str = None, mobile_hint: str = None):
    for r in fetch_records():
        if mobile_hint and r["mobile"] == mobile_hint:
            return normalize(r)
        if name_hint and name_hint.split()[0].lower() in r["name"].lower():
            return normalize(r)
    return None
