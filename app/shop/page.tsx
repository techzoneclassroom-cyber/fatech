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
            <input id="q" name="q" defaultValue={q} placeholder="Search by name, brand or category" />
            <button className="btn btn--dark" type="submit"><Search size={16} /> Search</button>
          </form>
          <span className="results">{list.length} of {all.length} sample items</span>
        </div>

        <div className="chips">
          <Link href={chipHref("")} className={`chip${cat ? "" : " chip--active"}`}>All</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={chipHref(c.slug)} className={`chip${cat === c.slug ? " chip--active" : ""}`}>
              {c.name}
            </Link>
          ))}
        </div>

        <p className="sample-note">
          <strong>Sample catalogue.</strong> These items and prices are examples while the real stock is loaded.
          Message us on WhatsApp to confirm current price, condition and availability.
        </p>

        {list.length ? (
          <div className="product-grid" style={{ paddingBottom: 40 }}>
            {list.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        ) : (
          <div className="empty">
            <h2>No matches</h2>
            <p className="muted">Try another search, or ask us to source the item for you.</p>
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
