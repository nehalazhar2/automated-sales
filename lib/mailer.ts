import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';

let cached: Transporter | null = null;

function getTransport(): Transporter {
  if (cached) return cached;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = (process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';

  if (!host || !user || !pass) {
    throw new Error('SMTP env vars missing (SMTP_HOST, SMTP_USER, SMTP_PASS)');
  }

  cached = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
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
  const transport = getTransport();
  const to = process.env.CONTACT_TO || process.env.SMTP_USER!;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;

  const lines = [
    `Name:    ${payload.name}`,
    `Email:   ${payload.email}`,
    payload.company ? `Company: ${payload.company}` : null,
    payload.service ? `Service: ${payload.service}` : null,
    '',
    payload.message,
  ].filter(Boolean);

  await transport.sendMail({
    to,
    from,
    replyTo: `${payload.name} <${payload.email}>`,
    subject: `Automated Sales website enquiry — ${payload.name}`,
    text: lines.join('\n'),
  });
}
