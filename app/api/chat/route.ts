import { z } from 'zod';
import OpenAI from 'openai';

export const runtime = 'edge';

const Body = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
        images: z
          .array(z.string().startsWith('data:image/').max(8_000_000))
          .max(4)
          .optional(),
      })
    )
    .min(1)
    .max(20),
  pathname: z.string().max(500),
});

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
const hits = new Map<string, number[]>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) {
    hits.set(ip, arr);
    return false;
  }
  arr.push(now);
  hits.set(ip, arr);
  return true;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (!rateLimit(ip)) {
    return new Response('Too many messages. Try again in a minute.', { status: 429 });
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return new Response('Invalid request body.', { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const promptId = process.env.OPENAI_PROMPT_ID;
  if (!apiKey) return new Response('Chat is not configured.', { status: 500 });
  if (!promptId) return new Response('Prompt id not configured.', { status: 500 });

  const openai = new OpenAI({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const abort = new AbortController();
      const timeout = setTimeout(() => abort.abort(), 30_000);
      try {
        const events = await openai.responses.create(
          {
            prompt: {
              id: promptId,
              variables: { pathname: body.pathname },
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            input: body.messages.map((m): any => {
              if (m.role === 'assistant') {
                return { role: 'assistant', content: m.content || '' };
              }
              const parts: Array<
                { type: 'input_text'; text: string } | { type: 'input_image'; image_url: string; detail: 'auto' }
              > = [];
              if (m.content) parts.push({ type: 'input_text', text: m.content });
              if (m.images) {
                for (const img of m.images) {
                  parts.push({ type: 'input_image', image_url: img, detail: 'auto' });
                }
              }
              if (parts.length === 0) parts.push({ type: 'input_text', text: '' });
              return { role: 'user', content: parts };
            }),
            stream: true,
          },
          { signal: abort.signal }
        );

        for await (const event of events as AsyncIterable<{ type: string; delta?: string }>) {
          if (event.type === 'response.output_text.delta' && event.delta) {
            controller.enqueue(encoder.encode(event.delta));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Chat error.';
        controller.enqueue(encoder.encode(`\n\n[error: ${msg}]`));
      } finally {
        clearTimeout(timeout);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  });
}
