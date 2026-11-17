# Pipedrive QuickStart Qualification + Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Public qualification form → staff approval → private onboarding questionnaire, all inside the existing Automated Sales Next.js site, with no payment step.

**Architecture:** Pure logic in `lib/quickstart/` (package config, question definitions, routing, scope checks, zod schemas) is shared by client components and API route handlers. Records are persisted through a `Store` interface (local JSON files in dev/test, Vercel Blob private in production). Pipedrive and email side effects go through one `effects.ts` module that no-ops in test mode.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, zod 3, existing `lib/pipedrive/client.ts`, Resend, `@vercel/blob` (new), Vitest (new, dev).

**Spec:** `docs/superpowers/specs/2026-11-17-quickstart-onboarding-design.md`

## Global Constraints

- Node runtime for all new route handlers (no `export const runtime = 'edge'`).
- Styling only via existing `app/globals.css` tokens/classes plus a new scoped block prefixed `.qs-`; no CSS framework.
- `SCOPE_VERSION = 'pilot-v1'`; QuickStart £995 / Plus £1,995, limits exactly as brief §1 table.
- No payment links, checkout or price picker anywhere.
- Prospect-facing copy never shows reason codes or the other tier; review/bespoke copy is positive ("Your requirements would benefit from a tailored implementation. Let's discuss the best solution.").
- Live side effects only when `VERCEL_ENV === 'production' && QUICKSTART_TEST_MODE !== '1'`.
- Onboarding and admin pages: `noIndex: true`; not added to `sitemap.ts`. Landing page is also excluded from sitemap/nav for the pilot.
- "Not sure" is never treated as "no".
- Every task ends with `npm run typecheck`, `npm test` and `npm run lint` passing.

## Review Focus

1. Double-click / network retry on submit → one project, one Pipedrive lead (idempotency by `submissionId`). Test in Task 4.
2. Back-navigation after changing a conditional answer → stale hidden answers are not submitted or routed on. Test in Task 2 (`pruneHidden`) and Task 4 (server re-prunes).
3. Tampered or expired onboarding token, or a package field injected into the PUT body → rejected / ignored. Test in Task 6.
4. Pipedrive or Resend down → submission still stored, user sees success, `sync.error` recorded. Test in Task 4.
5. Onboarding answers exceeding the approved package (2nd pipeline, 9+ stages, too many users) → warning, not a block; recorded as `scope_exceptions`. Test in Task 6.

---

### Task 1: Tooling + package config

**Files:**
- Modify: `package.json` (add `vitest` dev dep, `"test": "vitest run"`), `.gitignore` (`.data/`)
- Create: `vitest.config.ts` (alias `@` → repo root, node env), `lib/quickstart/packages.ts`
- Test: `lib/quickstart/__tests__/packages.test.ts`

**Interfaces:**
- Produces: `SCOPE_VERSION: 'pilot-v1'`; `type PackageId = 'quickstart' | 'plus'`; `PACKAGES: Record<PackageId, PackageLimits>` where `PackageLimits = { id; name; priceGbp; maxUsers; maxPipelines; maxStagesPerPipeline; maxCustomFields; maxRecipes; maxDashboards; maxImportRows; importBatches; discoveryMins; trainingMins; supportDays; deliveryDays; inclusions: string[] }`.

- [ ] Step 1: Install vitest, add script and config; write test asserting QuickStart `{priceGbp:995,maxUsers:5,maxPipelines:1,maxStagesPerPipeline:8,maxCustomFields:15,maxRecipes:3,maxDashboards:1,maxImportRows:1000}` and Plus `{1995,10,2,8,30,8,2,5000}`.
- [ ] Step 2: `npm test` → FAIL (module missing).
- [ ] Step 3: Implement `packages.ts`.
- [ ] Step 4: `npm test && npm run typecheck` → PASS.
- [ ] Step 5: Commit `feat(quickstart): package config and test tooling`.

### Task 2: Qualification questions + schema

**Files:**
- Create: `lib/quickstart/qualification/questions.ts`, `lib/quickstart/qualification/schema.ts`
- Test: `lib/quickstart/__tests__/qualification-schema.test.ts`

**Interfaces:**
- Produces: `QUESTIONS: Question[]` with `Question = { key; step: 1..6; label; hint?; type: 'text'|'email'|'url'|'select'|'multi'|'textarea'; options?: {value; label}[]; required: boolean; showIf?: (a: Partial<QualAnswers>) => boolean }`; `STEPS: {n; title}[]`; `QualAnswers` (zod-inferred); `qualAnswersSchema`; `pruneHidden(a: Partial<QualAnswers>): Partial<QualAnswers>`; `qualSubmitSchema = { submissionId: uuid, answers, honeypot: '' }`.
- Keys and option values exactly as brief §3 table (snake_case values, e.g. `users_now: '1_5'|'6_10'|'11_20'|'21_plus'|'not_sure'`).

- [ ] Step 1: Tests: valid full answer set parses; bad email rejected; `pruneHidden` drops `records`, `data_types`, `clean_export` when `migration='no'`; drops `workflow_count` unless `workflows='simple'`; drops `existing_configuration` when `pipedrive_status='not_started'`; required visible field missing → error.
- [ ] Step 2: Run → FAIL.
- [ ] Step 3: Implement.
- [ ] Step 4: Run → PASS.
- [ ] Step 5: Commit.

### Task 3: Routing engine

**Files:**
- Create: `lib/quickstart/qualification/routing.ts`
- Test: `lib/quickstart/__tests__/routing.test.ts`

**Interfaces:**
- Consumes: `QualAnswers`, `PACKAGES`.
- Produces: `type Outcome = 'quickstart'|'plus'|'review'|'bespoke'`; `type ReasonCode` (string union, e.g. `USERS_11_PLUS`, `THREE_PLUS_PROCESSES`, `MULTI_TEAM`, `PROCESS_DESIGN`, `COMPLEX_WORKFLOWS`, `COMPLEX_PERMISSIONS`, `COMPLEX_REPORTING`, `EXTERNAL_INTEGRATIONS`, `ROWS_5001_PLUS`, `DATA_NOT_CLEAN`, `HISTORICAL_DATA`, `HISTORICAL_DEALS`, `UNKNOWN_<KEY>`, `LIVE_PIPEDRIVE`, `EXTERNAL_CRM_EXPORT`, `FUTURE_ROLLOUT`, `TIGHT_DEADLINE`, `FREE_TEXT`, `EXISTING_OPPORTUNITY`, `FITS_QUICKSTART`, `FITS_PLUS`, `EXCEEDS_PLUS`); `routeQualification(a: QualAnswers, ctx?: { existingOpportunity?: boolean }): { outcome: Outcome; reasons: ReasonCode[]; explanation: string[] }`.
- Order (brief §3): bespoke flags → review flags → QuickStart fit → Plus fit → bespoke. `HISTORICAL_DEALS` alone ⇒ review. `additional` non-empty ⇒ `FREE_TEXT` review. Deadline `within_week` ⇒ `TIGHT_DEADLINE` review.

- [ ] Step 1: One test per brief §7 routing row:
  3 users/1 process/no data/no integrations → quickstart; 5 users/1,000 clean rows/3 workflows → quickstart; 6 users/1 process/clean → plus; 10 users/2 processes/5,000 rows/8 workflows → plus; 11 users → bespoke (`USERS_11_PLUS`); HubSpot no migration otherwise simple → quickstart; HubSpot 500 clean rows → review (`EXTERNAL_CRM_EXPORT`); Salesforce + attachments → bespoke (`HISTORICAL_DATA`); live Pipedrive complex → bespoke or review (assert not quickstart/plus); unknown records → review (`UNKNOWN_RECORDS`); 3 now/21+ in 90 days → review (`FUTURE_ROLLOUT`); `existingOpportunity: true` on a quickstart fit → review (`EXISTING_OPPORTUNITY`).
- [ ] Step 2: Run → FAIL.
- [ ] Step 3: Implement as ordered rule lists; explanation is one human sentence per reason.
- [ ] Step 4: Run → PASS.
- [ ] Step 5: Commit.

### Task 4: Store, effects, qualify API

**Files:**
- Create: `lib/quickstart/store.ts`, `lib/quickstart/types.ts`, `lib/quickstart/effects.ts`, `app/api/quickstart/qualify/route.ts`
- Modify: `lib/pipedrive/client.ts` (add `countOpenDealsForPerson(personId): Promise<number>`)
- Test: `lib/quickstart/__tests__/store.test.ts`, `app/api/quickstart/__tests__/qualify.test.ts`

**Interfaces:**
- Produces: `Project` type = brief §5 contract `{ schema_version:'1.0'; project_id; created_at; updated_at; test_mode; contact:{name,email,company}; qualification:{ answers; candidate: Outcome; reason_codes; explanation; scope_version; submission_id; approved_package: PackageId|null; approval_status:'pending'|'approved'; override_rationale: string|null }; onboarding:{ token_hash: string|null; token_expires_at: string|null; status:'not_sent'|'draft'|'submitted'; answers: Record<string,unknown>; scope_exceptions: string[]; versions: {at; answers}[] }; sync:{ pipedrive_person_id?; pipedrive_lead_id?; error?: string }; approvals: {at; by; action; detail}[]; blueprint: null }`.
- `Store = { get(id): Promise<Project|null>; put(p: Project): Promise<void>; list(): Promise<Project[]>; findBySubmissionId(sid): Promise<Project|null>; findByTokenHash(h): Promise<Project|null> }`; `getStore(): Store` → Blob driver if `BLOB_READ_WRITE_TOKEN` else file driver at `QUICKSTART_DATA_DIR ?? .data/quickstart`. Secondary index files: `idx/submission/<sid>` and `idx/token/<hash>` → project id.
- `isLive(): boolean`; `syncQualificationToPipedrive(p): Promise<Project['sync'] & { existingOpportunity: boolean }>`; `notifyStaff(subject, text): Promise<void>` (to `QUICKSTART_NOTIFY_TO ?? CONTACT_TO`). Both log-and-skip when `!isLive()`.
- `POST /api/quickstart/qualify` body `qualSubmitSchema` → `{ ok: true, projectId, outcome, package?: PackageLimits }` (package only for quickstart/plus) or `{ ok:false, error }` 400/429.

- [ ] Step 1: Store tests (file driver in a tmp dir): put/get roundtrip; list newest first; index lookups.
- [ ] Step 2: Handler tests (call exported `POST` with a `Request`; tmp data dir; test mode): valid → 200 with outcome; same `submissionId` twice → same `projectId`, one stored project; honeypot filled → 400; invalid answers → 400; hidden answers in body are pruned before routing; `syncQualificationToPipedrive` mocked to throw → still 200, project has `sync.error`; response never contains `reason_codes`.
- [ ] Step 3: Run → FAIL.
- [ ] Step 4: Verify `@vercel/blob` private API in installed `node_modules/@vercel/blob` README/types before writing the Blob driver. Implement store, effects, client addition, route (in-memory rate limit 10/min/IP as in existing routes).
- [ ] Step 5: Run → PASS. Commit.

### Task 5: Qualification UI

**Files:**
- Create: `app/pipedrive-quickstart/page.tsx` (server: metadata via `buildMetadata` with `noIndex: true` for pilot, hero copy from mockup), `components/quickstart/QualificationWizard.tsx` (client), `components/quickstart/Field.tsx` (renders a `Question`), `components/quickstart/ResultCard.tsx`, `app/quickstart.css` imported by the page
- Test: manual browser check (below) + existing typecheck/lint

**Interfaces:**
- Consumes: `QUESTIONS`, `STEPS`, `pruneHidden`, `PACKAGES`, `POST /api/quickstart/qualify`.

- [ ] Step 1: Build wizard per mockup screen 1: progress bar, per-step validation, Back keeps answers, "Not sure" options, `?ref=` prefill, honeypot field, `submissionId = crypto.randomUUID()` created once per session; submit button disabled while pending; focus moves to first error.
- [ ] Step 2: Result card per mockup screen 2 for each outcome; error state with retry that reuses the same `submissionId`.
- [ ] Step 3: `npm run dev`; walk QuickStart, Plus, review and bespoke paths on desktop and 375px width, keyboard only once; confirm `.data/quickstart` gets one project per submit.
- [ ] Step 4: typecheck/lint/test → PASS. Commit.

### Task 6: Onboarding sections, token, scope check, APIs

**Files:**
- Create: `lib/quickstart/onboarding/sections.ts`, `lib/quickstart/onboarding/schema.ts`, `lib/quickstart/onboarding/scope.ts`, `lib/quickstart/tokens.ts`, `app/api/quickstart/onboarding/[token]/route.ts` (GET, PUT), `app/api/quickstart/onboarding/[token]/submit/route.ts` (POST)
- Test: `lib/quickstart/__tests__/scope.test.ts`, `lib/quickstart/__tests__/tokens.test.ts`, `app/api/quickstart/__tests__/onboarding.test.ts`

**Interfaces:**
- Produces: `SECTIONS` (8, brief §4 A–H; each `{ id; title; fields: OnbField[] }`, field types add `'users'` repeatable rows `{name,email,role:'admin'|'regular',team?}` and `'pipelines'` `{name, stages: string[]}[]`, every scoped field has `allowNotSure`); `onboardingDraftSchema` (lenient, all optional) and `onboardingSubmitSchema` (required fields enforced unless marked not sure); `checkScope(answers, pkg: PackageLimits): string[]` (human warnings); `issueToken(): { token; hash; expiresAt }`, `hashToken(t): string`.
- `GET` → `{ ok, company, package: PackageLimits, answers, status, warnings }`; `PUT { answers }` → saves draft, returns `{ ok, savedAt, warnings }`; `POST submit` → validates, pushes version, status `submitted`, `scope_exceptions`, notifies staff. Unknown/expired token → 404 `{ok:false}`; submitted project → PUT 409. Any `package`/`approved_package` keys in body ignored.

- [ ] Step 1: Tests: scope warns on 2 pipelines for quickstart, 9 stages, 6 users for quickstart, not for plus; token hash stable, tokens unique, expired rejected; GET with bad token 404; PUT stores draft and ignores injected `approved_package`; submit with missing required → 400; submit records exceptions; PUT after submit → 409.
- [ ] Step 2: Run → FAIL. Step 3: Implement. Step 4: Run → PASS. Commit.

### Task 7: Onboarding UI

**Files:**
- Create: `app/pipedrive-quickstart/onboarding/[token]/page.tsx` (server; `noIndex`; loads project by token, 404 page on invalid), `components/quickstart/OnboardingForm.tsx` (client: sidebar per mockup screen 3, section nav, debounced autosave 1.5s + "Save & continue", "Draft saved" indicator, users and pipelines editors with add/remove/move up/down (keyboard accessible instead of drag-only), inline scope warnings, final review + submit, confirmation "Requirements received for review")
- Test: manual browser check

- [ ] Step 1: Build. Step 2: Manually: open a link created by Task 8 (or a dev seed script `scripts/quickstart-seed.ts` that creates an approved project and prints the link), fill, reload mid-way (draft restored), exceed limits (warning shown), submit, reload (read-only confirmation). Step 3: typecheck/lint/test → PASS. Commit.

### Task 8: Staff admin

**Files:**
- Create: `lib/quickstart/adminAuth.ts` (`isAdmin(cookies)`, HMAC-signed cookie from `QUICKSTART_ADMIN_KEY`, timing-safe compare like `lib/blogAuth.ts`), `app/pipedrive-quickstart/admin/page.tsx`, `app/pipedrive-quickstart/admin/actions.ts` (server actions: `login`, `logout`, `approve(projectId, pkg, rationale)`, `regenerateLink(projectId)`), `app/api/quickstart/admin/project/[id]/route.ts` (GET JSON download, admin only)
- Test: `app/api/quickstart/__tests__/admin.test.ts`

**Interfaces:**
- `approve` requires rationale when `pkg !== candidate` or candidate is review/bespoke; records approval entry; issues token; returns the link `${SITE_URL}/pipedrive-quickstart/onboarding/${token}/` once (only hash stored; regenerate issues a new one).

- [ ] Step 1: Tests: JSON download without cookie → 401; approve override without rationale → error; approve sets `approved_package`, `approval_status`, token hash, approvals entry.
- [ ] Step 2: FAIL → implement → PASS.
- [ ] Step 3: Manual: login, see list with outcome/reasons/sync status, approve, copy link, open it, download JSON after onboarding submit.
- [ ] Step 4: Commit.

### Task 9: Final verification

- [ ] `npm run typecheck && npm run lint && npm test && npm run build` all pass.
- [ ] Full end-to-end in dev (test mode): qualify → admin approve → onboarding → submit → JSON download. Confirm no Pipedrive/email calls (log lines say `skipped (test mode)`).
- [ ] Confirm no changes to existing pages, nav, sitemap.
- [ ] Write `docs/quickstart.md`: env vars (`QUICKSTART_ADMIN_KEY`, `QUICKSTART_NOTIFY_TO`, `QUICKSTART_TEST_MODE`, `BLOB_READ_WRITE_TOKEN`), how to enable Blob in Vercel, pilot referral URL format.
- [ ] Request code review (superpowers:requesting-code-review), fix findings, re-run all checks.

### Task 10: Pipedrive deals at approval and onboarding submit

**Spec:** `docs/superpowers/specs/2026-11-17-quickstart-pipedrive-deals-design.md`

**Files:**
- Modify: `lib/pipedrive/client.ts` (add `createDeal`, `updateDeal`, `archiveLead`; extend `createNote` to accept `dealId`), `lib/quickstart/types.ts` (sync: `pipedrive_deal_id?`, `pipedrive_deal_url?`), `lib/quickstart/effects.ts` (add `syncApprovalToPipedrive(p): Promise<Project['sync']>`, `syncOnboardingToPipedrive(p): Promise<Project['sync']>`), `lib/quickstart/admin.ts` (call after approve; never block), `lib/quickstart/onboarding/handlers.ts` (call after submit; never block), `app/pipedrive-quickstart/admin/page.tsx` (deal link), `.env.example`, `docs/quickstart.md`
- Test: `lib/quickstart/__tests__/pipedrive-deals.test.ts`

**Interfaces:**
- `createDeal({ title, value, currency, personId, pipelineId?, stageId? }): Promise<{ id: number; url: string }>`; `updateDeal(id, { title?, value?, stageId? }): Promise<void>`; `archiveLead(leadId: string): Promise<void>`; `createNote({ personId?, leadId?, dealId?, content })`.
- Env: `QUICKSTART_PIPEDRIVE_PIPELINE_ID`, `QUICKSTART_PIPEDRIVE_STAGE_SENT_ID`, `QUICKSTART_PIPEDRIVE_STAGE_RECEIVED_ID` (optional, integers).

- [ ] Step 1: Tests (mock `fetch`, live mode via VERCEL_ENV=production): approval with no deal → POST deal with value 995/1995 GBP + person + pipeline/stage when env set (omitted when unset), lead archived, note on deal, sync stores deal id/url; re-approve with deal → PUT/PATCH value, no new deal; test mode → no fetch; Pipedrive 500 on approve → approval still ok, sync.error recorded; onboarding submit → note on deal containing escaped answers + exceptions + not-sure list, stage moved only when RECEIVED env set; submit without deal id → no Pipedrive call, no error.
- [ ] Step 2: Run → FAIL.
- [ ] Step 3: Verify each endpoint against the official Pipedrive API docs (v2 deals create/update, v1/v2 lead archive via `is_archived`, notes `deal_id`) before implementing; implement.
- [ ] Step 4: `npm test`, `npm run typecheck`, `npm run build` → PASS. Commit.

### Task 11: Custom accessible select (replace native dropdowns)

**Spec:** `docs/superpowers/specs/2026-11-17-quickstart-custom-select-design.md`

**Files:**
- Create: `components/quickstart/Select.tsx` (client component), `components/quickstart/selectKeys.ts` (pure keyboard/type-ahead reducer), `lib/quickstart/__tests__/selectKeys.test.ts`
- Modify: `components/quickstart/Field.tsx`, `components/quickstart/onboarding/OnboardingField.tsx`, any remaining `<select>` under `components/quickstart/**`, `app/pipedrive-quickstart/quickstart.css` (`.qs-cselect*`, R18-scoped)

**Interfaces:**
- `Select({ id, labelId, options: {value,label}[], value: string, onChange(v), placeholder='Choose…', disabled?, invalid?, describedBy?, required?, name? })` — `name` renders a hidden input.
- `selectKeys(state: { open: boolean; active: number; typed: string; typedAt: number }, key: string, ctx: { count: number; labels: string[]; selected: number; now: number }): { state; action?: 'open'|'close'|'select'|'selectAndTab' }`

- [ ] Step 1: Reducer tests: Down/Up/Home/End/PageUp/PageDown bounds; Enter/Space/Alt+Down open; Esc closes without select; Tab selects active; type-ahead jumps to first match, repeated letter cycles, buffer resets after 500ms.
- [ ] Step 2: Run → FAIL. Step 3: implement reducer + component; replace all native selects. Step 4: tests/typecheck/build PASS.
- [ ] Step 5: Browser verification (Playwright, port 3124): every QuickStart select operable by keyboard only and by pointer; open popup is adjacent to its trigger (≤8px below, or flipped ≤8px above) and fully inside the viewport at 320/375/768/1024/1440, 740×360 and 932×430 (touch), 1152/960/819/683; forced-colors shows active/selected; overlap audit still passes. Commit.
