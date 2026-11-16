import Link from "next/link";
import { categoryName, type Product } from "@/lib/catalogue";
import { ghs } from "@/lib/site";

export function ProductCard({ product }: { product: Product }) {
  const save = product.was ? Math.round((1 - product.price / product.was) * 100) : 0;
  return (
    <Link href={`/product/${product.slug}`} className="product-card">
      <div className="product-media">
        <img src={product.image} alt={`${product.name} — sample product image`} width={900} height={675} loading="lazy" />
        <span className="tag-sample">Sample</span>
        {save > 0 && <span className="tag-save">−{save}%</span>}
      </div>
      <div className="product-body">
        <span className="product-cat">{categoryName(product.category)}</span>
        <span className="product-name">{product.name}</span>
        <span className="product-foot">
          <span className="price">
            {ghs(product.price)}
            {product.was && <span className="was">{ghs(product.was)}</span>}
          </span>
          <span className="go">View</span>
        </span>
      </div>
    </Link>
  );
}
