import { NextResponse } from "next/server";
import { Resend } from "resend";
import { serviceClient } from "@/lib/server";
import { logAppEvent } from "@/lib/emailAudit";

export const runtime = "nodejs";

const trackedTypes = new Set([
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.bounced",
  "email.complained",
  "email.failed",
  "email.suppressed",
]);

function statusFromType(type:string){
  return type.replace("email.","");
}

export async function POST(request:Request){
  const secret=process.env.RESEND_WEBHOOK_SECRET;
  if(!secret){
    await logAppEvent({
      eventType:"resend_webhook_configuration_error",
      route:"/api/webhooks/resend",
      severity:"error",
      message:"RESEND_WEBHOOK_SECRET is not configured."
    });
    return new NextResponse("Webhook not configured",{status:503});
  }

  try{
    const payload=await request.text();
    const resend=new Resend(process.env.RESEND_API_KEY);
    const event:any=resend.webhooks.verify({
      payload,
      headers:{
        id:request.headers.get("svix-id")||"",
        timestamp:request.headers.get("svix-timestamp")||"",
        signature:request.headers.get("svix-signature")||"",
      },
      webhookSecret:secret,
    });

    if(!trackedTypes.has(event.type)){
      return NextResponse.json({ok:true});
    }

    const providerEmailId=String(event?.data?.email_id||"");
    const recipient=Array.isArray(event?.data?.to) ? String(event.data.to[0]||"") : null;
    const eventAt=event?.created_at||new Date().toISOString();
    const supabase=serviceClient();

    if(providerEmailId){
      const { error: eventError } = await supabase.from("email_delivery_events").upsert({
        provider_email_id:providerEmailId,
        event_type:event.type,
        recipient:recipient||"",
        event_at:eventAt,
        payload:event,
      }, {onConflict:"provider_email_id,event_type,event_at,recipient",ignoreDuplicates:true});
      if(eventError){
        console.error("Unable to save delivery event",eventError);
        return new NextResponse("Delivery event could not be saved",{status:503});
      }

      const deliveryStatus=statusFromType(event.type);
      const { error: updateError } = await supabase.from("email_communications").update({
        delivery_status:deliveryStatus,
        updated_at:new Date().toISOString(),
        ...(event.type==="email.failed"||event.type==="email.bounced"||event.type==="email.suppressed"
          ? {error_message:event?.data?.bounce?.message||event?.data?.error?.message||deliveryStatus}
          : {})
      }).eq("provider_email_id",providerEmailId);
      if(updateError){
        console.error("Unable to update delivery status",updateError);
        return new NextResponse("Delivery status could not be saved",{status:503});
      }

      if(["email.failed","email.bounced","email.suppressed","email.complained","email.delivery_delayed"].includes(event.type)){
        await logAppEvent({
          eventType:"email_delivery_issue",
          route:"/api/webhooks/resend",
          severity:event.type==="email.delivery_delayed"?"warning":"error",
          message:`Email provider reported ${deliveryStatus}.`,
          details:{providerEmailId,recipient,eventType:event.type}
        });
      }
    }

    return NextResponse.json({ok:true});
  }catch(error){
    console.error("Invalid Resend webhook",error);
    return new NextResponse("Invalid webhook",{status:400});
  }
}
