import Image from "next/image";
import Link from "next/link";
import Gateway from "@/components/Gateway";
import BrandMark from "@/components/BrandMark";
import NextStepCards from "@/components/NextStepCards";
import StayUpdatedForm from "@/components/StayUpdatedForm";

const img = {
  castle: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790545016/ChatGPT_Image_Sep_27_2026_05_36_15_PM_jmnyri.png",
  ballroom: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790523682/03_royal_ballroom_cabvif.jpg",
  hotel: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790540661/indnb-exterior-02_m2nsu5.avif",
  florals: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790523682/15_candles_and_florals_zcmyje.jpg",
  rings: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790548053/ChatGPT_Image_Sep_27_2026_06_27_16_PM_rvyr0g.png",
  speakerDavid: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790540868/ChatGPT_Image_Sep_27_2026_04_26_37_PM_up6w3b.jpg",
  speakerBailey: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790558856/IMG_0077_yvmx1f.jpg",
  diningAspen: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790547186/revised_aspen_creek_cxqgxo.jpg",
  diningLivery: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790546105/Livery_itmkr6.webp",
  diningFord: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790547186/Ford_revised_image_yf4pcx.jpg",
  diningChuy: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790547185/chuys_revised_image_d61ig5.jpg",
  diningPiesPints: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790547184/pprevised_dr0igq.webp",
  diningKoto: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790547145/Screenshot_2026-09-27_181135_qyrhzr.png",
  diningMcalisters: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790547145/Screenshot_2026-09-27_181207_d21vbi.png",
  diningHandels: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790546101/handles_snt1eo.jpg",
  diningStoneCreek: "https://res.cloudinary.com/v78xwhwr/image/upload/v1790546101/stonecreek_jzxx7f.jpg",
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
            <div className="heroOrnament" aria-hidden="true">
              <span />
              <b>♡</b>
              <span />
            </div>
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

        <section className="covenant covenantArtwork" aria-label="The Covenant">
          <img
            src="https://res.cloudinary.com/v78xwhwr/image/upload/v1790546681/ChatGPT_Image_Sep_27_2026_06_04_18_PM_uack9v.png"
            alt="The Covenant — Two lives. One covenant. God at the center. Ecclesiastes 4:12."
            loading="lazy"
          />
        </section>

        <section className="facts section">
          <div><strong>October 8–10, 2027</strong><span>Friday–Sunday</span></div>
          <div><strong>Embassy Suites Noblesville</strong><span>Indianapolis Conference Center</span></div>
          <div><strong>$600 per couple</strong><span>Friday & Saturday lodging included</span></div>
        </section>

        <section id="why" className="section whySection">
          <div className="sectionHeading">
            <p className="eyebrow plum">WHY THIS WEEKEND MATTERS</p>
            <h2>Return home with more than memories.</h2>
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

        <section id="schedule" className="section scheduleExperience scheduleToc">
          <div className="sectionHeading scheduleTocHeading">
            <p className="eyebrow plum">THE WEEKEND STORY</p>
            <h2>A table of contents for your weekend.</h2>
            <p>Each day unfolds like a chapter—moving from invitation, to purpose and plot twists, to the Royal Ball, and finally to the story you carry home.</p>
          </div>

          <div className="scheduleDayGrid">
            <article className="scheduleDayCard scheduleChapterCard">
              <div className="scheduleDayHead scheduleChapterHead">
                <p className="scheduleChapterLabel">FRIDAY — CHAPTER ONE</p>
                <h3>The Invitation to the Ball</h3>
                <p className="scheduleChapterVerse">Love originates from God <span>•</span> 1 John 4:7</p>
              </div>
              <div className="scheduleTimeline scheduleContents">
                <div><time>6:00 PM</time><span><strong>The Invitation</strong><small>Welcome & Opening</small></span></div>
                <div><time>6:15 PM</time><span><strong>The Royal Introduction</strong><small>Icebreaker</small></span></div>
                <div><time>7:00 PM</time><span><strong>The Opening Feast</strong><small>Dinner</small></span></div>
                <div><time>7:30 PM</time><span><strong>Every Fairytale Has a Villain</strong><small>Opening Message</small></span></div>
                <div><time>9:00 PM</time><span><strong>Battle of the Kingdoms</strong><small>Optional Fellowship</small></span></div>
              </div>
            </article>

            <article className="scheduleDayCard scheduleDayCard--featured scheduleChapterCard">
              <div className="scheduleDayHead scheduleChapterHead">
                <p className="scheduleChapterLabel">SATURDAY — CHAPTER TWO</p>
                <h3>Happily Ever After Is a Journey</h3>
                <p className="scheduleChapterVerse">God binds husband & wife <span>•</span> Ecclesiastes 4:12</p>
              </div>
              <div className="scheduleTimeline scheduleContents">
                <div><time>7:00–8:30 AM</time><span><strong>Morning at the Kingdom</strong><small>Breakfast</small></span></div>
                <div><time>8:45 AM</time><span><strong>Divine Purpose</strong><small>General Session</small></span></div>
                <div><time>9:15 AM</time><span><strong>Intermission</strong></span></div>
                <div><time>9:30 AM</time><span><strong>The Plot Twists</strong><small>Breakout I</small></span></div>
                <div><time>10:45 AM</time><span><strong>Intermission</strong></span></div>
                <div><time>11:00 AM</time><span><strong>The Plot Twists</strong><small>Breakout II</small></span></div>
                <div className="scheduleLunch"><time>12:15 PM</time><span><strong>Our Own Chapter</strong><small>Lunch & Couple Time — lunch is on your own. Explore nearby dining or enjoy intentional time together before the evening celebration.</small><a href="#dining">EXPLORE NEARBY DINING →</a></span></div>
                <div><time>5:00 PM</time><span><strong>A Moment in the Story</strong><small>Photo Experience Opens</small></span></div>
                <div><time>6:00 PM</time><span><strong>The Royal Ball</strong><small>Doors Open</small></span></div>
                <div><time>6:30 PM</time><span><strong>The Royal Ball</strong><small>An Evening of Enchantment</small></span></div>
              </div>
            </article>

            <article className="scheduleDayCard scheduleChapterCard">
              <div className="scheduleDayHead scheduleChapterHead">
                <p className="scheduleChapterLabel">SUNDAY — THE FINAL CHAPTER</p>
                <h3>The Story Continues</h3>
                <p className="scheduleChapterVerse">Ever After Begins Now</p>
              </div>
              <div className="scheduleTimeline scheduleContents">
                <div><time>7:00–8:30 AM</time><span><strong>Breakfast Together</strong></span></div>
                <div><time>9:00 AM</time><span><strong>The Story Continues</strong><small>Worship & Reflection</small></span></div>
                <div><time>11:00 AM</time><span><strong>Ever After Begins Now</strong><small>Departure</small></span></div>
              </div>
            </article>
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
                <img
                  src={img.speakerDavid}
                  alt="David Wilson, Minister at Kings Church of Christ in Brooklyn, New York"
                  loading="lazy"
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

            <article className="speakerProfileCard">
              <div className="speakerPhoto speakerPhoto--bailey">
                <img
                  src={img.speakerBailey}
                  alt="Minister Samuel D. Bailey"
                  loading="lazy"
                />
              </div>
              <div className="speakerProfileBody">
                <p className="eyebrow plum">FEATURED SPEAKER</p>
                <h3>Samuel D. Bailey</h3>
                <p className="speakerRole">Minister</p>
                <p className="speakerTeaser"><strong>Biography coming soon.</strong> Additional speaker and session details will be added as they are finalized.</p>
              </div>
            </article>
          </div>
        </section>

        <section id="venue" className="section split">
          <div className="venueImage"><img src={img.hotel} alt="Embassy Suites Noblesville Indianapolis Conference Center entrance" loading="lazy" /></div>
          <div>
            <p className="eyebrow plum">VENUE & STAY</p>
            <h2>Everything in one place.</h2>
            <p><strong>Embassy Suites Noblesville Indianapolis Conference Center</strong><br/>13700 Conference Center Drive South<br/>Noblesville, IN 46060</p>
            <p>Your $600 couple registration includes Friday and Saturday lodging. Additional nights may be requested during registration for Wednesday, Thursday, Sunday, or Monday and are paid separately by the couple.</p>
            <p>Accessible-room requests can also be submitted with your registration.</p>
          </div>
        </section>

        <section id="dining" className="section diningSection">
          <div className="diningIntro">
            <p className="eyebrow plum">SATURDAY LUNCH AROUND TOWN</p>
            <h2>Dine Around Noblesville.</h2>
            <p>Saturday afternoon is yours to enjoy. These options are concentrated around the hotel and Hamilton Town Center, so couples can have lunch, enjoy some time together, and still return comfortably before the Royal Ball.</p>
            <p className="diningNote">Restaurant hours and availability can change. Check current hours before heading out.</p>
          </div>

          <div className="diningCategory">
            <div className="diningCategoryHead"><span>01</span><div><h3>Date-Lunch Favorites</h3><p>A little more polished if you want lunch to feel like part of the retreat experience.</p></div></div>
            <div className="restaurantGrid">
              {[
                ["Livery Noblesville","Latin-inspired","Hamilton Town Center","Empanadas, tacos, shareables, and a polished casual atmosphere.","https://www.google.com/maps/dir/?api=1&origin=Embassy+Suites+Noblesville+Indianapolis+Conference+Center&destination=Livery+Noblesville+13225+Levinson+Ln+Noblesville+IN",img.diningLivery],
                ["Stone Creek Dining Company","American · Steak · Seafood","Hamilton Town Center","A comfortable upscale-casual option with salads, seafood, pasta, steaks, and lunch service.","https://www.google.com/maps/dir/?api=1&origin=Embassy+Suites+Noblesville+Indianapolis+Conference+Center&destination=Stone+Creek+Dining+Company+13904+Town+Center+Blvd+Noblesville+IN",img.diningStoneCreek],
              ].map(([name,cuisine,area,copy,url,image])=>(
                <article className="restaurantCard restaurantCard--feature" key={name}>
                  <div className="restaurantImage"><img src={image} alt={`${name} dining experience`} loading="lazy"/></div>
                  <div className="restaurantCardBody">
                  <p className="restaurantMeta">{cuisine}</p>
                  <h4>{name}</h4>
                  <span className="restaurantArea">{area}</span>
                  <p>{copy}</p>
                  <a href={url} target="_blank" rel="noreferrer">DIRECTIONS →</a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="diningCategory">
            <div className="diningCategoryHead"><span>02</span><div><h3>Close & Casual</h3><p>Easy nearby choices when you want a relaxed sit-down lunch without going far.</p></div></div>
            <div className="restaurantGrid restaurantGrid--three">
              {[
                ["Aspen Creek Grill","American · Grill","Very close to the hotel","Steaks, burgers, salads, ribs, seafood, and familiar comfort-food choices.","https://www.google.com/maps/dir/?api=1&origin=Embassy+Suites+Noblesville+Indianapolis+Conference+Center&destination=Aspen+Creek+Grill+13489+Tegler+Dr+Noblesville+IN",img.diningAspen],
                ["Ford's Garage","Burgers · American","Hamilton Town Center","A fun 1920s automotive-themed restaurant with burgers, salads, sandwiches, and more.","https://www.google.com/maps/dir/?api=1&origin=Embassy+Suites+Noblesville+Indianapolis+Conference+Center&destination=Ford's+Garage+13193+Levinson+Ln+Noblesville+IN",img.diningFord],
                ["Chuy's","Tex-Mex","Hamilton Town Center","A lively option for tacos, enchiladas, fajitas, burritos, and plenty of shareable favorites.","https://www.google.com/maps/dir/?api=1&origin=Embassy+Suites+Noblesville+Indianapolis+Conference+Center&destination=Chuy's+14150+Town+Center+Blvd+Noblesville+IN",img.diningChuy],
                ["Pies & Pints","Pizza · Casual","Hamilton Town Center","Pizza and casual lunch fare in an easygoing setting near the hotel.","https://www.google.com/maps/dir/?api=1&origin=Embassy+Suites+Noblesville+Indianapolis+Conference+Center&destination=Pies+%26+Pints+Noblesville+IN",img.diningPiesPints],
                ["Koto Japanese Steakhouse","Japanese · Sushi · Hibachi","Near the hotel","Saturday lunch begins at noon, with sushi, hibachi, bento-style choices, and Japanese favorites.","https://www.google.com/maps/dir/?api=1&origin=Embassy+Suites+Noblesville+Indianapolis+Conference+Center&destination=Koto+Japanese+Steakhouse+13398+Tegler+Dr+Noblesville+IN",img.diningKoto],
              ].map(([name,cuisine,area,copy,url,image])=>(
                <article className="restaurantCard" key={name}>
                  {image ? <div className="restaurantImage"><img src={image} alt={`${name} dining experience`} loading="lazy"/></div> : <div className="restaurantImage restaurantImage--placeholder"><span>Pies & Pints</span></div>}
                  <div className="restaurantCardBody">
                  <p className="restaurantMeta">{cuisine}</p>
                  <h4>{name}</h4>
                  <span className="restaurantArea">{area}</span>
                  <p>{copy}</p>
                  <a href={url} target="_blank" rel="noreferrer">DIRECTIONS →</a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="diningCategory diningCategory--split">
            <div>
              <div className="diningCategoryHead"><span>03</span><div><h3>Quick & Easy</h3><p>Good when you want to maximize your free afternoon.</p></div></div>
              <article className="restaurantCard restaurantCard--wide">
                <div className="restaurantImage"><img src={img.diningMcalisters} alt="McAlister's Deli dining experience" loading="lazy"/></div>
                <div className="restaurantCardBody">
                <p className="restaurantMeta">Deli · Sandwiches · Salads</p>
                <h4>McAlister's Deli</h4>
                <span className="restaurantArea">Hamilton Town Center</span>
                <p>Sandwiches, soups, salads, baked potatoes, and quick counter-service lunch options.</p>
                <a href="https://www.google.com/maps/dir/?api=1&origin=Embassy+Suites+Noblesville+Indianapolis+Conference+Center&destination=McAlister's+Deli+14191+Town+Center+Blvd+Noblesville+IN" target="_blank" rel="noreferrer">DIRECTIONS →</a>
                </div>
              </article>
            </div>
            <div>
              <div className="diningCategoryHead"><span>04</span><div><h3>Something Sweet</h3><p>A simple stop before heading back to the hotel.</p></div></div>
              <article className="restaurantCard restaurantCard--wide">
                <div className="restaurantImage"><img src={img.diningHandels} alt="Handel's Homemade Ice Cream" loading="lazy"/></div>
                <div className="restaurantCardBody">
                <p className="restaurantMeta">Ice Cream · Dessert</p>
                <h4>Handel's Homemade Ice Cream</h4>
                <span className="restaurantArea">Cabela Parkway · Nearby</span>
                <p>Fresh-made ice cream with a large rotating flavor selection—an easy sweet finish to couple time.</p>
                <a href="https://www.google.com/maps/dir/?api=1&origin=Embassy+Suites+Noblesville+Indianapolis+Conference+Center&destination=Handel's+Homemade+Ice+Cream+14165+Cabela+Pkwy+Noblesville+IN" target="_blank" rel="noreferrer">DIRECTIONS →</a>
                </div>
              </article>
            </div>
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

        <NextStepCards />

        <section id="stay-updated" className="homepageInterest">
          <div className="homepageInterestCopy">
            <p className="eyebrow gold">STAY UPDATED</p>
            <h2>Not ready to register yet?</h2>
            <p>Join the interest list for retreat updates, speaker announcements, important dates, and special messages. No commitment and no registration required.</p>
          </div>
          <StayUpdatedForm/>
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
