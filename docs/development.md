# SETU — Local Development

## Prerequisites

- **Python** 3.11 or later (developed and tested with 3.13.9 locally; the
  Render deployment runs 3.12.x — see `docs/deployment.md`)
- **Node.js** 18 or later (frontend uses Vite 8 and React 19 — a recent LTS
  Node is recommended)
- `pip`, `npm` available on your `PATH`

## Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Environment variables

The backend reads `CORS_ORIGINS` (see `backend/.env.example`). If unset, it
defaults to allowing `http://localhost:5173` and `http://127.0.0.1:5173` —
no `.env` file is required for local development. The app does not
auto-load a `.env` file (no `python-dotenv` dependency); export the
variable in your shell if you need to override it:

```bash
export CORS_ORIGINS="http://localhost:5173"
```

### Database seeding

The SQLite database is not seeded automatically on startup — run this once
(and again any time you want to reset to the deterministic demo state):

```bash
python -m app.seed
```

This creates `backend/setu.db` (gitignored), drops and recreates all
tables, then creates three users (`rahul`, `priya`, `officer` — all
password `demo123`) and walks two demo applications through the real
consent → verification pipeline (not fabricated data — see
`backend/app/seed.py` and `docs/architecture.md` §5).

### Running FastAPI

```bash
uvicorn app.main:app --port 8000 --reload
```

Health check: `curl localhost:8000/api/health` should return
`{"status":"ok","service":"SETU"}`.

## Frontend Setup

```bash
cd frontend
npm install
```

### Environment variables

The frontend reads `VITE_API_BASE_URL` at **build time** (see
`frontend/.env.example`). If unset, it falls back to the relative path
`/api`, which works with the Vite dev server's built-in proxy
(`vite.config.js` forwards `/api/*` to `http://localhost:8000`) — no `.env`
file is required for local development.

### Running Vite

```bash
npm run dev
```

Open `http://localhost:5173`. The backend must already be running on port
8000 for API calls to succeed.

## Production Build

```bash
cd frontend
npm run build
```

Output goes to `frontend/dist/` (gitignored). To build against a specific
deployed backend instead of the default `/api` fallback:

```bash
VITE_API_BASE_URL="https://setu-api-lzx9.onrender.com/api" npm run build
```

## Linting

```bash
cd frontend
npm run lint
```

Runs `oxlint` (see `frontend/.oxlintrc.json`). There is no backend linter
configured — Python source is checked in CI by byte-compiling it (see
`.github/workflows/ci.yml`), which catches syntax errors but is not a style
linter.

## Demo Reset

To return the database to the exact deterministic starting state (Rahul's
application ready, Priya's pending officer review) at any point — including
after clicking through the officer approve/reject flow during a demo:

```bash
cd backend
source venv/bin/activate
python -m app.seed
```

This is safe to run repeatedly; it drops and recreates all tables each
time.

## Testing the Health Endpoint

With the backend running:

```bash
curl http://localhost:8000/api/health
# {"status":"ok","service":"SETU"}
```

Against the deployed backend:

```bash
curl https://setu-api-lzx9.onrender.com/api/health
```

## Running Both Together

Two terminals:

```bash
# Terminal 1
cd backend && source venv/bin/activate && uvicorn app.main:app --port 8000 --reload

# Terminal 2
cd frontend && npm run dev
```

Then open `http://localhost:5173` and sign in with one of the demo accounts
listed in the root `README.md`.
