import { z } from 'zod';
import { transcriptToHtml } from '@/lib/chat/transcript';
import {
  findPersonByEmail,
  createPerson,
  createNote,
  updateNote,
  createLead,
  getPersonName,
} from '@/lib/pipedrive/client';
import { sendNewEnquiryEmail } from '@/lib/chat/notify';

export const runtime = 'edge';

const Body = z.object({
  email: z.string().email().max(320),
  transcript: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(8000),
      })
    )
    .min(1)
    .max(200),
  pathname: z.string().max(500),
  conversationId: z.string().min(8).max(64),
  personId: z.number().int().positive().optional(),
  noteId: z.number().int().positive().optional(),
  leadId: z.string().min(1).max(64).optional(),
  startedAt: z.string().max(40).optional(),
});

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;
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

function ok(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (!rateLimit(ip)) return ok({ ok: false, error: 'rate_limited' }, 429);

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return ok({ ok: false, error: 'invalid_body' }, 400);
  }

  const isFirstSync = !body.personId && !body.noteId && !body.leadId;

  try {
    let personId = body.personId;
    let existingPersonName: string | null = null;
    if (!personId) {
      personId = (await findPersonByEmail(body.email)) ?? undefined;
      if (personId) {
        try {
          existingPersonName = await getPersonName(personId);
        } catch {
          existingPersonName = null;
        }
      }
    }
    if (!personId) {
      const localPart = body.email.split('@')[0];
      personId = await createPerson({
        name: `Chat visitor (${localPart})`,
        email: body.email,
      });
    }

    const html = transcriptToHtml(body.transcript, {
      conversationId: body.conversationId,
      pathname: body.pathname,
      startedAt: body.startedAt,
    });

    let leadId = body.leadId;
    let leadUrl: string | undefined;
    if (isFirstSync && !leadId) {
      const hasRealName =
        existingPersonName &&
        existingPersonName.trim().length > 0 &&
        !/^chat visitor\b/i.test(existingPersonName.trim());
      const leadTitle = hasRealName
        ? existingPersonName!.trim()
        : `${body.email} - chat enquiry`;
      try {
        const lead = await createLead({
          title: leadTitle,
          personId,
        });
        leadId = lead.id;
        leadUrl = lead.url;
      } catch (e) {
        console.error('Pipedrive createLead failed', e);
      }
    }

    let noteId = body.noteId;
    if (!noteId) {
      noteId = await createNote({ personId, content: html, leadId });
    } else {
      await updateNote(noteId, html, { leadId });
    }

    if (isFirstSync) {
      try {
        await sendNewEnquiryEmail({
          email: body.email,
          pathname: body.pathname,
          conversationId: body.conversationId,
          personId,
          leadId,
          leadUrl,
          firstMessages: body.transcript,
        });
      } catch (e) {
        console.error('Resend notify failed', e);
      }
    }

    return ok({ ok: true, personId, noteId, leadId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'sync_failed';
    return ok({
      ok: false,
      error: 'pipedrive_error',
      message,
      personId: body.personId,
      noteId: body.noteId,
      leadId: body.leadId,
    });
  }
}
