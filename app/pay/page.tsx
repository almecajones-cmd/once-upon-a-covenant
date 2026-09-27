import Link from "next/link";
import BrandMark from "@/components/BrandMark";

export const metadata={title:"Payment Options | Once Upon a Covenant"};

export default function PayPage(){
  return <main className="formPage">
    <header className="formTopbar"><Link className="formBrand" href="/" aria-label="Once Upon a Covenant home"><BrandMark compact /></Link><Link className="formHomeLink" href="/">RETURN TO EXPERIENCE</Link></header>
    <section className="simpleHero"><p className="eyebrow gold">PAYMENT INFORMATION</p><h1>Payment Options</h1><p>Total registration is $600 per couple. The first $100 is non-refundable.</p></section>
    <div className="paymentPageShell">
      <section className="paymentLeadCard"><h2>Already registered?</h2><p>Use your secure registration lookup to see your verified balance and payment history before making another payment.</p><Link className="plumButton" href="/manage">VIEW MY BALANCE & PAY</Link></section>
      <section className="paymentCards">
        <article><p className="eyebrow plum">OPTION 1</p><h2>Zelle</h2><p>Send payment to:</p><p><strong>mbankhead@myeccoc.com</strong></p></article>
        <article><p className="eyebrow plum">OPTION 2</p><h2>PushPay</h2><p>Use the secure Eagle Creek Church of Christ payment page.</p><a className="plumButton" href="https://ppay.co/mJyvth1Pp-Y" target="_blank" rel="noreferrer">OPEN PUSHPAY</a></article>
        <article><p className="eyebrow plum">OPTION 3</p><h2>Check or Money Order</h2><p>Payable to <strong>Eagle Creek Church of Christ</strong> with <strong>Midwest Marriage Retreat</strong> in the memo.</p><p>Eagle Creek Church of Christ<br/>c/o 2027 Midwest Marriage Retreat<br/>3025 W. 69th Street<br/>Indianapolis, IN 46268</p></article>
      </section>
      <section className="paymentNote"><h2>Suggested Payment Plan</h2><p>Feb. 1 — $100 · Mar. 1 — $85 · Apr. 1 — $85 · May 1 — $85 · Jun. 1 — $85 · Jul. 1 — $85 · Aug. 1 — $75</p><p>You may pay any amount toward your balance at any time. A $50 late fee applies after August 31, 2027. Checks are not accepted after August 31, 2027. A $30 fee applies to returned checks.</p></section>
    </div>
  </main>
}
