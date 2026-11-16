import { NextResponse } from "next/server";
import { isDbConfigured, supabaseRead } from "@/lib/supabase/server";

// Hit daily: a few database requests a day stop the Supabase free project pausing after a week idle.
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDbConfigured) return NextResponse.json({ ok: true, db: "not-configured" });

  const { error } = await supabaseRead().from("products").select("slug", { count: "exact", head: true });
  return NextResponse.json(
    { ok: !error, db: error ? "error" : "ok" },
    { status: error ? 503 : 200 },
  );
}
