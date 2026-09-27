import { createHash, randomBytes, randomInt } from "crypto";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase server environment variables are missing.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function oneTimeCode() {
  return String(randomInt(100000, 1000000));
}

export function sessionToken() {
  return randomBytes(32).toString("hex");
}

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function getRegistrantSession() {
  const store = await cookies();
  const raw = store.get("ouc_registrant")?.value;
  if (!raw) return null;
  const supabase = serviceClient();
  const { data } = await supabase
    .from("registrant_sessions")
    .select("registration_id,expires_at")
    .eq("token_hash", hashValue(raw))
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return data ?? null;
}

export async function getAdminSession() {
  const store = await cookies();
  const raw = store.get("ouc_admin")?.value;
  if (!raw) return null;
  const supabase = serviceClient();
  const { data } = await supabase
    .from("admin_sessions")
    .select("admin_email,expires_at")
    .eq("token_hash", hashValue(raw))
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return data ?? null;
}

export async function setRegistrantCookie(token: string) {
  const store = await cookies();
  store.set("ouc_registrant", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4,
  });
}

export async function setAdminCookie(token: string) {
  const store = await cookies();
  store.set("ouc_admin", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}
