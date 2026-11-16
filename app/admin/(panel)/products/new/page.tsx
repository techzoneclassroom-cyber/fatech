import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <>
      <p className="form-note" style={{ marginBottom: 10 }}><Link href="/admin/products">← Products</Link></p>
      <h1 style={{ fontSize: "1.5rem", margin: "0 0 18px" }}>Add product</h1>
      <ProductForm />
    </>
  );
}
