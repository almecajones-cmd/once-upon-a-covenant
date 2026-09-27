import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getRegistrantSession, serviceClient } from "@/lib/server";

const allowedMethods = new Set(["pushpay","zelle","check","money_order"]);

export async function POST(request: Request) {
  try {
    const session = await getRegistrantSession();
    if (!session) return NextResponse.json({ error: "Your secure session has expired. Please verify again." }, { status: 401 });

    const body = await request.json();
    const method = String(body.method || "");
    const amount = Number(body.amount);
    const clientReference = String(body.clientReference || "").trim().slice(0,80);

    if (!allowedMethods.has(method) || !Number.isFinite(amount) || amount <= 0 || !clientReference) {
      return NextResponse.json({ error: "Choose a valid payment amount and method." }, { status: 400 });
    }

    const amountCents = Math.round(amount * 100);
    const supabase = serviceClient();

    const { data: existing } = await supabase
      .from("payments")
      .select("id,amount_cents,method,status")
      .eq("registration_id", session.registration_id)
      .eq("client_reference", clientReference)
      .maybeSingle();

    if(existing){
      return NextResponse.json({
        ok:true,
        duplicatePrevented:true,
        paymentId:existing.id,
        amountCents:existing.amount_cents,
        method:existing.method,
        pushPayUrl:existing.method==="pushpay" ? "https://ppay.co/mJyvth1Pp-Y" : null,
      });
    }

    const { data: registration } = await supabase
      .from("registrations")
      .select("id,confirmation_code,husband_first_name,wife_first_name,husband_email,wife_email,total_fee_cents,late_fee_cents")
      .eq("id", session.registration_id)
      .single();

    if (!registration) return NextResponse.json({ error: "Registration not found." }, { status: 404 });

    const { data: verified } = await supabase
      .from("payments")
      .select("amount_cents")
      .eq("registration_id", registration.id)
      .eq("status", "verified");

    const paid = (verified || []).reduce((sum, p) => sum + p.amount_cents, 0);
    const balance = Math.max(registration.total_fee_cents + registration.late_fee_cents - paid, 0);

    if (amountCents > balance) {
      return NextResponse.json({ error: `The maximum payment currently due is $${(balance / 100).toFixed(2)}.` }, { status: 400 });
    }

    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        registration_id: registration.id,
        amount_cents: amountCents,
        method,
        status: "pending_verification",
        client_reference: clientReference,
        payment_date: new Date().toISOString().slice(0,10),
      })
      .select("id")
      .single();

    if (error) throw error;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const recipients = [registration.husband_email, registration.wife_email].filter(Boolean);
    await resend.emails.send({
      from: "Once Upon a Covenant <registration@onceuponacovenant.org>",
      to: recipients,
      replyTo: "marriagebydesignministry@myeccoc.com",
      subject: "Payment submission received",
      html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#2d2430">
        <h1 style="color:#54143d">Payment submission received</h1>
        <p>We recorded your request to make a <strong>$${(amountCents/100).toFixed(2)}</strong> payment by <strong>${method.replace("_"," ")}</strong>.</p>
        <p>This payment is <strong>pending verification</strong>. Your verified balance will update after the retreat finance team confirms the payment.</p>
        <p>Registration reference: <strong>${registration.confirmation_code}</strong></p>
      </div>`,
    });

    return NextResponse.json({
      ok: true,
      paymentId: payment.id,
      amountCents,
      method,
      pushPayUrl: method === "pushpay" ? "https://ppay.co/mJyvth1Pp-Y" : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "We could not record that payment request." }, { status: 500 });
  }
}
