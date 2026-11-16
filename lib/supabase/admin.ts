import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "./server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Writes need the service-role key, which must stay server-only.
export const isAdminConfigured = Boolean(url && serviceKey);

export function supabaseAdmin() {
  if (!url || !serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Middleware gates /admin pages, but every write re-checks the signed-in user.
export async function requireAdmin() {
  if (!isAdminConfigured) throw new Error("Database is not configured.");
  const { data } = await (await supabaseServer()).auth.getUser();
  if (!data.user) throw new Error("Not signed in.");
  return data.user;
}
