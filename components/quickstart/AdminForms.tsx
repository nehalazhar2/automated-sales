'use client'

import { useActionState, useState } from 'react'
import { approve, regenerate, login, type LinkState, type LoginState } from '@/app/pipedrive-quickstart/admin/actions'

function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div role="status" style={{ marginTop: 10 }}>
      <p className="qs-hint">Shown once. Copy it now; it cannot be retrieved later.</p>
      <input className="qs-input" readOnly value={link} onFocus={(e) => e.currentTarget.select()} aria-label="Onboarding link" />
      <button
        type="button"
        className="as-btn as-btn-secondary"
        style={{ marginTop: 8 }}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(link)
            setCopied(true)
          } catch {
            setCopied(false)
          }
        }}
      >
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  )
}

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {})
  return (
    <form action={action} className="qs-form" style={{ maxWidth: 360 }}>
      <label className="qs-label" htmlFor="qs-admin-pw">Password</label>
      <input id="qs-admin-pw" name="password" type="password" className="qs-input" autoComplete="current-password" required />
      {state.error && <p className="qs-error" role="alert">{state.error}</p>}
      <button className="as-btn as-btn-primary" type="submit" disabled={pending} style={{ marginTop: 14 }}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

export function ApproveForm({ id, candidate }: { id: string; candidate: string }) {
  const [state, action, pending] = useActionState<LinkState, FormData>(approve, {})
  const def = candidate === 'quickstart' || candidate === 'plus' ? candidate : ''
  return (
    <form action={action} className="qs-form">
      <input type="hidden" name="id" value={id} />
      <label className="qs-label" htmlFor={`pkg-${id}`}>Package</label>
      <select id={`pkg-${id}`} name="package" className="qs-select" defaultValue={def} required>
        {!def && <option value="" disabled>Choose package</option>}
        <option value="quickstart">QuickStart</option>
        <option value="plus">QuickStart Plus</option>
      </select>
      <label className="qs-label" htmlFor={`why-${id}`}>Rationale</label>
      <textarea id={`why-${id}`} name="rationale" className="qs-textarea" style={{ minHeight: 70 }} />
      <p className="qs-hint">Required (10+ characters) when overriding the candidate, or when the candidate is review or bespoke.</p>
      {state.error && <p className="qs-error" role="alert">{state.error}</p>}
      <button className="as-btn as-btn-primary" type="submit" disabled={pending} style={{ marginTop: 10 }}>
        {pending ? 'Approving…' : 'Approve and generate link'}
      </button>
      {state.link && <CopyLink link={state.link} />}
    </form>
  )
}

export function RegenerateForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState<LinkState, FormData>(regenerate, {})
  return (
    <form action={action} className="qs-form" style={{ marginTop: 12 }}>
      <input type="hidden" name="id" value={id} />
      <button className="as-btn as-btn-secondary" type="submit" disabled={pending}>
        {pending ? 'Working…' : 'Regenerate link (old link stops working)'}
      </button>
      {state.error && <p className="qs-error" role="alert">{state.error}</p>}
      {state.link && <CopyLink link={state.link} />}
    </form>
  )
}
