import Link from "next/link";

export const metadata={title:"Privacy | Once Upon a Covenant"};

export default function PrivacyPage(){
  return <main className="formPage">
    <header className="formTopbar"><Link className="formBrand" href="/"><span className="formBrandMark">♛</span><span>Once Upon a Covenant</span></Link><Link className="formHomeLink" href="/">RETURN TO EXPERIENCE</Link></header>
    <section className="simpleHero"><p className="eyebrow gold">PRIVACY</p><h1>How We Use Your Information</h1><p>A concise privacy notice for the 2027 Midwest Marriage Retreat.</p></section>
    <article className="privacyPage">
      <h2>Registration information</h2><p>We collect the information needed to administer retreat registration, communicate with couples, coordinate lodging and additional-night requests, prepare for dietary and accessibility needs, reconcile payments, and provide retreat updates.</p>
      <h2>Payment information</h2><p>This website does not collect or store raw credit-card numbers or banking credentials. PushPay and other approved payment methods operate through their own payment services. The retreat website stores only payment records and verification status needed to maintain your registration balance.</p>
      <h2>Who can access the information</h2><p>Authorized retreat committee administrators may access registration and payment information needed for their operational responsibilities. Sensitive dietary and accessibility information is not included in public pages or email subject lines.</p>
      <h2>Analytics</h2><p>We collect limited website interaction data such as page visits, registration-step completion, and button clicks to understand where visitors need clearer guidance. We do not intentionally place dietary, accessibility, or payment credentials into analytics events.</p>
      <h2>Retention</h2><p>Registration and payment records are retained only as reasonably needed for retreat operations, financial reconciliation, required recordkeeping, and post-retreat administration. The committee may refine its formal retention schedule as governance requirements are finalized.</p>
      <h2>Questions or corrections</h2><p>There is no attendee self-service editing after registration. If information needs to be corrected, <Link href="/contact">contact the retreat team</Link>.</p>
    </article>
  </main>
}
