import { NextResponse } from "next/server";
import { getAdminSession, serviceClient } from "@/lib/server";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const supabase = serviceClient();
  const { data: admin } = await supabase.from("admin_users").select("email,role").eq("email", session.admin_email).single();

  const { data: registrations } = await supabase
    .from("admin_registration_summary")
    .select("id,confirmation_code,created_at,relationship_status,husband_first_name,husband_last_name,husband_email,husband_phone,wife_first_name,wife_last_name,wife_email,wife_phone,address_line1,address_line2,city,state,postal_code,church_id,church_name_other,dietary_restrictions,accessibility_needs,registration_status,payment_status,total_fee_cents,late_fee_cents,verified_paid_cents,balance_cents,accessible_room_requested,extra_nights")
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = registrations || [];
  const churchIds = Array.from(new Set(rows.map((r:any)=>r.church_id).filter(Boolean)));
  let churchMap:Record<string,string>={};
  if(churchIds.length){
    const { data: churches }=await supabase.from("churches").select("id,name,location").in("id",churchIds);
    churchMap=Object.fromEntries((churches||[]).map((c:any)=>[String(c.id),[c.name,c.location].filter(Boolean).join(" — ")]));
  }

  const registrationRows=rows.map((r:any)=>({
    ...r,
    church_display:r.church_id?churchMap[String(r.church_id)]||r.church_name_other||"Church of Christ":r.church_name_other||"—",
  }));

  const { data: payments } = await supabase
    .from("payments")
    .select("id,registration_id,amount_cents,method,status,payment_date,created_at,payer_name,external_reference,verified_by,verified_at,notes,registrations(confirmation_code,husband_first_name,husband_last_name,wife_first_name,wife_last_name,husband_email,wife_email)")
    .order("created_at", { ascending: false })
    .limit(1000);

  const paymentRows=payments||[];
  const pendingPayments=paymentRows
    .filter((p:any)=>p.status==="pending_verification")
    .sort((a:any,b:any)=>new Date(a.created_at).getTime()-new Date(b.created_at).getTime());

  const active = registrationRows.filter((r:any) => r.registration_status !== "cancelled");
  const metrics = {
    registered: active.length,
    confirmed: active.filter((r:any) => r.registration_status === "confirmed").length,
    pendingDeposit: active.filter((r:any) => r.registration_status === "pending_payment_verification").length,
    paidInFull: active.filter((r:any) => r.balance_cents === 0).length,
    awaitingVerification: pendingPayments.length,
    collectedCents: active.reduce((sum:number, r:any) => sum + (r.verified_paid_cents || 0), 0),
    outstandingCents: active.reduce((sum:number, r:any) => sum + (r.balance_cents || 0), 0),
  };

  return NextResponse.json({
    admin,
    metrics,
    registrations: registrationRows,
    payments: paymentRows,
    pendingPayments,
  });
}
