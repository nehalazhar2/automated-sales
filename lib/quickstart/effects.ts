import 'server-only'
import { Resend } from 'resend'
import {
  findPersonByEmail,
  countOpenDealsForPerson,
  createPerson,
  createLead,
  createNote,
  createDeal,
  updateDeal,
  archiveLead,
} from '@/lib/pipedrive/client'
import { getStore } from './store'
import { QUESTIONS } from './qualification/questions'
import { SECTIONS, NOT_SURE, isFieldVisible, type OnbField, type UserRow, type PipelineRow } from './onboarding/sections'
import { PACKAGES, type PackageId } from './packages'
import { SITE_URL } from '@/lib/site'
import type { Project } from './types'

/** Live side effects only on production, unless explicitly forced into test mode. */
export function isLive(): boolean {
  return process.env.VERCEL_ENV === 'production' && process.env.QUICKSTART_TEST_MODE !== '1'
}

function skip(what: string) {
  console.log(`[quickstart] skipped (test mode): ${what}`)
}

export async function lookupExistingOpportunity(
  email: string
): Promise<{ personId: number | null; existingOpportunity: boolean }> {
  if (!isLive()) {
    skip(`lookupExistingOpportunity ${email}`)
    return { personId: null, existingOpportunity: false }
  }
  const personId = await findPersonByEmail(email)
  if (personId === null) return { personId: null, existingOpportunity: false }
  const open = await countOpenDealsForPerson(personId)
  return { personId, existingOpportunity: open > 0 }
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function labelFor(q: (typeof QUESTIONS)[number], v: unknown): string {
  const one = (x: unknown) => q.options?.find((o) => o.value === x)?.label ?? String(x)
  return Array.isArray(v) ? v.map(one).join(', ') : one(v)
}

export function buildQualificationNoteHtml(p: Project): string {
  const answers = p.qualification.answers
  const rows = QUESTIONS.filter((q) => {
    const v = answers[q.key]
    return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)
  }).map((q) => `<li><strong>${esc(q.label)}:</strong> ${esc(labelFor(q, answers[q.key]))}</li>`)
  return [
    '<h3>QuickStart qualification</h3>',
    `<p><strong>Outcome:</strong> ${esc(p.qualification.candidate)}</p>`,
    `<p><strong>Reason codes:</strong> ${esc(p.qualification.reason_codes.join(', '))}</p>`,
    `<ul>${p.qualification.explanation.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>`,
    '<h4>Answers</h4>',
    `<ul>${rows.join('')}</ul>`,
    `<p>Scope version: ${esc(p.qualification.scope_version)}<br>Project id: ${esc(p.project_id)}</p>`,
  ].join('\n')
}

export async function syncQualificationToPipedrive(p: Project): Promise<Project['sync']> {
  if (!isLive()) {
    skip(`syncQualificationToPipedrive ${p.project_id}`)
    return {}
  }
  let personId = p.sync.pipedrive_person_id
  if (!personId) {
    personId =
      (await findPersonByEmail(p.contact.email)) ??
      (await createPerson({ name: p.contact.name, email: p.contact.email }))
  }
  const lead = await createLead({
    title: `QuickStart · ${p.contact.company} · ${p.qualification.candidate}`,
    personId,
  })
  await createNote({ personId, leadId: lead.id, content: buildQualificationNoteHtml(p) })
  return { pipedrive_person_id: personId, pipedrive_lead_id: lead.id, pipedrive_lead_url: lead.url }
}

function envId(name: string): number | undefined {
  const v = process.env[name]
  if (!v || !/^\d+$/.test(v.trim())) return undefined
  const n = Number(v)
  return Number.isSafeInteger(n) && n > 0 ? n : undefined
}

const addError = (sync: Project['sync'], e: unknown): Project['sync'] => {
  const msg = e instanceof Error ? e.message : String(e)
  return { ...sync, error: sync.error ? `${sync.error}; ${msg}` : msg }
}

export function buildApprovalNoteHtml(p: Project, changed: boolean): string {
  const pkg = PACKAGES[p.qualification.approved_package!]
  const q = p.qualification
  const parts = changed
    ? [`<p><strong>Package changed to ${esc(pkg.name)}</strong> (£${pkg.priceGbp}) — new onboarding link issued.</p>`]
    : [
        '<h3>QuickStart approved</h3>',
        `<p><strong>Approved package:</strong> ${esc(pkg.name)} (£${pkg.priceGbp})</p>`,
      ]
  parts.push(`<p>Scope version: ${esc(q.scope_version)}</p>`)
  if (q.override_rationale) parts.push(`<p><strong>Override rationale:</strong> ${esc(q.override_rationale)}</p>`)
  const admin = `${SITE_URL}/pipedrive-quickstart/admin/`
  parts.push(`<p>Project ${esc(p.project_id)} — <a href="${esc(admin)}">QuickStart admin</a></p>`)
  return parts.join('\n')
}

/**
 * After approval: create (or update) the Pipedrive deal. Never throws; errors land in sync.error.
 * previousPackage = package approved before this call (null if first approval); when it equals the
 * current one and a deal exists, nothing is sent.
 */
export async function syncApprovalToPipedrive(
  p: Project,
  previousPackage: PackageId | null = null,
): Promise<Project['sync']> {
  if (!isLive()) {
    skip(`syncApprovalToPipedrive ${p.project_id}`)
    return p.sync
  }
  let sync: Project['sync'] = { ...p.sync }
  const approved = p.qualification.approved_package!
  const pkg = PACKAGES[approved]
  const title = `QuickStart · ${p.contact.company}`
  const failures: unknown[] = []
  const step = async (fn: () => Promise<void>): Promise<boolean> => {
    try {
      await fn()
      return true
    } catch (e) {
      console.error('[quickstart] approval deal sync failed:', e instanceof Error ? e.message : e)
      failures.push(e)
      return false
    }
  }
  if (sync.pipedrive_deal_id) {
    if (previousPackage === approved) return p.sync
    const dealId = sync.pipedrive_deal_id
    if (await step(() => updateDeal(dealId, { title, value: pkg.priceGbp }))) {
      await step(async () => {
        await createNote({ dealId, content: buildApprovalNoteHtml(p, true) })
      })
    }
  } else {
    let personId = sync.pipedrive_person_id
    let dealId: number | undefined
    await step(async () => {
      if (!personId) {
        personId =
          (await findPersonByEmail(p.contact.email)) ??
          (await createPerson({ name: p.contact.name, email: p.contact.email }))
        sync.pipedrive_person_id = personId
      }
      const deal = await createDeal({
        title,
        value: pkg.priceGbp,
        currency: 'GBP',
        personId,
        pipelineId: envId('QUICKSTART_PIPEDRIVE_PIPELINE_ID'),
        stageId: envId('QUICKSTART_PIPEDRIVE_STAGE_SENT_ID'),
      })
      dealId = deal.id
      sync.pipedrive_deal_id = deal.id
      sync.pipedrive_deal_url = deal.url
    })
    if (dealId) {
      const id = dealId
      await step(async () => {
        await createNote({ dealId: id, content: buildApprovalNoteHtml(p, false) })
      })
      const leadId = sync.pipedrive_lead_id
      if (leadId) await step(() => archiveLead(leadId))
    }
  }
  if (failures.length === 0) {
    delete sync.error
  } else {
    for (const e of failures) sync = addError(sync, e)
  }
  return sync
}

const isNotSure = (v: unknown) => v === NOT_SURE || (Array.isArray(v) && v.includes(NOT_SURE))
const isEmpty = (v: unknown) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)

function fieldValueHtml(f: OnbField, v: unknown): string {
  const one = (x: unknown) => f.options?.find((o) => o.value === x)?.label ?? String(x)
  if (f.type === 'users' && Array.isArray(v)) {
    return `<ul>${(v as UserRow[])
      .map((u) => `<li>${esc(u.name)} &lt;${esc(u.email)}&gt; — ${esc(u.role)}${u.team ? `, ${esc(u.team)}` : ''}</li>`)
      .join('')}</ul>`
  }
  if (f.type === 'pipelines' && Array.isArray(v)) {
    return `<ul>${(v as PipelineRow[])
      .map((r) => `<li>${esc(r.name)}: ${esc((r.stages ?? []).join(' → '))}</li>`)
      .join('')}</ul>`
  }
  return esc(Array.isArray(v) ? v.map(one).join(', ') : one(v))
}

export function buildOnboardingNoteHtml(p: Project): string {
  const answers = p.onboarding.answers
  const parts: string[] = ['<h3>QuickStart onboarding submitted</h3>']
  const unsure: string[] = []
  for (const s of SECTIONS) {
    const rows: string[] = []
    for (const f of s.fields) {
      const v = answers[f.key]
      if (!isFieldVisible(f, answers) || isEmpty(v)) continue
      if (isNotSure(v)) unsure.push(f.label)
      rows.push(`<li><strong>${esc(f.label)}:</strong> ${fieldValueHtml(f, v)}</li>`)
    }
    if (rows.length) parts.push(`<h4>${esc(s.title)}</h4>`, `<ul>${rows.join('')}</ul>`)
  }
  const warn = p.onboarding.scope_exceptions
  parts.push('<h4>Scope warnings</h4>')
  parts.push(warn.length ? `<ul>${warn.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>` : '<p>None</p>')
  parts.push('<h4>To cover on the discovery call</h4>')
  parts.push(unsure.length ? `<ul>${unsure.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : '<p>Nothing flagged.</p>')
  return parts.join('\n')
}

/** After onboarding submit: note on the deal (+ optional stage move). Never throws. */
export async function syncOnboardingToPipedrive(p: Project): Promise<Project['sync']> {
  const dealId = p.sync.pipedrive_deal_id
  if (!dealId) return p.sync
  if (!isLive()) {
    skip(`syncOnboardingToPipedrive ${p.project_id}`)
    return p.sync
  }
  let sync: Project['sync'] = { ...p.sync }
  try {
    await createNote({ dealId, content: buildOnboardingNoteHtml(p) })
    const stageId = envId('QUICKSTART_PIPEDRIVE_STAGE_RECEIVED_ID')
    if (stageId) await updateDeal(dealId, { stageId })
    delete sync.error
  } catch (e) {
    console.error('[quickstart] onboarding deal sync failed:', e instanceof Error ? e.message : e)
    sync = addError(sync, e)
  }
  return sync
}

/** Re-read the project and write back only the sync fields, so concurrent writes survive. */
export async function mergeSync(id: string, sync: Project['sync']): Promise<void> {
  const store = getStore()
  const cur = await store.get(id)
  if (!cur) return
  const merged = { ...cur.sync, ...sync }
  if (sync.error === undefined) delete merged.error
  cur.sync = merged
  await store.put(cur)
}

export async function notifyStaff(subject: string, text: string): Promise<void> {
  if (!isLive()) {
    skip(`notifyStaff "${subject}"`)
    return
  }
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is missing')
  const to = process.env.QUICKSTART_NOTIFY_TO ?? process.env.CONTACT_TO
  if (!to) throw new Error('QUICKSTART_NOTIFY_TO / CONTACT_TO is missing')
  const from = process.env.CONTACT_FROM || 'Automated Sales <onboarding@resend.dev>'
  const { error } = await new Resend(key).emails.send({ from, to: [to], subject, text })
  if (error) throw new Error(`Resend send failed: ${error.message}`)
}
