"use server";

import { redirect } from "next/navigation";
import { isDbConfigured, supabaseServer } from "@/lib/supabase/server";

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
