import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function clean(v:unknown){return typeof v==="string"?v.trim():""}

export async function POST(request:Request){
  try{
    const b=await request.json();
    const required=["relationshipStatus","husbandFirstName","husbandLastName","husbandEmail","husbandPhone","wifeFirstName","wifeLastName","wifeEmail","wifePhone","addressLine1","city","state","postalCode","churchAffiliationType"];
    if(required.some(k=>!clean(b[k])) || b.noChildrenAcknowledged!=="true" || b.depositPolicyAcknowledged!=="true"){
      return NextResponse.json({error:"Missing required fields"},{status:400});
    }

    const churchType=clean(b.churchAffiliationType);
    const churchId=clean(b.churchId);
    const churchNameOther=clean(b.churchNameOther);

    if(churchType==="midwest_church_of_christ" && !churchId && !churchNameOther){
      return NextResponse.json({error:"Please select or enter a congregation."},{status:400});
    }

    const confirmationCode="OUC-"+crypto.randomUUID().slice(0,8).toUpperCase();
    const extraNights=["Wednesday","Thursday","Sunday","Monday"].filter(n=>b["extra"+n]==="true").map(n=>n.toLowerCase());

    const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SECRET_KEY!,{auth:{persistSession:false}});

    if(churchId){
      const {data:church,error:churchError}=await supabase.from("churches").select("id").eq("id",Number(churchId)).maybeSingle();
      if(churchError || !church){
        return NextResponse.json({error:"The selected congregation could not be verified. Please search again."},{status:400});
      }
    }

    const {error}=await supabase.from("registrations").insert({
      confirmation_code:confirmationCode,
      relationship_status:clean(b.relationshipStatus),
      husband_first_name:clean(b.husbandFirstName),husband_last_name:clean(b.husbandLastName),husband_email:clean(b.husbandEmail).toLowerCase(),husband_phone:clean(b.husbandPhone),
      wife_first_name:clean(b.wifeFirstName),wife_last_name:clean(b.wifeLastName),wife_email:clean(b.wifeEmail).toLowerCase(),wife_phone:clean(b.wifePhone),
      address_line1:clean(b.addressLine1),address_line2:clean(b.addressLine2)||null,city:clean(b.city),state:clean(b.state),postal_code:clean(b.postalCode),
      wedding_anniversary:clean(b.relationshipStatus)==="married" ? clean(b.weddingAnniversary)||null : null,
      church_affiliation_type:churchType,
      church_id:churchId ? Number(churchId) : null,
      church_name_other:churchNameOther||null,
      referred_by:clean(b.referredBy)||null,
      dietary_restrictions:clean(b.dietaryRestrictions)||null,accessibility_needs:clean(b.accessibilityNeeds)||null,accessible_room_requested:b.accessibleRoomRequested==="true",
      extra_nights:extraNights,no_children_acknowledged:true,deposit_policy_acknowledged:true,
      source:"website",payment_status:"unpaid",registration_status:"pending_payment_verification"
    });
    if(error) throw error;

    if(process.env.RESEND_API_KEY){
      const resend=new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from:"Once Upon a Covenant <registration@onceuponacovenant.org>",
        to:[clean(b.husbandEmail),clean(b.wifeEmail)],
        replyTo:"marriagebydesignministry@myeccoc.com",
        subject:"We received your 2027 retreat registration",
        html:`<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#2d2430"><h1 style="color:#54143d">Once Upon a Covenant</h1><p>Thank you for registering for the 2027 Midwest Marriage Retreat.</p><p><strong>Registration reference:</strong> ${confirmationCode}</p><p><strong>Registration status:</strong> Pending payment verification</p><p>Your registration will be confirmed after the $100 non-refundable deposit has been received and verified.</p><p>Total registration is $600 per couple. You may make any amount toward the remaining balance.</p><p><a href="https://onceuponacovenant.org/pay">View payment options</a></p><p>October 8–10, 2027<br>Embassy Suites Noblesville Indianapolis Conference Center</p></div>`
      });
    }

    return NextResponse.json({confirmationCode});
  }catch(e){
    console.error(e);
    return NextResponse.json({error:"Unable to create registration"},{status:500});
  }
}
