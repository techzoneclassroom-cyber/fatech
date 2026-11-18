"use server";

import { isAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import { isDbConfigured, supabaseServer } from "@/lib/supabase/server";

export type PlacedOrder = { ref: string; stored: boolean };

const localRef = () => `FA-LOCAL-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

// Saves the order so it can be printed as an invoice/receipt. Never blocks the
// WhatsApp message: if the database is down or unconfigured, the sale still goes out.
export async function placeOrder(input: {
  name: string;
  phone: string;
  town: string;
  notes: string;
  items: { slug: string; name: string; price: number; qty: number }[];
}): Promise<PlacedOrder> {
  const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
  const name = text(input.name, 100);
  const phone = text(input.phone, 20);
  const town = text(input.town, 120);
  const notes = text(input.notes, 500);
  const items = (Array.isArray(input.items) ? input.items : [])
    .map((i) => ({
      slug: text(i.slug, 80),
      name: text(i.name, 120),
      qty: Math.min(50, Math.max(1, Math.floor(Number(i.qty) || 1))),
      price: Math.max(0, Math.round(Number(i.price) || 0)),
    }))
    .filter((i) => i.slug && i.name)
    .slice(0, 30);

  if (!items.length || name.length < 2 || phone.length < 7 || town.length < 2) return { ref: localRef(), stored: false };
  if (!isAdminConfigured) return { ref: localRef(), stored: false };

  try {
    // Re-price from the products table so a changed client price cannot move the stored total.
    const { data } = await supabaseAdmin()
      .from("products")
      .select("slug,price_pesewas")
      .in("slug", items.map((i) => i.slug));
    const prices = new Map((data ?? []).map((r) => [String(r.slug), Number(r.price_pesewas)]));
    const lines = items.map((i) => ({
      slug: i.slug,
      name: i.name,
      qty: i.qty,
      price_pesewas: prices.get(i.slug) ?? i.price,
    }));
    const total = lines.reduce((s, i) => s + i.price_pesewas * i.qty, 0);

    // Link the order to the signed-in customer, if any, so it appears in their history.
    let userId: string | null = null;
    if (isDbConfigured) {
      try {
        userId = (await (await supabaseServer()).auth.getUser()).data.user?.id ?? null;
      } catch {
        // No session: the order is saved as a guest order.
      }
    }
    const row: Record<string, unknown> = { customer_name: name, phone, town, notes, items: lines, total_pesewas: total };
    if (userId) row.user_id = userId;

    let { data: saved, error } = await supabaseAdmin()
      .from("orders")
      .insert(row)
      .select("ref")
      .single();
    // Before 006_accounts_reviews.sql runs there is no user_id column; still save the sale.
    if (error && userId) {
      delete row.user_id;
      ({ data: saved, error } = await supabaseAdmin().from("orders").insert(row).select("ref").single());
    }
    if (error || !saved) throw error ?? new Error("Order not saved.");
    return { ref: String(saved.ref), stored: true };
  } catch {
    return { ref: localRef(), stored: false };
  }
}
