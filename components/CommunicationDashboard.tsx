"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Communication, statusLabels, validEmail } from "@/lib/communicationStatus";

type History = Communication & { status: string; status_at: string };
type Registration = {
  id: string; confirmation_code: string; husband_first_name: string; husband_last_name: string;
  wife_first_name: string; wife_last_name: string; registration_status: string;
  communication: {
    issues: string[]; attendee: {email:string;status:string;latest:Communication|null}[];
    committee: (Communication & {status:string}) | null; history: History[];
  };
};
type Dashboard = {checkedAt:string;webhookConfigured:boolean;registrations:Registration[]};
const date = (value: string) => new Date(value).toLocaleString("en-US",{timeZone:"America/Indiana/Indianapolis",dateStyle:"medium",timeStyle:"short"}) + " ET";
const name = (r: Registration) => `${r.husband_first_name} ${r.husband_last_name} & ${r.wife_first_name} ${r.wife_last_name}`;
const label = (status: string) => statusLabels[status] || status.replaceAll("_"," ");
const inactive = (r: Registration) => ["cancelled","refunded","transferred"].includes(r.registration_status);
const blocked = (r: Registration) => r.communication.history.some(h => ["bounced","suppressed","complained"].includes(h.status) && h.to_addresses.some(e => r.communication.attendee.some(a => a.email === e.toLowerCase())));
const badge = (status:string) => <span className={`commBadge commBadge--${status}`}>{label(status)}</span>;

export default function CommunicationDashboard({selectedId,onSelect}:{selectedId:string|null;onSelect:(id:string|null)=>void}) {
  const [data,setData] = useState<Dashboard|null>(null);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const [loading,setLoading] = useState(true);
  const [sending,setSending] = useState(false);
  const [filter,setFilter] = useState("attention");
  const [query,setQuery] = useState("");
  const [confirmSend,setConfirmSend] = useState(false);
  const inFlight = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/communications",{cache:"no-store"});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load communication records.");
      setData(result);setError("");
    } catch(e) {setError(e instanceof Error ? e.message : "Unable to load communication records.");}
    finally {setLoading(false);}
  },[]);
  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {if(document.visibilityState === "visible" && !inFlight.current) void refresh();},60_000);
    return () => window.clearInterval(timer);
  },[refresh]);
  const selected = data?.registrations.find(r => r.id===selectedId);
  useEffect(() => {
    setConfirmSend(false);setNotice("");
    if (selectedId) dialog.current?.showModal(); else dialog.current?.close();
  },[selectedId]);
  const counts = useMemo(() => {
    const active = (data?.registrations || []).filter(r => !inactive(r));
    return { attention:active.filter(r => r.communication.issues.length).length,
      failed:active.filter(r => r.communication.issues.some(s => ["bounced","suppressed","failed","complained"].includes(s))).length,
      missing:active.filter(r => r.communication.issues.some(s => ["missing","missing_email","invalid_email"].includes(s))).length,
      waiting:active.filter(r => r.communication.issues.some(s => ["stalled","unconfirmed","delivery_delayed"].includes(s))).length };
  },[data]);
  const rows = (data?.registrations || []).filter(r => {
    const issues = r.communication.issues;
    const matches = filter==="all" || (!inactive(r) && (filter==="attention" ? issues.length>0 : issues.includes(filter)));
    return matches && (!query.trim() || [name(r),r.confirmation_code,...r.communication.attendee.map(a => a.email)].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  });
  async function resend() {
    if (!selected || inFlight.current) return;
    inFlight.current=true;setSending(true);setNotice("");setConfirmSend(false);
    try {
      const res = await fetch("/api/admin/communications/resend", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({registrationId:selected.id,requestId:crypto.randomUUID()})});
      const result = await res.json();
      setNotice(result.message || result.error || "Refresh the communication history to verify the outcome.");
    } catch { setNotice("The resend result could not be verified. Refresh the history before trying again."); }
    finally {await refresh();inFlight.current=false;setSending(false);}
  }
  const noAddress = selected && (!selected.communication.attendee.length || selected.communication.attendee.some(a => !validEmail(a.email)));
  const recipientBlocked = selected && blocked(selected);
  return <section className="adminSection commDashboard" aria-labelledby="comm-heading" id="communications">
    <div className="commHeader"><div><p className="eyebrow plum">COMMUNICATIONS · ACTION QUEUE</p><h3 id="comm-heading">Exception Dashboard</h3><p>Find confirmations that need attention, then review the existing registration.</p></div>
      <button className="outlineButton" onClick={()=>void refresh()} disabled={loading}>{loading?"Refreshing…":"Refresh status"}</button></div>
    {error && <p className="commAlert" role="alert">{error}{data && " Previously loaded records are shown below and may be out of date."}</p>}
    {!data && !error && <p role="status">Loading communication records…</p>}
    {data && <>
      {!data.webhookConfigured && <p className="commAlert" role="alert">Delivery tracking is not configured. Accepted emails cannot be assumed delivered. Contact the site administrator.</p>}
      <div className="commMetrics"><div><strong>{counts.attention}</strong><span>Couples needing attention</span></div><div><strong>{counts.failed}</strong><span>Failed, bounced, or blocked</span></div><div><strong>{counts.missing}</strong><span>Missing confirmation or email</span></div><div><strong>{counts.waiting}</strong><span>Delayed or unconfirmed</span></div></div>
      <div className="commFilters"><label>Search couple, email, or reference<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search communications…"/></label>
        <label>Show<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="attention">Needs attention</option><option value="all">All registrations</option>{["bounced","suppressed","failed","missing","missing_email","invalid_email","unconfirmed","stalled","delivery_delayed","complained"].map(s=><option value={s} key={s}>{label(s)}</option>)}</select></label></div>
      <p className="commMeta">{rows.length} {rows.length===1?"couple":"couples"} · Updated {date(data.checkedAt)} · Refreshes every minute while open</p>
      {rows.length===0 ? <div className="commEmpty">{filter==="attention"&&!query?"No active registrations need confirmation follow-up.":"No registrations match these filters."}</div> : <div className="commRows">{rows.map(r=><article className="commRow" key={r.id}><div><strong>{name(r)}</strong><p className="commMeta">{r.confirmation_code}{inactive(r)?` · ${r.registration_status}`:""}</p>{r.communication.attendee.map(a=><p className="commRecipient" key={a.email}>{a.email}</p>)}</div><div className="commBadges">{r.communication.issues.length?r.communication.issues.map(s=><span key={s}>{badge(s)}</span>):r.communication.attendee.map(a=><span key={a.email}>{badge(a.status)}</span>)}</div><button className="outlineButton" onClick={()=>onSelect(r.id)}>View communication</button></article>)}</div>}
      <p className="commHelp">“No confirmation recorded” can include registrations made before tracking began. “Accepted” means the provider accepted the send; “Delivered” means the receiving server accepted the message, not that it reached the inbox. Unconfirmed delivery is flagged after 30 minutes.</p>
    </>}
    <dialog className="commDialog" ref={dialog} aria-labelledby="communication-title" onCancel={e=>{if(sending)e.preventDefault();else onSelect(null);}} onClose={()=>onSelect(null)}>
      <div className="commDialogHead"><div><p className="eyebrow plum">REGISTRATION COMMUNICATIONS</p><h3 id="communication-title">Communication Status</h3></div><button aria-label="Close communication status" className="commClose" onClick={()=>onSelect(null)} disabled={sending}>×</button></div>
      {!selected ? <p>{error||"Loading this registration…"}</p> : <>
        <h4>{name(selected)}</h4><p className="commMeta">{selected.confirmation_code}</p>
        <div className="commPanel"><h4>Attendee confirmation</h4>{selected.communication.attendee.length ? selected.communication.attendee.map(a=><div className="commRecipientStatus" key={a.email}><span>{a.email}</span>{badge(a.status)}</div>):<p>No attendee email address is saved.</p>}
          <p className="commHelp">A shared message may have different outcomes for each recipient. A bounce or suppression remains flagged for review.</p>
          {recipientBlocked && <p className="commAlert">A saved recipient has a bounce, suppression, or complaint. Have the email administrator resolve it before resending; this control does not remove provider suppressions.</p>}
          {!confirmSend ? <button className="plumButton" onClick={()=>setConfirmSend(true)} disabled={sending||loading||!!error||!!noAddress||!!recipientBlocked||inactive(selected)}>{sending?"Sending…":"Resend Confirmation"}</button> : <div className="commConfirm"><p>Send a copy to <strong>{selected.communication.attendee.map(a=>a.email).join(" and ")}</strong>? This will not create a registration or payment.</p><div><button className="plumButton" onClick={()=>void resend()} disabled={sending}>Send confirmation</button><button className="outlineButton" onClick={()=>setConfirmSend(false)}>Cancel</button></div></div>}
          {notice && <p className="commNotice" role="status">{notice}</p>}
        </div>
        <div className="commPanel"><h4>Committee notification</h4>{selected.communication.committee ? <><p>{selected.communication.committee.to_addresses.join(", ")}</p>{badge(selected.communication.committee.status)}</>:<p>No committee notification recorded.</p>}</div>
        <div className="commPanel"><h4>Communication history</h4>{selected.communication.history.length===0?<p>No tracked messages are available for this registration.</p>:selected.communication.history.map(h=><article className="commHistory" key={h.id}><div className="commHistoryHead"><strong>{h.purpose==="registration_confirmation"?"Attendee confirmation":"Committee notification"}</strong>{badge(h.status)}</div><dl><dt>Recipient</dt><dd>{h.to_addresses.join(", ")}</dd><dt>Attempted</dt><dd>{date(h.created_at)}</dd><dt>Last status update</dt><dd>{date(h.status_at)}</dd><dt>Provider ID</dt><dd>{h.provider_email_id||"Not assigned"}</dd>{typeof h.metadata?.resent_by==="string"&&<><dt>Resent by</dt><dd>{h.metadata.resent_by}</dd></>}{h.error_message&&<><dt>Provider detail</dt><dd>{h.error_message}</dd></>}</dl></article>)}</div>
      </>}
    </dialog>
  </section>;
}
