import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get("q") || "").trim();

  if (raw.length < 2) return NextResponse.json([]);

  const q = raw.replace(/[,%()]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  if (!q) return NextResponse.json([]);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Church directory is not configured." }, { status: 500 });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("churches")
    .select("id,name,location,state")
    .or(`name.ilike.%${q}%,location.ilike.%${q}%`)
    .order("name")
    .limit(12);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to search churches." }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
