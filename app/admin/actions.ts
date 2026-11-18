"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { isDbConfigured, supabaseServer } from "@/lib/supabase/server";
import { requirePerm, requireOwner, supabaseAdmin, PERMS, type Perm } from "@/lib/supabase/admin";
import { CONTACT_TAG } from "@/lib/contact-server";
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

const FIELDS = ["slug", "name", "category", "brand", "price", "compare_at", "condition", "warranty", "short", "specs", "image", "images", "sort", "verified"];

const shopPaths = () => {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/product/[slug]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  revalidatePath("/admin/products");
};

export async function saveProduct(formData: FormData) {
  await requirePerm("products");

  const fields = Object.fromEntries(FIELDS.map((k) => [k, String(formData.get(k) ?? "")])) as Fields;
  fields.featured = formData.has("featured") ? "yes" : "no";
  fields.active = formData.has("active") ? "yes" : "no";
  // Editing keeps the original slug so links and old orders never point at a fork.
  const original = String(formData.get("original") ?? "").trim();
  if (original) fields.slug = original;

  const first = productRow(fields);
  if (!first.row) redirect(`/admin/products?error=${encodeURIComponent(first.error)}`);

  if (!original) {
    const { data: clash } = await supabaseAdmin().from("products").select("slug").eq("slug", first.row.slug).maybeSingle();
    if (clash) redirect(`/admin/products?error=${encodeURIComponent("That slug is already used. Edit the existing product instead.")}`);
  }

  // Photos kept from the saved product (unchecked ones are deleted) plus new uploads, five at most.
  let current: string[] = [];
  if (original) {
    const { data } = await supabaseAdmin().from("products").select("images").eq("slug", original).maybeSingle();
    current = Array.isArray(data?.images) ? data.images.filter((u: unknown): u is string => typeof u === "string") : [];
  }
  const keep = formData.getAll("keep").map(String).filter((u) => current.includes(u));
  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (keep.length + photos.length > 5) redirect("/admin/products?error=Upload at most 5 photos per product.");

  const urls: string[] = [];
  if (photos.length) {
    if (photos.some((p) => p.size > 5 * 1024 * 1024)) redirect("/admin/products?error=Each photo must be under 5 MB.");
    for (const photo of photos) {
      const ext = (photo.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 4) || "jpg";
      const path = `${first.row.slug}-${Date.now()}-${urls.length}.${ext}`;
      const { error } = await supabaseAdmin()
        .storage.from("product-images")
        .upload(path, photo, { contentType: photo.type || "image/jpeg", upsert: false });
      if (error) redirect(`/admin/products?error=${encodeURIComponent(`Photo upload failed: ${error.message}`)}`);
      urls.push(supabaseAdmin().storage.from("product-images").getPublicUrl(path).data.publicUrl);
    }
  }

  const images = [...keep, ...urls];
  // The typed main image wins unless it was deleted or nothing is left; a product's first photo is its main image.
  if (!images.length) {
    fields.image = "";
  } else if (!fields.image || !current.length || (current.includes(fields.image) && !keep.includes(fields.image))) {
    fields.image = images[0];
  }
  fields.images = images.join("\n");

  const { row } = productRow(fields);
  if (!row) redirect("/admin/products?error=Invalid product.");

  const { error } = await supabaseAdmin()
    .from("products")
    .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: "slug" });
  if (error) redirect(`/admin/products?error=${encodeURIComponent(error.message)}`);

  // Drop the blobs of removed photos only after the row no longer points at them;
  // files outside the product-images bucket are only unlinked.
  const removed = current.filter((u) => !keep.includes(u)).map((u) => u.split("/product-images/")[1]).filter(Boolean);
  if (removed.length) await supabaseAdmin().storage.from("product-images").remove(removed);

  shopPaths();
  redirect(`/admin/products?saved=${row.slug}`);
}

export async function importProducts(rows: Fields[]) {
  await requirePerm("products");
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
  await requirePerm("orders");
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

export async function deleteOrder(formData: FormData) {
  await requirePerm("orders");
  const ref = String(formData.get("ref") ?? "");
  if (!ref) redirect("/admin/orders?error=Missing order.");
  const { data, error } = await supabaseAdmin().from("orders").delete().eq("ref", ref).select("ref");
  if (error) redirect(`/admin/orders/${ref}?error=${encodeURIComponent(error.message)}`);
  if (!data?.length) redirect(`/admin/orders/${ref}?error=That order no longer exists.`);
  revalidatePath("/admin/orders");
  redirect(`/admin/orders?deleted=${encodeURIComponent(ref)}`);
}

export async function savePromotion(formData: FormData) {
  await requirePerm("promotions");
  const message = String(formData.get("message") ?? "").trim();
  const raw = String(formData.get("href") ?? "").trim() || "/shop";
  const href = raw.startsWith("/") ? raw.slice(0, 200) : "/shop";
  if (message.length < 2 || message.length > 200) redirect("/admin/promotions?error=Message must be 2–200 characters.");

  const { error } = await supabaseAdmin().from("promotions").insert({ message, href });
  if (error) redirect(`/admin/promotions?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/promotions");
  redirect("/admin/promotions?saved=1");
}

export async function togglePromotion(formData: FormData) {
  await requirePerm("promotions");
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  const { error } = await supabaseAdmin().from("promotions").update({ active: !active }).eq("id", id);
  if (error) redirect(`/admin/promotions?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/promotions");
}

export async function deletePromotion(formData: FormData) {
  await requirePerm("promotions");
  const { error } = await supabaseAdmin().from("promotions").delete().eq("id", String(formData.get("id") ?? ""));
  if (error) redirect(`/admin/promotions?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/promotions");
}

const ROLES = ["admin", "staff"];

// Only areas that exist, and staff must keep at least one; admins hold all of them anyway.
const pickedPerms = (formData: FormData): Perm[] =>
  formData.getAll("perm").map(String).filter((p): p is Perm => PERMS.some((x) => x.key === p));

const PHONE = /^[0-9+][0-9 +]{8,14}$/;

export async function saveSettings(formData: FormData) {
  await requirePerm("settings");
  const phone = String(formData.get("phone") ?? "").trim();
  const whatsapp1 = String(formData.get("whatsapp1") ?? "").trim();
  const whatsapp2 = String(formData.get("whatsapp2") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const signatory = String(formData.get("signatory") ?? "").trim();

  if (!PHONE.test(phone)) redirect("/admin/settings?error=Enter the shop phone as 054 000 0000.");
  if (!PHONE.test(whatsapp1)) redirect("/admin/settings?error=Enter the first WhatsApp number as 054 000 0000.");
  if (whatsapp2 && !PHONE.test(whatsapp2)) redirect("/admin/settings?error=Enter the second WhatsApp number as 054 000 0000, or leave it empty.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) redirect("/admin/settings?error=Enter a valid email address.");
  if (location.length < 2 || location.length > 120) redirect("/admin/settings?error=The town / address must be 2–120 characters.");
  if (signatory.length > 80) redirect("/admin/settings?error=The signatory name must be 80 characters or fewer.");

  const patch: Record<string, unknown> = {
    phone,
    whatsapp1,
    whatsapp2,
    email,
    location,
    signatory,
    updated_at: new Date().toISOString(),
  };
  if (formData.get("removeSignature")) patch.signature_url = "";

  const image = formData.get("signature");
  if (image instanceof File && image.size > 0) {
    if (image.size > 2 * 1024 * 1024) redirect("/admin/settings?error=The signature image must be under 2 MB.");
    if (!image.type.startsWith("image/")) redirect("/admin/settings?error=The signature must be a PNG or JPG image.");
    const ext = (image.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 4) || "png";
    const path = `signature-${Date.now()}.${ext}`;
    const { error } = await supabaseAdmin()
      .storage.from("product-images")
      .upload(path, image, { contentType: image.type || "image/png", upsert: false });
    if (error) redirect(`/admin/settings?error=${encodeURIComponent(`Signature upload failed: ${error.message}`)}`);
    patch.signature_url = supabaseAdmin().storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabaseAdmin().from("site_settings").upsert({ id: 1, ...patch }, { onConflict: "id" });
  if (error) redirect(`/admin/settings?error=${encodeURIComponent(error.message)}`);

  // The contact is cached across the site; refresh it now rather than after 60 seconds.
  revalidateTag(CONTACT_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}

export async function createCoworker(formData: FormData) {
  await requireOwner();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "");
  const perms = pickedPerms(formData);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) redirect("/admin/team?error=Enter a valid email address.");
  if (password.length < 8) redirect("/admin/team?error=Password must be at least 8 characters.");
  if (!ROLES.includes(role)) redirect("/admin/team?error=Pick a role.");
  if (role === "staff" && !perms.length) redirect("/admin/team?error=Tick at least one thing a staff account can do.");

  const { error } = await supabaseAdmin().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: role === "admin" ? { role } : { role, perms },
  });
  if (error) redirect(`/admin/team?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/team");
  redirect(`/admin/team?saved=${encodeURIComponent(email)}`);
}

export async function setCoworkerRole(formData: FormData) {
  const me = await requireOwner();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  const perms = pickedPerms(formData);
  if (!id) redirect("/admin/team?error=Missing account.");
  if (!ROLES.includes(role)) redirect("/admin/team?error=Pick a role.");
  if (id === me.id) redirect("/admin/team?error=You cannot change your own role.");
  if (role === "staff" && !perms.length) redirect("/admin/team?error=Tick at least one thing a staff account can do.");
  const { error } = await supabaseAdmin().auth.admin.updateUserById(id, {
    app_metadata: role === "admin" ? { role } : { role, perms },
  });
  if (error) redirect(`/admin/team?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/team");
  redirect("/admin/team?saved=1");
}
