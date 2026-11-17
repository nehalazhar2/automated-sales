import 'server-only'
import { PACKAGES, type PackageLimits } from '../packages'
import { getStore } from '../store'
import { notifyStaff } from '../effects'
import { hashToken, isTokenExpired, isWellFormedToken } from '../tokens'
import type { Project } from '../types'
import { MAX_BODY_BYTES, buildFieldErrors, onboardingDraftSchema, onboardingSubmitSchema } from './schema'
import { checkScope } from './scope'
import { seedFromQualification } from './seed'
import { pruneHidden } from './sections'

type Result = { status: number; body: Record<string, unknown> }

const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 60
const hits = new Map<string, number[]>()

export function __resetForTests() {
  hits.clear()
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

const NOT_FOUND: Result = { status: 404, body: { ok: false, error: 'not_found' } }
const ALREADY: Result = { status: 409, body: { ok: false, error: 'already_submitted' } }

function clientIp(req: Request) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  )
}

/** One indistinguishable failure for malformed, unknown, expired and unapproved. */
async function resolve(token: string): Promise<{ project: Project; pkg: PackageLimits } | null> {
  if (!isWellFormedToken(token)) return null
  const project = await getStore().findByTokenHash(hashToken(token))
  if (!project) return null
  if (isTokenExpired(project.onboarding.token_expires_at)) return null
  const q = project.qualification
  if (q.approval_status !== 'approved' || !q.approved_package) return null
  const pkg = PACKAGES[q.approved_package]
  if (!pkg) return null
  return { project, pkg }
}

async function readAnswers(req: Request): Promise<{ result: Result } | { raw: unknown; base: string | null }> {
  const len = Number(req.headers.get('content-length') ?? 0)
  if (len > MAX_BODY_BYTES) return { result: { status: 413, body: { ok: false, error: 'too_large' } } }
  let text: string
  try {
    text = await req.text()
  } catch {
    return { result: { status: 400, body: { ok: false, error: 'invalid_body' } } }
  }
  if (text.length > MAX_BODY_BYTES) return { result: { status: 413, body: { ok: false, error: 'too_large' } } }
  try {
    const parsed = JSON.parse(text) as { answers?: unknown; baseSavedAt?: unknown } | null
    const raw = parsed?.answers
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new Error('shape')
    const base = parsed?.baseSavedAt ?? null
    if (base !== null && typeof base !== 'string') throw new Error('shape')
    return { raw, base }
  } catch {
    return { result: { status: 400, body: { ok: false, error: 'invalid_body' } } }
  }
}

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e))

type Guard = { result: Result; found?: undefined } | { result?: undefined; found: { project: Project; pkg: PackageLimits } }

async function guard(req: Request, token: string): Promise<Guard> {
  if (!rateLimit(clientIp(req))) {
    return { result: { status: 429, body: { ok: false, error: 'rate_limited' } } }
  }
  const found = await resolve(token)
  if (!found) return { result: NOT_FOUND }
  return { found }
}

function snapshot(project: Project, pkg: PackageLimits) {
  const ob = project.onboarding
  const untouched = ob.status === 'not_sent' && Object.keys(ob.answers).length === 0
  const answers = untouched ? pruneHidden(seedFromQualification(project.qualification.answers)) : ob.answers
  return {
    company: project.contact.company,
    package: pkg,
    answers,
    status: ob.status,
    warnings: checkScope(answers, pkg),
    savedAt: ob.saved_at ?? null,
  }
}

/** Server-component loader: same data as GET, without rate limiting. null = not found. */
export async function loadOnboarding(token: string) {
  const found = await resolve(token)
  return found ? snapshot(found.project, found.pkg) : null
}

export async function getOnboarding(req: Request, token: string): Promise<Response> {
  const g = await guard(req, token)
  if (!g.found) return json(g.result)
  const { savedAt, ...rest } = snapshot(g.found.project, g.found.pkg)
  return json({ status: 200, body: { ok: true, ...rest, ...(savedAt ? { savedAt } : {}) } })
}

export async function saveDraft(req: Request, token: string): Promise<Response> {
  const g = await guard(req, token)
  if (!g.found) return json(g.result)
  const { project, pkg } = g.found
  if (project.onboarding.status === 'submitted') return json(ALREADY)
  const body = await readAnswers(req)
  if ('result' in body) return json(body.result)
  if ((body.base ?? null) !== (project.onboarding.saved_at ?? null)) {
    return json({
      status: 409,
      body: { ok: false, error: 'stale', answers: project.onboarding.answers, savedAt: project.onboarding.saved_at ?? null },
    })
  }
  const parsed = onboardingDraftSchema.safeParse(body.raw)
  if (!parsed.success) {
    return json({ status: 400, body: { ok: false, error: 'invalid', fieldErrors: buildFieldErrors(parsed.error) } })
  }
  const answers = parsed.data as Record<string, unknown>
  const savedAt = new Date().toISOString()
  project.onboarding.answers = answers
  project.onboarding.status = 'draft'
  project.onboarding.saved_at = savedAt
  project.updated_at = savedAt
  try {
    await getStore().put(project)
  } catch (e) {
    console.error('[quickstart] onboarding draft save failed', e)
    return json({ status: 500, body: { ok: false, error: 'store_failed' } })
  }
  return json({ status: 200, body: { ok: true, savedAt, warnings: checkScope(answers, pkg) } })
}

export async function submitOnboarding(req: Request, token: string): Promise<Response> {
  const g = await guard(req, token)
  if (!g.found) return json(g.result)
  const { project, pkg } = g.found
  if (project.onboarding.status === 'submitted') return json(ALREADY)
  const body = await readAnswers(req)
  if ('result' in body) return json(body.result)
  if ((body.base ?? null) !== (project.onboarding.saved_at ?? null)) {
    return json({
      status: 409,
      body: { ok: false, error: 'stale', answers: project.onboarding.answers, savedAt: project.onboarding.saved_at ?? null },
    })
  }
  const parsed = onboardingSubmitSchema.safeParse(body.raw)
  if (!parsed.success) {
    return json({ status: 400, body: { ok: false, error: 'invalid', fieldErrors: buildFieldErrors(parsed.error) } })
  }
  const answers = parsed.data as Record<string, unknown>
  const warnings = checkScope(answers, pkg)
  const submittedAt = new Date().toISOString()
  project.onboarding.answers = answers
  project.onboarding.versions.push({ at: submittedAt, answers })
  project.onboarding.status = 'submitted'
  project.onboarding.saved_at = submittedAt
  project.onboarding.scope_exceptions = warnings
  project.updated_at = submittedAt
  try {
    await getStore().put(project)
  } catch (e) {
    console.error('[quickstart] onboarding submit failed', e)
    return json({ status: 500, body: { ok: false, error: 'store_failed' } })
  }
  try {
    await notifyStaff(
      `QuickStart onboarding submitted — ${project.contact.company}`,
      [
        `${project.contact.company} has submitted their onboarding answers.`,
        `Project: ${project.project_id}${project.test_mode ? ' (test mode)' : ''}`,
        `Package: ${pkg.id}`,
        warnings.length ? `Scope exceptions to review:\n- ${warnings.join('\n- ')}` : 'Scope exceptions: none',
      ].join('\n')
    )
  } catch (e) {
    console.error('[quickstart] onboarding notify failed:', errMsg(e))
  }
  return json({ status: 200, body: { ok: true, submittedAt, warnings } })
}
