import Link from 'next/link';

type Cta = {
  href: string;
  label: string;
  sponsored?: boolean;
  external?: boolean;
};

type Props = {
  heading: string;
  body: string;
  primary?: Cta;
  secondary?: Cta;
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

export default function CtaBox({ heading, body, primary, secondary }: Props) {
  return (
    <section className="as-cta">
      <div className="as-container">
        <div className="as-cta-box">
          <span className="as-eyebrow dark">Ready when you are</span>
          <h2>{heading}</h2>
          <p>{body}</p>
          <div className="as-actions" style={{ justifyContent: 'center', marginTop: 32 }}>
            {primary && <CtaButton cta={primary} className="as-btn as-btn-primary" />}
            {secondary && <CtaButton cta={secondary} className="as-btn as-btn-secondary" />}
          </div>
        </div>
      </div>
    </section>
  );
}
