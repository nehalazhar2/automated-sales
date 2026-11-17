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

function Row({ p }: { p: Project }) {
  const q = p.qualification
  const ob = p.onboarding
  const approved = q.approval_status === 'approved'
  const leadId = p.sync.pipedrive_lead_id
  const leadUrl = p.sync.pipedrive_lead_url
  return (
    <article className="qs-card" style={{ marginBottom: 18, borderRadius: 16, padding: 20 }}>
      <h2 className="qs-title" style={{ marginBottom: 4 }}>
        {p.contact.company} {p.test_mode && <span className="qs-badge" style={{ background: '#fef3c7', color: '#92400e' }}>test mode</span>}
      </h2>
      <p className="qs-sub">
        {p.contact.name} &middot; <a href={`mailto:${p.contact.email}`}>{p.contact.email}</a> &middot; {fmt(p.created_at)}
      </p>
      <p>
        <span className="qs-badge">candidate: {q.candidate}</span>{' '}
        <strong>Approval:</strong> {approved ? `approved (${q.approved_package})` : 'pending'}
        {q.override_rationale && <> &middot; <em>Rationale: {q.override_rationale}</em></>}
        {' '}&middot; <strong>Onboarding:</strong> {ob.status}
      </p>
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
      <details style={{ marginTop: 10 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 800 }}>Qualification answers and actions</summary>
        <dl style={{ margin: '12px 0', fontSize: 14 }}>
          {Object.entries(q.answers).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 6 }}>
              <dt style={{ fontWeight: 800 }}>{QUESTIONS.find((x) => x.key === k)?.label ?? k}</dt>
              <dd style={{ margin: 0 }}>{answerLabel(k, v) || '-'}</dd>
            </div>
          ))}
        </dl>
        <ProjectActions
          id={p.project_id}
          candidate={q.candidate}
          approvalStatus={q.approval_status}
          submitted={ob.status === 'submitted'}
        />
        <p style={{ marginTop: 14 }}>
          <a className="as-btn as-btn-secondary" href={`/api/quickstart/admin/project/${p.project_id}/`} download>Download JSON</a>
        </p>
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
  const projects = await getStore().list()
  return (
    <section className="as-hero qs-hero">
      <div className="as-container">
        <h1>QuickStart projects</h1>
        <form action={logout}><button className="as-btn as-btn-secondary" type="submit">Log out</button></form>
        <p className="qs-sub" style={{ marginTop: 14 }}>{projects.length} project{projects.length === 1 ? '' : 's'}, newest first.</p>
        {projects.map((p) => <Row key={p.project_id} p={p} />)}
      </div>
    </section>
  )
}
