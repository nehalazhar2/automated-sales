'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { greetingFor } from '@/lib/chat/greetings';

type Msg = { role: 'user' | 'assistant'; content: string };

const DISMISSED_PREFIX = 'as_chat_proactive_dismissed:';
const AUTO_OPEN_KEY = 'as_chat_auto_opened';
const AUTO_OPEN_MS = 30_000;

export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [proactive, setProactive] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    if (!text || isStreaming) return;
    setInput('');
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setIsStreaming(true);

    // Add empty assistant placeholder
    setMessages((m) => [...m, { role: 'assistant', content: '' }]);

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
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: errText || 'Sorry, I hit an error.' };
          return copy;
        });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: acc };
          return copy;
        });
      }
    } catch {
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
  }, [input, isStreaming, messages, pathname]);

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
                {m.content || (isStreaming && i === messages.length - 1 ? (
                  <span className="as-chat-typing"><span></span><span></span><span></span></span>
                ) : null)}
              </div>
            ))}
          </div>
          <form
            className="as-chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              aria-label="Message"
              disabled={isStreaming}
            />
            <button type="submit" disabled={isStreaming || !input.trim()} aria-label="Send">
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
