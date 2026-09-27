import Image from "next/image";
import Link from "next/link";
import Gateway from "@/components/Gateway";

const img = {
  castle: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790523683/02_castle_sunset_balose.jpg",
  cord: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790523683/14_gold_cord_tassel_f52ul2.jpg",
  ballroom: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790523682/03_royal_ballroom_cabvif.jpg",
  hotel: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790523683/09_hotel_exterior_jywp3k.jpg",
  florals: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790523682/15_candles_and_florals_zcmyje.jpg",
};

export default function Home() {
  return (
    <>
      <Gateway />
      <header className="siteHeader">
        <a className="brand" href="#experience"><span>♛</span> Once Upon a Covenant</a>
        <nav aria-label="Primary navigation">
          <a href="#experience">Experience</a>
          <a href="#schedule">Schedule</a>
          <a href="#venue">Venue</a>
          <a href="#faq">FAQ</a>
          <Link className="navCta" href="/register">Register</Link>
        </nav>
      </header>

      <main>
        <section id="experience" className="hero section">
          <div className="heroCopy">
            <p className="eyebrow plum">2027 MIDWEST MARRIAGE RETREAT</p>
            <h1>You’re Invited to an Extraordinary Weekend.</h1>
            <p>Step away from the ordinary and make room to strengthen your covenant, deepen your connection, and write the next chapter of your marriage with God at the center.</p>
            <div className="buttonRow">
              <Link className="plumButton" href="/register">RESERVE OUR SPOT</Link>
              <a className="textButton" href="#schedule">SEE THE EXPERIENCE →</a>
            </div>
          </div>
          <div className="heroImage">
            <Image src={img.castle} alt="Elegant castle setting at sunset" fill priority quality={95} sizes="(max-width: 800px) 100vw, 50vw" />
          </div>
        </section>

        <section className="covenant">
          <div className="sectionNarrow">
            <p className="eyebrow gold">THE COVENANT</p>
            <h2>Two lives. One covenant. God at the center.</h2>
            <div className="equation" aria-label="Husband plus Wife plus God">HUSBAND <span>+</span> WIFE <span>+</span> GOD</div>
            <p>Ecclesiastes 4:12 reminds us that a marriage is strengthened when two people are joined with God. The fairytale is our creative language. Covenant is the substance.</p>
          </div>
        </section>

        <section className="facts section">
          <div><strong>October 8–10, 2027</strong><span>Friday–Sunday</span></div>
          <div><strong>Embassy Suites Noblesville</strong><span>Indianapolis Conference Center</span></div>
          <div><strong>$600 per couple</strong><span>Friday & Saturday lodging included</span></div>
        </section>

        <section id="schedule" className="section stack">
          <div className="sectionHeading">
            <p className="eyebrow plum">THE WEEKEND</p>
            <h2>Your story unfolds chapter by chapter.</h2>
          </div>
          <div className="chapterGrid">
            {[
              ["Friday", "The Invitation", "Welcome, connection, dinner, and an opening message that sets the tone for the weekend."],
              ["Saturday", "The Journey", "Breakfast, general session, two practical breakout sessions, and intentional time together."],
              ["Saturday Evening", "The Royal Ball", "An elegant celebration of covenant with dinner, fellowship, photos, and a signature evening experience."],
              ["Sunday", "The Story Continues", "Breakfast, worship, and a meaningful close designed to send couples home with purpose."],
            ].map(([day,title,copy]) => (
              <article className="chapterCard" key={title}>
                <p className="eyebrow plum">{day}</p>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ball">
          <Image src={img.ballroom} alt="" fill quality={95} sizes="100vw" />
          <div className="ballOverlay" />
          <div className="ballCopy">
            <p className="eyebrow gold">SATURDAY EVENING</p>
            <h2>The Royal Ball</h2>
            <p>A signature celebration of covenant—elegant, joyful, and intentionally designed for couples to celebrate the story God is writing through their marriage.</p>
          </div>
        </section>

        <section id="venue" className="section split">
          <div className="venueImage"><Image src={img.hotel} alt="Embassy Suites Noblesville Indianapolis Conference Center entrance" fill quality={95} sizes="(max-width:800px) 100vw, 50vw" /></div>
          <div>
            <p className="eyebrow plum">VENUE & STAY</p>
            <h2>Everything in one place.</h2>
            <p><strong>Embassy Suites Noblesville Indianapolis Conference Center</strong><br/>13700 Conference Center Drive South<br/>Noblesville, IN 46060</p>
            <p>Your $600 couple registration includes Friday and Saturday lodging. Additional nights may be requested during registration for Wednesday, Thursday, Sunday, or Monday and are paid separately by the couple.</p>
            <p>Accessible-room requests can also be submitted with your registration.</p>
          </div>
        </section>

        <section id="faq" className="section faq">
          <div className="sectionHeading"><p className="eyebrow plum">FAQ</p><h2>Good to know.</h2></div>
          {[
            ["Is the $600 registration fee per person?", "No. The $600 registration fee is per couple."],
            ["Is lodging included?", "Yes. Friday and Saturday nights are included in the registration fee. Extra nights may be requested and are paid separately."],
            ["Can we register before paying?", "Yes. Registration and payment are tracked separately. Your registration remains pending until the required $100 non-refundable deposit is verified."],
            ["Can we pay more than the suggested installment amount?", "Yes. Couples may pay any amount toward the remaining balance, including paying in full early."],
            ["Are children included?", "No. This retreat is designed for couples and children are not included."],
            ["Can engaged couples attend?", "Yes. Engaged couples are welcome to register."],
          ].map(([q,a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </section>

        <section className="ctaSection">
          <p className="eyebrow gold">BEGIN YOUR NEXT CHAPTER</p>
          <h2>Ready to write the next chapter together?</h2>
          <Link className="goldButton linkButton" href="/register">RESERVE OUR SPOT</Link>
        </section>
      </main>

      <footer>
        <strong>Once Upon a Covenant</strong>
        <span>A Love Story Written by God · Ecclesiastes 4:12</span>
        <span>October 8–10, 2027 · Noblesville, Indiana</span>
        <Link href="/contact">Contact Us</Link>
      </footer>
    </>
  );
}
