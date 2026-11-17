# QuickStart source brief (excerpts, verbatim from Dan's brief)

Referenced by the design doc as "brief §N". Payment-related items are OUT of scope (no payment link/checkout).

## §1 Pilot tiers

| Item | QuickStart | QuickStart Plus |
|---|---|---|
| Price (excl. applicable taxes) | £995 | £1,995 |
| Users | Up to 5 | Up to 10 |
| Sales pipelines | 1 | Up to 2 |
| Stages per pipeline | Up to 8 | Up to 8 |
| New custom fields total | Up to 15 | Up to 30 |
| Simple native automation recipes | Up to 3 | Up to 8 |
| Standard dashboards | 1 | Up to 2 |
| Clean spreadsheet import | Up to 1,000 rows | Up to 5,000 rows |
| Import batches | 1 | 2 |
| Discovery call | 30 min | 60 min |
| Team training | 60 min | 90 min |
| Post-launch in-scope support | 7 days | 14 days |
| Target delivery after all prerequisites | 5 working days | 10 working days |

All prices exclude Pipedrive licences. All limits apply together. No guarantee of delivery until scope is confirmed.

## §3 Qualification questions

Goal: around 3–5 minutes. Use dropdowns for single-select questions, checkboxes only where multiple selections are meaningful, conditional questions and a progress indicator. Show a clear "not sure" option. Do not ask novice users to estimate how many custom fields they need.

| Stable key | Question | Answer choices / behaviour |
|---|---|---|
| name | Your name | Text |
| email | Work email | Valid email |
| company | Company name | Text |
| website | Website | Optional URL |
| referral | Who referred you? | Pipedrive / other / direct; capture salesperson name or referral code, optionally prefilled from URL |
| current_system | What do you currently use to manage sales? | None / Excel or Google Sheets / Pipedrive / HubSpot / Salesforce / Zoho / Monday / Dynamics / other CRM / multiple systems / not sure |
| pipedrive_status | Where are you with Pipedrive? | Not started / trial / new paid account / live account / not sure |
| existing_configuration | If already live, what is in use? | Basic test data / active pipelines and live records / automations or integrations / complex or unclear / not applicable |
| users_now | How many people will use Pipedrive initially? | 1–5 / 6–10 / 11–20 / 21+ / not sure |
| users_future | Expected users within next 90 days? | Same bands / not sure |
| teams | How many separate teams/business units are in scope? | One / multiple / not sure |
| sales_processes | How many distinct sales processes do you run? | One / two / three or more / not sure |
| process_agreed | Is your sales process already agreed? | Yes / mostly / needs design / not sure |
| complexity | Does any sales process require branching, approvals or unusual steps? | No / yes / not sure |
| migration | Do you need existing data migrated? | Yes / no, fresh start / not sure; hide migration detail if no |
| records | Total rows to import across files | Up to 1,000 / 1,001–5,000 / 5,001+ / not sure |
| data_types | What information needs migrating? | Contacts / companies / open opportunities / historical deals / notes / activities / emails / attachments / custom relationships; multi-select, when migrating |
| clean_export | Can you provide clean, deduplicated CSV/XLSX exports? | Yes / no / not sure; when migrating |
| workflows | What automation is required? | None / simple reminders or follow-up tasks / advanced routing, branching, approvals or external processes / not sure |
| workflow_count | Roughly how many simple workflows? | 1–3 / 4–8 / 9+ / not sure; only for simple workflows |
| connections | What external connections are required? | None / personal email-calendar sync only / website forms / accounting / ERP / marketing / telephony / other / not sure; multi-select |
| permissions | Do users require restricted visibility, differentiated permissions or complex roles? | Standard / custom or restricted / not sure |
| reporting | What reporting is required? | Standard sales overview / two standard dashboards / attribution, complex metrics or bespoke reporting / not sure |
| deadline | Preferred go-live date | Flexible / within a week / within two weeks / later |
| additional | Anything else we should know? | Optional free text |

### Routing algorithm (server authoritative)

1. Hard bespoke flags take highest priority: 11+ users now, three or more distinct processes, multiple teams in current scope, process design needed, complex workflows/permissions/reporting, external integrations beyond personal sync, 5,001+ migration rows, cleaning required, migration of historical emails/notes/attachments/activities or complex relationships. A request involving historical closed deals is manual review at minimum.
2. Manual review: unknown answers on important scope fields, live Pipedrive account, external CRM export even if basic, future rollout exceeding package limits, tight deadline, ambiguous or substantial free text, or conflicting answers. An existing CRM with no migration can be eligible if all other conditions fit. Never auto-resolve an unknown as "no".
3. If no flags, QuickStart: 1–5 users, one team, one sales process, up to 1,000 clean rows, up to three simple recipes, one dashboard.
4. If no flags and QuickStart exceeded but within Plus limits, QuickStart Plus: up to ten users, one team, two sales processes, up to 5,000 clean rows, up to eight simple recipes, two dashboards.
5. If neither applies, bespoke. If an existing bespoke lead or account is matched, preserve its pricing/scope and queue review.
6. Dan reviews the result and confirms the scope, plan compatibility, package and quote before the prospect receives onboarding.

Routing must return reason codes and human-readable internal explanations. Do not reveal scoring rules, thresholds beyond actual package allowances, internal margin assumptions or red flags to prospects.

Customer result CTAs: "Request QuickStart" / "Request QuickStart Plus" / "Arrange a consultation" / "Send my requirements for review". Do not claim a quote was approved merely because the assessment was favourable.

## §4 Onboarding questionnaire

Send only after package and scope are confirmed. Use a server-generated opaque project link that binds the project to the approved package; never trust a package supplied in a URL or frontend. Provide save-and-resume, editable draft and clear progress. Aim for 10–15 minutes; use conditional questions and a short recorded discovery call to fill gaps.

### A. Business and account details
Company, website, business description, sector, B2B/B2C/both, products/services/subscriptions, currency, timezone, typical deal value, sales cycle, monthly enquiries, repeat sales, challenges, desired outcome. Capture Pipedrive account URL, selected plan, primary CRM administrator, named approver, email/calendar provider and preferred launch date. Do not collect passwords or API credentials.

### B. Lead management
Enquiry channels (website, email, phone, referral, outbound, ads, events, social); who responds; whether leads are qualified before opportunities are created; qualification criteria (budget, need, timeframe, decision maker, location); current allocation logic; typical response target; handling of unready/disqualified leads; whether attribution is required.

### C. Sales process
For each agreed process, capture current stages in order if known, otherwise select actual steps (enquiry, qualification, discovery, demo, survey, quote, approval, negotiation, contract, deposit). Capture stage entry/exit criteria, deal value definition, expected close date, criteria for won, lost reasons, and what happens after a sale. Ask about separate sales processes or repeat sales. More than approved pipeline/stage limits or process complexity triggers scope review.

### D. Contacts and customer information
What customer information is needed? Customer type, industry, size, geography, source, product/service interest, account tier, prospect/customer status, decision maker, renewal date. Ask if multiple contacts are involved or multiple products per customer. Avoid asking them to know custom field types. Optional examples/notes.

### E. Team and responsibilities
Repeatable user rows (name, work email, admin/regular role, optional team). Ask how ownership works, territorial/product assignment, access restrictions, who manages sales, sales targets, and which team handles handovers. Do not invite users before the approved implementation step.

### F. Follow-ups and automation
Activity types, follow-up frequency, whether every opportunity needs a next activity, unattended leads, stage-specific follow-ups, and won-deal handovers. Standard recipes are new-deal task, stage-entry task, won-deal handover task. Ask trigger, owner and due timing if known. Flag advanced automation rather than accepting it as included.

### G. Reporting
Ask management questions instead of expecting a dashboard design: forecast/pipeline value, won/lost deals, conversion, sales by owner, deal stage, follow-up compliance, activity volumes, lead-source attribution and sales cycle. Capture audience, review cadence and filters. Flag reports outside standard native capabilities.

### H. Data migration and go-live
Confirm source, clean CSV/XLSX availability, count, data types and import batch count. Ask about matching contacts/organisations, owner mapping, default deal pipeline/stage and whether historical records matter. Do not upload live PII or store raw customer exports in this form: provide separate secure transfer instructions. Confirm preferred training focus, attendee list, timezone, timing, target launch and access readiness.

Customer should be able to mark an answer "not sure". Such answers become questions for the discovery call, not guessed defaults. Keep the customer-facing confirmation as "Requirements received for review", not "Your CRM has been built".

## §5 Output contract (blueprint deferred)

```json
{
  "schema_version": "1.0",
  "project_id": "example-id",
  "qualification": { "source_referrer": "example", "candidate": "quickstart", "reason_codes": [], "approved_package": "quickstart", "scope_version": "pilot-v1", "approval_status": "approved" },
  "onboarding_answers": {},
  "discovery": { "unresolved_questions": [], "transcript_reference": null },
  "blueprint": null,
  "approvals": [],
  "test_mode": false
}
```

## §7 Acceptance tests

| Scenario | Expected |
|---|---|
| 3 users, one process, no data, no integrations | QuickStart candidate |
| 5 users, 1,000 clean spreadsheet rows, three simple workflows | QuickStart candidate |
| 6 users, one process, clean data | Plus candidate |
| 10 users, two processes, 5,000 clean rows, eight workflows | Plus candidate |
| 11 users / three processes / complex integrations | Bespoke |
| Existing HubSpot but no data migration; otherwise simple | Eligible subject to normal checks |
| HubSpot export with 500 clean contact rows | Manual review; potentially QuickStart |
| Salesforce full historical migration or attachments | Bespoke |
| Existing live Pipedrive with complex setup | Manual review or bespoke |
| Unknown data count or unclear sales process | Review, never auto-qualify |
| 3 users now but 25 expected in 90 days | Review future rollout |
| Existing active bespoke opportunity | Preserve existing scope; manual review |
| Onboarding requests additional pipelines/automation beyond package | Flag and pause for scope decision |
| Tampered URL/package or expired token | Reject securely |
| Duplicate submission | One project / lead, no duplicates |
| Test mode | No live submissions or CRM changes |
| Back navigation and conditional answers | Retain relevant inputs, omit stale hidden answers |
| Mobile and keyboard | Fully usable |
