import crypto from 'node:crypto';
import { z } from 'zod';
import { getUniqueSlug, slugify } from '@/lib/mdx';
import { htmlToMarkdown } from '@/lib/htmlToMarkdown';
import { createContentFile } from '@/lib/github';

const Body = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  content: z.string().min(1),
  category: z.string().trim().min(1).optional(),
  author: z.string().trim().min(1).optional(),
  date: z.string().min(1).optional(),
  ogImage: z.string().url().optional(),
  collection: z.enum(['posts', 'case-studies']).optional(),
});

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function frontmatterValue(value: string): string {
  return JSON.stringify(value);
}

export async function POST(req: Request) {
  const apiKey = process.env.BLOG_API_KEY;
  if (!apiKey) {
    console.error('[/api/blog] BLOG_API_KEY not configured');
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }

  const provided = req.headers.get('x-blog-api-key') || '';
  if (!provided || !timingSafeEqual(provided, apiKey)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return Response.json(
      { error: 'Title, description, and content are required.' },
      { status: 400 }
    );
  }

  const baseSlug = slugify(body.title);
  if (!baseSlug) {
    return Response.json(
      { error: 'Title must contain at least one letter or number.' },
      { status: 400 }
    );
  }

  try {
    const slug = getUniqueSlug(body.title);
    const markdown = await htmlToMarkdown(body.content);
    const date = body.date || new Date().toISOString();
    const collection = body.collection || 'posts';

    const frontmatterLines = [
      '---',
      `title: ${frontmatterValue(body.title.trim())}`,
      `description: ${frontmatterValue(body.description.trim())}`,
      `date: ${frontmatterValue(date)}`,
      body.category ? `category: ${frontmatterValue(body.category.trim())}` : null,
      `author: ${frontmatterValue(body.author?.trim() || 'Automated Sales')}`,
      body.ogImage ? `ogImage: ${frontmatterValue(body.ogImage)}` : null,
      '---',
      '',
    ].filter((line): line is string => line !== null);

    const fileContent = `${frontmatterLines.join('\n')}\n${markdown}\n`;

    await createContentFile({
      path: `content/${collection}/${slug}.mdx`,
      content: fileContent,
      message: `blog: publish "${body.title.trim()}"`,
    });

    return Response.json(
      {
        success: true,
        slug,
        path: `/${slug}/`,
        note: 'Published to the content repo — live once the triggered deploy finishes.',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[/api/blog]', err);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
