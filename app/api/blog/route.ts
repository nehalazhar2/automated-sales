import { z } from 'zod';
import { getUniqueSlug, slugify } from '@/lib/mdx';
import { htmlToMarkdown } from '@/lib/htmlToMarkdown';
import { createContentFile } from '@/lib/github';
import { checkBlogApiKey } from '@/lib/blogAuth';
import { isImageDataUri, parseImageDataUri } from '@/lib/images';

// ~4.5MB, matching Vercel's serverless request body limit (base64 inflates
// binary size by ~33%, so this caps the actual image around 3.3MB).
const MAX_IMAGE_DATA_URI_LENGTH = 4_500_000;

const Body = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  content: z.string().min(1),
  category: z.string().trim().min(1).optional(),
  author: z.string().trim().min(1).optional(),
  date: z.string().min(1).optional(),
  ogImage: z
    .string()
    .max(MAX_IMAGE_DATA_URI_LENGTH)
    .refine((v) => /^https?:\/\//i.test(v) || isImageDataUri(v), {
      message: 'ogImage must be a public http(s) URL or a PNG/JPEG/WEBP/GIF data URI.',
    })
    .optional(),
  collection: z.enum(['posts', 'case-studies']).optional(),
});

function frontmatterValue(value: string): string {
  return JSON.stringify(value);
}

export async function POST(req: Request) {
  const authError = checkBlogApiKey(req);
  if (authError) return authError;

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (err) {
    const ogImageIssue = err instanceof z.ZodError ? err.issues.find((i) => i.path[0] === 'ogImage') : undefined;
    return Response.json(
      { error: ogImageIssue?.message || 'Title, description, and content are required.' },
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

    let ogImage = body.ogImage;
    if (ogImage && isImageDataUri(ogImage)) {
      const parsed = parseImageDataUri(ogImage);
      if (!parsed) {
        return Response.json(
          { error: 'ogImage data URI must be PNG, JPEG, WEBP or GIF.' },
          { status: 400 }
        );
      }
      try {
        const imagePath = `public/images/blog/${slug}.${parsed.extension}`;
        await createContentFile({
          path: imagePath,
          content: parsed.base64,
          encoding: 'base64',
          message: `blog: upload featured image for "${body.title.trim()}"`,
        });
        ogImage = `/images/blog/${slug}.${parsed.extension}`;
      } catch (err) {
        console.error('[/api/blog] Failed to upload ogImage, publishing without it:', err);
        ogImage = undefined;
      }
    }

    const frontmatterLines = [
      '---',
      `title: ${frontmatterValue(body.title.trim())}`,
      `description: ${frontmatterValue(body.description.trim())}`,
      `date: ${frontmatterValue(date)}`,
      body.category ? `category: ${frontmatterValue(body.category.trim())}` : null,
      `author: ${frontmatterValue(body.author?.trim() || 'Automated Sales')}`,
      ogImage ? `ogImage: ${frontmatterValue(ogImage)}` : null,
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
