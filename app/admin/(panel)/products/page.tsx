import Link from "next/link";
import { listProducts } from "@/lib/admin/data";
import { categoryName } from "@/lib/catalogue";
import { ghs } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const products = await listProducts();

  return (
    <>
      <div className="admin-head">
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Products</h1>
        <div className="row-wrap">
          <Link className="btn btn--sm" href="/admin/import">Import CSV</Link>
          <Link className="btn btn--dark btn--sm" href="/admin/products/new">Add product</Link>
        </div>
      </div>

      {saved && <p className="notice" role="status" style={{ marginBottom: 16 }}>Saved <b>{saved}</b>. The shop updates within a minute.</p>}
      {error && <p className="notice" role="alert" style={{ marginBottom: 16 }}>{error}</p>}

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Category</th>
              <th scope="col">Price</th>
              <th scope="col">Status</th>
              <th scope="col"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.slug}>
                <td>
                  <div className="admin-item">
                    <img src={p.image} alt="" width={44} height={44} />
                    <span>{p.name}<small>{p.slug}</small></span>
                  </div>
                </td>
                <td>{categoryName(p.category)}</td>
                <td>{ghs(p.price_pesewas)}</td>
                <td>
                  {p.active ? "Live" : "Hidden"}
                  {p.verified ? "" : " · Sample"}
                  {p.featured ? " · Home" : ""}
                </td>
                <td><Link href={`/admin/products/${p.slug}`} style={{ fontWeight: 700 }}>Edit</Link></td>
              </tr>
            ))}
            {!products.length && (
              <tr><td colSpan={5} className="muted">No products yet. Add one or import a CSV.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
