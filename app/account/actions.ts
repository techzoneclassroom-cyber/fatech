"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isDbConfigured, supabaseServer } from "@/lib/supabase/server";
import { isAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";

export async function signUpCustomer(formData: FormData) {
  if (!isDbConfigured) redirect("/account/signup?error=config");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) redirect("/account/signup?error=email");
  if (password.length < 8) redirect("/account/signup?error=password");

  let error: string | null = null;
  let signedIn = false;
  try {
    const { data, error: authError } = await (await supabaseServer()).auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/account` },
    });
    if (authError) error = authError.message;
    signedIn = Boolean(data.session);
  } catch {
    error = "Could not reach the account service. Try again.";
  }
  if (error) redirect(`/account/signup?error=${encodeURIComponent(error)}`);
  // Email confirmation may be required: tell the customer instead of failing silently.
  if (!signedIn) redirect("/account/signup?sent=1");
  redirect("/account");
}

export async function signInCustomer(formData: FormData) {
  if (!isDbConfigured) redirect("/account/login?error=config");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/account/login?error=missing");

  let failed = true;
  try {
    failed = Boolean((await (await supabaseServer()).auth.signInWithPassword({ email, password })).error);
  } catch {
    // Network failure counts as a failed sign-in.
  }
  if (failed) redirect("/account/login?error=invalid");
  redirect("/account");
}

export async function signOutCustomer() {
  if (isDbConfigured) await (await supabaseServer()).auth.signOut();
  redirect("/account/login");
}

export async function rateProduct(formData: FormData) {
  if (!isDbConfigured || !isAdminConfigured) redirect("/account?error=config");
  const { data } = await (await supabaseServer()).auth.getUser();
  const user = data.user;
  if (!user) redirect("/account/login");

  const ref = String(formData.get("ref") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const rating = Math.round(Number(formData.get("rating") ?? 0));
  if (!ref || !slug || rating < 1 || rating > 5) redirect("/account?error=Pick 1 to 5 stars.");

  // Only the buyer of a delivered order may rate, and only a product on that order.
  const { data: order } = await supabaseAdmin()
    .from("orders")
    .select("ref,status,items")
    .eq("ref", ref)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!order) redirect("/account?error=That order is not on this account.");
  if (order.status !== "delivered") redirect("/account?error=You can rate after the order is marked delivered.");
  const items = Array.isArray(order.items) ? order.items : [];
  if (!items.some((i: { slug?: string }) => i?.slug === slug)) redirect("/account?error=That product is not on this order.");

  const { error } = await supabaseAdmin().from("reviews").insert({ product_slug: slug, user_id: user.id, order_ref: ref, rating });
  if (error) {
    redirect(`/account?error=${encodeURIComponent(error.code === "23505" ? "You already rated this product on this order." : error.message)}`);
  }
  revalidatePath(`/product/${slug}`);
  revalidatePath("/account");
  redirect("/account?rated=1");
}
