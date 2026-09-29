import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth, applications, officer, audit

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SETU API", description="Connecting Services. Simplifying Access.")

# CORS_ORIGINS: comma-separated list of allowed origins (set on the deployed
# backend once the frontend's URL is known, e.g. "https://setu.onrender.com").
# Falls back to the local Vite dev server origins when unset.
_cors_origins_env = os.environ.get("CORS_ORIGINS", "")
_allow_origins = [o.strip() for o in _cors_origins_env.split(",") if o.strip()] or [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(officer.router)
app.include_router(audit.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "SETU"}
