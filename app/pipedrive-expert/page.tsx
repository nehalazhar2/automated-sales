import Link from 'next/link';
import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import RecentProjects from '@/components/RecentProjects';
import RelatedPipedriveServices from '@/components/RelatedPipedriveServices';
import StructuredData from '@/components/seo/StructuredData';
import { faqSchema, breadcrumbSchema } from '@/components/seo/schemas';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Pipedrive Expert — Senior Pipedrive Consultants',
  description:
    'Pipedrive expert services from a  Global Pipedrive Partner. Senior consultants for complex sales operations, multi-pipeline builds and CRM rebuilds.',
  path: '/pipedrive-expert/',
});

const FAQS = [
  {
    q: 'When should I hire a Pipedrive expert rather than a generalist consultant?',
    a: 'Hire a Pipedrive expert when your build is non-trivial — multiple pipelines, custom fields driving automation, two-way integrations, complex reporting, or a previous setup that has drifted. A specialist who has shipped 200+ Pipedrive builds will avoid the dead-ends a generalist learns by burning your time.',
  },
  {
    q: 'What does "senior" mean on your team?',
    a: 'Our senior consultants have 5+ years working in Pipedrive specifically, have led at least 30 end-to-end implementations, and have backgrounds in sales leadership rather than just admin configuration. They are the people who own client outcomes — not handed off to juniors after kickoff.',
  },
  {
    q: 'Can a Pipedrive expert rescue a broken setup?',
    a: 'Yes — rescue work is one of our most common engagements. We audit the existing account, map what should stay versus what should be rebuilt, and migrate cleanly without losing historical deal data or reporting continuity.',
  },
  {
    q: 'How do you charge for expert-level work?',
    a: 'Project-based for scoped builds (recommended for rebuilds and implementations) and retainer for ongoing optimisation. We are upfront about scope and never bill for surprises — change requests are quoted before any work starts.',
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
          { name: 'Pipedrive Expert', path: '/pipedrive-expert/' },
        ])}
      />

      <PageHero
        eyebrow="Pipedrive Expert"
        heading="Senior Pipedrive experts for complex sales operations."
        lead="When your Pipedrive build matters — multi-pipeline, multi-team, integrated and automated — work with experts who have shipped 200+ Pipedrive projects."
        primaryCta={{ href: '/contact-2/', label: 'Talk to a Pipedrive expert →' }}
        secondaryCta={{ href: '/projects/', label: 'See recent work' }}
      />

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">What makes an expert different</span>
            <h2>Pattern recognition is the difference.</h2>
          </div>
          <div>
            <p>
              The first time you build a Pipedrive account, you make eight expensive mistakes. By the
              fiftieth, you make none — you recognise the shape of the problem in the first 20 minutes and
              you know which of three or four patterns it maps to. That pattern recognition is what you
              are buying from a senior Pipedrive expert. Not configuration speed. Not button-clicking.
              Judgement.
            </p>
            <p style={{ marginTop: 16 }}>
              We have built Pipedrive for SaaS founders, B2B agencies, property investors, recruitment
              firms, lettings agents, AI startups, and global manufacturers. Across those builds the
              underlying problems repeat. We have already solved yours.
            </p>
            <p style={{ marginTop: 16 }}>
              We are independent and product-led on Pipedrive — we do not push you to other CRMs to hit a
              partner quota. If Pipedrive is wrong for you, we will tell you. Most of the time, it is the
              right answer and the question is how to configure it for how your team actually sells.
            </p>
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container">
          <span className="as-eyebrow">Where senior expertise pays off</span>
          <h2>The work that needs an expert.</h2>
          <div className="as-grid-2" style={{ marginTop: 40 }}>
            <article className="as-card">
              <h3>Multi-pipeline architecture</h3>
              <p>
                When you sell more than one product, to more than one buyer type, in more than one
                process — pipeline design becomes a system architecture problem, not a configuration
                exercise. Choosing what is a stage, a pipeline, a deal type or a custom field is the
                most consequential decision in your build. Get it wrong and you rebuild within 18 months.
              </p>
            </article>
            <article className="as-card">
              <h3>Custom field strategy</h3>
              <p>
                Pipedrive lets you create unlimited custom fields. Most teams over-create them, then
                use them inconsistently, then lose them in reporting. A senior expert designs the field
                taxonomy around the questions your sales leadership will ask in 12 months — not just the
                data you happen to capture today.
              </p>
            </article>
            <article className="as-card">
              <h3>Two-way integration design</h3>
              <p>
                Zapier and Make solve the easy 70%. The other 30% — bidirectional sync conflicts, idempotent
                webhook handling, deduplication strategy, error recovery — is where teams either invest in
                experienced design upfront or pay for it in silent data corruption later.
              </p>
            </article>
            <article className="as-card">
              <h3>Reporting that survives reorganisation</h3>
              <p>
                Sales leadership changes. Targets change. Territories change. A senior Pipedrive expert
                designs reporting on stable foundations (deal value, won date, source) rather than on
                volatile fields, so your dashboards do not break every quarter.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">How we engage</span>
            <h2>Expert-led from kickoff to handover.</h2>
          </div>
          <div>
            <p>
              You speak to the senior consultant who will own the build before you sign anything. They
              run discovery themselves. They make the architectural decisions themselves. They do not
              hand you off to a junior after the kickoff call.
            </p>
            <p style={{ marginTop: 16 }}>
              Behind that senior lead you get our wider team — automation specialists for Zapier and
              Make work, integration engineers for API-level builds, and a Pipedrive Advisory Council
              member who shapes the product roadmap. The team you need, with the seniority you can feel.
            </p>
            <p style={{ marginTop: 16 }}>
              For straightforward setups our{' '}
              <Link href="/pipedrive-setup/">Pipedrive setup</Link> or{' '}
              <Link href="/pipedrive-implementation/">Pipedrive implementation</Link> services are the
              right fit. For everything more complex, you want a senior{' '}
              <Link href="/pipedrive-consultant/">Pipedrive Consultant</Link> who has seen this shape of
              problem before.
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
            slug: 'automating-lettings-agencys-process',
            title: 'Automated lettings pipeline',
            body: 'End-to-end Pipedrive automation for a fast-growing Canadian lettings agency — saving them an entire FTE.',
            image: '/images/projects/lettings-agent.png',
          },
        ]}
      />

      <section className="as-section as-section-muted">
        <div className="as-container" style={{ maxWidth: 880 }}>
          <span className="as-eyebrow">FAQ</span>
          <h2>Pipedrive expert — common questions.</h2>
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

      <RelatedPipedriveServices currentPath="/pipedrive-expert/" />

      <CtaBox
        heading="Need a senior Pipedrive expert on your project?"
        body="Tell us what you are trying to build and we will tell you whether you need an expert — or whether a lighter engagement will do."
        primary={{ href: '/contact-2/', label: 'Book a discovery call →' }}
        secondary={{ href: '/pipedrive-consultant/', label: 'Pipedrive Consultant overview' }}
      />
    </>
  );
}
