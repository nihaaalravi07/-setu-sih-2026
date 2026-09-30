# SETU — SIH Demo Walkthrough (3–5 minutes)

Live prototype: https://setu-sih-2026-1.onrender.com
Demo credentials: see root `README.md` §14 (all passwords `demo123`).

Before presenting, reset the demo state (see `docs/development.md` §"Demo
Reset") so Rahul's and Priya's applications are in their deterministic
starting positions.

---

## Judge Explanation (say this up front)

> "The website you're about to see is the interface. The part that matters
> — the part this hackathon is actually about — is the SETU backend: the
> connector layer that reads three differently-formatted department data
> sources, normalizes them into one model, and a deterministic algorithm
> that decides how confidently they refer to the same citizen. The UI is
> just how that decision becomes visible."

---

## Demo 1 — Rahul Kumar (automatic resolution)

1. **Login** as `rahul` / `demo123`.
   *Demonstrates:* a citizen-facing entry point; no special setup needed to
   see a populated account (Application 0001 already exists and is fully
   resolved — this is deterministic seeded data, not luck).
2. Open **Application 0001 — Higher Education Scholarship**.
   *Demonstrates:* the application's status is `Ready for processing`
   already, because the same verification pipeline ran at seed time as
   would run for a live application.
3. Point to the **Consent** step in the application journey.
   *Demonstrates:* verification is gated behind an explicit, purpose-bound
   consent record (`consents` table) — not run silently.
4. Point to the **Verification** table: Revenue, Health, Municipal.
   *Demonstrates:* three independently-formatted data sources (REST JSON,
   legacy XML, CSV — see `docs/architecture.md` §2.1) were each queried and
   normalized into the same canonical shape.
5. Point to **Identity Resolution**: 100% / 94.7% / 94.7%, **96.5% average
   confidence**.
   *Demonstrates:* these are real computed scores from
   `backend/app/matching.py`'s weighted formula (§5.1 of the architecture
   doc), not hardcoded UI numbers — the DOB and mobile number match exactly
   across all three departments, and the name similarity is high enough
   (e.g. "R. Kumar" vs. "Rahul Kumar") to push each score above the
   `auto_confirmed` threshold of 90.
6. Point to the **Unified Status**: `Ready for processing`, and the
   **Timeline** below it recording every step.
   *Demonstrates:* one unified status for the citizen, backed by three
   separate department decisions underneath.

## Demo 2 — Priya Sharma (human-in-the-loop review)

1. **Login** as `priya` / `demo123`. Open **Application 0002 — Healthcare
   Subsidy Scheme**.
   *Demonstrates:* status is `Identity review` — not every case resolves
   automatically.
2. Point out the **~59% confidence** on the Health department verification
   row.
   *Demonstrates:* this is a genuine computed score, not staged — Priya's
   SETU profile mobile number (`9123456780`) differs from the Health
   department's on-file mobile number (`9123456999`), which costs 35 of the
   100 possible points in the formula, landing the score in the
   `pending_review` band (55–89) instead of auto-confirming.
3. **Logout, login as `officer` / `demo123`.** Open the **Officer Review
   Queue**.
   *Demonstrates:* the case is waiting for a human decision, with the exact
   confidence score and a plain-English reason
   ("Mobile number differs, name variation — requires officer
   confirmation.").
4. Open the review. Point to the **side-by-side record comparison** — SETU
   record vs. Health department record, field by field.
   *Demonstrates:* the officer isn't asked to trust a score blindly; they
   can see exactly which fields matched and which didn't.
5. Click **Approve**.
   *Demonstrates:* the officer's decision updates the identity match to
   `confirmed`, and because that was the only outstanding review, the whole
   application becomes `Ready for processing` automatically.
6. Open **Audit Trail** (`/officer/audit`).
   *Demonstrates:* the approval is now a permanent, timestamped record —
   `Officer Anita Singh — identity_match_approved — Application #2: health
   match confirmed by officer` — alongside every other consent,
   verification, and login event in the system.

---

## What SETU Does Not Claim

Say this explicitly if asked, to avoid overclaiming during Q&A:

- This does **not** connect to any real government database, API, or
  identity provider (Aadhaar or otherwise). The three department "systems"
  are sample data files bundled in the repository
  (`backend/app/data/`).
- Identity resolution is **not** machine learning. It is a deterministic,
  fully-explainable weighted formula — see `docs/architecture.md` §5.1 for
  the exact math.
- Login is a **demo authentication scheme** (plaintext password compare
  against three seeded accounts), not production authentication — see
  `SECURITY.md`.
- The database is **SQLite, reseeded on every deployment** by design for
  this prototype, not a production persistence layer — see
  `docs/deployment.md`.
- There is no claim of production security certification, real-time
  government system integration, or production-scale infrastructure. What
  a production version would add is listed in the root `README.md` §11.
