import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { buildMetadata } from '@/lib/seo';
import { getAllPosts } from '@/lib/mdx';

export const metadata = buildMetadata({
  title: 'Blog — Pipedrive, Automation & AI Insights',
  description:
    'Articles on Pipedrive, sales automation, AI workflows and marketing automation from the Automated Sales team.',
  path: '/blog/',
});

export default function Page() {
  const posts = getAllPosts();
  return (
    <>
      <PageHero
        eyebrow="Blog"
        heading="Pipedrive, automation and AI — written for operators."
        lead="Field notes from CRM, automation, AI and marketing automation projects."
      />
      <section className="as-section">
        <div className="as-container">
          {posts.length === 0 ? (
            <p>Posts coming soon.</p>
          ) : (
            <div className="as-grid-3">
              {posts.map((p) => (
                <article key={p.slug} className="as-card">
                  {p.frontmatter.category && <span className="as-tag">{p.frontmatter.category}</span>}
                  <h3><Link href={`/${p.slug}/`}>{p.frontmatter.title}</Link></h3>
                  <p>{p.frontmatter.description}</p>
                  <p style={{ marginTop: 16, fontSize: 14, color: 'var(--slate-500)' }}>
                    {new Date(p.frontmatter.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
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
