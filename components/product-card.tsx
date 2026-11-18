import Link from "next/link";
import { categoryName, type Product } from "@/lib/catalogue";
import { ghs } from "@/lib/site";

export function ProductCard({ product }: { product: Product }) {
  const verified = Boolean(product.verified);
  // A discount is only shown when the price itself is real; sample compare-at prices mean nothing.
  const save = verified && product.was ? Math.round((1 - product.price / product.was) * 100) : 0;
  return (
    <Link href={`/product/${product.slug}`} className="product-card">
      <div className="product-media">
        <img
          src={product.image}
          alt={verified ? product.name : `${product.name} — sample entry, representative image`}
          width={900}
          height={675}
          loading="lazy"
        />
        {!verified && <span className="tag-sample">Sample</span>}
        {save > 0 && <span className="tag-save">−{save}%</span>}
      </div>
      <div className="product-body">
        <span className="product-cat">{categoryName(product.category)}</span>
        <span className="product-name">{product.name}</span>
        <span className="product-foot">
          {verified ? (
            <span className="price">
              {ghs(product.price)}
              {product.was && <span className="was">{ghs(product.was)}</span>}
            </span>
          ) : (
            <span className="price price--sample">
              <small>Example price</small>
              {ghs(product.price)}
            </span>
          )}
          <span className="go">{verified ? "View" : "Check price"}</span>
        </span>
      </div>
    </Link>
  );
}
