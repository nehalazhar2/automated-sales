import Link from 'next/link';

type Props = {
  heading: string;
  body: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
};

export default function CtaBox({ heading, body, primary, secondary }: Props) {
  return (
    <section className="as-cta">
      <div className="as-container">
        <div className="as-cta-box">
          <span className="as-eyebrow dark">Ready when you are</span>
          <h2>{heading}</h2>
          <p>{body}</p>
          <div className="as-actions" style={{ justifyContent: 'center', marginTop: 32 }}>
            {primary && (
              <Link className="as-btn as-btn-primary" href={primary.href}>
                {primary.label}
              </Link>
            )}
            {secondary && (
              <Link className="as-btn as-btn-secondary" href={secondary.href}>
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
