import "server-only";
import { unstable_cache } from "next/cache";
import { isDbConfigured, supabaseRead } from "@/lib/supabase/server";
import { contactFromRow, DEFAULT_CONTACT, type Contact, type SettingsRow } from "./contact";

// Cached like the promo banner so static pages are not forced dynamic.
export const CONTACT_TAG = "site-contact";

export const getContact = unstable_cache(
  async (): Promise<Contact> => {
    if (!isDbConfigured) return DEFAULT_CONTACT;
    try {
      const { data } = await supabaseRead().from("site_settings").select("*").eq("id", 1).maybeSingle();
      return contactFromRow((data as SettingsRow | null) ?? null);
    } catch {
      return DEFAULT_CONTACT;
    }
  },
  ["site-contact"],
  { revalidate: 60, tags: [CONTACT_TAG] },
);
