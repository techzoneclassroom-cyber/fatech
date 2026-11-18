import Link from "next/link";
import { listOrders } from "@/lib/admin/data";
import { ghs } from "@/lib/site";

export const dynamic = "force-dynamic";

const label: Record<string, string> = { new: "New", confirmed: "Confirmed", delivered: "Delivered", cancelled: "Cancelled" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ error?: string; deleted?: string }> }) {
  const { error, deleted } = await searchParams;
  let orders: Awaited<ReturnType<typeof listOrders>> = [];
  let loadError = "";
  try {
    orders = await listOrders();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load orders.";
  }

  return (
    <>
      <h1 style={{ fontSize: "1.5rem", margin: "0 0 6px" }}>Orders</h1>
      <p className="muted" style={{ margin: "0 0 18px", fontSize: 13.5 }}>
        Orders are saved when a customer sends the cart on WhatsApp. Payment is still confirmed on WhatsApp.
      </p>

      {(error || loadError || deleted) && (
        <p className="notice" role={error || loadError ? "alert" : "status"} style={{ marginBottom: 16 }}>
          {error ?? loadError ?? `Order ${deleted} deleted.`}
        </p>
      )}

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Reference</th>
              <th scope="col">Date</th>
              <th scope="col">Customer</th>
              <th scope="col">Items</th>
              <th scope="col">Total</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.ref}>
                <td><Link href={`/admin/orders/${o.ref}`} style={{ fontWeight: 700 }}>{o.ref}</Link></td>
                <td>{new Date(o.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</td>
                <td>{o.customer_name}<small className="muted" style={{ display: "block" }}>{o.phone} · {o.town}</small></td>
                <td>{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                <td>{ghs(o.total_pesewas)}</td>
                <td>{label[o.status] ?? o.status}</td>
              </tr>
            ))}
            {!orders.length && <tr><td colSpan={6} className="muted">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
