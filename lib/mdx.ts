import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  updated?: string;
  ogImage?: string;
  category?: string;
  author?: string;
  draft?: boolean;
  noIndex?: boolean;
};

export type PostRecord = {
  slug: string;
  collection: 'posts' | 'case-studies';
  frontmatter: PostFrontmatter;
  body: string;
};

const CONTENT_ROOT = path.join(process.cwd(), 'content');

function readCollection(collection: 'posts' | 'case-studies'): PostRecord[] {
  const dir = path.join(CONTENT_ROOT, collection);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '');
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const { data, content } = matter(raw);
      return {
        slug,
        collection,
        frontmatter: data as PostFrontmatter,
        body: content,
      };
    })
    .filter((r) => !r.frontmatter.draft);
}

export function getAllPosts(): PostRecord[] {
  return readCollection('posts').sort((a, b) =>
    a.frontmatter.date < b.frontmatter.date ? 1 : -1
  );
}

export function getAllCaseStudies(): PostRecord[] {
  return readCollection('case-studies').sort((a, b) =>
    a.frontmatter.date < b.frontmatter.date ? 1 : -1
  );
}

export function getAllMdxSlugs(): { slug: string }[] {
  return [...readCollection('posts'), ...readCollection('case-studies')].map((r) => ({
    slug: r.slug,
  }));
}

export function getMdxBySlug(slug: string): PostRecord | null {
  const all = [...readCollection('posts'), ...readCollection('case-studies')];
  return all.find((r) => r.slug === slug) || null;
}
