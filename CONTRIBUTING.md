# Contributing to SETU

SETU is an SIH 2026 prototype (Team Aalu Bhujiya, Team ID 137932). This
guide is for anyone working on the codebase during or after the hackathon.

## Setup

Follow [`docs/development.md`](docs/development.md) for the full local
setup (backend venv, frontend `npm install`, seeding, running both
services). It has exact, working commands for this repository — use it
rather than guessing.

## Coding Expectations

- Match the existing style of the file you're editing. The backend is
  plain FastAPI + SQLAlchemy with no framework-specific conventions beyond
  what's already there; the frontend is plain React with a small shared
  `components/ui/` design system — reuse those components rather than
  hand-rolling new ones with different spacing/borders/focus states.
- Keep changes proportional to the task. Don't introduce a new dependency,
  service, or architectural layer to solve a problem the existing structure
  already handles.
- If you touch `backend/app/matching.py`, `verification.py`, or any
  connector, re-run `python -m app.seed` and confirm the demo scores in
  `docs/demo.md` (Rahul ~96.5%, Priya's Health department ~59%) still make
  sense — those numbers are referenced in the README and demo script.

## Preserve the Connector Abstraction

Every department connector (`backend/app/connectors/*.py`) must expose the
same three functions: `fetch_records()`, `normalize(record)`, and
`find_and_normalize(name_hint, mobile_hint)`, and `normalize()` must return
the canonical shape documented in `docs/architecture.md` §3. This is what
lets `verification.py` treat every department identically regardless of
source format. If you add a new department, follow this pattern exactly —
don't special-case it in the verification engine.

## Preserve Deterministic, Explainable Identity Resolution

`backend/app/matching.py` is intentionally a transparent, auditable
formula (see `docs/architecture.md` §5.1) — not a black box. If you change
the weights or thresholds, update `docs/architecture.md` and `docs/demo.md`
to match, and make sure every score is still accompanied by a
human-readable reason string. Do not introduce a machine-learning or
opaque-heuristic scoring path — this is a deliberate design property of the
project, not a temporary simplification.

## Never Commit Secrets

Never commit API keys, passwords, tokens, real citizen data, or government
credentials — see `SECURITY.md`. This project currently requires no
secrets at all; if a change of yours introduces one, it belongs in an
environment variable (documented in `backend/.env.example` or
`frontend/.env.example`), never in source.

## Never Claim Simulated Systems Are Real

The Revenue/Health/Municipal "departments" are sample data files in
`backend/app/data/`, not live government integrations. Do not add code,
comments, or documentation that implies otherwise, and do not connect this
project to any real government API, database, or identity provider without
an explicit, separate authorization conversation — this is an SIH prototype
(see root `README.md` §17, "Project Limitations").

## Required Validation Before Submitting Changes

1. Frontend: `cd frontend && npm run lint && npm run build`
2. Backend: `cd backend && python -m py_compile app/*.py app/**/*.py`
   (or simply start the app — an import/syntax error will fail immediately)
3. Backend: `cd backend && python -m app.seed` — confirm it completes
   without error
4. Manually verify (or run through `docs/demo.md`) that both the Rahul
   (auto-resolved) and Priya (officer-review) flows still behave as
   documented
5. `git status` — confirm no `venv/`, `node_modules/`, `dist/`, `.env`, or
   `setu.db` files are staged
