# SETU — API Reference

Base path for every endpoint below: `/api` (e.g. locally,
`http://localhost:8000/api/health`; in production,
`https://setu-api-lzx9.onrender.com/api/health`).

This document lists **only endpoints that exist in
`backend/app/routers/`** as of this writing. Request/response shapes are
taken directly from the router and schema source (`backend/app/schemas.py`,
and inline serialization in `applications.py`/`officer.py`).

There is no bearer-token/header-based auth on any endpoint — see
`SECURITY.md`. The `AUTH/ROLE` column below reflects intent (which role the
frontend expects to call it as), not an enforced server-side check.

---

## Health

### `GET /api/health`
**Purpose:** Liveness/health check.
**Auth/Role:** None.
**Response:**
```json
{ "status": "ok", "service": "SETU" }
```

---

## Authentication

### `POST /api/login`
**Purpose:** Authenticate a demo user by username/password.
**Auth/Role:** None (this endpoint issues the client-side "session").
**Request body** (`LoginRequest`):
```json
{ "username": "rahul", "password": "demo123" }
```
**Response** (`LoginResponse`): `401` on invalid credentials.
```json
{
  "user": { "id": 1, "username": "rahul", "role": "citizen", "name": "Rahul Kumar", "dob": "2004-08-14", "mobile": "9876543210" },
  "token": "demo-token-1-citizen"
}
```
Note: `token` is a formatted string (`demo-token-{id}-{role}`), not a
verifiable JWT/session token — see `SECURITY.md`.

### `GET /api/citizens/{citizen_id}`
**Purpose:** Fetch a citizen's profile.
**Auth/Role:** Citizen-facing.
**Response** (`UserOut`): `404` if not found or not a citizen.
```json
{ "id": 1, "username": "rahul", "role": "citizen", "name": "Rahul Kumar", "dob": "2004-08-14", "mobile": "9876543210" }
```

---

## Applications

### `POST /api/applications`
**Purpose:** Create a new application in `awaiting_consent` status.
**Auth/Role:** Citizen.
**Request body** (`ApplicationCreate`):
```json
{ "citizen_id": 1, "scheme_name": "Higher Education Scholarship" }
```
**Response:** the full serialized application (see shape below). `404` if
`citizen_id` doesn't exist.

### `GET /api/applications/{application_id}`
**Purpose:** Fetch one application with its consent, verifications, and
identity matches.
**Auth/Role:** Citizen or officer.
**Response summary:**
```json
{
  "id": 1,
  "citizen_id": 1,
  "citizen_name": "Rahul Kumar",
  "scheme_name": "Higher Education Scholarship",
  "status": "ready_for_processing",
  "created_at": "2026-...",
  "consent": { "granted": true, "purposes": ["..."], "timestamp": "2026-..." },
  "verifications": [
    { "id": 1, "department": "revenue", "source_format": "REST_JSON", "source_record_id": "REV-1001",
      "verification_status": "verified", "confidence_score": 100.0, "canonical_data": { "...": "..." }, "timestamp": "2026-..." }
  ],
  "identity_matches": [
    { "id": 1, "department": "revenue", "confidence_score": 100.0, "status": "auto_confirmed",
      "reason": "Strong match on DOB, mobile and name across records.", "matched_fields": ["dob","mobile","name"], "differing_fields": [] }
  ]
}
```
`404` if the application doesn't exist.

### `POST /api/applications/{application_id}/consent`
**Purpose:** Submit (or decline) purpose-bound consent for verification.
**Auth/Role:** Citizen.
**Request body** (`ConsentRequest`):
```json
{ "granted": true, "purposes": ["income_verification", "eligibility_verification", "address_verification"] }
```
**Response:** the serialized application (as above) plus a
`consent_reference` string. If `granted` is `false`, the application's
status becomes `cancelled` and verification is never run. `404` if the
application doesn't exist.

### `POST /api/applications/{application_id}/verify`
**Purpose:** Run department verification + identity resolution for an
application that has already granted consent. **Idempotent** — a no-op if
verifications already exist for this application.
**Auth/Role:** Citizen (triggered automatically by the frontend once
consent is granted).
**Request body:** none.
**Response:** the serialized application, updated with `verifications` and
`identity_matches`. `400` if consent was not granted. `404` if the
application doesn't exist.

### `GET /api/applications/{application_id}/timeline`
**Purpose:** Chronological event log for one application.
**Auth/Role:** Citizen or officer.
**Response:**
```json
[
  { "id": 1, "type": "application_submitted", "description": "Application submitted for Higher Education Scholarship", "timestamp": "2026-..." }
]
```
`404` if the application doesn't exist.

### `GET /api/citizens/{citizen_id}/applications`
**Purpose:** List all applications belonging to one citizen.
**Auth/Role:** Citizen.
**Response:** array of serialized applications (same shape as `GET
/api/applications/{id}`).

---

## Officer Operations

All endpoints under `/api/officer`.

### `GET /api/officer/applications`
**Purpose:** Officer dashboard — summary stats plus recent applications.
**Auth/Role:** Officer.
**Response:**
```json
{
  "stats": { "total_applications": 2, "pending_applications": 0, "verified_applications": 1, "identity_reviews": 1 },
  "applications": [
    { "id": 2, "citizen_name": "Priya Sharma", "scheme_name": "Healthcare Subsidy Scheme", "status": "identity_review", "created_at": "2026-..." }
  ]
}
```

### `GET /api/officer/reviews`
**Purpose:** List all identity matches currently `pending_review`, with
both the SETU-side and department-side records for comparison.
**Auth/Role:** Officer.
**Response:**
```json
[
  {
    "id": 5, "application_id": 2, "citizen_name": "Priya Sharma", "scheme_name": "Healthcare Subsidy Scheme",
    "department": "health", "confidence_score": 59.0,
    "reason": "Mobile number differs, name variation — requires officer confirmation.",
    "matched_fields": ["dob", "name"], "differing_fields": ["mobile"],
    "setu_record": { "name": "Priya Sharma", "dob": "1998-03-22", "mobile": "9123456780" },
    "department_record": { "name": "Priya S.", "dob": "1998-03-22", "mobile": "9123456999", "status": "verified", "source_record_id": "HLT-5002", "source_format": "LEGACY_XML", "extra": {} }
  }
]
```

### `GET /api/officer/reviews/{review_id}`
**Purpose:** Fetch one review's full detail (same shape as one item above,
plus `status`).
**Auth/Role:** Officer.
**Response:** single object, shape as above. `404` if not found.

### `POST /api/officer/reviews/{review_id}/approve`
**Purpose:** Officer confirms a department's identity match.
**Auth/Role:** Officer.
**Request body** (`ReviewDecision`):
```json
{ "officer": "Officer Anita Singh" }
```
**Response:**
```json
{ "status": "confirmed", "application_status": "ready_for_processing" }
```
`404` if the review doesn't exist.

### `POST /api/officer/reviews/{review_id}/reject`
**Purpose:** Officer rejects a department's identity match (excludes that
department's record from resolution).
**Auth/Role:** Officer.
**Request body** (`ReviewDecision`): same shape as approve.
**Response:**
```json
{ "status": "rejected", "application_status": "identity_review" }
```
`404` if the review doesn't exist.

---

## Audit

### `GET /api/audit`
**Purpose:** Full audit log, newest first.
**Auth/Role:** Officer.
**Response:**
```json
[
  { "id": 16, "actor": "Officer Anita Singh", "action": "identity_match_approved", "details": "Application #2: health match confirmed by officer", "timestamp": "2026-..." }
]
```
