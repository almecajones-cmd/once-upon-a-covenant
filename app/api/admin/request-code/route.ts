import { NextResponse } from "next/server";
import { hashValue, normalizeEmail, oneTimeCode, serviceClient } from "@/lib/server";
import { logAppEvent, sendTrackedEmail } from "@/lib/emailAudit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email);
    if (!email) return NextResponse.json({ ok: true });

    const supabase = serviceClient();
    const { data: admin } = await supabase.from("admin_users").select("email").eq("email", email).maybeSingle();
    if (!admin) return NextResponse.json({ ok: true });

    const code = oneTimeCode();
    await supabase.from("verification_codes").insert({
      purpose: "admin_login",
      email,
      code_hash: hashValue(code),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    const sent = await sendTrackedEmail({
      purpose: "admin_login_code",
      to: email,
      replyTo: "marriagebydesignministry@myeccoc.com",
      subject: "Your retreat admin sign-in code",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#2d2430">
        <h1 style="color:#54143d">Admin sign-in</h1>
        <p>Your one-time admin code is:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#54143d">${code}</p>
        <p>This code expires in 10 minutes.</p>
      </div>`,
      metadata: { purpose: "admin_login" }
    });

    if (!sent.ok) {
      await logAppEvent({
        eventType: "admin_login_email_failed",
        route: "/api/admin/request-code",
        severity: "error",
        message: sent.error || "Admin sign-in code was not accepted by email provider."
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: true });
  }
}
