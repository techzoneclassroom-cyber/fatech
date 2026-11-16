import { getProducts } from "@/lib/products";
import { SITE_URL, BUSINESS } from "@/lib/site";
import type { Product } from "@/lib/catalogue";

export const revalidate = 3600;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const url = (path: string) => (path.startsWith("http") ? path : SITE_URL + path);
const cedis = (pesewas: number) => (pesewas / 100).toFixed(2);

export async function GET() {
  let products: Product[] = [];
  try {
    products = await getProducts();
  } catch {
    // A feed with no items is better than a 500 for the merchant centre crawler.
  }

  const items = products
    .map((p) => {
      const compare = p.was && p.was > p.price ? p.was : 0;
      // price is the current selling price; was is the crossed-out old one.
      return `<item>
  <g:id>${esc(p.slug)}</g:id>
  <g:title>${esc(p.name)}</g:title>
  <g:description>${esc(p.short)}</g:description>
  <g:link>${SITE_URL}/product/${esc(p.slug)}</g:link>
  <g:image_link>${esc(url(p.image))}</g:image_link>
  <g:price>${cedis(compare || p.price)} GHS</g:price>${compare ? `\n  <g:sale_price>${cedis(p.price)} GHS</g:sale_price>` : ""}
  <g:availability>in stock</g:availability>
  <g:condition>${p.condition}</g:condition>
  <g:brand>${esc(p.brand)}</g:brand>
  <g:identifier_exists>no</g:identifier_exists>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${esc(BUSINESS.name)}</title>
  <link>${SITE_URL}</link>
  <description>${esc(BUSINESS.name)} — product catalogue, Kumasi, Ghana</description>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
