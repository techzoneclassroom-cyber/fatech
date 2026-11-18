import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryName } from "@/lib/catalogue";
import { getProducts } from "@/lib/products";
import { getProductRatings } from "@/lib/reviews";
import { ghs } from "@/lib/site";
import { BuyBox } from "@/components/buy-box";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ArrowRight } from "@/components/icons";

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getProducts()).find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.short} ${p.brand} · ${categoryName(p.category)} from F.A TECHNOLOGIES, Kumasi. ${p.verified ? "Catalogue item — availability confirmed before payment." : "Sample item — confirm availability on WhatsApp."}`,
    openGraph: { title: p.name, description: p.short, images: [{ url: p.image }] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const all = await getProducts();
  const p = all.find((x) => x.slug === slug);
  if (!p) notFound();

  const related = all.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 4);
  const ratings = await getProductRatings(p.slug);
  const rounded = Math.round(ratings.avg);
  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);
  const verified = Boolean(p.verified);
  const save = verified && p.was ? Math.round((1 - p.price / p.was) * 100) : 0;

  return (
    <>
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb" style={{ paddingTop: 18 }}>
          <Link href="/">Home</Link> <span aria-hidden="true">/</span>
          <Link href="/shop">Shop</Link> <span aria-hidden="true">/</span>
          <Link href={`/shop?cat=${p.category}`}>{categoryName(p.category)}</Link> <span aria-hidden="true">/</span>
          <span>{p.name}</span>
        </nav>

        <div className="pdp">
          <ProductGallery
            images={p.images?.length ? p.images : [p.image]}
            alt={verified ? p.name : `${p.name} — sample entry, representative image`}
            sample={!verified}
            save={save}
          />

          <div>
            <span className="kicker">{categoryName(p.category)}</span>
            <h1>{p.name}</h1>
            <div className="pdp-meta">
              <span>{p.brand}</span>
              <span style={{ textTransform: "capitalize" }}>{p.condition}</span>
              <span>Warranty: {p.warranty}</span>
            </div>

            <div className="pdp-price">
              {ghs(p.price)}
              {verified && p.was && <span className="was" style={{ fontSize: "1rem" }}>{ghs(p.was)}</span>}
            </div>
            <p className="price-flag">
              {verified
                ? "Catalogue price — we still confirm availability before any payment."
                : "Example price — not a confirmed purchase price. Ask us for the current price."}
            </p>
            <p className="pdp-short">{p.short}</p>

            {ratings.count > 0 ? (
              <p className="pdp-meta" style={{ marginTop: 10 }} aria-label={`Rated ${ratings.avg.toFixed(1)} out of 5 from ${ratings.count} ratings`}>
                <span style={{ color: "var(--gold)", letterSpacing: 1 }} aria-hidden="true">{stars(rounded)}</span>
                <span>{ratings.avg.toFixed(1)} · {ratings.count} rating{ratings.count === 1 ? "" : "s"}</span>
              </p>
            ) : (
              <p className="pdp-meta" style={{ marginTop: 10 }}><span>No ratings yet — buy it and rate it after delivery.</span></p>
            )}

            <BuyBox product={{ id: p.slug, name: p.name, price: p.price, verified }} />

            <p className="form-note">
              {verified
                ? "We confirm the condition, warranty and current availability on WhatsApp before any payment."
                : "Sample entry. We confirm the current price, condition, warranty and availability on WhatsApp before any payment."}{" "}
              Delivery is quoted separately based on your location.
            </p>

            <h2 style={{ fontSize: "1.05rem", margin: "26px 0 4px" }}>Specifications</h2>
            <table className="specs">
              <tbody>
                {p.specs.map(([k, v]) => (
                  <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section section--sand">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="kicker">More like this</span>
                <h2>More in {categoryName(p.category)}</h2>
              </div>
              <Link className="link-more" href={`/shop?cat=${p.category}`}>See category <ArrowRight size={15} /></Link>
            </div>
            <div className="product-grid">
              {related.map((r) => <ProductCard key={r.slug} product={r} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
