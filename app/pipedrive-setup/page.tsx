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
  title: 'Pipedrive Setup — Fixed-Scope Pipedrive Configuration',
  description:
    'Pipedrive setup service: fixed-scope, fixed-price configuration of Pipedrive for small and growing sales teams. Pipeline, fields, automation, training.',
  path: '/pipedrive-setup/',
});

const FAQS = [
  {
    q: 'How much does a Pipedrive setup cost?',
    a: 'Our fixed-scope Pipedrive setup is a defined package — pipeline configuration, custom fields, user roles, two automation workflows, one integration and a 60-minute training session. We share pricing on the discovery call once we have confirmed it fits your scope.',
  },
  {
    q: 'How long does the setup take?',
    a: 'Two to three weeks from kickoff to handover. The first week is design and configuration, the second is automation and integration, and the third covers data import, training and a short hypercare window.',
  },
  {
    q: 'What if my requirements grow during setup?',
    a: 'We flag scope creep as soon as we see it and give you a transparent change-request quote before doing extra work. You will never be surprised on the invoice. If the project genuinely needs more, we upgrade you to a full implementation engagement.',
  },
  {
    q: 'Do you import our existing data?',
    a: 'A standard contact and deal import is included. Multi-source migrations, complex deduplication and historical activity migration are an upgrade — we will tell you up front which side of the line your data sits on.',
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
          { name: 'Pipedrive Setup', path: '/pipedrive-setup/' },
        ])}
      />

      <PageHero
        eyebrow="Pipedrive Setup"
        heading="Fixed-scope Pipedrive setup for growing teams."
        lead="Clean Pipedrive configuration done in two to three weeks. Defined deliverables, defined price, no surprises."
        primaryCta={{ href: '/contact-2/', label: 'Get a setup quote →' }}
        secondaryCta={{ href: '/pipedrive-implementation/', label: 'Need full implementation?' }}
        proofItems={PROOF_ITEMS}
      />

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">Who Pipedrive setup is for</span>
            <h2>You know your process. We will build it.</h2>
          </div>
          <div>
            <p>
              Pipedrive setup is the right service when you have a clear picture of how your team sells
              and you just want Pipedrive configured against it — properly, without months of project
              management overhead. Most setup clients are founders, sales managers, or operations leads
              at small but growing companies who do not want to learn Pipedrive admin themselves.
            </p>
            <p style={{ marginTop: 16 }}>
              If your sales process is still in flux, if you need to migrate from another CRM, or if
              multiple teams need their own pipelines, you want our broader{' '}
              <Link href="/pipedrive-implementation/">Pipedrive implementation</Link> service instead —
              setup will be too narrow.
            </p>
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container">
          <span className="as-eyebrow">What is in the box</span>
          <h2>The setup package, by deliverable.</h2>
          <div className="as-grid-2" style={{ marginTop: 40 }}>
            <article className="as-card">
              <h3>Pipeline &amp; stage configuration</h3>
              <p>
                One pipeline with up to eight stages, stage probabilities, rotting rules and required
                fields per stage. Designed with you in a 60-minute working session before being built.
              </p>
            </article>
            <article className="as-card">
              <h3>Custom field design</h3>
              <p>
                Up to fifteen custom fields across deals, persons and organisations. Field types chosen
                for reporting (dropdowns over free text where it matters), with field groups for the
                deal sidebar.
              </p>
            </article>
            <article className="as-card">
              <h3>User roles &amp; permissions</h3>
              <p>
                Roles for rep, manager and admin — with visibility rules that scale as the team grows.
                We avoid the trap of "everyone is an admin" that breaks reporting later.
              </p>
            </article>
            <article className="as-card">
              <h3>Two workflow automations</h3>
              <p>
                Two automation workflows built natively in Pipedrive — for example, deal stage entry
                triggers, follow-up activity creation, lost-deal handling, or stale-deal alerts.
              </p>
            </article>
            <article className="as-card">
              <h3>One integration</h3>
              <p>
                One integration via Zapier, Make or native Pipedrive marketplace app — typically email,
                calendar, lead form, or accounting. Additional integrations available as an upgrade.
              </p>
            </article>
            <article className="as-card">
              <h3>Training &amp; handover</h3>
              <p>
                A 60-minute role-based training session plus a written cheat-sheet specific to your
                Pipedrive instance — so new hires can be onboarded by your team, not by us.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">After setup</span>
            <h2>You own it. We are here if you need us.</h2>
          </div>
          <div>
            <p>
              At handover you have a working Pipedrive instance, documentation, and a team who knows
              how to use it. From that point you own the system. Most clients run it themselves for six
              to twelve months before coming back for an optimisation pass or a new automation —
              exactly how it should work.
            </p>
            <p style={{ marginTop: 16 }}>
              When you do need more, we are here. Ad-hoc{' '}
              <Link href="/pipedrive-help/">Pipedrive help</Link> for small fixes,{' '}
              <Link href="/pipedrive-training/">training</Link> for new hires, and{' '}
              <Link href="/pipedrive-automation/">automation</Link> work as your process matures. For
              senior strategic input on the whole stack, our{' '}
              <Link href="/pipedrive-consultant/">Pipedrive Consultant</Link> service is the right
              starting point.
            </p>
          </div>
        </div>
      </section>

      <RecentProjects
        eyebrow="Setup-style work we have shipped"
        projects={[
          {
            slug: 'taking-an-offline-lead-management-process-online-and-automating-it-through-pipedrive',
            title: 'Offline to Pipedrive',
            body: 'Moved a US non-profit off spreadsheets and into Pipedrive with a clean pipeline, automations and dashboards in three weeks.',
            image: '/images/projects/pipeline.jpeg',
          },
          {
            slug: 'automating-sales-outreach',
            title: 'Outbound outreach in Pipedrive',
            body: 'Configured Pipedrive plus tooling around it to give a small sales team a repeatable outbound process.',
            image: '/images/projects/outreach.png',
          },
        ]}
      />

      <section className="as-section as-section-muted">
        <div className="as-container" style={{ maxWidth: 880 }}>
          <span className="as-eyebrow">FAQ</span>
          <h2>Pipedrive setup — common questions.</h2>
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

      <RelatedPipedriveServices currentPath="/pipedrive-setup/" />

      <CtaBox
        heading="Get a fixed-scope Pipedrive setup quote."
        body="Tell us what your sales process looks like today. We will come back with a defined scope and price within 24 hours."
        primary={{ href: '/contact-2/', label: 'Request a quote →' }}
        secondary={{ href: '/pipedrive-consultant/', label: 'See the full Pipedrive Consultant service' }}
      />
    </>
  );
}
