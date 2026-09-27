import Image from "next/image";
import Link from "next/link";
import Gateway from "@/components/Gateway";
import BrandMark from "@/components/BrandMark";

const img = {
  castle: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790523683/02_castle_sunset_balose.jpg",
  ballroom: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790523682/03_royal_ballroom_cabvif.jpg",
  hotel: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790540661/indnb-exterior-02_m2nsu5.avif",
  florals: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790523682/15_candles_and_florals_zcmyje.jpg",
  rings: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790523684/05_wedding_rings_velvet_yom92x.jpg",
  speakerDavid: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790540868/ChatGPT_Image_Sep_27_2026_04_26_37_PM_up6w3b.jpg",
};

export default function Home() {
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Once Upon a Covenant — 2027 Midwest Marriage Retreat",
    startDate: "2027-10-08",
    endDate: "2027-10-10",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Embassy Suites Noblesville Indianapolis Conference Center",
      address: {
        "@type": "PostalAddress",
        streetAddress: "13700 Conference Center Drive South",
        addressLocality: "Noblesville",
        addressRegion: "IN",
        postalCode: "46060",
        addressCountry: "US",
      },
    },
    offers: {
      "@type": "Offer",
      price: "600",
      priceCurrency: "USD",
      url: "https://onceuponacovenant.org/register",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }} />
      <Gateway />
      <header className="siteHeader">
        <a className="brand" href="#experience" aria-label="Once Upon a Covenant home"><BrandMark compact /></a>
        <nav aria-label="Primary navigation">
          <a href="#experience">Experience</a>
          <a href="#schedule">Schedule</a>
          <a href="#speakers">Speakers</a>
          <a href="#venue">Venue</a>
          <a href="#faq">FAQ</a>
          <Link href="/contact">Contact</Link>
          <Link className="navCta" href="/register" data-track="register_cta" data-track-label="Header">Register</Link>
        </nav>
      </header>

      <main>
        <section id="experience" className="hero section">
          <div className="heroCopy">
            <p className="eyebrow plum">2027 MIDWEST MARRIAGE RETREAT</p>
            <h1>You’re Invited to an Extraordinary Weekend.</h1>
            <p>Step away from the ordinary and make room to strengthen your covenant, deepen your connection, and write the next chapter of your marriage with God at the center.</p>
            <div className="buttonRow">
              <Link className="plumButton" href="/register" data-track="register_cta" data-track-label="Hero">REGISTER NOW</Link>
              <a className="textButton" href="#why">EXPLORE THE EXPERIENCE →</a>
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

        <section id="why" className="section whySection">
          <div className="sectionHeading">
            <p className="eyebrow plum">WHY THIS WEEKEND MATTERS</p>
            <h2>Come home with more than memories.</h2>
            <p>This weekend is designed to give couples biblical grounding and practical ways to keep building long after the retreat ends.</p>
          </div>
          <div className="outcomeGrid">
            {[
              ["Biblical Grounding","Reconnect your marriage to covenant, purpose, and God at the center."],
              ["Practical Tools","Leave with ideas you can actually use when real life resumes."],
              ["Stronger Communication","Create room to listen, reconnect, and understand each other more clearly."],
              ["Intentional Connection","Step away from routines and make space for the two of you."],
              ["Renewed Purpose","Reflect on where your story has been and what you want to build next."],
            ].map(([title,copy],i)=><article key={title} className="outcomeCard"><span>0{i+1}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
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

        <section id="speakers" className="section speakerSection">
          <div className="sectionHeading">
            <p className="eyebrow plum">OUR SPEAKERS</p>
            <h2>Voices for the journey.</h2>
            <p>Two speakers will guide couples through biblical truth, practical reflection, and meaningful conversation throughout the weekend.</p>
          </div>

          <div className="speakerGrid">
            <article className="speakerProfileCard">
              <div className="speakerPhoto">
                <Image
                  src={img.speakerDavid}
                  alt="David Wilson, Minister at Kings Church of Christ in Brooklyn, New York"
                  fill
                  quality={95}
                  sizes="(max-width: 760px) 100vw, 420px"
                />
              </div>
              <div className="speakerProfileBody">
                <p className="eyebrow plum">THE EXPOSITOR</p>
                <h3>David Wilson</h3>
                <p className="speakerRole">Minister, Kings Church of Christ<br/>Brooklyn, New York</p>
                <p className="speakerTeaser">Affectionately known as <strong>“The Expositor,”</strong> David Wilson is known for explaining the Word of God in an exciting, informative, and relevant manner.</p>

                <details className="speakerBio">
                  <summary>Meet David <span aria-hidden="true">→</span></summary>
                  <div className="speakerBioContent">
                    <p>Affectionately known as <strong>“The Expositor,”</strong> David Wilson is the dynamic Minister of the Kings Church of Christ in Brooklyn, New York. He exhibits the trifecta of great gospel preaching: a love for God, a love for His people, and a love for the truth.</p>
                    <p>David brings a unique blend of talents, passion, and experience that enables him to explain the Word of God in a way that is <strong>exciting, informative, and relevant</strong>.</p>
                  </div>
                </details>
              </div>
            </article>

            <article className="speakerProfileCard speakerProfileCard--placeholder" aria-label="Second speaker details coming soon">
              <div className="speakerPlaceholderVisual" aria-hidden="true">
                <span>02</span>
              </div>
              <div className="speakerProfileBody">
                <p className="eyebrow plum">SECOND SPEAKER</p>
                <h3>Details Coming Soon</h3>
                <p className="speakerRole">Speaker announcement in progress</p>
                <p className="speakerTeaser">Our second speaker will be added here as soon as the final bio, image, and session information are confirmed.</p>
              </div>
            </article>
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

        <section id="investment" className="investmentSection">
          <div className="investmentVisual"><Image src={img.rings} alt="Wedding rings on deep plum velvet" fill quality={95} sizes="(max-width:900px) 100vw, 45vw"/></div>
          <div className="investmentCopy">
            <p className="eyebrow gold">REGISTRATION & INVESTMENT</p>
            <h2>$600 per couple.</h2>
            <p>The first <strong>$100 is non-refundable</strong> and secures your registration after it is received and verified. Couples may pay the full balance immediately or make additional payments at any time up to the amount remaining.</p>
            <ul>
              <li>Friday and Saturday lodging included</li>
              <li>Engaged couples are welcome</li>
              <li>Additional hotel nights may be requested during registration</li>
              <li>PushPay, Zelle, check, and money order options</li>
            </ul>
            <div className="buttonRow">
              <Link className="goldButton" href="/register" data-track="register_cta" data-track-label="Investment">REGISTER & PAY DEPOSIT</Link>
              <Link className="lightTextButton" href="/manage">MAKE A PAYMENT →</Link>
            </div>
          </div>
        </section>

        <section id="faq" className="section faq">
          <div className="sectionHeading"><p className="eyebrow plum">FAQ</p><h2>Good to know.</h2></div>
          {[
            ["Is the $600 registration fee per person?", "No. The $600 registration fee is per couple."],
            ["Is lodging included?", "Yes. Friday and Saturday nights are included in the registration fee. Extra nights may be requested and are paid separately."],
            ["Can we register before paying?", "Registration and payment are recorded together in the new website flow. Your registration remains pending until at least the required $100 non-refundable deposit is verified."],
            ["Can we pay more than the suggested installment amount?", "Yes. Couples may pay any amount toward the remaining balance, including paying in full early."],
            ["How do we make another payment later?", "Use the Make a Payment page. Enter your registration reference and one of the email addresses on your registration, then verify with a one-time email code."],
            ["Are children included?", "No. This retreat is designed for couples and children are not included."],
            ["Can engaged couples attend?", "Yes. Engaged couples are welcome to register."],
            ["What if I lose my confirmation number?", "The Make a Payment page includes a secure confirmation-number recovery option using the email address on your registration."],
          ].map(([q,a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </section>

        <section className="ctaSection">
          <p className="eyebrow gold">BEGIN YOUR NEXT CHAPTER</p>
          <h2>Ready to write the next chapter together?</h2>
          <div className="buttonRow centeredButtons">
            <Link className="goldButton linkButton" href="/register" data-track="register_cta" data-track-label="Final CTA">REGISTER NOW</Link>
            <Link className="secondaryDarkLink" href="/manage">MAKE A PAYMENT</Link>
          </div>
        </section>
      </main>

      <footer>
        <div className="footerBrand"><BrandMark /></div>
        <strong>Once Upon a Covenant</strong>
        <span>A Love Story Written by God · Ecclesiastes 4:12</span>
        <span>October 8–10, 2027 · Noblesville, Indiana</span>
        <div className="footerLinks"><Link href="/contact" data-track="contact_help">Contact Us</Link><Link href="/manage">Manage Registration</Link><Link href="/privacy">Privacy</Link></div>
      </footer>
    </>
  );
}
