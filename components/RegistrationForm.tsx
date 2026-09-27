"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics";

type Church = { id:number; name:string; location:string; state:string };
type Draft = Record<string,string|boolean>;

const STORAGE_KEY="ouc_registration_draft_v2";

const initialDraft:Draft={
  relationshipStatus:"",
  husbandFirstName:"",husbandLastName:"",husbandEmail:"",husbandPhone:"",
  wifeFirstName:"",wifeLastName:"",wifeEmail:"",wifePhone:"",
  weddingAnniversary:"",
  addressLine1:"",addressLine2:"",city:"",state:"",postalCode:"",
  churchAffiliationType:"",churchId:"",churchNameOther:"",
  howHeard:"",referredBy:"",
  dietaryRestrictions:"",accessibilityNeeds:"",
  dietaryNone:false,dietaryVegetarian:false,dietaryVegan:false,dietaryGlutenFree:false,dietaryDairyFree:false,dietaryKosher:false,dietaryAllergy:false,dietaryOther:false,dietaryDetails:"",
  accessibleRoomRequested:false,
  extraWednesday:false,extraThursday:false,extraSunday:false,extraMonday:false,
  noChildrenAcknowledged:false,depositPolicyAcknowledged:false,
  paymentChoice:"deposit",paymentAmount:"100",paymentMethod:"pushpay",
  utmSource:"",utmMedium:"",utmCampaign:"",
};

const stepNames=["Couple","Retreat Needs","Review","Payment"];

const dietaryOptions=[
  ["dietaryNone","No dietary restrictions"],
  ["dietaryVegetarian","Vegetarian"],
  ["dietaryVegan","Vegan"],
  ["dietaryGlutenFree","Gluten-free"],
  ["dietaryDairyFree","Dairy-free"],
  ["dietaryKosher","Kosher"],
  ["dietaryAllergy","Food allergy / sensitivity"],
  ["dietaryOther","Other"],
] as const;

export default function RegistrationForm(){
  const [draft,setDraft]=useState<Draft>(initialDraft);
  const [step,setStep]=useState(0);
  const [loaded,setLoaded]=useState(false);
  const [state,setState]=useState<"idle"|"sending"|"success"|"error"|"duplicate">("idle");
  const [result,setResult]=useState<any>(null);
  const [errors,setErrors]=useState<string[]>([]);
  const [churchQuery,setChurchQuery]=useState("");
  const [churches,setChurches]=useState<Church[]>([]);
  const [churchLoading,setChurchLoading]=useState(false);
  const [selectedChurchLabel,setSelectedChurchLabel]=useState("");
  const [manualChurch,setManualChurch]=useState(false);
  const topRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    try{
      const saved=sessionStorage.getItem(STORAGE_KEY);
      if(saved){
        const parsed=JSON.parse(saved);
        setDraft({...initialDraft,...(parsed.draft||{})});
        setStep(Math.min(Math.max(Number(parsed.step)||0,0),3));
        setChurchQuery(parsed.churchQuery||"");
        setSelectedChurchLabel(parsed.selectedChurchLabel||"");
        setManualChurch(Boolean(parsed.manualChurch));
      }else{
        const params=new URLSearchParams(window.location.search);
        setDraft(d=>({...d,utmSource:params.get("utm_source")||"",utmMedium:params.get("utm_medium")||"",utmCampaign:params.get("utm_campaign")||""}));
        track("registration_start");
      }
    }catch{}
    setLoaded(true);
  },[]);

  useEffect(()=>{
    if(!loaded||state==="success")return;
    sessionStorage.setItem(STORAGE_KEY,JSON.stringify({draft,step,churchQuery,selectedChurchLabel,manualChurch}));
  },[draft,step,churchQuery,selectedChurchLabel,manualChurch,loaded,state]);

  useEffect(()=>{
    if(draft.churchAffiliationType!=="midwest_church_of_christ"||manualChurch||churchQuery.trim().length<2||selectedChurchLabel===churchQuery){
      setChurches([]);return;
    }
    const controller=new AbortController();
    const timer=window.setTimeout(async()=>{
      try{
        setChurchLoading(true);
        const res=await fetch(`/api/churches?q=${encodeURIComponent(churchQuery.trim())}`,{signal:controller.signal});
        if(res.ok){const data=await res.json();setChurches(Array.isArray(data)?data:[])}
      }catch(e){if((e as Error).name!=="AbortError")console.error(e)}
      finally{setChurchLoading(false)}
    },220);
    return()=>{controller.abort();window.clearTimeout(timer)};
  },[churchQuery,draft.churchAffiliationType,manualChurch,selectedChurchLabel]);

  const paymentCents=useMemo(()=>{
    if(draft.paymentChoice==="full")return 60000;
    if(draft.paymentChoice==="deposit")return 10000;
    const n=Number(draft.paymentAmount);return Number.isFinite(n)?Math.round(n*100):0;
  },[draft.paymentChoice,draft.paymentAmount]);

  function setField(name:string,value:string|boolean){setDraft(d=>({...d,[name]:value}));setErrors([])}

  function toggleDietary(key:string,checked:boolean){
    setDraft(d=>{
      if(key==="dietaryNone"){
        if(!checked)return {...d,dietaryNone:false};
        return {
          ...d,
          dietaryNone:true,
          dietaryVegetarian:false,
          dietaryVegan:false,
          dietaryGlutenFree:false,
          dietaryDairyFree:false,
          dietaryKosher:false,
          dietaryAllergy:false,
          dietaryOther:false,
          dietaryDetails:"",
        };
      }
      return {...d,[key]:checked,dietaryNone:false};
    });
    setErrors([]);
  }

  function dietarySummary(){
    if(draft.dietaryNone)return "None";
    const selected:string[]=dietaryOptions
      .filter(([key])=>key!=="dietaryNone"&&Boolean(draft[key]))
      .map(([,label])=>label);
    const details=String(draft.dietaryDetails||"").trim();
    if(details)selected.push(`Details: ${details}`);
    return selected.join("; ");
  }
  function focusTop(){window.setTimeout(()=>topRef.current?.focus(),0)}
  function validEmail(v:any){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v||""))}

  function validateStep(index:number){
    const e:string[]=[];
    if(index===0){
      if(!draft.relationshipStatus)e.push("Select Married or Engaged.");
      for(const [key,label] of [["husbandFirstName","Husband first name"],["husbandLastName","Husband last name"],["wifeFirstName","Wife first name"],["wifeLastName","Wife last name"],["husbandPhone","Husband mobile"],["wifePhone","Wife mobile"],["addressLine1","Street address"],["city","City"],["state","State"],["postalCode","ZIP code"]] as const){
        if(!String(draft[key]||"").trim())e.push(`${label} is required.`);
      }
      if(!validEmail(draft.husbandEmail))e.push("Enter a valid husband email address.");
      if(!validEmail(draft.wifeEmail))e.push("Enter a valid wife email address.");
    }
    if(index===1){
      if(!draft.churchAffiliationType)e.push("Select a church affiliation.");
      if(draft.churchAffiliationType==="midwest_church_of_christ"&&!manualChurch&&!draft.churchId)e.push("Select your Church of Christ congregation from the search results.");
      if(draft.churchAffiliationType==="midwest_church_of_christ"&&manualChurch&&!String(draft.churchNameOther||"").trim())e.push("Enter your congregation name.");
      if(!draft.noChildrenAcknowledged)e.push("Acknowledge the couples-only retreat policy.");
      if(!draft.depositPolicyAcknowledged)e.push("Acknowledge the deposit policy.");
    }
    if(index===3){
      if(!draft.paymentMethod)e.push("Choose a payment method.");
      if(draft.paymentChoice==="other"&&(paymentCents<10000||paymentCents>60000))e.push("For initial registration, enter an amount from $100 through $600.");
    }
    setErrors(e);
    return e.length===0;
  }

  function next(){
    if(!validateStep(step)){focusTop();return}
    track("registration_step_complete",{step:step+1,name:stepNames[step]});
    setStep(s=>Math.min(s+1,3));focusTop();
  }
  function back(){setErrors([]);setStep(s=>Math.max(s-1,0));focusTop()}

  function changeChurchType(value:string){
    setField("churchAffiliationType",value);
    setField("churchId","");setField("churchNameOther","");
    setChurchQuery("");setSelectedChurchLabel("");setManualChurch(false);setChurches([]);
  }
  function selectChurch(c:Church){
    const label=`${c.name} — ${c.location}`;
    setField("churchId",String(c.id));setField("churchNameOther","");
    setSelectedChurchLabel(label);setChurchQuery(label);setChurches([]);
  }

  async function submit(e:FormEvent){
    e.preventDefault();
    if(!validateStep(3)){focusTop();return}
    setState("sending");setErrors([]);track("registration_submit",{amount_cents:paymentCents,method:draft.paymentMethod});
    const payload={...draft,dietaryRestrictions:dietarySummary(),paymentAmount:(paymentCents/100).toFixed(2)};
    const res=await fetch("/api/register",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
    const data=await res.json();
    if(res.status===409&&data.error==="possible_duplicate"){setState("duplicate");setResult(data);return}
    if(!res.ok){setState("error");setErrors([data.error||"We could not complete registration. Please try again."]);return}
    sessionStorage.removeItem(STORAGE_KEY);setResult(data);setState("success");track("registration_success",{method:data.paymentMethod,amount_cents:data.amountCents});focusTop();
  }

  if(state==="success"&&result){
    const method=String(result.paymentMethod||"").replace("_"," ");
    return <section className="successCard" tabIndex={-1} ref={topRef}>
      <p className="eyebrow plum">REGISTRATION RECEIVED</p>
      <h2>Your next chapter has begun.</h2>
      <p>Registration reference: <strong>{result.confirmationCode}</strong></p>
      <div className="successPaymentSummary"><span>Payment planned</span><strong>{new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(result.amountCents/100)} · {method}</strong></div>
      <p>Your registration remains <strong>pending payment verification</strong> until at least the $100 non-refundable deposit is received and verified.</p>
      {result.paymentMethod==="pushpay"&&<a className="plumButton" href={result.pushPayUrl} target="_blank" rel="noreferrer">OPEN PUSHPAY</a>}
      {result.paymentMethod==="zelle"&&<p className="paymentInstruction">Send payment by Zelle to <strong>mbankhead@myeccoc.com</strong>.</p>}
      {(result.paymentMethod==="check"||result.paymentMethod==="money_order")&&<p className="paymentInstruction">Mail payment to <strong>Eagle Creek Church of Christ</strong>, c/o 2027 Midwest Marriage Retreat, 3025 W. 69th Street, Indianapolis, IN 46268. Put <strong>Midwest Marriage Retreat</strong> in the memo.</p>}
      <div className="successActions"><a className="outlineButton" href="/manage">MANAGE REGISTRATION</a><a className="textAction" href="/">Return to retreat site</a></div>
    </section>
  }

  if(state==="duplicate"){
    return <section className="successCard duplicateCard" tabIndex={-1} ref={topRef}>
      <p className="eyebrow plum">POSSIBLE EXISTING REGISTRATION</p>
      <h2>We may already have a registration for this couple.</h2>
      <p>To protect your payment history and avoid duplicate registrations, use the secure existing-registrant lookup instead.</p>
      <a className="plumButton" href="/manage">FIND MY REGISTRATION</a>
      <button className="textAction" onClick={()=>setState("idle")}>Return to this registration</button>
    </section>
  }

  const progress=Math.round(((step+1)/4)*100);

  return <form className="registrationWizard" onSubmit={submit}>
    <div className="wizardHeader" ref={topRef} tabIndex={-1}>
      <div className="wizardProgressText"><span>Step {step+1} of 4</span><strong>{stepNames[step]}</strong></div>
      <div className="wizardProgressBar" aria-hidden="true"><span style={{width:`${progress}%`}}/></div>
      <nav className="wizardSteps" aria-label="Registration progress">
        {stepNames.map((name,i)=><span key={name} className={i===step?"active":i<step?"complete":""} aria-current={i===step?"step":undefined}>{i+1}. {name}</span>)}
      </nav>
    </div>

    {errors.length>0&&<div className="errorSummary" role="alert"><strong>Please fix the following:</strong><ul>{errors.map((e,i)=><li key={i}>{e}</li>)}</ul></div>}

    {step===0&&<section className="wizardPanel">
      <div className="fieldsetHeading"><span className="fieldsetNumber">01</span><div><h3>Couple Information</h3><p>Tell us who is attending and how to reach you.</p></div></div>
      <label className="field fieldMedium"><span>Relationship status <b>*</b></span><select value={String(draft.relationshipStatus)} onChange={e=>setField("relationshipStatus",e.target.value)}><option value="">Select relationship status</option><option value="married">Married</option><option value="engaged">Engaged</option></select></label>
      <div className="twoCol"><label className="field"><span>Husband first name <b>*</b></span><input value={String(draft.husbandFirstName)} onChange={e=>setField("husbandFirstName",e.target.value)}/></label><label className="field"><span>Husband last name <b>*</b></span><input value={String(draft.husbandLastName)} onChange={e=>setField("husbandLastName",e.target.value)}/></label></div>
      <div className="twoCol"><label className="field"><span>Husband email <b>*</b></span><input type="email" value={String(draft.husbandEmail)} onChange={e=>setField("husbandEmail",e.target.value)}/></label><label className="field"><span>Husband mobile <b>*</b></span><input type="tel" value={String(draft.husbandPhone)} onChange={e=>setField("husbandPhone",e.target.value)}/></label></div>
      <div className="personDivider"><span>AND</span></div>
      <div className="twoCol"><label className="field"><span>Wife first name <b>*</b></span><input value={String(draft.wifeFirstName)} onChange={e=>setField("wifeFirstName",e.target.value)}/></label><label className="field"><span>Wife last name <b>*</b></span><input value={String(draft.wifeLastName)} onChange={e=>setField("wifeLastName",e.target.value)}/></label></div>
      <div className="twoCol"><label className="field"><span>Wife email <b>*</b></span><input type="email" value={String(draft.wifeEmail)} onChange={e=>setField("wifeEmail",e.target.value)}/></label><label className="field"><span>Wife mobile <b>*</b></span><input type="tel" value={String(draft.wifePhone)} onChange={e=>setField("wifePhone",e.target.value)}/></label></div>
      {draft.relationshipStatus==="married"&&<label className="field fieldMedium"><span>Wedding anniversary</span><input type="date" value={String(draft.weddingAnniversary)} onChange={e=>setField("weddingAnniversary",e.target.value)}/></label>}
      <div className="sectionDivider"/>
      <label className="field"><span>Street address <b>*</b></span><input value={String(draft.addressLine1)} onChange={e=>setField("addressLine1",e.target.value)}/></label>
      <label className="field"><span>Address line 2</span><input value={String(draft.addressLine2)} onChange={e=>setField("addressLine2",e.target.value)}/></label>
      <div className="threeCol"><label className="field"><span>City <b>*</b></span><input value={String(draft.city)} onChange={e=>setField("city",e.target.value)}/></label><label className="field"><span>State <b>*</b></span><input value={String(draft.state)} onChange={e=>setField("state",e.target.value)}/></label><label className="field"><span>ZIP code <b>*</b></span><input value={String(draft.postalCode)} onChange={e=>setField("postalCode",e.target.value)}/></label></div>
    </section>}

    {step===1&&<section className="wizardPanel">
      <div className="fieldsetHeading"><span className="fieldsetNumber">02</span><div><h3>Retreat Needs</h3><p>Help the team prepare for your church connection, lodging, dietary, and accessibility needs.</p></div></div>
      <label className="field"><span>Church affiliation <b>*</b></span><select value={String(draft.churchAffiliationType)} onChange={e=>changeChurchType(e.target.value)}><option value="">Select church affiliation</option><option value="midwest_church_of_christ">I attend a Church of Christ congregation</option><option value="guest_of_church_of_christ_member">I am a guest of a Church of Christ member</option><option value="other_congregation">I attend another congregation</option><option value="no_church_affiliation">I do not have a church affiliation</option></select></label>

      {draft.churchAffiliationType==="midwest_church_of_christ"&&!manualChurch&&<div className="churchLookup">
        <label className="field"><span>Congregation name <b>*</b></span><input id="churchSearch" value={churchQuery} onChange={e=>{setChurchQuery(e.target.value);setField("churchId","");setSelectedChurchLabel("")}} autoComplete="off" aria-autocomplete="list" aria-expanded={churches.length>0} placeholder="Start typing your congregation or city"/></label>
        {(churchLoading||churches.length>0||churchQuery.trim().length>=2)&&<div className="churchSuggestionsWrap">{churchLoading&&<div className="churchSearchStatus">Searching congregations…</div>}{!churchLoading&&churches.length>0&&<div className="churchSuggestions" role="listbox">{churches.map(c=><button type="button" className="churchSuggestion" key={c.id} onClick={()=>selectChurch(c)}><strong>{c.name}</strong><span>{c.location}</span></button>)}</div>}{!churchLoading&&churches.length===0&&churchQuery.trim().length>=2&&!draft.churchId&&<div className="churchSearchStatus">No match yet. Try the church name or city.</div>}</div>}
        {draft.churchId&&<p className="churchSelected">✓ Congregation selected</p>}
        <button type="button" className="manualChurchButton" onClick={()=>{setManualChurch(true);setField("churchId","");setChurchQuery("");setSelectedChurchLabel("")}}>My congregation isn’t listed</button>
      </div>}
      {draft.churchAffiliationType==="midwest_church_of_christ"&&manualChurch&&<div className="manualChurchPanel"><label className="field"><span>Congregation name <b>*</b></span><input value={String(draft.churchNameOther)} onChange={e=>setField("churchNameOther",e.target.value)}/></label><button type="button" className="manualChurchButton" onClick={()=>{setManualChurch(false);setField("churchNameOther","")}}>Search the directory instead</button></div>}
      {draft.churchAffiliationType==="other_congregation"&&<label className="field"><span>Congregation name</span><input value={String(draft.churchNameOther)} onChange={e=>setField("churchNameOther",e.target.value)}/></label>}
      {draft.churchAffiliationType==="guest_of_church_of_christ_member"&&<label className="field"><span>Church or congregation you are connected with <small>optional</small></span><input value={String(draft.churchNameOther)} onChange={e=>setField("churchNameOther",e.target.value)}/></label>}

      <div className="twoCol"><label className="field"><span>How did you hear about the retreat?</span><select value={String(draft.howHeard)} onChange={e=>setField("howHeard",e.target.value)}><option value="">Select</option><option value="church">Church announcement</option><option value="friend_family">Friend or family</option><option value="previous_attendee">Previous attendee</option><option value="social_media">Social media</option><option value="other">Other</option></select></label>{(draft.howHeard==="friend_family"||draft.howHeard==="previous_attendee")&&<label className="field"><span>Who invited or referred you?</span><input value={String(draft.referredBy)} onChange={e=>setField("referredBy",e.target.value)}/></label>}</div>
      <div className="twoCol retreatNeedsGrid">
        <div className="field dietaryField">
          <span>Dietary restrictions or allergies <small>select all that apply</small></span>
          <div className="dietaryChoiceGrid" role="group" aria-label="Dietary restrictions or allergies">
            {dietaryOptions.map(([key,label])=>(
              <label className={Boolean(draft[key])?"dietaryChoice selected":"dietaryChoice"} key={key}>
                <input type="checkbox" checked={Boolean(draft[key])} onChange={e=>toggleDietary(key,e.target.checked)}/>
                <span>{label}</span>
              </label>
            ))}
          </div>
          {(draft.dietaryAllergy||draft.dietaryOther)&&
            <label className="dietaryDetailField">
              <span>Please tell us what we should know <small>include whose need it is, if applicable</small></span>
              <textarea rows={3} value={String(draft.dietaryDetails)} onChange={e=>setField("dietaryDetails",e.target.value)} placeholder="Example: Husband — shellfish allergy; Wife — other dietary need..."/>
            </label>
          }
        </div>
        <label className="field"><span>Accessibility or accommodation needs</span><textarea rows={4} value={String(draft.accessibilityNeeds)} onChange={e=>setField("accessibilityNeeds",e.target.value)}/></label>
      </div>
      <label className="checkCard"><input type="checkbox" checked={Boolean(draft.accessibleRoomRequested)} onChange={e=>setField("accessibleRoomRequested",e.target.checked)}/><span><strong>Accessible hotel room requested</strong><small>We will include this in room coordination information.</small></span></label>

      <div className="sectionDivider"/>
      <p className="fieldHelp"><strong>Additional hotel nights:</strong> Friday and Saturday are included in the retreat package. Select any additional nights you want the retreat team to coordinate; extra nights are paid separately.</p>
      <div className="nightGrid">{[["extraWednesday","Wednesday"],["extraThursday","Thursday"],["extraSunday","Sunday"],["extraMonday","Monday"]].map(([key,label])=><label className="nightChoice" key={key}><input type="checkbox" checked={Boolean(draft[key])} onChange={e=>setField(key,e.target.checked)}/><span>{label}</span></label>)}</div>

      <div className="sectionDivider"/>
      <label className="checkCard"><input type="checkbox" checked={Boolean(draft.noChildrenAcknowledged)} onChange={e=>setField("noChildrenAcknowledged",e.target.checked)}/><span><strong>Couples-only retreat</strong><small>I understand children are not included in the retreat.</small></span></label>
      <label className="checkCard"><input type="checkbox" checked={Boolean(draft.depositPolicyAcknowledged)} onChange={e=>setField("depositPolicyAcknowledged",e.target.checked)}/><span><strong>Deposit requirement</strong><small>I understand my registration remains pending until the $100 non-refundable deposit is received and verified.</small></span></label>
    </section>}

    {step===2&&<section className="wizardPanel reviewPanel">
      <div className="fieldsetHeading"><span className="fieldsetNumber">03</span><div><h3>Review Your Registration</h3><p>Confirm the details below before choosing your payment.</p></div></div>
      <div className="reviewGrid">
        <div><span>Couple</span><strong>{draft.husbandFirstName} {draft.husbandLastName} & {draft.wifeFirstName} {draft.wifeLastName}</strong></div>
        <div><span>Relationship</span><strong>{String(draft.relationshipStatus)}</strong></div>
        <div><span>Primary emails</span><strong>{draft.husbandEmail}<br/>{draft.wifeEmail}</strong></div>
        <div><span>Location</span><strong>{draft.city}, {draft.state} {draft.postalCode}</strong></div>
        <div><span>Church</span><strong>{selectedChurchLabel||String(draft.churchNameOther)||String(draft.churchAffiliationType).replaceAll("_"," ")}</strong></div>
        <div><span>Accessible room</span><strong>{draft.accessibleRoomRequested?"Yes":"No"}</strong></div>
        <div><span>Additional nights</span><strong>{[draft.extraWednesday&&"Wednesday",draft.extraThursday&&"Thursday",draft.extraSunday&&"Sunday",draft.extraMonday&&"Monday"].filter(Boolean).join(", ")||"None"}</strong></div>
        <div><span>Dietary</span><strong>{dietarySummary()||"None provided"}</strong></div><div><span>Accessibility</span><strong>{String(draft.accessibilityNeeds||"").trim()||"None provided"}</strong></div>
      </div>
      <button type="button" className="textAction editLink" onClick={()=>{setStep(0);focusTop()}}>Edit couple information</button>
      <button type="button" className="textAction editLink" onClick={()=>{setStep(1);focusTop()}}>Edit retreat needs</button>
    </section>}

    {step===3&&<section className="wizardPanel paymentStep">
      <div className="fieldsetHeading"><span className="fieldsetNumber">04</span><div><h3>Choose Your Payment</h3><p>The first $100 is non-refundable and secures your registration after verification.</p></div></div>
      <div className="paymentChoiceGrid">
        <label className={draft.paymentChoice==="deposit"?"paymentChoiceCard selected":"paymentChoiceCard"}><input type="radio" name="paymentChoice" value="deposit" checked={draft.paymentChoice==="deposit"} onChange={()=>{setField("paymentChoice","deposit");setField("paymentAmount","100");track("payment_choice",{choice:"deposit"})}}/><span><strong>Pay Deposit</strong><b>$100</b><small>Minimum amount required to secure your place after verification.</small></span></label>
        <label className={draft.paymentChoice==="full"?"paymentChoiceCard selected":"paymentChoiceCard"}><input type="radio" name="paymentChoice" value="full" checked={draft.paymentChoice==="full"} onChange={()=>{setField("paymentChoice","full");setField("paymentAmount","600");track("payment_choice",{choice:"full"})}}/><span><strong>Pay in Full</strong><b>$600</b><small>Complete your full retreat balance now.</small></span></label>
        <label className={draft.paymentChoice==="other"?"paymentChoiceCard selected":"paymentChoiceCard"}><input type="radio" name="paymentChoice" value="other" checked={draft.paymentChoice==="other"} onChange={()=>{setField("paymentChoice","other");setField("paymentAmount","");track("payment_choice",{choice:"other"})}}/><span><strong>Other Amount</strong><b>Choose</b><small>Pay any amount from $100 through the full $600 balance.</small></span></label>
      </div>
      {draft.paymentChoice==="other"&&<label className="field fieldMedium"><span>Payment amount</span><input type="number" min="100" max="600" step=".01" value={String(draft.paymentAmount)} onChange={e=>setField("paymentAmount",e.target.value)} placeholder="100.00"/></label>}
      <label className="field"><span>Payment method <b>*</b></span><select value={String(draft.paymentMethod)} onChange={e=>setField("paymentMethod",e.target.value)}><option value="pushpay">PushPay</option><option value="zelle">Zelle</option><option value="check">Check</option><option value="money_order">Money Order</option></select></label>
      <div className="paymentMethodNotice">
        {draft.paymentMethod==="pushpay"&&<p>After registration is created, you’ll receive a secure PushPay button. The payment remains pending until the retreat team verifies it.</p>}
        {draft.paymentMethod==="zelle"&&<p>After registration is created, send your selected amount to <strong>mbankhead@myeccoc.com</strong>. The retreat team will verify it and update your balance.</p>}
        {(draft.paymentMethod==="check"||draft.paymentMethod==="money_order")&&<p>After registration is created, you’ll receive the mailing instructions. Checks are not accepted after August 31, 2027.</p>}
      </div>
      <div className="paymentTotalLine"><span>Payment selected today</span><strong>{new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(paymentCents/100)}</strong></div>
      <p className="paymentScheduleLink">Prefer to budget over time? <a href="/pay" target="_blank">View the suggested payment plan and payment methods.</a></p>
      <p className="privacyInline">By submitting, you agree that the retreat team may use the information provided to administer registration, lodging coordination, accessibility needs, payments, and retreat communications. <a href="/privacy" target="_blank">Read the privacy notice.</a></p>
    </section>}

    {state==="error"&&errors.length===0&&<p className="formError" role="alert">We could not complete registration. Please try again.</p>}

    <div className="wizardActions">
      {step>0&&<button type="button" className="outlineButton" onClick={back}>BACK</button>}
      {step<3?<button type="button" className="plumButton" onClick={next}>CONTINUE</button>:<button className="plumButton" disabled={state==="sending"}>{state==="sending"?"SUBMITTING…":"COMPLETE REGISTRATION"}</button>}
    </div>
    <p className="draftNotice">Your progress is saved in this browser tab while you complete registration.</p>
  </form>
}
