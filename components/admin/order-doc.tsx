import type { Order } from "@/lib/admin/data";
import { BUSINESS, ghs } from "@/lib/site";

const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export function OrderDoc({ order, doc }: { order: Order; doc: "invoice" | "receipt" }) {
  const paid = order.status === "confirmed" || order.status === "delivered";
  const total = order.items.reduce((s, i) => s + i.price_pesewas * i.qty, 0);

  return (
    <article className="order-doc">
      <header className="doc-head">
        <div>
          <b className="doc-brand">{BUSINESS.name}</b>
          <p>{BUSINESS.location}<br />{BUSINESS.phone} · {BUSINESS.email}</p>
        </div>
        <div className="doc-title">
          <h1>{doc === "receipt" ? "Receipt" : "Invoice"}</h1>
          <span>{order.ref}</span>
        </div>
      </header>

      <div className="doc-meta">
        <div><span>Date</span><b>{date(order.created_at)}</b></div>
        <div><span>Customer</span><b>{order.customer_name}</b></div>
        <div><span>Phone</span><b>{order.phone}</b></div>
        <div><span>Delivery</span><b>{order.town}</b></div>
      </div>

      <table className="doc-table">
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

      <div className="doc-total"><span>Total</span><b>{ghs(total)}</b></div>

      {order.notes && <p className="doc-note"><b>Notes:</b> {order.notes}</p>}
      <p className="doc-note">
        {doc === "receipt"
          ? paid ? "Payment received. Thank you for your business." : "Payment has not been confirmed yet — this copy is marked unpaid."
          : "Amount due on delivery or by mobile money. Delivery cost is quoted on WhatsApp before payment."}
      </p>
      <p className="doc-foot">Prices are in Ghana cedis. {BUSINESS.tagline}</p>
    </article>
  );
}
