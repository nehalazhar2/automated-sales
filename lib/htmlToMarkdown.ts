import 'server-only';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import type { Schema } from 'hast-util-sanitize';

// Mirrors what content-blog-reference.md documents Contentful's Rich Text
// field as allowing, so HTML produced for that pipeline also works here.
const schema: Schema = {
  ...defaultSchema,
  tagNames: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'blockquote', 'br', 'hr',
    'ul', 'ol', 'li',
    'strong', 'b', 'em', 'i', 'u', 'code',
    'a',
    'img', 'figure', 'figcaption',
  ],
  attributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'loading'],
    figure: ['className'],
  },
  protocols: {
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https'],
  },
};

export async function htmlToMarkdown(html: string): Promise<string> {
  const file = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeSanitize, schema)
    .use(rehypeRemark)
    .use(remarkGfm)
    .use(remarkStringify, { bullet: '-', fences: true })
    .process(html);
  return String(file).trim();
}
