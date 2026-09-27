import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import RegistrantAccess from "@/components/RegistrantAccess";

export const metadata={title:"Manage Registration & Payments | Once Upon a Covenant"};

export default function ManagePage(){
  return <main className="formPage">
    <header className="formTopbar">
      <Link className="formBrand" href="/" aria-label="Once Upon a Covenant home"><BrandMark compact /></Link>
      <Link className="formHomeLink" href="/">RETURN TO EXPERIENCE</Link>
    </header>
    <section className="simpleHero">
      <p className="eyebrow gold">REGISTRATION & PAYMENTS</p>
      <h1>Welcome Back</h1>
      <p>View your balance, payment history, and make another payment securely.</p>
    </section>
    <div className="manageShell"><RegistrantAccess/></div>
  </main>
}
