import "server-only";
import { cache } from "react";
import { isDbConfigured, supabaseRead } from "./supabase/server";

export type ProductRatings = { count: number; avg: number; latest: { rating: number; created_at: string }[] };

// Visible ratings only: the public policy hides the rest. Missing table means the
// migration has not run yet, so the shop simply shows no ratings.
export const getProductRatings = cache(async (slug: string): Promise<ProductRatings> => {
  const empty: ProductRatings = { count: 0, avg: 0, latest: [] };
  if (!isDbConfigured) return empty;
  try {
    const { data, error } = await supabaseRead()
      .from("reviews")
      .select("rating,created_at")
      .eq("product_slug", slug)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) return empty;
    const rows = (data ?? []) as { rating: number; created_at: string }[];
    return {
      count: rows.length,
      avg: rows.length ? rows.reduce((s, r) => s + r.rating, 0) / rows.length : 0,
      latest: rows.slice(0, 5),
    };
  } catch {
    return empty;
  }
});
