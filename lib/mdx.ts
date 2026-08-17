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

export function getAllSlugsIncludingDrafts(): string[] {
  const dirs: Array<'posts' | 'case-studies'> = ['posts', 'case-studies'];
  const slugs: string[] = [];
  for (const collection of dirs) {
    const dir = path.join(CONTENT_ROOT, collection);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith('.mdx')) slugs.push(file.replace(/\.mdx$/, ''));
    }
  }
  return slugs;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getUniqueSlug(title: string): string {
  const base = slugify(title);
  const existing = new Set(getAllSlugsIncludingDrafts());
  if (!existing.has(base)) return base;
  let n = 2;
  while (existing.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

const WORDS_PER_MINUTE = 200;

export function estimateReadingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function getAllCategories(): string[] {
  const categories = new Set<string>();
  for (const post of getAllPosts()) {
    if (post.frontmatter.category) categories.add(post.frontmatter.category);
  }
  return [...categories].sort();
}

export function getRelatedPosts(slug: string, category: string | undefined, limit = 3): PostRecord[] {
  const posts = getAllPosts().filter((p) => p.slug !== slug);
  const sameCategory = category ? posts.filter((p) => p.frontmatter.category === category) : [];
  const rest = posts.filter((p) => !sameCategory.includes(p));
  return [...sameCategory, ...rest].slice(0, limit);
}
