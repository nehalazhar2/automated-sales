# QuickStart → Pipedrive deals (design addendum, small change)

Approved by Nehal on 2026-11-17: "lead → deal at approval → updated at onboarding submit". Pipeline/stage choice deferred.

## Intent
Qualification already creates a Person + Lead + note in Automated Sales' Pipedrive. Approved QuickStart customers should become **deals** so Dan can track them in a pipeline, and the onboarding submission should land on that deal so the requirements live in Pipedrive.

## Behaviour (live mode only; test mode logs and skips, as today)
1. **On staff approval** (`approveProject`):
   - If the project has no `sync.pipedrive_deal_id`: create a deal — title `QuickStart · {company}`, value = package price (995 / 1995), currency GBP, person = synced person (find/create by email if missing), `pipeline_id` / `stage_id` from env when set (else Pipedrive default) — then archive the original lead (if any) and add a note to the deal: approved package, scope version, override rationale if any, link to the project in admin.
   - If a deal already exists (re-approve / package change): update its value and title; add a short note "Package changed to X — new onboarding link issued". Regenerate link: no Pipedrive change.
2. **On onboarding submit**: add a note to the deal with the full onboarding answers (labelled, HTML-escaped), scope exceptions, and the "Not sure" items for the discovery call; move the deal to the "onboarding received" stage when that env var is set.
3. Failures never block approval or submission: errors are recorded in `sync.error` (appended), shown in admin, and the action still succeeds. Re-approve retries creation if no deal id was stored.

## Configuration (new env vars, all optional)
- `QUICKSTART_PIPEDRIVE_PIPELINE_ID` — pipeline for QuickStart deals.
- `QUICKSTART_PIPEDRIVE_STAGE_SENT_ID` — stage on approval ("Onboarding sent").
- `QUICKSTART_PIPEDRIVE_STAGE_RECEIVED_ID` — stage on onboarding submit ("Onboarding received").
Unset → default pipeline, no stage moves. Documented in `.env.example` and `docs/quickstart.md`.

## Approaches considered
- **Create deal at approval + update at submit (chosen):** pipeline shows approved-but-not-yet-submitted customers; lead inbox stays a qualification queue.
- Create deal only at submit: simpler, but approved customers are invisible until they finish the form.
- Pipedrive's lead→deal conversion endpoint: preserves the lead's history, but is asynchronous (conversion status polling) — more moving parts. Creating the deal directly and archiving the lead is synchronous; the qualification note is re-linked by adding the deal note with a reference. Builder may use the conversion endpoint instead only if the docs confirm it is synchronous and simple.

## Data
`Project.sync` gains `pipedrive_deal_id?: number`, `pipedrive_deal_url?: string`. Admin shows a deal link when present (built from `PIPEDRIVE_DOMAIN`, like the lead link).

## Left to the builder
Exact note HTML layout; verifying each Pipedrive endpoint (v2 deals create/update, lead archive, notes with deal_id) against the official API docs before use.
