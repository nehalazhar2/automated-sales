import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import Image from 'next/image';
import { getAllMdxSlugs, getMdxBySlug } from '@/lib/mdx';
import { mdxComponents } from '@/components/MdxComponents';
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
          {new Date(record.frontmatter.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
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
            <Image
              src={record.frontmatter.ogImage}
              alt={record.frontmatter.title}
              width={1600}
              height={1200}
              sizes="(max-width:820px) 100vw, 820px"
              priority
              style={{ width: '100%', height: 'auto', display: 'block' }}
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
      </article>
    </>
  );
}
