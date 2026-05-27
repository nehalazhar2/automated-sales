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
  attribution?: {
    landingPath?: string;
    referrer?: string;
    firstSeenAt?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    gclid?: string;
    fbclid?: string;
  };
  submittedFrom?: string;
};

export async function sendContactEmail(payload: ContactPayload) {
  const resend = getClient();
  const to = process.env.CONTACT_TO;
  if (!to) throw new Error('CONTACT_TO is missing');

  // Default sender uses Resend's own verified domain so this works without
  // owning a verified domain. Once you verify automated-sales.com in Resend,
  // set CONTACT_FROM in env to e.g. "Automated Sales <hello@automated-sales.com>".
  const from = process.env.CONTACT_FROM || 'Automated Sales <onboarding@resend.dev>';

  const a = payload.attribution || {};
  const attributionLines = [
    payload.submittedFrom ? `Submitted from: ${payload.submittedFrom}` : null,
    a.landingPath ? `Landing page:   ${a.landingPath}` : null,
    a.referrer ? `Referrer:       ${a.referrer}` : null,
    a.utm_source ? `UTM source:     ${a.utm_source}` : null,
    a.utm_medium ? `UTM medium:     ${a.utm_medium}` : null,
    a.utm_campaign ? `UTM campaign:   ${a.utm_campaign}` : null,
    a.utm_term ? `UTM term:       ${a.utm_term}` : null,
    a.utm_content ? `UTM content:    ${a.utm_content}` : null,
    a.gclid ? `gclid:          ${a.gclid}` : null,
    a.fbclid ? `fbclid:         ${a.fbclid}` : null,
    a.firstSeenAt ? `First seen:     ${a.firstSeenAt}` : null,
  ].filter(Boolean) as string[];

  const lines = [
    `Name:    ${payload.name}`,
    `Email:   ${payload.email}`,
    payload.company ? `Company: ${payload.company}` : null,
    payload.service ? `Service: ${payload.service}` : null,
    '',
    payload.message,
    ...(attributionLines.length ? ['', '— Attribution —', ...attributionLines] : []),
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
