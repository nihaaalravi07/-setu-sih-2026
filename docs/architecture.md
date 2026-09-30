# SETU — Architecture

This document describes the architecture as actually implemented in this
repository. Every claim below is traceable to a specific file.

## 1. High-Level Flow

```
Citizen / Officer
        |
        v
   SETU Portal            frontend/  — React + Vite SPA
        |
        v
   SETU Core              backend/app/main.py, routers/  — FastAPI
        |
        v
  Connector Layer         backend/app/connectors/
   |          |          |
Revenue     Health     Municipal
REST/JSON   Legacy XML   CSV
```

The frontend never talks to a department connector directly — every request
goes through the FastAPI backend (`backend/app/routers/`), which is the only
component allowed to read department data and write to the database.

## 2. Connector Abstraction

Each department connector (`backend/app/connectors/revenue.py`,
`health.py`, `municipal.py`) implements the same two-function interface:

```python
def fetch_records() -> list[dict]:
    """Reads the department's data in its native format."""

def normalize(record: dict) -> dict:
    """Converts one native record into the SETU canonical shape."""

def find_and_normalize(name_hint=None, mobile_hint=None) -> dict | None:
    """Looks up a record by loose hints, then returns it normalized."""
```

Because every connector honors this interface regardless of source format,
`backend/app/verification.py` can iterate over all three departments
identically:

```python
DEPARTMENTS = [
    ("revenue", revenue),
    ("health", health),
    ("municipal", municipal),
]
```

Adding a fourth department means adding one more connector module with the
same three functions — the verification engine does not change.

### 2.1 Source formats (as implemented)

| Department | Native format | Parser | Notable normalization |
|---|---|---|---|
| Revenue | REST-JSON-shaped file (`data/revenue.json`) | `json.load` | Date already ISO; income kept as connector-specific `extra` data |
| Health | Legacy SOAP/XML envelope (`data/health.xml`) | `xml.etree.ElementTree` | Date converted from legacy `dd-mm-yyyy` to canonical ISO `yyyy-mm-dd` |
| Municipal | Flat CSV file (`data/municipal.csv`) | `csv.DictReader` | Address kept as connector-specific `extra` data |

## 3. Canonical Data Model

`normalize()` in every connector returns the same shape:

```json
{
  "name": "string",
  "dob": "YYYY-MM-DD",
  "mobile": "string",
  "status": "string",
  "source_record_id": "string",
  "source_format": "REST_JSON | LEGACY_XML | CSV",
  "extra": { "...connector-specific fields..." }
}
```

This canonical record is what identity resolution (§5) compares against the
citizen's SETU profile, and it is what gets persisted (as JSON) in
`department_verifications.canonical_data` — so the exact record a decision
was based on is always retrievable later, unchanged.

## 4. Consent

Before any connector is called for a given application, the citizen must
submit a consent decision (`POST /api/applications/{id}/consent`, see
`docs/api.md`). Consent purposes are stored as a JSON list
(`consents.purposes`) alongside a `granted` boolean and timestamp. If
consent is declined, the application is marked `cancelled` and no
verification is attempted. If granted, the application status becomes
`verifying` and the frontend triggers `POST
/api/applications/{id}/verify`.

## 5. Verification & Identity Resolution

`backend/app/verification.py`'s `verify_application()` is the single place
this happens, called by both the live `/verify` endpoint and `seed.py` (so
seeded demo data goes through the exact same code path as a real request —
see `docs/development.md` §"Database seeding"). For each department:

1. `connector.find_and_normalize(name_hint, mobile_hint)` looks up a record.
2. If found, `matching.resolve_identity()` (`backend/app/matching.py`)
   compares the canonical record against the citizen's SETU profile
   (`name`, `dob`, `mobile`).
3. A `DepartmentVerification` row and an `IdentityMatch` row are written.
4. An event is appended to the application's timeline, and an audit-log
   entry is written.

### 5.1 The matching algorithm (exact, from source)

```python
score = (0.45 * (1 if dob_match else 0)
       + 0.35 * (1 if mobile_match else 0)
       + 0.20 * name_similarity) * 100
```

- `dob_match` / `mobile_match`: exact string equality.
- `name_similarity`: `difflib.SequenceMatcher(None, a.lower().strip(),
  b.lower().strip()).ratio()` — a ratio in `[0, 1]`.
- `score` is rounded to one decimal place.

### 5.2 Thresholds (exact, from source)

| `score` | `status` | Effect |
|---|---|---|
| ≥ 90 | `auto_confirmed` | Counted toward automatic resolution |
| 55 ≤ score < 90 | `pending_review` | Application status → `identity_review`; appears in the officer Review Queue |
| < 55 | `rejected` | `DepartmentVerification.verification_status` = `failed` |

If **any** department's match for an application is `pending_review`, the
whole application's status becomes `identity_review`. Only once every
department's match is resolved (auto-confirmed, or manually
confirmed/rejected by an officer) does the application become
`ready_for_processing`.

This is a **deterministic, rule-based comparison** — there is no model
training, no embeddings, and no probabilistic/ML component anywhere in this
codebase. The formula and thresholds above are the entire algorithm.

## 6. Officer Review

When a department's match needs review, it appears in `GET
/api/officer/reviews` with the SETU-side record, the department-side
record, the confidence score, and a generated reason string (assembled in
`matching.py` from which specific fields differed). An officer calls `POST
/api/officer/reviews/{id}/approve` or `.../reject`
(`backend/app/routers/officer.py`), which:

- Updates that `IdentityMatch.status` to `confirmed` or `rejected`.
- Logs an event to the application's timeline and an audit-log entry
  identifying the officer (`payload.officer`, free text — see
  `SECURITY.md` for the implication of this not being an authenticated
  identity).
- Recomputes the application's overall status
  (`_resolve_application_after_review`): `ready_for_processing` once no
  department match is still `pending_review` and none was `rejected`,
  otherwise it stays in `identity_review`.

## 7. Audit Trail

Every consent submission, department verification, verification run,
officer approval, and officer rejection writes one row to `audit_logs`
(`actor`, `action`, `details`, `timestamp`) via `helpers.log_audit()`. The
full log is readable via `GET /api/audit`, newest first. This is a flat,
structured log table — not a cryptographically-chained/tamper-evident
ledger (see `SECURITY.md` and README §17 for what a production version
would add).

## 8. Data Model Summary

See `backend/app/models.py` for the authoritative definitions. Tables:
`users`, `applications`, `consents`, `department_verifications`,
`identity_matches`, `events`, `audit_logs`. Full field-level detail is in
the source file itself — it is short and directly readable.

## 9. What This Architecture Deliberately Does Not Include

To keep the prototype's complexity proportional to what it needs to prove:

- No message queue (Kafka or otherwise) — verification runs synchronously,
  in-process, because it's calling three local file reads, not real network
  services.
- No container orchestration (Docker/Kubernetes) — Render's native Python
  and static-site runtimes are sufficient for this deployment (see
  `docs/deployment.md`).
- No separate database service — SQLite is adequate for a reseed-on-deploy
  prototype (see `docs/deployment.md` for the reasoning).
- No ML model — identity resolution is intentionally a transparent,
  auditable formula (§5.1), which is a deliberate design choice for a
  government-facing decision process, not a limitation to be "fixed" later.
