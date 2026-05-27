import Link from 'next/link';

type Variant = {
  href: string;
  label: string;
  blurb: string;
};

export const PIPEDRIVE_VARIANTS: Variant[] = [
  {
    href: '/pipedrive-expert/',
    label: 'Pipedrive Expert',
    blurb: 'Senior Pipedrive consultants for complex sales operations and custom builds.',
  },
  {
    href: '/pipedrive-implementation/',
    label: 'Pipedrive Implementation',
    blurb: 'Phased Pipedrive rollouts — process design, data migration, training and go-live support.',
  },
  {
    href: '/pipedrive-setup/',
    label: 'Pipedrive Setup',
    blurb: 'Fixed-scope Pipedrive setup package for smaller teams who want a clean start.',
  },
  {
    href: '/pipedrive-help/',
    label: 'Pipedrive Help',
    blurb: 'Ad-hoc Pipedrive support — fix a stuck workflow, unblock a sync, clean up a pipeline.',
  },
  {
    href: '/pipedrive-training/',
    label: 'Pipedrive Training',
    blurb: 'Tailored Pipedrive training for sales teams, managers and admins — 1:1 or group.',
  },
  {
    href: '/pipedrive-integration/',
    label: 'Pipedrive Integration',
    blurb: 'Connect Pipedrive to your stack via Zapier, Make or direct API integrations.',
  },
  {
    href: '/pipedrive-automation/',
    label: 'Pipedrive Automation',
    blurb: 'Workflow automation, lead routing and CRM hygiene that runs while your team sells.',
  },
  {
    href: '/pipedrive-partner/',
    label: 'Pipedrive Partner',
    blurb: 'A Global Pipedrive Partner and Advisory Council member based in the UK.',
  },
];

const NEIGHBOURS: Record<string, string[]> = {
  '/pipedrive-expert/': ['/pipedrive-implementation/', '/pipedrive-automation/', '/pipedrive-integration/', '/pipedrive-partner/'],
  '/pipedrive-implementation/': ['/pipedrive-setup/', '/pipedrive-training/', '/pipedrive-expert/', '/pipedrive-integration/'],
  '/pipedrive-setup/': ['/pipedrive-implementation/', '/pipedrive-training/', '/pipedrive-help/', '/pipedrive-integration/'],
  '/pipedrive-help/': ['/pipedrive-setup/', '/pipedrive-training/', '/pipedrive-automation/', '/pipedrive-integration/'],
  '/pipedrive-training/': ['/pipedrive-setup/', '/pipedrive-implementation/', '/pipedrive-help/', '/pipedrive-expert/'],
  '/pipedrive-integration/': ['/pipedrive-automation/', '/pipedrive-implementation/', '/pipedrive-expert/', '/pipedrive-help/'],
  '/pipedrive-automation/': ['/pipedrive-integration/', '/pipedrive-expert/', '/pipedrive-implementation/', '/pipedrive-help/'],
  '/pipedrive-partner/': ['/pipedrive-expert/', '/pipedrive-implementation/', '/pipedrive-automation/', '/pipedrive-integration/'],
};

type Props = {
  currentPath: string;
  eyebrow?: string;
  heading?: string;
};

export default function RelatedPipedriveServices({
  currentPath,
  eyebrow = 'Specialised Pipedrive services',
  heading = 'Other ways we can help with Pipedrive.',
}: Props) {
  const slugs = NEIGHBOURS[currentPath] || PIPEDRIVE_VARIANTS.map((v) => v.href).filter((h) => h !== currentPath).slice(0, 4);
  const items = slugs
    .map((s) => PIPEDRIVE_VARIANTS.find((v) => v.href === s))
    .filter((v): v is Variant => Boolean(v));

  return (
    <section className="as-section as-section-muted">
      <div className="as-container">
        <span className="as-eyebrow">{eyebrow}</span>
        <h2>{heading}</h2>
        <div className="as-grid-2" style={{ marginTop: 40 }}>
          {items.map((v) => (
            <article key={v.href} className="as-card">
              <h3>
                <Link href={v.href}>{v.label}</Link>
              </h3>
              <p>{v.blurb}</p>
              <p style={{ marginTop: 16 }}>
                <Link className="as-btn as-btn-secondary" href={v.href}>
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
