import { NextResponse } from "next/server";
import { normalizeEmail, serviceClient } from "@/lib/server";
import { sendTrackedEmail } from "@/lib/emailAudit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email);
    if (!email) return NextResponse.json({ ok: true });

    const supabase = serviceClient();
    const { data } = await supabase
      .from("registrations")
      .select("confirmation_code,husband_email,wife_email,husband_first_name,wife_first_name,created_at")
      .or(`husband_email.eq.${email},wife_email.eq.${email}`)
      .neq("registration_status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      await sendTrackedEmail({
        purpose: "registration_reference_recovery",
        to: email,
        replyTo: "marriagebydesignministry@myeccoc.com",
        subject: "Your Once Upon a Covenant registration reference",
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#2d2430">
          <h1 style="color:#54143d">Your registration reference</h1>
          <p>Your 2027 Midwest Marriage Retreat confirmation/reference number is:</p>
          <p style="font-size:24px;font-weight:700;color:#54143d">${data.confirmation_code}</p>
          <p>Use this number with this email address at <strong>Make a Payment</strong> to securely view your registration.</p>
        </div>`
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: true });
  }
}
