import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { approveProject, regenerateLink, exportProject } from '../admin'
import { isAdminCookie, adminCookieValue, checkAdminPassword } from '../adminAuth'
import { loadOnboarding } from '../onboarding/handlers'
import { getStore } from '../store'
import { hashToken } from '../tokens'
import { GET } from '@/app/api/quickstart/admin/project/[id]/route'
import type { Project } from '../types'

const KEY = 'k'.repeat(32)
let dir: string
let prevDir: string | undefined
let prevKey: string | undefined

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qs-admin-'))
  prevDir = process.env.QUICKSTART_DATA_DIR
  prevKey = process.env.QUICKSTART_ADMIN_KEY
  process.env.QUICKSTART_DATA_DIR = dir
  process.env.QUICKSTART_ADMIN_KEY = KEY
})
afterEach(() => {
  if (prevDir === undefined) delete process.env.QUICKSTART_DATA_DIR
  else process.env.QUICKSTART_DATA_DIR = prevDir
  if (prevKey === undefined) delete process.env.QUICKSTART_ADMIN_KEY
  else process.env.QUICKSTART_ADMIN_KEY = prevKey
  fs.rmSync(dir, { recursive: true, force: true })
})

async function seed(candidate: Project['qualification']['candidate'] = 'quickstart', status: Project['onboarding']['status'] = 'not_sent') {
  const now = new Date().toISOString()
  const p: Project = {
    schema_version: '1.0', project_id: randomUUID(), created_at: now, updated_at: now, test_mode: true,
    contact: { name: 'Jane', email: 'jane@acme.co', company: 'Acme' },
    qualification: {
      answers: {}, candidate, reason_codes: [], explanation: [], scope_version: 'pilot-v1',
      submission_id: randomUUID(), approved_package: null, approval_status: 'pending', override_rationale: null,
    },
    onboarding: { token_hash: null, token_expires_at: null, status, answers: {}, scope_exceptions: [], versions: [] },
    sync: {}, approvals: [], blueprint: null,
  }
  await getStore().put(p)
  return p
}
const tokenOf = (link: string) => link.split('/onboarding/')[1].replace(/\/$/, '')
const req = (cookie?: string) =>
  new Request('http://localhost/api/quickstart/admin/project/x/', { headers: cookie ? { cookie } : {} })
const ctx = (id: string) => ({ params: Promise.resolve({ id }) })

describe('adminAuth', () => {
  it('accepts the signed cookie only', () => {
    expect(isAdminCookie(adminCookieValue())).toBe(true)
    expect(isAdminCookie('nope')).toBe(false)
    expect(isAdminCookie(undefined)).toBe(false)
  })
  it('false when key unset or short', () => {
    const v = adminCookieValue()
    delete process.env.QUICKSTART_ADMIN_KEY
    expect(isAdminCookie(v)).toBe(false)
    expect(checkAdminPassword('anything')).toBe(false)
    process.env.QUICKSTART_ADMIN_KEY = 'short'
    expect(isAdminCookie(v)).toBe(false)
    expect(checkAdminPassword('short')).toBe(false)
  })
  it('checks the password', () => {
    expect(checkAdminPassword(KEY)).toBe(true)
    expect(checkAdminPassword(KEY + 'x')).toBe(false)
  })
})

describe('approveProject', () => {
  it('errors for missing project', async () => {
    const r = await approveProject('nope', 'quickstart', null)
    expect(r.ok).toBe(false)
  })
  it('approves matching candidate without rationale; link resolves', async () => {
    const p = await seed('quickstart')
    const r = await approveProject(p.project_id, 'quickstart', null)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const s = (await getStore().get(p.project_id))!
    expect(s.qualification.approved_package).toBe('quickstart')
    expect(s.qualification.approval_status).toBe('approved')
    expect(s.qualification.override_rationale).toBeNull()
    expect(s.onboarding.token_hash).toBe(hashToken(tokenOf(r.link)))
    expect(s.onboarding.token_expires_at).toBeTruthy()
    expect(s.approvals).toHaveLength(1)
    expect(s.approvals[0]).toMatchObject({ by: 'staff', action: 'approve' })
    expect(s.approvals[0].detail).toContain('pkg=quickstart')
    expect(JSON.stringify(s)).not.toContain(tokenOf(r.link))
    expect(r.link).toMatch(/\/pipedrive-quickstart\/onboarding\/[A-Za-z0-9_-]{43}\/$/)
    expect(await loadOnboarding(tokenOf(r.link))).not.toBeNull()
  })
  it('override requires rationale', async () => {
    const p = await seed('quickstart')
    expect((await approveProject(p.project_id, 'plus', null)).ok).toBe(false)
    expect((await approveProject(p.project_id, 'plus', '  short ')).ok).toBe(false)
    const r = await approveProject(p.project_id, 'plus', 'Customer needs extra pipelines')
    expect(r.ok).toBe(true)
    expect((await getStore().get(p.project_id))!.qualification.override_rationale).toBe('Customer needs extra pipelines')
  })
  it('review/bespoke candidates require rationale', async () => {
    for (const c of ['review', 'bespoke'] as const) {
      const p = await seed(c)
      expect((await approveProject(p.project_id, 'quickstart', null)).ok).toBe(false)
      expect((await approveProject(p.project_id, 'quickstart', 'Reviewed manually, fits scope')).ok).toBe(true)
    }
  })
  it('re-approve kills the old link', async () => {
    const p = await seed('plus')
    const a = await approveProject(p.project_id, 'plus', null)
    const b = await approveProject(p.project_id, 'plus', null)
    if (!a.ok || !b.ok) throw new Error('expected ok')
    expect(await loadOnboarding(tokenOf(a.link))).toBeNull()
    expect(await loadOnboarding(tokenOf(b.link))).not.toBeNull()
    expect((await getStore().get(p.project_id))!.approvals).toHaveLength(2)
  })
  it('refuses after submitted', async () => {
    const p = await seed('quickstart', 'submitted')
    const r = await approveProject(p.project_id, 'quickstart', null)
    expect(r).toEqual({ ok: false, error: 'already_submitted' })
  })
})

describe('regenerateLink', () => {
  it('requires approved', async () => {
    const p = await seed('quickstart')
    expect((await regenerateLink(p.project_id)).ok).toBe(false)
  })
  it('refuses submitted', async () => {
    const p = await seed('quickstart')
    await approveProject(p.project_id, 'quickstart', null)
    const s = (await getStore().get(p.project_id))!
    s.onboarding.status = 'submitted'
    await getStore().put(s)
    expect(await regenerateLink(p.project_id)).toEqual({ ok: false, error: 'already_submitted' })
  })
  it('issues a new token and logs it', async () => {
    const p = await seed('quickstart')
    const a = await approveProject(p.project_id, 'quickstart', null)
    const b = await regenerateLink(p.project_id)
    if (!a.ok || !b.ok) throw new Error('expected ok')
    expect(await loadOnboarding(tokenOf(a.link))).toBeNull()
    expect(await loadOnboarding(tokenOf(b.link))).not.toBeNull()
    const s = (await getStore().get(p.project_id))!
    expect(s.approvals.map((x) => x.action)).toEqual(['approve', 'regenerate_link'])
  })
})

describe('exportProject + JSON route', () => {
  it('strips token_hash', async () => {
    const p = await seed('quickstart')
    await approveProject(p.project_id, 'quickstart', null)
    const out = (await exportProject(p.project_id))!
    expect(out.onboarding).not.toHaveProperty('token_hash')
    expect(await exportProject('missing')).toBeNull()
  })
  it('401 without or with bad cookie', async () => {
    const p = await seed()
    expect((await GET(req(), ctx(p.project_id))).status).toBe(401)
    expect((await GET(req('qs_admin=bad'), ctx(p.project_id))).status).toBe(401)
  })
  it('404 for missing, 200 attachment for good cookie', async () => {
    const p = await seed()
    await approveProject(p.project_id, 'quickstart', null)
    const c = `qs_admin=${adminCookieValue()}`
    expect((await GET(req(c), ctx('missing'))).status).toBe(404)
    const res = await GET(req(c), ctx(p.project_id))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-disposition')).toBe(`attachment; filename="quickstart-${p.project_id}.json"`)
    expect(res.headers.get('cache-control')).toBe('no-store')
    const text = await res.text()
    expect(text).not.toContain('token_hash')
    expect(JSON.parse(text).project_id).toBe(p.project_id)
  })
})
