import Link from "next/link";
import BrandMark from "@/components/BrandMark";

export const metadata={title:"Payment Experience | Once Upon a Covenant"};

const schedule=[
  ["February 1, 2027","$100"],
  ["March 1, 2027","$85"],
  ["April 1, 2027","$85"],
  ["May 1, 2027","$85"],
  ["June 1, 2027","$85"],
  ["July 1, 2027","$85"],
  ["August 1, 2027","$75"],
];

export default function PayPage(){
  return <main className="formPage paymentExperiencePage">
    <header className="formTopbar">
      <Link className="formBrand" href="/" aria-label="Once Upon a Covenant home"><BrandMark compact /></Link>
      <Link className="formHomeLink" href="/">RETURN TO EXPERIENCE</Link>
    </header>

    <section className="paymentHero">
      <p className="eyebrow gold">REGISTRATION & PAYMENTS</p>
      <h1>A Clear Path From Registration to Paid in Full.</h1>
      <p>Total registration is <strong>$600 per couple</strong>. The first $100 is non-refundable. Pay the minimum deposit, pay more, or pay in full when it works best for you.</p>
    </section>

    <div className="paymentExperienceShell">
      <section className="paymentPathSection">
        <div className="sectionHeading paymentSectionHeading">
          <p className="eyebrow plum">CHOOSE YOUR PATH</p>
          <h2>What are you trying to do today?</h2>
          <p>We’ll tell you what happens before you leave this website for an external payment service.</p>
        </div>

        <div className="paymentPathGrid">
          <article className="paymentPathCard paymentPathCard--primary">
            <span className="paymentPathLabel">NEW COUPLE</span>
            <h3>Register & Pay Deposit</h3>
            <p>Complete the four-step registration. On the final step, choose the $100 deposit, the full $600 balance, or another amount from $100–$600.</p>
            <div className="beforeYouGo">
              <strong>What happens next</strong>
              <span>Your registration is created first. If you choose PushPay, we then send you to the secure payment page. Your registration remains pending until the deposit is received and verified.</span>
            </div>
            <Link className="plumButton" href="/register">START REGISTRATION</Link>
          </article>

          <article className="paymentPathCard">
            <span className="paymentPathLabel">EXISTING REGISTRANT</span>
            <h3>Make Another Payment</h3>
            <p>Securely retrieve your registration using your confirmation/reference number and email, then verify with a one-time code.</p>
            <div className="beforeYouGo">
              <strong>You’ll see</strong>
              <span>Your couple name, total registration, verified amount paid, remaining balance, and payment history before you choose another payment amount.</span>
            </div>
            <Link className="outlineButton" href="/manage">VIEW BALANCE & PAY</Link>
          </article>
        </div>
      </section>

      <section className="scheduleSection">
        <div className="scheduleIntro">
          <p className="eyebrow plum">BUDGETING GUIDANCE</p>
          <h2>Suggested Payment Plan</h2>
          <p>This schedule is a planning tool—not a locked installment plan. You may pay early, pay more than the suggested amount, or pay your remaining balance in full at any time.</p>
        </div>

        <div className="scheduleCard">
          <div className="scheduleTable" role="table" aria-label="Suggested retreat payment schedule">
            <div className="scheduleRow scheduleRow--head" role="row"><span role="columnheader">Suggested date</span><span role="columnheader">Suggested payment</span></div>
            {schedule.map(([date,amount])=><div className="scheduleRow" role="row" key={date}><span role="cell">{date}</span><strong role="cell">{amount}</strong></div>)}
            <div className="scheduleRow scheduleRow--total" role="row"><span role="cell">Total registration</span><strong role="cell">$600</strong></div>
          </div>
          <div className="scheduleRules">
            <p><strong>First $100:</strong> non-refundable.</p>
            <p><strong>After August 31, 2027:</strong> a $50 late fee applies.</p>
            <p><strong>Checks:</strong> not accepted after August 31, 2027.</p>
            <p><strong>Returned checks:</strong> $30 fee.</p>
          </div>
        </div>
      </section>

      <section className="paymentMethodsSection">
        <div className="sectionHeading paymentSectionHeading">
          <p className="eyebrow plum">APPROVED PAYMENT METHODS</p>
          <h2>Choose the method that works for you.</h2>
          <p>Offline payments remain pending until the retreat finance team verifies them. Your online balance updates only after verification.</p>
        </div>

        <div className="paymentMethodGrid">
          <article>
            <span className="paymentMethodNumber">01</span>
            <h3>PushPay</h3>
            <p>Use the secure Eagle Creek Church of Christ payment page after recording your payment through registration or the Make a Payment flow.</p>
            <a className="outlineButton" href="https://ppay.co/mJyvth1Pp-Y" target="_blank" rel="noreferrer">OPEN PUSHPAY</a>
          </article>
          <article>
            <span className="paymentMethodNumber">02</span>
            <h3>Zelle</h3>
            <p>Send payment to:</p>
            <p className="methodHighlight">mbankhead@myeccoc.com</p>
            <p>Record the payment amount in the website flow first so the committee can reconcile it to your registration.</p>
          </article>
          <article>
            <span className="paymentMethodNumber">03</span>
            <h3>Check or Money Order</h3>
            <p>Payable to <strong>Eagle Creek Church of Christ</strong> with <strong>Midwest Marriage Retreat</strong> in the memo line.</p>
            <address>Eagle Creek Church of Christ<br/>c/o 2027 Midwest Marriage Retreat<br/>3025 W. 69th Street<br/>Indianapolis, IN 46268</address>
          </article>
        </div>
      </section>

      <section className="paymentStatusSection">
        <div>
          <p className="eyebrow gold">PAYMENT STATUS</p>
          <h2>Know exactly where you stand.</h2>
          <p>After verification, your secure registration view shows your total paid, remaining balance, payment history, and current registration status.</p>
        </div>
        <div className="statusLegend">
          <span>Deposit Pending</span>
          <span>Confirmed — Deposit Paid</span>
          <span>Partially Paid</span>
          <span>Paid in Full</span>
          <span>Manual Payment Pending Verification</span>
          <span>Payment Failed</span>
          <span>Transferred</span>
          <span>Refund Review / Refunded</span>
        </div>
      </section>

      <section className="paymentQuestions">
        <p className="eyebrow plum">PAYMENT QUESTIONS?</p>
        <h2>Need help before you pay?</h2>
        <p>Contact Marvin Bankhead at <strong>mbankhead@myeccoc.com</strong> or 219-613-5590, or Jasmin Bankhead at <strong>marvinandjasmin@outlook.com</strong> or 219-613-5591.</p>
        <Link className="outlineButton" href="/contact">CONTACT THE RETREAT TEAM</Link>
      </section>
    </div>
  </main>
}
