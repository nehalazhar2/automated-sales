import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import '../../quickstart.css'

export const metadata = buildMetadata({
  title: 'Link no longer active',
  description: 'This onboarding link is no longer active.',
  path: '/pipedrive-quickstart/onboarding/',
  noIndex: true,
})

export default function NotFound() {
  return (
    <section className="as-hero qs-hero qs-onb-hero">
      <div className="as-container">
        <div className="qs-card qs-result">
          <h1 className="qs-title">This link is no longer active</h1>
          <p className="qs-text">
            Onboarding links expire or are replaced when we send a new one. Contact us and we&apos;ll send you a fresh link.
          </p>
          <p style={{ marginTop: 16 }}>
            <Link className="as-btn as-btn-primary" href="/contact-2/">Contact us</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
