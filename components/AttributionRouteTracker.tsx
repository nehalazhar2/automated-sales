"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    ASTracker?: {
      trackPageview?: () => void;
      identify?: (email: string) => void;
      getAnonymousId?: () => string;
    };
  }
}

export default function AttributionRouteTracker() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.ASTracker?.trackPageview?.();
  }, [pathname]);

  return null;
}
