import Link from 'next/link';

type Service = {
  href: string;
  label: string;
  blurb: string;
};

const ALL_SERVICES: Service[] = [
  {
    href: '/pipedrive-consultant/',
    label: 'Pipedrive consultants',
    blurb: 'Pipeline, process and reporting from a certified Global Pipedrive Partner.',
  },
  {
    href: '/ai-consultants/',
    label: 'AI consultants',
    blurb: 'Transcription, lead scoring and narrow AI agents tied to the CRM.',
  },
  {
    href: '/zapier-consultants/',
    label: 'Zapier consultants',
    blurb: 'Sales automation, integration plumbing and CRM hygiene that compounds.',
  },
  {
    href: '/active-campaign-consultants/',
    label: 'Active Campaign consultants',
    blurb: 'Lifecycle journeys, segmentation and sales-marketing handoff in ActiveCampaign.',
  },
  {
    href: '/website-design/',
    label: 'Website design',
    blurb: 'Fast, SEO-optimised company websites built in 7 days — the same SEO discipline we apply to sales systems.',
  },
  {
    href: '/pipedrive-zapier-active-campaign-services/',
    label: 'All services',
    blurb: 'The full service catalogue — CRM, automation, AI, websites and marketing automation.',
  },
];

type Props = {
  /** The current page's slug, e.g. '/pipedrive-consultant/'. Excluded from the list. */
  currentPath: string;
  eyebrow?: string;
  heading?: string;
};

export default function RelatedServices({
  currentPath,
  eyebrow = 'Related services',
  heading = 'Keep exploring.',
}: Props) {
  const services = ALL_SERVICES.filter((s) => s.href !== currentPath).slice(0, 3);
  return (
    <section className="as-section">
      <div className="as-container">
        <span className="as-eyebrow">{eyebrow}</span>
        <h2>{heading}</h2>
        <div className="as-grid-3" style={{ marginTop: 40 }}>
          {services.map((s) => (
            <article key={s.href} className="as-card">
              <h3>
                <Link href={s.href}>{s.label}</Link>
              </h3>
              <p>{s.blurb}</p>
              <p style={{ marginTop: 16 }}>
                <Link className="as-btn as-btn-secondary" href={s.href}>
                  Learn more →
                </Link>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
