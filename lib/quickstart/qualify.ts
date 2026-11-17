import 'server-only'
import { randomUUID } from 'node:crypto'
import type { ZodError } from 'zod'
import { PACKAGES, SCOPE_VERSION } from './packages'
import { qualSubmitSchema, type QualAnswers } from './qualification/schema'
import { routeQualification } from './qualification/routing'
import { getStore, type Store } from './store'
import { isLive, lookupExistingOpportunity, syncQualificationToPipedrive, notifyStaff } from './effects'
import type { Project } from './types'

type Result = { status: number; body: Record<string, unknown> }

const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 10
const hits = new Map<string, number[]>()
const inFlight = new Map<string, Promise<Result>>()

export function __resetForTests() {
  hits.clear()
  inFlight.clear()
}

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (arr.length >= MAX_PER_WINDOW) {
    hits.set(ip, arr)
    return false
  }
  arr.push(now)
  hits.set(ip, arr)
  return true
}

function json({ status, body }: Result) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

function responseFor(p: Project): Result {
  const outcome = p.qualification.candidate
  const body: Record<string, unknown> = { ok: true, projectId: p.project_id, outcome }
  if (outcome === 'quickstart' || outcome === 'plus') body.package = PACKAGES[outcome]
  return { status: 200, body }
}

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e))

/** Best-effort: when the store is down in live mode, email the lead so it is not lost. */
async function notifyStoreFailure(
  project: Project,
  answers: QualAnswers,
  failure: unknown
): Promise<void> {
  if (!isLive()) return
  try {
    await notifyStaff(
      `STORE FAILED - lead not saved: ${project.contact.company} (${project.qualification.candidate})`,
      [
        'STORE FAILED - lead not saved. Follow up manually.',
        `Error: ${errMsg(failure)}`,
        `${project.contact.name} <${project.contact.email}> from ${project.contact.company}`,
        `Outcome: ${project.qualification.candidate}`,
        `Reasons: ${project.qualification.reason_codes.join(', ')}`,
        `Project: ${project.project_id}`,
        '',
        'Answers:',
        JSON.stringify(answers, null, 2),
      ].join('\n')
    )
  } catch (e) {
    console.error('[quickstart] store-failure notify failed', e)
  }
}

async function runQualify(submissionId: string, answers: QualAnswers): Promise<Result> {
  let store: Store | null = null
  let storeError: unknown
  try {
    store = getStore()
    const existing = await store.findBySubmissionId(submissionId)
    if (existing) return responseFor(existing)
  } catch (e) {
    storeError = e
  }

  let existingOpportunity = false
  let lookupError: string | undefined
  try {
    existingOpportunity = (await lookupExistingOpportunity(answers.email)).existingOpportunity
  } catch (e) {
    lookupError = `lookup: ${errMsg(e)}`
  }

  const routed = routeQualification(answers, { existingOpportunity })
  const now = new Date().toISOString()
  const project: Project = {
    schema_version: '1.0',
    project_id: randomUUID(),
    created_at: now,
    updated_at: now,
    test_mode: !isLive(),
    contact: { name: answers.name, email: answers.email, company: answers.company },
    qualification: {
      answers,
      candidate: routed.outcome,
      reason_codes: routed.reasons,
      explanation: routed.explanation,
      scope_version: SCOPE_VERSION,
      submission_id: submissionId,
      approved_package: null,
      approval_status: 'pending',
      override_rationale: null,
    },
    onboarding: {
      token_hash: null,
      token_expires_at: null,
      status: 'not_sent',
      answers: {},
      scope_exceptions: [],
      versions: [],
    },
    sync: {},
    approvals: [],
    blueprint: null,
  }

  try {
    if (!store || storeError) throw storeError ?? new Error('store unavailable')
    await store.put(project)
  } catch (e) {
    console.error('[quickstart] store failed', e)
    await notifyStoreFailure(project, answers, e)
    return { status: 500, body: { ok: false, error: 'store_failed' } }
  }

  const errors: string[] = lookupError ? [lookupError] : []
  try {
    Object.assign(project.sync, await syncQualificationToPipedrive(project))
  } catch (e) {
    errors.push(`pipedrive: ${errMsg(e)}`)
  }
  try {
    await notifyStaff(
      `New QuickStart qualification: ${project.contact.company} (${routed.outcome})`,
      [
        `${project.contact.name} <${project.contact.email}> from ${project.contact.company}`,
        `Candidate outcome: ${routed.outcome}`,
        `Reasons: ${routed.reasons.join(', ')}`,
        `Project: ${project.project_id}${project.test_mode ? ' (test mode)' : ''}`,
      ].join('\n')
    )
  } catch (e) {
    errors.push(`notify: ${errMsg(e)}`)
  }
  if (errors.length) project.sync.error = errors.join('; ')
  if (errors.length || Object.keys(project.sync).length) {
    project.updated_at = new Date().toISOString()
    try {
      await store.put(project)
    } catch (e) {
      console.error('[quickstart] store.put (sync result) failed', e)
    }
  }
  return responseFor(project)
}

/** Key issues under `answers.<key>` by `<key>`; others by their first path segment. */
function buildFieldErrors(error: ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] === 'answers' && issue.path.length > 1 ? issue.path[1] : (issue.path[0] ?? '_'))
    ;(out[key] ??= []).push(issue.message)
  }
  return out
}

export async function handleQualify(req: Request): Promise<Response> {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  if (!rateLimit(ip)) return json({ status: 429, body: { ok: false, error: 'rate_limited' } })

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return json({ status: 400, body: { ok: false, error: 'invalid_body' } })
  }

  // Bots: pretend success, store nothing.
  const hp = (raw as { honeypot?: unknown } | null)?.honeypot
  if (typeof hp === 'string' && hp.length > 0) {
    return json({ status: 200, body: { ok: true, outcome: 'review' } })
  }

  const parsed = qualSubmitSchema.safeParse(raw)
  if (!parsed.success) {
    return json({
      status: 400,
      body: { ok: false, error: 'invalid_body', fieldErrors: buildFieldErrors(parsed.error) },
    })
  }
  const { submissionId, answers } = parsed.data

  let run = inFlight.get(submissionId)
  if (!run) {
    run = runQualify(submissionId, answers).finally(() => inFlight.delete(submissionId))
    inFlight.set(submissionId, run)
  }
  return json(await run)
}
