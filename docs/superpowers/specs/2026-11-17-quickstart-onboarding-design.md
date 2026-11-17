# Pipedrive QuickStart: qualification + onboarding (design)

Source brief: Dan's QuickStart developer brief (GPT draft), trimmed as agreed with Nehal on 2026-11-17.
Mockup approved: `.superpowers/brainstorm/*/content/flow-v1.html`.

## Intent

Cut the number of scoping and onboarding calls on small Pipedrive jobs. A prospect fills in a short public
qualification form; we recommend a fixed-scope package (or route them to review/bespoke); Dan confirms;
the confirmed customer then fills in a structured onboarding questionnaire that gives us everything we
need to build their Pipedrive. Bespoke consultancy must not be undercut.

## Scope (this build = brief milestones 1–2)

In:
- Public qualification flow at `/pipedrive-quickstart/` with deterministic, server-side routing.
- Lead + note in Automated Sales' own Pipedrive for every qualification submission (server-side only).
- Staff review page to approve a package (with optional override + rationale) and generate a private onboarding link.
- Onboarding questionnaire at `/pipedrive-quickstart/onboarding/[token]/` with save-and-resume, 8 sections,
  "not sure" on every important answer, and soft scope warnings.
- Structured JSON output per project (brief §5 output contract, minus blueprint content), downloadable by staff.
- Test mode, automated tests for routing and validation.

Out (explicitly):
- **No payment link / checkout of any kind.**
- No AI summary / blueprint generation (milestone 3), no MCP/browser provisioning (milestone 4).
- No changes to existing navigation, service pages or CTAs. The landing page is linked only by referral URLs for the pilot.

## Anti-goals

- A public price menu or tier picker. Prices appear only on the result screen, as indicative, for the tier the server chose.
- Telling a prospect they "failed". Review/bespoke copy is positive.
- Revealing reason codes, thresholds or red flags to prospects.
- Ever resolving "not sure" as "no".
- Live Pipedrive writes or emails from staging/dev.

## Constraints

- Stack: the existing Next.js 15 App Router site (React 19, zod, Resend, `lib/pipedrive/client.ts`). Node runtime, not edge.
  No new UI framework; styling reuses `app/globals.css` tokens/classes (`as-card`, `as-btn`, `as-form`, emerald/slate).
- No database exists. Storage goes through a small interface with two drivers:
  local JSON files (dev/test, `.data/quickstart/`, gitignored) and Vercel Blob private (production, when `BLOB_READ_WRITE_TOKEN` is set).
- Secrets only server-side. Onboarding/admin pages are `noindex`.
- Package limits and prices live in one versioned config object (`pilot-v1`) used by both UI and server.

## Approaches considered

1. **Static form + email to Dan** (no storage). Cheapest, but no save/resume, no secure links, no JSON. Fails the onboarding goal.
2. **Next.js routes + storage interface (local files / Vercel Blob)**. Chosen. Fits the existing stack, no schema
   migrations, runs locally with zero provisioning, Blob turns on in production by env var.
3. **Next.js + Marketplace Postgres (Neon) + ORM.** Most robust querying, but adds a DB, migrations and an ORM for
   what is a low-volume pilot (tens of projects). Revisit if volume grows. The storage interface keeps this swap cheap.

## Design

### Package config (`lib/quickstart/packages.ts`)
`SCOPE_VERSION = 'pilot-v1'`. Two packages exactly as brief §1 table (QuickStart £995 / Plus £1,995 with users,
pipelines, stages, fields, recipes, dashboards, rows, batches, call/training/support minutes, delivery days).

### Qualification questions
Data-driven list (stable keys from brief §3), grouped in 6 steps: About you; Current setup; Team & process; Data;
Automation, integrations & reporting; Timing. Conditional visibility (`existing_configuration` only if Pipedrive is
trial/paid/live; migration detail only if migrating; `workflow_count` only for simple workflows). Hidden answers are
stripped before submit and ignored server-side. Every scope question has "Not sure". Referral prefilled from `?ref=`.

### Routing (`lib/quickstart/routing.ts`, pure function)
`route(answers, ctx) -> { outcome: 'quickstart'|'plus'|'review'|'bespoke', reasons: ReasonCode[], explanation: string[] }`
following brief §3 order: hard bespoke flags → manual-review flags → QuickStart fit → Plus fit → bespoke.
`ctx.existingOpportunity` (open deals on matched Pipedrive person) forces at least review. Acceptance table (brief §7)
is the test suite.

### Qualification submit
`POST /api/quickstart/qualify`: zod-validate, honeypot, rate limit, idempotency key from client (`submissionId`) so a
double-submit returns the same stored result. Stores a `Project` record, then (live mode only) finds/creates the person,
checks open deals, creates a lead `QuickStart · {company} · {outcome}` and a note with answers, reasons and scope version,
and emails Dan. Success is returned only after the store write succeeds; Pipedrive/email failures are recorded on the
project (`sync.error`) and do not lose the submission.

Customer sees outcome card (mockup screen 2). Review/bespoke show no price.

### Staff review (`/pipedrive-quickstart/admin/`)
Login with `QUICKSTART_ADMIN_KEY` (httpOnly signed cookie). Lists projects newest first with outcome, reasons and status.
Per project: approve as QuickStart/Plus (defaults to the recommendation; changing it requires a rationale, which is recorded),
which generates an onboarding link; copy link; download JSON. The link is emailed by Dan himself for the pilot (no automatic customer email).

### Onboarding
Token: 32 random bytes, base64url; only its SHA-256 is stored; 30-day expiry; bound server-side to project + approved package.
Package is never read from URL/client. 8 sections per brief §4 A–H (mockup screen 3). Autosave (debounced PUT) plus
explicit "Save & continue"; resume on same link. Users list, pipelines/stages list (repeatable rows). Scope checker compares
answers with the approved package limits and returns warnings (shown inline, recorded on submit as `scope_exceptions`),
never blocks. Submit validates, freezes a versioned copy, notifies Dan, confirmation reads "Requirements received for review".
Staff can download the project JSON (brief §5 contract with `blueprint: null` for now).

### Test mode
Live side effects only when `VERCEL_ENV === 'production'` and `QUICKSTART_TEST_MODE !== '1'`. Otherwise Pipedrive and email
calls are logged and skipped; records carry `test_mode: true`.

## Calls made by the builder (Nehal can override)
- Storage = local files + Vercel Blob behind one interface (no DB).
- Staff page protected by a single shared admin key, not per-user accounts.
- Onboarding link sent by Dan manually; no automatic customer email in MVP.
- Tests with Vitest (new dev dependency); only pure logic and API handlers are tested, not visual UI.
- Lead title format `QuickStart · {company} · {outcome}`.

## Left to the builder
Exact copy beyond the mockup, file layout inside `lib/quickstart/`, component decomposition.
