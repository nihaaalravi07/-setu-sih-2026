# SETU — Progress

_Last updated: this session — a senior-level UI/UX **polish pass** (no
redesign). Previous sessions: (1) initial full build, (2) editorial-govtech
redesign + deterministic seed data, (3) complete visual-language rework in
response to "looks like AI-generated UI" feedback, (4, this one) targeted
polish of spacing/alignment/borders/forms/status-consistency/responsive
edge cases on top of the (3) visual language — which stays as-is._

## Completed Features

### Original build (backend + first-pass frontend)
- [x] Project structure, `CLAUDE.md`, `PROGRESS.md`
- [x] FastAPI backend, SQLite via SQLAlchemy, all routers wired in `main.py`
- [x] Full DB schema: users, applications, consents, department_verifications, identity_matches, events, audit_logs
- [x] Revenue (REST JSON) / Health (legacy SOAP/XML) / Municipal (CSV) connectors, each normalizing into the same canonical shape
- [x] Deterministic identity resolution (`app/matching.py`) — weighted DOB/mobile/name-similarity score, no ML
- [x] All API endpoints implemented and tested

### Second session — editorial redesign + deterministic demo data
- [x] First design system pass (later superseded, see below)
- [x] Deterministic demo data: `app/verification.py` extracted as a shared
      engine used by both the live `/verify` endpoint and `seed.py`, so
      seeded confidence scores are always real, not faked. `seed.py` now
      walks Rahul's and Priya's applications through consent + verification
      at seed time.
- [x] `OfficerAudit.jsx` page added (previously the `/api/audit` endpoint had
      no consumer in the UI)

### Third session — visual language correction ("anti-AI-slop" pass)
External feedback on the second-pass redesign: **"looks like AI-generated
UI / AI slop."** Specific complaints: oversized hero typography, excessive
rounded cards, generic dashboard statistics, decorative-over-purposeful UI,
gradient-ish dark-navy "tech" aesthetic, startup-landing-page feel rather
than serious government software. This session was a full visual-language
rework — **not a re-theme** — addressing every one of those points while
touching zero backend code and zero API contracts.

- [x] **New design tokens** (`index.css` v2): radius capped at 8px
      (`--r-xs/sm/md/lg` = 3/4/6/8px, no more `rounded-xl/2xl/3xl`), warmer
      muted palette (`--paper`, `--ink-*`, `--teal-600/700`, restrained
      `--saffron-600`), motion durations cut to 120/200/300ms with no more
      translateY choreography.
- [x] **Deleted the entire v1 scroll-reveal system** — `components/ui/Reveal.jsx`
      and `hooks/useReveal.js` removed; nothing imports them. Replaced with a
      single fast `page-enter` fade on route change.
- [x] **Rewrote every UI primitive**: `Button` (rectangular, not pill),
      `Badge` (rectangular tag with a colored left rule, not a pill/dot),
      `Card` (smaller radius, lighter hover), `PageHeader` (title capped at
      ~1.75rem, no marketing subtitle by default), `Section` (no card
      wrapper), `ProgressSteps` (compact numbered case-file stepper instead
      of an animated colored progress bar), `ConfidenceMeter` (plain
      mono-spaced percentage + 3px rule instead of a large animated gauge),
      `Timeline` (plain zebra-striped event log instead of an animated
      activity feed with growing rail).
- [x] **New signature brand motif**: `components/ui/Bridge.jsx` —
      `BridgeRule` (`●──── SETU ────●`) and `ConnectedThrough` (the
      "Connected through SETU" department status strip). This is the one
      deliberate recurring visual element, replacing the old animated
      "SETU Interoperability" diagram.
- [x] **Rewrote every page** to be information-first: tables for anything
      genuinely tabular (verification results, identity-match records, audit
      log, review-queue rows, recent-applications list), plain data-blocks
      (`<dl>`) for record details, and precise factual copy throughout
      (removed all marketing-voice headlines like "One connected journey
      across government services").
      - `Login.jsx`: bounded institutional card (not a full-bleed split-hero),
        bridge motif + short "Setu means bridge" explainer in the left panel,
        "Prototype environment" tag, demo accounts as a plain list.
      - `Dashboard.jsx`: Welcome back → Your applications (one data-block
        record, not a giant hero card) → Your services (plain list) →
        Connected through SETU (bridge strip). Matches the brief's exact
        structure.
      - `Apply.jsx`: plain scheme list with square selection indicators
        (not circular radio pills), applicant details as a `<dl>`.
      - `ApplicationDetail.jsx`: numbered stepper → consent block → **table**
        for department verification → **table** for identity resolution →
        plain timeline. Reads as a case file.
      - `OfficerDashboard.jsx`: compact metric strip (no giant 4xl/5xl
        numbers) → review-queue **table** → recent-applications **table**.
        Reads as an operations console, not a SaaS dashboard.
      - `OfficerReviews.jsx`: rebuilt to show a genuine **source-records
        table with Revenue/Health/Municipal columns** (fetches `GET
        /applications/{id}` client-side for the full picture, no new
        endpoint) instead of a two-column SETU-vs-one-department compare.
        Compact (non-giant) confidence indicator. Modal-confirmed reject.
      - `OfficerAudit.jsx`: unchanged structurally (was already table-based
        from the previous session) — copy tightened, unused `Reveal` import
        removed.
- [x] **Navigation simplified**: citizen = Overview / New application;
      officer = Overview / Review queue / Audit trail, with a small
      "OPERATIONS" eyebrow next to the wordmark for the officer role
      instead of a separate visual brand. Header is no longer sticky/
      blurred (removed a glassmorphism-adjacent effect).
- [x] **Fixed a real responsive bug found during this session's testing**:
      `Table` and the inline tables in `ApplicationDetail`/`OfficerReviews`,
      plus `ProgressSteps`, used `overflow-hidden` on their bordered
      wrapper — on a narrow (mobile-width) viewport this **silently clipped
      the last column** (Municipal disappeared from a 3-department table)
      instead of scrolling. Fixed by switching to `overflow-x-auto` +
      `min-w-[...]` on the inner content everywhere. Verified the fix with
      `element.scrollWidth`/`clientWidth` inspection, not just a screenshot.
- [x] `npx vite build` verified clean (no errors/warnings) after all changes.
- [x] **Full end-to-end browser verification this session**, including at a
      narrow (mobile-collapsed) viewport:
      - Citizen (Rahul): login → dashboard already shows Application 0001
        Ready for processing → detail page → verification table → identity
        resolution table (96.5%) → timeline.
      - Citizen (new application via Apply.jsx): create → consent → staged
        "Connecting to departments…" → verified, all live.
      - Officer: login → dashboard shows the pending review in a table
        immediately → Review Queue → full 3-department source-records table
        (mismatched column marked `*`) → Approve match → inline success →
        queue empties → application flips to Ready for processing.
      - Confirmed in both the application's own timeline and `/officer/audit`
        that the officer's decision (59.0% confidence, health department)
        is recorded correctly.
      - Confirmed the `ConfidenceMeter`'s `resolved` override still works
        after this rewrite (shows "Confirmed by officer" in green, not a
        contradictory "Review required" once the case is closed).

### Fourth session — senior-level polish pass (this session, no redesign)

The visual language from session 3 was confirmed good and explicitly **not**
touched (same tokens, same components, same restrained institutional look).
This session audited every page for the "final 10%" — spacing, alignment,
borders, forms, status consistency, responsive edge cases — by reading every
component/page file and cross-checking with live browser screenshots at
1280×900, 768×900 and 390×844, not just eyeballing one viewport.

- [x] **New shared `Field` component** (`components/ui/Field.jsx`): every
      text input/textarea in the app (`Login.jsx` username/password,
      `Apply.jsx` remarks) now goes through one implementation with a
      properly associated `<label htmlFor>`/`id` (via React's `useId`), a
      real focus ring (`box-shadow`, not just a border-color change — see
      `.field-input:focus` in `index.css`), and consistent hover/disabled/
      error states. Previously each page hand-rolled its own input markup
      with `focus:outline-none` and no label association — a real
      accessibility gap, now fixed everywhere at once.
- [x] **New shared `Banner` component** (`components/ui/Banner.jsx`):
      consolidated four different hand-written inline alert blocks (the
      consent-required / review-required / ready-for-processing / cancelled
      / login-error messages in `ApplicationDetail.jsx`, `OfficerReviews.jsx`,
      `Login.jsx`) into one implementation, so tint/padding/radius/left-rule
      treatment is guaranteed identical everywhere instead of copy-pasted
      and prone to drift.
- [x] **Fixed a real CSS bug in `Button.jsx`**: `duration-120` is not a
      valid Tailwind utility (the scale doesn't include 120 without
      brackets) — silently did nothing. Fixed to `duration-[120ms]`. Also
      added `active:` states to the `teal`/`secondary`/`ghost`/`danger`
      variants, which only `primary` had before.
- [x] **Fixed missing hover state on navigation** (`Layout.jsx`): inactive
      nav links had zero visual feedback on hover before (color was purely
      `active ? ink : ink-faint`, no `:hover` rule at all). Added a hover
      color step. Also added a subtle hover to the SETU wordmark link.
- [x] **Fixed a real responsive bug in the officer metric strip**
      (`OfficerDashboard.jsx`): the 4 metrics used `grid-cols-2
      md:grid-cols-4` with per-item `border-r last:border-r-0` — correct
      only for a single row. On the 2-column mobile layout this left a
      stray vertical border on item 2 (which sits at the right edge of its
      own row but isn't the DOM-last child), overlapping the container's
      own border. Fixed by switching to the same `flex` + `overflow-x-auto`
      + `divide-x` pattern already used by `ProgressSteps` elsewhere in the
      app — one row that scrolls instead of wraps, which is both more
      correct and more consistent with the rest of the app's responsive
      language.
- [x] **Fixed two real typography inconsistencies**: (1) Dashboard's
      "APPLICATION 0001" record label was plain mono text instead of the
      shared `.eyebrow` treatment used for the exact same kind of label
      everywhere else (`ApplicationDetail`'s page header, `OfficerReviews`'
      "Case 0002") — now uses `.eyebrow` too. (2) `ApplicationDetail`'s
      "Canonical citizen record" label sat directly beside
      `ConfidenceMeter`'s "Overall confidence" `.eyebrow` label in the same
      row, using a different (non-eyebrow) style — now matches exactly.
- [x] **Fixed a semantic-color bug** (`OfficerDashboard.jsx`): the "Pending"
      and "Verified" metrics were unconditionally tinted (amber/green) even
      at a value of 0, which reads as a false alarm/false positive at a
      glance. Now tone only applies when the count is actually > 0, matching
      the pattern "Identity reviews" already used.
- [x] **Fixed a real mobile-navigation gap** (`Layout.jsx`): the nav
      (`Overview`/`Review queue`/`Audit trail` for officers, `Overview`/
      `New application` for citizens) was `hidden md:flex` with **no mobile
      alternative at all** — below 768px there was literally no way to
      navigate to Review Queue or Audit Trail except by typing a URL. Fixed
      by adding a second nav row (horizontally scrollable, `flex md:hidden`)
      beneath the main header bar on narrow screens. Verified at 390×844.
- [x] `npx vite build` clean after every change; reseeded and manually
      re-verified the full Rahul + Priya + officer-approval + audit-trail
      loop after all fixes (see Verification below).
- [x] Checked and confirmed already-clean (no changes needed): `Badge.jsx`'s
      status vocabulary (single source of truth, already consistent
      app-wide), `Table.jsx`'s row/header treatment, `Modal.jsx`'s focus
      trap and Escape/backdrop close, `ConnectedThrough`'s 3-column bridge
      strip at 390px width, icon usage (only a single "✓" glyph, used
      identically in two places — no emoji/mixed icon families anywhere),
      and copy (grepped for "seamless/revolutionary/intelligent/next-
      generation/transform/powered by AI/future of governance" — none found).

## Partially Completed / Simplified (by design, per brief)

- Identity matching is a simple weighted formula (DOB 45%, mobile 35%, name
  similarity 20% via `difflib`), not ML — intentional per brief.
- Audit trail is a flat structured log table, no cryptographic chaining —
  intentional per brief.
- Auth is a plaintext-password demo login with a fake token string, no real
  sessions/JWT — intentional for a local demo. Login field is still labeled
  "Username" (matches what the backend actually authenticates with) rather
  than relabeled to "Mobile number" for realism — see CLAUDE.md decision #6.
- Only one ambiguous identity case exists in seed data (Priya / Health
  department, 59% confidence) — sufficient for the "human-in-the-loop" demo
  story.

## Remaining / Not Yet Built (optional polish, not required for demo success)

- [ ] No automated test suite (pytest / vitest) — all verification has been
      manual (curl + live browser clicks + computed-style/DOM inspection).
- [ ] `.gitignore` not yet created (venv/, node_modules/, setu.db, dist/ are
      present on disk — exclude them if this becomes a git repo).
- [ ] The citizen-facing notification when an application leaves "Identity
      Review" after officer action still relies on the citizen revisiting/
      refreshing the page.
- [ ] No dedicated tablet-only (768–1024px) design pass beyond confirming it
      doesn't break — desktop (1280+) and phone (390) got the closest look.

## Known Bugs

- None currently known after this session's fixes.
- **Tooling quirk, not a product bug**: the Browser pane's screenshot
  capture has occasionally produced a stale image immediately after a
  client-side route navigation (looked faded/incomplete) or, in an earlier
  session, a badly-scaled image specifically at a custom 1440×900 viewport.
  **This session used 1280×900 instead and got clean, correctly-scaled
  screenshots on the first try every time** — prefer 1280 width (or the
  pane's own default narrow size) over 1440 for visual QA in this
  environment. When a screenshot still looks visually wrong, verify with
  `getBoundingClientRect`/`getComputedStyle` before concluding it's a real
  bug — but don't over-apply this excuse: this session found and fixed
  several genuine bugs (the metric-strip stray border, the hidden mobile
  nav, the `duration-120` typo) that were confirmed by reading the source,
  not dismissed as tooling quirks.

## Exact Commands to Run the Project

### Backend (from `setu/backend/`)

```bash
cd setu/backend
python3 -m venv venv          # first time only
source venv/bin/activate
pip install -r requirements.txt   # first time only
python -m app.seed              # (re)seed the DB — ALWAYS do this before a demo
uvicorn app.main:app --port 8000 --reload
```

Backend health check: `curl localhost:8000/api/health`

### Frontend (from `setu/frontend/`)

```bash
cd setu/frontend
npm install     # first time only
npm run dev     # serves on http://localhost:5173, proxies /api to :8000
```

Open http://localhost:5173 — backend must already be running on port 8000.

If using Claude's browser preview tool in a future session, `.claude/launch.json`
already exists at the workspace root pointing `npm --prefix setu/frontend run dev`
at port 5173 — `preview_start` with name `setu-frontend` just works.

### Demo login credentials (all passwords: `demo123`)

| Username  | Role    | Notes                                                          |
|-----------|---------|------------------------------------------------------------------|
| `rahul`   | citizen | App 0001 pre-seeded, Ready for processing (clean high-confidence match) |
| `priya`   | citizen | App 0002 pre-seeded, Identity review pending (genuine 59% Health match) |
| `officer` | officer | Officer Anita Singh — sees Priya's case in the Review Queue immediately |

### Resetting for a clean demo run

```bash
cd setu/backend && source venv/bin/activate && python -m app.seed
```
This wipes and recreates all tables **and re-runs both demo applications
through the real verification engine** — Rahul's app is immediately Ready
for Processing, Priya's is immediately sitting in the officer Review Queue.

## Next Recommended Implementation Steps

1. If there's time before the actual SIH presentation: do one full run-through
   on the actual presentation machine/network after a fresh `pip install` +
   `npm install` + reseed.
2. Optional: a second ambiguous citizen/case if judges want to see the
   review *queue* concept with more than one row at once.
3. Optional: wire a lightweight `.gitignore` if this project is ever pushed
   to a git remote.
4. **Do not start another full visual redesign, and treat further polish
   requests as targeted fixes, not a new pass over everything.** The visual
   language (session 3) and the spacing/alignment/forms/status polish
   (session 4) are both considered done. If specific new issues are found,
   fix precisely those — re-reading every component file top to bottom
   again should only be necessary if asked for another full audit.
