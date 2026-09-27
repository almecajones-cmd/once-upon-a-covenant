import { NextResponse } from "next/server";
import { Resend } from "resend";
import { hashValue, normalizeEmail, oneTimeCode, serviceClient } from "@/lib/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const confirmation = String(body.confirmation || "").trim().toUpperCase().slice(0, 40);
    const email = normalizeEmail(body.email);

    if (!confirmation || !email) {
      return NextResponse.json({ ok: true });
    }

    const supabase = serviceClient();
    const { data: registration } = await supabase
      .from("registrations")
      .select("id,confirmation_code,husband_email,wife_email,husband_first_name,wife_first_name")
      .eq("confirmation_code", confirmation)
      .maybeSingle();

    if (!registration) return NextResponse.json({ ok: true });

    const allowed = [registration.husband_email, registration.wife_email]
      .filter(Boolean)
      .map((v: string) => v.toLowerCase());

    if (!allowed.includes(email)) return NextResponse.json({ ok: true });

    const code = oneTimeCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabase.from("verification_codes").insert({
      purpose: "registrant_lookup",
      email,
      registration_id: registration.id,
      code_hash: hashValue(code),
      expires_at: expires,
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Once Upon a Covenant <registration@onceuponacovenant.org>",
      to: email,
      replyTo: "marriagebydesignministry@myeccoc.com",
      subject: "Your Once Upon a Covenant verification code",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#2d2430">
        <h1 style="color:#54143d">Once Upon a Covenant</h1>
        <p>Use this one-time code to securely view your retreat registration and payment history:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#54143d">${code}</p>
        <p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
      </div>`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: true });
  }
}
