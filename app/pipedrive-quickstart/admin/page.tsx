import { cookies } from 'next/headers'
import { buildMetadata } from '@/lib/seo'
import { ADMIN_COOKIE, isAdminCookie } from '@/lib/quickstart/adminAuth'
import { getStore } from '@/lib/quickstart/store'
import { QUESTIONS } from '@/lib/quickstart/qualification/questions'
import type { Project } from '@/lib/quickstart/types'
import { LoginForm, ProjectActions } from '@/components/quickstart/AdminForms'
import { logout } from './actions'
import '../quickstart.css'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata({
  title: 'QuickStart admin',
  description: 'Staff-only QuickStart project administration.',
  path: '/pipedrive-quickstart/admin/',
  noIndex: true,
})

const fmt = (iso: string) => iso.replace('T', ' ').slice(0, 16) + ' UTC'

function answerLabel(key: string, value: unknown): string {
  const q = QUESTIONS.find((x) => x.key === key)
  const opt = (v: unknown) => q?.options?.find((o) => o.value === v)?.label ?? String(v)
  return Array.isArray(value) ? value.map(opt).join(', ') : opt(value)
}

const ONBOARDING_LABEL: Record<Project['onboarding']['status'], string> = {
  not_sent: 'Link not sent yet',
  draft: 'Draft in progress',
  submitted: 'Submitted',
}

/** Plain-language state of the onboarding link, from the stored hash, expiry and approval log. */
function linkLine(p: Project, nowMs: number): string {
  const ob = p.onboarding
  if (!ob.token_hash) return 'No active link'
  if (ob.token_expires_at && Date.parse(ob.token_expires_at) < nowMs) return 'Link expired'
  const issued = [...p.approvals].reverse().find((a) => /approv|regenerat|package|link/i.test(a.action))
  return issued ? `Link issued ${fmt(issued.at)} \u00b7 active` : 'Link active'
}

function Row({ p, nowMs }: { p: Project; nowMs: number }) {
  const q = p.qualification
  const ob = p.onboarding
  const approved = q.approval_status === 'approved'
  const leadId = p.sync.pipedrive_lead_id
  const leadUrl = p.sync.pipedrive_lead_url
  const needsApproval = !approved
  const tailored = q.candidate === 'review' || q.candidate === 'bespoke'
  return (
    <article className="qs-card" style={{ marginBottom: 18, borderRadius: 16, padding: 20 }}>
      <h2 className="qs-title" style={{ marginBottom: 4 }}>
        {p.contact.company} {p.test_mode && <span className="qs-badge qs-badge-warn">test mode</span>}
      </h2>
      <p className="qs-sub">
        {p.contact.name} &middot; <a href={`mailto:${p.contact.email}`}>{p.contact.email}</a> &middot; {fmt(p.created_at)}
      </p>
      <p>
        <span className={`qs-badge${tailored ? ' qs-badge-warn' : ''}`}>candidate: {q.candidate}</span>{' '}
        <span className={`qs-status${needsApproval ? ' need' : ''}`}>
          {approved ? `Approved (${q.approved_package})` : 'Awaiting approval'}
        </span>{' '}
        <span className="qs-status">{ONBOARDING_LABEL[ob.status]}</span>
        {q.override_rationale && <> &middot; <em>Rationale: {q.override_rationale}</em></>}
      </p>
      <p className="qs-hint" style={{ marginTop: 0 }}>{linkLine(p, nowMs)}</p>
      {q.reason_codes.length > 0 && (
        <p className="qs-hint">
          Reasons: <code>{q.reason_codes.join(', ')}</code>
        </p>
      )}
      {q.explanation.length > 0 && (
        <ul className="qs-hint" style={{ paddingLeft: 18 }}>
          {q.explanation.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}
      <p className="qs-hint">
        Pipedrive:{' '}
        {leadId ? (
          leadUrl && /^https:\/\//.test(leadUrl) ? (
            <a href={leadUrl} target="_blank" rel="noreferrer">lead {leadId}</a>
          ) : (
            <>Lead {leadId}</>
          )
        ) : 'no lead synced'}
        {p.sync.error && <span style={{ color: '#b91c1c', fontWeight: 700 }}> &middot; Sync error: {p.sync.error}</span>}
      </p>
      {ob.status === 'submitted' && ob.scope_exceptions.length > 0 && (
        <div className="qs-hint" style={{ color: '#b91c1c' }}>
          Scope exceptions:
          <ul style={{ paddingLeft: 18 }}>{ob.scope_exceptions.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}
      <section className="qs-actions-box" aria-label={`Actions for ${p.contact.company}`}>
        <h3>Actions</h3>
        <ProjectActions
          id={p.project_id}
          candidate={q.candidate}
          approvalStatus={q.approval_status}
          approvedPackage={q.approved_package}
          submitted={ob.status === 'submitted'}
        />
        <p style={{ marginTop: 14 }}>
          <a className="as-btn as-btn-secondary" href={`/api/quickstart/admin/project/${p.project_id}/`} download>Download JSON</a>
        </p>
      </section>
      <details style={{ marginTop: 10 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 800 }}>Qualification answers</summary>
        <dl style={{ margin: '12px 0', fontSize: 14 }}>
          {Object.entries(q.answers).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 6 }}>
              <dt style={{ fontWeight: 800 }}>{QUESTIONS.find((x) => x.key === k)?.label ?? k}</dt>
              <dd style={{ margin: 0 }}>{answerLabel(k, v) || '-'}</dd>
            </div>
          ))}
        </dl>
      </details>
    </article>
  )
}

export default async function Page() {
  const authed = isAdminCookie((await cookies()).get(ADMIN_COOKIE)?.value)
  if (!authed) {
    return (
      <section className="as-hero qs-hero">
        <div className="as-container">
          <h1>Staff sign in</h1>
          <LoginForm />
        </div>
      </section>
    )
  }
  const nowMs = Date.now()
  // Projects waiting for approval first; each group keeps newest-first order.
  const all = await getStore().list()
  const projects = [...all.filter((p) => p.qualification.approval_status !== 'approved'), ...all.filter((p) => p.qualification.approval_status === 'approved')]
  return (
    <section className="as-hero qs-hero">
      <div className="as-container">
        <h1>QuickStart projects</h1>
        <div className="qs-admin-top">
          <p className="qs-sub" style={{ margin: 0 }}>
            {projects.length} project{projects.length === 1 ? '' : 's'}; awaiting approval first, then newest first.
          </p>
          <form action={logout}><button className="as-btn as-btn-secondary" type="submit">Log out</button></form>
        </div>
        <div style={{ marginTop: 14 }}>
          {projects.map((p) => <Row key={p.project_id} p={p} nowMs={nowMs} />)}
        </div>
      </div>
    </section>
  )
}
