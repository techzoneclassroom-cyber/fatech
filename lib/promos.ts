import "server-only";
import { unstable_cache } from "next/cache";
import { isDbConfigured, supabaseRead } from "@/lib/supabase/server";

// Cached so the static pages that show the banner stay static between rebuilds.
export const getActivePromo = unstable_cache(
  async (): Promise<{ message: string; href: string } | null> => {
    if (!isDbConfigured) return null;
    try {
      const { data } = await supabaseRead()
        .from("promotions")
        .select("message,href")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data ?? null;
    } catch {
      return null;
    }
  },
  ["active-promo"],
  { revalidate: 60 },
);
