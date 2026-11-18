"use client";
import { useState } from "react";
import Link from "next/link";
import { addItem } from "@/lib/cart";
import { waLink } from "@/lib/site";
import { useContact } from "@/components/contact-provider";
import { Check, WhatsApp } from "@/components/icons";

type BuyProps = { id: string; name: string; price: number; verified: boolean };

export function BuyBox({ product }: { product: BuyProps }) {
  const contact = useContact();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const enquire = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const price = product.verified ? "" : ` The listed price (${(product.price / 100).toFixed(2)} GHS) is an example.`;
    const text = `Hello F.A TECHNOLOGIES, I'm interested in ${product.name}.${price}${url ? ` Link: ${url}` : ""} Please confirm the price, condition, warranty and availability.`;
    window.open(waLink(contact.whatsapp[0].intl, text), "_blank", "noopener,noreferrer");
  };

  const add = () => {
    addItem({ id: product.id, name: product.name, price: product.price, sample: !product.verified }, qty);
    setAdded(true);
  };

  return (
    <>
      <div className="buybar">
        <div className="qty" role="group" aria-label="Quantity">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
          <label className="sr-only" htmlFor="qty">Quantity</label>
          <input
            id="qty"
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            value={qty}
            onChange={(e) => setQty(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
          />
          <button type="button" onClick={() => setQty((q) => Math.min(50, q + 1))} aria-label="Increase quantity">+</button>
        </div>
        {product.verified ? (
          <>
            <button className="btn" type="button" onClick={add}>
              {added ? <><Check size={17} /> Added to cart</> : "Add to cart"}
            </button>
            <button className="btn btn--wa" type="button" onClick={enquire}>
              <WhatsApp size={17} /> Ask on WhatsApp
            </button>
          </>
        ) : (
          <>
            <button className="btn btn--wa" type="button" onClick={enquire}>
              <WhatsApp size={17} /> Check price &amp; availability
            </button>
            <button className="btn" type="button" onClick={add}>
              {added ? <><Check size={17} /> Added to cart</> : "Add to cart (example price)"}
            </button>
          </>
        )}
      </div>
      {added && (
        <p className="form-note" role="status" style={{ marginBottom: 14 }}>
          Added {qty} × {product.name}. <Link href="/cart" style={{ fontWeight: 700, textDecoration: "underline" }}>Go to cart</Link>
        </p>
      )}
    </>
  );
}
