'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { approve, regenerate, login, type LinkState, type LoginState } from '@/app/pipedrive-quickstart/admin/actions'

function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  // The form that produced the link is replaced; keep keyboard focus on the new link.
  useEffect(() => {
    input.current?.focus()
    input.current?.select()
  }, [link])
  return (
    <div className="qs-linkbox" role="status">
      <p className="qs-hint" style={{ marginTop: 0 }}>New onboarding link. Shown once: copy it now, it cannot be retrieved later.</p>
      <input ref={input} className="qs-input" readOnly value={link} onFocus={(e) => e.currentTarget.select()} aria-label="Onboarding link" />
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
      <input id="qs-admin-pw" name="password" type="password" className="qs-input" autoComplete="current-password" required
        aria-invalid={state.error ? true : undefined} aria-describedby={state.error ? 'qs-admin-pw-err' : undefined} />
      {state.error && <p id="qs-admin-pw-err" className="qs-error" role="alert">{state.error}</p>}
      <button className="as-btn as-btn-primary" type="submit" disabled={pending} style={{ marginTop: 14 }}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

const ERROR_TEXT: Record<string, string> = {
  already_submitted: "The customer has already submitted onboarding; the package can't be changed now.",
}
const errorText = (e: string) => ERROR_TEXT[e] ?? e

type LinkAction = (prev: LinkState, formData: FormData) => Promise<LinkState>

/** Runs a server action and reports any new link to the parent, which shows only one link at a time. */
function useLinkAction(action: LinkAction, onLink: (link: string) => void) {
  return useActionState<LinkState, FormData>(async (prev, fd) => {
    const r = await action(prev, fd)
    if (r.link) onLink(r.link)
    return { error: r.error }
  }, {})
}

function ApproveForm({
  id,
  candidate,
  approvedPackage,
  onLink,
  changing,
}: {
  id: string
  candidate: string
  approvedPackage?: string | null
  onLink: (link: string) => void
  changing?: boolean
}) {
  const [state, action, pending] = useLinkAction(approve, onLink)
  // Changing an approved project starts from the package already approved, not the original candidate.
  const pick = changing && approvedPackage ? approvedPackage : candidate
  const def = pick === 'quickstart' || pick === 'plus' ? pick : ''
  return (
    <form action={action} className="qs-form">
      <input type="hidden" name="id" value={id} />
      <fieldset className="qs-field" style={{ marginTop: 4 }}>
        <legend>Package</legend>
        <div className="qs-chips">
          {([['quickstart', 'QuickStart'], ['plus', 'QuickStart Plus']] as const).map(([v, label]) => (
            <label key={v} className="qs-chip">
              <input type="radio" name="package" value={v} defaultChecked={def === v} required />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="qs-label" htmlFor={`why-${id}`}>Rationale</label>
      <textarea id={`why-${id}`} name="rationale" className="qs-textarea" style={{ minHeight: 70 }} />
      <p className="qs-hint">Required (10+ characters) when overriding the candidate, or when the candidate is review or bespoke.</p>
      {state.error && <p className="qs-error" role="alert">{errorText(state.error)}</p>}
      <button className="as-btn as-btn-primary" type="submit" disabled={pending} style={{ marginTop: 10 }}>
        {pending ? 'Working…' : changing ? 'Change package and generate new link' : 'Approve and generate link'}
      </button>
    </form>
  )
}

function RegenerateForm({ id, onLink }: { id: string; onLink: (link: string) => void }) {
  const [state, action, pending] = useLinkAction(regenerate, onLink)
  return (
    <form
      action={action}
      className="qs-form"
      style={{ marginTop: 12 }}
      onSubmit={(e) => {
        if (!window.confirm('Regenerate the link? The current link stops working immediately.')) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="as-btn as-btn-secondary" type="submit" disabled={pending}>
        {pending ? 'Working…' : 'Regenerate link (old link stops working)'}
      </button>
      {state.error && <p className="qs-error" role="alert">{errorText(state.error)}</p>}
    </form>
  )
}

/**
 * Per-project actions. Pending projects get the approve form; approved projects get a collapsed
 * "change package" form plus "Regenerate link". Submitted projects get neither. One link is shown
 * at a time: a new link from either form replaces the previous one.
 */
export function ProjectActions({
  id,
  candidate,
  approvalStatus,
  approvedPackage,
  submitted,
}: {
  id: string
  candidate: string
  approvedPackage?: string | null
  approvalStatus: 'pending' | 'approved'
  submitted: boolean
}) {
  const [link, setLink] = useState<string | null>(null)
  return (
    <div>
      {!submitted && approvalStatus === 'pending' && <ApproveForm id={id} candidate={candidate} onLink={setLink} />}
      {link && <CopyLink link={link} />}
      {!submitted && approvalStatus === 'approved' && (
        <>
          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 800 }}>
              Change package (issues a new link and disables the old one)
            </summary>
            <ApproveForm id={id} candidate={candidate} approvedPackage={approvedPackage} onLink={setLink} changing />
          </details>
          <RegenerateForm id={id} onLink={setLink} />
        </>
      )}
      {submitted && <p className="qs-hint">The customer has submitted their requirements; no further actions here.</p>}
    </div>
  )
}
