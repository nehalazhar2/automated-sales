'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { greetingFor } from '@/lib/chat/greetings';

type Msg = { role: 'user' | 'assistant'; content: string; images?: string[] };

const MAX_IMAGE_BYTES = 4_000_000; // 4 MB per image
const MAX_IMAGES_PER_MESSAGE = 4;

// Strip the [[nav:/path]] marker from streamed text, including a
// partial marker at the end (e.g. "[[na" while a token is mid-stream)
// so the marker never flashes in the chat bubble.
function stripNavMarker(s: string): string {
  let out = s.replace(/\[\[nav:\/[a-z0-9\-\/]*\]\]/gi, '');
  const tailMatch = out.match(/\[\[(?:n(?:a(?:v(?::(?:\/[a-z0-9\-\/]*)?)?)?)?)?$/i);
  if (tailMatch) out = out.slice(0, tailMatch.index);
  return out.trimEnd();
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

const DISMISSED_PREFIX = 'as_chat_proactive_dismissed:';
const AUTO_OPEN_KEY = 'as_chat_auto_opened';
const AUTO_OPEN_MS = 30_000;
const CONV_ID_KEY = 'as_chat_conversation_id';
const STARTED_AT_KEY = 'as_chat_started_at';
const EMAIL_KEY = 'as_chat_email';
const PD_PERSON_KEY = 'as_chat_pipedrive_person_id';
const PD_NOTE_KEY = 'as_chat_pipedrive_note_id';
const PD_LEAD_KEY = 'as_chat_pipedrive_lead_id';
const EMAIL_RE = /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i;
const NAV_RE = /\[\[nav:(\/[a-z0-9\-\/]*)\]\]/i;
const NAV_DELAY_MS = 1200;
const ALLOWED_NAV_PATHS = new Set<string>([
  '/',
  '/pipedrive-implementation',
  '/pipedrive-setup',
  '/pipedrive-training',
  '/pipedrive-consultant',
  '/pipedrive-expert',
  '/pipedrive-partner',
  '/pipedrive-help',
  '/pipedrive-automation',
  '/pipedrive-integration',
  '/pipedrive-zapier-active-campaign-services',
  '/zapier-consultants',
  '/active-campaign-consultants',
  '/ai-consultants',
  '/website-design',
  '/free-pipedrive-trial-extended',
  '/testimonials',
  '/projects',
  '/blog',
  '/about-2',
  '/contact-2',
]);

function getOrCreateConversationId(): string {
  try {
    const existing = sessionStorage.getItem(CONV_ID_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(CONV_ID_KEY, id);
    sessionStorage.setItem(STARTED_AT_KEY, new Date().toISOString());
    return id;
  } catch {
    return 'unknown-' + Date.now();
  }
}

async function syncToPipedrive(payload: {
  email: string;
  transcript: { role: 'user' | 'assistant'; content: string }[];
  pathname: string;
  conversationId: string;
  startedAt: string;
}): Promise<void> {
  try {
    const personIdRaw = sessionStorage.getItem(PD_PERSON_KEY);
    const noteIdRaw = sessionStorage.getItem(PD_NOTE_KEY);
    const leadIdRaw = sessionStorage.getItem(PD_LEAD_KEY);
    const res = await fetch('/api/chat/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        personId: personIdRaw ? Number(personIdRaw) : undefined,
        noteId: noteIdRaw ? Number(noteIdRaw) : undefined,
        leadId: leadIdRaw || undefined,
      }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { personId?: number; noteId?: number; leadId?: string };
    if (data.personId) sessionStorage.setItem(PD_PERSON_KEY, String(data.personId));
    if (data.noteId) sessionStorage.setItem(PD_NOTE_KEY, String(data.noteId));
    if (data.leadId) sessionStorage.setItem(PD_LEAD_KEY, data.leadId);
  } catch {
    // swallow — chat continues
  }
}

export default function ChatWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [proactive, setProactive] = useState<string | null>(null);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onPickFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImageError(null);
    const newOnes: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setImageError('Only image files are supported.');
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setImageError('Each image must be under 4 MB.');
        continue;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        newOnes.push(dataUrl);
      } catch {
        setImageError('Could not read that file.');
      }
    }
    setPendingImages((prev) => [...prev, ...newOnes].slice(0, MAX_IMAGES_PER_MESSAGE));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const removePendingImage = useCallback((idx: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Proactive bubble: show immediately on mount / pathname change.
  // Update its message whenever the user navigates. Respect per-pathname dismissal.
  useEffect(() => {
    if (isOpen) {
      setProactive(null);
      return;
    }
    if (typeof window === 'undefined') return;
    const key = DISMISSED_PREFIX + (pathname || '/');
    if (sessionStorage.getItem(key) === '1') {
      setProactive(null);
      return;
    }
    setProactive(greetingFor(pathname || '/'));
  }, [pathname, isOpen]);

  // After 30 seconds on the site, auto-open the full chat panel — once per session.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(AUTO_OPEN_KEY) === '1') return;
    const timer = setTimeout(() => {
      try { sessionStorage.setItem(AUTO_OPEN_KEY, '1'); } catch {}
      setIsOpen((open) => {
        if (open) return open;
        setMessages((prev) =>
          prev.length === 0
            ? [{ role: 'assistant', content: greetingFor(pathname || '/') }]
            : prev
        );
        return true;
      });
    }, AUTO_OPEN_MS);
    return () => clearTimeout(timer);
    // Intentionally only run once on mount — auto-open is session-wide, not per page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismissProactive = useCallback(() => {
    setProactive(null);
    try {
      sessionStorage.setItem(DISMISSED_PREFIX + (pathname || '/'), '1');
    } catch {
      // ignore
    }
  }, [pathname]);

  const openFromProactive = useCallback(() => {
    const greeting = proactive ?? greetingFor(pathname || '/');
    setProactive(null);
    setIsOpen(true);
    setMessages((prev) =>
      prev.length === 0 ? [{ role: 'assistant', content: greeting }] : prev
    );
  }, [proactive, pathname]);

  const toggleOpen = useCallback(() => {
    setIsOpen((v) => {
      const next = !v;
      if (next && messages.length === 0) {
        setMessages([{ role: 'assistant', content: greetingFor(pathname || '/') }]);
      }
      return next;
    });
    setProactive(null);
  }, [messages.length, pathname]);

  const send = useCallback(async () => {
    const text = input.trim();
    const imagesToSend = pendingImages;
    if ((!text && imagesToSend.length === 0) || isStreaming) return;
    setInput('');
    setPendingImages([]);
    setImageError(null);

    const conversationId = getOrCreateConversationId();
    const startedAt =
      sessionStorage.getItem(STARTED_AT_KEY) ?? new Date().toISOString();

    // Detect email in the user's message; cache first match
    if (!sessionStorage.getItem(EMAIL_KEY)) {
      const m = text.match(EMAIL_RE);
      if (m) sessionStorage.setItem(EMAIL_KEY, m[1].toLowerCase());
    }

    const userMsg: Msg = {
      role: 'user',
      content: text || (imagesToSend.length ? '(image attached)' : ''),
      ...(imagesToSend.length ? { images: imagesToSend } : {}),
    };
    const next: Msg[] = [...messages, userMsg];
    setMessages(next);
    setIsStreaming(true);
    setMessages((m) => [...m, { role: 'assistant', content: '' }]);

    let acc = '';
    let streamErrored = false;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.filter((m) => m.content).slice(-20),
          pathname: pathname || '/',
        }),
      });
      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => 'Something went wrong.');
        streamErrored = true;
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: 'assistant',
            content: errText || 'Sorry, I hit an error.',
          };
          return copy;
        });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const visible = stripNavMarker(acc);
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: visible };
          return copy;
        });
      }
    } catch {
      streamErrored = true;
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: 'assistant',
          content: "Sorry — I couldn't reach the server. Try /contact-2/ instead.",
        };
        return copy;
      });
    } finally {
      setIsStreaming(false);
    }

    if (!streamErrored && acc) {
      const navMatch = acc.match(NAV_RE);
      if (navMatch) {
        const target = navMatch[1];
        if (
          ALLOWED_NAV_PATHS.has(target) &&
          target !== (pathname || '/')
        ) {
          window.setTimeout(() => {
            try {
              router.push(target);
            } catch {
              // ignore
            }
          }, NAV_DELAY_MS);
        }
      }
    }

    // Sync to Pipedrive after a successful response, if we have an email
    if (!streamErrored && acc) {
      const email = sessionStorage.getItem(EMAIL_KEY);
      if (email) {
        // Don't ship base64 images to Pipedrive — replace with a placeholder
        const transcript: Msg[] = [
          ...next.map((m) =>
            m.images && m.images.length > 0
              ? {
                  role: m.role,
                  content:
                    (m.content && m.content !== '(image attached)' ? m.content + ' ' : '') +
                    `[${m.images.length} image${m.images.length > 1 ? 's' : ''} attached]`,
                }
              : m
          ),
          { role: 'assistant', content: stripNavMarker(acc) || acc },
        ];
        void syncToPipedrive({
          email,
          transcript,
          pathname: pathname || '/',
          conversationId,
          startedAt,
        });
      }
    }
  }, [input, isStreaming, messages, pathname, pendingImages]);

  return (
    <>
      {proactive && !isOpen && (
        <div className="as-chat-proactive" role="dialog" aria-label="Chat greeting">
          <button
            type="button"
            className="as-chat-proactive-close"
            aria-label="Dismiss"
            onClick={dismissProactive}
          >
            ×
          </button>
          <button
            type="button"
            className="as-chat-proactive-body"
            onClick={openFromProactive}
          >
            {proactive}
          </button>
        </div>
      )}

      <button
        type="button"
        className="as-chat-launcher"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        onClick={toggleOpen}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M6 18L18 6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="as-chat-panel" role="dialog" aria-label="Chat with Automated Sales">
          <div className="as-chat-header">
            <div>
              <div className="as-chat-header-title">Automated Sales</div>
              <div className="as-chat-header-sub">Usually replies in a few seconds</div>
            </div>
            <div className="as-chat-header-actions">
              <button
                type="button"
                className="as-chat-header-restart"
                aria-label="Start a new chat"
                title="Start a new chat"
                onClick={() => {
                  if (isStreaming) return;
                  setMessages([{ role: 'assistant', content: greetingFor(pathname || '/') }]);
                  setInput('');
                }}
                disabled={isStreaming}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="as-chat-header-close"
                aria-label="Close chat"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>
          </div>
          <div className="as-chat-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === 'user' ? 'as-chat-msg-user' : 'as-chat-msg-bot'}
              >
                {m.images && m.images.length > 0 && (
                  <div className="as-chat-msg-images">
                    {m.images.map((src, j) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={j} src={src} alt="Attached image" />
                    ))}
                  </div>
                )}
                {m.content && m.content !== '(image attached)' ? (
                  <div>{m.content}</div>
                ) : null}
                {!m.content && isStreaming && i === messages.length - 1 ? (
                  <span className="as-chat-typing"><span></span><span></span><span></span></span>
                ) : null}
              </div>
            ))}
          </div>
          {(pendingImages.length > 0 || imageError) && (
            <div className="as-chat-attachments">
              {pendingImages.map((src, i) => (
                <div key={i} className="as-chat-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Pending attachment" />
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => removePendingImage(i)}
                  >
                    ×
                  </button>
                </div>
              ))}
              {imageError && <div className="as-chat-attach-error">{imageError}</div>}
            </div>
          )}
          <form
            className="as-chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => onPickFiles(e.target.files)}
            />
            <button
              type="button"
              className="as-chat-attach-btn"
              aria-label="Attach image"
              title="Attach image"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming || pendingImages.length >= MAX_IMAGES_PER_MESSAGE}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M21 12.5L12.5 21a5 5 0 0 1-7-7L14 5.5a3.5 3.5 0 0 1 5 5L10.5 19a2 2 0 0 1-3-3L16 7.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={pendingImages.length > 0 ? 'Add a message (optional)…' : 'Type a message…'}
              aria-label="Message"
              disabled={isStreaming}
            />
            <button
              type="submit"
              disabled={isStreaming || (!input.trim() && pendingImages.length === 0)}
              aria-label="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12l14-7-7 14-2-5-5-2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  fill="currentColor"
                />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
