import { NextResponse } from "next/server";
import { getRegistrantSession, serviceClient } from "@/lib/server";

export async function GET() {
  const session = await getRegistrantSession();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const supabase = serviceClient();
  const { data: registration, error } = await supabase
    .from("registrations")
    .select("id,confirmation_code,relationship_status,husband_first_name,husband_last_name,wife_first_name,wife_last_name,registration_status,payment_status,total_fee_cents,late_fee_cents,created_at")
    .eq("id", session.registration_id)
    .single();

  if (error || !registration) return NextResponse.json({ error: "Registration not found." }, { status: 404 });

  const { data: payments } = await supabase
    .from("payments")
    .select("id,amount_cents,method,status,payment_date,created_at,verified_at,notes")
    .eq("registration_id", registration.id)
    .order("created_at", { ascending: false });

  const rows=payments || [];
  const verifiedRows=rows.filter((p) => p.status === "verified");
  const verifiedPaid = verifiedRows.reduce((sum, p) => sum + p.amount_cents, 0);
  const pendingTotal = rows.filter((p)=>p.status==="pending_verification").reduce((sum,p)=>sum+p.amount_cents,0);
  const hasFailed = rows.some((p)=>p.status==="failed" || p.status==="rejected");

  const totalDue = registration.total_fee_cents + registration.late_fee_cents;
  const balance = Math.max(totalDue - verifiedPaid, 0);
  const latestVerified=verifiedRows[0] || null;

  let displayStatus="Deposit Pending";
  if(registration.registration_status==="cancelled") displayStatus="Cancelled";
  else if(registration.registration_status==="transferred") displayStatus="Transferred";
  else if(registration.registration_status==="refund_review") displayStatus="Refund Review";
  else if(registration.registration_status==="refunded") displayStatus="Refunded";
  else if(balance===0 && verifiedPaid>0) displayStatus="Paid in Full";
  else if(verifiedPaid>10000 && balance>0) displayStatus="Partially Paid";
  else if(verifiedPaid>=10000) displayStatus="Confirmed — Deposit Paid";
  else if(pendingTotal>0) displayStatus="Manual Payment Pending Verification";
  else if(hasFailed) displayStatus="Payment Failed";

  return NextResponse.json({
    registration,
    payments: rows,
    verifiedPaidCents: verifiedPaid,
    pendingTotalCents: pendingTotal,
    balanceCents: balance,
    totalDueCents: totalDue,
    latestVerifiedPaymentCents: latestVerified?.amount_cents || 0,
    latestVerifiedPaymentDate: latestVerified?.verified_at || latestVerified?.payment_date || null,
    displayStatus,
    invitationConfirmed: verifiedPaid >= 10000 && !["cancelled","transferred","refund_review","refunded"].includes(registration.registration_status),
  });
}
