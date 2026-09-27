"use client";

import { FormEvent, useState } from "react";
import { track } from "@/lib/analytics";

export default function ContactForm(){
  const [state,setState]=useState<"idle"|"sending"|"success"|"error">("idle");

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setState("sending");
    const form=e.currentTarget;
    const body=Object.fromEntries(new FormData(form).entries());
    const res=await fetch("/api/contact",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
    if(res.ok){
      setState("success");
      form.reset();
      track("contact_help",{source:"contact_form"});
    }else setState("error");
  }

  if(state==="success")return (
    <section className="successCard contactSuccess">
      <p className="eyebrow plum">MESSAGE RECEIVED</p>
      <h2>Thank you for contacting us.</h2>
      <p>Your message has been received by the 2027 Midwest Marriage Retreat team. Someone will follow up with you as soon as possible.</p>
    </section>
  );

  return (
    <form className="contactForm" onSubmit={submit}>
      <div className="twoCol">
        <label className="field"><span>First name <b>*</b></span><input name="firstName" autoComplete="given-name" required/></label>
        <label className="field"><span>Last name <b>*</b></span><input name="lastName" autoComplete="family-name" required/></label>
      </div>

      <div className="twoCol">
        <label className="field"><span>Email <b>*</b></span><input name="email" type="email" autoComplete="email" required/></label>
        <label className="field"><span>Phone <small>optional</small></span><input name="phone" type="tel" autoComplete="tel"/></label>
      </div>

      <div className="twoCol">
        <label className="field">
          <span>Are you registered? <b>*</b></span>
          <select name="isRegistered" required defaultValue="">
            <option value="" disabled>Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>

        <label className="field">
          <span>Subject <b>*</b></span>
          <select name="subject" required defaultValue="">
            <option value="" disabled>Select</option>
            <option value="registration">Registration</option>
            <option value="payment">Payment</option>
            <option value="hotel_lodging">Hotel / Lodging</option>
            <option value="accessibility_dietary">Accessibility / Dietary</option>
            <option value="schedule_experience">Retreat Schedule / Experience</option>
            <option value="general">General Question</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span>Message <b>*</b></span>
        <textarea name="message" rows={7} placeholder="Tell us how we can help." required/>
      </label>

      {state==="error"&&<p role="alert" className="formError">We could not send your message. Please try again.</p>}

      <button className="plumButton submitButton" disabled={state==="sending"}>
        {state==="sending"?"SENDING…":"SEND MESSAGE"}
      </button>
    </form>
  );
}
