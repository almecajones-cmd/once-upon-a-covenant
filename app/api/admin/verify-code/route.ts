import { NextResponse } from "next/server";
import { hashValue, normalizeEmail, serviceClient, sessionToken, setAdminCookie } from "@/lib/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email);
    const code = String(body.code || "").trim();

    if (!email || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Enter the six-digit code from your email." }, { status: 400 });
    }

    const supabase = serviceClient();
    const { data: admin } = await supabase.from("admin_users").select("email,role").eq("email", email).maybeSingle();
    if (!admin) return NextResponse.json({ error: "That code could not be verified." }, { status: 400 });

    const { data: verification } = await supabase
      .from("verification_codes")
      .select("id,code_hash,attempts")
      .eq("purpose", "admin_login")
      .eq("email", email)
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
    await supabase.from("admin_sessions").insert({
      token_hash: hashValue(token),
      admin_email: email,
      expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    });

    await setAdminCookie(token);
    return NextResponse.json({ ok: true, role: admin.role });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "We could not sign you in." }, { status: 500 });
  }
}
