import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { serviceClient } from "@/lib/server";
import { logAppEvent } from "@/lib/emailAudit";

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret || !process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  try {
    const payload = await req.text();
    const resend = new Resend(process.env.RESEND_API_KEY);

    const event:any = resend.webhooks.verify({
      payload,
      headers: {
        id: req.headers.get("svix-id") || "",
        timestamp: req.headers.get("svix-timestamp") || "",
        signature: req.headers.get("svix-signature") || "",
      },
      webhookSecret: secret,
    });

    const emailId = String(event?.data?.email_id || "");
    const type = String(event?.type || "");
    const recipient = Array.isArray(event?.data?.to) ? String(event.data.to[0] || "") : null;
    const eventAt = event?.created_at || new Date().toISOString();

    if (emailId && type) {
      const supabase = serviceClient();
      await supabase.from("email_delivery_events").insert({
        provider_email_id: emailId,
        event_type: type,
        recipient,
        event_at: eventAt,
        payload: event,
      });

      const normalized = type.replace("email.", "");
      const update:any = {
        delivery_status: normalized,
        updated_at: new Date().toISOString(),
      };
      if (["failed","bounced","suppressed","complained"].includes(normalized)) {
        update.error_message =
          event?.data?.bounce?.message ||
          event?.data?.suppression?.message ||
          event?.data?.error?.message ||
          `Resend reported ${normalized}.`;
      }
      await supabase.from("email_communications")
        .update(update)
        .eq("provider_email_id", emailId);

      if (["failed","bounced","suppressed","complained"].includes(normalized)) {
        await logAppEvent({
          eventType: "email_delivery_issue",
          route: "/api/webhooks/resend",
          severity: "error",
          message: update.error_message,
          details: { providerEmailId: emailId, eventType: type, recipient }
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Invalid Resend webhook", error);
    return NextResponse.json({ error: "Invalid webhook." }, { status: 400 });
  }
}
