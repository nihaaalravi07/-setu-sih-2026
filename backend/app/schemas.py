from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class LoginRequest(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    role: str
    name: str
    dob: Optional[str] = None
    mobile: Optional[str] = None

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    user: UserOut
    token: str


class ApplicationCreate(BaseModel):
    citizen_id: int
    scheme_name: str


class ApplicationOut(BaseModel):
    id: int
    citizen_id: int
    scheme_name: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConsentRequest(BaseModel):
    granted: bool
    purposes: List[str]


class ReviewDecision(BaseModel):
    officer: str = "Officer"
