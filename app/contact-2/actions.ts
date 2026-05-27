'use server';

import { z } from 'zod';
import { sendContactEmail } from '@/lib/mailer';

const Schema = z.object({
  name: z.string().min(1, 'Please add your name').max(120),
  email: z.string().email('That email address does not look right').max(254),
  company: z.string().max(120).optional().or(z.literal('')),
  service: z.string().max(120).optional().or(z.literal('')),
  message: z.string().min(10, 'Tell us a little more — at least 10 characters').max(5000),
  website: z.string().max(0).optional().or(z.literal('')),
  attribution: z.string().max(2000).optional().or(z.literal('')),
  currentPath: z.string().max(500).optional().or(z.literal('')),
});

type Attribution = {
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

function parseAttribution(raw: string): Attribution | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as Attribution;
  } catch {
    // bad JSON — ignore
  }
  return null;
}

const ipRateState = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

function checkRate(ip: string) {
  const now = Date.now();
  const entry = ipRateState.get(ip);
  if (!entry || entry.resetAt < now) {
    ipRateState.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

export type ContactState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }
  | { status: 'success' };

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const ip =
    (formData.get('__ip') as string) ||
    'unknown';
  if (!checkRate(ip)) {
    return { status: 'error', message: 'Too many submissions. Please try again in a minute.' };
  }

  const raw = {
    name: String(formData.get('name') || ''),
    email: String(formData.get('email') || ''),
    company: String(formData.get('company') || ''),
    service: String(formData.get('service') || ''),
    message: String(formData.get('message') || ''),
    website: String(formData.get('website') || ''),
    attribution: String(formData.get('attribution') || ''),
    currentPath: String(formData.get('currentPath') || ''),
  };

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0]?.toString();
      if (k) fieldErrors[k] = issue.message;
    }
    return { status: 'error', message: 'Please check the form and try again.', fieldErrors };
  }

  // Honeypot — silently succeed without sending so bots cannot probe for failure.
  if (parsed.data.website) {
    return { status: 'success' };
  }

  try {
    await sendContactEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      company: parsed.data.company || undefined,
      service: parsed.data.service || undefined,
      message: parsed.data.message,
      attribution: parseAttribution(parsed.data.attribution || '') || undefined,
      submittedFrom: parsed.data.currentPath || undefined,
    });
  } catch (err) {
    console.error('contact form send failed', err);
    return {
      status: 'error',
      message: 'Sorry, we could not send your message. Please email us directly.',
    };
  }

  return { status: 'success' };
}
