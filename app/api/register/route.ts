import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { serviceClient } from "@/lib/server";

function clean(v:unknown){return typeof v==="string"?v.trim():""}
const allowedMethods=new Set(["pushpay","zelle","check","money_order"]);

export async function POST(request:Request){
  try{
    const b=await request.json();
    const required=["relationshipStatus","husbandFirstName","husbandLastName","husbandEmail","husbandPhone","wifeFirstName","wifeLastName","wifeEmail","wifePhone","addressLine1","city","state","postalCode","churchAffiliationType","paymentChoice","paymentMethod"];
    if(required.some(k=>!clean(b[k])) || b.noChildrenAcknowledged!==true || b.depositPolicyAcknowledged!==true){
      return NextResponse.json({error:"Please complete all required fields and acknowledgements."},{status:400});
    }

    const churchType=clean(b.churchAffiliationType);
    const churchId=clean(b.churchId);
    const churchNameOther=clean(b.churchNameOther);
    const parsedChurchId=/^\d+$/.test(churchId)?Number(churchId):null;
    if(churchType==="midwest_church_of_christ"&&!parsedChurchId&&!churchNameOther){
      return NextResponse.json({error:"Please select or enter a congregation."},{status:400});
    }

    const method=clean(b.paymentMethod);
    if(!allowedMethods.has(method)) return NextResponse.json({error:"Choose a valid payment method."},{status:400});

    const choice=clean(b.paymentChoice);
    let amountCents=choice==="deposit"?10000:choice==="full"?60000:Math.round(Number(b.paymentAmount)*100);
    if(!Number.isFinite(amountCents)||amountCents<10000||amountCents>60000){
      return NextResponse.json({error:"The initial payment must be between $100 and $600."},{status:400});
    }

    const husbandEmail=clean(b.husbandEmail).toLowerCase();
    const wifeEmail=clean(b.wifeEmail).toLowerCase();
    const supabase=serviceClient();

    const [{data:dupH},{data:dupW}]=await Promise.all([
      supabase.from("registrations").select("id,confirmation_code").in("husband_email",[husbandEmail,wifeEmail]).neq("registration_status","cancelled").limit(1),
      supabase.from("registrations").select("id,confirmation_code").in("wife_email",[husbandEmail,wifeEmail]).neq("registration_status","cancelled").limit(1),
    ]);
    if((dupH&&dupH.length)||(dupW&&dupW.length)){
      return NextResponse.json({error:"possible_duplicate",manageUrl:"/manage"},{status:409});
    }

    const confirmationCode="OUC-"+crypto.randomUUID().slice(0,8).toUpperCase();
    const extraNights=["Wednesday","Thursday","Sunday","Monday"].filter(n=>b["extra"+n]===true).map(n=>n.toLowerCase());

    const {data:registration,error}=await supabase.from("registrations").insert({
      confirmation_code:confirmationCode,
      relationship_status:clean(b.relationshipStatus),
      husband_first_name:clean(b.husbandFirstName),husband_last_name:clean(b.husbandLastName),husband_email:husbandEmail,husband_phone:clean(b.husbandPhone),
      wife_first_name:clean(b.wifeFirstName),wife_last_name:clean(b.wifeLastName),wife_email:wifeEmail,wife_phone:clean(b.wifePhone),
      address_line1:clean(b.addressLine1),address_line2:clean(b.addressLine2)||null,city:clean(b.city),state:clean(b.state),postal_code:clean(b.postalCode),
      wedding_anniversary:clean(b.relationshipStatus)==="married"?clean(b.weddingAnniversary)||null:null,
      church_affiliation_type:churchType,church_id:parsedChurchId,church_name_other:churchNameOther||null,
      referred_by:clean(b.referredBy)||null,how_heard:clean(b.howHeard)||null,
      dietary_restrictions:clean(b.dietaryRestrictions)||null,accessibility_needs:clean(b.accessibilityNeeds)||null,accessible_room_requested:b.accessibleRoomRequested===true,
      extra_nights:extraNights,no_children_acknowledged:true,deposit_policy_acknowledged:true,
      source:"website",utm_source:clean(b.utmSource)||null,utm_medium:clean(b.utmMedium)||null,utm_campaign:clean(b.utmCampaign)||null,
      payment_status:"pending_verification",registration_status:"pending_payment_verification"
    }).select("id").single();
    if(error||!registration){
      console.error("Registration insert failed",error);
      if(error?.code==="23503"&&String(error.message||"").includes("church")){
        return NextResponse.json({error:"The selected congregation is no longer available in the directory. Please go back to Retreat Needs, search for your congregation again, and reselect it."},{status:400});
      }
      throw error||new Error("Unable to create registration");
    }

    const clientReference=randomUUID();
    const {error:paymentError}=await supabase.from("payments").insert({
      registration_id:registration.id,amount_cents:amountCents,method,status:"pending_verification",
      client_reference:clientReference,payment_date:new Date().toISOString().slice(0,10)
    });
    if(paymentError){
      await supabase.from("registrations").delete().eq("id",registration.id);
      throw paymentError;
    }

    if(process.env.RESEND_API_KEY){
      const resend=new Resend(process.env.RESEND_API_KEY);
      const amountText="$"+(amountCents/100).toFixed(2);
      const paymentInstructionsHtml=method==="pushpay"
        ? `<div style="padding:16px;border:1px solid #d6b56d;background:#fffaf0"><p><strong>Complete your PushPay payment</strong></p><p>We recorded ${amountText} as your selected payment. Open PushPay, enter the same amount, choose <strong>Give one time</strong>, and confirm the fund is <strong>2027 Midwest Marriage Retreat</strong>.</p><p><a href="https://ppay.co/mJyvth1Pp-Y" style="display:inline-block;padding:12px 18px;background:#54143d;color:white;text-decoration:none;font-weight:bold">CONTINUE TO PUSHPAY</a></p></div>`
        : method==="zelle"
        ? `<div style="padding:16px;border:1px solid #d6b56d;background:#fffaf0"><p><strong>Complete your Zelle payment</strong></p><p>Send ${amountText} to <strong>mbankhead@myeccoc.com</strong>. The retreat finance team will match and verify the payment before your balance and registration status update.</p></div>`
        : `<div style="padding:16px;border:1px solid #d6b56d;background:#fffaf0"><p><strong>Mail your ${method==="check"?"check":"money order"}</strong></p><p>Make it payable to <strong>Eagle Creek Church of Christ</strong> with <strong>Midwest Marriage Retreat</strong> in the memo line.</p><p>Eagle Creek Church of Christ<br>c/o 2027 Midwest Marriage Retreat<br>3025 W. 69th Street<br>Indianapolis, IN 46268</p><p>Checks must clear before verification. Checks are not accepted after August 31, 2027.</p></div>`;
      await resend.emails.send({
        from:"Once Upon a Covenant <registration@onceuponacovenant.org>",
        to:[husbandEmail,wifeEmail],
        replyTo:"marriagebydesignministry@myeccoc.com",
        subject:"We received your 2027 retreat registration",
        html:`<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#2d2430"><h1 style="color:#54143d">Once Upon a Covenant</h1><p>Thank you for registering for the 2027 Midwest Marriage Retreat.</p><p><strong>Registration reference:</strong> ${confirmationCode}</p><p><strong>Registration status:</strong> Pending payment verification</p><p><strong>Payment selected:</strong> $${(amountCents/100).toFixed(2)} by ${method.replace("_"," ")}</p><p>Your registration and hotel room are not secured until at least the $100 non-refundable deposit is received and verified.</p>${paymentInstructionsHtml}<p>Total registration is $600 per couple. You may make additional payments at any time up to the remaining balance.</p><p><a href="https://onceuponacovenant.org/manage">Manage registration and payments</a></p><p>October 8–10, 2027<br>Embassy Suites Noblesville Indianapolis Conference Center</p></div>`
      });
      await resend.emails.send({
        from:"Once Upon a Covenant <registration@onceuponacovenant.org>",
        to:"marriagebydesignministry@myeccoc.com",
        replyTo:husbandEmail,
        subject:`New retreat registration: ${clean(b.husbandFirstName)} & ${clean(b.wifeFirstName)}`,
        text:`New registration received.\nReference: ${confirmationCode}\nPayment selected: $${(amountCents/100).toFixed(2)} via ${method}.\nStatus: Pending payment verification.`
      });
    }

    return NextResponse.json({
      confirmationCode,amountCents,paymentMethod:method,
      pushPayUrl:method==="pushpay"?"https://ppay.co/mJyvth1Pp-Y":null
    });
  }catch(e){
    console.error(e);
    return NextResponse.json({error:"Unable to create registration. Please try again or contact the retreat team."},{status:500});
  }
}
