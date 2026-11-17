import 'server-only'
import { Resend } from 'resend'
import {
  findPersonByEmail,
  countOpenDealsForPerson,
  createPerson,
  createLead,
  createNote,
} from '@/lib/pipedrive/client'
import { QUESTIONS } from './qualification/questions'
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
