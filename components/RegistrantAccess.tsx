"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";

type Summary = {
  registration: {
    confirmation_code:string;
    husband_first_name:string;
    husband_last_name:string;
    wife_first_name:string;
    wife_last_name:string;
    registration_status:string;
    payment_status:string;
  };
  payments:Array<{
    id:string;
    amount_cents:number;
    method:string;
    status:string;
    payment_date:string|null;
    created_at:string;
    verified_at:string|null;
  }>;
  verifiedPaidCents:number;
  pendingTotalCents:number;
  balanceCents:number;
  totalDueCents:number;
  latestVerifiedPaymentCents:number;
  latestVerifiedPaymentDate:string|null;
  displayStatus:string;
  invitationConfirmed:boolean;
};

function money(cents:number){
  return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(cents/100);
}

export default function RegistrantAccess(){
  const [stage,setStage]=useState<"lookup"|"code"|"summary">("lookup");
  const [confirmation,setConfirmation]=useState("");
  const [email,setEmail]=useState("");
  const [code,setCode]=useState("");
  const [summary,setSummary]=useState<Summary|null>(null);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [amount,setAmount]=useState("");
  const [method,setMethod]=useState("pushpay");
  const [paymentMessage,setPaymentMessage]=useState("");
  const [pushPayUrl,setPushPayUrl]=useState("");
  const paymentRef=useRef("");

  async function loadSummary(){
    const res=await fetch("/api/registrant/summary",{cache:"no-store"});
    if(res.ok){
      setSummary(await res.json());
      setStage("summary");
    }
  }

  useEffect(()=>{loadSummary().catch(()=>{})},[]);

  async function requestCode(e:FormEvent){
    e.preventDefault();setBusy(true);setError("");setMessage("");
    await fetch("/api/registrant/request-code",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({confirmation,email})});
    track("registrant_lookup");
    setMessage("If those details match a registration, a six-digit code has been sent to that email address.");
    setStage("code");setBusy(false);
  }

  async function verifyCode(e:FormEvent){
    e.preventDefault();setBusy(true);setError("");
    const res=await fetch("/api/registrant/verify-code",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({confirmation,email,code})});
    const data=await res.json();
    if(!res.ok){setError(data.error||"We could not verify that code.");setBusy(false);return}
    await loadSummary();setBusy(false);
  }

  async function recover(){
    if(!email){setError("Enter the email address used for registration first.");return}
    setBusy(true);setError("");
    await fetch("/api/registrant/recover",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email})});
    setMessage("If that email matches an active registration, we sent the registration reference to that address.");
    setBusy(false);
  }

  async function submitPayment(e:FormEvent){
    e.preventDefault();
    if(busy)return;
    setBusy(true);setError("");setPaymentMessage("");setPushPayUrl("");

    if(!paymentRef.current) paymentRef.current=crypto.randomUUID();

    const res=await fetch("/api/registrant/payment",{
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({amount,method,clientReference:paymentRef.current})
    });
    const data=await res.json();

    if(!res.ok){
      setError(data.error||"We could not record that payment request.");
      setBusy(false);
      return;
    }

    track("registrant_payment_submit",{method,amount:Number(amount)});
    paymentRef.current="";

    if(method==="pushpay" && data.pushPayUrl){
      setPaymentMessage("Your payment request has been recorded. Continue to PushPay when you are ready. Enter the same amount, choose Give one time, and confirm the fund is 2027 Midwest Marriage Retreat. Your verified balance will update after the retreat finance team confirms the payment.");
      setPushPayUrl(data.pushPayUrl);
    }

    if(method==="zelle"){
      setPaymentMessage("Payment request recorded. Send your payment by Zelle to mbankhead@myeccoc.com. Your verified balance will update after the retreat finance team confirms receipt.");
    }

    if(method==="check"||method==="money_order"){
      setPaymentMessage("Payment request recorded. Make your check or money order payable to Eagle Creek Church of Christ with Midwest Marriage Retreat in the memo line. Mail it to Eagle Creek Church of Christ, c/o 2027 Midwest Marriage Retreat, 3025 W. 69th Street, Indianapolis, IN 46268. Checks must clear before verification. Your balance will update after the finance team verifies the payment.");
    }

    setAmount("");
    await loadSummary();
    setBusy(false);
  }

  async function logout(){
    await fetch("/api/registrant/logout",{method:"POST"});
    setSummary(null);setStage("lookup");setConfirmation("");setEmail("");setCode("");
  }

  if(stage==="summary" && summary){
    const r=summary.registration;
    return <div className="manageGrid">
      <section className={summary.invitationConfirmed?"balanceCard balanceCard--confirmed":"balanceCard"}>
        <div className="manageTopline">
          <span className="eyebrow plum">{summary.invitationConfirmed?"YOUR INVITATION IS CONFIRMED":"YOUR REGISTRATION"}</span>
          <button className="textAction" onClick={logout}>Sign out</button>
        </div>

        <h2>{r.husband_first_name} & {r.wife_first_name}</h2>
        <p className="eventLine">Once Upon a Covenant · October 8–10, 2027</p>
        <p className="confirmationPill">{r.confirmation_code}</p>

        <div className="statusBanner">
          <span>Current status</span>
          <strong>{summary.displayStatus}</strong>
        </div>

        <div className="balanceStats balanceStats--four">
          <div><span>Total registration</span><strong>{money(summary.totalDueCents)}</strong></div>
          <div><span>Latest verified payment</span><strong>{money(summary.latestVerifiedPaymentCents)}</strong></div>
          <div><span>Total verified paid</span><strong>{money(summary.verifiedPaidCents)}</strong></div>
          <div><span>Remaining balance</span><strong>{money(summary.balanceCents)}</strong></div>
        </div>

        {summary.pendingTotalCents>0&&<p className="pendingNotice">You also have <strong>{money(summary.pendingTotalCents)}</strong> awaiting manual verification. It is not subtracted from the verified balance yet.</p>}

        <div className="confirmationActions">
          {summary.balanceCents>0&&<a className="plumButton" href="#make-payment">MAKE ANOTHER PAYMENT</a>}
          <a className="outlineButton" href="/api/calendar">ADD TO CALENDAR</a>
        </div>
      </section>

      <section id="make-payment" className="manageCard">
        <p className="eyebrow plum">MAKE A PAYMENT</p>
        <h3>Choose any amount up to your remaining balance.</h3>

        {summary.balanceCents===0 ? <p>Your registration is paid in full.</p> :
        <form onSubmit={submitPayment} className="managePaymentForm">
          <label className="field">
            <span>Amount</span>
            <input type="number" min="1" max={(summary.balanceCents/100).toFixed(2)} step=".01" value={amount} onChange={e=>setAmount(e.target.value)} required/>
          </label>

          <label className="field">
            <span>Payment method</span>
            <select value={method} onChange={e=>setMethod(e.target.value)}>
              <option value="pushpay">PushPay</option>
              <option value="zelle">Zelle</option>
              <option value="check">Check</option>
              <option value="money_order">Money Order</option>
            </select>
          </label>

          <div className="beforeYouPay">
            <strong>Before you continue</strong>
            {method==="pushpay"&&<div>
              <p>We’ll record the amount you selected, then give you a button to Eagle Creek Church of Christ’s PushPay page.</p>
              <p>On PushPay, enter the same amount, choose <strong>Give one time</strong>, and confirm the fund is <strong>2027 Midwest Marriage Retreat</strong>. The payment stays pending here until the retreat finance team verifies it.</p>
            </div>}
            {method==="zelle"&&<p>Send the amount you selected to <strong>mbankhead@myeccoc.com</strong>. We record the intended payment first, then the finance team matches and verifies the Zelle payment before your balance changes.</p>}
            {(method==="check"||method==="money_order")&&<div>
              <p>Make payable to <strong>Eagle Creek Church of Christ</strong> with <strong>Midwest Marriage Retreat</strong> in the memo line.</p>
              <address>Eagle Creek Church of Christ<br/>c/o 2027 Midwest Marriage Retreat<br/>3025 W. 69th Street<br/>Indianapolis, IN 46268</address>
              <p>Checks must clear before verification. Checks are not accepted after August 31, 2027.</p>
            </div>}
          </div>

          <button className="plumButton" disabled={busy}>{busy?"RECORDING…":"CONTINUE WITH PAYMENT"}</button>
        </form>}

        {paymentMessage&&<div className="successNotice" aria-live="polite">
          <p>{paymentMessage}</p>
          {pushPayUrl&&<a className="plumButton" href={pushPayUrl} target="_blank" rel="noreferrer">CONTINUE TO PUSHPAY</a>}
        </div>}
        {error&&<p className="formError" role="alert">{error}</p>}
        <p className="paymentHelpLink">Need help with a payment? <Link href="/contact">Contact the retreat team.</Link></p>
      </section>

      <section className="manageCard paymentHistoryCard">
        <p className="eyebrow plum">PAYMENT HISTORY</p>
        <h3>Your recorded payments</h3>
        {summary.payments.length===0?<p>No payments have been recorded yet.</p>:
          <div className="paymentHistory">
            {summary.payments.map(p=><div className="paymentRow" key={p.id}>
              <div><strong>{money(p.amount_cents)}</strong><span>{p.method.replace("_"," ")}</span></div>
              <div><span className={"paymentStatus "+p.status}>{p.status.replaceAll("_"," ")}</span><small>{new Date(p.created_at).toLocaleDateString()}</small></div>
            </div>)}
          </div>}
      </section>
    </div>
  }

  return <section className="accessCard">
    <p className="eyebrow plum">EXISTING REGISTRANT</p>
    <h2>Securely access your registration.</h2>
    <p>Use your registration reference and one of the email addresses on the registration. No password or account is required.</p>

    {stage==="lookup"?
      <form onSubmit={requestCode}>
        <label className="field"><span>Registration reference</span><input value={confirmation} onChange={e=>setConfirmation(e.target.value.toUpperCase())} placeholder="OUC-XXXXXXXX" required/></label>
        <label className="field"><span>Email address</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>
        <button className="plumButton" disabled={busy}>{busy?"SENDING…":"EMAIL MY VERIFICATION CODE"}</button>
        <button type="button" className="textAction recoveryAction" onClick={recover} disabled={busy}>I lost my registration reference</button>
      </form>:
      <form onSubmit={verifyCode}>
        <p className="lookupMessage">{message}</p>
        <label className="field"><span>Six-digit code</span><input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} required/></label>
        <button className="plumButton" disabled={busy}>{busy?"VERIFYING…":"VERIFY & VIEW REGISTRATION"}</button>
        <button type="button" className="textAction recoveryAction" onClick={()=>setStage("lookup")}>Use different information</button>
      </form>}

    {message&&stage==="lookup"&&<p className="lookupMessage" aria-live="polite">{message}</p>}
    {error&&<p className="formError" role="alert">{error}</p>}
    <p className="paymentHelpLink">Lookup not working? <Link href="/contact">Get help from the retreat team.</Link></p>
  </section>
}
