'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, adminCookieValue, checkAdminPassword, isAdminCookie,
} from '@/lib/quickstart/adminAuth'
import { approveProject, regenerateLink } from '@/lib/quickstart/admin'

export type LoginState = { error?: string }
export type LinkState = { link?: string; error?: string }

const ADMIN_PATH = '/pipedrive-quickstart/admin/'

// Crude in-memory limiter: 5 failed attempts per 10 minutes per IP (per server instance).
const WINDOW_MS = 10 * 60 * 1000
const MAX_FAILS = 5
const fails = new Map<string, number[]>()

function recent(ip: string, now: number): number[] {
  const list = (fails.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (list.length) fails.set(ip, list)
  else fails.delete(ip)
  return list
}

async function clientIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
}

async function requireAdmin(): Promise<boolean> {
  return isAdminCookie((await cookies()).get(ADMIN_COOKIE)?.value)
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = await clientIp()
  const now = Date.now()
  if (recent(ip, now).length >= MAX_FAILS) return { error: 'Too many attempts. Try again later.' }
  const pw = formData.get('password')
  if (typeof pw !== 'string' || !checkAdminPassword(pw)) {
    fails.set(ip, [...recent(ip, now), now])
    return { error: 'Incorrect password.' }
  }
  fails.delete(ip)
  ;(await cookies()).set(ADMIN_COOKIE, adminCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE,
  })
  redirect(ADMIN_PATH)
}

export async function logout(): Promise<void> {
  ;(await cookies()).delete(ADMIN_COOKIE)
  redirect(ADMIN_PATH)
}

export async function approve(_prev: LinkState, formData: FormData): Promise<LinkState> {
  if (!(await requireAdmin())) return { error: 'Not authorised.' }
  const id = formData.get('id')
  const pkg = formData.get('package')
  const rationale = formData.get('rationale')
  if (typeof id !== 'string' || (pkg !== 'quickstart' && pkg !== 'plus')) return { error: 'Choose a package.' }
  const r = await approveProject(id, pkg, typeof rationale === 'string' ? rationale : null)
  revalidatePath(ADMIN_PATH)
  return r.ok ? { link: r.link } : { error: r.error }
}

export async function regenerate(_prev: LinkState, formData: FormData): Promise<LinkState> {
  if (!(await requireAdmin())) return { error: 'Not authorised.' }
  const id = formData.get('id')
  if (typeof id !== 'string') return { error: 'Missing project.' }
  const r = await regenerateLink(id)
  revalidatePath(ADMIN_PATH)
  return r.ok ? { link: r.link } : { error: r.error }
}
