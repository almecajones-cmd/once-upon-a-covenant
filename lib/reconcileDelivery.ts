import { Communication, DeliveryEvent, communicationState, mergeDeliveryStatus } from "./communicationStatus";

type Dependencies = {
  lookup: (id: string) => Promise<{ id: string; last_event: string }>;
  save: (row: Communication, patch: Partial<Communication>) => Promise<boolean>;
  pause: () => Promise<void>;
};
const pending = new Set(["sent", "unconfirmed", "delivery_delayed"]);
const known = new Set(["sent", "delivered", "bounced", "suppressed", "failed", "complained", "delivery_delayed"]);

// Recheck existing messages only. This module never sends email.
export async function reconcileDelivery(rows: Communication[], events: DeliveryEvent[], deps: Dependencies, now = Date.now()) {
  const report = { checked: 0, updated: 0, errors: 0, remaining: 0 };
  const due = rows.filter(row => row.provider_email_id && pending.has(communicationState(row, events, now))
    && (!row.metadata?.provider_checked_at || now - Date.parse(String(row.metadata.provider_checked_at)) >= 5 * 60_000))
    .sort((a, b) => Date.parse(String(a.metadata?.provider_checked_at || a.created_at)) - Date.parse(String(b.metadata?.provider_checked_at || b.created_at)));
  report.remaining = Math.max(0, due.length - 10);
  // Bound request duration and keep below the provider's API request rate.
  for (const row of due.slice(0, 10)) {
    if (report.checked) await deps.pause();
    report.checked++;
    try {
      const result = await deps.lookup(row.provider_email_id!);
      if (result.id !== row.provider_email_id) throw new Error("Provider message mismatch");
      const observed = ["opened", "clicked"].includes(result.last_event) ? "delivered" : result.last_event;
      if (!known.has(observed)) throw new Error("Unrecognized delivery status");
      const status = mergeDeliveryStatus(row.delivery_status, observed);
      const patch: Partial<Communication> = {
        delivery_status: status,
        updated_at: new Date(now).toISOString(),
        metadata: { ...row.metadata, provider_checked_at: new Date(now).toISOString(), provider_last_event: result.last_event },
        ...(status === "delivered" ? {error_message:null} : {}),
      };
      if (await deps.save(row, patch)) {
        if (row.delivery_status !== status) report.updated++;
        Object.assign(row, patch);
      }
    } catch {
      // An unavailable lookup is a tracking problem, never proof that an email failed.
      report.errors++;
    }
  }
  return report;
}
