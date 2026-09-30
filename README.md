# SETU — Secure Exchange & Trust Unification Layer

> **SIH 2026 | Problem Statement SIH26129**
>
> **System integration and interoperability among government digital platforms, resulting in fragmented service delivery**

SETU is a prototype interoperability layer designed to connect heterogeneous government digital systems without requiring the replacement of existing departmental infrastructure.

Instead of forcing every department to adopt the same technology stack, SETU provides a common layer for **data normalization, identity resolution, consent, verification, workflow coordination, unified tracking, and auditability**.

The prototype demonstrates how systems using different data formats and integration patterns can participate in a single cross-department service workflow.

---

## Table of Contents

- [Problem](#problem)
- [Solution](#solution)
- [Why SETU Is an Interoperability Layer](#why-setu-is-an-interoperability-layer)
- [Architecture](#architecture)
- [Key Capabilities](#key-capabilities)
- [Technology Stack](#technology-stack)
- [Connector Model](#connector-model)
- [Identity Resolution](#identity-resolution)
- [Human-in-the-Loop Verification](#human-in-the-loop-verification)
- [Application Workflow](#application-workflow)
- [Data Model](#data-model)
- [Demo Scenarios](#demo-scenarios)
- [Repository Structure](#repository-structure)
- [Local Development](#local-development)
- [Demo Credentials](#demo-credentials)
- [Demo Walkthrough](#demo-walkthrough)
- [API Overview](#api-overview)
- [Deployment](#deployment)
- [Production Scale-Up Path](#production-scale-up-path)
- [Prototype Limitations](#prototype-limitations)
- [Security](#security)
- [Contributing](#contributing)
- [License / Project Status](#license--project-status)

---

# Problem

Government departments often operate independently maintained:

- Portals
- Databases
- Registries
- Workflow systems
- Authentication mechanisms
- Legacy applications
- Data formats
- APIs and integration protocols

A citizen applying for a service that requires information from multiple departments may therefore have to:

- Submit the same information repeatedly
- Provide documents that already exist with another department
- Track applications across multiple portals
- Visit offices for cross-department verification
- Resolve inconsistent records manually

At the administrative level, officers may not have a consolidated view of:

- Citizen information
- Verification results
- Application status
- Cross-department dependencies
- Exceptions requiring intervention
- Historical actions and events

The challenge is therefore not simply creating another portal.

The underlying requirement is an **interoperability layer that allows existing systems to exchange information securely and consistently without requiring complete replacement of those systems.**

---

# Solution

SETU — **Secure Exchange & Trust Unification Layer** — sits between existing departmental systems and the applications that consume their information.

    CITIZEN / OFFICER
            │
            ▼
    ┌─────────────────────┐
    │     SETU PORTAL     │
    │  Unified Interface  │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │      SETU CORE      │
    │                     │
    │ Consent             │
    │ Identity Resolution │
    │ Canonical Data      │
    │ Validation          │
    │ Workflow            │
    │ Event Tracking      │
    │ Audit               │
    └──────────┬──────────┘
               │
        CONNECTOR LAYER
       ┌───────┼───────┐
       ▼       ▼       ▼
    REST/JSON  XML     CSV
       │       │       │
       ▼       ▼       ▼
    Revenue  Health  Municipal
     System   System   System

The departmental systems remain conceptually independent.

SETU provides the common layer that translates between them.

For example:

    Revenue System
         │
         │ REST / JSON
         ▼
    ┌─────────────┐
    │             │
    │    SETU     │────── Canonical Citizen Record
    │             │
    └─────────────┘
         ▲
         │ XML
    Health System

         ▲
         │ CSV
    Municipal System

The citizen-facing website is therefore **not the interoperability layer itself**.

The website demonstrates the capabilities of the SETU backend.

---

# Why SETU Is an Interoperability Layer

A conventional portal primarily provides an interface to one or more services.

SETU addresses the integration problem underneath that interface.

Each department can expose its existing information through an adapter.

SETU then:

1. Accepts data from different systems.
2. Normalizes it into a canonical model.
3. Resolves records referring to the same citizen.
4. Applies consent and validation rules.
5. Coordinates verification.
6. Handles ambiguous identity matches through officer review.
7. Maintains a unified application state.
8. Records workflow events and audit entries.

This means adding another participating department does not require rebuilding the entire citizen workflow.

Instead, the integration can be implemented through another connector.

---

# Architecture

SETU is divided into four conceptual layers.

## 1. Presentation Layer

The React frontend provides two primary experiences.

### Citizen

- Login
- Dashboard
- Service application
- Consent
- Application tracking
- Unified verification status
- Cross-department timeline

### Officer

- Application overview
- Verification status
- Identity review queue
- Side-by-side record comparison
- Approval / rejection actions
- Audit trail

---

## 2. SETU Core

The FastAPI backend implements the interoperability workflow.

Core responsibilities include:

- Application management
- Consent management
- Canonical data representation
- Identity resolution
- Data validation
- Verification orchestration
- Human review
- Event tracking
- Audit logging

---

## 3. Connector Layer

The connector layer isolates departmental differences.

The prototype demonstrates three different source patterns:

| Department | Simulated Source | Format |
|---|---|---|
| Revenue | REST-style API | JSON |
| Health | Legacy service | XML |
| Municipal | File-based system | CSV |

The rest of SETU does not need to know the original source format.

---

## 4. Persistence Layer

The prototype uses SQLite for simplicity and portability.

The database stores:

- Users
- Applications
- Consents
- Department verification records
- Identity matches
- Events
- Audit entries

For production deployment, the persistence layer can be replaced with a managed relational database without changing the overall interoperability architecture.

---

# Key Capabilities

## Canonical Data Model

Different departmental records are converted into a common structure.

Example:

    {
      "citizen_id": "CIT-0001",
      "application_id": "APP-0001",
      "department": "revenue",
      "source_record_id": "REV-1001",
      "verification_status": "verified",
      "confidence_score": 100.0,
      "data": {
        "name": "Rahul Kumar",
        "dob": "2004-08-14",
        "mobile": "9876543210"
      },
      "timestamp": "2026-09-29T10:30:00",
      "consent_reference": "CON-0001"
    }

This gives SETU a common representation regardless of the source system.

---

## Consent

The citizen explicitly provides consent before cross-department information is used in the prototype workflow.

The application records:

- Consent status
- Consent timestamp
- Application association
- Consent reference

---

## Identity Resolution

SETU compares departmental records to determine whether they refer to the same citizen.

The prototype uses deterministic weighted matching across:

- Date of birth
- Mobile number
- Name similarity

This allows records such as:

    Revenue:     Rahul Kumar
    Health:      R. Kumar
    Municipal:   Rahul K.

to be associated with the same citizen.

---

## Human-in-the-Loop Review

Automated identity resolution should not blindly accept uncertain matches.

When the confidence score falls within the review range, SETU creates an officer review case.

The officer can inspect the underlying departmental records before approving or rejecting the association.

This demonstrates a key principle:

> Automation handles routine matches; humans handle exceptions.

---

## Unified Tracking

Instead of tracking individual departmental processes separately, SETU maintains a unified application timeline.

Example:

    Application Submitted
            │
            ▼
    Consent Recorded
            │
            ▼
    Revenue Verified
            │
            ▼
    Health Verified
            │
            ▼
    Municipal Verified
            │
            ▼
    Identity Resolved
            │
            ▼
    Application Ready

For ambiguous cases:

    Application Submitted
            │
            ▼
    Consent Recorded
            │
            ▼
    Identity Confidence: 59%
            │
            ▼
    Officer Review Required
            │
            ▼
    Officer Approved
            │
            ▼
    Identity Resolved

---

# Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router

## Backend

- Python
- FastAPI
- Pydantic
- Uvicorn

## Database

- SQLite
- SQLAlchemy

## Development

- Git
- GitHub
- GitHub Actions
- Render

The stack was intentionally kept lightweight so the prototype can be developed, demonstrated, and deployed quickly without introducing unnecessary infrastructure.

---

# Connector Model

SETU uses a connector abstraction to isolate departmental implementation details.

A connector exposes a common interface for:

    fetch_records()
    normalize()
    find_and_normalize()

The underlying implementation can differ.

For example:

    Revenue Connector
        REST → JSON → Canonical Record

    Health Connector
        XML → Parsed Record → Canonical Record

    Municipal Connector
        CSV → Parsed Record → Canonical Record

The core SETU workflow consumes the canonical representation rather than the original departmental format.

This is the main architectural mechanism that allows heterogeneous systems to participate without forcing them to become identical.

---

# Identity Resolution

The prototype intentionally uses an explainable deterministic algorithm instead of machine learning.

The score is calculated as:

    Score =
        45% × DOB Match
      + 35% × Mobile Match
      + 20% × Name Similarity

Name similarity is calculated using a sequence-based string similarity algorithm.

### Decision thresholds

| Score | Result |
|---:|---|
| ≥ 90 | Auto-confirmed |
| 55–89.9 | Pending officer review |
| < 55 | Rejected |

The thresholds are prototype configuration values and are not presented as production government identity-verification policy.

The design prioritizes explainability for the SIH prototype.

An officer can understand why a record received a particular confidence score.

---

# Human-in-the-Loop Verification

A central design principle of SETU is that uncertain automated decisions should become reviewable cases rather than silent failures.

    Identity Resolution
            │
     ┌──────┴──────┐
     │             │
    High         Uncertain
   Score           │
     │             ▼
     ▼       Review Queue
Auto Confirmed    │
                  ▼
          Officer Comparison
                  │
          ┌───────┴───────┐
          ▼               ▼
       Approve          Reject

The officer dashboard provides the relevant records side-by-side so the decision can be made using the available evidence.

---

# Application Workflow

The prototype follows this workflow:

    Citizen Login
          │
          ▼
    Create Application
          │
          ▼
    Provide Consent
          │
          ▼
    SETU Requests Department Records
          │
          ├───────────────┬───────────────┐
          ▼               ▼               ▼
       Revenue          Health         Municipal
          │               │               │
          └───────────────┴───────────────┘
                          │
                          ▼
                  Normalize Records
                          │
                          ▼
                 Resolve Citizen Identity
                          │
                   ┌──────┴──────┐
                   │             │
             High Confidence   Ambiguous
                   │             │
                   ▼             ▼
              Auto Resolve  Officer Review
                   │             │
                   └──────┬──────┘
                          ▼
                  Unified Application
                          │
                          ▼
                  Timeline + Audit

---

# Data Model

The prototype contains the following core entities.

## Users

Stores demo user accounts and roles.

    id
    username
    password
    role
    citizen_id

---

## Applications

Represents a citizen service request.

    id
    application_number
    citizen_id
    service_type
    status
    created_at
    updated_at

---

## Consents

Stores the citizen's consent associated with an application.

    id
    application_id
    status
    reference
    created_at

---

## Department Verifications

Stores normalized results received from participating systems.

    id
    application_id
    department
    source_record_id
    status
    confidence_score
    data
    created_at

---

## Identity Matches

Stores the identity-resolution result.

    id
    application_id
    source_record_id
    confidence_score
    decision
    created_at

---

## Events

Stores application timeline events.

    id
    application_id
    event_type
    description
    created_at

---

## Audit Logs

Stores structured records of important actions.

    id
    actor
    action
    resource
    details
    created_at

The prototype audit system is intended to demonstrate traceability. It is not a tamper-evident or cryptographically immutable production audit system.

---

# Demo Scenarios

SETU includes two deterministic demonstration scenarios.

## Scenario 1 — Rahul Kumar

Rahul's records appear differently across participating systems:

    Revenue      → Rahul Kumar
    Health       → R. Kumar
    Municipal    → Rahul K.

The records share matching identifying attributes and produce a high-confidence match.

The application therefore proceeds automatically.

Example result:

    Revenue      100%
    Health        94.7%
    Municipal     94.7%

    Overall       ~96.5%

The application reaches:

    READY FOR PROCESSING

---

## Scenario 2 — Priya Sharma

Priya demonstrates the exception-handling workflow.

The records contain less certainty:

    Revenue      → Priya Sharma
    Health       → P. Sharma
    Municipal    → Priya S.

The resulting confidence falls into the review range.

Example:

    Health       → ~59%

The application therefore enters:

    IDENTITY REVIEW

An officer can inspect the records and approve the match.

This demonstrates that SETU does not simply automate every decision.

It also provides a workflow for handling uncertainty.

---

# Repository Structure

    setu/
    │
    ├── .github/
    │   └── workflows/
    │       └── ci.yml
    │
    ├── backend/
    │   ├── app/
    │   │   ├── connectors/
    │   │   ├── routers/
    │   │   ├── schemas/
    │   │   ├── database.py
    │   │   ├── main.py
    │   │   ├── models.py
    │   │   └── seed.py
    │   │
    │   ├── .env.example
    │   └── requirements.txt
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── pages/
    │   │   ├── api/
    │   │   └── ...
    │   │
    │   ├── .env.example
    │   ├── package.json
    │   └── vite.config.js
    │
    ├── docs/
    │   ├── api.md
    │   ├── architecture.md
    │   ├── demo.md
    │   ├── deployment.md
    │   └── development.md
    │
    ├── CHANGELOG.md
    ├── CODE_OF_CONDUCT.md
    ├── CONTRIBUTING.md
    ├── README.md
    └── SECURITY.md

---

# Local Development

## Prerequisites

Recommended:

- Python 3.11+
- Node.js 18+
- npm
- Git

---

## 1. Clone the repository

    git clone https://github.com/nihaaalravi07/-setu-sih-2026.git
    cd -setu-sih-2026

---

## 2. Start the Backend

    cd backend

Create a virtual environment:

    python -m venv venv

Activate it on macOS/Linux:

    source venv/bin/activate

On Windows:

    venv\Scripts\activate

Install dependencies:

    pip install -r requirements.txt

Seed the demonstration database:

    python -m app.seed

Start the API:

    uvicorn app.main:app --reload --port 8000

The backend will be available at:

    http://localhost:8000

Health endpoint:

    http://localhost:8000/api/health

---

## 3. Start the Frontend

Open another terminal:

    cd frontend

Install dependencies:

    npm install

Start the development server:

    npm run dev

The frontend will normally be available at:

    http://localhost:5173

---

## 4. Environment Variables

### Backend

Create:

    backend/.env

Example:

    CORS_ORIGINS=http://localhost:5173

For deployment, `CORS_ORIGINS` can contain comma-separated allowed origins.

### Frontend

Create:

    frontend/.env.local

Example:

    VITE_API_BASE_URL=/api

For a separately deployed backend:

    VITE_API_BASE_URL=https://your-backend.example.com/api

---

# Demo Credentials

The prototype contains deterministic demo accounts.

| Username | Password | Role |
|---|---|---|
| `rahul` | `demo123` | Citizen |
| `priya` | `demo123` | Citizen |
| `officer` | `demo123` | Officer |

These credentials are for demonstration only.

They must not be used for real authentication.

---

# Demo Walkthrough

The recommended SIH demonstration can be completed in approximately 3–5 minutes.

## 1. Citizen Login

Login as:

    rahul
    demo123

Open the citizen dashboard.

---

## 2. Create Application

Create the sample service application.

The application receives a unique application number.

---

## 3. Give Consent

Proceed through the consent step.

SETU records the consent against the application.

---

## 4. Start Verification

SETU retrieves the simulated records from:

    Revenue
    Health
    Municipal

The three systems intentionally provide different representations.

---

## 5. Show the Unified Result

SETU normalizes the records and resolves them to the same citizen.

The application timeline shows the cross-department progress.

---

## 6. Demonstrate the Exception Case

Logout and login as:

    priya
    demo123

Create/open the demonstration application.

The lower-confidence identity match sends the application into the officer review queue.

---

## 7. Officer Review

Login as:

    officer
    demo123

Open the review queue.

The officer can compare the records and approve the match.

---

## 8. Show Audit / Timeline

Return to the application and demonstrate:

- Department verification
- Identity resolution
- Officer decision
- Application status
- Timeline events
- Audit entries

This provides a complete end-to-end demonstration of the interoperability workflow.

---

# API Overview

The backend exposes REST endpoints under:

    /api

Key endpoints include:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/login` | Demo login |
| GET | `/api/citizens/{id}` | Citizen information |
| POST | `/api/applications` | Create application |
| GET | `/api/applications/{id}` | Application details |
| POST | `/api/applications/{id}/consent` | Record consent |
| POST | `/api/applications/{id}/verify` | Run verification |
| GET | `/api/applications/{id}/timeline` | Application timeline |
| GET | `/api/officer/applications` | Officer application view |
| GET | `/api/officer/reviews` | Identity review queue |
| POST | `/api/officer/reviews/{id}/approve` | Approve review |
| GET | `/api/audit` | Audit entries |
| GET | `/api/health` | Health check |

Detailed API documentation is available in:

    docs/api.md

---

# Deployment

The prototype is deployed using Render.

## Architecture

    GitHub Repository
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
  backend/     frontend/
    │             │
    ▼             ▼
Render Web    Render Static
  Service         Site
    │             │
    ▼             │
 FastAPI           │
 Uvicorn           │
    │             │
    └──────┬──────┘
           │
           ▼
         SETU

## Live Prototype

### Frontend

https://setu-sih-2026-1.onrender.com

### Backend

https://setu-api-lzx9.onrender.com

### Backend Health Check

https://setu-api-lzx9.onrender.com/api/health

The free Render backend may take some time to respond after a period of inactivity while the service wakes up.

The frontend is a separately served static site and does not depend on the backend's wake-up behavior for static page delivery.

---

# Production Scale-Up Path

The current implementation is intentionally a prototype.

A production implementation could evolve the architecture without changing the central SETU concept.

## Authentication

Prototype:

    Demo credentials

Production:

    Government Identity Provider
            │
            ▼
    Federated Authentication / SSO
            │
            ▼
           SETU

Possible additions:

- OAuth 2.0 / OpenID Connect
- Government identity provider integration
- MFA
- Short-lived access tokens
- Role-based authorization
- Session management

---

## Database

Prototype:

    SQLite

Production options could include:

    PostgreSQL / Managed Relational Database

with appropriate:

- Backups
- Replication
- Encryption
- Disaster recovery
- Monitoring

---

## Event Processing

The prototype records local workflow events.

A production system could introduce an event broker for higher-volume asynchronous communication.

For example:

    Department
        │
        ▼
    SETU Connector
        │
        ▼
    Event Broker
        │
        ├── Verification Service
        ├── Notification Service
        ├── Audit Service
        └── Workflow Engine

Technologies such as Kafka or another managed event-streaming platform could be evaluated depending on scale and operational requirements.

---

## Identity Resolution

The prototype uses an explainable deterministic algorithm.

Production deployments could evaluate:

- Stronger deterministic rules
- Government-issued identifiers
- Master data management
- Probabilistic matching
- Entity-resolution systems
- Human escalation
- Confidence calibration
- False-match monitoring

Any production identity-resolution mechanism would require domain-specific validation and appropriate governance.

---

## Connectors

The prototype demonstrates:

    REST / JSON
    XML
    CSV

A production connector ecosystem could support:

    REST
    SOAP
    XML
    JSON
    CSV
    Database Interfaces
    Message Queues
    Legacy APIs
    Government Service Buses

The connector abstraction allows these implementation differences to remain isolated from the core citizen workflow.

---

# Prototype Limitations

SETU is a demonstration prototype and is **not a production government platform**.

The current implementation intentionally does not include:

- Real government department APIs
- Real citizen data
- Aadhaar integration
- Production identity providers
- Production SSO
- Cryptographic identity verification
- Kafka or another production event broker
- Kubernetes
- High-availability infrastructure
- Production database replication
- Machine-learning-based entity resolution
- Production-grade secrets management
- Tamper-evident audit storage
- Formal security certification
- Government network integration

The departmental integrations are simulated to demonstrate the interoperability architecture.

This allows the prototype to focus on the core problem:

> **Connecting heterogeneous systems through a common interoperability layer without replacing the systems themselves.**

---

# Security

Security is an important production concern, but the current SIH prototype uses simplified mechanisms for demonstration.

The prototype currently includes:

- Input validation
- CORS configuration
- Role information
- Consent records
- Audit records
- Structured application events
- No real citizen information

However, the prototype does **not** provide production-grade authentication or authorization.

For example:

- Demo passwords are stored for demonstration purposes.
- Password hashing is not implemented.
- There is no account lockout or rate limiting.
- Authentication is not backed by a production identity provider.
- Role information is not sufficient for server-side authorization.
- SQLite is intended for disposable prototype data.
- Audit records are not cryptographically tamper-evident.

Real deployments must use appropriate security architecture, secrets management, access controls, encryption, monitoring, logging, threat modeling, and independent security review.

See:

    SECURITY.md

for additional details.

---

# Design Principles

SETU follows several principles throughout the prototype.

## 1. Integrate, Don't Replace

Existing departmental systems should not need to be rebuilt simply to participate in a unified workflow.

---

## 2. Normalize at the Boundary

Department-specific formats are handled by connectors.

The core system operates on a canonical representation.

---

## 3. Automate Routine Work

High-confidence matches can proceed automatically.

---

## 4. Escalate Uncertainty

Ambiguous cases become human-reviewable workflows instead of silent automated decisions.

---

## 5. Make the Workflow Traceable

Important actions and state transitions are recorded as application events and audit entries.

---

## 6. Separate Interface from Infrastructure

The citizen portal is the interface.

The interoperability layer is the backend architecture underneath it.

---

# Why This Approach Can Scale Conceptually

Without an interoperability layer, integrating multiple systems can lead to many individual integrations:

    Department A ↔ Department B
    Department A ↔ Department C
    Department B ↔ Department C
    Department A ↔ New Service
    Department B ↔ New Service
    ...

SETU instead introduces a common integration boundary:

                 ┌─────────────┐
                 │ Department A│
                 └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │             │
                 │    SETU     │
                 │             │
                 └─────────────┘
                        ▲
                        │
                 ┌──────┴──────┐
                 │ Department B│
                 └─────────────┘

                        ▲
                        │
                 ┌──────┴──────┐
                 │ Department C│
                 └─────────────┘

The exact operational architecture of a production government deployment would depend on departmental requirements, governance, security standards, and existing infrastructure.

The prototype demonstrates the architectural principle rather than claiming to provide a complete production integration framework.

---

# Documentation

Additional project documentation is available under:

    docs/

### Architecture

    docs/architecture.md

Describes the connector architecture, canonical model, identity resolution, workflow, and data flow.

### API

    docs/api.md

Documents the backend endpoints and request/response structures.

### Demo

    docs/demo.md

Contains the recommended demonstration flow.

### Deployment

    docs/deployment.md

Contains deployment configuration and environment setup.

### Development

    docs/development.md

Contains local development and validation instructions.

---

# CI / Validation

The repository includes a GitHub Actions workflow under:

    .github/workflows/ci.yml

The CI pipeline validates the project by:

- Installing frontend dependencies
- Running frontend linting
- Building the frontend
- Installing backend dependencies
- Compiling backend Python modules
- Running the database seed
- Validating deterministic demo data

This helps prevent accidental breakage during development.

---

# Project Status

**Status:** SIH 2026 Prototype

**Problem Statement:** SIH26129

**Team:** Aalu Bhujiya

**Team ID:** 137932

SETU is currently intended for demonstration and evaluation of the proposed interoperability architecture.

It should not be interpreted as a production-ready government integration platform.

---

# License / Project Status

This repository contains a student-developed prototype created for **Smart India Hackathon 2026**.

The project is intended for educational, demonstration, and competition purposes.

---

## SETU

### Secure Exchange & Trust Unification Layer

**Connect existing systems. Normalize information. Resolve identity. Coordinate services.**

    Existing Systems
           │
           ▼
       CONNECTORS
           │
           ▼
          SETU
           │
           ├── Consent
           ├── Identity
           ├── Verification
           ├── Workflow
           ├── Events
           └── Audit
           │
           ▼
     Unified Service Experience
