import 'server-only';
import crypto from 'node:crypto';

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Returns an error Response if the request is unauthorized/misconfigured, else null. */
export function checkBlogApiKey(req: Request): Response | null {
  const apiKey = process.env.BLOG_API_KEY;
  if (!apiKey) {
    console.error('[blog api] BLOG_API_KEY not configured');
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }

  const provided = req.headers.get('x-blog-api-key') || '';
  if (!provided || !timingSafeEqual(provided, apiKey)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
