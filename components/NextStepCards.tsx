import Link from "next/link";

export default function NextStepCards({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "nextStepSection nextStepSection--compact" : "nextStepSection"}>
      <div className="nextStepHeading">
        <p className="eyebrow plum">YOUR NEXT STEP</p>
        <h2>Ready to Strengthen Your Covenant?</h2>
        <p>Your marriage matters. Your weekend matters. Choose the path that fits where you are today.</p>
      </div>

      <div className="nextStepGrid">
        <article className="nextStepCard nextStepCard--primary">
          <span className="nextStepBadge">BEST NEXT STEP</span>
          <div className="nextStepIcon" aria-hidden="true">01</div>
          <h3>Register & Pay Deposit</h3>
          <p className="nextStepKicker">Secure Your Spot</p>
          <p>Complete your registration and choose at least the $100 non-refundable deposit. Your registration is confirmed only after the required deposit is received and verified.</p>
          <Link className="plumButton nextStepButton" href="/register" data-track="register_cta" data-track-label="Next Step Card">REGISTER NOW</Link>
          <small>$100 non-refundable deposit per couple</small>
        </article>

        <article className="nextStepCard">
          <div className="nextStepIcon" aria-hidden="true">02</div>
          <h3>Already Registered?</h3>
          <p className="nextStepKicker">Make a Payment</p>
          <p>Use your registration reference and email to securely view your balance, payment history, and make another payment. No password is required.</p>
          <Link className="outlineButton nextStepButton" href="/manage">MAKE A PAYMENT</Link>
          <small>Secure one-time email verification</small>
        </article>

        <article className="nextStepCard">
          <div className="nextStepIcon" aria-hidden="true">03</div>
          <h3>Not Ready Yet?</h3>
          <p className="nextStepKicker">Stay Updated</p>
          <p>Join the interest list for retreat updates, important dates, and special announcements without registering yet.</p>
          <a className="outlineButton nextStepButton" href="#stay-updated">YES, KEEP ME UPDATED</a>
          <small>No commitment.</small>
        </article>
      </div>
    </section>
  );
}
