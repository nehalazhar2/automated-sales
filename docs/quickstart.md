# Pipedrive QuickStart

A three-step flow for the QuickStart pilot. No payment is taken anywhere.

1. **Qualification** (public). A short wizard asks how the customer sells. It recommends a candidate outcome: `quickstart` (GBP 995), `plus` (GBP 1,995), `review` or `bespoke`. The customer never sees reason codes or the other tier.
2. **Staff approval** (admin). Staff review the answers, choose the package (with a written rationale when overriding, or when the candidate is review or bespoke) and generate a private onboarding link.
3. **Onboarding questionnaire** (private link). The customer fills in sections A-H with autosave, then submits. Scope warnings are advisory and never block. "Not sure" is stored as `not_sure` and is never treated as "no".

Scope version: `pilot-v1` (limits in `lib/quickstart/packages.ts`; spec in `docs/superpowers/specs/2026-11-17-quickstart-onboarding-design.md`).

## Routes

| Route | Purpose |
| --- | --- |
| `/pipedrive-quickstart/` | Qualification wizard. Not in the sitemap or nav. |
| `/pipedrive-quickstart/onboarding/<token>/` | Customer questionnaire. Invalid, expired or malformed tokens show a friendly "link no longer active" page (HTTP 404). |
| `/pipedrive-quickstart/admin/` | Staff sign-in and project list. |
| `POST /api/quickstart/qualify/` | Qualification submit (rate limited, honeypot). |
| `GET/PUT /api/quickstart/onboarding/<token>/`, `POST .../submit/` | Questionnaire load, autosave, submit. |
| `GET /api/quickstart/admin/project/<id>/` | JSON export (admin cookie required). Includes `discovery.unresolved_questions` and `source_referrer`. |

All `/pipedrive-quickstart/**` pages send `Referrer-Policy: no-referrer`; onboarding and admin also send `X-Robots-Tag: noindex, nofollow`. The chat widget, attribution trackers and third-party scripts (Leadfeeder, Outfunnel, AS tracker) are not loaded on these routes, so onboarding tokens in URLs never reach third parties (`components/SiteExtras.tsx`).

## Environment variables

See `.env.example`.

| Variable | Notes |
| --- | --- |
| `QUICKSTART_ADMIN_KEY` | Admin password, at least 16 characters. Admin is disabled without it. |
| `QUICKSTART_NOTIFY_TO` | Staff notification address (falls back to `CONTACT_TO`). |
| `QUICKSTART_TEST_MODE` | `1` forces test mode even in production. |
| `QUICKSTART_DATA_DIR` | Local file store directory (default `.data/quickstart`). Ignored when Blob is configured. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token. **Required on Vercel.** |
| `NEXT_PUBLIC_BASE_URL` | Builds the onboarding links. Set it on staging so links point at staging. |
| `RESEND_API_KEY`, `CONTACT_FROM`, `PIPEDRIVE_API_TOKEN`, `PIPEDRIVE_DOMAIN` | Existing site settings, used for live notifications and Pipedrive sync. |

## Enabling Blob storage

1. In the Vercel dashboard create a Blob store with **private** access.
2. Connect it to the **Production** environment only (this sets `BLOB_READ_WRITE_TOKEN`).
3. On Vercel, if `BLOB_READ_WRITE_TOKEN` is missing the store throws `QuickStart storage not configured: set BLOB_READ_WRITE_TOKEN` and the qualify API returns `500 store_failed`. In production mode the lead's contact details, answers and outcome are emailed to staff (subject starts "STORE FAILED") so nothing is lost.
4. Blob paths are prefixed with `VERCEL_ENV` (`production/...`, `preview/...`), so environments sharing a store never read each other's data. Locally the prefix is `local/`.

## Test mode

Side effects (Pipedrive lookups and writes, staff emails) happen only when `VERCEL_ENV === 'production'` and `QUICKSTART_TEST_MODE !== '1'`. Everywhere else the code logs `skipped (test mode)` and projects are flagged `test_mode: true`. Preview deployments and local runs are therefore always safe to click through.

## Referral URLs for the pilot

Give each salesperson a link of the form `/pipedrive-quickstart/?ref=<code>`, for example `https://www.automated-sales.com/pipedrive-quickstart/?ref=sam`. The code prefills "Salesperson name or referral code" and is exported as `source_referrer.referral_detail`.

## Approving and sending links

1. Open `/pipedrive-quickstart/admin/` and sign in with `QUICKSTART_ADMIN_KEY`.
2. Open a project, review the answers, then **Approve and generate link**. Pick the package; if it differs from the candidate, or the candidate is review or bespoke, enter a rationale of at least 10 characters.
3. The link is shown once. Copy it and email it to the customer yourself. It expires after 30 days. Only the hash is stored, so a lost link cannot be recovered.
4. Approved projects offer **Regenerate link** and a collapsed **Change package** form. Either issues a new link and disables the old one. Both are refused once the customer has submitted.
5. After submission use **Download JSON** for the full record, including scope exceptions and "not sure" answers to raise in discovery.

## Data and retention

- Each project is one JSON document at `projects/<project_id>.json`, plus small index files `idx/submission/<submission_id>` and `idx/token/<token_hash>`. On Blob they sit under the environment prefix; locally under `QUICKSTART_DATA_DIR`.
- Data includes contact details and the customer's answers. Customers are told not to upload customer data into the form.
- Pipedrive stores a lead, person and a note when running live.
- **To delete a project:** remove its three files (project JSON, submission index, token index when present). On Blob use the Vercel dashboard or `vercel blob del <pathname>`; locally delete them from the data directory. Also delete the Pipedrive lead, person and note if required.
- There is no automatic purge in the pilot. Review stored projects periodically and delete those no longer needed.

## Production smoke test

Run with `QUICKSTART_TEST_MODE=1` set on production first, then unset it for one real submission.

- [ ] `BLOB_READ_WRITE_TOKEN` is set for Production and the store is private.
- [ ] `QUICKSTART_ADMIN_KEY`, `QUICKSTART_NOTIFY_TO`, `RESEND_API_KEY` and `NEXT_PUBLIC_BASE_URL` are set.
- [ ] `/pipedrive-quickstart/?ref=test` loads and prefills the referral detail.
- [ ] Submit the wizard; the result card shows a recommendation with no reason codes.
- [ ] The project appears in admin (marked "test mode" while forced).
- [ ] Approve with a package; copy the link; it opens the questionnaire.
- [ ] Autosave works: change an answer, reload, answer persists.
- [ ] Old links stop working after "Regenerate link".
- [ ] Submit onboarding; the page shows the confirmation and the JSON download works.
- [ ] Response headers on onboarding and admin include `Referrer-Policy: no-referrer` and `X-Robots-Tag: noindex, nofollow`.
- [ ] The chat bubble and tracker scripts are absent on `/pipedrive-quickstart/**` but present on normal pages.
- [ ] Unset `QUICKSTART_TEST_MODE` and make one real submission: a Pipedrive lead and note appear and the staff email arrives.
- [ ] Delete the test projects (see above).
