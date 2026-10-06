import { NextResponse } from "next/server";
import { authorizedAdmin, getCommunicationDashboard } from "@/lib/adminCommunications";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    if (!await authorizedAdmin()) return NextResponse.json({error:"Not authorized."}, {status:401});
    const id = new URL(request.url).searchParams.get("registrationId") || undefined;
    if (id && !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({error:"Invalid registration."}, {status:400});
    return NextResponse.json(await getCommunicationDashboard(id), {headers:{"Cache-Control":"private, no-store"}});
  } catch (error) {
    console.error("Communication dashboard unavailable", error);
    return NextResponse.json({error:"Communication records could not be loaded. Refresh to try again; no delivery status has been assumed."}, {status:503});
  }
}
