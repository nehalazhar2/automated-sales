import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { getAllMdxSlugs, getMdxBySlug, getRelatedPosts, estimateReadingTime } from '@/lib/mdx';
import { mdxComponents } from '@/components/MdxComponents';
import CoverImage from '@/components/CoverImage';
import CtaBox from '@/components/CtaBox';
import { buildMetadata } from '@/lib/seo';
import StructuredData from '@/components/seo/StructuredData';
import { blogPostingSchema, breadcrumbSchema } from '@/components/seo/schemas';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllMdxSlugs();
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const record = getMdxBySlug(slug);
  if (!record) return {};
  return buildMetadata({
    title: record.frontmatter.title,
    description: record.frontmatter.description,
    path: `/${slug}/`,
    ogImage: record.frontmatter.ogImage,
    type: 'article',
    publishedTime: record.frontmatter.date,
    modifiedTime: record.frontmatter.updated || record.frontmatter.date,
    noIndex: record.frontmatter.noIndex,
  });
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const record = getMdxBySlug(slug);
  if (!record) notFound();

  const isCaseStudy = record.collection === 'case-studies';
  const crumbBase = isCaseStudy
    ? { name: 'Projects', path: '/projects/' }
    : { name: 'Blog', path: '/blog/' };
  const relatedPosts = isCaseStudy ? [] : getRelatedPosts(slug, record.frontmatter.category);

  return (
    <>
      <StructuredData
        data={blogPostingSchema({
          title: record.frontmatter.title,
          description: record.frontmatter.description,
          slug,
          date: record.frontmatter.date,
          updated: record.frontmatter.updated,
          author: record.frontmatter.author,
          image: record.frontmatter.ogImage,
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          crumbBase,
          { name: record.frontmatter.title, path: `/${slug}/` },
        ])}
      />

      <article className="as-container as-section" style={{ maxWidth: 820 }}>
        <p style={{ marginBottom: 24, fontSize: 14, color: 'var(--slate-500)' }}>
          <Link href={crumbBase.path}>← {crumbBase.name}</Link>
        </p>
        {record.frontmatter.category && (
          <span className="as-tag">{record.frontmatter.category}</span>
        )}
        <h1>{record.frontmatter.title}</h1>
        <p className="as-lead">{record.frontmatter.description}</p>
        <p style={{ marginTop: 16, fontSize: 14, color: 'var(--slate-500)' }}>
          {record.frontmatter.author || 'Automated Sales'}
          {' · '}
          {new Date(record.frontmatter.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
          {' · '}
          {estimateReadingTime(record.body)} min read
        </p>

        {record.frontmatter.ogImage && (
          <figure
            style={{
              margin: '40px 0 0',
              borderRadius: 24,
              overflow: 'hidden',
              border: '1px solid var(--slate-200)',
              boxShadow: '0 20px 50px rgba(15,23,42,.08)',
              background: 'var(--slate-50)',
            }}
          >
            <CoverImage
              src={record.frontmatter.ogImage}
              alt={record.frontmatter.title}
              width={1600}
              height={1200}
              sizes="(max-width:820px) 100vw, 820px"
              priority
            />
          </figure>
        )}

        <div className="entry-content" style={{ marginTop: 40 }}>
          <MDXRemote
            source={record.body}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>

        {isCaseStudy && (
          <aside
            style={{
              marginTop: 56,
              padding: 28,
              background: 'var(--slate-50)',
              border: '1px solid var(--slate-200)',
              borderRadius: 24,
            }}
          >
            <span className="as-eyebrow" style={{ marginBottom: 12 }}>Get help with this</span>
            <p style={{ marginTop: 8, color: 'var(--slate-700)' }}>
              Want to apply a similar setup to your team?
            </p>
            <div className="as-actions" style={{ marginTop: 18 }}>
              <Link className="as-btn as-btn-primary" href="/contact-2/">
                Book a discovery call →
              </Link>
              <Link className="as-btn as-btn-secondary" href="/pipedrive-zapier-active-campaign-services/">
                See all services
              </Link>
            </div>
          </aside>
        )}

        {!isCaseStudy && relatedPosts.length > 0 && (
          <aside style={{ marginTop: 56 }}>
            <span className="as-eyebrow" style={{ marginBottom: 20 }}>Keep reading</span>
            <div className="as-grid-3">
              {relatedPosts.map((p) => (
                <article key={p.slug} className="as-card">
                  {p.frontmatter.category && <span className="as-tag">{p.frontmatter.category}</span>}
                  <h3><Link href={`/${p.slug}/`}>{p.frontmatter.title}</Link></h3>
                  <p>{p.frontmatter.description}</p>
                </article>
              ))}
            </div>
          </aside>
        )}
      </article>

      {!isCaseStudy && (
        <CtaBox
          heading="Want help putting this into practice?"
          body="Book a discovery call and we'll map out what this looks like for your team's Pipedrive, Zapier and ActiveCampaign setup."
          primary={{ href: '/contact-2/', label: 'Book a discovery call →' }}
          secondary={{ href: '/pipedrive-zapier-active-campaign-services/', label: 'See all services' }}
        />
      )}
    </>
  );
}
