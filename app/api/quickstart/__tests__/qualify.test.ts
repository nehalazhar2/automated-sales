import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const effectsMock = vi.hoisted(() => ({
  useMock: false,
  syncThrows: false,
  live: false,
  notify: vi.fn(async (_subject: string, _text: string) => {}),
}))

vi.mock('@/lib/quickstart/effects', async (orig) => {
  const real = await orig<typeof import('@/lib/quickstart/effects')>()
  return {
    ...real,
    isLive: () => (effectsMock.live ? true : real.isLive()),
    lookupExistingOpportunity: (email: string) =>
      effectsMock.live
        ? Promise.resolve({ personId: null, existingOpportunity: false })
        : real.lookupExistingOpportunity(email),
    notifyStaff: (subject: string, text: string) =>
      effectsMock.live ? effectsMock.notify(subject, text) : real.notifyStaff(subject, text),
    syncQualificationToPipedrive: vi.fn(async (p: Parameters<typeof real.syncQualificationToPipedrive>[0]) => {
      if (effectsMock.syncThrows) throw new Error('pipedrive boom')
      return real.syncQualificationToPipedrive(p)
    }),
  }
})

import { POST } from '../qualify/route'
import { __resetForTests } from '@/lib/quickstart/qualify'
import { getStore } from '@/lib/quickstart/store'

const ANSWERS = {
  name: 'Jane Doe',
  email: 'Jane@Example.com',
  company: 'Acme Ltd',
  referral: 'direct',
  current_system: 'spreadsheet',
  pipedrive_status: 'not_started',
  users_now: '1_5',
  users_future: '1_5',
  teams: 'one',
  sales_processes: 'one',
  process_agreed: 'yes',
  complexity: 'no',
  migration: 'no',
  workflows: 'none',
  connections: ['none'],
  permissions: 'standard',
  reporting: 'standard',
  deadline: 'flexible',
}

let ipN = 0
function req(body: unknown, ip = `10.0.0.${++ipN}`) {
  return new Request('http://localhost/api/quickstart/qualify', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}
const valid = (over: Record<string, unknown> = {}) => ({
  submissionId: randomUUID(),
  honeypot: '',
  answers: { ...ANSWERS, ...over },
})

let dir: string
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qs-api-'))
  process.env.QUICKSTART_DATA_DIR = dir
  delete process.env.BLOB_READ_WRITE_TOKEN
  delete process.env.VERCEL_ENV
  delete process.env.QUICKSTART_TEST_MODE
  delete process.env.VERCEL
  effectsMock.syncThrows = false
  effectsMock.live = false
  effectsMock.notify.mockClear()
  __resetForTests()
})
afterEach(() => {
  delete process.env.VERCEL
  vi.restoreAllMocks()
  delete process.env.QUICKSTART_DATA_DIR
  fs.rmSync(dir, { recursive: true, force: true })
})

describe('POST /api/quickstart/qualify', () => {
  it('valid body -> 200 with outcome, projectId, package; stores a test-mode project', async () => {
    const res = await POST(req(valid()))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.outcome).toBe('quickstart')
    expect(json.package.id).toBe('quickstart')
    const p = await getStore().get(json.projectId)
    expect(p).not.toBeNull()
    expect(p!.test_mode).toBe(true)
    expect(p!.contact.email).toBe('jane@example.com')
    expect(p!.qualification.candidate).toBe('quickstart')
    expect(p!.qualification.approval_status).toBe('pending')
    expect(p!.qualification.approved_package).toBeNull()
    expect(p!.qualification.scope_version).toBe('pilot-v1')
    expect(p!.onboarding.status).toBe('not_sent')
    expect(p!.blueprint).toBeNull()
  })

  it('never exposes reason codes or explanation; no package for review/bespoke', async () => {
    const res = await POST(req(valid({ users_now: 'not_sure' })))
    const text = await res.text()
    const json = JSON.parse(text)
    expect(json.outcome).toBe('review')
    expect(json.package).toBeUndefined()
    expect(text).not.toMatch(/reason|explanation|UNKNOWN_/i)
    const p = await getStore().get(json.projectId)
    expect(p!.qualification.reason_codes).toContain('UNKNOWN_USERS_NOW')
  })

  it('same submissionId twice -> same projectId, one stored project', async () => {
    const body = valid()
    const a = await (await POST(req(body))).json()
    const b = await (await POST(req(body))).json()
    expect(b.projectId).toBe(a.projectId)
    expect(await getStore().list()).toHaveLength(1)
  })

  it('simultaneous identical submits share one execution', async () => {
    const body = valid()
    const [a, b] = await Promise.all([POST(req(body)), POST(req(body))])
    const [ja, jb] = [await a.json(), await b.json()]
    expect(ja.projectId).toBe(jb.projectId)
    expect(await getStore().list()).toHaveLength(1)
  })

  it('honeypot filled -> 200 review, nothing stored', async () => {
    const res = await POST(req({ ...valid(), honeypot: 'gotcha' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, outcome: 'review' })
    expect(await getStore().list()).toHaveLength(0)
  })

  it('invalid answers -> 400 with fieldErrors', async () => {
    const res = await POST(req(valid({ users_now: 'lots' })))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.ok).toBe(false)
    expect(json.error).toBe('invalid_body')
    expect(json.fieldErrors).toBeTruthy()
    expect(await getStore().list()).toHaveLength(0)
  })

  it('invalid email -> fieldErrors keyed by field, not by "answers"', async () => {
    const res = await POST(req(valid({ email: 'not-an-email' })))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.fieldErrors.email).toBeDefined()
    expect(json.fieldErrors.answers).toBeUndefined()
  })

  it('store not configured on Vercel in live mode -> 500 store_failed and staff emailed the lead', async () => {
    process.env.VERCEL = '1'
    effectsMock.live = true
    const res = await POST(req(valid()))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toBe('store_failed')
    expect(effectsMock.notify).toHaveBeenCalledTimes(1)
    const [subject, text] = effectsMock.notify.mock.calls[0]
    expect(subject).toContain('STORE FAILED')
    expect(text).toContain('lead not saved')
    expect(text).toContain('jane@example.com')
    expect(text).toContain('Acme Ltd')
    expect(text).toContain('quickstart')
    expect(text).toContain('"users_now": "1_5"')
    expect(text).toContain('QuickStart storage not configured')
  })

  it('store write failing in live mode -> staff emailed; in test mode -> no email', async () => {
    const file = path.join(dir, 'not-a-dir')
    fs.writeFileSync(file, 'x')
    process.env.QUICKSTART_DATA_DIR = file // ENOTDIR on every access
    effectsMock.live = false
    expect((await POST(req(valid()))).status).toBe(500)
    expect(effectsMock.notify).not.toHaveBeenCalled()
    effectsMock.live = true
    expect((await POST(req(valid()))).status).toBe(500)
    expect(effectsMock.notify).toHaveBeenCalledTimes(1)
  })

  it('malformed JSON -> 400', async () => {
    const res = await POST(req('{nope'))
    expect(res.status).toBe(400)
  })

  it('hidden answers are pruned before routing/storage', async () => {
    // migration=no hides records/data_types/clean_export; records=5001_plus would be bespoke if kept
    const res = await POST(req(valid({ records: '5001_plus', clean_export: 'no', data_types: ['historical_deals'] })))
    const json = await res.json()
    expect(json.outcome).toBe('quickstart')
    const p = await getStore().get(json.projectId)
    expect(p!.qualification.answers).not.toHaveProperty('records')
    expect(p!.qualification.answers).not.toHaveProperty('clean_export')
  })

  it('sync throwing -> still 200, project has sync.error', async () => {
    effectsMock.syncThrows = true
    const res = await POST(req(valid()))
    expect(res.status).toBe(200)
    const json = await res.json()
    const p = await getStore().get(json.projectId)
    expect(p!.sync.error).toContain('pipedrive boom')
  })

  it('real effects in test mode make no network calls', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const res = await POST(req(valid()))
    expect(res.status).toBe(200)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('rate limits after 10 requests/min/IP', async () => {
    const ip = '203.0.113.9'
    let last = 0
    for (let i = 0; i < 11; i++) last = (await POST(req({ bad: 1 }, ip))).status
    expect(last).toBe(429)
  })
})

describe('isLive matrix', () => {
  const env = { ...process.env }
  afterEach(() => {
    process.env = { ...env }
  })
  const cases: Array<[string | undefined, string | undefined, boolean]> = [
    ['production', undefined, true],
    ['production', '1', false],
    ['preview', undefined, false],
    ['preview', '1', false],
    [undefined, undefined, false],
    [undefined, '1', false],
  ]
  it.each(cases)('VERCEL_ENV=%s QUICKSTART_TEST_MODE=%s -> %s', async (vercelEnv, testMode, expected) => {
    if (vercelEnv === undefined) delete process.env.VERCEL_ENV
    else process.env.VERCEL_ENV = vercelEnv
    if (testMode === undefined) delete process.env.QUICKSTART_TEST_MODE
    else process.env.QUICKSTART_TEST_MODE = testMode
    const real = await vi.importActual<typeof import('@/lib/quickstart/effects')>('@/lib/quickstart/effects')
    expect(real.isLive()).toBe(expected)
  })
})
