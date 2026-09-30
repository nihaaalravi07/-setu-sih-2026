# Security Policy

## Status

SETU is an **SIH 2026 hackathon prototype**, not a production system. It
has not undergone a security review or audit, and does not claim any
production security posture or certification.

## Known, Deliberate Limitations (Not Bugs)

These exist because this is a prototype demonstrating an architecture, not
because they were overlooked:

- **Authentication is a plaintext password comparison** against three
  seeded demo accounts (`backend/app/routers/auth.py`) — there is no
  hashing, no rate limiting, no account lockout, and no real session
  mechanism. The returned "token" (`demo-token-{id}-{role}`) is a display
  string, not a verifiable credential — it is never validated on
  subsequent requests.
- **No server-side authorization checks.** Every API endpoint is reachable
  by anyone who can send an HTTP request to it; the frontend enforces
  which pages a "citizen" vs. "officer" can navigate to, but the backend
  does not independently verify the caller's role.
- **The audit log is a flat, append-style table**
  (`backend/app/models.py::AuditLog`), not a cryptographically-chained or
  tamper-evident ledger.
- **CORS is origin-restricted but has no other request authentication** —
  see `backend/app/main.py`. `CORS_ORIGINS` controls which browser origins
  may call the API; it does not authenticate the caller.
- **The database is disposable by design** (SQLite, reseeded on every
  deploy — see `docs/deployment.md`), so there is no expectation of durable
  data protection in the current deployment.
- **All "department data" is sample data bundled in the repository**
  (`backend/app/data/`) — no real citizen data, government database, or
  identity provider is involved anywhere in this system.

## What This Means for Contributors

- **Never commit** API keys, passwords, access tokens, real citizen data,
  or government credentials of any kind to this repository. This project
  currently requires none — if you add a feature that needs one, put it in
  an environment variable (`backend/.env.example` /
  `frontend/.env.example`), never in source, and never commit the real
  `.env` file (it's gitignored — keep it that way).
- Do not use real personal data (yours or anyone else's) when testing —
  use the seeded demo accounts (`rahul`, `priya`, `officer`).
- Do not point any connector at a real government API or database without
  a separate, explicit authorization conversation — see root `README.md`
  §17 and `CONTRIBUTING.md`.

## Before Any Production Deployment

At minimum, a production version of this system would need: hashed
credentials behind a real identity provider, server-side authorization
enforcement per role, encrypted/durable storage with access controls,
a tamper-evident audit log, and a formal security review — none of which
are implemented in this prototype. See root `README.md` §11 ("Production
Scale-Up Path") for the corresponding architectural changes.

## Reporting a Concern

This is a hackathon team project (Team Aalu Bhujiya, Team ID 137932). If
you find a security issue in this repository, please open a GitHub issue
describing it — there is no separate private disclosure channel for this
prototype.
