import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { approveProject } from '../admin'
import { submitOnboarding } from '../onboarding/handlers'
import { getStore } from '../store'
import type { Project } from '../types'

const ENV_KEYS = [
  'QUICKSTART_DATA_DIR', 'VERCEL', 'VERCEL_ENV', 'QUICKSTART_TEST_MODE', 'PIPEDRIVE_DOMAIN',
  'PIPEDRIVE_API_TOKEN', 'QUICKSTART_PIPEDRIVE_PIPELINE_ID', 'QUICKSTART_PIPEDRIVE_STAGE_SENT_ID',
  'QUICKSTART_PIPEDRIVE_STAGE_RECEIVED_ID',
] as const
let saved: Record<string, string | undefined>
let dir: string

type Call = { url: string; method: string; body: any }
let calls: Call[]
let failOn: ((c: Call) => boolean) | null

function installFetch() {
  calls = []
  failOn = null
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit = {}) => {
    const c: Call = {
      url: String(url).replace('https://acme.pipedrive.com', ''),
      method: init.method ?? 'GET',
      body: init.body ? JSON.parse(String(init.body)) : undefined,
    }
    calls.push(c)
    if (failOn?.(c)) return new Response('boom', { status: 500 })
    let data: unknown = { id: 1 }
    if (c.url === '/api/v2/deals' && c.method === 'POST') data = { id: 555 }
    if (c.url.startsWith('/api/v2/persons/search')) data = { items: [{ item: { id: 42 } }] }
    return new Response(JSON.stringify({ success: true, data }), { status: 200 })
  }))
}

beforeEach(() => {
  saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]))
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qs-deals-'))
  delete process.env.VERCEL
  delete process.env.QUICKSTART_TEST_MODE
  delete process.env.QUICKSTART_PIPEDRIVE_PIPELINE_ID
  delete process.env.QUICKSTART_PIPEDRIVE_STAGE_SENT_ID
  delete process.env.QUICKSTART_PIPEDRIVE_STAGE_RECEIVED_ID
  process.env.QUICKSTART_DATA_DIR = dir
  process.env.VERCEL_ENV = 'production'
  process.env.PIPEDRIVE_DOMAIN = 'acme'
  process.env.PIPEDRIVE_API_TOKEN = 'tok'
  installFetch()
})
afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k]
    else process.env[k] = saved[k]
  }
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  fs.rmSync(dir, { recursive: true, force: true })
})

async function seed(sync: Project['sync'] = { pipedrive_person_id: 7, pipedrive_lead_id: 'lead-1' }) {
  const now = new Date().toISOString()
  const p: Project = {
    schema_version: '1.0', project_id: randomUUID(), created_at: now, updated_at: now, test_mode: false,
    contact: { name: 'Jane', email: 'jane@acme.co', company: 'Acme <b>Ltd</b>' },
    qualification: {
      answers: {}, candidate: 'quickstart', reason_codes: [], explanation: [], scope_version: 'pilot-v1',
      submission_id: randomUUID(), approved_package: null, approval_status: 'pending', override_rationale: null,
    },
    onboarding: { token_hash: null, token_expires_at: null, status: 'not_sent', answers: {}, scope_exceptions: [], versions: [] },
    sync, approvals: [], blueprint: null,
  }
  await getStore().put(p)
  return p
}
const tokenOf = (link: string) => link.split('/onboarding/')[1].replace(/\/$/, '')
const stored = async (id: string) => (await getStore().get(id))!

describe('approval -> deal', () => {
  it('creates a deal, archives the lead, adds a note, stores id/url', async () => {
    const p = await seed()
    const r = await approveProject(p.project_id, 'quickstart', null)
    expect(r.ok).toBe(true)
    const deal = calls.find((c) => c.url === '/api/v2/deals' && c.method === 'POST')!
    expect(deal.body).toEqual({ title: 'QuickStart · Acme <b>Ltd</b>', value: 995, currency: 'GBP', person_id: 7 })
    const arch = calls.find((c) => c.url === '/api/v1/leads/lead-1')!
    expect(arch.method).toBe('PATCH')
    expect(arch.body).toEqual({ is_archived: true })
    const note = calls.find((c) => c.url === '/api/v1/notes')!
    expect(note.body.deal_id).toBe(555)
    expect(note.body.content).toContain('Approved package')
    expect(note.body.content).not.toContain('<b>Ltd')
    const s = (await stored(p.project_id)).sync
    expect(s.pipedrive_deal_id).toBe(555)
    expect(s.pipedrive_deal_url).toBe('https://acme.pipedrive.com/deal/555')
    expect(s.error).toBeUndefined()
  })

  it('uses plus price and pipeline/stage env when set; omits when unset', async () => {
    process.env.QUICKSTART_PIPEDRIVE_PIPELINE_ID = '3'
    process.env.QUICKSTART_PIPEDRIVE_STAGE_SENT_ID = '12'
    const p = await seed()
    await approveProject(p.project_id, 'plus', 'Customer needs more users than the base package.')
    const deal = calls.find((c) => c.url === '/api/v2/deals')!
    expect(deal.body).toMatchObject({ value: 1995, currency: 'GBP', pipeline_id: 3, stage_id: 12 })
  })

  it('ignores non-positive-integer env values', async () => {
    process.env.QUICKSTART_PIPEDRIVE_PIPELINE_ID = 'abc'
    process.env.QUICKSTART_PIPEDRIVE_STAGE_SENT_ID = '-2'
    const p = await seed()
    await approveProject(p.project_id, 'quickstart', null)
    const deal = calls.find((c) => c.url === '/api/v2/deals')!
    expect(deal.body).not.toHaveProperty('pipeline_id')
    expect(deal.body).not.toHaveProperty('stage_id')
  })

  it('finds person by email when none synced', async () => {
    const p = await seed({})
    await approveProject(p.project_id, 'quickstart', null)
    expect(calls[0].url).toContain('/api/v2/persons/search')
    expect(calls.find((c) => c.url === '/api/v2/deals')!.body.person_id).toBe(42)
    expect(calls.some((c) => c.url.startsWith('/api/v1/leads'))).toBe(false)
  })

  it('re-approve with a deal patches it and never creates a second', async () => {
    const p = await seed({ pipedrive_person_id: 7, pipedrive_deal_id: 555 })
    await approveProject(p.project_id, 'plus', 'Upgrade agreed on the phone call.')
    expect(calls.some((c) => c.url === '/api/v2/deals' && c.method === 'POST')).toBe(false)
    const up = calls.find((c) => c.url === '/api/v2/deals/555')!
    expect(up.method).toBe('PATCH')
    expect(up.body.value).toBe(1995)
    const note = calls.find((c) => c.url === '/api/v1/notes')!
    expect(note.body.content).toContain('Package changed')
  })

  it('test mode makes no network call', async () => {
    process.env.VERCEL_ENV = 'preview'
    const p = await seed()
    const r = await approveProject(p.project_id, 'quickstart', null)
    expect(r.ok).toBe(true)
    expect(calls).toHaveLength(0)
  })

  it('Pipedrive 500 does not fail approval; error recorded and appended', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    failOn = (c) => c.url === '/api/v2/deals'
    const p = await seed({ pipedrive_person_id: 7, error: 'earlier' })
    const r = await approveProject(p.project_id, 'quickstart', null)
    expect(r.ok).toBe(true)
    const s = (await stored(p.project_id)).sync
    expect(s.pipedrive_deal_id).toBeUndefined()
    expect(s.error).toMatch(/^earlier; .*500/)
  })
})

const ANSWERS = {
  business_description: 'We sell <script>x</script> widgets',
  primary_admin_name: 'Jane Doe',
  primary_admin_email: 'jane@acme.co',
  currency: 'not_sure',
  lead_channels: 'not_sure',
  pipelines: [{ name: 'Sales <i>', stages: ['New', 'Won'] }],
  won_criteria: 'not_sure',
  customer_fields: 'not_sure',
  team_users: [{ name: 'Bob', email: 'bob@acme.co', role: 'admin' }],
  automation_recipes: 'not_sure',
  reporting_needs: 'not_sure',
  bringing_data: 'no',
}
async function submit(token: string, answers: Record<string, unknown> = ANSWERS) {
  return submitOnboarding(
    new Request('http://localhost/api/quickstart/onboarding/x/submit', {
      method: 'POST',
      body: JSON.stringify({ answers, baseSavedAt: null }),
    }),
    token,
  )
}

describe('onboarding submit -> deal note', () => {
  it('adds an escaped note with not-sure list; no stage move without env', async () => {
    const p = await seed({ pipedrive_person_id: 7, pipedrive_deal_id: 555 })
    const r = await approveProject(p.project_id, 'quickstart', null)
    if (!r.ok) throw new Error('approve')
    calls.length = 0
    const res = await submit(tokenOf(r.link))
    const j = await res.json()
    expect(j.ok, JSON.stringify(j)).toBe(true)
    const note = calls.find((c) => c.url === '/api/v1/notes')!
    expect(note.body.deal_id).toBe(555)
    expect(note.body.content).toContain('&lt;script&gt;')
    expect(note.body.content).not.toContain('<script>')
    expect(note.body.content).toContain('What does your business do?')
    expect(note.body.content).toContain('To cover on the discovery call')
    expect(note.body.content).toContain('Which currency do you sell in?')
    expect(note.body.content).toContain('Sales &lt;i&gt;: New → Won')
    expect(note.body.content).toContain('Bob &lt;bob@acme.co&gt;')
    expect(calls.some((c) => c.method === 'PATCH')).toBe(false)
  })

  it('moves the stage when RECEIVED env is set', async () => {
    process.env.QUICKSTART_PIPEDRIVE_STAGE_RECEIVED_ID = '14'
    const p = await seed({ pipedrive_person_id: 7, pipedrive_deal_id: 555 })
    const r = await approveProject(p.project_id, 'quickstart', null)
    if (!r.ok) throw new Error('approve')
    calls.length = 0
    await submit(tokenOf(r.link))
    const up = calls.find((c) => c.url === '/api/v2/deals/555')!
    expect(up.method).toBe('PATCH')
    expect(up.body).toEqual({ stage_id: 14 })
  })

  it('without a deal id makes no Pipedrive call and records no error', async () => {
    const p = await seed()
    // approval creates a deal; remove it to simulate failed creation
    const r = await approveProject(p.project_id, 'quickstart', null)
    if (!r.ok) throw new Error('approve')
    const cur = await stored(p.project_id)
    delete cur.sync.pipedrive_deal_id
    delete cur.sync.pipedrive_deal_url
    await getStore().put(cur)
    calls.length = 0
    const res = await submit(tokenOf(r.link))
    expect((await res.json()).ok).toBe(true)
    expect(calls).toHaveLength(0)
    expect((await stored(p.project_id)).sync.error).toBeUndefined()
  })

  it('Pipedrive failure on submit does not fail it', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const p = await seed({ pipedrive_person_id: 7, pipedrive_deal_id: 555 })
    const r = await approveProject(p.project_id, 'quickstart', null)
    if (!r.ok) throw new Error('approve')
    failOn = (c) => c.url === '/api/v1/notes'
    const res = await submit(tokenOf(r.link))
    expect((await res.json()).ok).toBe(true)
    expect((await stored(p.project_id)).sync.error).toMatch(/500/)
  })
})
