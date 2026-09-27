import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import ContactForm from "@/components/ContactForm";

export const metadata={title:"Contact | Once Upon a Covenant"};

export default function Contact(){
  return <main className="formPage">
    <header className="formTopbar">
      <Link className="formBrand" href="/" aria-label="Once Upon a Covenant home"><BrandMark compact /></Link>
      <Link className="formHomeLink" href="/">RETURN TO EXPERIENCE</Link>
    </header>
    <div className="formIntro">
      <p className="eyebrow plum">CONTACT US</p>
      <h1>How can we help?</h1>
      <p>Send a message to the 2027 Midwest Marriage Retreat team.</p>
    </div>
    <ContactForm/>
  </main>
}
