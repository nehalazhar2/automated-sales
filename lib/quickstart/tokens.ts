import { randomBytes, createHash } from 'node:crypto'

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function issueToken(now: Date = new Date()): { token: string; hash: string; expiresAt: string } {
  const token = randomBytes(32).toString('base64url')
  return { token, hash: hashToken(token), expiresAt: new Date(now.getTime() + TOKEN_TTL_MS).toISOString() }
}

export function isTokenExpired(expiresAt: string | null | undefined, now: Date = new Date()): boolean {
  if (!expiresAt) return true
  const t = Date.parse(expiresAt)
  return Number.isNaN(t) || t <= now.getTime()
}

/** 32 bytes -> 43 base64url chars. Check before touching the store. */
export function isWellFormedToken(t: unknown): t is string {
  return typeof t === 'string' && /^[A-Za-z0-9_-]{43}$/.test(t)
}
