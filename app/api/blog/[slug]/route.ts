import { checkBlogApiKey } from '@/lib/blogAuth';
import { getContentFile, deleteContentFile } from '@/lib/github';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const COLLECTIONS = ['posts', 'case-studies'] as const;
type Collection = (typeof COLLECTIONS)[number];
const IMAGE_EXTENSIONS = ['png', 'jpg', 'webp', 'gif'];

async function deleteFeaturedImage(slug: string): Promise<void> {
  for (const ext of IMAGE_EXTENSIONS) {
    const path = `public/images/blog/${slug}.${ext}`;
    const file = await getContentFile(path);
    if (!file) continue;
    await deleteContentFile({ path, sha: file.sha, message: `blog: delete featured image for "${slug}"` });
    return;
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const authError = checkBlogApiKey(req);
  if (authError) return authError;

  const { slug } = await params;
  if (!SLUG_PATTERN.test(slug)) {
    return Response.json({ error: 'Invalid slug.' }, { status: 400 });
  }

  const collectionParam = new URL(req.url).searchParams.get('collection');
  if (collectionParam && !COLLECTIONS.includes(collectionParam as Collection)) {
    return Response.json({ error: 'collection must be "posts" or "case-studies".' }, { status: 400 });
  }
  const candidates: Collection[] = collectionParam ? [collectionParam as Collection] : [...COLLECTIONS];

  try {
    for (const collection of candidates) {
      const path = `content/${collection}/${slug}.mdx`;
      const file = await getContentFile(path);
      if (!file) continue;

      await deleteContentFile({
        path,
        sha: file.sha,
        message: `blog: delete "${slug}"`,
      });

      try {
        await deleteFeaturedImage(slug);
      } catch (err) {
        console.error('[/api/blog DELETE] Post deleted but failed to delete its featured image:', err);
      }

      return Response.json({ success: true, slug, deletedFrom: collection }, { status: 200 });
    }

    return Response.json({ error: 'Post not found.' }, { status: 404 });
  } catch (err) {
    console.error('[/api/blog DELETE]', err);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
