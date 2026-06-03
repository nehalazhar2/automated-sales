export async function sendNewEnquiryEmail(input: {
  email: string;
  pathname: string;
  conversationId: string;
  personId: number;
  leadId?: string;
  leadUrl?: string;
  firstMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not set');

  const to = process.env.CHAT_NOTIFY_TO || 'dan@automated-sales.com';
  const from = process.env.CONTACT_FROM || 'Automated Sales <onboarding@resend.dev>';
  const domain = process.env.PIPEDRIVE_DOMAIN;
  const personUrl = domain
    ? `https://${domain}.pipedrive.com/person/${input.personId}`
    : '';

  const preview = input.firstMessages
    .slice(-8)
    .map((m) => `${m.role === 'user' ? 'Visitor' : 'Agent'}: ${m.content}`)
    .join('\n\n');

  const lines = [
    `New chat enquiry from ${input.email}`,
    `Page: ${input.pathname}`,
    '',
    personUrl ? `Pipedrive person: ${personUrl}` : null,
    input.leadUrl ? `Pipedrive lead:   ${input.leadUrl}` : null,
    '',
    '— Conversation so far —',
    preview,
  ].filter(Boolean) as string[];

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: input.email,
      subject: `New chat enquiry — ${input.email}`,
      text: lines.join('\n'),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${text.slice(0, 300)}`);
  }
}
