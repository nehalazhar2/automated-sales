import { describe, it, expect } from 'vitest'
import { issueToken, hashToken, isTokenExpired, isWellFormedToken } from '../tokens'

describe('tokens', () => {
  it('issues well-formed unique tokens with a stable hash', () => {
    const a = issueToken()
    const b = issueToken()
    expect(a.token).not.toBe(b.token)
    expect(isWellFormedToken(a.token)).toBe(true)
    expect(a.token).toHaveLength(43)
    expect(hashToken(a.token)).toBe(a.hash)
    expect(hashToken(a.token)).toBe(hashToken(a.token))
    expect(a.hash).toMatch(/^[0-9a-f]{64}$/)
  })
  it('expires 30 days after issue', () => {
    const now = new Date('2026-01-01T00:00:00Z')
    const t = issueToken(now)
    expect(t.expiresAt).toBe('2026-01-31T00:00:00.000Z')
    expect(isTokenExpired(t.expiresAt, new Date('2026-01-30T23:59:59Z'))).toBe(false)
    expect(isTokenExpired(t.expiresAt, new Date('2026-01-31T00:00:01Z'))).toBe(true)
    expect(isTokenExpired(null)).toBe(true)
  })
  it('rejects malformed tokens', () => {
    for (const t of ['', 'abc', 'a'.repeat(42), 'a'.repeat(44), '!'.repeat(43), '../../etc/passwd', undefined]) {
      expect(isWellFormedToken(t)).toBe(false)
    }
  })
})
