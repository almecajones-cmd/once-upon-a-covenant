"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function AnalyticsTracker() {
  useEffect(() => {
    track("page_view", { referrer: document.referrer || null });

    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const tracked = target?.closest<HTMLElement>("[data-track]");
      if (!tracked) return;
      const name = tracked.dataset.track;
      if (!name) return;
      track(name, {
        label: tracked.dataset.trackLabel || tracked.textContent?.trim().slice(0, 80) || null,
      });
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
