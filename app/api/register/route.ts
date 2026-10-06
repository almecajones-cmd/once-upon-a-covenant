import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server";
import { logAppEvent, sendTrackedEmail } from "@/lib/emailAudit";

function clean(v:unknown){return typeof v==="string"?v.trim():""}
const allowedMethods=new Set(["pushpay","zelle","check","money_order"]);

export async function POST(request:Request){
  let registrationId:string|null=null;
  try{
    const b=await request.json();
    const required=["relationshipStatus","husbandFirstName","husbandLastName","husbandEmail","husbandPhone","wifeFirstName","wifeLastName","wifeEmail","wifePhone","addressLine1","city","state","postalCode","churchAffiliationType","paymentChoice","paymentMethod"];
    if(required.some(k=>!clean(b[k])) || b.noChildrenAcknowledged!==true || b.depositPolicyAcknowledged!==true){
      return NextResponse.json({error:"Please complete all required fields and acknowledgements."},{status:400});
    }

    if(clean(b.relationshipStatus)!=="married"){
      return NextResponse.json({error:"The 2027 Midwest Marriage Retreat is available to married couples only."},{status:400});
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
    const amountCents=choice==="deposit"?10000:choice==="full"?60000:Math.round(Number(b.paymentAmount)*100);
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
      relationship_status:"married",
      husband_first_name:clean(b.husbandFirstName),husband_last_name:clean(b.husbandLastName),husband_email:husbandEmail,husband_phone:clean(b.husbandPhone),
      wife_first_name:clean(b.wifeFirstName),wife_last_name:clean(b.wifeLastName),wife_email:wifeEmail,wife_phone:clean(b.wifePhone),
      address_line1:clean(b.addressLine1),address_line2:clean(b.addressLine2)||null,city:clean(b.city),state:clean(b.state),postal_code:clean(b.postalCode),
      wedding_anniversary:clean(b.weddingAnniversary)||null,
      church_affiliation_type:churchType,church_id:parsedChurchId,church_name_other:churchNameOther||null,
      referred_by:clean(b.referredBy)||null,how_heard:clean(b.howHeard)||null,
      dietary_restrictions:clean(b.dietaryRestrictions)||null,accessibility_needs:clean(b.accessibilityNeeds)||null,accessible_room_requested:b.accessibleRoomRequested===true,
      extra_nights:extraNights,no_children_acknowledged:true,deposit_policy_acknowledged:true,
      source:"website",utm_source:clean(b.utmSource)||null,utm_medium:clean(b.utmMedium)||null,utm_campaign:clean(b.utmCampaign)||null,
      payment_status:"pending_verification",registration_status:"pending_payment_verification"
    }).select("id").single();

    if(error||!registration){
      await logAppEvent({
        eventType:"registration_insert_failed",
        route:"/api/register",
        severity:"error",
        message:error?.message||"Unable to create registration",
        details:{code:error?.code||null}
      });
      if(error?.code==="23503"&&String(error.message||"").includes("church")){
        return NextResponse.json({error:"The selected congregation is no longer available in the directory. Please go back to Retreat Needs, search for your congregation again, and reselect it."},{status:400});
      }
      throw error||new Error("Unable to create registration");
    }
    registrationId=registration.id;

    const clientReference=randomUUID();
    const {error:paymentError}=await supabase.from("payments").insert({
      registration_id:registration.id,amount_cents:amountCents,method,status:"pending_verification",
      client_reference:clientReference,payment_date:new Date().toISOString().slice(0,10)
    });

    if(paymentError){
      await logAppEvent({
        eventType:"initial_payment_record_failed",
        route:"/api/register",
        registrationId:registration.id,
        severity:"error",
        message:paymentError.message,
        details:{code:paymentError.code||null}
      });
      await supabase.from("registrations").delete().eq("id",registration.id);
      registrationId=null;
      throw paymentError;
    }

    await logAppEvent({
      eventType:"registration_saved",
      route:"/api/register",
      registrationId:registration.id,
      message:"Registration and initial payment record saved.",
      details:{confirmationCode,paymentMethod:method,amountCents}
    });

    const amountText="$"+(amountCents/100).toFixed(2);
    const paymentInstructionsHtml=method==="pushpay"
      ? `<div style="padding:16px;border:1px solid #d6b56d;background:#fffaf0"><p><strong>Complete your PushPay payment</strong></p><p>We recorded ${amountText} as your selected payment. Open PushPay, enter the same amount, choose <strong>Give one time</strong>, and confirm the fund is <strong>2027 Midwest Marriage Retreat</strong>.</p><p><a href="https://ppay.co/mJyvth1Pp-Y" style="display:inline-block;padding:12px 18px;background:#54143d;color:white;text-decoration:none;font-weight:bold">CONTINUE TO PUSHPAY</a></p></div>`
      : method==="zelle"
      ? `<div style="padding:16px;border:1px solid #d6b56d;background:#fffaf0"><p><strong>Complete your Zelle payment</strong></p><p>Send ${amountText} to <strong>mbankhead@myeccoc.com</strong>. The retreat finance team will match and verify the payment before your balance and registration status update.</p></div>`
      : `<div style="padding:16px;border:1px solid #d6b56d;background:#fffaf0"><p><strong>Mail your ${method==="check"?"check":"money order"}</strong></p><p>Make it payable to <strong>Eagle Creek Church of Christ</strong> with <strong>Midwest Marriage Retreat</strong> in the memo line.</p><p>Eagle Creek Church of Christ<br>c/o 2027 Midwest Marriage Retreat<br>3025 W. 69th Street<br>Indianapolis, IN 46268</p><p>Checks must clear before verification. Checks are not accepted after August 31, 2027.</p></div>`;

    const attendeeEmail=await sendTrackedEmail({
      purpose:"registration_confirmation",
      registrationId:registration.id,
      to:[husbandEmail,wifeEmail],
      replyTo:"marriagebydesignministry@myeccoc.com",
      subject:"We received your 2027 retreat registration",
      metadata:{confirmationCode},
      html:`<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#2d2430"><h1 style="color:#54143d">Once Upon a Covenant</h1><p>Thank you for registering for the 2027 Midwest Marriage Retreat.</p><p><strong>Registration reference:</strong> ${confirmationCode}</p><p><strong>Registration status:</strong> Pending payment verification</p><p><strong>Payment selected:</strong> $${(amountCents/100).toFixed(2)} by ${method.replace("_"," ")}</p><p>Your registration and hotel room are not secured until at least the $100 non-refundable deposit is received and verified.</p>${paymentInstructionsHtml}<p>Total registration is $600 per couple. You may make additional payments at any time up to the remaining balance.</p><p><a href="https://onceuponacovenant.org/manage">Manage registration and payments</a></p><p>October 8–10, 2027<br>Embassy Suites Noblesville Indianapolis Conference Center</p></div>`
    });

    const committeeEmail=await sendTrackedEmail({
      purpose:"registration_team_notification",
      registrationId:registration.id,
      to:"marriagebydesignministry@myeccoc.com",
      replyTo:husbandEmail,
      subject:`New retreat registration: ${clean(b.husbandFirstName)} & ${clean(b.wifeFirstName)}`,
      metadata:{confirmationCode},
      text:`New registration received.\nReference: ${confirmationCode}\nPayment selected: $${(amountCents/100).toFixed(2)} via ${method}.\nStatus: Pending payment verification.`
    });

    if(!attendeeEmail.ok || !committeeEmail.ok){
      await logAppEvent({
        eventType:"registration_email_issue",
        route:"/api/register",
        registrationId:registration.id,
        severity:"warning",
        message:"Registration saved, but one or more confirmation emails were not accepted by the email provider.",
        details:{
          attendeeAccepted:attendeeEmail.ok,
          committeeAccepted:committeeEmail.ok
        }
      });
    }

    return NextResponse.json({
      confirmationCode,amountCents,paymentMethod:method,
      emailAccepted:attendeeEmail.ok,
      pushPayUrl:method==="pushpay"?"https://ppay.co/mJyvth1Pp-Y":null
    });
  }catch(e){
    console.error(e);
    await logAppEvent({
      eventType:"registration_request_failed",
      route:"/api/register",
      registrationId,
      severity:"error",
      message:e instanceof Error?e.message:"Unknown registration error"
    });
    return NextResponse.json({error:"Unable to create registration. Please try again or contact the retreat team."},{status:500});
  }
}
