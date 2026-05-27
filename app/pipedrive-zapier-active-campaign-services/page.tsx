import PageHero from '@/components/PageHero';
import CtaBox from '@/components/CtaBox';
import { buildMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = buildMetadata({
  title: 'Services — Pipedrive, Zapier & Active Campaign',
  description:
    'Marketing, sales, automation and CRM services across Pipedrive, Active Campaign and Zapier. Sales strategists, CRM architects and integration partners.',
  path: '/pipedrive-zapier-active-campaign-services/',
});

const ABILITIES = [
  {
    title: 'Sales strategists',
    body:
      "We've award winning sales professionals. Having achieved record sales for blue chip corporates and agencies, founded and grown global tech businesses and worked freelance with clients around the world. We combine this vast sales experience with CRM expertise. This combination allows us to advise on your sales strategy, before creating processes and systems to achieve your goals.",
  },
  {
    title: 'CRM architects',
    body:
      "We're Pipedrive experts and Active Campaign specialists, able to craft efficient marketing and sales pipelines which move your prospects from initial awareness and enquiry through to won deals.",
  },
  {
    title: 'Integration partners',
    body:
      "Pipedrive and Active Campaign are incredibly powerful tools. When combined with third party platforms they can supercharge your sales and marketing initiatives. We setup direct integrations using marketplace tools, and harness the power of Zapier and Make (Integromat) to connect tools that don't have native integrations.",
  },
  {
    title: 'AI consultants',
    body:
      "AI sits alongside the CRM, not instead of it. We build narrow AI agents, call transcription, lead scoring and AI-powered next-best-action recommendations — all written back to Pipedrive against the deal, so reps see the answer in the CRM rather than chasing it across half a dozen tools.",
  },
  {
    title: 'Custom integration engineers',
    body:
      "Zapier and Make handle most integration work cleanly. For the cases where they cannot — high volume, transactional integrity, conditional logic too complex for low-code — we build direct API integrations with proper error handling, retry logic and reconciliation. We pick the cheapest tool that meets your reliability requirements.",
  },
  {
    title: 'Website design',
    body:
      "Fast, SEO-optimised company websites built in 48 hours from brief approval — the same SEO discipline we apply to our own site, packaged for businesses that need a credible web presence without a three-month agency build.",
  },
];

const STATS = [
  { label: 'Sales process mapping', value: 98 },
  { label: 'Pipedrive consultancy', value: 100 },
  { label: 'Active Campaign consultancy', value: 99 },
  { label: 'CRM consultancy', value: 99 },
  { label: 'Sales strategy', value: 99 },
  { label: 'Third party integrations', value: 98 },
];

const SERVICES = [
  'Pipedrive consultants',
  'Active Campaign consultants',
  'AI agents',
  'AI transcription',
  'Lead scoring with AI',
  'Custom API integration',
  'Webhook engineering',
  'Data warehouse integration',
  'Website design',
  'Company profile websites',
  'SEO-optimised websites',
  'Service design',
  'Zapier integration',
  'Mailchimp integration',
  'Calendly integration',
  'Zoom integration',
  'Mailshake integration',
  'Outfunnel integration',
  'JustCall integration',
  'Gravity forms integration',
  'GSuite integration',
  'Kixie integration',
  'Business process mapping',
  'Marketing automation',
];

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="What we do"
        heading="Ask us about anything marketing, sales, automation or CRM."
        lead="Marketing, sales, automation and CRM services across Pipedrive, Active Campaign and Zapier — delivered by sales strategists, CRM architects and integration partners."
        primaryCta={{ href: '/contact-2/', label: 'Get in touch →' }}
        secondaryCta={{ href: '/projects/', label: 'View projects' }}
      />

      <section className="as-section">
        <div className="as-container">
          <div className="as-grid-3">
            {ABILITIES.map((a) => (
              <article key={a.title} className="as-card">
                <h3>{a.title}</h3>
                <p>{a.body}</p>
              </article>
            ))}
          </div>
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <span className="as-eyebrow">New &amp; expanded</span>
            <div className="as-actions" style={{ justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              <Link className="as-btn as-btn-secondary" href="/ai-consultants/">AI consultants →</Link>
              <Link className="as-btn as-btn-secondary" href="/pipedrive-integration/">Custom integration →</Link>
              <Link className="as-btn as-btn-secondary" href="/website-design/">Website design →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="as-section as-section-muted">
        <div className="as-container">
          <span className="as-eyebrow">Statistics</span>
          <h2>Where we excel.</h2>
          <p className="as-lead" style={{ maxWidth: 760 }}>
            Our experience is vast. From running our own businesses and advising many others, we&apos;re confident
            in our ability to select the right technologies for the right task. Our core competencies are listed
            here, but see below for many other aspects we can assist with.
          </p>
          <div className="as-grid-2" style={{ marginTop: 40 }}>
            {STATS.map((s) => (
              <article key={s.label} className="as-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{s.label}</h3>
                  <span style={{ fontWeight: 900, color: 'var(--emerald-600)', fontSize: 22 }}>{s.value}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--slate-100)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.value}%`, background: 'var(--emerald-500)' }} />
                </div>
              </article>
            ))}
          </div>
          <div className="as-actions" style={{ justifyContent: 'center', marginTop: 40 }}>
            <Link className="as-btn as-btn-primary" href="/projects/">View projects →</Link>
          </div>
        </div>
      </section>

      <section className="as-section">
        <div className="as-container">
          <span className="as-eyebrow">Some of the things we can help with</span>
          <h2>Services.</h2>
          <div className="as-pill-list" style={{ marginTop: 24 }}>
            {SERVICES.map((s) => (
              <span key={s} className="as-pill" style={{ fontSize: 14, padding: '8px 14px' }}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      <CtaBox
        heading="Don't be shy, say hello."
        body="Tell us where the sales system is breaking down. We will scope a 30-minute audit and tell you what to fix first."
        primary={{ href: '/contact-2/', label: 'Contact us →' }}
      />
    </>
  );
}
