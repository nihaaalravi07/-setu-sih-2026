from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..helpers import log_audit

router = APIRouter(prefix="/api", tags=["auth"])


@router.post("/login", response_model=schemas.LoginResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == payload.username).first()
    if not user or user.password != payload.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    log_audit(db, actor=user.username, action="login", details=f"{user.role} logged in")
    db.commit()

    token = f"demo-token-{user.id}-{user.role}"
    return {"user": user, "token": token}


@router.get("/citizens/{citizen_id}", response_model=schemas.UserOut)
def get_citizen(citizen_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == citizen_id, models.User.role == "citizen").first()
    if not user:
        raise HTTPException(status_code=404, detail="Citizen not found")
    return user
