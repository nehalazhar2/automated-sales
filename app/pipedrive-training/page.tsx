import Link from 'next/link';
import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import RecentProjects from '@/components/RecentProjects';
import RelatedPipedriveServices from '@/components/RelatedPipedriveServices';
import { DEFAULT_ITEMS as PROOF_ITEMS } from '@/components/ProofList';
import StructuredData from '@/components/seo/StructuredData';
import { faqSchema, breadcrumbSchema } from '@/components/seo/schemas';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Pipedrive Training — Tailored Sessions for Sales Teams',
  description:
    'Pipedrive training for sales reps, managers and admins. Tailored to your Pipedrive setup, delivered 1:1 or group, with written reference materials.',
  path: '/pipedrive-training/',
});

const FAQS = [
  {
    q: 'Is training based on our Pipedrive setup or generic Pipedrive?',
    a: 'Training is always based on your Pipedrive instance — your pipelines, your fields, your automations, your reports. Generic Pipedrive training is freely available on YouTube. What you are paying us for is training tailored to what your team will actually click on Monday morning.',
  },
  {
    q: 'Who should attend Pipedrive training?',
    a: 'We typically run three streams: front-line reps (how to work a deal day-to-day), sales managers (forecasting, dashboards, coaching from the data) and admins (configuration, automation maintenance). You can take one stream, all three, or a custom blend.',
  },
  {
    q: 'How is training delivered?',
    a: 'Remote-first via Zoom or Google Meet, recorded so absentees can catch up, with hands-on exercises in your own Pipedrive sandbox. We can do on-site in the UK by arrangement. Sessions typically run 60 to 90 minutes each.',
  },
  {
    q: 'Do you provide written materials?',
    a: 'Yes — every training engagement includes a written cheat-sheet specific to your Pipedrive instance, so new hires can be onboarded by your team without us. Updated reference materials are included if your setup changes within six months.',
  },
];

export default function Page() {
  return (
    <>
      <StructuredData data={faqSchema(FAQS)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Pipedrive Consultant', path: '/pipedrive-consultant/' },
          { name: 'Pipedrive Training', path: '/pipedrive-training/' },
        ])}
      />

      <PageHero
        eyebrow="Pipedrive Training"
        heading="Pipedrive training tailored to how your team actually sells."
        lead="Role-based training built around your Pipedrive instance — not a generic walkthrough. Reps, managers and admins, remote or on-site."
        primaryCta={{ href: '/contact-2/', label: 'Book training →' }}
        secondaryCta={{ href: '/pipedrive-setup/', label: 'Setting up first?' }}
        proofItems={PROOF_ITEMS}
      />

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">Why generic training fails</span>
            <h2>Your reps need to click your buttons.</h2>
          </div>
          <div>
            <p>
              Pipedrive has thousands of features. Your team needs to fluently use about thirty of
              them, in the specific configuration you have chosen. Generic Pipedrive training teaches
              the thousands. Our training teaches the thirty that matter to you, in the order your reps
              will encounter them, using language consistent with your own sales process.
            </p>
            <p style={{ marginTop: 16 }}>
              That is why we will not run a training session without first looking at your Pipedrive
              setup. Even our discovery call doubles as a quick audit — if your configuration is
              fighting your reps, no amount of training will fix it.
            </p>
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container">
          <span className="as-eyebrow">Three training streams</span>
          <h2>One Pipedrive, three audiences.</h2>
          <div className="as-grid-2" style={{ marginTop: 40 }}>
            <article className="as-card">
              <h3>Sales reps</h3>
              <p>
                The daily workflow: create a deal, move it through stages, log activities, send emails,
                attach products and quotes, handle handovers. Includes the small habits that compound —
                using the right next-activity, keeping deal values honest, working the rotting-deal
                view weekly.
              </p>
            </article>
            <article className="as-card">
              <h3>Sales managers</h3>
              <p>
                Forecasting from the data, reading dashboards critically, coaching reps from pipeline
                shape, spotting drift in conversion rates and cycle time, and using Insights to answer
                executive questions without re-doing analysis in spreadsheets.
              </p>
            </article>
            <article className="as-card">
              <h3>Pipedrive admins</h3>
              <p>
                Configuration maintenance — adding fields safely, editing pipelines without breaking
                history, managing user roles, debugging automations, monitoring integration health, and
                knowing when to escalate to your consultant rather than DIY.
              </p>
            </article>
            <article className="as-card">
              <h3>New-hire onboarding</h3>
              <p>
                A repeatable 60-minute new-hire session, recorded and reusable, so every new joiner gets
                the same baseline. We will record it once for you and update it whenever your setup
                changes materially.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">After training</span>
            <h2>You leave with documentation, not just knowledge.</h2>
          </div>
          <div>
            <p>
              Training without documentation evaporates. Every Pipedrive training engagement with us
              includes a written cheat-sheet specific to your Pipedrive instance — screenshots from
              your own setup, your own field names, your own automations. New hires use it. Existing
              reps refer back to it. Managers use it for refreshers.
            </p>
            <p style={{ marginTop: 16 }}>
              If your setup changes within six months, we update the cheat-sheet without re-charging.
              For ongoing strategic input on your stack, our{' '}
              <Link href="/pipedrive-consultant/">Pipedrive Consultant</Link> service is the natural
              next step. For specific build work after training,{' '}
              <Link href="/pipedrive-automation/">automation</Link> and{' '}
              <Link href="/pipedrive-integration/">integration</Link> services pick up the baton.
            </p>
          </div>
        </div>
      </section>

      <RecentProjects
        eyebrow="A sample of our work"
        projects={[
          {
            slug: 'taking-an-offline-lead-management-process-online-and-automating-it-through-pipedrive',
            title: 'Offline to Pipedrive',
            body: 'Trained a US non-profit team through the move from spreadsheets to Pipedrive — every role got documentation tailored to their own workflow.',
            image: '/images/projects/pipeline.jpeg',
          },
          {
            slug: 'increasing-sales-for-a-high-tech-high-growth-startup',
            title: 'Pipedrive launch in 2 weeks',
            body: 'Trained a US fintech sales team on their fresh Pipedrive build — role-specific sessions and recorded materials for new hires.',
            image: '/images/projects/data-import.jpeg',
          },
        ]}
      />

      <section className="as-section as-section-muted">
        <div className="as-container" style={{ maxWidth: 880 }}>
          <span className="as-eyebrow">FAQ</span>
          <h2>Pipedrive training — common questions.</h2>
          <div style={{ marginTop: 32, display: 'grid', gap: 16 }}>
            {FAQS.map((f) => (
              <details key={f.q} className="as-card" style={{ padding: '20px 24px' }}>
                <summary style={{ fontWeight: 900, fontSize: 18, cursor: 'pointer' }}>{f.q}</summary>
                <p style={{ marginTop: 12 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <RelatedPipedriveServices currentPath="/pipedrive-training/" />

      <CtaBox
        heading="Get your team fluent in Pipedrive."
        body="Tell us the team size, the streams you need, and roughly when. We will come back with a training plan and a quote."
        primary={{ href: '/contact-2/', label: 'Book Pipedrive training →' }}
        secondary={{ href: '/pipedrive-consultant/', label: 'See the full Pipedrive Consultant service' }}
      />
    </>
  );
}
