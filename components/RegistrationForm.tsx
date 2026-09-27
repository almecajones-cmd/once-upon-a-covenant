"use client";

import { FormEvent, useState } from "react";

export default function RegistrationForm() {
  const [state,setState]=useState<"idle"|"sending"|"success"|"error">("idle");
  const [code,setCode]=useState("");

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setState("sending");
    const form=e.currentTarget;
    const body=Object.fromEntries(new FormData(form).entries());
    const res=await fetch("/api/register",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
    const data=await res.json();
    if(res.ok){setCode(data.confirmationCode);setState("success");form.reset()} else setState("error");
  }

  if(state==="success") return <section className="successCard"><h2>Registration received.</h2><p>Your registration reference is <strong>{code}</strong>.</p><p>Your place is currently <strong>pending payment verification</strong>. It will be confirmed once the $100 non-refundable deposit has been received and verified.</p><a className="plumButton" href="/pay">VIEW PAYMENT OPTIONS</a></section>;

  return <form className="registrationForm" onSubmit={submit}>
    <fieldset><legend>About Your Couple</legend>
      <label>Relationship status<select name="relationshipStatus" required><option value="">Select…</option><option value="married">Married</option><option value="engaged">Engaged</option></select></label>
      <div className="twoCol"><label>Husband first name<input name="husbandFirstName" required/></label><label>Husband last name<input name="husbandLastName" required/></label></div>
      <div className="twoCol"><label>Husband email<input name="husbandEmail" type="email" required/></label><label>Husband mobile<input name="husbandPhone" type="tel" required/></label></div>
      <div className="twoCol"><label>Wife first name<input name="wifeFirstName" required/></label><label>Wife last name<input name="wifeLastName" required/></label></div>
      <div className="twoCol"><label>Wife email<input name="wifeEmail" type="email" required/></label><label>Wife mobile<input name="wifePhone" type="tel" required/></label></div>
      <label>Wedding anniversary (married couples)<input name="weddingAnniversary" type="date"/></label>
    </fieldset>
    <fieldset><legend>Contact Information</legend>
      <label>Street address<input name="addressLine1" required/></label>
      <label>Address line 2<input name="addressLine2"/></label>
      <div className="threeCol"><label>City<input name="city" required/></label><label>State<input name="state" required/></label><label>ZIP code<input name="postalCode" inputMode="numeric" required/></label></div>
    </fieldset>
    <fieldset><legend>Church & Retreat Information</legend>
      <label>Church affiliation<select name="churchAffiliationType" required><option value="">Select…</option><option value="midwest_church_of_christ">Midwest Church of Christ congregation</option><option value="guest_of_church_of_christ_member">Guest of a Church of Christ member</option><option value="other_congregation">Other congregation</option><option value="no_church_affiliation">No church affiliation</option></select></label>
      <label>Congregation name<input name="churchNameOther"/></label>
      <label>Who referred you? <span>(optional)</span><input name="referredBy"/></label>
      <label>Dietary restrictions or allergies<textarea name="dietaryRestrictions" rows={3}/></label>
      <label>Accessibility or accommodation needs<textarea name="accessibilityNeeds" rows={3}/></label>
      <label className="check"><input name="accessibleRoomRequested" type="checkbox" value="true"/> We need an accessible hotel room.</label>
    </fieldset>
    <fieldset><legend>Additional Hotel Nights</legend>
      <p>Friday and Saturday nights are included. Check any additional nights you would like the committee to coordinate. Additional nights are paid separately.</p>
      <div className="checkGrid"><label className="check"><input type="checkbox" name="extraWednesday" value="true"/> Wednesday</label><label className="check"><input type="checkbox" name="extraThursday" value="true"/> Thursday</label><label className="check"><input type="checkbox" name="extraSunday" value="true"/> Sunday</label><label className="check"><input type="checkbox" name="extraMonday" value="true"/> Monday</label></div>
    </fieldset>
    <fieldset><legend>Acknowledgements</legend>
      <label className="check"><input type="checkbox" name="noChildrenAcknowledged" value="true" required/> I understand this retreat is for couples and children are not included.</label>
      <label className="check"><input type="checkbox" name="depositPolicyAcknowledged" value="true" required/> I understand my registration remains pending until the $100 non-refundable deposit is received and verified.</label>
    </fieldset>
    {state==="error"&&<p className="formError" role="alert">We could not submit your registration. Please review your information and try again.</p>}
    <button className="plumButton submitButton" disabled={state==="sending"}>{state==="sending"?"SUBMITTING…":"SUBMIT REGISTRATION"}</button>
  </form>
}
