import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const fx = vi.hoisted(() => ({ notify: vi.fn(async () => {}) }))
vi.mock('@/lib/quickstart/effects', async (orig) => {
  const real = await orig<typeof import('@/lib/quickstart/effects')>()
  return { ...real, notifyStaff: fx.notify }
})

import { GET, PUT } from '../onboarding/[token]/route'
import { POST } from '../onboarding/[token]/submit/route'
import { __resetForTests } from '@/lib/quickstart/onboarding/handlers'
import { getStore } from '@/lib/quickstart/store'
import { issueToken } from '@/lib/quickstart/tokens'
import type { Project } from '@/lib/quickstart/types'

let ipN = 0
const ctx = (token: string) => ({ params: Promise.resolve({ token }) })
const mk = (method: string, body?: unknown, ip = `10.1.0.${++ipN}`) =>
  new Request('http://localhost/api/quickstart/onboarding/x/', {
    method,
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  })

const REQUIRED_OK = {
  business_description: 'We sell widgets',
  primary_admin_name: 'Jane Doe',
  primary_admin_email: 'jane@acme.co',
  lead_channels: ['website'],
  pipelines: [{ name: 'Main', stages: ['Enquiry', 'Quote', 'Won'] }],
  won_criteria: 'Signed order',
  customer_fields: ['industry'],
  team_users: [{ name: 'Jane', email: 'jane@acme.co', role: 'admin' }],
  automation_recipes: ['new_deal_task'],
  reporting_needs: ['forecast'],
  source_system: 'spreadsheet',
}

async function seed(over: Partial<Project['qualification']> = {}, ob: Partial<Project['onboarding']> = {}, now = new Date()) {
  const t = issueToken(now)
  const p: Project = {
    schema_version: '1.0',
    project_id: randomUUID(),
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    test_mode: true,
    contact: { name: 'Jane', email: 'jane@acme.co', company: 'Acme Ltd' },
    qualification: {
      answers: {}, candidate: 'quickstart', reason_codes: [], explanation: [], scope_version: 'pilot-v1',
      submission_id: randomUUID(), approved_package: 'quickstart', approval_status: 'approved', override_rationale: null,
      ...over,
    },
    onboarding: {
      token_hash: t.hash, token_expires_at: t.expiresAt, status: 'not_sent', answers: {}, scope_exceptions: [], versions: [],
      ...ob,
    },
    sync: {}, approvals: [], blueprint: null,
  }
  await getStore().put(p)
  return { token: t.token, p }
}

let dir: string
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qs-onb-'))
  process.env.QUICKSTART_DATA_DIR = dir
  delete process.env.BLOB_READ_WRITE_TOKEN
  delete process.env.VERCEL_ENV
  fx.notify.mockReset()
  fx.notify.mockResolvedValue(undefined)
  __resetForTests()
})
afterEach(() => {
  vi.restoreAllMocks()
  delete process.env.QUICKSTART_DATA_DIR
  fs.rmSync(dir, { recursive: true, force: true })
})

const NF = { ok: false, error: 'not_found' }

describe('access rules', () => {
  it('malformed token -> 404 without touching the store', async () => {
    // Point the store at an unusable path: any store access would throw (-> 500, not 404).
    const file = path.join(dir, 'a-file')
    fs.writeFileSync(file, 'x')
    process.env.QUICKSTART_DATA_DIR = path.join(file, 'sub')
    for (const bad of ['abc', '../../x', 'a'.repeat(44)]) {
      const res = await GET(mk('GET'), ctx(bad))
      expect(res.status).toBe(404)
      expect(await res.json()).toEqual(NF)
    }
    process.env.QUICKSTART_DATA_DIR = dir
  })
  it('unknown well-formed token -> 404', async () => {
    const res = await GET(mk('GET'), ctx(issueToken().token))
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual(NF)
  })
  it('expired token -> 404', async () => {
    const { token } = await seed({}, {}, new Date(Date.now() - 40 * 86400_000))
    const res = await GET(mk('GET'), ctx(token))
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual(NF)
  })
  it('unapproved project -> 404 on all endpoints', async () => {
    const { token } = await seed({ approval_status: 'pending', approved_package: null })
    for (const res of [
      await GET(mk('GET'), ctx(token)),
      await PUT(mk('PUT', { answers: {} }), ctx(token)),
      await POST(mk('POST', { answers: REQUIRED_OK }), ctx(token)),
    ]) {
      expect(res.status).toBe(404)
      expect(await res.json()).toEqual(NF)
    }
  })
})

describe('GET', () => {
  it('returns company, package from approval, answers, status, warnings', async () => {
    const { token } = await seed({ approved_package: 'plus' })
    const res = await GET(mk('GET'), ctx(token))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j.ok).toBe(true)
    expect(j.company).toBe('Acme Ltd')
    expect(j.package.id).toBe('plus')
    expect(j.status).toBe('not_sent')
    expect(j.answers).toEqual({})
    expect(j.warnings).toEqual([])
  })
})

describe('PUT draft', () => {
  it('stores draft, sets status, ignores injected package keys and unknown keys', async () => {
    const { token, p } = await seed()
    const res = await PUT(
      mk('PUT', { answers: { business_description: 'Hi', approved_package: 'plus', package: { id: 'plus' }, evil: 1 }, approved_package: 'plus' }),
      ctx(token)
    )
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j.ok).toBe(true)
    expect(j.savedAt).toBeTruthy()
    const stored = (await getStore().get(p.project_id))!
    expect(stored.onboarding.status).toBe('draft')
    expect(stored.onboarding.answers).toEqual({ business_description: 'Hi' })
    expect(stored.qualification.approved_package).toBe('quickstart')
    const g = await (await GET(mk('GET'), ctx(token))).json()
    expect(g.package.id).toBe('quickstart')
    expect(g.status).toBe('draft')
  })
  it('returns scope warnings', async () => {
    const { token } = await seed()
    const j = await (await PUT(mk('PUT', { answers: { team_users: Array.from({ length: 6 }, (_, i) => ({ name: `U${i}`, email: '', role: 'regular' })) } }), ctx(token))).json()
    expect(j.warnings).toHaveLength(1)
  })
  it('invalid shape -> 400; oversize body -> 413', async () => {
    const { token } = await seed()
    expect((await PUT(mk('PUT', { answers: { lead_channels: 'website' } }), ctx(token))).status).toBe(400)
    expect((await PUT(mk('PUT', '{nope'), ctx(token))).status).toBe(400)
    const big = { answers: { challenges: 'x'.repeat(1500) }, pad: 'y'.repeat(210_000) }
    expect((await PUT(mk('PUT', big), ctx(token))).status).toBe(413)
  })
  it('caps rows (51 users -> 400)', async () => {
    const { token } = await seed()
    const rows = Array.from({ length: 51 }, () => ({ name: 'a', email: 'a@b.co', role: 'regular' }))
    expect((await PUT(mk('PUT', { answers: { team_users: rows } }), ctx(token))).status).toBe(400)
  })
  it('PUT after submit -> 409', async () => {
    const { token } = await seed({}, { status: 'submitted' })
    const res = await PUT(mk('PUT', { answers: {} }), ctx(token))
    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ ok: false, error: 'already_submitted' })
  })
})

describe('POST submit', () => {
  it('missing required -> 400 with fieldErrors', async () => {
    const { token, p } = await seed()
    const res = await POST(mk('POST', { answers: { business_description: 'x' } }), ctx(token))
    expect(res.status).toBe(400)
    const j = await res.json()
    expect(j.error).toBe('invalid')
    expect(j.fieldErrors.primary_admin_name).toBeTruthy()
    expect(j.fieldErrors.pipelines).toBeTruthy()
    expect((await getStore().get(p.project_id))!.onboarding.status).toBe('not_sent')
  })
  it("'not_sure' satisfies required fields", async () => {
    const { token } = await seed()
    const answers = Object.fromEntries(Object.keys(REQUIRED_OK).map((k) => [k, 'not_sure']))
    const res = await POST(mk('POST', { answers }), ctx(token))
    expect(res.status).toBe(200)
    expect((await res.json()).warnings).toEqual([])
  })
  it('bad email/url -> 400 by field', async () => {
    const { token } = await seed()
    const res = await POST(mk('POST', { answers: { ...REQUIRED_OK, primary_admin_email: 'nope', website: 'not a url' } }), ctx(token))
    const j = await res.json()
    expect(res.status).toBe(400)
    expect(j.fieldErrors.primary_admin_email).toBeTruthy()
    expect(j.fieldErrors.website).toBeTruthy()
  })
  it('success records version, exceptions, status and notifies staff', async () => {
    const { token, p } = await seed()
    const answers = { ...REQUIRED_OK, other_automation: 'Auto invoicing', approved_package: 'plus' }
    const res = await POST(mk('POST', { answers }), ctx(token))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j.ok).toBe(true)
    expect(j.submittedAt).toBeTruthy()
    expect(j.warnings.length).toBeGreaterThan(0)
    const s = (await getStore().get(p.project_id))!
    expect(s.onboarding.status).toBe('submitted')
    expect(s.onboarding.versions).toHaveLength(1)
    expect(s.onboarding.versions[0].answers).not.toHaveProperty('approved_package')
    expect(s.onboarding.scope_exceptions).toEqual(j.warnings)
    expect(fx.notify).toHaveBeenCalledTimes(1)
    const [subject, text] = fx.notify.mock.calls[0] as unknown as [string, string]
    expect(subject).toBe('QuickStart onboarding submitted — Acme Ltd')
    expect(text).toContain(p.project_id)
    expect(text).toContain('quickstart')
    expect(text).toContain('review')
  })
  it('notify failure is not fatal', async () => {
    fx.notify.mockRejectedValue(new Error('smtp down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { token, p } = await seed()
    const res = await POST(mk('POST', { answers: REQUIRED_OK }), ctx(token))
    expect(res.status).toBe(200)
    expect((await getStore().get(p.project_id))!.onboarding.status).toBe('submitted')
  })
  it('second submit -> 409', async () => {
    const { token } = await seed()
    expect((await POST(mk('POST', { answers: REQUIRED_OK }), ctx(token))).status).toBe(200)
    const res = await POST(mk('POST', { answers: REQUIRED_OK }), ctx(token))
    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ ok: false, error: 'already_submitted' })
  })
})

describe('rate limit', () => {
  it('429 after 60 requests/min/IP across endpoints', async () => {
    const ip = '203.0.113.50'
    const tok = issueToken().token
    let last = 0
    for (let i = 0; i < 61; i++) last = (await GET(mk('GET', undefined, ip), ctx(tok))).status
    expect(last).toBe(429)
    expect((await POST(mk('POST', {}, ip), ctx(tok))).status).toBe(429)
  })
})
