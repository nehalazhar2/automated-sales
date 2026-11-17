import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('@/lib/pipedrive/client', () => ({
  findPersonByEmail: vi.fn(async () => 42),
  countOpenDealsForPerson: vi.fn(async () => 0),
  createPerson: vi.fn(async () => 1),
  createLead: vi.fn(async () => ({ id: 'lead-1', url: 'https://acme.pipedrive.com/leads/inbox/lead-1' })),
  createNote: vi.fn(async () => undefined),
}))

import { syncQualificationToPipedrive } from '../effects'
import type { Project } from '../types'

const project = {
  project_id: 'p1',
  contact: { name: 'A', email: 'a@b.co', company: 'Co' },
  qualification: {
    answers: {}, candidate: 'quickstart', reason_codes: [], explanation: [], scope_version: 'pilot-v1',
  },
  sync: {},
} as unknown as Project

describe('syncQualificationToPipedrive', () => {
  const env = { ...process.env }
  beforeEach(() => {
    process.env.VERCEL_ENV = 'production'
    delete process.env.QUICKSTART_TEST_MODE
  })
  afterEach(() => {
    process.env = { ...env }
  })

  it('returns the lead url from createLead (no hard-coded host)', async () => {
    expect(await syncQualificationToPipedrive(project)).toEqual({
      pipedrive_person_id: 42,
      pipedrive_lead_id: 'lead-1',
      pipedrive_lead_url: 'https://acme.pipedrive.com/leads/inbox/lead-1',
    })
  })

  it('returns nothing in test mode', async () => {
    process.env.QUICKSTART_TEST_MODE = '1'
    expect(await syncQualificationToPipedrive(project)).toEqual({})
  })
})
