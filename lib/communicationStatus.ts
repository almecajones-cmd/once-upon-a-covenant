export type Communication = {
  id: string; registration_id: string | null; purpose: string;
  to_addresses: string[]; subject: string; provider_email_id: string | null;
  send_status: string; delivery_status: string | null; error_message: string | null;
  created_at: string; updated_at: string; metadata: Record<string, unknown>;
};
export type DeliveryEvent = {
  provider_email_id: string; event_type: string; event_at: string; recipient: string | null;
};
export const statusLabels: Record<string, string> = {
  missing: "No confirmation recorded", missing_email: "Missing attendee email",
  invalid_email: "Invalid attendee email", attempted: "Sending", stalled: "Send outcome unknown",
  sent: "Accepted · awaiting delivery", unconfirmed: "Delivery unconfirmed",
  delivered: "Delivered", bounced: "Bounced", suppressed: "Suppressed", failed: "Failed",
  complained: "Spam complaint", delivery_delayed: "Delivery delayed",
};
export const issueStatuses = new Set(["missing", "missing_email", "invalid_email", "stalled", "unconfirmed", "bounced", "suppressed", "failed", "complained", "delivery_delayed"]);
const terminalIssues = new Set(["bounced", "suppressed", "failed", "complained"]);
export function validEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
export function recipientsFor(registration: { husband_email?: string; wife_email?: string }) {
  return [...new Set([registration.husband_email, registration.wife_email].map(e => (e || "").trim().toLowerCase()).filter(Boolean))];
}
export function communicationState(row: Communication | undefined, events: DeliveryEvent[] = [], now = Date.now()) {
  if (!row) return "missing";
  const history = events.filter(e => e.provider_email_id === row.provider_email_id)
    .sort((a, b) => Date.parse(b.event_at) - Date.parse(a.event_at));
  // A grouped email can bounce for one spouse and deliver to the other. Keep the issue visible.
  const issue = history.find(e => terminalIssues.has(e.event_type.replace("email.", "")));
  const final = issue || history.find(e => e.event_type === "email.delivered") || history[0];
  let status = final?.event_type.replace("email.", "") || row.delivery_status || row.send_status;
  const age = now - Date.parse(row.created_at);
  if (status === "attempted" && age >= 5 * 60_000) status = "stalled";
  if (status === "sent" && age >= 30 * 60_000) status = "unconfirmed";
  return status;
}
export function summarizeRegistration(registration: { id: string; husband_email?: string; wife_email?: string }, rows: Communication[], events: DeliveryEvent[], now = Date.now()) {
  const history = rows.filter(r => r.registration_id === registration.id)
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || b.id.localeCompare(a.id));
  const confirmations = history.filter(r => r.purpose === "registration_confirmation");
  const recipients = recipientsFor(registration);
  const attendee = recipients.map(email => {
    const latest = confirmations.find(r => r.to_addresses.some(e => e.toLowerCase() === email));
    return { email, latest: latest || null, status: validEmail(email) ? communicationState(latest, events, now) : "invalid_email" };
  });
  const issues = [...new Set(attendee.map(a => a.status).filter(s => issueStatuses.has(s)))];
  if (!registration.husband_email?.trim() || !registration.wife_email?.trim()) issues.unshift("missing_email");
  const committee = history.find(r => r.purpose === "registration_team_notification");
  return { attendee, issues, committee: committee ? { ...committee, status: communicationState(committee, events, now) } : null,
    history: history.map(row => ({ ...row, status: communicationState(row, events, now),
      status_at: events.filter(e => e.provider_email_id === row.provider_email_id).sort((a,b) => Date.parse(b.event_at)-Date.parse(a.event_at))[0]?.event_at || row.updated_at })),
  };
}
