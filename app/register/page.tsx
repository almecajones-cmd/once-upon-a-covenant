import Link from "next/link";
import RegistrationForm from "@/components/RegistrationForm";

export const metadata = { title: "Register | Once Upon a Covenant" };

export default function RegisterPage() {
  return (
    <main className="formPage registrationPage">
      <header className="formTopbar">
        <Link className="formBrand" href="/">
          <span className="formBrandMark">♛</span>
          <span>Once Upon a Covenant</span>
        </Link>
        <Link className="formHomeLink" href="/">RETURN TO EXPERIENCE</Link>
      </header>

      <section className="registrationHero">
        <div className="registrationHeroInner">
          <p className="eyebrow gold">2027 MIDWEST MARRIAGE RETREAT</p>
          <h1>Reserve Your Place</h1>
          <p className="registrationHeroSub">
            October 8–10, 2027 · Embassy Suites Noblesville Indianapolis Conference Center
          </p>
          <div className="registrationRule" aria-hidden="true" />
          <p className="registrationHeroCopy">
            Complete one registration for your couple. Your registration is received immediately and
            becomes confirmed after the $100 non-refundable deposit is received and verified.
          </p>
        </div>
      </section>

      <section className="registrationShell">
        <aside className="registrationSummary" aria-label="Registration summary">
          <p className="eyebrow plum">AT A GLANCE</p>
          <h2>Your weekend.</h2>

          <div className="summaryItem">
            <span>Registration</span>
            <strong>$600 per couple</strong>
          </div>
          <div className="summaryItem">
            <span>Deposit</span>
            <strong>$100 non-refundable</strong>
          </div>
          <div className="summaryItem">
            <span>Included stay</span>
            <strong>Friday + Saturday nights</strong>
          </div>
          <div className="summaryItem">
            <span>Additional nights</span>
            <strong>Wed · Thu · Sun · Mon</strong>
          </div>

          <div className="summaryNote">
            <strong>Engaged couples are welcome.</strong>
            <p>Children are not included in the retreat experience.</p>
          </div>

          <Link className="summaryPaymentLink" href="/pay">
            View payment details →
          </Link>
        </aside>

        <div className="registrationMain">
          <div className="registrationIntroCard">
            <p className="eyebrow plum">COUPLE REGISTRATION</p>
            <h2>Tell us about the two of you.</h2>
            <p>
              Fields marked required must be completed before submission. Each spouse has a separate
              email and mobile field so both can receive retreat communications.
            </p>
          </div>
          <RegistrationForm />
        </div>
      </section>
    </main>
  );
}
