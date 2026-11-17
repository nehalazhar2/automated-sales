import 'server-only'
import { SITE_URL } from '@/lib/site'
import { getStore } from './store'
import { issueToken } from './tokens'
import type { PackageId } from './packages'
import type { Project } from './types'

export type LinkResult = { ok: true; link: string } | { ok: false; error: string }

const MIN_RATIONALE = 10

const linkFor = (token: string) => `${SITE_URL}/pipedrive-quickstart/onboarding/${token}/`

export async function approveProject(
  id: string,
  pkg: PackageId,
  rationale: string | null,
  by = 'staff',
  now = new Date(),
): Promise<LinkResult> {
  if (pkg !== 'quickstart' && pkg !== 'plus') return { ok: false, error: 'Choose a package.' }
  const store = getStore()
  const p = await store.get(id)
  if (!p) return { ok: false, error: 'Project not found.' }
  if (p.onboarding.status === 'submitted') return { ok: false, error: 'already_submitted' }

  const candidate: string = p.qualification.candidate
  const needed = pkg !== candidate || ['review', 'bespoke'].includes(candidate)
  const why = (rationale ?? '').trim()
  if (needed && why.length < MIN_RATIONALE) {
    return { ok: false, error: `A rationale of at least ${MIN_RATIONALE} characters is required for this approval.` }
  }

  const t = issueToken(now)
  const at = now.toISOString()
  p.qualification.approved_package = pkg
  p.qualification.approval_status = 'approved'
  p.qualification.override_rationale = needed ? why : null
  p.onboarding.token_hash = t.hash
  p.onboarding.token_expires_at = t.expiresAt
  p.approvals.push({
    at, by, action: 'approve',
    detail: `pkg=${pkg}; candidate=${candidate}; rationale=${needed ? why : ''}`,
  })
  p.updated_at = at
  await store.put(p)
  return { ok: true, link: linkFor(t.token) }
}

export async function regenerateLink(id: string, by = 'staff', now = new Date()): Promise<LinkResult> {
  const store = getStore()
  const p = await store.get(id)
  if (!p) return { ok: false, error: 'Project not found.' }
  if (p.qualification.approval_status !== 'approved' || !p.qualification.approved_package) {
    return { ok: false, error: 'Project is not approved.' }
  }
  if (p.onboarding.status === 'submitted') return { ok: false, error: 'already_submitted' }
  const t = issueToken(now)
  const at = now.toISOString()
  p.onboarding.token_hash = t.hash
  p.onboarding.token_expires_at = t.expiresAt
  p.approvals.push({ at, by, action: 'regenerate_link', detail: `pkg=${p.qualification.approved_package}` })
  p.updated_at = at
  await store.put(p)
  return { ok: true, link: linkFor(t.token) }
}

/** Project for download: the token hash is never exported. */
export async function exportProject(id: string): Promise<Project | null> {
  const p = await getStore().get(id)
  if (!p) return null
  const { token_hash: _omit, ...onboarding } = p.onboarding
  void _omit
  return { ...p, onboarding: onboarding as Project['onboarding'] }
}
