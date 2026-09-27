import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hashValue, serviceClient } from "@/lib/server";

export async function POST() {
  const store = await cookies();
  const token = store.get("ouc_registrant")?.value;
  if (token) await serviceClient().from("registrant_sessions").delete().eq("token_hash", hashValue(token));
  store.delete("ouc_registrant");
  return NextResponse.json({ ok: true });
}
