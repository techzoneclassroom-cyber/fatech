"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { waLink } from "@/lib/site";
import { useContact } from "@/components/contact-provider";

type Msg = { from: "you" | "fa"; text: string; href?: string; label?: string };
type Lang = "en" | "tw" | "fr" | "es";

const LANGS: [Lang, string][] = [["en", "English"], ["tw", "Twi"], ["fr", "Français"], ["es", "Español"]];

const UI: Record<Lang, { hello: string; chips: string[]; fail: string }> = {
  en: {
    hello: "Hello! Ask me about a product price, delivery, warranty, our location, or an order (send the order number with the phone you used).",
    chips: ["Laptop prices", "Delivery", "Warranty", "Order status"],
    fail: "I could not reach the shop. Check your connection or use WhatsApp.",
  },
  tw: {
    hello: "Akwaaba! Bisa me biribi fa biribi boɔ, ɔkwan a yɛfa so de ba, warranty, baabi a yɛwɔ, anaa order (fa order nɔma ne phone a wode dii dwuma no bra).",
    chips: ["Laptop boɔ", "Delivery", "Warranty", "Order tebea"],
    fail: "Mantumi nkɔ shop no so. Hwɛ wo intanɛt, anaa fa WhatsApp di dwuma.",
  },
  fr: {
    hello: "Bonjour ! Posez-moi une question sur le prix d'un produit, la livraison, la garantie, notre adresse ou une commande (indiquez le numéro de commande et le téléphone utilisé).",
    chips: ["Prix des portables", "Livraison", "Garantie", "Suivi de commande"],
    fail: "Je n'ai pas pu joindre la boutique. Vérifiez votre connexion ou utilisez WhatsApp.",
  },
  es: {
    hello: "¡Hola! Pregúntame por el precio de un producto, la entrega, la garantía, nuestra ubicación o un pedido (envía el número de pedido y el teléfono que usaste).",
    chips: ["Precios de portátiles", "Entrega", "Garantía", "Estado del pedido"],
    fail: "No pude comunicarme con la tienda. Revisa tu conexión o usa WhatsApp.",
  },
};

export function Assistant() {
  const path = usePathname();
  const contact = useContact();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang | null>(null);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [msgs, open]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  // The dashboard has its own tools; no floating chat there.
  if (path.startsWith("/admin")) return null;
  const wa = waLink(contact.whatsapp[0].intl, "Hello F.A TECHNOLOGIES, I have a question about the shop.");
  const ui = UI[lang ?? "en"];

  const pick = (id: Lang) => {
    setLang(id);
    setMsgs([{ from: "fa", text: UI[id].hello }]);
  };

  const send = async (text: string) => {
    const message = text.trim().slice(0, 500);
    if (!message || busy) return;
    setInput("");
    setMsgs((m) => [...m, { from: "you", text: message }]);
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, lang: lang ?? undefined }),
      });
      const data = await res.json().catch(() => ({}));
      const reply = res.ok ? data : { text: data.error ?? ui.fail };
      setMsgs((m) => [...m, { from: "fa", text: reply.text, href: reply.href, label: reply.label }]);
    } catch {
      setMsgs((m) => [...m, { from: "fa", text: ui.fail }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className="assist-fab no-print" aria-expanded={open} aria-controls="assist-panel" aria-label={open ? "Close assistant" : "Ask F.A"} onClick={() => setOpen(!open)}>
        Ask F.A
      </button>

      {open && (
        <section id="assist-panel" className="assist-panel no-print" role="dialog" aria-label="Shop assistant">
          <header className="assist-head">
            <span><b>F.A assistant</b><small>Prices, delivery, orders</small></span>
            {lang && (
              <button type="button" className="assist-chip" onClick={() => setLang(null)} aria-label="Change language">
                {lang.toUpperCase()}
              </button>
            )}
            <button type="button" className="btn btn--sm" onClick={() => setOpen(false)} aria-label="Close assistant">Close</button>
          </header>

          {!lang ? (
            <div className="assist-log">
              <p className="assist-msg assist-msg--fa">Choose your language:</p>
              <div className="assist-chips">
                {LANGS.map(([id, label]) => (
                  <button key={id} type="button" className="assist-chip" onClick={() => pick(id)}>{label}</button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="assist-log" ref={log} aria-live="polite">
                {msgs.map((m, i) => (
                  <p key={i} className={`assist-msg assist-msg--${m.from}`}>
                    {m.text}
                    {m.href && (
                      <a href={m.href} className="assist-link">{m.label ?? "Open"}</a>
                    )}
                  </p>
                ))}
                {busy && <p className="assist-msg assist-msg--fa assist-typing">…</p>}
              </div>

              <div className="assist-chips">
                {ui.chips.map((c) => (
                  <button key={c} type="button" className="assist-chip" onClick={() => send(c)} disabled={busy}>{c}</button>
                ))}
              </div>

              <form
                className="assist-form"
                onSubmit={(e) => { e.preventDefault(); send(input); }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={500}
                  aria-label="Your question"
                  placeholder="Ask about a product or order…"
                />
                <button className="btn btn--dark btn--sm" type="submit" disabled={busy || !input.trim()}>Send</button>
              </form>

              <a className="assist-wa" href={wa} target="_blank" rel="noopener noreferrer">
                Prefer a person? Chat on WhatsApp ({contact.whatsapp[0].label})
              </a>
            </>
          )}
        </section>
      )}
    </>
  );
}
