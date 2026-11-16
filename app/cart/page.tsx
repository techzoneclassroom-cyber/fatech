"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clearCart, readCart, removeItem, setQty, type CartItem } from "@/lib/cart";
import { BUSINESS, ghs, waLink } from "@/lib/site";
import { productBySlug } from "@/lib/catalogue";
import { Cart as CartIcon, WhatsApp } from "@/components/icons";
import { placeOrder } from "./actions";

const buildMessage = (items: CartItem[], d: { name: string; phone: string; town: string; notes: string }, ref = "") => {
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  return [
    "Hello F.A TECHNOLOGIES, I'd like to order:",
    ...(ref ? ["", `Order reference: ${ref}`] : []),
    "",
    ...items.map((i, n) => `${n + 1}. ${i.name} × ${i.qty} — ${ghs(i.price * i.qty)}`),
    "",
    `Items total: ${ghs(sub)}`,
    "",
    `Name: ${d.name}`,
    `Phone: ${d.phone}`,
    `Delivery address / town: ${d.town}`,
    ...(d.notes.trim() ? [`Notes: ${d.notes.trim()}`] : []),
    "",
    "Please confirm availability, delivery cost and payment options.",
  ].join("\n");
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [details, setDetails] = useState({ name: "", phone: "", town: "", notes: "" });
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [order, setOrder] = useState<{ ref: string; stored: boolean } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { setItems(readCart()); setReady(true); }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  const open = async (intl: string) => {
    if (!formRef.current?.reportValidity()) return;
    // Open the tab before awaiting so the browser still counts it as the customer's click.
    const tab = window.open("", "_blank");
    setSending(true);
    const placed = await placeOrder({
      ...details,
      items: items.map((i) => ({ slug: i.id, name: i.name, price: i.price, qty: i.qty })),
    });
    setOrder(placed);
    const link = waLink(intl, buildMessage(items, details, placed.ref));
    if (tab) tab.location.href = link; else window.open(link, "_blank", "noopener,noreferrer");
    setSentTo(intl);
    setSending(false);
  };

  if (!ready) {
    return <div className="container" style={{ paddingBlock: 60 }}><p className="muted">Loading your cart…</p></div>;
  }

  if (!items.length) {
    return (
      <div className="container">
        <div className="empty">
          <CartIcon size={40} />
          <h1 style={{ marginTop: 10 }}>Your cart is empty</h1>
          <p className="muted">Browse the shop and add what you need. Orders are confirmed on WhatsApp before payment.</p>
          <div className="row-wrap" style={{ justifyContent: "center" }}>
            <Link className="btn" href="/shop">Go to shop</Link>
            <Link className="btn btn--dark" href="/quote">Request a quote</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>Cart</span>
          </nav>
          <h1>Your cart</h1>
          <p>Check the items, add your delivery details, then send the order to us on WhatsApp.</p>
        </div>
      </div>

      <div className="container">
        <div className="cart-layout">
          <div>
            <div className="cart-list">
              {items.map((i) => {
                const product = productBySlug(i.id);
                return (
                  <div className="cart-row" key={i.id}>
                    {product ? (
                      <img src={product.image} alt="" width={78} height={64} />
                    ) : <span style={{ width: 78, height: 64, background: "#eee", borderRadius: 8 }} />}
                    <div>
                      <div className="cart-name">
                        <Link href={`/product/${i.id}`}>{i.name}</Link>
                        <small>{ghs(i.price)} each</small>
                      </div>
                      <div className="cart-controls">
                        <label className="sr-only" htmlFor={`qty-${i.id}`}>Quantity for {i.name}</label>
                        <input
                          id={`qty-${i.id}`}
                          type="number"
                          min={1}
                          max={50}
                          value={i.qty}
                          onChange={(e) => setItems(setQty(i.id, Number(e.target.value)))}
                          style={{ width: 74 }}
                        />
                        <button className="cart-remove" type="button" onClick={() => setItems(removeItem(i.id))}>
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="cart-line-total">{ghs(i.price * i.qty)}</div>
                  </div>
                );
              })}
            </div>
            <p className="form-note" style={{ marginTop: 14 }}>
              Prices are sample catalogue prices. We confirm the current price and availability before you pay.
              Delivery is calculated after we know your location.
            </p>
            <button
              className="cart-remove"
              type="button"
              style={{ marginTop: 8 }}
              onClick={() => { if (window.confirm("Remove all items from the cart?")) { clearCart(); setItems([]); } }}
            >
              Clear cart
            </button>
          </div>

          <aside className="cart-side">
            <h2 style={{ fontSize: "1.15rem", margin: "0 0 16px" }}>Order summary</h2>
            <div className="sum-row"><span>Items ({items.reduce((n, i) => n + i.qty, 0)})</span><span>{ghs(subtotal)}</span></div>
            <div className="sum-row"><span>Delivery</span><span className="muted">Confirmed on WhatsApp</span></div>
            <div className="sum-row total"><span>Subtotal</span><span>{ghs(subtotal)}</span></div>

            <form
              ref={formRef}
              className="form"
              style={{ marginTop: 18 }}
              onSubmit={(e) => { e.preventDefault(); open(BUSINESS.whatsapp[0].intl); }}
            >
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" required minLength={2} maxLength={100} autoComplete="name"
                  value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone number</label>
                <input id="phone" name="phone" required type="tel" pattern="[0-9+ ]{9,15}" autoComplete="tel"
                  placeholder="054 000 0000" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="town">Delivery town / area</label>
                <input id="town" name="town" required maxLength={120} autoComplete="address-level2"
                  placeholder="e.g. Kwadaso, Kumasi" value={details.town} onChange={(e) => setDetails({ ...details, town: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="notes">Notes <span className="hint">(optional)</span></label>
                <textarea id="notes" name="notes" maxLength={500} style={{ minHeight: 82 }}
                  value={details.notes} onChange={(e) => setDetails({ ...details, notes: e.target.value })} />
              </div>

              <button className="btn btn--wa btn--block" type="submit" disabled={sending}>
                <WhatsApp size={18} /> {sending ? "Preparing order…" : "Send order on WhatsApp"}
              </button>
              <button className="btn btn--block" type="button" disabled={sending} onClick={() => open(BUSINESS.whatsapp[1].intl)}>
                Send to {BUSINESS.whatsapp[1].label} instead
              </button>
              <p className="form-note">
                Opens WhatsApp with your order written out. Nothing is charged on this site — we confirm everything first.
              </p>
              {order && (
                <p className="form-note" role="status">
                  Order reference <b>{order.ref}</b>
                  {order.stored ? " — saved in the shop's records." : " — not saved (the online records are offline); quote this reference when you chat with us."}
                </p>
              )}
              {sentTo && (
                <p className="form-note">
                  WhatsApp did not open?{" "}
                  <a href={waLink(sentTo, buildMessage(items, details, order?.ref))} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, textDecoration: "underline" }}>
                    Tap here to send the order.
                  </a>
                </p>
              )}
            </form>
          </aside>
        </div>
      </div>
    </>
  );
}
