import RegistrationForm from "@/components/RegistrationForm";

export const metadata = { title: "Register | Once Upon a Covenant" };

export default function RegisterPage() {
  return (
    <main className="formPage">
      <a className="backLink" href="/">← Once Upon a Covenant</a>
      <div className="formIntro">
        <p className="eyebrow plum">2027 MIDWEST MARRIAGE RETREAT</p>
        <h1>Reserve Your Place</h1>
        <p>October 8–10, 2027 · Embassy Suites Noblesville Indianapolis Conference Center</p>
        <div className="notice"><strong>$600 per couple.</strong> The first $100 is non-refundable and must be received and verified before your registration is confirmed.</div>
      </div>
      <RegistrationForm />
    </main>
  );
}
