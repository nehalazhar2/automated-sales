import 'server-only'
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export const ADMIN_COOKIE = 'qs_admin'
export const ADMIN_COOKIE_MAX_AGE = 12 * 60 * 60

function key(): string | null {
  const k = process.env.QUICKSTART_ADMIN_KEY
  return k && k.length >= 16 ? k : null
}

function safeEqual(a: string, b: string): boolean {
  // Compare fixed-length digests so the length of the secret never leaks.
  const x = createHash('sha256').update(a).digest()
  const y = createHash('sha256').update(b).digest()
  return timingSafeEqual(x, y)
}

/** HMAC of a fixed label under the admin key; the key itself never goes in the cookie. */
export function adminCookieValue(): string {
  const k = key()
  if (!k) throw new Error('QUICKSTART_ADMIN_KEY not configured')
  return createHmac('sha256', k).update('qs-admin-v1').digest('hex')
}

export function isAdminCookie(value?: string): boolean {
  if (!value || !key()) return false
  return safeEqual(value, adminCookieValue())
}

export function checkAdminPassword(input: string): boolean {
  const k = key()
  if (!k || typeof input !== 'string') return false
  return safeEqual(input, k)
}

export function adminCookieFromRequest(req: Request): string | undefined {
  const raw = req.headers.get('cookie') ?? ''
  for (const part of raw.split(';')) {
    const i = part.indexOf('=')
    if (i > 0 && part.slice(0, i).trim() === ADMIN_COOKIE) return part.slice(i + 1).trim()
  }
  return undefined
}
