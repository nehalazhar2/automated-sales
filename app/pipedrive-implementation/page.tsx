import Link from 'next/link';
import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import RecentProjects from '@/components/RecentProjects';
import RelatedPipedriveServices from '@/components/RelatedPipedriveServices';
import StructuredData from '@/components/seo/StructuredData';
import { faqSchema, breadcrumbSchema } from '@/components/seo/schemas';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Pipedrive Implementation — Done Right, First Time',
  description:
    'Pipedrive implementation services from a Top 30 Global Pipedrive Partner. Phased rollouts with process design, data migration, training and go-live support.',
  path: '/pipedrive-implementation/',
});

const FAQS = [
  {
    q: 'How long does a Pipedrive implementation take?',
    a: 'A typical Pipedrive implementation runs four to eight weeks end-to-end. Simpler builds (single pipeline, one integration) finish in two to three weeks. Larger multi-team rollouts with data migration from a legacy CRM run eight to twelve weeks. We scope the timeline against your actual requirements before quoting.',
  },
  {
    q: 'What is included in a Pipedrive implementation project?',
    a: 'Discovery and sales-process design, pipeline architecture, custom field design, data migration from your old CRM or spreadsheets, automation setup, integration configuration, dashboard and reporting build, user training and a structured go-live with two weeks of hypercare support afterwards.',
  },
  {
    q: 'Do we need to clean our data before migrating to Pipedrive?',
    a: 'We handle data cleansing as part of the migration — deduplication, normalisation, ownership re-assignment and field mapping. Going in with dirty data and hoping to fix it later is the single most common reason CRM rollouts fail. We do not let that happen.',
  },
  {
    q: 'What is the difference between implementation and setup?',
    a: 'Setup is fixed-scope and assumes you have already designed your sales process — we install Pipedrive against your spec. Implementation is broader: we design the sales process with you, then build the CRM around it, then migrate, train and launch. Implementation is the right answer if you do not already know exactly what you want Pipedrive to look like.',
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
          { name: 'Pipedrive Implementation', path: '/pipedrive-implementation/' },
        ])}
      />

      <PageHero
        eyebrow="Pipedrive Implementation"
        heading="A Pipedrive implementation done right, first time."
        lead="Phased rollouts with process design, data migration, automation, training and go-live support — from the team that has shipped 200+ Pipedrive projects."
        primaryCta={{ href: '/contact-2/', label: 'Scope your implementation →' }}
        secondaryCta={{ href: '/projects/', label: 'See past rollouts' }}
      />

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">Why most CRM implementations fail</span>
            <h2>It is rarely the software.</h2>
          </div>
          <div>
            <p>
              When a CRM rollout fails, it almost never fails because the software cannot do the work.
              It fails because the sales process was never written down, the data migration was never
              audited, the team was never trained, or the executive sponsor never showed up to the
              kickoff. A good Pipedrive implementation addresses all four directly — and that is what
              separates an implementation project from "buying a CRM."
            </p>
            <p style={{ marginTop: 16 }}>
              We design the sales process before we touch the configuration. We audit the source data
              before we migrate. We train the team before we go live. And we stay with you for two
              weeks of hypercare after launch — when the real questions surface.
            </p>
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container">
          <span className="as-eyebrow">Phased delivery</span>
          <h2>Five phases. Six to eight weeks.</h2>
          <div className="as-grid-2" style={{ marginTop: 40 }}>
            <article className="as-card">
              <h3>1. Discovery &amp; sales-process design</h3>
              <p>
                We interview sales leadership and front-line reps, map your current process, identify
                friction and design the target Pipedrive process. Output: a written process document and
                a Pipedrive architecture diagram you can review before any build starts.
              </p>
            </article>
            <article className="as-card">
              <h3>2. Configuration &amp; build</h3>
              <p>
                Pipelines, stages, custom fields, user roles, deal types, products, activity types — all
                configured against the approved design. We build in a sandbox environment first wherever
                possible.
              </p>
            </article>
            <article className="as-card">
              <h3>3. Data migration</h3>
              <p>
                We pull your data out of legacy CRM or spreadsheets, cleanse and dedupe it, map fields,
                and load it into Pipedrive with full audit logs. Every record traceable back to source.
              </p>
            </article>
            <article className="as-card">
              <h3>4. Automation &amp; integration</h3>
              <p>
                Workflow automation built natively in Pipedrive plus Zapier/Make/API integrations for
                the surrounding stack — email, calendar, accounting, lead sources, marketing automation.
              </p>
            </article>
            <article className="as-card">
              <h3>5. Training &amp; go-live</h3>
              <p>
                Role-based training (rep, manager, admin), written documentation tailored to your
                Pipedrive instance, and a structured go-live with two weeks of hypercare support.
              </p>
            </article>
            <article className="as-card">
              <h3>Optional — hypercare retainer</h3>
              <p>
                Many clients keep us on a light retainer for the first three months post-launch to
                handle change requests, dashboard tweaks and the inevitable "could Pipedrive also..."
                conversations as the team gets fluent.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">Implementation vs setup vs help</span>
            <h2>Which engagement fits you.</h2>
          </div>
          <div>
            <p>
              If you are moving from no CRM, from spreadsheets, or from a different CRM — you want
              <Link href="/pipedrive-implementation/"> implementation</Link>. Full process design,
              migration, training and launch.
            </p>
            <p style={{ marginTop: 16 }}>
              If you already know your process and just want Pipedrive installed against a spec —
              <Link href="/pipedrive-setup/"> setup</Link> is faster and cheaper.
            </p>
            <p style={{ marginTop: 16 }}>
              If you already have Pipedrive and something specific is broken —{' '}
              <Link href="/pipedrive-help/">help</Link> or our{' '}
              <Link href="/pipedrive-automation/">automation</Link> service is the right fit.
            </p>
            <p style={{ marginTop: 16 }}>
              For anything complex, multi-team or multi-pipeline, talk to a senior{' '}
              <Link href="/pipedrive-consultant/">Pipedrive Consultant</Link> first to scope properly.
            </p>
          </div>
        </div>
      </section>

      <RecentProjects
        eyebrow="A sample of our work"
        projects={[
          {
            slug: 'increasing-sales-for-a-high-tech-high-growth-startup',
            title: 'Pipedrive launch in 2 weeks',
            body: 'Full Pipedrive implementation for a Los Angeles fintech — data cleansing, dedupe, timezone formulas and a sales dashboard built against an aggressive deadline.',
            image: '/images/projects/data-import.jpeg',
          },
          {
            slug: 'taking-an-offline-lead-management-process-online-and-automating-it-through-pipedrive',
            title: 'Offline to Pipedrive',
            body: 'A US non-profit moved off spreadsheets onto Pipedrive — every awareness, qualification and shipment step automated against the right deal.',
            image: '/images/projects/pipeline.jpeg',
          },
        ]}
      />

      <section className="as-section as-section-muted">
        <div className="as-container" style={{ maxWidth: 880 }}>
          <span className="as-eyebrow">FAQ</span>
          <h2>Pipedrive implementation — common questions.</h2>
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

      <RelatedPipedriveServices currentPath="/pipedrive-implementation/" />

      <CtaBox
        heading="Ready to scope your Pipedrive implementation?"
        body="Tell us where you are today (no CRM, current CRM, spreadsheets) and where you want to be. We will come back with a scoped plan."
        primary={{ href: '/contact-2/', label: 'Start scoping →' }}
        secondary={{ href: '/pipedrive-consultant/', label: 'Pipedrive Consultant overview' }}
      />
    </>
  );
}
