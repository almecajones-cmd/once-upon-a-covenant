import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import ContactForm from "@/components/ContactForm";
import NextStepCards from "@/components/NextStepCards";
import StayUpdatedForm from "@/components/StayUpdatedForm";

export const metadata={title:"Contact & Help | Once Upon a Covenant"};

export default function Contact(){
  return <main className="formPage contactPage">
    <header className="formTopbar">
      <Link className="formBrand" href="/" aria-label="Once Upon a Covenant home"><BrandMark compact /></Link>
      <Link className="formHomeLink" href="/">RETURN TO EXPERIENCE</Link>
    </header>

    <section className="contactHero">
      <div>
        <p className="eyebrow gold">CONTACT & HELP</p>
        <h1>How can we help?</h1>
        <p>Choose the quickest path below, or send the retreat team a message if you still need help.</p>
      </div>
    </section>

    <div className="contactShell">
      <NextStepCards compact />

      <section id="stay-updated" className="stayUpdatedSection">
        <div className="stayUpdatedCopy">
          <p className="eyebrow gold">NOT READY TO REGISTER?</p>
          <h2>Stay close to the story.</h2>
          <p>Join the interest list for retreat updates, important dates, speaker announcements, and reminders. This does not register you for the retreat.</p>
        </div>
        <StayUpdatedForm/>
      </section>

      <section className="contactHelpSection">
        <div className="contactHelpIntro">
          <p className="eyebrow plum">STILL NEED HELP?</p>
          <h2>Send us a message.</h2>
          <p>Use this form for registration, payment, hotel, accessibility, dietary, schedule, or general retreat questions.</p>
          <div className="contactQuickFacts">
            <div><span>Response</span><strong>Retreat team follow-up</strong></div>
            <div><span>Payment help</span><strong>Use “Payment” as your subject</strong></div>
            <div><span>Already registered?</span><strong>Include your registration reference if you have it</strong></div>
          </div>
        </div>
        <ContactForm/>
      </section>
    </div>
  </main>
}
