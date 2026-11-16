import Link from "next/link";
import { categoryName, type Product } from "@/lib/catalogue";
import { getProducts } from "@/lib/products";
import { isDbConfigured } from "@/lib/supabase/server";
import { ghs } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  let products: Product[] = [];
  let error = "";
  try {
    products = await getProducts();
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load products.";
  }

  const featured = products.filter((p) => p.featured).length;

  return (
    <>
      <h1 style={{ fontSize: "1.5rem", margin: "0 0 4px" }}>Dashboard</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Catalogue source: {isDbConfigured ? "Supabase" : "built-in sample file (not connected)"}
      </p>

      {error && <p className="notice" role="alert" style={{ marginBlock: 16 }}>{error}</p>}

      <div className="admin-grid">
        <div className="admin-card"><span className="muted">Products</span><b>{products.length}</b></div>
        <div className="admin-card"><span className="muted">On the home page</span><b>{featured}</b></div>
        <div className="admin-card"><span className="muted">Categories</span><b>5</b></div>
      </div>

      <p className="form-note" style={{ marginTop: 18 }}>
        Changes made here go live on the shop within a minute.
      </p>

      <div className="row-wrap" style={{ marginTop: 14 }}>
        <Link className="btn btn--dark btn--sm" href="/admin/products/new">Add product</Link>
        <Link className="btn btn--sm" href="/admin/products">All products</Link>
        <Link className="btn btn--sm" href="/admin/import">CSV import</Link>
        <Link className="btn btn--sm" href="/admin/orders">Orders</Link>
        <Link className="btn btn--sm" href="/admin/promotions">Promotions</Link>
      </div>

      <div className="table-wrap" style={{ marginTop: 20 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Category</th>
              <th scope="col">Price</th>
              <th scope="col">Featured</th>
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
                <td>{ghs(p.price)}</td>
                <td>{p.featured ? "Yes" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
