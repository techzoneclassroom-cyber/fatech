import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// The storefront falls back to lib/catalogue.ts while Supabase isn't set up.
export const isDbConfigured = Boolean(url && key);

// Cookie-backed client, used for reading the signed-in admin. Never import in a client component.
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(url!, key!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server components cannot set cookies; middleware refreshes the session instead.
        }
      },
    },
  });
}

// Stateless client for public catalogue reads (RLS allows selecting active products only).
export function supabaseRead() {
  return createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } });
}
