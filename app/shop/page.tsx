import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, categoryName } from "@/lib/catalogue";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Search } from "@/components/icons";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse IT equipment, networking and security, kitchen appliances, home appliances and mobile electronics from F.A TECHNOLOGIES in Kumasi.",
};

export default async function Shop({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { q = "", cat = "" } = await searchParams;
  const all = await getProducts();
  const term = q.trim().toLowerCase();
  const list = all.filter((p) => {
    const matchesCat = !cat || p.category === cat;
    const matchesTerm = !term ||
      p.name.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      categoryName(p.category).toLowerCase().includes(term);
    return matchesCat && matchesTerm;
  });
  const samples = list.filter((p) => !p.verified).length;

  const chipHref = (slug: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (slug) params.set("cat", slug);
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <>
      <div className="page-head">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>Shop</span>
          </nav>
          <h1>Shop</h1>
          <p>IT equipment, security, appliances and electronics — confirmed with you before payment.</p>
        </div>
      </div>

      <div className="container">
        <div className="shop-bar">
          <form className="search" action="/shop" role="search">
            {cat && <input type="hidden" name="cat" value={cat} />}
            <label className="sr-only" htmlFor="q">Search products</label>
            <input id="q" name="q" defaultValue={q} placeholder="Search name, brand or category" enterKeyHint="search" />
            <button className="btn btn--dark" type="submit"><Search size={16} /> <span className="search-label">Search</span></button>
          </form>
          <div className="shop-meta">
            <span className="results">
              {list.length} of {all.length} items
              {samples > 0 && <> · {samples} with example prices</>}
            </span>
            {q && <Link className="chip" href={chipHref(cat)}>Clear search</Link>}
          </div>
        </div>

        <nav className="chips" aria-label="Product categories">
          <Link href={chipHref("")} className={`chip${cat ? "" : " chip--active"}`} aria-current={cat ? undefined : "true"}>All</Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={chipHref(c.slug)}
              className={`chip${cat === c.slug ? " chip--active" : ""}`}
              aria-current={cat === c.slug ? "true" : undefined}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <p className="sample-note">
          <strong>Sample entries use example prices.</strong> Anything labelled <em>Sample</em> has not been
          confirmed yet — message us on WhatsApp to check the current price, condition and availability.
          Items without the label are real catalogue entries, still confirmed with you before payment.
        </p>

        {list.length ? (
          <div className="product-grid" style={{ paddingBottom: 40 }}>
            {list.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        ) : (
          <div className="empty">
            <h2>No matches</h2>
            <p className="muted">
              {q ? <>Nothing matched “{q}”</> : "No items in this category yet"} — try another search, or ask us to source the item for you.
            </p>
            <div className="row-wrap" style={{ justifyContent: "center" }}>
              <Link className="btn" href="/shop">Clear filters</Link>
              <Link className="btn btn--dark" href="/import">Request an import</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
