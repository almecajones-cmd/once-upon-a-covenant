"use client";

export function track(eventName: string, metadata: Record<string, unknown> = {}) {
  try {
    let sessionId = sessionStorage.getItem("ouc_analytics_session");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("ouc_analytics_session", sessionId);
    }
    fetch("/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventName,
        path: window.location.pathname,
        sessionId,
        metadata,
      }),
    }).catch(() => {});
  } catch {
    // Analytics must never block the visitor experience.
  }
}
