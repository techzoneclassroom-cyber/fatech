"use client";
import { useState } from "react";
import Link from "next/link";
import { addItem } from "@/lib/cart";
import { BUSINESS, waLink } from "@/lib/site";
import { Check, WhatsApp } from "@/components/icons";

type BuyProps = { id: string; name: string; price: number };

export function BuyBox({ product }: { product: BuyProps }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const enquire = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Hello F.A TECHNOLOGIES, I'm interested in ${product.name}.${url ? ` Link: ${url}` : ""} Please confirm the price, condition, warranty and availability.`;
    window.open(waLink(BUSINESS.whatsapp[0].intl, text), "_blank", "noopener,noreferrer");
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
        <button
          className="btn"
          type="button"
          onClick={() => { addItem(product, qty); setAdded(true); }}
        >
          {added ? <><Check size={17} /> Added to cart</> : "Add to cart"}
        </button>
        <button className="btn btn--wa" type="button" onClick={enquire}>
          <WhatsApp size={17} /> Ask on WhatsApp
        </button>
      </div>
      {added && (
        <p className="form-note" style={{ marginBottom: 14 }}>
          Added {qty} × {product.name}. <Link href="/cart" style={{ fontWeight: 700, textDecoration: "underline" }}>Go to cart</Link>
        </p>
      )}
    </>
  );
}
