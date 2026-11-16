import Link from "next/link";
import { ImportForm } from "@/components/admin/import-form";

export default function ImportPage() {
  return (
    <>
      <p className="form-note" style={{ marginBottom: 10 }}><Link href="/admin/products">← Products</Link></p>
      <h1 style={{ fontSize: "1.5rem", margin: "0 0 6px" }}>Import products from CSV</h1>
      <p className="muted" style={{ marginTop: 0, fontSize: 13.5, maxWidth: "70ch" }}>
        Check the preview before importing. Rows with problems are skipped and listed; the rest are saved in one go.
      </p>
      <div style={{ marginTop: 16 }}><ImportForm /></div>
    </>
  );
}
