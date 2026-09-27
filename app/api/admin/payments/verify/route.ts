import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getAdminSession, serviceClient } from "@/lib/server";

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

    const body = await request.json();
    const paymentId = String(body.paymentId || "");
    const action = String(body.action || "");
    const note = String(body.note || "").trim().slice(0, 500);

    if (!paymentId || !["verify","reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid payment action." }, { status: 400 });
    }

    const supabase = serviceClient();
    const { data: payment } = await supabase
      .from("payments")
      .select("id,registration_id,amount_cents,method,status")
      .eq("id", paymentId)
      .single();

    if (!payment || payment.status !== "pending_verification") {
      return NextResponse.json({ error: "This payment is no longer pending." }, { status: 409 });
    }

    const nextStatus = action === "verify" ? "verified" : "rejected";
    await supabase.from("payments").update({
      status: nextStatus,
      verified_by: session.admin_email,
      verified_at: new Date().toISOString(),
      notes: note || null,
    }).eq("id", payment.id);

    const { data: registration } = await supabase
      .from("registrations")
      .select("id,confirmation_code,husband_first_name,wife_first_name,husband_email,wife_email,total_fee_cents,late_fee_cents")
      .eq("id", payment.registration_id)
      .single();

    const { data: verifiedPayments } = await supabase
      .from("payments")
      .select("amount_cents")
      .eq("registration_id", payment.registration_id)
      .eq("status", "verified");

    const verifiedPaid = (verifiedPayments || []).reduce((sum, p) => sum + p.amount_cents, 0);
    const totalDue = (registration?.total_fee_cents || 60000) + (registration?.late_fee_cents || 0);
    const balance = Math.max(totalDue - verifiedPaid, 0);

    const registrationStatus = verifiedPaid >= 10000 ? "confirmed" : "pending_payment_verification";
    const paymentStatus = balance === 0 ? "paid" : verifiedPaid > 0 ? "partial" : "unpaid";

    await supabase.from("registrations").update({
      registration_status: registrationStatus,
      payment_status: paymentStatus,
    }).eq("id", payment.registration_id);

    await supabase.from("admin_audit_log").insert({
      admin_email: session.admin_email,
      action: action === "verify" ? "payment_verified" : "payment_rejected",
      target_type: "payment",
      target_id: payment.id,
      details: { amount_cents: payment.amount_cents, method: payment.method, note },
    });

    if (action === "verify" && registration && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Once Upon a Covenant <registration@onceuponacovenant.org>",
        to: [registration.husband_email, registration.wife_email].filter(Boolean),
        replyTo: "marriagebydesignministry@myeccoc.com",
        subject: "Payment receipt — Once Upon a Covenant",
        html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#2d2430">
          <h1 style="color:#54143d">Payment receipt</h1>
          <p>We verified your <strong>$${(payment.amount_cents/100).toFixed(2)}</strong> payment for Once Upon a Covenant.</p>
          <p><strong>Total paid:</strong> $${(verifiedPaid/100).toFixed(2)}<br/>
          <strong>Remaining balance:</strong> $${(balance/100).toFixed(2)}</p>
          <p><strong>Registration status:</strong> ${registrationStatus === "confirmed" ? "Confirmed — Deposit Paid" : "Deposit Pending"}</p><p>${registrationStatus === "confirmed" ? "Your invitation is confirmed. We look forward to welcoming you October 8–10, 2027." : "Your registration remains pending until at least $100 has been verified."}</p>
          <p>Registration reference: <strong>${registration.confirmation_code}</strong></p>
        </div>`,
      });
    }

    return NextResponse.json({ ok: true, verifiedPaidCents: verifiedPaid, balanceCents: balance });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "We could not update that payment." }, { status: 500 });
  }
}
