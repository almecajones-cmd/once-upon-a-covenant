import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server";

const allowed = new Set([
  "page_view",
  "gateway_enter",
  "register_cta",
  "registration_start",
  "registration_step_complete",
  "registration_submit",
  "registration_success",
  "payment_choice",
  "registrant_lookup",
  "registrant_payment_submit",
  "contact_help",
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventName = String(body.eventName || "").slice(0, 80);
    if (!allowed.has(eventName)) return NextResponse.json({ ok: true });

    const path = String(body.path || "").slice(0, 180);
    const sessionId = String(body.sessionId || "").slice(0, 100) || null;
    const metadata =
      body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
        ? body.metadata
        : {};

    await serviceClient().from("analytics_events").insert({
      event_name: eventName,
      path,
      session_id: sessionId,
      metadata,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
