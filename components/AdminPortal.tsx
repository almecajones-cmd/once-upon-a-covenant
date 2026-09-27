"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Dashboard = any;
const money=(c:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format((c||0)/100);

export default function AdminPortal(){
  const [dashboard,setDashboard]=useState<Dashboard|null>(null);
  const [loginStage,setLoginStage]=useState<"email"|"code">("email");
  const [email,setEmail]=useState("");
  const [code,setCode]=useState("");
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [search,setSearch]=useState("");

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
  async function logout(){await fetch("/api/admin/logout",{method:"POST"});setDashboard(null);setLoginStage("email");setCode("")}

  const filtered=useMemo(()=>{
    const rows=dashboard?.registrations||[];const q=search.trim().toLowerCase();if(!q)return rows;
    return rows.filter((r:any)=>[`${r.husband_first_name} ${r.husband_last_name}`,`${r.wife_first_name} ${r.wife_last_name}`,r.husband_email,r.wife_email,r.confirmation_code,r.registration_status,r.payment_status].some(v=>String(v||"").toLowerCase().includes(q)));
  },[dashboard,search]);

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
  return <div className="adminPortal">
    <div className="adminToolbar"><div><p className="eyebrow plum">COMMITTEE ADMINISTRATION</p><h2>Retreat Dashboard</h2><p>{dashboard.admin.email} · {dashboard.admin.role.replaceAll("_"," ")}</p></div><div className="adminToolbarActions"><a className="outlineButton" href="/api/admin/export">EXPORT CSV</a><button className="textAction" onClick={logout}>Sign out</button></div></div>
    <div className="adminMetrics">
      <div><span>Registered</span><strong>{m.registered}</strong></div><div><span>Confirmed</span><strong>{m.confirmed}</strong></div><div><span>Pending Deposit</span><strong>{m.pendingDeposit}</strong></div><div><span>Paid in Full</span><strong>{m.paidInFull}</strong></div><div><span>Collected</span><strong>{money(m.collectedCents)}</strong></div><div><span>Outstanding</span><strong>{money(m.outstandingCents)}</strong></div>
    </div>

    <section className="adminSection">
      <div className="adminSectionHead"><div><p className="eyebrow plum">PAYMENTS</p><h3>Pending Verification</h3></div><span className="countPill">{dashboard.pendingPayments.length}</span></div>
      {dashboard.pendingPayments.length===0?<p>No payments are waiting for verification.</p>:<div className="adminTableWrap"><table className="adminTable"><thead><tr><th>Couple</th><th>Reference</th><th>Amount</th><th>Method</th><th>Submitted</th><th>Action</th></tr></thead><tbody>
      {dashboard.pendingPayments.map((p:any)=>{const reg=Array.isArray(p.registrations)?p.registrations[0]:p.registrations;return <tr key={p.id}><td>{reg?.husband_first_name} & {reg?.wife_first_name}</td><td>{reg?.confirmation_code}</td><td>{money(p.amount_cents)}</td><td>{p.method.replace("_"," ")}</td><td>{new Date(p.created_at).toLocaleDateString()}</td><td><div className="rowActions"><button onClick={()=>updatePayment(p.id,"verify")} disabled={busy}>Verify</button><button className="rejectButton" onClick={()=>updatePayment(p.id,"reject")} disabled={busy}>Reject</button></div></td></tr>})}
      </tbody></table></div>}
    </section>

    <section className="adminSection">
      <div className="adminSectionHead"><div><p className="eyebrow plum">REGISTRATIONS</p><h3>Couples & Balances</h3></div><input className="adminSearch" placeholder="Search name, email, reference or status…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>Couple</th><th>Reference</th><th>Status</th><th>Paid</th><th>Balance</th><th>Registered</th></tr></thead><tbody>
        {filtered.map((r:any)=><tr key={r.id}><td><strong>{r.husband_first_name} {r.husband_last_name}</strong><br/><span>{r.wife_first_name} {r.wife_last_name}</span></td><td>{r.confirmation_code}</td><td>{r.registration_status.replaceAll("_"," ")}<br/><small>{r.payment_status.replaceAll("_"," ")}</small></td><td>{money(r.verified_paid_cents)}</td><td>{money(r.balance_cents)}</td><td>{new Date(r.created_at).toLocaleDateString()}</td></tr>)}
      </tbody></table></div>
    </section>
    {error&&<p className="formError" role="alert">{error}</p>}
  </div>
}
