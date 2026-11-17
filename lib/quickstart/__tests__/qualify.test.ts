import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { handleQualify, __resetForTests } from '../qualify'

const valid = {
  name: 'Test User', email: 't@example.com', company: 'Acme', website: '', referral: 'direct',
  current_system: 'spreadsheet', pipedrive_status: 'not_started', users_now: '1_5', users_future: '1_5',
  teams: 'one', sales_processes: 'one', process_agreed: 'yes', complexity: 'no', migration: 'no',
  workflows: 'none', connections: ['none'], permissions: 'standard', reporting: 'standard', deadline: 'flexible',
}

const post = (body: unknown) =>
  handleQualify(new Request('http://x/api/quickstart/qualify/', { method: 'POST', body: JSON.stringify(body) }))

describe('handleQualify fieldErrors', () => {
  beforeEach(() => {
    __resetForTests()
    process.env.QUICKSTART_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'qs-'))
  })

  it('keys invalid answers by field name', async () => {
    const res = await post({
      submissionId: '3f1c1c0e-6a53-4f0a-9d2b-1a2b3c4d5e6f',
      honeypot: '',
      answers: { ...valid, email: 'not-an-email' },
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.fieldErrors.email).toBeDefined()
    expect(body.fieldErrors.answers).toBeUndefined()
  })
})
