import "server-only";
import { PRODUCTS, CATEGORIES, type Product } from "./catalogue";
import { getProducts } from "./products";
import { getContact } from "./contact-server";
import { isAdminConfigured, supabaseAdmin } from "./supabase/admin";
import { ghs } from "./site";

export type Reply = { text: string; href?: string; label?: string };

export type Lang = "en" | "fr" | "es" | "tw";
type Contact = Awaited<ReturnType<typeof getContact>>;
type Text = Record<string, string>;

const REF = /\bFA-\d{4}-\d{3,6}\b/i;
const STOP = new Set([
  "the", "and", "for", "you", "your", "have", "has", "does", "what", "how", "much", "price",
  "cost", "sell", "sale", "buy", "with", "about", "from", "any", "can", "are", "was", "will",
  "please", "want", "need", "this", "that", "there", "they", "them", "our", "shop", "store",
]);

const words = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((w) => w.length > 2 && !STOP.has(w));

// Short shop words the length filter would drop; category answers use them ("tv", "pc").
// "ac" is left out: it would prefix-match "accessories" and pick the wrong category.
// Item words in French/Spanish that should find the English catalogue entries.
const SYNONYMS: Record<string, string> = {
  imprimante: "printer", impresora: "printer", ordinateur: "computer", ordenador: "computer",
  "portátil": "laptop", portatil: "laptop", écran: "monitor", ecran: "monitor", pantalla: "monitor",
  clavier: "keyboard", teclado: "keyboard", souris: "mouse", "ratón": "mouse", raton: "mouse",
  télévision: "tv", television: "tv", televisor: "tv", télé: "tv",
  climatiseur: "conditioner", climatisation: "conditioner", acondicionado: "conditioner",
  "réfrigérateur": "fridge", refrigerateur: "fridge", frigo: "fridge", nevera: "fridge", refrigerador: "fridge",
  "micro-ondes": "microwave", microondas: "microwave", bouilloire: "kettle", hervidor: "kettle",
  "mixeur": "blender", batidora: "blender", licuadora: "blender", routeur: "router",
  "caméra": "camera", camara: "camera", "cámara": "camera", casque: "earbuds", auriculares: "earbuds",
  batterie: "power", "batería": "power", bateria: "power", "enceinte": "speaker", altavoz: "speaker",
};

const SHORT = ["tv", "pc", "hp", "ssd", "usb"];
const tokensIn = (message: string) => {
  const list = words(message);
  for (const w of [...list]) {
    const hit = [w, w.replace(/es$/, ""), w.replace(/s$/, "")].find((k) => SYNONYMS[k]);
    if (hit) list.push(SYNONYMS[hit]);
  }
  for (const s of SHORT) if (new RegExp(`\\b${s}\\b`).test(message.toLowerCase())) list.push(s);
  return list;
};

const has = (s: string, re: RegExp) => re.test(s.toLowerCase());
const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? "");

// Sentences the assistant says. Product names, specs and prices are catalogue data and stay as stored.
const TEXT: Record<Lang, Text> = {
  en: {
    hello: "Hello! Ask me about a product price, delivery, warranty, our location, or an order you placed.",
    welcome: "You are welcome. If you need anything else, message us on WhatsApp {wa}.",
    delivery: "We deliver within Kumasi, and to other regions when a courier route exists. Delivery is quoted per order after we confirm on WhatsApp — it is not charged on the website. You can also pick up from our shop at {loc}.",
    payment: "Pay only after we confirm your order on WhatsApp — mobile money or cash at the shop, as agreed. Nothing is charged on the website, and no deposit is needed to ask a question.",
    warranty: "Every item shows its warranty on the product page. Faults are handled under that warranty — report them with a photo or video, and bring the item or call us if we ask you to.",
    location: "Our shop is at {loc}. Phone {phone} or WhatsApp {wa}. Call ahead so someone is there for you.",
    returns: "Report visible damage or a wrong item within 48 hours, with photos where possible. Keep the packaging until you have tested the item.",
    services: "We repair computers and laptops, install CCTV and networks, run IT training, and build websites and software. Tell us the job in the quote form and we will price it.",
    contact: "Phone {phone}, WhatsApp {wa}, email {email}.",
    catalogue: "We stock {cats}. Ask me the name of an item and I will tell you the price and warranty.",
    orderAsk: "Send the order number (for example FA-2611-1003) together with the phone number you ordered with, and I can check it. It is on the receipt you got after checkout.",
    orderFail: "I could not reach the order book. Please message us on WhatsApp.",
    orderLine: "Order {ref} ({date}, {total}): {status}",
    st_new: "received — we have not confirmed it yet. We will confirm on WhatsApp.",
    st_confirmed: "confirmed. Delivery or pickup is being arranged.",
    st_delivered: "delivered. Thank you for shopping with us.",
    st_cancelled: "cancelled. Message us on WhatsApp if that is unexpected.",
    condition: "Condition",
    warrantyLabel: "Warranty",
    example: "example price, confirm before paying",
    catList: "{cat}: {items}. Prices on sample items are examples until we confirm stock.",
    help: "I can help with prices, stock, delivery, warranty, our location and order status (send the order number with your phone number). For anything else, WhatsApp {wa} and a person will reply. Popular items: {names}.",
    view: "View the product",
    seeAll: "See all {cat}",
    shop: "Browse the shop",
    open: "Open",
    shipLink: "Delivery policy",
    retLink: "Returns & warranty",
    quoteLink: "Request a quote",
  },
  fr: {
    hello: "Bonjour ! Demandez-moi un prix, la livraison, la garantie, notre adresse ou une commande (numéro + téléphone utilisé).",
    welcome: "Avec plaisir. Pour autre chose, écrivez-nous sur WhatsApp {wa}.",
    delivery: "Nous livrons à Kumasi et, par transporteur, dans d'autres régions du Ghana. Les frais sont confirmés sur WhatsApp — rien n'est facturé sur le site. Retrait possible à la boutique : {loc}.",
    payment: "Payez après confirmation de la commande sur WhatsApp — mobile money ou espèces à la boutique. Aucun paiement ni acompte sur le site.",
    warranty: "La garantie de chaque article est sur sa page. En cas de panne, envoyez une photo ou une vidéo, puis apportez l'article ou appelez-nous.",
    location: "Notre boutique est à {loc}. Téléphone {phone}, WhatsApp {wa}. Appelez avant de passer.",
    returns: "Signalez un dommage ou un article erroné sous 48 heures, avec photos si possible. Gardez l'emballage jusqu'aux tests.",
    services: "Nous réparons ordinateurs et portables, installons CCTV et réseaux, formons en informatique et créons sites et logiciels. Décrivez le travail dans le formulaire de devis.",
    contact: "Téléphone {phone}, WhatsApp {wa}, e-mail {email}.",
    catalogue: "Nous avons {cats}. Donnez le nom d'un article et j'indique le prix et la garantie.",
    orderAsk: "Envoyez le numéro de commande (par exemple FA-2611-1003) avec le téléphone utilisé, et je vérifie. Il est sur le reçu.",
    orderFail: "Le registre des commandes est injoignable. Écrivez-nous sur WhatsApp.",
    orderLine: "Commande {ref} ({date}, {total}) : {status}",
    st_new: "reçue — pas encore confirmée. Nous confirmons sur WhatsApp.",
    st_confirmed: "confirmée. La livraison ou le retrait est en cours d'organisation.",
    st_delivered: "livrée. Merci de votre confiance.",
    st_cancelled: "annulée. Écrivez-nous sur WhatsApp si c'est inattendu.",
    condition: "État",
    warrantyLabel: "Garantie",
    example: "prix indicatif, à confirmer avant paiement",
    catList: "{cat} : {items}. Les prix des articles d'exemple sont indicatifs jusqu'à confirmation.",
    help: "Je peux aider pour les prix, le stock, la livraison, la garantie, l'adresse et le suivi de commande (numéro + téléphone). Sinon, WhatsApp {wa}. Articles populaires : {names}.",
    view: "Voir l'article",
    seeAll: "Voir tout {cat}",
    shop: "Voir la boutique",
    open: "Ouvrir",
    shipLink: "Politique de livraison",
    retLink: "Retours et garantie",
    quoteLink: "Demander un devis",
  },
  es: {
    hello: "¡Hola! Pregúntame por un precio, la entrega, la garantía, nuestra dirección o un pedido (número + teléfono usado).",
    welcome: "De nada. Para otra cosa, escríbenos por WhatsApp {wa}.",
    delivery: "Entregamos en Kumasi y, por transportista, en otras regiones de Ghana. El coste se confirma por WhatsApp — no se cobra en la web. También puedes recoger en la tienda: {loc}.",
    payment: "Paga después de confirmar el pedido por WhatsApp — mobile money o efectivo en la tienda. No se cobra nada en la web.",
    warranty: "Cada artículo muestra su garantía en su página. Si falla, envía una foto o vídeo y trae el artículo o llámanos.",
    location: "Nuestra tienda está en {loc}. Teléfono {phone}, WhatsApp {wa}. Llama antes de pasar.",
    returns: "Informa de un daño o artículo equivocado en 48 horas, con fotos si es posible. Guarda el embalaje hasta probarlo.",
    services: "Reparamos ordenadores y portátiles, instalamos CCTV y redes, damos formación informática y creamos webs y software. Describe el trabajo en el formulario de presupuesto.",
    contact: "Teléfono {phone}, WhatsApp {wa}, correo {email}.",
    catalogue: "Tenemos {cats}. Dime el nombre de un artículo y te doy precio y garantía.",
    orderAsk: "Envía el número de pedido (por ejemplo FA-2611-1003) con el teléfono que usaste, y lo compruebo. Está en el recibo.",
    orderFail: "No puedo consultar los pedidos ahora. Escríbenos por WhatsApp.",
    orderLine: "Pedido {ref} ({date}, {total}): {status}",
    st_new: "recibido — aún sin confirmar. Confirmamos por WhatsApp.",
    st_confirmed: "confirmado. Estamos organizando la entrega o recogida.",
    st_delivered: "entregado. Gracias por tu compra.",
    st_cancelled: "cancelado. Escríbenos por WhatsApp si no lo esperabas.",
    condition: "Estado",
    warrantyLabel: "Garantía",
    example: "precio de ejemplo, confirma antes de pagar",
    catList: "{cat}: {items}. Los precios de artículos de ejemplo son orientativos hasta confirmar.",
    help: "Puedo ayudar con precios, stock, entrega, garantía, dirección y estado de pedido (número + teléfono). Para lo demás, WhatsApp {wa}. Artículos populares: {names}.",
    view: "Ver el artículo",
    seeAll: "Ver todo {cat}",
    shop: "Ver la tienda",
    open: "Abrir",
    shipLink: "Política de entrega",
    retLink: "Devoluciones y garantía",
    quoteLink: "Pedir presupuesto",
  },
  tw: {
    hello: "Akwaaba! Bisa me adeɛ boɔ, delivery, warranty, yɛn beaeɛ, anaasɛ wo order.",
    welcome: "Yɛda wo ase. Biribi foforɔ? Fa WhatsApp {wa}.",
    delivery: "Yɛde adeɛ kɔ Kumasi mu, na sɛ ɔkwan wɔ so a, yɛde courier kɔ Ghana beaeɛ foforɔ. Yɛka delivery boɔ wɔ WhatsApp so; website no ntua ka. Wobɛtumi nso aba yɛn adwumayɛbea {loc} abɛfa.",
    payment: "Tua ka sɛ yɛaka wo order ho nsɛm wɔ WhatsApp so — mobile money anaasɛ sika wɔ beaeɛ. Website no ntua ka biara.",
    warranty: "Adeɛ biara kyerɛ ne warranty wɔ ne page so. Sɛ ɛhaw a, fa foto anaasɛ video bra, na fa adeɛ no bra anaasɛ frɛ yɛn.",
    location: "Yɛn adwumayɛbea wɔ {loc}. Frɛ {phone} anaasɛ WhatsApp {wa}. Frɛ ansa na wobɛba.",
    returns: "Sɛ adeɛ no ho haw anaasɛ ɛnyɛ deɛ wotɔeɛ a, ka kyerɛ yɛn wɔ nnɔnhwerew 48 mu, fa foto. Kora packaging no so kosi sɛ wobɛsɔ ahwɛ.",
    services: "Yɛsiesie computer ne laptop, yɛsi CCTV ne network, yɛkyerɛ IT, na yɛyɛ website ne software. Ka adwuma no wɔ quote form so.",
    contact: "Frɛ {phone}, WhatsApp {wa}, email {email}.",
    catalogue: "Yɛwɔ {cats}. Ka adeɛ din kyerɛ me, mɛka boɔ ne warranty.",
    orderAsk: "Fa order nɔma (te sɛ FA-2611-1003) ne phone nɔma a wode order no baeɛ, na mɛhwɛ. Ɛwɔ receipt a wonyaeɛ no so.",
    orderFail: "Mentumi nhu order nhyehyɛeɛ no seesei. Mesrɛ wo, fa WhatsApp.",
    orderLine: "Order {ref} ({date}, {total}): {status}",
    st_new: "yɛagye — yɛnkaa so. Yɛbɛka so wɔ WhatsApp.",
    st_confirmed: "wɔagye so. Yɛresiesie delivery.",
    st_delivered: "wɔde akɔ. Yɛda wo ase.",
    st_cancelled: "wɔatwa so. Sɛ ɛnyɛ saa a, fa WhatsApp.",
    condition: "Tebea",
    warrantyLabel: "Warranty",
    example: "boɔ nhwɛsoɔ, bisa ansa na woatua",
    catList: "{cat}: {items}. Nhwɛsoɔ boɔ wɔ item bi so; bisa ansa na woatua.",
    help: "Metumi aboa wo wɔ boɔ, delivery, warranty, yɛn beaeɛ ne order (fa order nɔma ne phone). Biribi foforɔ? WhatsApp {wa}. Adeɛ a ɛho hia: {names}.",
    view: "Hwɛ adeɛ no",
    seeAll: "Hwɛ {cat} nyinaa",
    shop: "Hwɛ shop no",
    open: "Bue",
    shipLink: "Delivery nhyehyɛeɛ",
    retLink: "Returns ne warranty",
    quoteLink: "Bisa boɔ",
  },
};

// Catalogue values that appear inside replies: condition words and "3 months" style warranties.
const COND: Record<Lang, Record<string, string>> = {
  en: { new: "new", refurbished: "refurbished", used: "used" },
  fr: { new: "neuf", refurbished: "reconditionné", used: "occasion" },
  es: { new: "nuevo", refurbished: "reacondicionado", used: "usado" },
  tw: { new: "foforɔ", refurbished: "wɔasiesie", used: "wɔde adi dwuma" },
};
const duration = (s: string, lang: Lang) => {
  const m = s.match(/^(\d+)\s*(month|year)s?$/i);
  if (!m) return s;
  const n = m[1];
  const months = m[2].toLowerCase() === "month";
  const one = n === "1";
  if (lang === "fr") return `${n} ${months ? "mois" : one ? "an" : "ans"}`;
  if (lang === "es") return `${n} ${months ? (one ? "mes" : "meses") : one ? "año" : "años"}`;
  if (lang === "tw") return months ? `abosome ${n}` : `mfeɛ ${n}`;
  return s;
};

// Distinctive words per language; English is the fallback when nothing matches.
const SIGNALS: [Lang, string[]][] = [
  ["fr", ["bonjour", "bonsoir", "prix", "combien", "livraison", "livrer", "merci", "garantie", "commande", "téléphone", "telephone", "adresse", "boutique", "devis", "réparer", "reparer", "vendez", "avez", "faites", "école", "coût", "cout"]],
  ["es", ["hola", "precio", "cuánto", "cuanto", "entrega", "gracias", "garantía", "garantia", "pedido", "teléfono", "telefono", "dirección", "direccion", "tienda", "presupuesto", "reparar", "dónde", "donde", "venden", "tienen", "necesito", "quiero", "hay", "descuento", "escuela", "computadora", "compran", "comprar", "recomienda"]],
  ["tw", ["akwaaba", "medaase", "sɛn", "kyɛ", "bisa", "frɛ", "beaeɛ", "adwumayɛbea", "ɛyɛ", "nhwɛsoɔ", "ɔkwan", "deɛ", "ntɛm", "sika", "tebea", "boa me", "mepɛ", "pɛ", "sukuu"]],
];

const detect = (message: string): Lang => {
  // Punctuation to spaces so "¿cuánto" and "avez-vous" still match whole words.
  const padded = ` ${message.toLowerCase().replace(/[^a-z0-9à-ÿɛɔ]+/g, " ")} `;
  let best: Lang = "en";
  let score = 0;
  for (const [lang, list] of SIGNALS) {
    const n = list.filter((w) => padded.includes(` ${w}`)).length;
    if (n > score) {
      best = lang;
      score = n;
    }
  }
  return best;
};

async function orderReply(message: string, t: Text): Promise<Reply | null> {
  const ref = message.match(REF)?.[0]?.toUpperCase();
  if (!ref) return null;
  if (!isAdminConfigured) return { text: t.orderFail };

  const digits = message.replace(/\D/g, "");
  try {
    const { data } = await supabaseAdmin()
      .from("orders")
      .select("ref,status,phone,total_pesewas,created_at")
      .eq("ref", ref)
      .maybeSingle();
    const phone = String(data?.phone ?? "").replace(/\D/g, "");
    // Refs are guessable, so the phone on the order must match before anything is shown.
    if (!data || !phone || !digits.includes(phone.slice(-7))) return { text: t.orderAsk };
    const when = data.created_at ? new Date(data.created_at).toLocaleDateString("en-GH") : "";
    const status = t[`st_${String(data.status)}`] ?? String(data.status);
    return { text: fill(t.orderLine, { ref: String(data.ref), date: when, total: ghs(Number(data.total_pesewas)), status }) };
  } catch {
    return { text: t.orderFail };
  }
}

function productReply(products: Product[], message: string, t: Text, lang: Lang): Reply | null {
  const msg = message.toLowerCase();
  const tokens = tokensIn(message);
  const shorts = tokens.filter((tok) => tok.length <= 2);

  const scored = products.map((p) => {
    // Names keep short type words ("TV", "PC") that the length filter would drop.
    const nameWords = p.name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const brandWords = p.brand.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const catWords = words(CATEGORIES.find((c) => c.slug === p.category)?.name ?? "");
    // Whole words, tolerant of plurals: "printers" still finds "Printer".
    const hits = (ws: string[], t: string) => ws.some((w) => w.startsWith(t) || t.startsWith(w));
    let score = msg.includes(p.name.toLowerCase()) ? 6 : 0;
    for (const tok of tokens) {
      // Short type words ("tv", "hp") are strong when they are in the name itself.
      if (hits(nameWords, tok)) score += tok.length > 4 || tok.length <= 2 ? 2 : 1;
      if (hits(brandWords, tok)) score += 1;
      if (hits(catWords, tok)) score += 1;
    }
    return { p, score };
  });

  // "Samsung TV" must not become a Samsung monitor: a short type word has to be in the product's name.
  const eligible = scored.filter((c) => shorts.every((s) => new RegExp(`\\b${s}\\b`).test(c.p.name.toLowerCase())));
  const best = eligible.reduce<{ p: Product; score: number } | null>((a, b) => (!a || b.score > a.score ? b : a), null);
  // One weak token ("hp", "ssd") is not enough to answer confidently.
  if (!best || best.score < 2) return null;

  const p = best.p;
  const parts = [`${p.name} — ${p.verified ? ghs(p.price) : `${ghs(p.price)} (${t.example})`}.`];
  if (p.condition !== "new") parts.push(`${t.condition}: ${COND[lang]?.[p.condition] ?? p.condition}.`);
  if (p.warranty) parts.push(`${t.warrantyLabel}: ${duration(p.warranty, lang)}.`);
  if (p.short) parts.push(p.short);
  return { text: parts.join(" "), href: `/product/${p.slug}`, label: t.view };
}

function categoryReply(products: Product[], message: string, t: Text): Reply | null {
  const tokens = tokensIn(message).filter((tok) => tok.length > 1);
  // Whole-word match against the category text: "order" must not hit "recorders".
  const cat = CATEGORIES.find((c) => {
    const catWords = words(`${c.name} ${c.short} ${c.blurb}`);
    return tokens.some((tok) => catWords.some((w) => w.startsWith(tok) || tok.startsWith(w)));
  });
  if (!cat) return null;
  const items = products.filter((p) => p.category === cat.slug).slice(0, 4);
  if (!items.length) return { text: t.catalogue, href: "/shop", label: t.shop };
  const list = items.map((p) => `${p.name} ${ghs(p.price)}${p.verified ? "" : ` (${t.example})`}`).join("; ");
  return {
    text: fill(t.catList, { cat: cat.name, items: list }),
    href: `/shop?cat=${cat.slug}`,
    label: fill(t.seeAll, { cat: cat.name }),
  };
}

function ruleReply(products: Product[], contact: Contact, message: string, t: Text): Reply | null {
  const wa = contact.whatsapp[0].label;
  const vars = { wa, phone: contact.phone, email: contact.email, loc: contact.location };

  if (has(message, /my order|order status|order number|track|where.*order|commande|pedido|me order|order no/)) {
    return { text: t.orderAsk };
  }
  if (has(message, /deliver|shipping|courier|send (it|to)|pick ?up|collect|how long|when will|livraison|livrer|expédition|expedition|retrait|entrega|envío|envio|recogida|ɔkwan/)) {
    return { text: fill(t.delivery, vars), href: "/policies/shipping", label: t.shipLink };
  }
  if (has(message, /pay|payment|momo|mobile money|bank|deposit|cash|paiement|payer|espèces|especes|pago|pagar|efectivo|tua ka|sika/)) {
    return { text: fill(t.payment, vars), href: "/policies/returns", label: t.retLink };
  }
  if (has(message, /warranty|guarantee|faulty|broken|not working|garantie|garantía|garantia/)) {
    return { text: fill(t.warranty, vars), href: "/policies/returns", label: t.retLink };
  }
  if (has(message, /where|address|location|direction|find you|open|hours|time do you|adresse|boutique|dirección|direccion|tienda|dónde|donde|beaeɛ|adwumayɛbea/)) {
    return { text: fill(t.location, vars) };
  }
  if (has(message, /return|refund|exchange|retour|remboursement|échange|echange|devolución|devolucion|reembolso|cambio/)) {
    return { text: fill(t.returns, vars), href: "/policies/returns", label: t.retLink };
  }
  if (has(message, /repair|fix|install|cctv|network|cabl|train|course|software|website|design|réparation|reparation|réparer|reparer|installer|reparación|reparacion|reparar|instalar|siesie/)) {
    return { text: fill(t.services, vars), href: "/quote", label: t.quoteLink };
  }
  if (has(message, /phone|call|whatsapp|email|contact|reach|téléphone|telephone|teléfono|telefono|frɛ/)) {
    return { text: fill(t.contact, vars) };
  }
  if (has(message, /(what|which).*(sell|stock|have|product|category)|do you sell|do you have|vendez|avez|venden|tienen|wowɔ/)) {
    return { text: fill(t.catalogue, { cats: CATEGORIES.map((c) => c.name).join(", ") }), href: "/shop", label: t.shop };
  }
  if (has(message, /^(hi|hello|hey|good (morning|afternoon|evening)|bonjour|bonsoir|hola|akwaaba)\b/)) {
    return { text: t.hello };
  }
  if (has(message, /thank|thanks|ok|okay|merci|gracias|medaase/)) {
    return { text: fill(t.welcome, vars) };
  }
  return null;
}

// Last resort when nothing matched: say what the assistant can do.
function helpText(products: Product[], contact: Contact, t: Text): Reply {
  const names = products.slice(0, 3).map((p) => p.name).join(", ");
  return { text: fill(t.help, { wa: contact.whatsapp[0].label, names }) };
}

const LANG_NAME: Record<Lang, string> = { en: "English", fr: "French", es: "Spanish", tw: "Twi (Akan)" };

function systemPrompt(products: Product[], contact: Contact, lang: Lang): string {
  const list = products
    .map((p) => `- ${p.name} | ${ghs(p.price)}${p.verified ? "" : " (example price, not confirmed)"} | ${p.condition} | ${p.warranty || "no warranty stated"}`)
    .join("\n");
  return [
    "You are the website assistant for F.A TECHNOLOGIES, an IT equipment and electronics shop in Kumasi–Kwadaso, Ghana.",
    `Phone ${contact.phone}. WhatsApp ${contact.whatsapp.map((w) => w.label).join(", ")}. Email ${contact.email}.`,
    "Answer only about this shop: products, prices, warranties, delivery, payment, location, services and orders.",
    "Use the product list below. Never invent products, prices or stock. Items marked example price must be described as an example to confirm on WhatsApp.",
    "Delivery is within Kumasi and by courier to other regions, quoted on WhatsApp; pickup at the shop.",
    "For order status, ask for the order number and the phone used, and say a person will confirm. Never guess a status.",
    `The customer wrote in ${LANG_NAME[lang]}. Reply only in ${LANG_NAME[lang]}, even though the product list is in English. If the message is clearly in another language, reply in that language instead. Do not open with a greeting unless the customer greeted you.`,
    "Keep replies under 70 words, plain text, no markdown, no bullet lists, no emoji. If asked something unrelated, say what you can help with and give the WhatsApp number.",
    "Products:",
    list,
  ].join("\n");
}

// Rules always answer; Gemini (free tier) only improves free-form wording, and never sees order data.
async function aiReply(products: Product[], contact: Contact, lang: Lang, message: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt(products, contact, lang) }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 220 },
      }),
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    const text = Array.isArray(parts) ? parts.map((p: { text?: string }) => p.text ?? "").join("").trim() : "";
    return text ? text.slice(0, 800) : null;
  } catch {
    return null;
  }
}

export async function answer(message: string, forced?: Lang): Promise<Reply> {
  const lang = forced ?? detect(message);
  const t = TEXT[lang];
  let products: Product[] = PRODUCTS;
  try {
    products = await getProducts();
  } catch {
    // Keep the static catalogue rather than fail the chat.
  }
  const contact = await getContact();

  const order = await orderReply(message, t);
  if (order) return order;

  const product = productReply(products, message, t, lang);
  if (product) return product;
  // Policy and service intents beat a category list ("do you repair laptops").
  const rule = ruleReply(products, contact, message, t);
  if (rule) return rule;

  // The model handles real questions ("discount for schools?"); the category list is the fallback.
  const ai = await aiReply(products, contact, lang, message);
  if (ai) return { text: ai };
  const category = categoryReply(products, message, t);
  if (category) return category;
  return helpText(products, contact, t);
}
