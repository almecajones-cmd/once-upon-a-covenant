import Link from "next/link";
import AdminPortal from "@/components/AdminPortal";

export const metadata={title:"Retreat Administration | Once Upon a Covenant"};

export default function AdminPage(){
  return <main className="formPage adminPage">
    <header className="formTopbar">
      <Link className="formBrand" href="/" aria-label="Once Upon a Covenant home"><BrandMark compact /></Link>
      <span className="formHomeLink">2027 MWMR ADMIN</span>
    </header>
    <div className="adminShell"><AdminPortal/></div>
  </main>
}
