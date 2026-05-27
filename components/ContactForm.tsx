'use client';

import { useActionState, useEffect, useRef } from 'react';
import { submitContact, type ContactState } from '@/app/contact-2/actions';

const initial: ContactState = { status: 'idle' };

const SERVICES = [
  'Pipedrive implementation',
  'Pipedrive consultancy',
  'AI agents / AI automation',
  'AI transcription',
  'CRM migration',
  'Pipedrive automation',
  'Zapier automation',
  'ActiveCampaign',
  'Reporting',
];

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initial);
  const errors = state.status === 'error' ? state.fieldErrors || {} : {};
  const attributionRef = useRef<HTMLInputElement>(null);
  const currentPathRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('as_attribution');
      if (stored && attributionRef.current) attributionRef.current.value = stored;
      if (currentPathRef.current) currentPathRef.current.value = window.location.pathname;
    } catch {
      // ignore
    }
  }, []);

  if (state.status === 'success') {
    return (
      <div className="as-admin-note" role="status">
        Thanks — your enquiry has been sent. We will reply within one working day.
      </div>
    );
  }

  return (
    <form className="as-form" action={formAction} noValidate>
      {state.status === 'error' && state.message && (
        <div className="as-admin-note" role="alert">{state.message}</div>
      )}

      <label>
        Name
        <input name="name" type="text" required placeholder="Your name" aria-invalid={!!errors.name} />
        {errors.name && <small style={{ color: '#b91c1c' }}>{errors.name}</small>}
      </label>

      <label>
        Email
        <input name="email" type="email" required placeholder="you@company.com" aria-invalid={!!errors.email} />
        {errors.email && <small style={{ color: '#b91c1c' }}>{errors.email}</small>}
      </label>

      <label>
        Company
        <input name="company" type="text" placeholder="Company name" />
      </label>

      <label>
        What do you need help with?
        <select name="service" defaultValue="">
          <option value="">Select a service…</option>
          {SERVICES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label>
        Project details
        <textarea
          name="message"
          required
          placeholder="Briefly describe your setup, tools, goals and deadlines."
          aria-invalid={!!errors.message}
        />
        {errors.message && <small style={{ color: '#b91c1c' }}>{errors.message}</small>}
      </label>

      <input ref={attributionRef} type="hidden" name="attribution" defaultValue="" />
      <input ref={currentPathRef} type="hidden" name="currentPath" defaultValue="" />

      {/* Honeypot — must remain empty */}
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <label>
          Website (leave blank)
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button className="as-btn as-btn-primary" type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Send enquiry →'}
      </button>
    </form>
  );
}
