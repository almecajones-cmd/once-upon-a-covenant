"use client";

import { FormEvent, useState } from "react";
import { track } from "@/lib/analytics";

export default function StayUpdatedForm(){
  const [state,setState]=useState<"idle"|"sending"|"success"|"error">("idle");

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setState("sending");
    const form=e.currentTarget;
    const body=Object.fromEntries(new FormData(form).entries());
    const res=await fetch("/api/interest",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
    if(res.ok){
      form.reset();
      setState("success");
      track("contact_help",{source:"stay_updated"});
    } else {
      setState("error");
    }
  }

  if(state==="success") return (
    <div className="interestSuccess" role="status">
      <p className="eyebrow plum">YOU’RE ON THE LIST</p>
      <h3>We’ll keep you updated.</h3>
      <p>Watch your inbox for retreat news, important dates, and announcements.</p>
    </div>
  );

  return (
    <form className="interestForm" onSubmit={submit}>
      <div className="interestFields">
        <label className="field"><span>First name</span><input name="firstName" required/></label>
        <label className="field"><span>Last name</span><input name="lastName"/></label>
        <label className="field"><span>Email address</span><input name="email" type="email" required/></label>
      </div>
      <input type="hidden" name="source" value="website"/>
      {state==="error"&&<p className="formError" role="alert">We could not add you right now. Please try again.</p>}
      <button className="goldButton" disabled={state==="sending"}>{state==="sending"?"ADDING YOU…":"KEEP ME UPDATED"}</button>
    </form>
  );
}
