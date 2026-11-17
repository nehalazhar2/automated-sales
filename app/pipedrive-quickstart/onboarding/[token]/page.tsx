import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/seo'
import { loadOnboarding } from '@/lib/quickstart/onboarding/handlers'
import OnboardingForm from '@/components/quickstart/OnboardingForm'
import '../../quickstart.css'

export const dynamic = 'force-dynamic'

// Never put the token in metadata or canonical.
export const metadata = buildMetadata({
  title: 'Pipedrive QuickStart onboarding',
  description: 'Tell us how you sell so we can prepare your Pipedrive setup.',
  path: '/pipedrive-quickstart/onboarding/',
  noIndex: true,
})

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const data = await loadOnboarding(token)
  if (!data) notFound()
  return (
    <section className="as-hero qs-hero qs-onb-hero">
      <div className="as-container">
        <OnboardingForm
          token={token}
          company={data.company}
          pkg={data.package}
          initialAnswers={data.answers}
          initialStatus={data.status}
          initialWarnings={data.warnings}
          initialSavedAt={data.savedAt}
        />
      </div>
    </section>
  )
}
