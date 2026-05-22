import 'server-only';
import { Resend } from 'resend';

let cached: Resend | null = null;

function getClient(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is missing');
  }
  cached = new Resend(key);
  return cached;
}

export type ContactPayload = {
  name: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
};

export async function sendContactEmail(payload: ContactPayload) {
  const resend = getClient();
  const to = process.env.CONTACT_TO;
  if (!to) throw new Error('CONTACT_TO is missing');

  // Default sender uses Resend's own verified domain so this works without
  // owning a verified domain. Once you verify automated-sales.com in Resend,
  // set CONTACT_FROM in env to e.g. "Automated Sales <hello@automated-sales.com>".
  const from = process.env.CONTACT_FROM || 'Automated Sales <onboarding@resend.dev>';

  const lines = [
    `Name:    ${payload.name}`,
    `Email:   ${payload.email}`,
    payload.company ? `Company: ${payload.company}` : null,
    payload.service ? `Service: ${payload.service}` : null,
    '',
    payload.message,
  ].filter(Boolean) as string[];

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: `${payload.name} <${payload.email}>`,
    subject: `Automated Sales website enquiry — ${payload.name}`,
    text: lines.join('\n'),
  });

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
}
