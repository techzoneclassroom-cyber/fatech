import "server-only";
import { cache } from "react";
import { PRODUCTS, type Product } from "./catalogue";
import { isDbConfigured, supabaseRead } from "./supabase/server";

type Row = {
  slug: string;
  name: string;
  category: string;
  brand: string;
  price_pesewas: number;
  compare_at_pesewas: number | null;
  condition: Product["condition"];
  warranty: string;
  short: string;
  specs: unknown;
  image: string;
  images?: string[] | null;
  featured: boolean;
  verified: boolean;
};

const pair = (s: unknown): s is [string, string] =>
  Array.isArray(s) && s.length === 2 && s.every((v) => typeof v === "string");

const toProduct = (r: Row): Product => ({
  slug: r.slug,
  name: r.name,
  category: r.category,
  brand: r.brand,
  price: r.price_pesewas,
  was: r.compare_at_pesewas ?? undefined,
  condition: r.condition,
  warranty: r.warranty,
  short: r.short,
  specs: Array.isArray(r.specs) ? r.specs.filter(pair) : [],
  image: r.image,
  images: Array.isArray(r.images) ? r.images.filter((s) => typeof s === "string") : [],
  featured: r.featured,
  verified: r.verified,
});

// One query per request, shared by metadata and the page. Falls back until Supabase is configured.
export const getProducts = cache(async (): Promise<Product[]> => {
  if (!isDbConfigured) return PRODUCTS;

  const cols = "slug,name,category,brand,price_pesewas,compare_at_pesewas,condition,warranty,short,specs,image";
  const query = (select: string) => supabaseRead()
    .from("products")
    .select(select)
    .eq("active", true)
    .order("sort", { ascending: true })
    .order("name", { ascending: true });

  let { data, error } = await query(`${cols},images,featured,verified`);
  // Before 005_product_images.sql runs there is no images column; keep the shop working.
  if (error) ({ data, error } = await query(`${cols},featured,verified`));

  if (error) throw new Error(`Could not load products: ${error.message}`);
  return ((data ?? []) as unknown as Row[]).map(toProduct);
});

export async function getFeatured() {
  return (await getProducts()).filter((p) => p.featured).slice(0, 4);
}
