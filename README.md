# SETU
### Secure Exchange & Trust Unification Layer

**Smart India Hackathon 2026 · Problem Statement SIH26129**
**Team Aalu Bhujiya · Team ID 137932**

Live prototype: **https://setu-sih-2026-1.onrender.com**
API health check: **https://setu-api-lzx9.onrender.com/api/health**

> **Disclaimer:** This is an SIH 2026 prototype using simulated departmental
> data. It is not an official government system and does not connect to
> real government databases or identity providers.

---

## 1. Project Overview

SETU is a prototype **interoperability layer** for government service
delivery. A citizen applies for a scheme once, through one portal. Behind
that single application, SETU coordinates verification with multiple
department systems that were never designed to talk to each other —
normalizing their different data formats into one canonical record, scoring
how confidently those records refer to the same person, and routing
anything ambiguous to a human officer before the application proceeds.

## 2. Problem

Government services typically require a citizen to prove the same facts
(identity, income, address, eligibility) separately to multiple departments,
each with its own systems, formats, and record-keeping conventions. Manually
reconciling those records — or forcing every department onto one shared
database — is slow, expensive, and often infeasible for systems built
decades apart on different technology.

## 3. Solution

SETU sits between the citizen-facing application and each department's
existing system. It does not replace departmental systems or require them
to change. Instead, it defines a **connector** per department that reads
that department's existing data in its existing format and translates it
into one shared ("canonical") shape SETU understands. Once every relevant
department's record is in that shared shape, SETU can compare them,
score how likely they belong to the same citizen, and present one unified
application status — while keeping every original department record and
every decision fully auditable.

## 4. Why SETU Is an Interoperability Layer, Not Merely a Portal

A portal would just be a form that submits to one backend. SETU's backend
(`backend/app/verification.py`) actively:

- Calls three independently-shaped data sources (JSON, legacy XML, CSV) —
  see §7.
- Normalizes each into one **canonical data model** regardless of source
  format.
- Runs a **deterministic identity-resolution algorithm** (§8) against the
  citizen's SETU profile, per department, independently.
- Produces a **per-department confidence score and machine-generated
  reason string**, not just a pass/fail flag.
- Escalates ambiguous matches to a **human officer review queue** (§9)
  rather than silently guessing.
- Writes an **immutable audit trail** of every consent, verification, and
  officer decision.

This is the actual behavior implemented in the codebase — not a diagram
that overstates what the code does.

## 5. Architecture Diagram

```
Citizen / Officer
        |
        v
   SETU Portal (React + Vite)
        |
        v
   SETU Core (FastAPI)
        |
        v
  Connector Layer (backend/app/connectors/)
   |          |          |
Revenue     Health     Municipal
REST/JSON   Legacy XML   CSV
```

Full detail, including the canonical data model and identity-resolution
formula, is in [`docs/architecture.md`](docs/architecture.md).

## 6. Technology Stack

**Frontend:** React 19, Vite 8, React Router 7, Tailwind CSS 4. No
component library, no state-management library beyond React context.

**Backend:** FastAPI, SQLAlchemy 2.0 (ORM), Pydantic 2, SQLite. Plain
`uvicorn` ASGI server, no task queue, no cache layer.

**No** Kafka, Kubernetes, Docker, Redis, PostgreSQL, Celery, or ML
frameworks are used — see §17 for why, and what a production version would
add.

## 7. Heterogeneous Connector Demonstration

Three simulated department data sources, each in a different real-world
format, live under `backend/app/data/`:

| Department | Format | File | Parsed with |
|---|---|---|---|
| Revenue | REST-JSON-shaped | `revenue.json` | `json` |
| Health | Legacy SOAP/XML | `health.xml` | `xml.etree.ElementTree` |
| Municipal | Flat-file CSV | `municipal.csv` | `csv.DictReader` |

Each connector (`backend/app/connectors/{revenue,health,municipal}.py`)
exposes the same two functions — `fetch_records()` and `normalize(record)`
— so the verification engine can treat all three identically despite their
completely different source shapes. The Health connector additionally
converts the legacy `dd-mm-yyyy` date format to ISO `yyyy-mm-dd` as part of
normalization — a concrete, working example of format reconciliation, not
just an abstraction.

## 8. Identity Resolution

Implemented in `backend/app/matching.py`. This is a **deterministic,
explainable, weighted field comparison** — there is no machine learning
model anywhere in this codebase.

For each department record compared against the citizen's SETU profile:

```
score = (0.45 × date_of_birth_exact_match)
       + (0.35 × mobile_number_exact_match)
       + (0.20 × name_similarity)
```

`name_similarity` is computed with Python's `difflib.SequenceMatcher` ratio
on the lower-cased, trimmed names. The final score is rounded to one
decimal place, 0–100.

| Score | Outcome |
|---|---|
| ≥ 90 | `auto_confirmed` — resolved automatically |
| 55–89 | `pending_review` — sent to the officer Review Queue |
| < 55 | `rejected` |

Every score is accompanied by a human-readable reason string (e.g. *"Mobile
number differs, name variation — requires officer confirmation."*) and the
exact list of matched vs. differing fields — nothing is a black box.

## 9. Human-in-the-Loop Review

When any department's match lands in `pending_review`, the application's
status becomes `identity_review` and the case appears in the Officer Review
Queue (`/officer/reviews`). The officer sees the SETU record and the
department's record side by side, field by field, with the computed
confidence score and reason, and can **approve** or **reject** that specific
department's match. The decision is written back (`identity_matches.status`
→ `confirmed`/`rejected`), logged to both the application's timeline and the
global audit log, and the application's overall status is recomputed.

## 10. Implemented Functionality

- Citizen login (demo credentials, see §14)
- Application creation for one of three sample schemes
- Purpose-bound consent capture before any verification runs
- Live verification against all three department connectors
- Canonical data normalization (§7)
- Deterministic identity resolution with confidence scoring (§8)
- Officer review queue with approve/reject (§9)
- Per-application event timeline
- Global, append-only audit log (`/api/audit`)
- Responsive UI (desktop, tablet, mobile) for both citizen and officer roles

## 11. Production Scale-Up Path

What would change to take this from prototype to production, without
changing the core architecture:

- **Connectors** would call real department APIs/SOAP endpoints/SFTP drops
  instead of reading bundled sample files — the `fetch_records()` /
  `normalize()` interface does not need to change.
- **Database** would move from SQLite to a managed, persistent database
  (e.g. PostgreSQL) — see `docs/deployment.md` for why SQLite is
  intentionally disposable here.
- **Auth** would move from the current plaintext-password/demo-token login
  (§17) to a real identity provider and session mechanism.
- **Identity resolution** could add additional deterministic signals (more
  fields, fuzzy address matching) while keeping the same explainable,
  auditable design — this prototype does not claim a need for ML, and nothing
  about the architecture requires one.
- **Audit log** would move to an append-only/tamper-evident store.

## 12. Repository Structure

```
setu/
├── backend/
│   ├── app/
│   │   ├── main.py              FastAPI app, CORS, router registration
│   │   ├── database.py          SQLAlchemy engine/session (SQLite)
│   │   ├── models.py            ORM models
│   │   ├── schemas.py           Pydantic request/response models
│   │   ├── seed.py              Deterministic demo data (see §15)
│   │   ├── verification.py      Shared verification engine
│   │   ├── matching.py          Identity resolution algorithm (§8)
│   │   ├── helpers.py           Audit/event logging, JSON (de)serialization
│   │   ├── connectors/          revenue.py, health.py, municipal.py (§7)
│   │   ├── data/                Sample department data files
│   │   └── routers/             auth.py, applications.py, officer.py, audit.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/                Login, Dashboard, Apply, ApplicationDetail,
│   │   │                         OfficerDashboard, OfficerReviews, OfficerAudit
│   │   ├── components/ui/        Shared design-system components
│   │   ├── api/client.js         Fetch wrapper, one function per endpoint
│   │   └── App.jsx                Routes
│   └── vite.config.js
└── docs/
    ├── architecture.md
    ├── api.md
    ├── development.md
    ├── demo.md
    └── deployment.md
```

## 13. Local Setup

Full instructions in [`docs/development.md`](docs/development.md). Quick
start:

```bash
# Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## 14. Demo Credentials

All passwords: `demo123`

| Username | Role | Notes |
|---|---|---|
| `rahul` | citizen | Application 0001 — clean, high-confidence match |
| `priya` | citizen | Application 0002 — ambiguous match, needs officer review |
| `officer` | officer | Officer Anita Singh — reviews Priya's case |

## 15. Demo Workflow

Full walkthrough in [`docs/demo.md`](docs/demo.md). Summary:

1. **Rahul** — login → Application 0001 → consent → verification against
   Revenue/Health/Municipal → **96.5% average identity confidence**,
   automatically resolved → Ready for Processing.
2. **Priya** — Application 0002 → Health department comes back at
   **59% confidence** (a genuine, computed value — the mobile number differs
   between her SETU profile and the Health department's record) → officer
   Review Queue → officer compares records → approves → audit trail records
   the decision.

## 16. Deployment

Full detail in [`docs/deployment.md`](docs/deployment.md). Currently
deployed as two Render services:

- **Frontend** (Static Site): https://setu-sih-2026-1.onrender.com
- **Backend** (Web Service): https://setu-api-lzx9.onrender.com

## 17. Project Limitations

This is an SIH prototype. It explicitly does **not** implement or claim:

- Real Maharashtra (or any) government API integration
- Aadhaar or any real identity-provider integration
- Production single sign-on
- Kafka, Kubernetes, or any distributed-systems infrastructure
- Machine-learning-based identity resolution (matching is deterministic —
  see §8)
- Production security certification or production readiness
- Persistent storage guarantees (SQLite is reseeded on every deploy — see
  `docs/deployment.md`)
- Real session/token-based authentication (login is a plaintext-password
  check against seeded demo users; see `SECURITY.md`)

## 18. Live Prototype

- Frontend: https://setu-sih-2026-1.onrender.com
- Backend health: https://setu-api-lzx9.onrender.com/api/health

---

See also: [`docs/architecture.md`](docs/architecture.md) ·
[`docs/api.md`](docs/api.md) · [`docs/development.md`](docs/development.md) ·
[`docs/demo.md`](docs/demo.md) · [`docs/deployment.md`](docs/deployment.md) ·
[`CONTRIBUTING.md`](CONTRIBUTING.md) · [`SECURITY.md`](SECURITY.md) ·
[`CHANGELOG.md`](CHANGELOG.md)
