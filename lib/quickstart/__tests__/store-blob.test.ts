import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const blob = vi.hoisted(() => ({
  files: new Map<string, string>(),
}))

vi.mock('@vercel/blob', () => ({
  put: vi.fn(async (pathname: string, body: string) => {
    blob.files.set(pathname, body)
  }),
  get: vi.fn(async (pathname: string) => {
    const v = blob.files.get(pathname)
    if (v === undefined) return null
    return { statusCode: 200, stream: new Response(v).body }
  }),
  del: vi.fn(async (pathname: string) => {
    blob.files.delete(pathname)
  }),
  list: vi.fn(async ({ prefix }: { prefix: string }) => ({
    blobs: [...blob.files.keys()].filter((k) => k.startsWith(prefix)).map((pathname) => ({ pathname })),
    hasMore: false,
    cursor: undefined,
  })),
}))

import { getStore } from '../store'
import type { Project } from '../types'

const project = (id: string): Project => ({
  schema_version: '1.0',
  project_id: id,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  test_mode: true,
  contact: { name: 'A', email: 'a@b.co', company: 'Co' },
  qualification: {
    answers: {},
    candidate: 'quickstart',
    reason_codes: [],
    explanation: [],
    scope_version: 'pilot-v1',
    submission_id: `sub-${id}`,
    approved_package: null,
    approval_status: 'pending',
    override_rationale: null,
  },
  onboarding: {
    token_hash: 'abc123',
    token_expires_at: null,
    status: 'not_sent',
    answers: {},
    scope_exceptions: [],
    versions: [],
  },
  sync: {},
  approvals: [],
  blueprint: null,
})

describe('Blob driver namespacing', () => {
  const env = { ...process.env }
  beforeEach(() => {
    blob.files.clear()
    process.env.BLOB_READ_WRITE_TOKEN = 'tok'
  })
  afterEach(() => {
    process.env = { ...env }
  })

  it('prefixes every pathname with VERCEL_ENV and round-trips through the store', async () => {
    process.env.VERCEL_ENV = 'production'
    const store = getStore()
    await store.put(project('p1'))
    expect([...blob.files.keys()].sort()).toEqual([
      'production/idx/submission/sub-p1',
      'production/idx/token/abc123',
      'production/projects/p1.json',
    ])
    expect((await store.get('p1'))?.project_id).toBe('p1')
    expect((await store.findByTokenHash('abc123'))?.project_id).toBe('p1')
    expect((await store.list()).map((p) => p.project_id)).toEqual(['p1'])
  })

  it('uses "local" when VERCEL_ENV is unset and keeps environments apart', async () => {
    delete process.env.VERCEL_ENV
    await getStore().put(project('p2'))
    expect(blob.files.has('local/projects/p2.json')).toBe(true)
    process.env.VERCEL_ENV = 'preview'
    expect(await getStore().get('p2')).toBeNull()
  })
})
