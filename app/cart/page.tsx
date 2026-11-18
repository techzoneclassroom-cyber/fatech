"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clearCart, isSample, readCart, removeItem, setQty, type CartItem } from "@/lib/cart";
import { ghs, waLink } from "@/lib/site";
import { useContact } from "@/components/contact-provider";
import { productBySlug } from "@/lib/catalogue";
import { Cart as CartIcon, WhatsApp } from "@/components/icons";
import { placeOrder } from "./actions";

type Details = { name: string; phone: string; town: string; notes: string };
type Errors = Partial<Record<"name" | "phone" | "town", string>>;

const buildMessage = (items: CartItem[], d: Details, ref = "") => {
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  return [
    "Hello F.A TECHNOLOGIES, I'd like to order:",
    ...(ref ? ["", `Order reference: ${ref}`] : []),
    "",
    ...items.map((i, n) => `${n + 1}. ${i.name} × ${i.qty} — ${ghs(i.price * i.qty)}`),
    "",
    `Items total: ${ghs(sub)}`,
    ...(items.some(isSample) ? ["(Some prices above are examples — please confirm the current prices.)"] : []),
    "",
    `Name: ${d.name.trim()}`,
    `Phone: ${d.phone.trim()}`,
    `Delivery address / town: ${d.town.trim()}`,
    ...(d.notes.trim() ? [`Notes: ${d.notes.trim()}`] : []),
    "",
    "Please confirm availability, delivery cost and payment options.",
  ].join("\n");
};

export default function CartPage() {
  const contact = useContact();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [details, setDetails] = useState<Details>({ name: "", phone: "", town: "", notes: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [review, setReview] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [order, setOrder] = useState<{ ref: string; stored: boolean } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { setItems(readCart()); setReady(true); }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const hasSample = items.some(isSample);
  const count = items.reduce((n, i) => n + i.qty, 0);

  const validate = () => {
    const e: Errors = {};
    if (details.name.trim().length < 2) e.name = "Enter your full name (at least 2 characters).";
    if (!/^[0-9+][0-9 +]{8,14}$/.test(details.phone.trim())) {
      e.phone = "Enter a phone number we can reach you on, e.g. 054 000 0000.";
    }
    if (details.town.trim().length < 2) e.town = "Enter the town or area for delivery.";
    setErrors(e);
    const first = (["name", "phone", "town"] as const).find((k) => e[k]);
    if (first) document.getElementById(first)?.focus();
    return !first;
  };

  const beginReview = (intl: string) => {
    setStatus("");
    if (!validate()) return;
    setReview(intl);
  };

  const open = async (intl: string) => {
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
    setReview(null);
  };

  const changeQty = (item: CartItem, next: number) => {
    setItems(setQty(item.id, next));
    setStatus(`Quantity for ${item.name} updated.`);
  };

  const remove = (item: CartItem) => {
    setItems(removeItem(item.id));
    setStatus(`${item.name} removed from the cart.`);
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
          <p className="sr-only" role="status">{status}</p>
        </div>
      </div>
    );
  }

  const dest = contact.whatsapp.find((w) => w.intl === review);

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
            <h2 className="sr-only">Items in your cart</h2>
            <div className="cart-list">
              {items.map((i) => {
                const product = productBySlug(i.id);
                const sample = isSample(i);
                return (
                  <div className="cart-row" key={i.id}>
                    {product ? (
                      <img src={product.image} alt="" width={78} height={64} />
                    ) : <span className="cart-thumb" aria-hidden="true" />}
                    <div>
                      <div className="cart-name">
                        <Link href={`/product/${i.id}`}>{i.name}</Link>
                        <small>{sample ? "Example price" : "Price"} · {ghs(i.price)} each</small>
                      </div>
                      <div className="cart-controls">
                        <div className="qty qty--sm" role="group" aria-label={`Quantity for ${i.name}`}>
                          <button type="button" aria-label={`Decrease quantity of ${i.name}`} onClick={() => changeQty(i, i.qty - 1)}>−</button>
                          <label className="sr-only" htmlFor={`qty-${i.id}`}>Quantity of {i.name}</label>
                          <input
                            id={`qty-${i.id}`}
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={50}
                            value={i.qty}
                            onChange={(e) => changeQty(i, Number(e.target.value))}
                          />
                          <button type="button" aria-label={`Increase quantity of ${i.name}`} onClick={() => changeQty(i, i.qty + 1)}>+</button>
                        </div>
                        <button className="cart-remove" type="button" onClick={() => remove(i)}>
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="cart-line-total">
                      <small>Line total</small>
                      {ghs(i.price * i.qty)}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="form-note" style={{ marginTop: 14 }}>
              Ordering as a guest works fine. <Link href="/account/login">Sign in</Link> or{" "}
              <Link href="/account/signup">create a free account</Link> to keep your order history and reorder in one tap.
              Your cart stays saved on this device either way.
            </p>
            <p className="form-note" style={{ marginTop: 14 }}>
              {hasSample
                ? "Items marked “Example price” use sample prices. We confirm the current price and availability before you pay."
                : "We confirm the final price and availability before you pay."}{" "}
              Delivery is quoted separately after we know your location.
            </p>
            <button
              className="cart-remove"
              type="button"
              style={{ marginTop: 8 }}
              onClick={() => {
                if (window.confirm("Remove all items from the cart?")) {
                  clearCart();
                  setItems([]);
                  setStatus("Cart cleared.");
                }
              }}
            >
              Clear cart
            </button>
            <p className="sr-only" role="status">{status}</p>
          </div>

          <aside className="cart-side">
            <h2 style={{ fontSize: "1.15rem", margin: "0 0 16px" }}>Order summary</h2>
            <div className="sum-row"><span>Items ({count})</span><span>{ghs(subtotal)}</span></div>
            <div className="sum-row"><span>Delivery</span><span className="muted">Quoted separately</span></div>
            <div className="sum-row total"><span>Subtotal</span><span>{ghs(subtotal)}</span></div>
            <p className="form-note" style={{ marginTop: 10 }}>
              Delivery is not included: the subtotal is not the final total until we quote delivery for your town.
            </p>

            {review ? (
              <div className="review" aria-live="polite">
                <h3>Check your order before WhatsApp</h3>
                <ul className="review-list">
                  {items.map((i) => (
                    <li key={i.id}>
                      <span>{i.name} × {i.qty}</span>
                      <span>{ghs(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>
                <div className="sum-row total" style={{ marginTop: 0 }}><span>Subtotal</span><span>{ghs(subtotal)}</span></div>
                {hasSample && (
                  <p className="form-note">
                    <b>Example prices:</b> the amounts above are sample prices, not a confirmed quote.
                  </p>
                )}
                <p className="form-note">Delivery is extra and quoted after we receive your town.</p>
                <p className="form-note">
                  This opens a WhatsApp chat with F.A TECHNOLOGIES on <b>{dest?.label}</b>, with the order written out.
                  You review the message and press send yourself — nothing is sent from this page.
                </p>
                <div className="stack" style={{ gap: 8 }}>
                  <button className="btn btn--wa btn--block btn--lg" type="button" onClick={() => open(review)} disabled={sending}>
                    <WhatsApp size={18} /> {sending ? "Preparing order…" : `Open WhatsApp · ${dest?.label}`}
                  </button>
                  <button className="btn btn--block" type="button" onClick={() => setReview(null)} disabled={sending}>
                    Back to edit details
                  </button>
                </div>
              </div>
            ) : (
              <form
                ref={formRef}
                className="form"
                style={{ marginTop: 18 }}
                noValidate
                onSubmit={(e) => { e.preventDefault(); beginReview(contact.whatsapp[0].intl); }}
              >
                <p className="form-note">Fields marked * are required. Notes are optional.</p>
                <div className="field">
                  <label htmlFor="name">Full name <span aria-hidden="true">*</span></label>
                  <input
                    id="name"
                    name="name"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    className={errors.name ? "input--error" : undefined}
                    aria-invalid={errors.name ? true : undefined}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    value={details.name}
                    onChange={(e) => setDetails({ ...details, name: e.target.value })}
                  />
                  {errors.name && <span className="fld-error" id="name-error">{errors.name}</span>}
                </div>
                <div className="field">
                  <label htmlFor="phone">Phone number <span aria-hidden="true">*</span></label>
                  <input
                    id="phone"
                    name="phone"
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="054 000 0000"
                    className={errors.phone ? "input--error" : undefined}
                    aria-invalid={errors.phone ? true : undefined}
                    aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
                    value={details.phone}
                    onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                  />
                  <span className="hint" id="phone-hint">Ghana format, e.g. 054 000 0000</span>
                  {errors.phone && <span className="fld-error" id="phone-error">{errors.phone}</span>}
                </div>
                <div className="field">
                  <label htmlFor="town">Delivery town / area <span aria-hidden="true">*</span></label>
                  <input
                    id="town"
                    name="town"
                    required
                    maxLength={120}
                    autoComplete="address-level2"
                    placeholder="e.g. Kwadaso, Kumasi"
                    className={errors.town ? "input--error" : undefined}
                    aria-invalid={errors.town ? true : undefined}
                    aria-describedby={errors.town ? "town-error" : undefined}
                    value={details.town}
                    onChange={(e) => setDetails({ ...details, town: e.target.value })}
                  />
                  {errors.town && <span className="fld-error" id="town-error">{errors.town}</span>}
                </div>
                <div className="field">
                  <label htmlFor="notes">Notes <span className="hint">(optional)</span></label>
                  <textarea id="notes" name="notes" maxLength={500} style={{ minHeight: 82 }}
                    placeholder="Colour preference, landmark, or anything we should know"
                    value={details.notes} onChange={(e) => setDetails({ ...details, notes: e.target.value })} />
                </div>

                <button className="btn btn--wa btn--block btn--lg" type="submit" disabled={sending}>
                  <WhatsApp size={18} /> Review order · WhatsApp {contact.whatsapp[0].label}
                </button>
                <button className="btn btn--block btn--lg" type="button" disabled={sending} onClick={() => beginReview(contact.whatsapp[1].intl)}>
                  Review order · WhatsApp {contact.whatsapp[1].label}
                </button>
                <p className="form-note">
                  You will see a summary first — nothing is sent until you review the message in WhatsApp.
                  Nothing is charged on this site.
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
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
