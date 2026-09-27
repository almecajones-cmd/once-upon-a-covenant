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

  if(state==="success") return (
    <section className="successCard">
      <p className="eyebrow plum">REGISTRATION RECEIVED</p>
      <h2>Your next chapter has begun.</h2>
      <p>Your registration reference is <strong>{code}</strong>.</p>
      <p>Your place is currently <strong>pending payment verification</strong>. It will be confirmed once the $100 non-refundable deposit has been received and verified.</p>
      <a className="plumButton" href="/pay">VIEW PAYMENT OPTIONS</a>
    </section>
  );

  return (
    <form className="registrationForm" onSubmit={submit}>
      <fieldset>
        <div className="fieldsetHeading">
          <span className="fieldsetNumber">01</span>
          <div><legend>About Your Couple</legend><p>Basic information for both attendees.</p></div>
        </div>

        <label className="field fieldMedium">
          <span>Relationship status <b>*</b></span>
          <select name="relationshipStatus" required defaultValue="">
            <option value="" disabled>Select relationship status</option>
            <option value="married">Married</option>
            <option value="engaged">Engaged</option>
          </select>
        </label>

        <div className="twoCol">
          <label className="field"><span>Husband first name <b>*</b></span><input name="husbandFirstName" autoComplete="given-name" required/></label>
          <label className="field"><span>Husband last name <b>*</b></span><input name="husbandLastName" autoComplete="family-name" required/></label>
        </div>
        <div className="twoCol">
          <label className="field"><span>Husband email <b>*</b></span><input name="husbandEmail" type="email" autoComplete="email" required/></label>
          <label className="field"><span>Husband mobile <b>*</b></span><input name="husbandPhone" type="tel" autoComplete="tel" required/></label>
        </div>

        <div className="personDivider"><span>AND</span></div>

        <div className="twoCol">
          <label className="field"><span>Wife first name <b>*</b></span><input name="wifeFirstName" required/></label>
          <label className="field"><span>Wife last name <b>*</b></span><input name="wifeLastName" required/></label>
        </div>
        <div className="twoCol">
          <label className="field"><span>Wife email <b>*</b></span><input name="wifeEmail" type="email" required/></label>
          <label className="field"><span>Wife mobile <b>*</b></span><input name="wifePhone" type="tel" required/></label>
        </div>
        <label className="field fieldMedium">
          <span>Wedding anniversary <small>married couples</small></span>
          <input name="weddingAnniversary" type="date"/>
        </label>
      </fieldset>

      <fieldset>
        <div className="fieldsetHeading">
          <span className="fieldsetNumber">02</span>
          <div><legend>Contact Information</legend><p>Where we can reach you and identify your home location.</p></div>
        </div>
        <label className="field"><span>Street address <b>*</b></span><input name="addressLine1" autoComplete="street-address" required/></label>
        <label className="field"><span>Address line 2</span><input name="addressLine2"/></label>
        <div className="threeCol">
          <label className="field"><span>City <b>*</b></span><input name="city" autoComplete="address-level2" required/></label>
          <label className="field"><span>State <b>*</b></span><input name="state" autoComplete="address-level1" required/></label>
          <label className="field"><span>ZIP code <b>*</b></span><input name="postalCode" inputMode="numeric" autoComplete="postal-code" required/></label>
        </div>
      </fieldset>

      <fieldset>
        <div className="fieldsetHeading">
          <span className="fieldsetNumber">03</span>
          <div><legend>Church & Retreat Information</legend><p>Help the committee prepare for your experience.</p></div>
        </div>
        <label className="field">
          <span>Church affiliation <b>*</b></span>
          <select name="churchAffiliationType" required defaultValue="">
            <option value="" disabled>Select church affiliation</option>
            <option value="midwest_church_of_christ">Midwest Church of Christ congregation</option>
            <option value="guest_of_church_of_christ_member">Guest of a Church of Christ member</option>
            <option value="other_congregation">Other congregation</option>
            <option value="no_church_affiliation">No church affiliation</option>
          </select>
        </label>
        <label className="field"><span>Congregation name</span><input name="churchNameOther"/></label>
        <label className="field"><span>Who referred you? <small>optional</small></span><input name="referredBy"/></label>
        <div className="twoCol">
          <label className="field"><span>Dietary restrictions or allergies</span><textarea name="dietaryRestrictions" rows={4} placeholder="Tell us what the meal team should know."/></label>
          <label className="field"><span>Accessibility or accommodation needs</span><textarea name="accessibilityNeeds" rows={4} placeholder="Share any accommodations that would help you participate fully."/></label>
        </div>
        <label className="checkCard"><input name="accessibleRoomRequested" type="checkbox" value="true"/><span><strong>Accessible hotel room requested</strong><small>We will include this in the room coordination information.</small></span></label>
      </fieldset>

      <fieldset>
        <div className="fieldsetHeading">
          <span className="fieldsetNumber">04</span>
          <div><legend>Additional Hotel Nights</legend><p>Friday and Saturday are already included in registration.</p></div>
        </div>
        <p className="fieldHelp">Select only the extra nights you want the retreat team to coordinate. Additional nights are paid separately by the couple.</p>
        <div className="nightGrid">
          <label className="nightChoice"><input type="checkbox" name="extraWednesday" value="true"/><span>Wednesday</span></label>
          <label className="nightChoice"><input type="checkbox" name="extraThursday" value="true"/><span>Thursday</span></label>
          <label className="nightChoice"><input type="checkbox" name="extraSunday" value="true"/><span>Sunday</span></label>
          <label className="nightChoice"><input type="checkbox" name="extraMonday" value="true"/><span>Monday</span></label>
        </div>
      </fieldset>

      <fieldset>
        <div className="fieldsetHeading">
          <span className="fieldsetNumber">05</span>
          <div><legend>Acknowledgements</legend><p>Please confirm these retreat policies.</p></div>
        </div>
        <label className="checkCard"><input type="checkbox" name="noChildrenAcknowledged" value="true" required/><span><strong>Couples-only retreat</strong><small>I understand children are not included in the retreat.</small></span></label>
        <label className="checkCard"><input type="checkbox" name="depositPolicyAcknowledged" value="true" required/><span><strong>Deposit requirement</strong><small>I understand my registration remains pending until the $100 non-refundable deposit is received and verified.</small></span></label>
      </fieldset>

      {state==="error"&&<p className="formError" role="alert">We could not submit your registration. Please review your information and try again.</p>}
      <button className="plumButton submitButton" disabled={state==="sending"}>
        {state==="sending"?"SUBMITTING…":"SUBMIT REGISTRATION"}
      </button>
      <p className="submitHelp">After submission, you will receive your registration reference and payment instructions by email.</p>
    </form>
  );
}
