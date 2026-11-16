import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryName } from "@/lib/catalogue";
import { getProducts } from "@/lib/products";
import { ghs } from "@/lib/site";
import { BuyBox } from "@/components/buy-box";
import { ProductCard } from "@/components/product-card";
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
    description: `${p.short} ${p.brand} · ${categoryName(p.category)} from F.A TECHNOLOGIES, Kumasi. Sample item — confirm availability on WhatsApp.`,
    openGraph: { title: p.name, description: p.short, images: [{ url: p.image }] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const all = await getProducts();
  const p = all.find((x) => x.slug === slug);
  if (!p) notFound();

  const related = all.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 4);
  const save = p.was ? Math.round((1 - p.price / p.was) * 100) : 0;

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
          <div className="pdp-media">
            <img src={p.image} alt={`${p.name} — sample product image`} width={900} height={900} fetchPriority="high" />
            <span className="tag-sample">Sample item</span>
            {save > 0 && <span className="tag-save">−{save}%</span>}
          </div>

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
              {p.was && <span className="was" style={{ fontSize: "1rem" }}>{ghs(p.was)}</span>}
            </div>
            <p className="pdp-short">{p.short}</p>

            <BuyBox product={{ id: p.slug, name: p.name, price: p.price }} />

            <p className="form-note">
              Sample item. We confirm the current price, condition, warranty and availability on WhatsApp
              before any payment. Delivery is quoted separately based on your location.
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
