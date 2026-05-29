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
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Pipedrive Integration — Connect Pipedrive To Your Stack',
  description:
    'Pipedrive integration services. Connect Pipedrive to email, calendar, accounting, lead sources, AI tools and your back-office stack via Zapier, Make or direct API.',
  path: '/pipedrive-integration/',
});

const FAQS = [
  {
    q: 'Should we integrate Pipedrive with Zapier, Make, or directly via the API?',
    a: 'Zapier and Make are the right answer for most teams — fast to ship, easy to maintain, low risk. We move to a direct API integration when volume makes Zapier expensive, when the logic is too complex for a low-code tool or when you need transactional integrity that no-code cannot guarantee. We will recommend the most suitable approach for your specefic requirements.',
  },
  {
    q: 'What integrations have you built before?',
    a: 'Email and calendar (Google, Microsoft 365), accounting (Xero, QuickBooks), e-signature (DocuSign, PandaDoc), lead sources (Facebook Lead Ads, web forms, LinkedIn), marketing automation (ActiveCampaign, Mailchimp, HubSpot), AI tools (Fireflies, OpenAI), data warehouses (BigQuery, Snowflake), and bespoke back-office systems. If you have a tool with an API, we have probably integrated something similar.',
  },
  {
    q: 'How do you handle two-way sync conflicts?',
    a: 'We design a single source of truth per field — never both. Conflict resolution is explicit and documented up front. Most "two-way sync went wrong" stories are really "we never decided which system owns this field" stories. We do not let that happen.',
  },
  {
    q: 'What happens when an integration fails?',
    a: 'Every integration we build includes error-handling, alerting and retry logic. You will know about a failure before your reps notice. For business-critical integrations we add daily reconciliation checks and a documented replay procedure so missed records can be recovered.',
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
          { name: 'Pipedrive Integration', path: '/pipedrive-integration/' },
        ])}
      />

      <PageHero
        eyebrow="Pipedrive Integration"
        heading="Connect Pipedrive to everything else."
        lead="Email, calendar, accounting, lead sources, AI, data warehouse — integrated cleanly via Zapier, Make or direct API by people who have shipped hundreds of integrations."
        primaryCta={{ href: '/contact-2/', label: 'Talk integrations →' }}
        secondaryCta={{ href: '/zapier-consultants/', label: 'Zapier-specific work' }}
        proofItems={PROOF_ITEMS}
      />

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">The decision that matters</span>
            <h2>Where Pipedrive sits in the stack.</h2>
          </div>
          <div>
            <p>
              Pipedrive can be the centre of your sales stack — the source of truth for who your
              customers are and where each deal stands. Or it can be a downstream sink that receives
              data from your marketing platform. Both work. They imply very different integration
              architectures. The first thing we do on any integration project is establish where
              Pipedrive sits and which fields it owns.
            </p>
            <p style={{ marginTop: 16 }}>
              Once that is agreed, the integration design becomes straightforward. Skip that step and
              every integration becomes a debate about whose data is right.
            </p>
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container">
          <span className="as-eyebrow">Integration patterns</span>
          <h2>How we connect Pipedrive to your stack.</h2>
          <div className="as-grid-2" style={{ marginTop: 40 }}>
            <article className="as-card">
              <h3>Email &amp; calendar</h3>
              <p>
                Native sync for Gmail and Microsoft 365 — emails, meetings and call records attached to
                the right deal automatically. Plus sender-domain rules so spam and personal email do
                not pollute the CRM.
              </p>
            </article>
            <article className="as-card">
              <h3>Lead sources</h3>
              <p>
                Web forms, Facebook Lead Ads, LinkedIn, partner referrals, third-party data providers —
                all flowing into Pipedrive with source attribution preserved, deduped against existing
                contacts, and routed to the right owner.
              </p>
            </article>
            <article className="as-card">
              <h3>Marketing automation</h3>
              <p>
                Two-way sync with ActiveCampaign, HubSpot Marketing or Mailchimp — lifecycle stage and
                engagement scoring flowing back from marketing, deal status and ownership flowing
                forward from sales.
              </p>
            </article>
            <article className="as-card">
              <h3>Quoting, contracts &amp; billing</h3>
              <p>
                Pipedrive to PandaDoc or DocuSign for proposals and e-signature, then through to Xero
                or QuickBooks for invoicing — with status flowing back so reps can see contract and
                payment state without leaving the CRM.
              </p>
            </article>
            <article className="as-card">
              <h3>AI &amp; voice</h3>
              <p>
                Fireflies, Otter or custom OpenAI integrations for call transcription, deal summaries,
                lead scoring and next-best-action recommendations — written back to Pipedrive against
                the deal, not buried in a separate tool.
              </p>
            </article>
            <article className="as-card">
              <h3>Data warehouse &amp; BI</h3>
              <p>
                Streaming or batch syncs to BigQuery, Snowflake or Postgres for executive reporting,
                attribution modelling and joining Pipedrive data with product or finance data outside
                the CRM.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="as-section">
        <div className="as-container as-split">
          <div>
            <span className="as-eyebrow">Which approach we will recommend</span>
            <h2>Zapier vs Make vs custom API.</h2>
          </div>
          <div>
            <p>
              <strong>Zapier</strong> is the right answer when the logic is straightforward, volume is
              modest, and the team will own maintenance themselves. Fastest to ship.
            </p>
            <p style={{ marginTop: 16 }}>
              <strong>Make (Integromat)</strong> is the right answer when the logic is conditional,
              when you need iterators or aggregators, or when Zapier task pricing becomes painful at
              scale. More powerful, slightly steeper learning curve.
            </p>
            <p style={{ marginTop: 16 }}>
              <strong>Direct API</strong> is the right answer when volume is high, when latency
              matters, when transactional integrity is required, or when the integration is core
              enough to your business that you do not want to depend on a third-party automation
              platform. Most expensive to build, cheapest to run long-term.
            </p>
            <p style={{ marginTop: 16 }}>
              For deeper Zapier-specific work see our{' '}
              <Link href="/zapier-consultants/">Zapier consultants</Link> service. For broader strategy
              advice across all three approaches, talk to a senior{' '}
              <Link href="/pipedrive-consultant/">Pipedrive Consultant</Link>.
            </p>
          </div>
        </div>
      </section>

      <RecentProjects
        eyebrow="A sample of our work"
        projects={[
          {
            slug: 'automating-lettings-agencys-process',
            title: 'Automated lettings pipeline',
            body: 'Pipedrive plus a stack of integrations turned a fast-growing Canadian lettings agency into a near-fully-automated business — saving an entire FTE.',
            image: '/images/projects/lettings-agent.png',
          },
          {
            slug: 'increasing-sales-for-a-high-tech-high-growth-startup',
            title: 'Pipedrive launch in 2 weeks',
            body: 'Pipedrive plus deduped data, timezone formulas and a half-dozen integrations live in two weeks for a Los Angeles fintech.',
            image: '/images/projects/data-import.jpeg',
          },
        ]}
      />

      <section className="as-section as-section-muted">
        <div className="as-container" style={{ maxWidth: 880 }}>
          <span className="as-eyebrow">FAQ</span>
          <h2>Pipedrive integration — common questions.</h2>
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

      <section className="as-section">
        <div className="as-container">
          <span className="as-eyebrow">Testimonials</span>
          <h2>What clients say.</h2>
        </div>
        <TestimonialsMarquee testimonials={TESTIMONIALS} />
      </section>

      <RelatedPipedriveServices currentPath="/pipedrive-integration/" />

      <CtaBox
        heading="Connect Pipedrive to your stack — properly."
        body="Tell us the tools you want integrated and what should be source of truth. We will come back with an architecture sketch and a plan."
        primary={{ href: '/contact-2/', label: 'Scope an integration →' }}
        secondary={{ href: '/pipedrive-consultant/', label: 'Pipedrive Consultant overview' }}
      />
    </>
  );
}
