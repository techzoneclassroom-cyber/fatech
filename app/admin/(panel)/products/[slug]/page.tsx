import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/admin/data";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <>
      <p className="form-note" style={{ marginBottom: 10 }}>
        <Link href="/admin/products">← Products</Link> · <Link href={`/product/${product.slug}`}>View in shop</Link>
      </p>
      <h1 style={{ fontSize: "1.5rem", margin: "0 0 18px" }}>Edit {product.name}</h1>
      <ProductForm product={product} />
    </>
  );
}
