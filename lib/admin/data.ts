import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ProductRow } from "./validate";

export type AdminProduct = ProductRow & { id: string };

export const listProducts = cache(async (): Promise<AdminProduct[]> => {
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select("*")
    .order("sort", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminProduct[];
});

export const getProduct = cache(async (slug: string): Promise<AdminProduct | null> => {
  const { data, error } = await supabaseAdmin().from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as AdminProduct | null) ?? null;
});

export type OrderItem = { slug: string; name: string; qty: number; price_pesewas: number };
export type Order = {
  ref: string;
  created_at: string;
  customer_name: string;
  phone: string;
  town: string;
  notes: string;
  items: OrderItem[];
  total_pesewas: number;
  status: "new" | "confirmed" | "delivered" | "cancelled";
};

const line = (i: unknown): i is OrderItem =>
  Boolean(i) && typeof i === "object" && typeof (i as OrderItem).slug === "string" &&
  typeof (i as OrderItem).qty === "number" && typeof (i as OrderItem).price_pesewas === "number";

const toOrder = (r: Record<string, unknown>): Order => ({
  ref: String(r.ref),
  created_at: String(r.created_at),
  customer_name: String(r.customer_name),
  phone: String(r.phone),
  town: String(r.town),
  notes: String(r.notes ?? ""),
  items: Array.isArray(r.items) ? r.items.filter(line) : [],
  total_pesewas: Number(r.total_pesewas) || 0,
  status: (r.status as Order["status"]) ?? "new",
});

export async function listOrders(): Promise<Order[]> {
  const { data, error } = await supabaseAdmin().from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []).map(toOrder);
}

export async function getOrder(ref: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin().from("orders").select("*").eq("ref", ref).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toOrder(data) : null;
}

export type Promotion = { id: string; message: string; href: string; active: boolean };

export async function listPromotions(): Promise<Promotion[]> {
  const { data, error } = await supabaseAdmin().from("promotions").select("id,message,href,active").order("created_at", { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  return (data ?? []) as Promotion[];
}
