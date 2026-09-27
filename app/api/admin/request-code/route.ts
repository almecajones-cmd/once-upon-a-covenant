import { NextResponse } from "next/server";
import { Resend } from "resend";
import { hashValue, normalizeEmail, oneTimeCode, serviceClient } from "@/lib/server";

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

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Once Upon a Covenant <registration@onceuponacovenant.org>",
      to: email,
      replyTo: "marriagebydesignministry@myeccoc.com",
      subject: "Your retreat admin sign-in code",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#2d2430">
        <h1 style="color:#54143d">Admin sign-in</h1>
        <p>Your one-time admin code is:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#54143d">${code}</p>
        <p>This code expires in 10 minutes.</p>
      </div>`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: true });
  }
}
