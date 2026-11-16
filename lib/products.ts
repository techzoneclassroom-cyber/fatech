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
  featured: boolean;
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
  featured: r.featured,
});

// One query per request, shared by metadata and the page. Falls back until Supabase is configured.
export const getProducts = cache(async (): Promise<Product[]> => {
  if (!isDbConfigured) return PRODUCTS;

  const { data, error } = await supabaseRead()
    .from("products")
    .select("slug,name,category,brand,price_pesewas,compare_at_pesewas,condition,warranty,short,specs,image,featured")
    .eq("active", true)
    .order("sort", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(`Could not load products: ${error.message}`);
  return (data ?? []).map(toProduct);
});

export async function getFeatured() {
  return (await getProducts()).filter((p) => p.featured).slice(0, 4);
}
