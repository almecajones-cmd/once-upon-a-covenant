import { Resend } from "resend";
import { serviceClient } from "@/lib/server";

type EmailArgs = {
  purpose: string;
  auditId?: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  registrationId?: string | null;
  metadata?: Record<string, unknown>;
};

function errorText(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try { return JSON.stringify(error); } catch { return "Unknown error"; }
}

export async function logAppEvent(args: {
  eventType: string;
  route?: string;
  registrationId?: string | null;
  severity?: "info" | "warning" | "error";
  message?: string;
  details?: Record<string, unknown>;
}) {
  try {
    const supabase = serviceClient();
    const { error } = await supabase.from("app_event_log").insert({
      event_type: args.eventType,
      route: args.route || null,
      registration_id: args.registrationId || null,
      severity: args.severity || "info",
      message: args.message || null,
      details: args.details || {},
    });
    if (error) console.error("Unable to write app event log", error);
  } catch (error) {
    console.error("Unable to write app event log", error);
  }
}

export async function sendTrackedEmail(args: EmailArgs) {
  const recipients = [...new Set((Array.isArray(args.to) ? args.to : [args.to]).map(e => e.trim().toLowerCase()).filter(Boolean))];
  const supabase = serviceClient();

  const { data: row, error: auditError } = args.auditId
    ? await supabase.from("email_communications").select("id").eq("id",args.auditId).eq("registration_id",args.registrationId!).eq("send_status","attempted").single()
    : await supabase
    .from("email_communications")
    .insert({
      registration_id: args.registrationId || null,
      purpose: args.purpose,
      to_addresses: recipients,
      subject: args.subject,
      send_status: "attempted",
      metadata: args.metadata || {},
    })
    .select("id")
    .single();

  if (auditError || !row) {
    console.error("Email audit could not be saved", auditError);
    return { ok: false as const, id: null, error: "Email audit unavailable; no email was sent." };
  }

  if (!process.env.RESEND_API_KEY) {
    const message = "RESEND_API_KEY is not configured.";
    if (row?.id) {
      await supabase.from("email_communications").update({
        send_status: "failed",
        error_message: message,
        updated_at: new Date().toISOString(),
      }).eq("id", row.id);
    }
    await logAppEvent({
      eventType: "email_send_failed",
      route: "email",
      registrationId: args.registrationId,
      severity: "error",
      message,
      details: { purpose: args.purpose, recipients },
    });
    return { ok: false as const, id: null, error: message };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const emailPayload:any = {
      from: "Once Upon a Covenant <registration@onceuponacovenant.org>",
      to: recipients,
      replyTo: args.replyTo,
      subject: args.subject,
    };
    if (args.html) emailPayload.html = args.html;
    if (args.text) emailPayload.text = args.text;
    if (!args.html && !args.text) {
      throw new Error("Tracked email requires html or text content.");
    }
    const { data, error } = await resend.emails.send(emailPayload, { idempotencyKey: `communication-${row.id}` });

    if (error || !data?.id) {
      const message = errorText(error || "Resend did not return an email ID.");
      if (row?.id) {
        await supabase.from("email_communications").update({
          send_status: "failed",
          error_message: message,
          updated_at: new Date().toISOString(),
        }).eq("id", row.id);
      }
      await logAppEvent({
        eventType: "email_send_failed",
        route: "email",
        registrationId: args.registrationId,
        severity: "error",
        message,
        details: { purpose: args.purpose, recipients },
      });
      return { ok: false as const, id: null, error: message };
    }

    if (row?.id) {
      const { error: saveError } = await supabase.from("email_communications").update({
        provider_email_id: data.id,
        send_status: "sent",
        delivery_status: "sent",
        error_message: null,
        updated_at: new Date().toISOString(),
      }).eq("id", row.id);
      if (saveError) {
        console.error("Provider accepted email but audit update failed", {providerEmailId:data.id,communicationId:row.id,error:saveError});
        return { ok:false as const,id:data.id,error:"Provider accepted email but its audit update failed. Do not resend automatically." };
      }
    }

    return { ok: true as const, id: data.id, error: null };
  } catch (error) {
    const message = errorText(error);
    if (row?.id) {
      await supabase.from("email_communications").update({
        send_status: "failed",
        error_message: message,
        updated_at: new Date().toISOString(),
      }).eq("id", row.id);
    }
    await logAppEvent({
      eventType: "email_send_failed",
      route: "email",
      registrationId: args.registrationId,
      severity: "error",
      message,
      details: { purpose: args.purpose, recipients },
    });
    return { ok: false as const, id: null, error: message };
  }
}
