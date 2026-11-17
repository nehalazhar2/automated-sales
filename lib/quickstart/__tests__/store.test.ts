import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { getStore } from '../store'
import type { Project } from '../types'

function makeProject(over: Partial<Project> & { id: string; created_at: string }): Project {
  return {
    schema_version: '1.0',
    project_id: over.id,
    created_at: over.created_at,
    updated_at: over.created_at,
    test_mode: true,
    contact: { name: 'A', email: 'a@b.co', company: 'Co' },
    qualification: {
      answers: {},
      candidate: 'quickstart',
      reason_codes: ['FITS_QUICKSTART'],
      explanation: [],
      scope_version: 'pilot-v1',
      submission_id: `sub-${over.id}`,
      approved_package: null,
      approval_status: 'pending',
      override_rationale: null,
    },
    onboarding: {
      token_hash: over.onboarding?.token_hash ?? null,
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
}

let dir: string
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qs-store-'))
  process.env.QUICKSTART_DATA_DIR = dir
  delete process.env.BLOB_READ_WRITE_TOKEN
})
afterEach(() => {
  delete process.env.QUICKSTART_DATA_DIR
  fs.rmSync(dir, { recursive: true, force: true })
})

describe('file store', () => {
  it('put/get roundtrip and returns null for missing', async () => {
    const s = getStore()
    const p = makeProject({ id: 'p1', created_at: '2026-01-01T00:00:00Z' })
    await s.put(p)
    expect(await s.get('p1')).toEqual(p)
    expect(await s.get('nope')).toBeNull()
    expect(fs.existsSync(path.join(dir, 'projects/p1.json'))).toBe(true)
  })

  it('lists newest first', async () => {
    const s = getStore()
    await s.put(makeProject({ id: 'old', created_at: '2026-01-01T00:00:00Z' }))
    await s.put(makeProject({ id: 'new', created_at: '2026-03-01T00:00:00Z' }))
    await s.put(makeProject({ id: 'mid', created_at: '2026-02-01T00:00:00Z' }))
    expect((await s.list()).map((p) => p.project_id)).toEqual(['new', 'mid', 'old'])
  })

  it('list on empty store is empty', async () => {
    expect(await getStore().list()).toEqual([])
  })

  it('index lookups by submission id and token hash', async () => {
    const s = getStore()
    const p = makeProject({ id: 'p1', created_at: '2026-01-01T00:00:00Z' })
    p.onboarding.token_hash = 'abc123'
    await s.put(p)
    expect((await s.findBySubmissionId('sub-p1'))?.project_id).toBe('p1')
    expect((await s.findByTokenHash('abc123'))?.project_id).toBe('p1')
    expect(await s.findBySubmissionId('x')).toBeNull()
    expect(await s.findByTokenHash('x')).toBeNull()
  })

  it('token index is created when hash is added on a later put; stale one removed', async () => {
    const s = getStore()
    const p = makeProject({ id: 'p1', created_at: '2026-01-01T00:00:00Z' })
    await s.put(p)
    expect(await s.findByTokenHash('h1')).toBeNull()
    p.onboarding.token_hash = 'h1'
    await s.put(p)
    expect((await s.findByTokenHash('h1'))?.project_id).toBe('p1')
    p.onboarding.token_hash = 'h2'
    await s.put(p)
    expect(await s.findByTokenHash('h1')).toBeNull()
    expect((await s.findByTokenHash('h2'))?.project_id).toBe('p1')
  })

  it('leaves no tmp files behind', async () => {
    const s = getStore()
    await s.put(makeProject({ id: 'p1', created_at: '2026-01-01T00:00:00Z' }))
    const files = fs.readdirSync(path.join(dir, 'projects'))
    expect(files).toEqual(['p1.json'])
  })

  it('rejects unsafe ids/keys', async () => {
    const s = getStore()
    expect(await s.get('../etc/passwd')).toBeNull()
    expect(await s.findBySubmissionId('../x')).toBeNull()
  })
})

describe('getStore configuration', () => {
  const env = { ...process.env }
  afterEach(() => {
    process.env = { ...env }
  })

  it('throws on Vercel without BLOB_READ_WRITE_TOKEN', () => {
    delete process.env.BLOB_READ_WRITE_TOKEN
    process.env.VERCEL = '1'
    expect(() => getStore()).toThrow('QuickStart storage not configured: set BLOB_READ_WRITE_TOKEN')
  })

  it('throws on Vercel preview and production without a token', () => {
    delete process.env.BLOB_READ_WRITE_TOKEN
    process.env.VERCEL = '1'
    for (const env of ['preview', 'production']) {
      process.env.VERCEL_ENV = env
      expect(() => getStore()).toThrow('QuickStart storage not configured')
    }
  })

  it('allows the file store under `vercel dev` (VERCEL_ENV=development)', () => {
    delete process.env.BLOB_READ_WRITE_TOKEN
    process.env.VERCEL = '1'
    process.env.VERCEL_ENV = 'development'
    expect(() => getStore()).not.toThrow()
  })

  it('uses local files when not on Vercel and no token', () => {
    delete process.env.BLOB_READ_WRITE_TOKEN
    delete process.env.VERCEL
    expect(() => getStore()).not.toThrow()
  })
})
