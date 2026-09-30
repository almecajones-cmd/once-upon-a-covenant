"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Dashboard = any;
const money=(c:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format((c||0)/100);
const clean=(v:any)=>String(v??"").replaceAll("_"," ");
const niceDate=(v:any)=>v?new Date(v).toLocaleDateString():"—";

function csvCell(value:any){
  const raw=Array.isArray(value)?value.join(" | "):String(value??"");
  return `"${raw.replace(/"/g,'""')}"`;
}

function downloadCsv(filename:string, headers:string[], rows:any[][]){
  const body=[headers.map(csvCell).join(","),...rows.map(row=>row.map(csvCell).join(","))].join("\n");
  const blob=new Blob(["\uFEFF"+body],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),500);
}

export default function AdminPortal(){
  const [dashboard,setDashboard]=useState<Dashboard|null>(null);
  const [loginStage,setLoginStage]=useState<"email"|"code">("email");
  const [email,setEmail]=useState("");
  const [code,setCode]=useState("");
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  const [reportView,setReportView]=useState<"registrations"|"payments">("registrations");
  const [search,setSearch]=useState("");
  const [registrationStatus,setRegistrationStatus]=useState("all");
  const [paymentStatus,setPaymentStatus]=useState("all");
  const [stateFilter,setStateFilter]=useState("all");
  const [balanceFilter,setBalanceFilter]=useState("all");
  const [needsFilter,setNeedsFilter]=useState("all");
  const [paymentMethod,setPaymentMethod]=useState("all");
  const [paymentRecordStatus,setPaymentRecordStatus]=useState("all");

  async function load(){
    const res=await fetch("/api/admin/dashboard",{cache:"no-store"});
    if(res.ok){setDashboard(await res.json());return true}
    return false;
  }
  useEffect(()=>{load().catch(()=>{})},[]);

  async function requestCode(e:FormEvent){
    e.preventDefault();setBusy(true);setError("");
    await fetch("/api/admin/request-code",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email})});
    setLoginStage("code");setMessage("If this address is authorized, a six-digit sign-in code was sent.");setBusy(false);
  }

  async function verifyCode(e:FormEvent){
    e.preventDefault();setBusy(true);setError("");
    const res=await fetch("/api/admin/verify-code",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email,code})});
    const data=await res.json();
    if(!res.ok){setError(data.error||"Unable to sign in.");setBusy(false);return}
    await load();setBusy(false);
  }

  async function updatePayment(paymentId:string,action:"verify"|"reject"){
    if(action==="reject"&&!window.confirm("Reject this pending payment record?")) return;
    setBusy(true);setError("");
    const res=await fetch("/api/admin/payments/verify",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({paymentId,action})});
    const data=await res.json();
    if(!res.ok){setError(data.error||"Unable to update payment.");setBusy(false);return}
    await load();setBusy(false);
  }

  async function logout(){
    await fetch("/api/admin/logout",{method:"POST"});
    setDashboard(null);setLoginStage("email");setCode("");
  }

  const states=useMemo(()=>{
    const values=(dashboard?.registrations||[]).map((r:any)=>r.state).filter(Boolean);
    return Array.from(new Set(values)).sort() as string[];
  },[dashboard]);

  const filteredRegistrations=useMemo(()=>{
    const rows=dashboard?.registrations||[];
    const q=search.trim().toLowerCase();
    return rows.filter((r:any)=>{
      const searchMatch=!q||[
        `${r.husband_first_name} ${r.husband_last_name}`,
        `${r.wife_first_name} ${r.wife_last_name}`,
        r.husband_email,r.wife_email,r.confirmation_code,r.church_display,r.city,r.state
      ].some(v=>String(v||"").toLowerCase().includes(q));
      const regMatch=registrationStatus==="all"||r.registration_status===registrationStatus;
      const payMatch=paymentStatus==="all"||r.payment_status===paymentStatus;
      const stateMatch=stateFilter==="all"||r.state===stateFilter;
      const balanceMatch=balanceFilter==="all"||(balanceFilter==="outstanding"?r.balance_cents>0:r.balance_cents===0);
      const needsMatch=needsFilter==="all"||
        (needsFilter==="accessible"&&r.accessible_room_requested)||
        (needsFilter==="extra_nights"&&Array.isArray(r.extra_nights)&&r.extra_nights.length>0)||
        (needsFilter==="dietary"&&Boolean(r.dietary_restrictions))||
        (needsFilter==="accessibility"&&Boolean(r.accessibility_needs));
      return searchMatch&&regMatch&&payMatch&&stateMatch&&balanceMatch&&needsMatch;
    });
  },[dashboard,search,registrationStatus,paymentStatus,stateFilter,balanceFilter,needsFilter]);

  const filteredPayments=useMemo(()=>{
    const rows=dashboard?.payments||[];
    const q=search.trim().toLowerCase();
    return rows.filter((p:any)=>{
      const reg=Array.isArray(p.registrations)?p.registrations[0]:p.registrations;
      const searchMatch=!q||[
        `${reg?.husband_first_name||""} ${reg?.husband_last_name||""}`,
        `${reg?.wife_first_name||""} ${reg?.wife_last_name||""}`,
        reg?.confirmation_code,reg?.husband_email,reg?.wife_email,p.external_reference
      ].some(v=>String(v||"").toLowerCase().includes(q));
      return searchMatch&&(paymentMethod==="all"||p.method===paymentMethod)&&(paymentRecordStatus==="all"||p.status===paymentRecordStatus);
    });
  },[dashboard,search,paymentMethod,paymentRecordStatus]);

  const reportSummary=useMemo(()=>{
    const rows=filteredRegistrations;
    return {
      couples:rows.length,
      confirmed:rows.filter((r:any)=>r.registration_status==="confirmed").length,
      collected:rows.reduce((sum:number,r:any)=>sum+(r.verified_paid_cents||0),0),
      outstanding:rows.reduce((sum:number,r:any)=>sum+(r.balance_cents||0),0),
    };
  },[filteredRegistrations]);

  function resetFilters(){
    setSearch("");setRegistrationStatus("all");setPaymentStatus("all");setStateFilter("all");
    setBalanceFilter("all");setNeedsFilter("all");setPaymentMethod("all");setPaymentRecordStatus("all");
  }

  function exportRegistrations(){
    downloadCsv(
      "once-upon-a-covenant-registration-report.csv",
      ["Confirmation","Registered At","Relationship","Husband","Husband Email","Husband Phone","Wife","Wife Email","Wife Phone","Address","City","State","ZIP","Church","Registration Status","Payment Status","Total Due","Verified Paid","Balance","Accessible Room","Extra Nights","Dietary Restrictions","Accessibility Needs"],
      filteredRegistrations.map((r:any)=>[
        r.confirmation_code,r.created_at,r.relationship_status,
        `${r.husband_first_name} ${r.husband_last_name}`,r.husband_email,r.husband_phone,
        `${r.wife_first_name} ${r.wife_last_name}`,r.wife_email,r.wife_phone,
        [r.address_line1,r.address_line2].filter(Boolean).join(" "),r.city,r.state,r.postal_code,
        r.church_display,r.registration_status,r.payment_status,
        ((r.total_fee_cents+r.late_fee_cents)/100).toFixed(2),
        (r.verified_paid_cents/100).toFixed(2),(r.balance_cents/100).toFixed(2),
        r.accessible_room_requested?"Yes":"No",r.extra_nights,
        r.dietary_restrictions,r.accessibility_needs
      ])
    );
  }

  function exportPayments(){
    downloadCsv(
      "once-upon-a-covenant-payment-report.csv",
      ["Submitted","Confirmation","Couple","Amount","Method","Status","Payment Date","Verified At","Verified By","External Reference","Notes"],
      filteredPayments.map((p:any)=>{
        const reg=Array.isArray(p.registrations)?p.registrations[0]:p.registrations;
        return [
          p.created_at,reg?.confirmation_code,
          `${reg?.husband_first_name||""} & ${reg?.wife_first_name||""}`,
          (p.amount_cents/100).toFixed(2),p.method,p.status,p.payment_date,p.verified_at,p.verified_by,p.external_reference,p.notes
        ];
      })
    );
  }

  if(!dashboard){
    return <section className="adminLoginCard">
      <p className="eyebrow plum">COMMITTEE ADMINISTRATION</p><h2>Secure sign in</h2>
      <p>Authorized committee members receive a one-time code by email.</p>
      {loginStage==="email"?<form onSubmit={requestCode}><label className="field"><span>Email address</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><button className="plumButton" disabled={busy}>{busy?"SENDING…":"SEND SIGN-IN CODE"}</button></form>:
      <form onSubmit={verifyCode}><p className="lookupMessage">{message}</p><label className="field"><span>Six-digit code</span><input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" maxLength={6} required/></label><button className="plumButton" disabled={busy}>{busy?"VERIFYING…":"SIGN IN"}</button></form>}
      {error&&<p className="formError" role="alert">{error}</p>}
    </section>
  }

  const m=dashboard.metrics;
  return <div className="adminPortal adminPortal--reports">
    <div className="adminToolbar">
      <div>
        <p className="eyebrow plum">COMMITTEE ADMINISTRATION</p>
        <h2>Registration & Payment Center</h2>
        <p>{dashboard.admin.email} · {dashboard.admin.role.replaceAll("_"," ")}</p>
      </div>
      <div className="adminToolbarActions">
        <button className="outlineButton" onClick={reportView==="registrations"?exportRegistrations:exportPayments}>EXPORT CURRENT REPORT</button>
        <button className="textAction" onClick={logout}>Sign out</button>
      </div>
    </div>

    <div className="adminMetrics adminMetrics--reporting">
      <div><span>Registrations Received</span><strong>{m.registered}</strong><small>All active couples</small></div>
      <div><span>Rooms Secured</span><strong>{m.confirmed}</strong><small>Deposit verified</small></div>
      <div><span>Pending Deposit</span><strong>{m.pendingDeposit}</strong><small>Not yet secured</small></div>
      <div><span>Awaiting Verification</span><strong>{m.awaitingVerification}</strong><small>Payment records</small></div>
      <div><span>Collected</span><strong>{money(m.collectedCents)}</strong><small>Verified payments</small></div>
      <div><span>Outstanding</span><strong>{money(m.outstandingCents)}</strong><small>Remaining balances</small></div>
    </div>

    <section className="adminSection adminVerificationSection">
      <div className="adminSectionHead">
        <div><p className="eyebrow plum">ACTION QUEUE</p><h3>Payments Pending Verification</h3><p>Verify only after the payment has actually been received or a check has cleared.</p></div>
        <span className="countPill">{dashboard.pendingPayments.length}</span>
      </div>
      {dashboard.pendingPayments.length===0?<div className="adminEmptyState">No payments are waiting for verification.</div>:<div className="adminTableWrap"><table className="adminTable"><thead><tr><th>Couple</th><th>Reference</th><th>Amount</th><th>Method</th><th>Submitted</th><th>Action</th></tr></thead><tbody>
      {dashboard.pendingPayments.map((p:any)=>{const reg=Array.isArray(p.registrations)?p.registrations[0]:p.registrations;return <tr key={p.id}><td><strong>{reg?.husband_first_name} & {reg?.wife_first_name}</strong><br/><small>{reg?.husband_email}</small></td><td>{reg?.confirmation_code}</td><td><strong>{money(p.amount_cents)}</strong></td><td><span className={"adminStatusBadge method-"+p.method}>{clean(p.method)}</span></td><td>{niceDate(p.created_at)}</td><td><div className="rowActions"><button onClick={()=>updatePayment(p.id,"verify")} disabled={busy}>Verify</button><button className="rejectButton" onClick={()=>updatePayment(p.id,"reject")} disabled={busy}>Reject</button></div></td></tr>})}
      </tbody></table></div>}
    </section>

    <section className="adminSection adminReportSection">
      <div className="adminReportHeader">
        <div>
          <p className="eyebrow plum">REPORTING & EXPORT</p>
          <h3>Committee Report Center</h3>
          <p>Filter the live data, review balances and needs, then export exactly what is on screen.</p>
        </div>
        <div className="adminReportTabs" role="tablist" aria-label="Admin reports">
          <button className={reportView==="registrations"?"active":""} onClick={()=>setReportView("registrations")}>REGISTRATIONS</button>
          <button className={reportView==="payments"?"active":""} onClick={()=>setReportView("payments")}>PAYMENTS</button>
        </div>
      </div>

      <div className="adminReportFilters">
        <label><span>Search</span><input className="adminSearch" placeholder="Name, email, church or reference…" value={search} onChange={e=>setSearch(e.target.value)}/></label>
        {reportView==="registrations"?<>
          <label><span>Registration status</span><select value={registrationStatus} onChange={e=>setRegistrationStatus(e.target.value)}><option value="all">All statuses</option><option value="pending_payment_verification">Pending deposit</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option><option value="transferred">Transferred</option><option value="refund_review">Refund review</option><option value="refunded">Refunded</option></select></label>
          <label><span>Payment status</span><select value={paymentStatus} onChange={e=>setPaymentStatus(e.target.value)}><option value="all">All payment statuses</option><option value="unpaid">Unpaid</option><option value="pending_verification">Pending verification</option><option value="partial">Partial</option><option value="paid">Paid in full</option><option value="failed">Failed</option></select></label>
          <label><span>State</span><select value={stateFilter} onChange={e=>setStateFilter(e.target.value)}><option value="all">All states</option>{states.map(s=><option value={s} key={s}>{s}</option>)}</select></label>
          <label><span>Balance</span><select value={balanceFilter} onChange={e=>setBalanceFilter(e.target.value)}><option value="all">All balances</option><option value="outstanding">Balance due</option><option value="paid">Paid in full</option></select></label>
          <label><span>Lodging / needs</span><select value={needsFilter} onChange={e=>setNeedsFilter(e.target.value)}><option value="all">All couples</option><option value="accessible">Accessible room</option><option value="extra_nights">Extra nights</option><option value="dietary">Dietary need</option><option value="accessibility">Accessibility need</option></select></label>
        </>:<>
          <label><span>Method</span><select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}><option value="all">All methods</option><option value="pushpay">PushPay</option><option value="zelle">Zelle</option><option value="check">Check</option><option value="money_order">Money Order</option></select></label>
          <label><span>Payment record status</span><select value={paymentRecordStatus} onChange={e=>setPaymentRecordStatus(e.target.value)}><option value="all">All statuses</option><option value="pending_verification">Pending verification</option><option value="verified">Verified</option><option value="rejected">Rejected</option><option value="failed">Failed</option><option value="refund_review">Refund review</option><option value="refunded">Refunded</option></select></label>
        </>}
        <button className="adminClearFilters" onClick={resetFilters}>Clear filters</button>
      </div>

      {reportView==="registrations"?<>
        <div className="adminReportSummary">
          <div><span>Couples in report</span><strong>{reportSummary.couples}</strong></div>
          <div><span>Confirmed</span><strong>{reportSummary.confirmed}</strong></div>
          <div><span>Verified collected</span><strong>{money(reportSummary.collected)}</strong></div>
          <div><span>Outstanding</span><strong>{money(reportSummary.outstanding)}</strong></div>
          <button className="plumButton" onClick={exportRegistrations}>EXPORT REGISTRATION CSV</button>
        </div>
        <div className="adminTableWrap"><table className="adminTable adminReportTable"><thead><tr><th>Couple & Contact</th><th>Church / Location</th><th>Status</th><th>Paid</th><th>Balance</th><th>Lodging / Needs</th><th>Registered</th></tr></thead><tbody>
          {filteredRegistrations.length===0?<tr><td colSpan={7}>No registrations match these filters.</td></tr>:filteredRegistrations.map((r:any)=><tr key={r.id}>
            <td><strong>{r.husband_first_name} {r.husband_last_name}</strong><br/><span>{r.wife_first_name} {r.wife_last_name}</span><br/><small>{r.confirmation_code} · {r.husband_email}</small></td>
            <td><strong>{r.church_display||"—"}</strong><br/><small>{r.city}, {r.state}</small></td>
            <td><span className={"adminStatusBadge status-"+r.registration_status}>{clean(r.registration_status)}</span><br/><small>{clean(r.payment_status)}</small></td>
            <td><strong>{money(r.verified_paid_cents)}</strong></td>
            <td className={r.balance_cents>0?"balanceDue":""}><strong>{money(r.balance_cents)}</strong></td>
            <td><div className="adminNeedTags">{r.accessible_room_requested&&<span>Accessible room</span>}{Array.isArray(r.extra_nights)&&r.extra_nights.length>0&&<span>Extra nights: {r.extra_nights.join(", ")}</span>}{r.dietary_restrictions&&<span>Dietary</span>}{r.accessibility_needs&&<span>Accessibility</span>}{!r.accessible_room_requested&&(!r.extra_nights||r.extra_nights.length===0)&&!r.dietary_restrictions&&!r.accessibility_needs&&<small>None noted</small>}</div></td>
            <td>{niceDate(r.created_at)}</td>
          </tr>)}
        </tbody></table></div>
      </>:<>
        <div className="adminReportSummary adminReportSummary--payments">
          <div><span>Payment records</span><strong>{filteredPayments.length}</strong></div>
          <div><span>Amount represented</span><strong>{money(filteredPayments.reduce((s:number,p:any)=>s+(p.amount_cents||0),0))}</strong></div>
          <div><span>Verified</span><strong>{filteredPayments.filter((p:any)=>p.status==="verified").length}</strong></div>
          <div><span>Pending</span><strong>{filteredPayments.filter((p:any)=>p.status==="pending_verification").length}</strong></div>
          <button className="plumButton" onClick={exportPayments}>EXPORT PAYMENT CSV</button>
        </div>
        <div className="adminTableWrap"><table className="adminTable adminReportTable"><thead><tr><th>Couple / Reference</th><th>Amount</th><th>Method</th><th>Status</th><th>Submitted</th><th>Verified</th><th>Reference / Notes</th></tr></thead><tbody>
          {filteredPayments.length===0?<tr><td colSpan={7}>No payment records match these filters.</td></tr>:filteredPayments.map((p:any)=>{const reg=Array.isArray(p.registrations)?p.registrations[0]:p.registrations;return <tr key={p.id}>
            <td><strong>{reg?.husband_first_name} & {reg?.wife_first_name}</strong><br/><small>{reg?.confirmation_code}</small></td>
            <td><strong>{money(p.amount_cents)}</strong></td>
            <td>{clean(p.method)}</td>
            <td><span className={"adminStatusBadge payment-"+p.status}>{clean(p.status)}</span></td>
            <td>{niceDate(p.created_at)}</td>
            <td>{p.verified_at?<><strong>{niceDate(p.verified_at)}</strong><br/><small>{p.verified_by||""}</small></>:"—"}</td>
            <td><small>{p.external_reference||"—"}{p.notes?<><br/>{p.notes}</>:""}</small></td>
          </tr>})}
        </tbody></table></div>
      </>}
    </section>

    {error&&<p className="formError" role="alert">{error}</p>}
  </div>
}
