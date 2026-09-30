# SETU — Deployment

SETU is deployed as **two independent Render services** — no Docker, no
Kubernetes, no managed database service.

- **Frontend** (Render Static Site): https://setu-sih-2026-1.onrender.com
- **Backend** (Render Web Service): https://setu-api-lzx9.onrender.com

## Backend — Render Web Service

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Runtime | Python (native, no Docker) |
| Python version | 3.12.x |
| Build command | `pip install -r requirements.txt && python -m app.seed` |
| Start command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health check path | `/api/health` |
| Environment variable | `CORS_ORIGINS` = the deployed frontend's origin (e.g. `https://setu-sih-2026-1.onrender.com`) |

The build command both creates the database schema (via the model imports
in `seed.py`) and seeds the deterministic demo data (see below) — every
deploy starts from the same known-good state with no separate migration
step.

## Frontend — Render Static Site

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Build command | `npm install && npm run build` |
| Publish directory | `dist` |
| Environment variable | `VITE_API_BASE_URL` = the deployed backend's `/api` URL (e.g. `https://setu-api-lzx9.onrender.com/api`) |

`VITE_API_BASE_URL` is a **build-time** Vite variable — it gets baked into
the static JS bundle when `npm run build` runs, and is not read at
request time. Changing it requires triggering a new build/deploy of the
Static Site, not just an environment-variable update.

## Deploy Order

Because each service's configuration references the other's URL, the first
deploy has an unavoidable ordering dependency:

1. Deploy the backend first, without `CORS_ORIGINS` set (it falls back to
   allowing only `localhost:5173`, which is fine — nothing external is
   calling it yet). Note the resulting Render URL.
2. Deploy the frontend with `VITE_API_BASE_URL` set to that backend URL
   + `/api`.
3. Go back to the backend service and set `CORS_ORIGINS` to the frontend's
   Render URL, then redeploy the backend so the new CORS setting takes
   effect.

## Database: Why SQLite Is Disposable Here

The backend uses SQLite (`backend/app/database.py`) with the database file
stored on the Web Service's local disk. Render's standard web service disk
is **ephemeral** — it is not guaranteed to persist across deploys or
restarts unless a paid persistent disk add-on is attached, which this
project does not use.

This project treats that as a deliberate feature rather than a gap for a
demo/hackathon prototype: because the build command re-runs `python -m
app.seed` on every deploy, **every deploy resets the database to the exact
same deterministic state** (Rahul's application auto-resolved and ready,
Priya's application pending officer review at a genuine ~59% confidence
score — see `docs/demo.md`). This means the live demo link always shows a
predictable, reproducible state for judges, rather than accumulating
whatever state previous visitors left behind.

**For a production deployment**, this would need to change: SQLite would
be replaced with a persistent, managed database (e.g. PostgreSQL), and
seeding would run once at initial provisioning rather than on every deploy.
This is a deliberate prototype-stage tradeoff, not an oversight — see root
`README.md` §11 for the full production scale-up path.

## Render Free-Tier Behavior

If deployed on Render's free tier, both services may "sleep" after a period
of inactivity and take roughly 30–60 seconds to respond to the first
request after waking. This is a platform behavior, not an application bug
— if a live demo needs to be instant, visit the URL a minute or two before
presenting to wake both services first.

## Secrets

No secrets are required by this project. The only environment variables in
use (`CORS_ORIGINS`, `VITE_API_BASE_URL`) are non-sensitive URLs, and are
set directly in the Render dashboard for each service — never committed to
the repository. See `backend/.env.example` and `frontend/.env.example` for
the exact variables and their local-development defaults.
