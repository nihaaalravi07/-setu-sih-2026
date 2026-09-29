from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)  # demo only, plain text
    role = Column(String, nullable=False)  # citizen | officer
    name = Column(String, nullable=False)
    dob = Column(String, nullable=True)
    mobile = Column(String, nullable=True)

    applications = relationship("Application", back_populates="citizen")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True)
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scheme_name = Column(String, nullable=False)
    status = Column(String, default="draft")  # draft, awaiting_consent, verifying, identity_review, ready_for_processing, approved
    created_at = Column(DateTime, default=datetime.utcnow)

    citizen = relationship("User", back_populates="applications")
    consent = relationship("Consent", back_populates="application", uselist=False)
    verifications = relationship("DepartmentVerification", back_populates="application")
    identity_matches = relationship("IdentityMatch", back_populates="application")
    events = relationship("Event", back_populates="application")


class Consent(Base):
    __tablename__ = "consents"

    id = Column(Integer, primary_key=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    granted = Column(Boolean, default=False)
    purposes = Column(Text)  # JSON string
    timestamp = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="consent")


class DepartmentVerification(Base):
    __tablename__ = "department_verifications"

    id = Column(Integer, primary_key=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    department = Column(String, nullable=False)  # revenue | health | municipal
    source_format = Column(String, nullable=False)  # REST_JSON | LEGACY_XML | CSV
    source_record_id = Column(String, nullable=False)
    verification_status = Column(String, default="pending")  # pending | verified | failed
    confidence_score = Column(Float, default=0.0)
    canonical_data = Column(Text)  # JSON string of canonical SETU model
    consent_reference = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="verifications")


class IdentityMatch(Base):
    __tablename__ = "identity_matches"

    id = Column(Integer, primary_key=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    department = Column(String, nullable=False)
    confidence_score = Column(Float, default=0.0)
    status = Column(String, default="pending")  # auto_confirmed | pending_review | confirmed | rejected
    reason = Column(String, nullable=True)
    matched_fields = Column(Text)  # JSON list
    differing_fields = Column(Text)  # JSON list
    setu_record = Column(Text)  # JSON snapshot of canonical citizen data
    department_record = Column(Text)  # JSON snapshot of raw department data
    timestamp = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="identity_matches")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    type = Column(String, nullable=False)
    description = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="events")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    actor = Column(String, nullable=False)
    action = Column(String, nullable=False)
    details = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
