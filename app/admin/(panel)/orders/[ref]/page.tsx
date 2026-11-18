import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/admin/data";
import { getContact } from "@/lib/contact-server";
import { setOrderStatus, deleteOrder } from "@/app/admin/actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { OrderDoc } from "@/components/admin/order-doc";
import { PrintButton } from "@/components/print-button";
import { ghs } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ doc?: string; error?: string }>;
}) {
  const { ref } = await params;
  const { doc, error } = await searchParams;
  const order = await getOrder(ref);
  if (!order) notFound();

  if (doc === "invoice" || doc === "receipt") {
    const contact = await getContact();
    return (
      <>
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <p className="form-note" style={{ margin: 0 }}><Link href={`/admin/orders/${order.ref}`}>← Back to order</Link></p>
          <PrintButton />
        </div>
        <OrderDoc order={order} doc={doc} contact={contact} />
      </>
    );
  }

  return (
    <>
      <p className="form-note" style={{ marginBottom: 10 }}><Link href="/admin/orders">← Orders</Link></p>
      <div className="admin-head">
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>{order.ref}</h1>
        <div className="row-wrap">
          <Link className="btn btn--sm" href={`/admin/orders/${order.ref}?doc=invoice`}>Invoice</Link>
          <Link className="btn btn--sm" href={`/admin/orders/${order.ref}?doc=receipt`}>Receipt</Link>
        </div>
      </div>

      {error && <p className="notice" role="alert" style={{ marginBottom: 14 }}>{error}</p>}

      <div className="form-card" style={{ maxWidth: 760, marginTop: 14 }}>
        <div className="sum-row"><span>Customer</span><b>{order.customer_name}</b></div>
        <div className="sum-row"><span>Phone</span><b>{order.phone}</b></div>
        <div className="sum-row"><span>Delivery</span><b>{order.town}</b></div>
        <div className="sum-row"><span>Placed</span><b>{new Date(order.created_at).toLocaleString("en-GB")}</b></div>
        {order.notes && <div className="sum-row"><span>Notes</span><b>{order.notes}</b></div>}
        <div className="sum-row total"><span>Total</span><b>{ghs(order.total_pesewas)}</b></div>

        <form action={setOrderStatus} style={{ display: "flex", gap: 10, alignItems: "end", flexWrap: "wrap", marginTop: 18 }}>
          <input type="hidden" name="ref" value={order.ref} />
          <div className="field" style={{ minWidth: 180 }}>
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={order.status}>
              <option value="new">New</option>
              <option value="confirmed">Confirmed</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button className="btn btn--dark btn--sm" type="submit">Update order</button>
        </form>

        <form action={deleteOrder} style={{ marginTop: 14 }}>
          <input type="hidden" name="ref" value={order.ref} />
          <ConfirmSubmit className="btn btn--sm" message={`Delete order ${order.ref}? It cannot be recovered, and its invoice or receipt link will stop working.`}>
            Delete order
          </ConfirmSubmit>
        </form>
      </div>

      <div className="table-wrap" style={{ marginTop: 20 }}>
        <table className="admin-table">
          <thead>
            <tr><th scope="col">Item</th><th scope="col">Qty</th><th scope="col">Unit</th><th scope="col">Amount</th></tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.slug}>
                <td>{i.name}</td>
                <td>{i.qty}</td>
                <td>{ghs(i.price_pesewas)}</td>
                <td>{ghs(i.price_pesewas * i.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
