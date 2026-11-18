import { permsOf, supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { saveSettings } from "@/app/admin/actions";
import { DEFAULT_CONTACT, DEFAULT_AGENT, type SettingsRow } from "@/lib/contact";

export const dynamic = "force-dynamic";

const EMPTY: SettingsRow = {
  id: 1,
  phone: DEFAULT_CONTACT.phone,
  whatsapp1: DEFAULT_CONTACT.whatsapp[0].label,
  whatsapp2: DEFAULT_CONTACT.whatsapp[1].label,
  email: DEFAULT_CONTACT.email,
  location: DEFAULT_CONTACT.location,
  signatory: "",
  signature_url: "",
  agent_url: "",
};

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;

  const me = (await (await supabaseServer()).auth.getUser()).data.user;
  if (!permsOf(me).includes("settings")) {
    return (
      <>
        <h1 style={{ fontSize: "1.5rem", margin: "0 0 6px" }}>Shop settings</h1>
        <p className="notice" role="alert">Ask an admin for the Shop settings permission.</p>
      </>
    );
  }

  const { data, error: loadError } = await supabaseAdmin().from("site_settings").select("*").eq("id", 1).maybeSingle();
  const row = (data as SettingsRow | null) ?? EMPTY;

  return (
    <>
      <h1 style={{ fontSize: "1.5rem", margin: "0 0 6px" }}>Shop settings</h1>
      <p className="muted" style={{ margin: "0 0 18px", fontSize: 13.5, maxWidth: 640 }}>
        These details appear on the website, in WhatsApp links and on every invoice and receipt. Changes apply across the
        site immediately after saving.
      </p>

      {(error || loadError || saved) && (
        <p className="notice" role={error || loadError ? "alert" : "status"} style={{ marginBottom: 16 }}>
          {error ?? (loadError ? "Could not load the settings. Has supabase/migrations/004_settings.sql been run?" : "Settings saved.")}
        </p>
      )}

      <form action={saveSettings} className="form-card" style={{ maxWidth: 640 }}>
        <div className="field">
          <label htmlFor="phone">Shop phone</label>
          <input id="phone" name="phone" type="tel" inputMode="tel" required maxLength={16} defaultValue={row.phone} />
          <span className="hint">Shown in the header, contact page and documents. Example: 054 257 5486</span>
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="whatsapp1">WhatsApp number 1</label>
          <input id="whatsapp1" name="whatsapp1" type="tel" inputMode="tel" required maxLength={16} defaultValue={row.whatsapp1} />
          <span className="hint">Used for the first WhatsApp button, cart and enquiry forms.</span>
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="whatsapp2">WhatsApp number 2 <span className="hint">(optional)</span></label>
          <input id="whatsapp2" name="whatsapp2" type="tel" inputMode="tel" maxLength={16} defaultValue={row.whatsapp2} />
          <span className="hint">The alternative number offered on the cart and contact page.</span>
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required maxLength={120} defaultValue={row.email} />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="location">Town / address</label>
          <input id="location" name="location" required minLength={2} maxLength={120} defaultValue={row.location} />
        </div>

        <hr className="rule" style={{ margin: "20px 0 4px" }} />

        <p className="kicker" style={{ marginTop: 14 }}>Shop assistant</p>
        <div className="field" style={{ marginTop: 8 }}>
          <label htmlFor="agent">Assistant photo <span className="hint">(optional, PNG or JPG, under 2 MB)</span></label>
          <input id="agent" name="agent" type="file" accept="image/png,image/jpeg" />
          <img
            src={row.agent_url || DEFAULT_AGENT}
            alt="Current assistant photo"
            width={64}
            height={64}
            style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", marginTop: 10, display: "block", border: "2px solid var(--gold)" }}
          />
          <span className="hint">The round photo on the Ask F.A button and panel. Uploading a new file replaces the current one.</span>
        </div>

        <hr className="rule" style={{ margin: "20px 0 4px" }} />

        <p className="kicker" style={{ marginTop: 14 }}>Invoices and receipts</p>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
          <img src="/logo.png" alt="Shop logo shown on documents" width={54} height={54} style={{ height: 54, width: 54, objectFit: "contain", border: "1px solid var(--line)", borderRadius: 8, background: "#fff" }} />
          <p className="form-note" style={{ margin: 0 }}>
            The logo is the file <code>public/logo.png</code>. Replace that file to change it.
          </p>
        </div>

        <div className="field" style={{ marginTop: 14 }}>
          <label htmlFor="signatory">Signatory name <span className="hint">(optional)</span></label>
          <input id="signatory" name="signatory" maxLength={80} defaultValue={row.signatory} placeholder="e.g. Francis Amankwah, Managing Director" />
          <span className="hint">Printed under the signature line on invoices and receipts.</span>
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="signature">Signature image <span className="hint">(optional, PNG or JPG, under 2 MB)</span></label>
          <input id="signature" name="signature" type="file" accept="image/png,image/jpeg" />
          {row.signature_url && (
            <>
              <img src={row.signature_url} alt="Current signature" style={{ height: 46, width: "auto", marginTop: 10, display: "block" }} />
              <label className="hint" style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                <input type="checkbox" name="removeSignature" style={{ width: "auto" }} /> Remove the current signature
              </label>
            </>
          )}
          <span className="hint">Shown above the signature line. Uploading a new file replaces the current one.</span>
        </div>

        <button className="btn btn--dark btn--sm" type="submit" style={{ marginTop: 18 }}>Save settings</button>
      </form>
    </>
  );
}
