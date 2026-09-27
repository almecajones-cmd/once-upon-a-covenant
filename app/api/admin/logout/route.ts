import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hashValue, serviceClient } from "@/lib/server";

export async function POST() {
  const store = await cookies();
  const token = store.get("ouc_admin")?.value;
  if (token) await serviceClient().from("admin_sessions").delete().eq("token_hash", hashValue(token));
  store.delete("ouc_admin");
  return NextResponse.json({ ok: true });
}
