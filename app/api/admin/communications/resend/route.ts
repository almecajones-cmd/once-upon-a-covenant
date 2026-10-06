import { NextResponse } from "next/server";
import { authorizedAdmin } from "@/lib/adminCommunications";
import { serviceClient } from "@/lib/server";
import { confirmationEmail } from "@/lib/confirmationEmail";
import { sendTrackedEmail, logAppEvent } from "@/lib/emailAudit";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const admin = await authorizedAdmin();
    if (!admin) return NextResponse.json({error:"Not authorized."}, {status:401});
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return NextResponse.json({error:"Invalid request origin."}, {status:403});
    if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({error:"JSON required."}, {status:415});
    const {registrationId, requestId} = await request.json();
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuid.test(registrationId || "") || !uuid.test(requestId || "")) return NextResponse.json({error:"Invalid registration or request."}, {status:400});
    const db = serviceClient();
    const {data:registration,error:readError} = await db.from("admin_registration_summary").select("id,confirmation_code,registration_status,husband_first_name,husband_last_name,wife_first_name,wife_last_name,verified_paid_cents,balance_cents").eq("id",registrationId).maybeSingle();
    if (readError) throw readError;
    if (!registration) return NextResponse.json({error:"Registration not found."}, {status:404});
    const {data:claim,error} = await db.rpc("claim_confirmation_resend", {p_registration_id:registrationId,p_request_id:requestId,p_actor:admin.email});
    if (error) throw error;
    if (!claim?.claimed) {
      const messages: Record<string,string> = {
        cooldown:"A confirmation was attempted within the last minute. Wait, then refresh its status before sending again.",
        already_processed:"This request was already recorded. Refresh the communication history before trying again.",
        inactive:"Confirmations cannot be resent for cancelled, refunded, or transferred registrations.",
        invalid_email:"Verify the saved attendee email addresses before resending.",
        recipient_blocked:"A recipient has a recorded bounce, suppression, or spam complaint. Resolve the address or suppression with the retreat email administrator before resending.",
      };
      return NextResponse.json({error:messages[claim?.reason] || "Unable to resend this confirmation."}, {status:409});
    }
    const content = confirmationEmail(registration);
    const result = await sendTrackedEmail({purpose:"registration_confirmation",registrationId,to:claim.recipients,
      replyTo:"marriagebydesignministry@myeccoc.com",...content,auditId:requestId,
      metadata:{resent_by:admin.email,source:"admin_resend"}});
    await logAppEvent({eventType:result.ok?"confirmation_resend_accepted":"confirmation_resend_failed",
      registrationId,route:"/api/admin/communications/resend",severity:result.ok?"info":"error",
      details:{admin_email:admin.email,communication_id:requestId,provider_email_id:result.id}});
    if (!result.ok) return NextResponse.json({error:"The confirmation could not be confirmed as sent. Review the communication history before retrying."}, {status:502});
    return NextResponse.json({ok:true,providerEmailId:result.id,message:"Confirmation accepted for sending. Delivery status will update when the provider reports it."});
  } catch (error) {
    console.error("Confirmation resend unavailable", error);
    return NextResponse.json({error:"Unable to complete the resend request. Refresh the communication history before retrying."}, {status:503});
  }
}
