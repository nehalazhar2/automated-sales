'use client';

import { useCallback, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { stripNavMarker } from '@/lib/chat/navMarker';
import { CHAT_OPEN_EVENT, type ChatOpenDetail } from '@/lib/chat/events';

const MAX_QUESTION_CHARS = 500;

// "Ask me anything" item rendered as the last card of an FAQ list. Unlike
// the other FAQ items it is always open, so the input is visible at once.
// Sends one question to the same agent as ChatWidget and streams the
// answer inline; follow-ups are handed off to the chat widget.
export default function FaqAsk() {
  const pathname = usePathname();
  const [input, setInput] = useState('');
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ask = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setQuestion(text);
    setAnswer('');
    setError(false);
    setIsStreaming(true);

    let acc = '';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
          pathname: pathname || '/',
          source: 'faq',
        }),
      });
      if (!res.ok || !res.body) throw new Error('bad response');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setAnswer(stripNavMarker(acc));
      }
      if (acc.includes('[error:') || !stripNavMarker(acc)) throw new Error('stream error');
    } catch {
      setError(true);
      setAnswer('');
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, pathname]);

  const reset = useCallback(() => {
    setInput('');
    setQuestion(null);
    setAnswer('');
    setError(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const continueInChat = useCallback(() => {
    if (!question) return;
    const messages: ChatOpenDetail['messages'] = [{ role: 'user', content: question }];
    if (answer) messages.push({ role: 'assistant', content: answer });
    window.dispatchEvent(
      new CustomEvent<ChatOpenDetail>(CHAT_OPEN_EVENT, { detail: { messages } })
    );
  }, [question, answer]);

  const showForm = question === null;

  return (
    <div className="as-card as-faq-ask" style={{ padding: '20px 24px' }}>
      <div style={{ fontWeight: 900, fontSize: 18 }}>
        {question ?? "Can't find your question? Ask me anything."}
      </div>

      {showForm ? (
        <form
          className="as-faq-ask-form"
          onSubmit={(e) => {
            e.preventDefault();
            void ask();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={MAX_QUESTION_CHARS}
            placeholder="Type here and I'll help…"
            aria-label="Your question"
          />
          <button type="submit" className="as-btn as-btn-primary" disabled={!input.trim()}>
            Ask
          </button>
        </form>
      ) : (
        <div aria-live="polite">
          {error ? (
            <p style={{ marginTop: 12 }}>Couldn&apos;t get an answer, try the chat instead.</p>
          ) : (
            <p style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>
              {answer || (isStreaming ? 'Thinking…' : '')}
            </p>
          )}
          {!isStreaming && (
            <div className="as-faq-ask-actions">
              <button type="button" className="as-faq-ask-link" onClick={reset}>
                Ask another
              </button>
              <button type="button" className="as-faq-ask-link" onClick={continueInChat}>
                Continue in chat →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
