import Link from 'next/link';
import Image from 'next/image';

export type ProjectCardData = {
  slug: string;
  title: string;
  body: string;
  image?: string;
};

type Props = {
  eyebrow?: string;
  heading?: string;
  projects: ProjectCardData[];
};

export default function RecentProjects({
  eyebrow = 'Recent work',
  heading = 'A sample of our work.',
  projects,
}: Props) {
  return (
    <section className="as-section as-section-muted">
      <div className="as-container">
        <span className="as-eyebrow">{eyebrow}</span>
        <h2>{heading}</h2>
        <div className="as-grid-3" style={{ marginTop: 40 }}>
          {projects.map((p) => (
            <article key={p.slug} className="as-card">
              {p.image && (
                <Link href={`/${p.slug}/`} className="as-card-image">
                  <Image
                    src={p.image}
                    alt={p.title}
                    width={1000}
                    height={750}
                    sizes="(max-width:700px) 100vw, 400px"
                  />
                </Link>
              )}
              <span className="as-tag">Case study</span>
              <h3>
                <Link href={`/${p.slug}/`}>{p.title}</Link>
              </h3>
              <p>{p.body}</p>
              <p style={{ marginTop: 16 }}>
                <Link className="as-btn as-btn-secondary" href={`/${p.slug}/`}>
                  Read more →
                </Link>
              </p>
            </article>
          ))}
        </div>
        <div className="as-actions" style={{ justifyContent: 'center', marginTop: 32 }}>
          <Link className="as-btn as-btn-secondary" href="/projects/">
            View all projects →
          </Link>
        </div>
      </div>
    </section>
  );
}
