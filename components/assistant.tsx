"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { waLink } from "@/lib/site";
import { useContact } from "@/components/contact-provider";

type Msg = { from: "you" | "fa"; text: string; href?: string; label?: string };
type Lang = "en" | "tw" | "fr" | "es";

const LANGS: [Lang, string][] = [["en", "English"], ["tw", "Twi"], ["fr", "Français"], ["es", "Español"]];

// Browser voices: Twi (ak-GH) is rare, so the device's default voice reads it.
const SPOKEN: Record<Lang, string> = { en: "en-GB", tw: "ak-GH", fr: "fr-FR", es: "es-ES" };
const FEMALE = /female|woman|zira|hazel|susan|samantha|karen|moira|tessa|fiona|serena|amelie|julie|monica|paulina|helena/i;

// Prefer a Ghanaian/African English voice, then a female one, for a calm tone.
const pickVoice = (voices: SpeechSynthesisVoice[], l: Lang) => {
  const african = voices.find((v) => /^en[-_](GH|NG|KE|ZA|TZ|UG)/i.test(v.lang));
  const akan = voices.find((v) => /^ak/i.test(v.lang));
  const same = voices.filter((v) => v.lang.toLowerCase().startsWith(SPOKEN[l].slice(0, 2)));
  if (l === "tw") return akan ?? african ?? same[0] ?? null;
  if (l === "en") return african ?? same.find((v) => FEMALE.test(v.name)) ?? same[0] ?? null;
  return same.find((v) => FEMALE.test(v.name)) ?? same[0] ?? null;
};

// Language-native voices via our own /api/tts (Google TTS; it has no Twi voice).
const ttsUrl = (text: string, l: Lang) => `/api/tts?lang=${l}&text=${encodeURIComponent(text)}`;

// Google TTS rejects requests over ~200 chars.
const chunks = (text: string, max = 180) => {
  const out: string[] = [];
  for (const w of text.split(/\s+/)) {
    const last = out.length - 1;
    if (last >= 0 && out[last].length + w.length + 1 <= max) out[last] += " " + w;
    else out.push(w);
  }
  return out;
};

// SpeechRecognition is still missing from the DOM types, so only the bits we use are typed.
type Rec = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (e: { results: { 0: { 0: { transcript: string } } } }) => void;
  onend: () => void;
  onerror: () => void;
  start(): void;
  stop(): void;
};
const speechIn = () => {
  const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

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
  const [canSpeak, setCanSpeak] = useState(false);
  const [canHear, setCanHear] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const log = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const queue = useRef<string[]>([]);
  const rec = useRef<Rec | null>(null);
  const voiceAsk = useRef(false);

  const stop = () => {
    queue.current = [];
    audio.current?.pause();
    window.speechSynthesis?.cancel();
    rec.current?.stop();
  };

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [msgs, open]);

  useEffect(() => {
    if (!open) {
      stop();
      return;
    }
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  useEffect(() => setCanSpeak("speechSynthesis" in window), []);
  useEffect(() => setCanHear(Boolean(speechIn())), []);

  // The dashboard has its own tools; no floating chat there.
  if (path.startsWith("/admin")) return null;
  const wa = waLink(contact.whatsapp[0].intl, "Hello F.A TECHNOLOGIES, I have a question about the shop.");
  const ui = UI[lang ?? "en"];

  const pick = (id: Lang) => {
    stop();
    setLang(id);
    setMsgs([{ from: "fa", text: UI[id].hello }]);
  };

  const speakLocal = (text: string) => {
    if (!canSpeak) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const l = lang ?? "en";
    u.lang = SPOKEN[l];
    u.rate = 0.95; // calm pace
    const v = pickVoice(synth.getVoices(), l);
    if (v) u.voice = v;
    synth.speak(u);
  };

  const next = () => {
    const part = queue.current.shift();
    if (!part) return;
    const a = (audio.current ??= new Audio());
    a.src = ttsUrl(part, lang ?? "en");
    a.play().catch(() => {
      const rest = [part, ...queue.current].join(" ");
      queue.current = [];
      speakLocal(rest); // offline or rate-limited: fall back to the device voice
    });
  };

  const speak = (text: string) => {
    stop();
    if ((lang ?? "en") === "tw") return speakLocal(text);
    queue.current = chunks(text);
    const a = (audio.current ??= new Audio());
    a.onended = next;
    next();
  };

  const send = async (text: string) => {
    const message = text.trim().slice(0, 500);
    if (!message || busy) return;
    const heard = voiceAsk.current; // asked by voice: read the answer back
    voiceAsk.current = false;
    setInput("");
    setMsgs((m) => [...m, { from: "you", text: message }]);
    setBusy(true);
    let said = "";
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, lang: lang ?? undefined }),
      });
      const data = await res.json().catch(() => ({}));
      const reply = res.ok ? data : { text: data.error ?? ui.fail };
      setMsgs((m) => [...m, { from: "fa", text: reply.text, href: reply.href, label: reply.label }]);
      said = reply.text;
    } catch {
      setMsgs((m) => [...m, { from: "fa", text: ui.fail }]);
      said = ui.fail;
    } finally {
      setBusy(false);
    }
    if (heard && said) speak(said);
  };

  const listen = () => {
    if (rec.current) {
      rec.current.stop();
      return;
    }
    const Ctor = speechIn();
    if (!Ctor || busy) return;
    stop(); // the mic must not hear the agent reading aloud
    const r = new Ctor();
    r.lang = SPOKEN[lang ?? "en"];
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      const said = e.results[0][0].transcript.trim();
      if (said) {
        voiceAsk.current = true;
        send(said);
      }
    };
    const done = () => {
      if (rec.current !== r) return; // a newer attempt already took over
      rec.current = null;
      setMicOn(false);
    };
    r.onend = done;
    r.onerror = done;
    rec.current = r;
    setMicOn(true);
    r.start();
  };

  return (
    <>
      <button type="button" className="assist-fab no-print" aria-expanded={open} aria-controls="assist-panel" aria-label={open ? "Close assistant" : "Ask F.A"} onClick={() => setOpen(!open)}>
        <img className="assist-avatar" src="/agent.webp" alt="" width={30} height={30} />
        Ask F.A
      </button>

      {open && (
        <section id="assist-panel" className="assist-panel no-print" role="dialog" aria-label="Shop assistant">
          <header className="assist-head">
            <span className="assist-id">
              <img className="assist-avatar" src="/agent.webp" alt="" width={40} height={40} />
              <span><b>F.A assistant</b><small>Prices, delivery, orders</small></span>
            </span>
            {lang && (
              <button type="button" className="assist-chip" onClick={() => { setLang(null); stop(); }} aria-label="Change language">
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
                    {m.from === "fa" && (
                      <button type="button" className="assist-read" onClick={() => speak(m.text)} aria-label="Read this answer aloud">Listen</button>
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
                {canHear && (
                  <button
                    type="button"
                    className="assist-mic"
                    aria-pressed={micOn}
                    aria-label={micOn ? "Stop listening" : "Speak your question"}
                    title={micOn ? "Stop listening" : "Speak your question"}
                    onClick={listen}
                    disabled={busy}
                  >
                    {micOn ? (
                      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <rect x="9" y="2.5" width="6" height="11.5" rx="3" />
                        <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
                        <path d="M12 17.5V21" />
                      </svg>
                    )}
                  </button>
                )}
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
