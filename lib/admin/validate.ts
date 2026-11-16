import { CATEGORIES } from "@/lib/catalogue";

// Shared by the product form, the CSV import (client preview) and the server
// action that saves, so the preview and the write always agree.
export type Fields = Record<string, string>;

export type ProductRow = {
  slug: string;
  name: string;
  category: string;
  brand: string;
  price_pesewas: number;
  compare_at_pesewas: number | null;
  condition: "new" | "refurbished" | "used";
  warranty: string;
  short: string;
  specs: [string, string][];
  image: string;
  featured: boolean;
  active: boolean;
  sort: number;
};

export const IMPORT_COLUMNS = [
  "slug", "name", "category", "brand", "price", "compare_at", "condition",
  "warranty", "short", "specs", "image", "featured", "active", "sort",
];

const CATS = CATEGORIES.map((c) => c.slug);
const CASE = ["new", "refurbished", "used"] as const;

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const pesewas = (v: string): number | null => {
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null;
};

const pair = (line: string): [string, string] | null => {
  const i = line.search(/[:=]/);
  if (i < 1) return null;
  const label = line.slice(0, i).trim();
  const value = line.slice(i + 1).trim();
  return label && value ? [label.slice(0, 40), value.slice(0, 200)] : null;
};

export const specLines = (text: string): [string, string][] =>
  text.split(/\n|;/).map(pair).filter((p): p is [string, string] => Boolean(p)).slice(0, 20);

const flag = (v: string | undefined, fallback: boolean) =>
  v === undefined || v === "" ? fallback : /^(1|true|yes|y|on)$/i.test(v);

export function productRow(f: Fields): { row: ProductRow | null; error: string } {
  const name = (f.name ?? "").trim();
  if (name.length < 2 || name.length > 120) return { row: null, error: "Name must be 2–120 characters." };

  const slug = slugify(f.slug?.trim() || name);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { row: null, error: "Slug must be lowercase words with hyphens." };

  const category = (f.category ?? "").trim();
  if (!CATS.includes(category)) return { row: null, error: `Category must be one of: ${CATS.join(", ")}.` };

  const price = pesewas(f.price ?? "");
  if (price === null) return { row: null, error: "Price must be a number above zero." };

  const compare = (f.compare_at ?? "").trim() ? pesewas(f.compare_at) : null;

  const condition = ((f.condition ?? "new").trim().toLowerCase()) as ProductRow["condition"];
  if (!CASE.includes(condition)) return { row: null, error: "Condition must be new, refurbished or used." };

  const image = (f.image ?? "").trim() || "/images/cat-it.webp";
  if (!image.startsWith("/") && !image.startsWith("https://")) {
    return { row: null, error: "Image must start with / (a file in public) or https://." };
  }

  return {
    row: {
      slug,
      name,
      category,
      brand: (f.brand ?? "").trim().slice(0, 60),
      price_pesewas: price,
      compare_at_pesewas: compare && compare > price ? compare : null,
      condition,
      warranty: (f.warranty ?? "").trim().slice(0, 80),
      short: (f.short ?? "").trim().slice(0, 300),
      specs: specLines(f.specs ?? ""),
      image,
      featured: flag(f.featured, false),
      active: flag(f.active, true),
      sort: Math.min(9999, Math.max(0, Number.parseInt(f.sort ?? "", 10) || 100)),
    },
    error: "",
  };
}

// Minimal CSV reader: quotes, escaped quotes, commas inside quotes, CRLF.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

export function csvRows(text: string): { rows: Fields[]; error: string } {
  const table = parseCsv(text);
  if (table.length < 2) return { rows: [], error: "Add a header row and at least one product." };
  const head = table[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const missing = ["name", "category", "price"].filter((k) => !head.includes(k));
  if (missing.length) return { rows: [], error: `Missing column(s): ${missing.join(", ")}.` };
  if (table.length > 501) return { rows: [], error: "Import at most 500 products at a time." };
  return {
    rows: table.slice(1).map((cells) => Object.fromEntries(head.map((h, i) => [h, (cells[i] ?? "").trim()]))),
    error: "",
  };
}
