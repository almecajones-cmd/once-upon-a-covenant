import { NextResponse } from "next/server";
import { hashValue, normalizeEmail, serviceClient, sessionToken, setRegistrantCookie } from "@/lib/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const confirmation = String(body.confirmation || "").trim().toUpperCase().slice(0, 40);
    const email = normalizeEmail(body.email);
    const code = String(body.code || "").trim();

    if (!confirmation || !email || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Enter the six-digit code from your email." }, { status: 400 });
    }

    const supabase = serviceClient();
    const { data: registration } = await supabase
      .from("registrations")
      .select("id,husband_email,wife_email")
      .eq("confirmation_code", confirmation)
      .maybeSingle();

    if (!registration) return NextResponse.json({ error: "The code could not be verified." }, { status: 400 });

    const allowed = [registration.husband_email, registration.wife_email]
      .filter(Boolean)
      .map((v: string) => v.toLowerCase());
    if (!allowed.includes(email)) return NextResponse.json({ error: "The code could not be verified." }, { status: 400 });

    const { data: verification } = await supabase
      .from("verification_codes")
      .select("id,code_hash,attempts,expires_at,used_at")
      .eq("purpose", "registrant_lookup")
      .eq("email", email)
      .eq("registration_id", registration.id)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!verification || verification.attempts >= 5) {
      return NextResponse.json({ error: "That code is no longer valid. Request a new one." }, { status: 400 });
    }

    if (verification.code_hash !== hashValue(code)) {
      await supabase.from("verification_codes").update({ attempts: verification.attempts + 1 }).eq("id", verification.id);
      return NextResponse.json({ error: "That code is incorrect." }, { status: 400 });
    }

    await supabase.from("verification_codes").update({ used_at: new Date().toISOString() }).eq("id", verification.id);

    const token = sessionToken();
    await supabase.from("registrant_sessions").insert({
      token_hash: hashValue(token),
      registration_id: registration.id,
      expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    });

    await setRegistrantCookie(token);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "We could not verify that code. Please try again." }, { status: 500 });
  }
}
