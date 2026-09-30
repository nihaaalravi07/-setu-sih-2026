# Changelog

All notable changes to SETU are documented here.

## [0.1.0] — SIH 2026 Prototype

Initial prototype release for Smart India Hackathon 2026, Problem Statement
SIH26129, Team Aalu Bhujiya (Team ID 137932).

### Frontend
- React 19 + Vite 8 single-page application, React Router 7 for routing.
- Tailwind CSS 4 design system (`frontend/src/components/ui/`).
- Citizen pages: Login, Dashboard, New Application, Application Detail.
- Officer pages: Dashboard, Review Queue, Audit Trail.
- Responsive layout (desktop, tablet, mobile).
- Build-time-configurable API base URL (`VITE_API_BASE_URL`, falls back to
  `/api`).

### Backend
- FastAPI application (`backend/app/main.py`) with SQLAlchemy 2.0 ORM
  models and SQLite storage.
- Environment-variable-driven CORS configuration (`CORS_ORIGINS`, with a
  local-development fallback).

### Connector Layer
- Revenue connector — REST-JSON-shaped source (`backend/app/connectors/revenue.py`).
- Health connector — legacy SOAP/XML source, including date-format
  normalization (`backend/app/connectors/health.py`).
- Municipal connector — CSV flat-file source (`backend/app/connectors/municipal.py`).
- Canonical data normalization shared across all three connectors.

### Identity Resolution
- Deterministic, weighted-field matching algorithm
  (`backend/app/matching.py`) — DOB (45%), mobile number (35%), name
  similarity via `difflib` (20%).
- Confidence-scored, human-readable-reason output; three-tier outcome
  (`auto_confirmed` / `pending_review` / `rejected`).

### Workflow
- Purpose-bound consent capture before verification.
- Shared verification engine (`backend/app/verification.py`) used
  identically by the live API and the deterministic seed script.
- Officer review queue with approve/reject actions
  (`backend/app/routers/officer.py`).
- Per-application event timeline.
- Global, append-only audit log (`GET /api/audit`).
- Deterministic demo data (`backend/app/seed.py`): Rahul Kumar (Application
  0001, auto-resolved) and Priya Sharma (Application 0002, ambiguous Health
  match requiring officer review).

### Deployment
- Deployed as two Render services: a Static Site (frontend) and a Web
  Service (backend), with SQLite reseeded on every backend deploy — see
  `docs/deployment.md`.

### Documentation
- Full documentation set added: `README.md`, `CONTRIBUTING.md`,
  `SECURITY.md`, `CODE_OF_CONDUCT.md`, and `docs/` (architecture, API
  reference, development guide, demo walkthrough, deployment guide).
- Basic CI workflow (`.github/workflows/ci.yml`): frontend lint/build,
  backend compile check and deterministic seed check.
