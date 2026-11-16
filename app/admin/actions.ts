"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDbConfigured, supabaseServer } from "@/lib/supabase/server";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase/admin";
import { productRow, type Fields } from "@/lib/admin/validate";

export async function signIn(formData: FormData) {
  if (!isDbConfigured) redirect("/admin/login?error=config");

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/admin/login?error=missing");

  let failed = true;
  try {
    failed = Boolean((await (await supabaseServer()).auth.signInWithPassword({ email, password })).error);
  } catch {
    // Network failure counts as a failed sign-in.
  }
  if (failed) redirect("/admin/login?error=invalid");

  redirect("/admin");
}

export async function signOut() {
  if (isDbConfigured) await (await supabaseServer()).auth.signOut();
  redirect("/admin/login");
}

const FIELDS = ["slug", "name", "category", "brand", "price", "compare_at", "condition", "warranty", "short", "specs", "image", "sort"];

const shopPaths = () => {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
};

export async function saveProduct(formData: FormData) {
  await requireAdmin();

  const fields = Object.fromEntries(FIELDS.map((k) => [k, String(formData.get(k) ?? "")])) as Fields;
  fields.featured = formData.has("featured") ? "yes" : "no";
  fields.active = formData.has("active") ? "yes" : "no";
  if (!fields.image.trim()) fields.image = "/images/cat-it.webp";

  const first = productRow(fields);
  if (!first.row) redirect(`/admin/products?error=${encodeURIComponent(first.error)}`);

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > 5 * 1024 * 1024) redirect("/admin/products?error=Photo must be under 5 MB.");
    const ext = (photo.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 4) || "jpg";
    const path = `${first.row.slug}-${Date.now()}.${ext}`;
    const { error } = await supabaseAdmin()
      .storage.from("product-images")
      .upload(path, photo, { contentType: photo.type || "image/jpeg", upsert: false });
    if (error) redirect(`/admin/products?error=${encodeURIComponent(`Photo upload failed: ${error.message}`)}`);
    fields.image = supabaseAdmin().storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  const { row } = productRow(fields);
  if (!row) redirect("/admin/products?error=Invalid product.");

  const { error } = await supabaseAdmin()
    .from("products")
    .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: "slug" });
  if (error) redirect(`/admin/products?error=${encodeURIComponent(error.message)}`);

  shopPaths();
  redirect(`/admin/products?saved=${row.slug}`);
}

export async function importProducts(rows: Fields[]) {
  await requireAdmin();
  if (!Array.isArray(rows) || !rows.length || rows.length > 500) return { saved: 0, skipped: 0, errors: ["Nothing to import."] };

  const good: Record<string, unknown>[] = [];
  const errors: string[] = [];
  for (const f of rows) {
    const { row, error } = productRow(f);
    if (row) good.push({ ...row, updated_at: new Date().toISOString() });
    else errors.push(`${f.name || f.slug || "row"}: ${error}`);
  }

  if (good.length) {
    const { error } = await supabaseAdmin().from("products").upsert(good, { onConflict: "slug" });
    if (error) return { saved: 0, skipped: rows.length, errors: [error.message] };
    shopPaths();
  }
  return { saved: good.length, skipped: rows.length - good.length, errors: errors.slice(0, 12) };
}

const STATUSES = ["new", "confirmed", "delivered", "cancelled"];

export async function setOrderStatus(formData: FormData) {
  await requireAdmin();
  const ref = String(formData.get("ref") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!ref || !STATUSES.includes(status)) redirect("/admin/orders?error=Invalid status.");
  const { error } = await supabaseAdmin()
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("ref", ref);
  if (error) redirect(`/admin/orders/${ref}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/admin/orders/${ref}`);
  revalidatePath("/admin/orders");
}

export async function savePromotion(formData: FormData) {
  await requireAdmin();
  const message = String(formData.get("message") ?? "").trim();
  const raw = String(formData.get("href") ?? "").trim() || "/shop";
  const href = raw.startsWith("/") ? raw.slice(0, 200) : "/shop";
  if (message.length < 2 || message.length > 200) redirect("/admin/promotions?error=Message must be 2–200 characters.");

  const { error } = await supabaseAdmin().from("promotions").insert({ message, href });
  if (error) redirect(`/admin/promotions?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/promotions");
}

export async function togglePromotion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  await supabaseAdmin().from("promotions").update({ active: !active }).eq("id", id);
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/promotions");
}

export async function deletePromotion(formData: FormData) {
  await requireAdmin();
  await supabaseAdmin().from("promotions").delete().eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/promotions");
}
