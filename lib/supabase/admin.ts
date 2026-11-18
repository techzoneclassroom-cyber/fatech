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

export type StaffRole = "admin" | "staff";

type User = { id: string; email?: string | null; app_metadata?: Record<string, unknown> } | null | undefined;

// Role lives in app_metadata: users cannot edit it from the browser.
export function roleOf(user: User): StaffRole | null {
  const role = user?.app_metadata?.role;
  return role === "admin" || role === "staff" ? role : null;
}

// Admins can hand a coworker parts of the dashboard; admins always have all of them.
export type Perm = "products" | "orders" | "promotions" | "reviews" | "settings";
export const PERMS: { key: Perm; label: string }[] = [
  { key: "products", label: "Products and import" },
  { key: "orders", label: "Orders" },
  { key: "promotions", label: "Promotions" },
  { key: "reviews", label: "Ratings" },
  { key: "settings", label: "Shop settings" },
];
const DEFAULT_STAFF_PERMS: Perm[] = ["products", "orders", "promotions", "reviews"];

export function permsOf(user: User): Perm[] {
  if (roleOf(user) === "admin") return PERMS.map((p) => p.key);
  const raw = user?.app_metadata?.perms;
  // Staff created before permissions existed keep the classic shop-only access.
  if (!Array.isArray(raw)) return DEFAULT_STAFF_PERMS;
  return raw.filter((p): p is Perm => PERMS.some((x) => x.key === p));
}

export const can = (user: User, perm: Perm) => permsOf(user).includes(perm);

// Middleware gates /admin pages, but every write re-checks the signed-in user and role.
export async function requireAdmin() {
  if (!isAdminConfigured) throw new Error("Database is not configured.");
  const { data } = await (await supabaseServer()).auth.getUser();
  if (!data.user) throw new Error("Not signed in.");
  if (!roleOf(data.user)) throw new Error("This account has no dashboard role. Ask an admin to set one.");
  return data.user;
}

export async function requirePerm(perm: Perm) {
  const user = await requireAdmin();
  if (!can(user, perm)) throw new Error(`This account cannot manage ${perm}. Ask an admin.`);
  return user;
}

// Account management is admin-only, so a staff account cannot promote itself.
export async function requireOwner() {
  const user = await requireAdmin();
  if (roleOf(user) !== "admin") throw new Error("Only an admin can manage accounts.");
  return user;
}
