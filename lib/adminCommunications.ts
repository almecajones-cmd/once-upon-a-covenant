import { getAdminSession, serviceClient } from "@/lib/server";
import { Communication, DeliveryEvent, summarizeRegistration } from "@/lib/communicationStatus";
import { reconcileDelivery } from "@/lib/reconcileDelivery";

export async function authorizedAdmin() {
  const session = await getAdminSession();
  if (!session) return null;
  const { data, error } = await serviceClient().from("admin_users").select("email,role").eq("email", session.admin_email).maybeSingle();
  if (error) throw error;
  return data;
}

// Page all rows so a quiet older registration cannot disappear behind a recent-row limit.
async function readAll(query: (from: number, to: number) => PromiseLike<{ data: any[] | null; error: any }>) {
  const rows: any[] = [];
  for (let start = 0; ; start += 500) {
    const { data, error } = await query(start, start + 499);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < 500) return rows;
  }
}

export async function getCommunicationDashboard(registrationId?: string) {
  const db = serviceClient();
  const [registrations, communications] = await Promise.all([
    readAll((from,to) => {
      let q = db.from("registrations").select("id,confirmation_code,created_at,husband_first_name,husband_last_name,wife_first_name,wife_last_name,husband_email,wife_email,registration_status");
      if (registrationId) q = q.eq("id", registrationId);
      return q.order("created_at", {ascending:false}).order("id").range(from,to);
    }),
    readAll((from,to) => {
      let q = db.from("email_communications").select("id,registration_id,purpose,to_addresses,subject,provider_email_id,send_status,delivery_status,error_message,metadata,created_at,updated_at").in("purpose", ["registration_confirmation", "registration_team_notification"]);
      if (registrationId) q = q.eq("registration_id", registrationId);
      return q.order("created_at", {ascending:false}).order("id").range(from,to);
    }),
  ]);
  const ids = communications.map(r => r.provider_email_id).filter(Boolean);
  const events: DeliveryEvent[] = [];
  for (let i = 0; i < ids.length; i += 100) {
    events.push(...await readAll((from,to) => db.from("email_delivery_events").select("provider_email_id,event_type,event_at,recipient").in("provider_email_id",ids.slice(i,i+100)).order("event_at", {ascending:false}).order("id").range(from,to)));
  }
  const now = Date.now();
  const key = process.env.RESEND_API_KEY;
  const reconciliation = key ? await reconcileDelivery(communications as Communication[], events, {
    lookup: async id => {
      const response = await fetch(`https://api.resend.com/emails/${encodeURIComponent(id)}`, {
        headers: {Authorization: `Bearer ${key}`}, cache: "no-store", signal: AbortSignal.timeout(4000),
      });
      if (!response.ok) throw new Error("Provider status unavailable");
      return response.json();
    },
    save: async (row, patch) => {
      // Do not overwrite a webhook update or a concurrent admin refresh.
      const {data, error} = await db.from("email_communications").update(patch).eq("id",row.id)
        .eq("updated_at",row.updated_at).select("id");
      if (error) throw error;
      return Boolean(data?.length);
    },
    pause: () => new Promise(resolve => setTimeout(resolve, 600)),
  }, now) : {checked:0,updated:0,errors:0,remaining:0};
  return {
    checkedAt: new Date().toISOString(),
    webhookConfigured: Boolean(process.env.RESEND_WEBHOOK_SECRET),
    reconciliation: {...reconciliation, configured:Boolean(key)},
    registrations: registrations.map(r => ({ ...r, communication: summarizeRegistration(r, communications as Communication[], events, now) })),
  };
}
