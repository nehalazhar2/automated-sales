import Link from 'next/link';
import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import RecentProjects from '@/components/RecentProjects';
import RelatedPipedriveServices from '@/components/RelatedPipedriveServices';
import { DEFAULT_ITEMS as PROOF_ITEMS } from '@/components/ProofList';
import TestimonialsMarquee from '@/components/TestimonialsMarquee';
import { TESTIMONIALS } from '@/lib/testimonials';
import StructuredData from '@/components/seo/StructuredData';
import { faqSchema, breadcrumbSchema } from '@/components/seo/schemas';
import { SITE_URL } from '@/lib/site';
import FaqAsk from '@/components/FaqAsk';

const TRIAL_URL =
  'https://app.pipedrive.com/affiliate/pdp-automated-sales?utm_content=copy_text&utm_medium=partners_program&utm_source=Automated%20Sales&utm_term=pdp-automated-sales';

export type MarketPageProps = {
  path: string;
  crumb: string;
  countryName: string;
  heroHeading: string;
  heroLead: string;
  introHeading: string;
  intro: string[];
  whyHeading: string;
  why: string;
  audience: string;
  faqs: Array<{ q: string; a: string }>;
  serviceName: string;
  otherMarket: { href: string; label: string };
};

const SERVICES = [
  { title: 'Implementation and setup', body: 'Pipelines, stages, custom fields, lead routing, data import and clean-up, built around how your team actually sells.' },
  { title: 'Sales automation', body: 'Workflows that create follow-up tasks, move deals, assign owners and send emails so nothing slips through the cracks.' },
  { title: 'Integrations', body: 'Pipedrive connected to your email, website forms, accounting, marketing and support tools through Zapier, Make or direct API work.' },
  { title: 'Reporting and dashboards', body: 'Forecasts, activity reports and pipeline views that managers and owners trust and your team will actually use.' },
  { title: 'Training', body: 'Practical sessions for reps, managers and admins, tailored to your own pipeline rather than a generic demo.' },
  { title: 'AI and Claude MCP', body: 'Connect Pipedrive to AI assistants so your team can query and update the CRM in plain English.' },
];

const STEPS = [
  { title: 'Free CRM audit', body: 'A 30-minute call to review how you sell today and where deals stall.' },
  { title: 'Plan', body: 'A clear scope, timeline and price before any work starts.' },
  { title: 'Build', body: 'We configure, automate and integrate, testing with your real data.' },
  { title: 'Train and support', body: 'Your team is trained and we stay on hand after go-live.' },
];

export default function MarketPage(p: MarketPageProps) {
  return (
    <>
      <StructuredData data={faqSchema(p.faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Pipedrive Consultant', path: '/pipedrive-consultant/' },
          { name: p.crumb, path: p.path },
        ])}
      />
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: p.serviceName,
          serviceType: 'Pipedrive consulting, implementation, automation and training',
          provider: { '@id': `${SITE_URL}/#organization` },
          areaServed: { '@type': 'Country', name: p.countryName },
          url: `${SITE_URL}${p.path}`,
        }}
      />

      <PageHero
        eyebrow={p.crumb}
        heading={p.heroHeading}
        lead={p.heroLead}
        primaryCta={{ href: '/contact-2/', label: 'Book a free CRM audit →' }}
        secondaryCta={{ href: TRIAL_URL, label: 'Get an extended free Pipedrive trial', sponsored: true }}
        proofItems={PROOF_ITEMS}
      />

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">Get to know us</span>
            <h2>{p.introHeading}</h2>
          </div>
          <div>
            {p.intro.map((t, i) => (
              <p key={i} style={i ? { marginTop: 16 } : undefined}>{t}</p>
            ))}
            <p style={{ marginTop: 16 }}>
              <Link className="as-btn as-btn-secondary" href="/about-2/">Learn more →</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container">
          <span className="as-eyebrow">Our services</span>
          <h2>{p.whyHeading}</h2>
          <p style={{ marginTop: 16, maxWidth: 760 }}>{p.why}</p>
          <div className="as-grid-2" style={{ marginTop: 40 }}>
            {SERVICES.map((s) => (
              <article key={s.title} className="as-card">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
          <div className="as-actions" style={{ justifyContent: 'center', marginTop: 40 }}>
            <Link className="as-btn as-btn-primary" href="/contact-2/">Talk to us today →</Link>
          </div>
        </div>
      </section>

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">Who we work with</span>
            <h2>Built for teams that sell.</h2>
          </div>
          <div>
            <p>{p.audience}</p>
            <p style={{ marginTop: 16 }}>
              Already on Pipedrive? We also review and fix existing setups. Moving from another CRM? We
              handle the data, the rebuild and the training.
            </p>
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container">
          <span className="as-eyebrow">How we work</span>
          <h2>From audit to go-live in four steps.</h2>
          <div className="as-grid-2" style={{ marginTop: 40 }}>
            {STEPS.map((s, i) => (
              <article key={s.title} className="as-card">
                <h3>{i + 1}. {s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <RecentProjects
        projects={[
          {
            slug: 'leadrouter-case-study',
            title: 'Building LeadRouter — Pipedrive lead routing SaaS',
            body: 'After rebuilding the same Pipedrive lead routing logic for client after client, we built it once — properly — as a standalone SaaS product with performance weighting, deal continuity, and multi-team support.',
            image: '/images/projects/leadrouter.png',
          },
          {
            slug: 'pipedrive-activity-report',
            title: 'Pipedrive Activity Report Tool',
            body: "We replaced a client's weekly manual spreadsheet routine with a hosted web app that pulls live data from Pipedrive and automatically emails the report every Friday.",
            image: '/images/projects/pipedrive-activity-report.png',
          },
          {
            slug: 'pipedrive-claude-mcp-recent-project',
            title: 'Pipedrive Claude MCP',
            body: 'Building a private MCP for Claude, allowing teams to uncover deep insights into sales performance using AI.',
            image: '/images/projects/Pipedrive_Claude_MCP.png',
          },
        ]}
      />

      <section className="as-section">
        <div className="as-container">
          <span className="as-eyebrow">Testimonials</span>
          <h2>What clients say.</h2>
        </div>
        <TestimonialsMarquee testimonials={TESTIMONIALS} />
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container" style={{ maxWidth: 880 }}>
          <span className="as-eyebrow">FAQ&apos;s</span>
          <h2>{p.crumb} — common questions.</h2>
          <div style={{ marginTop: 32, display: 'grid', gap: 16 }}>
            {p.faqs.map((f) => (
              <details key={f.q} className="as-card" style={{ padding: '20px 24px' }}>
                <summary style={{ fontWeight: 900, fontSize: 18, cursor: 'pointer' }}>{f.q}</summary>
                <p style={{ marginTop: 12 }}>{f.a}</p>
              </details>
            ))}
            <FaqAsk />
          </div>
        </div>
      </section>

      <RelatedPipedriveServices currentPath="/pipedrive-partner/" heading="Specialised Pipedrive services." />

      <section className="as-section">
        <div className="as-container">
          <p>
            Also see our{' '}
            <Link href={p.otherMarket.href}>{p.otherMarket.label}</Link>, or read more about our{' '}
            <Link href="/pipedrive-consultant/">Pipedrive consultancy services</Link>.
          </p>
        </div>
      </section>

      <CtaBox
        heading="Not sure what you need?"
        body="Book a free 30-minute CRM audit and leave with a clear list of improvements, whether or not you work with us."
        primary={{ href: '/contact-2/', label: 'Book a CRM audit →' }}
        secondary={{ href: '/pipedrive-zapier-active-campaign-services/', label: 'See all services' }}
      />
    </>
  );
}
