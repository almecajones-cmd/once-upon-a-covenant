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

  const verifiedPaid = (payments || [])
    .filter((p) => p.status === "verified")
    .reduce((sum, p) => sum + p.amount_cents, 0);

  const totalDue = registration.total_fee_cents + registration.late_fee_cents;
  const balance = Math.max(totalDue - verifiedPaid, 0);

  return NextResponse.json({
    registration,
    payments: payments || [],
    verifiedPaidCents: verifiedPaid,
    balanceCents: balance,
    totalDueCents: totalDue,
  });
}
