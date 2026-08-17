import Link from 'next/link';
import PageHero from '@/components/PageHero';
import CoverImage from '@/components/CoverImage';
import { buildMetadata } from '@/lib/seo';
import { getAllPosts, getAllCategories, estimateReadingTime } from '@/lib/mdx';

export const metadata = buildMetadata({
  title: 'Blog — Pipedrive, Automation & AI Insights',
  description:
    'Articles on Pipedrive, sales automation, AI workflows and marketing automation from the Automated Sales team.',
  path: '/blog/',
});

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const { category } = await searchParams;
  const posts = getAllPosts();
  const categories = getAllCategories();
  const filtered = category ? posts.filter((p) => p.frontmatter.category === category) : posts;

  return (
    <>
      <PageHero
        eyebrow="Blog"
        heading="The latest in Pipedrive, marketing, automation and AI"
        lead="Field notes from CRM, automation, AI and marketing automation projects."
      />
      <section className="as-section">
        <div className="as-container">
          {categories.length > 0 && (
            <div className="as-filter-row">
              <Link href="/blog/" className={`as-filter-pill${!category ? ' is-active' : ''}`}>
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/blog/?category=${encodeURIComponent(c)}`}
                  className={`as-filter-pill${category === c ? ' is-active' : ''}`}
                >
                  {c}
                </Link>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <p>Posts coming soon.</p>
          ) : (
            <div className="as-grid-3">
              {filtered.map((p) => (
                <article key={p.slug} className="as-card">
                  {p.frontmatter.ogImage && (
                    <Link href={`/${p.slug}/`} className="as-card-image">
                      <CoverImage
                        src={p.frontmatter.ogImage}
                        alt={p.frontmatter.title}
                        width={800}
                        height={500}
                        sizes="(max-width:700px) 100vw, 360px"
                      />
                    </Link>
                  )}
                  {p.frontmatter.category && <span className="as-tag">{p.frontmatter.category}</span>}
                  <h3><Link href={`/${p.slug}/`}>{p.frontmatter.title}</Link></h3>
                  <p>{p.frontmatter.description}</p>
                  <p style={{ marginTop: 16, fontSize: 14, color: 'var(--slate-500)' }}>
                    {new Date(p.frontmatter.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {' · '}
                    {estimateReadingTime(p.body)} min read
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
