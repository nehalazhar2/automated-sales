import { buildMetadata } from '@/lib/seo'
import QualificationWizard from '@/components/quickstart/QualificationWizard'
import './quickstart.css'

export const metadata = buildMetadata({
  title: 'Pipedrive QuickStart',
  description:
    'Answer a few questions about how you sell and we will recommend the right Pipedrive setup, then confirm the scope with you personally.',
  path: '/pipedrive-quickstart/',
  noIndex: true,
})

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const raw = Array.isArray(sp.ref) ? sp.ref[0] : sp.ref
  const ref = (raw ?? '').trim().slice(0, 200)

  return (
    <section className="as-hero qs-hero">
      <div className="as-container qs-grid">
        <div className="qs-intro">
          <span className="as-eyebrow">Pipedrive QuickStart</span>
          <h1>Get Pipedrive set up properly, without the back-and-forth.</h1>
          <p className="as-lead">
            Answer a few questions about how you sell. We&apos;ll recommend the right setup and confirm the scope
            personally before anything is agreed.
          </p>
          <div className="qs-proof">
            <div>Takes about 4 minutes</div>
            <div>Reviewed by a certified Pipedrive expert</div>
            <div>No commitment and no payment at this stage</div>
          </div>
        </div>
        <QualificationWizard initialReferralDetail={ref} />
      </div>
    </section>
  )
}
