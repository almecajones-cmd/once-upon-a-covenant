import { NextResponse } from "next/server";
import { Resend } from "resend";
import { normalizeEmail, serviceClient } from "@/lib/server";

export async function POST(request:Request){
  try{
    const body=await request.json();
    const email=normalizeEmail(body.email);
    const firstName=String(body.firstName||"").trim().slice(0,80);
    const lastName=String(body.lastName||"").trim().slice(0,80);
    const source=String(body.source||"website").trim().slice(0,80);

    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      return NextResponse.json({error:"Enter a valid email address."},{status:400});
    }

    const supabase=serviceClient();
    const {error}=await supabase.from("interest_list").upsert({
      first_name:firstName||null,
      last_name:lastName||null,
      email,
      source
    },{onConflict:"email",ignoreDuplicates:false});

    if(error) throw error;

    if(process.env.RESEND_API_KEY){
      const resend=new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from:"Once Upon a Covenant <registration@onceuponacovenant.org>",
        to:email,
        replyTo:"marriagebydesignministry@myeccoc.com",
        subject:"You’re on the Once Upon a Covenant update list",
        html:
          '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#2d2430">' +
          '<h1 style="color:#54143d">Once Upon a Covenant</h1>' +
          '<p>Thank you' + (firstName ? ', ' + firstName : '') + '! We’ll keep you updated about the 2027 Midwest Marriage Retreat, including important dates and special announcements.</p>' +
          '<p>October 8–10, 2027<br>Embassy Suites Noblesville Indianapolis Conference Center</p></div>'
      });
    }

    return NextResponse.json({ok:true});
  }catch(error){
    console.error(error);
    return NextResponse.json({error:"Unable to add to the update list."},{status:500});
  }
}
