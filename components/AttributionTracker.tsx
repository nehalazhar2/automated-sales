'use client';

import { useEffect } from 'react';

const KEY = 'as_attribution';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];

export default function AttributionTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY)) return;

      const params = new URLSearchParams(window.location.search);
      const utms: Record<string, string> = {};
      for (const k of UTM_KEYS) {
        const v = params.get(k);
        if (v) utms[k] = v;
      }

      const referrer = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : '';

      sessionStorage.setItem(
        KEY,
        JSON.stringify({
          landingPath: window.location.pathname,
          referrer,
          ...utms,
          firstSeenAt: new Date().toISOString(),
        }),
      );
    } catch {
      // sessionStorage may be unavailable (private mode, blocked) — silently no-op.
    }
  }, []);

  return null;
}
