# SETU — Project Reference

## Purpose

SETU is an SIH (Smart India Hackathon) demo prototype for an **interoperability
platform** that connects heterogeneous government departmental systems
without replacing them. It demonstrates:

Citizen → SETU → Consent → Multiple incompatible departmental systems →
Data normalization → Identity resolution → Unified application status →
Officer review

This is a **local-only demo prototype**, not a production system. No real
government data, APIs, or infrastructure are used, and it does not claim to
be an official government product.

Brand line: **SETU — Secure Exchange & Trust Unification Layer.**
"Setu" (Hindi/Sanskrit) means *bridge* — the product's visual and verbal
identity leans on that idea (see Design System below), never on religious
imagery.

## Architecture

```
Citizen (browser) ──┐
                     ├──► React/Vite SPA (frontend) ──► FastAPI (backend) ──► SQLite
Officer (browser) ──┘

Backend, on verification:
  Revenue connector  (reads data/revenue.json,  REST-JSON-shaped)   ─┐
  Health connector   (parses data/health.xml,    legacy SOAP/XML)   ─┼─► matching.py (confidence score) ─► canonical SETU model ─► DB
  Municipal connector(reads data/municipal.csv,  CSV flat file)     ─┘
  (all three run inside app/verification.py — see Important Design Decisions)
```

The core architectural idea being demonstrated: **three different
"departments" expose data in three incompatible formats (REST JSON, legacy
XML/SOAP, CSV). SETU's connectors normalize all three into one canonical
data model**, and a simple deterministic identity-resolution step decides
whether a department's record belongs to the same citizen.

## Technology Stack

- **Frontend**: React 19 + Vite + Tailwind CSS v4 (`@tailwindcss/vite`) + React Router v7. Plain JSX, no TypeScript. Fonts: Inter (UI/headlines) + IBM Plex Mono (record ids, confidence numbers, timestamps) via Google Fonts.
- **Backend**: Python + FastAPI + Pydantic v2 + SQLAlchemy 2.0 (ORM) + SQLite.
- No Kafka, Kubernetes, Keycloak, ML libraries, cloud services, or animation libraries (no framer-motion etc.) — everything runs locally with minimal dependencies.

## Visual / Design System — v2 (current)

**This is the third visual pass and it is a deliberate correction of the
second one.** The first-pass build (functional MVP) was redesigned into an
"editorial govtech" look (large hero type, teal/navy palette, generous
whitespace, heavy scroll-reveal motion, rounded-xl cards everywhere). An
external reviewer correctly called that second pass **"AI slop"** — it read
as a generic AI-generated SaaS/startup landing page rather than institutional
software. This v2 pass is the fix. **Do not regress toward the v1 look.**

### What changed and why

- **Radius**: capped at 8px max (`--r-xs` 3px, `--r-sm` 4px, `--r-md` 6px,
  `--r-lg` 8px). No `rounded-xl/2xl/3xl`, no pill buttons, no pill badges.
  Buttons are small rectangles with 4px corners. Status tags are rectangular
  with a colored left rule, not colored-pill dots.
- **Typography is restrained, not "hero."** Page titles are ~1.75rem, not
  3+ rem. No marketing-voice copy ("One connected journey across government
  services" was replaced with plain factual headers like "Choose a service").
  Hierarchy comes from an eyebrow (uppercase, letterspaced, small) + a
  controlled title + optional plain-sentence subtitle — see
  `components/ui/PageHeader.jsx`.
- **Data looks like data.** Verification results, identity-match records,
  and audit entries are rendered as actual `<table>` markup
  (`components/ui/Table.jsx`) with aligned columns, not as stacks of rounded
  cards. Cards are reserved for genuinely separate objects (e.g. one
  application record on the dashboard).
- **Confidence is a number, not a gauge.** `ConfidenceMeter` shows a plain
  mono-spaced percentage with a 3px-tall rule underneath — no large animated
  circular/bar "AI scanning" gauge.
- **Motion is brief and functional, not choreographed.** No more large
  staggered scroll-reveal system (the old `Reveal`/`useReveal` components and
  the `reveal`/`is-visible` fade-up-with-translateY choreography were
  deleted). What's left: a fast `page-enter` fade on route change, hover/
  active color transitions (120–200ms), and the modal fade. See `index.css`'s
  motion section — durations are `--dur-fast` (120ms), `--dur-base` (200ms),
  `--dur-slow` (300ms). Respects `prefers-reduced-motion`.
- **Color is more muted/mature.** Warmer near-white paper (`--paper`), near-
  black ink instead of pure black, muted teal (`--teal-600/700`), restrained
  ochre/saffron accent (`--saffron-600`) used sparingly (e.g. the "Prototype
  environment" tag on Login). No gradients, no glow, no glassmorphism
  (the old `backdrop-blur` sticky header was removed).
- **The SETU "bridge" motif** — the one deliberate, reused piece of brand
  identity. See `components/ui/Bridge.jsx`:
  - `BridgeRule`: a thin horizontal rule with two small dot endpoints and a
    centered "SETU" mark (`●──── SETU ────●`). Used in the footer and on the
    Login page's left panel.
  - `ConnectedThrough`: the compact "Connected through SETU" status strip on
    the citizen dashboard — three plain department columns (name / protocol
    / connected dot), not an animated architecture diagram.
  This is intentionally the *only* recurring decorative motif in the whole
  product. Don't add a second one.
- **Precise copy, not marketing copy.** E.g. "Identity resolution across
  departmental records," not "Intelligent identity matching." "Track your
  application across connected departments," not "Experience a seamless
  government journey." If you add copy, keep this register.
- **Navigation is minimal and role-appropriate.** Citizen: Overview / New
  application. Officer: Overview / Review queue / Audit trail (labeled
  "SETU OPERATIONS" via a small eyebrow suffix next to the wordmark, not a
  separate visual brand).

### Design tokens (`src/index.css`)

CSS custom properties on `:root`: `--paper`, `--surface`, `--surface-sunken`,
`--ink-950/900/800` (near-black surfaces, e.g. primary buttons), `--ink`,
`--ink-muted`, `--ink-faint` (text scale), `--border`/`--border-strong`,
`--teal-600/700` + `--teal-tint`, `--saffron-600` + `--saffron-tint`,
`--success`/`--warning`/`--danger` + their `-tint` backgrounds, `--r-xs/sm/md/lg`
(radius scale), `--dur-fast/base/slow` + `--ease-out` (motion scale).

### Reusable UI components (`src/components/ui/`)

`Button`, `Badge` (rectangular status tag, left-rule tone), `Card` (plain
bordered box, used sparingly), `Section` (eyebrow + title, no card wrapper),
`PageHeader` (restrained header), `ProgressSteps` (numbered case-file
stepper: 01 Application → 05 Complete — horizontally scrollable on narrow
viewports, does not clip), `Timeline` (plain zebra-striped event log with
mono timestamps, not an animated activity feed), `ConfidenceMeter` (number +
thin rule; accepts a `resolved` prop so a human officer decision overrides
the raw-score tone once a case is actually closed), `Table` (the workhorse —
horizontally scrollable, never `overflow-hidden`, so no column is ever
silently clipped on a narrow screen), `Modal` (reject-match confirmation),
`EmptyState`, `Skeleton`/`PageSkeleton`, `Bridge` (`BridgeRule` +
`ConnectedThrough` — the brand motif, see above), `Field` (labeled input/
textarea — see Forms below), `Banner` (inline alert — tint background + left
rule, one shared implementation for consent/review/error/success messages).

**Note**: `Reveal.jsx` and `hooks/useReveal.js` from the v1 redesign were
deleted in this pass — nothing imports them anymore. If you're tempted to
bring back scroll-triggered fade-up choreography, don't; it was one of the
things that read as "AI slop."

### Forms (`src/components/ui/Field.jsx`)

Every text input/textarea in the app goes through `Field`, not a hand-rolled
`<input>`. It handles: a properly associated `<label htmlFor>`/`id` (via
React's `useId()`, so no manually-managed id strings), a real focus ring
(`.field-input:focus` in `index.css` — `box-shadow`, not just a border-color
swap), hover/disabled states, and optional `hint`/`error` text wired up via
`aria-describedby`/`aria-invalid`. Pass `as="textarea"` for a textarea. If
you add a new form field anywhere, use `Field` — don't hand-roll another
`<input className="border ...">`; a previous polish pass found three
different pages each doing this slightly differently.

### Alerts (`src/components/ui/Banner.jsx`)

One shared component for every inline status message (consent required,
review required, ready for processing, cancelled, login error): tint
background + colored left rule + matching text color, `tone="success" |
"warning" | "danger"`. Don't hand-write another `<div style={{background:
'var(--warning-tint)', ...}}>` — a previous polish pass consolidated four
near-identical copies of this into `Banner` specifically to stop them
drifting apart.

### A responsive bug fixed in this pass — keep it fixed

Every scrollable data surface (`Table`, the inline tables in
`ApplicationDetail`/`OfficerReviews`, and `ProgressSteps`) uses
**`overflow-x-auto`, never `overflow-hidden`**, on its bordered wrapper, and
the inner element carries a `min-w-[...]` so it doesn't get squeezed. Earlier
in this session, `overflow-hidden` on a table wrapper silently **clipped the
Municipal column** on a narrow (mobile-width) viewport instead of reflowing
or scrolling — verified via `getBoundingClientRect`/`scrollWidth` inspection,
not just a screenshot. If you add a new wide table or multi-column strip,
follow the same pattern (`overflow-x-auto` wrapper + `min-w` on the content),
per the brief's "reflow tables, don't just shrink" requirement.

### Shell (`src/components/Layout.jsx`)

Plain (non-sticky, non-blurred) header with the wordmark, a minimal nav, and
user info. `page-enter` fade on the `<main>`, keyed by `location.pathname`.
Footer contains the `BridgeRule` motif plus the brand line and a "Prototype
environment · Not an official government system" disclaimer.

**Nav renders twice, deliberately**: once as `hidden md:flex` inside the main
56px header row (desktop), and once as `flex md:hidden` in a second row
beneath it (mobile, horizontally scrollable). Earlier the nav only existed in
the desktop row, which meant below 768px there was **no way to reach Review
Queue or Audit Trail at all** — a real functional gap, not just a visual
one. If you touch `Layout.jsx`'s header, keep both nav renders in sync (same
`links` array, same `NavLink` component) — don't let them diverge.

## Folder Structure

```
setu/
├── CLAUDE.md                 — this file
├── PROGRESS.md                — status + how to run + next steps
├── backend/
│   ├── requirements.txt
│   ├── setu.db                — SQLite DB (generated by seed.py)
│   ├── venv/                  — Python virtualenv (local only)
│   └── app/
│       ├── main.py            — FastAPI app, CORS, router registration
│       ├── database.py        — SQLAlchemy engine/session
│       ├── models.py          — ORM models (see Database Structure)
│       ├── schemas.py         — Pydantic request/response models
│       ├── seed.py            — deterministic demo data: users + two fully
│       │                        verified/reviewed demo applications
│       ├── verification.py    — shared verification engine (connectors +
│       │                        matching.py + DB writes); used by BOTH the
│       │                        live /verify endpoint and seed.py, so seeded
│       │                        confidence scores are always real, never faked
│       ├── matching.py        — deterministic identity resolution / confidence scoring
│       ├── helpers.py         — audit/event logging + JSON (de)serialization helpers
│       ├── connectors/
│       │   ├── revenue.py     — reads data/revenue.json (REST JSON), normalize()
│       │   ├── health.py      — parses data/health.xml (legacy SOAP/XML), normalize()
│       │   └── municipal.py   — reads data/municipal.csv (CSV), normalize()
│       ├── data/
│       │   ├── revenue.json
│       │   ├── health.xml
│       │   └── municipal.csv
│       └── routers/
│           ├── auth.py        — /api/login, /api/citizens/{id}
│           ├── applications.py— application lifecycle, consent, verify, timeline
│           │                    (verify endpoint just calls verification.verify_application)
│           ├── officer.py     — officer dashboard, review queue, approve/reject
│           └── audit.py       — /api/audit
└── frontend/
    ├── .claude/launch.json    — dev server config for Claude's browser preview tool
    ├── index.html             — Google Fonts (Inter, IBM Plex Mono) + page title
    ├── vite.config.js         — Tailwind v4 plugin + /api proxy to localhost:8000
    └── src/
        ├── App.jsx            — routes (includes /officer/audit)
        ├── index.css          — v2 design tokens, typography, motion (see above)
        ├── api/
        │   ├── client.js      — fetch wrapper, one function per backend endpoint
        │   └── AuthContext.jsx— logged-in user stored in localStorage
        ├── components/
        │   ├── Layout.jsx     — nav/header/footer shell (plain, no blur/gradient)
        │   └── ui/            — design system (see above)
        └── pages/
            ├── Login.jsx           — /login — bounded institutional card, bridge motif,
            │                          username/password (matches backend contract), demo accounts
            ├── Dashboard.jsx       — /dashboard (citizen) — Welcome back / Your applications
            │                          (data-block record) / Your services (plain list) /
            │                          Connected through SETU (bridge strip)
            ├── Apply.jsx           — /apply (citizen, new application) — plain scheme list,
            │                          square selection indicator, applicant details as <dl>
            ├── ApplicationDetail.jsx — /application/:id — case-file structure: numbered
            │                          stepper → consent block → verification TABLE →
            │                          identity resolution TABLE → plain event-log timeline
            ├── OfficerDashboard.jsx  — /officer — metric strip + review-queue TABLE +
            │                          recent-applications TABLE (case management console)
            ├── OfficerReviews.jsx    — /officer/reviews — the identity review workstation:
            │                          source-records TABLE (Revenue/Health/Municipal columns,
            │                          fetched via the existing GET /applications/{id}, no new
            │                          endpoint), compact confidence, Approve/Reject with a
            │                          Modal confirmation on reject
            └── OfficerAudit.jsx      — /officer/audit — audit trail TABLE (GET /api/audit)
```

## Database Structure (SQLite, via SQLAlchemy — see `app/models.py`)

Unchanged since the original build — **no schema/API contract changes have
ever been made** across any of the visual redesign passes.

- **users**: id, username, password (plaintext, demo only), role (`citizen`|`officer`), name, dob, mobile
- **applications**: id, citizen_id (FK users), scheme_name, status, created_at
  - status values: `awaiting_consent` → `verifying` → (`identity_review` | `ready_for_processing`) ; also `cancelled`
- **consents**: id, application_id (FK), granted (bool), purposes (JSON string list), timestamp
- **department_verifications**: id, application_id (FK), department (`revenue`|`health`|`municipal`), source_format (`REST_JSON`|`LEGACY_XML`|`CSV`), source_record_id, verification_status (`verified`|`failed`), confidence_score, canonical_data (JSON string — the normalized SETU record), consent_reference, timestamp
- **identity_matches**: id, application_id (FK), department, confidence_score, status (`auto_confirmed`|`pending_review`|`confirmed`|`rejected`), reason, matched_fields (JSON list), differing_fields (JSON list), setu_record (JSON), department_record (JSON), timestamp
- **events**: id, application_id (FK), type, description, timestamp — powers the timeline
- **audit_logs**: id, actor, action, details, timestamp

## API List (unchanged)

All under `/api`:

- `POST /login` — `{username, password}` → `{user, token}`
- `GET /citizens/{id}`
- `GET /citizens/{id}/applications` — list a citizen's applications (used by Dashboard)
- `POST /applications` — `{citizen_id, scheme_name}` → creates in `awaiting_consent` status
- `GET /applications/{id}` — also reused by `OfficerReviews.jsx` to fetch all
  three departments' `canonical_data` for the source-records comparison table
- `POST /applications/{id}/consent` — `{granted, purposes[]}`; if granted, status → `verifying`
- `POST /applications/{id}/verify` — runs `verification.verify_application` (all 3 connectors + matching.py), writes verifications/identity_matches/events, sets status to `ready_for_processing` or `identity_review`. Idempotent (no-op if verifications already exist).
- `GET /applications/{id}/timeline`
- `GET /officer/applications` — dashboard stats + recent applications
- `GET /officer/reviews` — pending_review identity matches, joined with application/citizen
- `GET /officer/reviews/{id}`
- `POST /officer/reviews/{id}/approve` — `{officer}` → sets match to `confirmed`, resolves application if no other reviews pending
- `POST /officer/reviews/{id}/reject` — `{officer}` → sets match to `rejected`
- `GET /audit` — consumed by `/officer/audit`

## Important Design Decisions

1. **Identity resolution is deterministic, not ML.** `matching.py` scores a
   weighted combination of DOB match (45%), mobile match (35%), and name
   similarity via `difflib.SequenceMatcher` (20%), scaled to 0–100.
   - ≥90 → `auto_confirmed`
   - 55–89 → `pending_review` (goes to officer review queue)
   - <55 → `rejected`
2. **Verification logic lives in one place: `app/verification.py`.** Both
   the live `POST /applications/{id}/verify` endpoint and `seed.py` call the
   exact same `verify_application(db, application)` function, so **seeded
   demo confidence scores are always real, computed values — never
   hardcoded/faked.**
3. **Seed data is a full deterministic demo, not just users.** `seed.py`
   walks each of Rahul's and Priya's applications all the way through
   application → consent → verification (see `_submit_and_verify`). The
   demo **starts in a "ready to show" state immediately after reseeding** —
   no clicking required to see a populated dashboard or review queue.
4. **Verification is triggered by the frontend** for a *new* application a
   user creates live during the demo. `ApplicationDetail.jsx` calls `POST
   /applications/{id}/verify` via a `useEffect` as soon as it sees
   `status === "verifying"` with no verifications yet, with an enforced
   minimum ~1.1s so the "Connecting to Revenue/Health/Municipal…" staged
   text is readable even though the backend call itself is near-instant —
   it does not pretend a real external system is slow, it paces the reveal
   of an already-known result.
5. **Connector lookup is hint-based** (`find_and_normalize(name_hint,
   mobile_hint)`), not a strict citizen_id join — this simulates realistic
   department systems that don't share a common key, which is the whole
   point of doing identity resolution.
6. **Auth is intentionally trivial** (plaintext password compare, a fake
   `demo-token-*` string, no real sessions/JWT). This is a demo, not a
   security exercise — do not "harden" this unless asked. The login form
   deliberately still says "Username" (not "Mobile number") because that's
   what the backend actually authenticates with — don't relabel fields to
   look more realistic if it would misrepresent what the field does.
7. **No department mismatch ever changes citizen identity** — SETU never
   asks departments to change their data; it normalizes it into a canonical
   shape by reading only.
8. **`ConfidenceMeter`'s tone can be overridden by a human decision.** Once
   an officer approves/rejects an ambiguous match, the raw score alone would
   keep showing "Review required" even though the case is closed —
   `ApplicationDetail.jsx`'s `IdentityResolution` computes a `resolved` prop
   (`'confirmed' | 'rejected' | undefined`) from the actual `identity_matches`
   statuses and passes it in to override the label/color. Keep these two in
   sync if you touch either.
9. **The officer review's source-records table fetches `GET
   /applications/{id}`** (an existing endpoint) alongside `GET
   /officer/reviews`, purely client-side, to show all three departments'
   canonical records side by side — `GET /officer/reviews` itself only
   returns the one mismatched department's record. This was a deliberate
   choice to avoid changing the API contract just for a UI need.

## Demo Flow (what to click through — starts pre-populated)

Reseeding puts the database in this exact state. No setup clicking is
required before showing the core loop:

1. Login as `rahul` / `demo123` (or click the demo account button).
   **Dashboard already shows Application 0001 — "Higher Education
   Scholarship" — Ready for processing.**
2. Click into it → numbered case-file stepper (all steps checked) →
   Verification table (Revenue 100%, Health 94.7%, Municipal 94.7%, all
   Verified) → Identity Resolution table (all three Auto-confirmed, overall
   confidence 96.5%) → plain event-log Timeline.
3. Logout → login as `priya` / `demo123`. **Dashboard already shows
   Application 0002 — "Healthcare Subsidy Scheme" — Identity review.**
   Health department's record ("Priya S.", mobile 9123456999 vs. the
   canonical 9123456780) produced a genuine **59% confidence** score from
   `matching.py`.
4. Logout → login as `officer` / `demo123`. **Officer Dashboard already
   shows the case in the Identity review queue table** (case 0002, Priya
   Sharma, 59%, "health department mismatch"). Click through to Review
   Queue → source-records table with Revenue/Health/Municipal columns,
   mismatched column marked with `*` → Approve match → inline success state
   → application becomes Ready for processing.
5. Check `/officer/audit` — every login, application creation, consent,
   department verification, and the officer's approval are recorded with
   timestamp/actor/action/result.
6. Optionally: as a citizen, click "Start a new application" to show the
   live create → consent → "Connecting to departments…" → verified flow.

## Current Implementation Status

**Fully working, visually redesigned once then corrected for "AI slop," then
given a senior-level polish pass (spacing/alignment/forms/status
consistency/responsive edge cases), and demo-ready** as of this session. See
`PROGRESS.md` for the itemized checklist, exact run commands, and optional
remaining polish.

## Rules for Future Claude Sessions

- **Do not introduce Kafka, Kubernetes, real Aadhaar/Keycloak, ML/Splink,
  Grafana, or microservices.** Keep everything runnable with `uvicorn` +
  `npm run dev` locally.
- **Preserve the current (v2) visual design AND the session-4 polish.** Read
  the "Visual / Design System — v2" section above before touching any
  styling. Do NOT reintroduce: large rounded corners (rounded-xl/2xl/3xl),
  pill-shaped buttons/badges, giant hero headlines, marketing-voice copy,
  gradients, glow/glassmorphism, or heavy scroll-reveal choreography. If in
  doubt, prefer a table/list over a card, and prefer a plain sentence over a
  tagline. Use the shared `Field` and `Banner` components for any new
  form/alert rather than hand-rolling another one-off version.
- **When testing in the browser, prefer a 1280px-wide custom viewport over
  1440px** — this environment's screenshot capture has been unreliable
  specifically at 1440×900 in past sessions (stale/mis-scaled images) but
  consistently clean at 1280×900. If a screenshot ever looks visually wrong,
  confirm with `getBoundingClientRect`/`getComputedStyle` before deciding
  whether it's a real bug or a capture artifact — this session found several
  genuine bugs this way (a stray CSS border, a Tailwind typo, hidden mobile
  nav) that were not artifacts.
- **Do not change API request/response contracts** without a clear reason —
  the frontend and backend are coupled through `api/client.js`'s function
  signatures matching the router signatures 1:1. Add fields additively;
  don't rename/remove existing ones.
- SQLite DB (`backend/setu.db`) is regenerated deterministically by `python
  -m app.seed` — safe to delete/reseed any time. Reseeding restores the full
  demo state (Rahul=app 1 ready, Priya=app 2 in review). **Always reseed
  right before a live demo.**
- The backend server auto-creates tables on import
  (`Base.metadata.create_all`) but seeding is a separate explicit step —
  always run `python -m app.seed` once after a fresh clone or DB wipe.
- Frontend dev proxy (`vite.config.js`) forwards `/api/*` to
  `http://localhost:8000` — the backend must be running on port 8000.
- When adding a new department or scheme, follow the existing connector
  pattern (`fetch_records()` + `normalize()` + `find_and_normalize()`) so
  `app/verification.py`'s loop doesn't need to change.
- **Any new table or wide multi-column strip must use `overflow-x-auto` on
  its wrapper (never `overflow-hidden`)**, per the responsive-bug note
  above. Verify with `element.scrollWidth`/`clientWidth` in the browser
  console if a screenshot looks like a column vanished — don't assume a
  narrow-viewport screenshot with missing content is "just an animation
  artifact" without checking computed layout first (that assumption was
  right for a screenshot-timing issue in the prior session, but this
  session found a genuine `overflow-hidden` clipping bug that looked
  similar at first glance — always verify via `getBoundingClientRect`/
  `scrollWidth` before dismissing something as a testing-tool quirk).
- Keep identity-matching logic transparent/explainable — avoid opaque
  scoring changes without updating the `reason` string generation in
  `matching.py`. Since `seed.py` runs through the same engine, changing
  `matching.py` changes the seeded demo scores too — reseed and re-check the
  Demo Flow numbers above still make narrative sense.
- If you add a new page, follow the existing pattern: `PageHeader` +
  `Section`(s) + existing `ui/` components (prefer `Table` for anything with
  more than ~3 fields), wrapped by `<Layout>`.
