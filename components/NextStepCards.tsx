import Link from "next/link";

export default function NextStepCards({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "nextStepSection nextStepSection--compact" : "nextStepSection"}>
      <div className="nextStepHeading">
        <p className="eyebrow plum">YOUR NEXT STEP</p>
        <h2>Ready to Strengthen Your Covenant?</h2>
        <p>Your marriage matters. Your weekend matters. Choose the path that fits where you are today.</p>
        <div className="nextStepOrnament" aria-hidden="true">
          <span />
          <b>♡</b>
          <span />
        </div>
      </div>

      <div className="nextStepGrid">
        <article className="nextStepCard nextStepCard--primary">
          <span className="nextStepRibbon">BEGIN YOUR CHAPTER</span>
          <div className="nextStepIcon" aria-hidden="true">01</div>
          <p className="nextStepKicker">Secure Your Spot</p>
          <h3>Register & Pay Deposit</h3>
          <p>Complete your registration with a minimum $100 non-refundable deposit. Your reservation is confirmed once the deposit is received and verified.</p>
          <Link className="plumButton nextStepButton" href="/register" data-track="register_cta" data-track-label="Next Step Card">REGISTER NOW</Link>
          <small>$100 non-refundable deposit per couple</small>
        </article>

        <article className="nextStepCard">
          <span className="nextStepRibbon nextStepRibbon--quiet">CONTINUE YOUR JOURNEY</span>
          <div className="nextStepIcon" aria-hidden="true">02</div>
          <p className="nextStepKicker">Make a Payment</p>
          <h3>Already Registered?</h3>
          <p>Securely view your balance and payment history, then make another payment using your registration reference and email.</p>
          <Link className="outlineButton nextStepButton" href="/manage">MAKE A PAYMENT</Link>
          <small>Secure one-time email verification</small>
        </article>

        <article className="nextStepCard">
          <span className="nextStepRibbon nextStepRibbon--quiet">STAY IN THE STORY</span>
          <div className="nextStepIcon" aria-hidden="true">03</div>
          <p className="nextStepKicker">Stay Updated</p>
          <h3>Not Ready Yet?</h3>
          <p>Join the interest list for retreat updates, important dates, and special announcements without registering yet.</p>
          <a className="outlineButton nextStepButton" href="#stay-updated">YES, KEEP ME UPDATED</a>
          <small>No commitment.</small>
        </article>
      </div>
    </section>
  );
}
