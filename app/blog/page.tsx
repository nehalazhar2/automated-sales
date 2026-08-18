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

const POSTS_PER_PAGE = 9;

type Props = {
  searchParams: Promise<{ category?: string; page?: string }>;
};

function pageHref(category: string | undefined, page: number): string {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/blog/?${qs}` : '/blog/';
}

export default async function Page({ searchParams }: Props) {
  const { category, page: pageParam } = await searchParams;
  const posts = getAllPosts();
  const categories = getAllCategories();
  const filtered = category ? posts.filter((p) => p.frontmatter.category === category) : posts;

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

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
              {paginated.map((p) => (
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

          {totalPages > 1 && (
            <nav className="as-pagination" aria-label="Blog pagination">
              {page > 1 ? (
                <Link href={pageHref(category, page - 1)}>← Prev</Link>
              ) : (
                <span className="is-disabled">← Prev</span>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={pageHref(category, n)}
                  className={n === page ? 'is-active' : undefined}
                  aria-current={n === page ? 'page' : undefined}
                >
                  {n}
                </Link>
              ))}
              {page < totalPages ? (
                <Link href={pageHref(category, page + 1)}>Next →</Link>
              ) : (
                <span className="is-disabled">Next →</span>
              )}
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
