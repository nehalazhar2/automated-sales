'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import AttributionTracker from '@/components/AttributionTracker';
import AttributionRouteTracker from '@/components/AttributionRouteTracker';
import ChatWidget from '@/components/ChatWidget';

const QUICKSTART_PREFIX = '/pipedrive-quickstart';

/** True for QuickStart routes, where private tokens live in the URL path. */
export function isQuickstartPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const p = pathname.toLowerCase();
  return p === QUICKSTART_PREFIX || p.startsWith(`${QUICKSTART_PREFIX}/`);
}

/** Chat widget, attribution trackers (rendered in `place="top"`) and third-party scripts
 * (`place="bottom"`). All are omitted on /pipedrive-quickstart/** so onboarding tokens in
 * URLs never reach third parties, chat prompts or notification emails. */
export default function SiteExtras({ place }: { place: 'top' | 'bottom' }) {
  const pathname = usePathname();
  if (isQuickstartPath(pathname)) return null;

  if (place === 'top') {
    return (
      <>
        <AttributionTracker />
        <AttributionRouteTracker />
      </>
    );
  }

  return (
    <>
      <ChatWidget />
      <Script id="leadfeeder" strategy="afterInteractive">
        {`(function(ss,ex){window.ldfdr=window.ldfdr||function(){(ldfdr._q=ldfdr._q||[]).push([].slice.call(arguments));};(function(d,s){var fs=d.getElementsByTagName(s)[0];function ce(src){var cs=d.createElement(s);cs.src=src;cs.async=1;fs.parentNode.insertBefore(cs,fs);}ce('https://sc.lfeeder.com/lftracker_v1_'+ss+(ex?'_'+ex:'')+'.js');})(document,'script');})('JMvZ8gbBo0pa2pOd');`}
      </Script>
      <Script id="outfunnel" strategy="afterInteractive">
        {`window.OFID="61c35a14eb73af43f3a33b7f";(function(){var script=document.createElement("script");var url='https://cdn.outfunnel.com/c.js?v='+new Date().toISOString().substring(0,10);script.setAttribute('src',url);document.getElementsByTagName('head')[0].appendChild(script);})();`}
      </Script>
      <Script id="as-tracker-config" strategy="afterInteractive">
        {`window.AS_TRACKER_API_URL = "https://attribution.automated-sales.co/t/automated-sales";
window.AS_TRACKER_KEY = "2dc070e366bb87f69d60584d0522a2f7";`}
      </Script>
      <Script
        src="https://attribution.automated-sales.co/automated-sales-tracker.js"
        strategy="afterInteractive"
      />
    </>
  );
}
