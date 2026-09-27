import { NextResponse } from "next/server";
import { getAdminSession, serviceClient } from "@/lib/server";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const supabase = serviceClient();
  const { data: admin } = await supabase.from("admin_users").select("email,role").eq("email", session.admin_email).single();

  const { data: registrations } = await supabase
    .from("admin_registration_summary")
    .select("id,confirmation_code,created_at,relationship_status,husband_first_name,husband_last_name,husband_email,husband_phone,wife_first_name,wife_last_name,wife_email,wife_phone,city,state,church_name_other,registration_status,payment_status,total_fee_cents,late_fee_cents,verified_paid_cents,balance_cents,accessible_room_requested,extra_nights")
    .order("created_at", { ascending: false })
    .limit(300);

  const { data: pendingPayments } = await supabase
    .from("payments")
    .select("id,registration_id,amount_cents,method,status,payment_date,created_at,payer_name,external_reference,notes,registrations(confirmation_code,husband_first_name,husband_last_name,wife_first_name,wife_last_name,husband_email,wife_email)")
    .eq("status", "pending_verification")
    .order("created_at", { ascending: true })
    .limit(100);

  const rows = registrations || [];
  const active = rows.filter((r) => r.registration_status !== "cancelled");
  const metrics = {
    registered: active.length,
    confirmed: active.filter((r) => r.registration_status === "confirmed").length,
    pendingDeposit: active.filter((r) => r.registration_status === "pending_payment_verification").length,
    paidInFull: active.filter((r) => r.balance_cents === 0).length,
    collectedCents: active.reduce((sum, r) => sum + (r.verified_paid_cents || 0), 0),
    outstandingCents: active.reduce((sum, r) => sum + (r.balance_cents || 0), 0),
  };

  return NextResponse.json({
    admin,
    metrics,
    registrations: rows,
    pendingPayments: pendingPayments || [],
  });
}
