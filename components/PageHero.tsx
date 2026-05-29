import Link from 'next/link';

type Cta = {
  href: string;
  label: string;
  /** If true, renders rel="nofollow sponsored noopener noreferrer" target="_blank". */
  sponsored?: boolean;
  /** If true, renders rel="noopener noreferrer" target="_blank" (without sponsored). */
  external?: boolean;
};

type Props = {
  eyebrow: string;
  heading: string;
  lead: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  dark?: boolean;
  /** Optional proof-point bullets rendered inside the hero, below the CTAs. */
  proofItems?: string[];
};

function CtaButton({ cta, className }: { cta: Cta; className: string }) {
  if (cta.sponsored || cta.external) {
    const rel = cta.sponsored
      ? 'nofollow sponsored noopener noreferrer'
      : 'noopener noreferrer';
    return (
      <a className={className} href={cta.href} target="_blank" rel={rel}>
        {cta.label}
      </a>
    );
  }
  return (
    <Link className={className} href={cta.href}>
      {cta.label}
    </Link>
  );
}

export default function PageHero({ eyebrow, heading, lead, primaryCta, secondaryCta, dark, proofItems }: Props) {
  return (
    <section className={dark ? 'as-section as-section-dark' : 'as-hero'}>
      <div className="as-container">
        <span className={`as-eyebrow${dark ? ' dark' : ''}`}>{eyebrow}</span>
        <h1>{heading}</h1>
        <p className="as-lead">{lead}</p>
        {(primaryCta || secondaryCta) && (
          <div className="as-actions">
            {primaryCta && <CtaButton cta={primaryCta} className="as-btn as-btn-primary" />}
            {secondaryCta && <CtaButton cta={secondaryCta} className="as-btn as-btn-secondary" />}
          </div>
        )}
        {proofItems && proofItems.length > 0 && (
          <div className="as-proof-list">
            {proofItems.map((item) => (
              <div key={item} className="as-proof-item">{item}</div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
