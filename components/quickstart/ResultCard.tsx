'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { PackageLimits } from '@/lib/quickstart/packages'

export type QualifyResult = {
  outcome: 'quickstart' | 'plus' | 'review' | 'bespoke'
  package?: PackageLimits
}

const gbp = (n: number) => `£${n.toLocaleString('en-GB')}`
const RECEIVED = 'We’ve received your answers and will be in touch within one working day to confirm scope. No payment is taken at this stage.'
const CONFIRM = 'Thanks, we’ve noted that you’d like to go ahead. We’ll be in touch within one working day to confirm scope.'

export default function ResultCard({ result }: { result: QualifyResult }) {
  const [confirmed, setConfirmed] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const confirmRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = headingRef.current
    if (!h) return
    h.focus()
    h.scrollIntoView({ block: 'center' })
  }, [])
  // Keep keyboard focus in place when the actions are replaced by the confirmation.
  useEffect(() => {
    if (confirmed) confirmRef.current?.focus()
  }, [confirmed])
  const { outcome, package: pkg } = result

  if ((outcome === 'quickstart' || outcome === 'plus') && pkg) {
    return (
      <div className="qs-card qs-result" aria-live="polite">
        <span className="qs-badge">Recommended for you</span>
        <h1 ref={headingRef} tabIndex={-1}>{pkg.name}</h1>
        <p className="qs-price">
          {gbp(pkg.priceGbp)} <small>indicative, excl. VAT and Pipedrive licences</small>
        </p>
        <ul className="qs-incl">
          {pkg.inclusions.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        <p className="qs-note">
          Your answers suggest {outcome === 'plus' ? 'QuickStart Plus' : 'QuickStart'} is a good fit. We&apos;ll check
          your requirements and confirm the scope with you before anything is agreed.
        </p>
        <p className="qs-note" style={{ marginTop: 10 }}>{RECEIVED}</p>
        {confirmed && (
          <div className="qs-confirm" role="status" tabIndex={-1} ref={confirmRef}>{CONFIRM}</div>
        )}
        <div className="qs-actions">
          {!confirmed && (
            <button type="button" className="as-btn qs-btn-green" onClick={() => setConfirmed(true)}>
              {outcome === 'plus' ? 'Request QuickStart Plus' : 'Request QuickStart'}
            </button>
          )}
          <Link href="/contact-2/" className="as-btn as-btn-secondary">I&apos;d rather talk it through</Link>
        </div>
      </div>
    )
  }

  if (outcome === 'bespoke') {
    return (
      <div className="qs-card qs-result" aria-live="polite">
        <h1 ref={headingRef} tabIndex={-1}>A tailored implementation</h1>
        <p className="qs-text">
          Your requirements would benefit from a tailored implementation. Let&apos;s discuss the best solution.
        </p>
        <div className="qs-confirm" role="status">
          We&apos;ve received your answers and will be in touch within one working day.
        </div>
        <div className="qs-actions">
          <Link href="/contact-2/" className="as-btn as-btn-primary">Arrange a consultation</Link>
        </div>
      </div>
    )
  }

  // review (and any unexpected outcome): never show a price
  return (
    <div className="qs-card qs-result" aria-live="polite">
      <h1 ref={headingRef} tabIndex={-1}>Thanks — we&apos;ll review your requirements</h1>
      <p className="qs-text">We&apos;ll look over your answers and be in touch within one working day.</p>
      <div className="qs-confirm" role="status">
        Your requirements have been sent for review.
      </div>
      <div className="qs-actions">
        <Link href="/contact-2/" className="as-btn as-btn-secondary">Arrange a consultation</Link>
      </div>
    </div>
  )
}
