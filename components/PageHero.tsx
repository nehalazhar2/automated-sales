import Link from 'next/link';

type Props = {
  eyebrow: string;
  heading: string;
  lead: string;
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  dark?: boolean;
};

export default function PageHero({ eyebrow, heading, lead, primaryCta, secondaryCta, dark }: Props) {
  return (
    <section className={dark ? 'as-section as-section-dark' : 'as-hero'}>
      <div className="as-container">
        <span className={`as-eyebrow${dark ? ' dark' : ''}`}>{eyebrow}</span>
        <h1>{heading}</h1>
        <p className="as-lead">{lead}</p>
        {(primaryCta || secondaryCta) && (
          <div className="as-actions">
            {primaryCta && (
              <Link className="as-btn as-btn-primary" href={primaryCta.href}>
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link className="as-btn as-btn-secondary" href={secondaryCta.href}>
                {secondaryCta.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
