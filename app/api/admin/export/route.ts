import { NextResponse } from "next/server";
import { getAdminSession, serviceClient } from "@/lib/server";

function csv(value: unknown) {
  const s = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return '"' + s.replace(/"/g, '""') + '"';
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const { data } = await serviceClient()
    .from("admin_registration_summary")
    .select("confirmation_code,created_at,relationship_status,husband_first_name,husband_last_name,husband_email,husband_phone,wife_first_name,wife_last_name,wife_email,wife_phone,city,state,registration_status,payment_status,total_fee_cents,late_fee_cents,verified_paid_cents,balance_cents,church_name_other,accessible_room_requested,extra_nights")
    .order("created_at", { ascending: false });

  const headers = [
    "Confirmation","Registered At","Relationship","Husband","Husband Email","Husband Phone",
    "Wife","Wife Email","Wife Phone","City","State","Registration Status","Payment Status",
    "Total Due","Verified Paid","Balance","Church/Other","Accessible Room","Extra Nights"
  ];

  const rows = (data || []).map((r) => [
    r.confirmation_code,r.created_at,r.relationship_status,
    `${r.husband_first_name} ${r.husband_last_name}`,r.husband_email,r.husband_phone,
    `${r.wife_first_name} ${r.wife_last_name}`,r.wife_email,r.wife_phone,r.city,r.state,
    r.registration_status,r.payment_status,
    ((r.total_fee_cents + r.late_fee_cents)/100).toFixed(2),
    (r.verified_paid_cents/100).toFixed(2),(r.balance_cents/100).toFixed(2),
    r.church_name_other,r.accessible_room_requested ? "Yes" : "No",r.extra_nights
  ]);

  const body = [headers.map(csv).join(","), ...rows.map((r) => r.map(csv).join(","))].join("\n");
  return new NextResponse(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="once-upon-a-covenant-registrations.csv"`,
    },
  });
}
