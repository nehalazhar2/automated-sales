export type Msg = { role: 'user' | 'assistant'; content: string };

const MAX_BYTES = 90_000;
const enc = new TextEncoder();
const byteLen = (s: string) => enc.encode(s).length;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function transcriptToHtml(
  messages: Msg[],
  meta: { conversationId: string; pathname: string; startedAt?: string }
): string {
  const startedAt = meta.startedAt ?? new Date().toISOString();
  const header = [
    `<p><strong>Chat with Automated Sales</strong></p>`,
    `<p>Conversation: <code>${escapeHtml(meta.conversationId)}</code><br>`,
    `Started: ${escapeHtml(startedAt)}<br>`,
    `Last page: ${escapeHtml(meta.pathname)}</p>`,
    `<hr>`,
  ].join('');

  const lines = messages.map((m) => {
    const who = m.role === 'user' ? 'Visitor' : 'Agent';
    const content = escapeHtml(m.content).replace(/\n/g, '<br>');
    return `<p><strong>${who}:</strong> ${content}</p>`;
  });

  let html = header + lines.join('');
  if (byteLen(html) <= MAX_BYTES) return html;

  // Trim oldest messages until under cap
  const kept: string[] = [];
  for (let i = lines.length - 1; i >= 0; i--) {
    kept.unshift(lines[i]);
    const candidate =
      header +
      `<p><em>[Earlier messages truncated]</em></p>` +
      kept.join('');
    if (byteLen(candidate) > MAX_BYTES) {
      kept.shift();
      break;
    }
  }
  return header + `<p><em>[Earlier messages truncated]</em></p>` + kept.join('');
}
