import type { Order } from "@/lib/admin/data";
import type { Contact } from "@/lib/contact";
import { ghs } from "@/lib/site";

const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export function OrderDoc({ order, doc, contact }: { order: Order; doc: "invoice" | "receipt"; contact: Contact }) {
  const paid = order.status === "confirmed" || order.status === "delivered";
  const total = order.items.reduce((s, i) => s + i.price_pesewas * i.qty, 0);

  return (
    <article className="order-doc">
      <header className="doc-head">
        <div className="doc-identity">
          <img className="doc-logo" src="/logo.png" alt="" />
          <div>
            <b className="doc-brand">F.A TECHNOLOGIES</b>
            <p>{contact.location}<br />{contact.phone} · {contact.email}</p>
          </div>
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

      {/* The block always prints, so a copy without an uploaded signature still has a line to sign. */}
      <div className="doc-sign">
        <span className="doc-sign-line">
          {contact.signatureUrl
            ? <img src={contact.signatureUrl} alt={contact.signatory ? `Signature of ${contact.signatory}` : "Authorised signature"} />
            : null}
        </span>
        <b>{contact.signatory || "Authorised signature"}</b>
        <small>For F.A TECHNOLOGIES</small>
      </div>

      <p className="doc-foot">Prices are in Ghana cedis. Digital, Secure and Reliable.</p>
    </article>
  );
}
