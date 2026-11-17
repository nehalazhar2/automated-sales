'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { PackageLimits } from '@/lib/quickstart/packages'

export type QualifyResult = {
  outcome: 'quickstart' | 'plus' | 'review' | 'bespoke'
  package?: PackageLimits
}

const gbp = (n: number) => `£${n.toLocaleString('en-GB')}`
const CONFIRM = 'Thanks — we’ve got your request. We’ll be in touch within one working day to confirm scope.'

export default function ResultCard({ result }: { result: QualifyResult }) {
  const [confirmed, setConfirmed] = useState(false)
  const { outcome, package: pkg } = result

  if ((outcome === 'quickstart' || outcome === 'plus') && pkg) {
    return (
      <div className="qs-card qs-result" aria-live="polite">
        <span className="qs-badge">Recommended for you</span>
        <h2>{pkg.name}</h2>
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
        {confirmed ? (
          <div className="qs-confirm" role="status">{CONFIRM}</div>
        ) : (
          <div className="qs-actions">
            <button type="button" className="as-btn qs-btn-green" onClick={() => setConfirmed(true)}>
              {outcome === 'plus' ? 'Request QuickStart Plus' : 'Request QuickStart'}
            </button>
            <Link href="/contact-2/" className="as-btn as-btn-secondary">I&apos;d rather talk it through</Link>
          </div>
        )}
      </div>
    )
  }

  if (outcome === 'bespoke') {
    return (
      <div className="qs-card qs-result" aria-live="polite">
        <h2>A tailored implementation</h2>
        <p className="qs-text">
          Your requirements would benefit from a tailored implementation. Let&apos;s discuss the best solution.
        </p>
        <div className="qs-actions">
          <Link href="/contact-2/" className="as-btn as-btn-primary">Arrange a consultation</Link>
        </div>
      </div>
    )
  }

  // review (and any unexpected outcome): never show a price
  return (
    <div className="qs-card qs-result" aria-live="polite">
      <h2>Thanks — we&apos;ll review your requirements</h2>
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
