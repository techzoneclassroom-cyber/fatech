"use client";
import { useRouter } from "next/navigation";
import { addItem } from "@/lib/cart";

type Line = { slug: string; name: string; qty: number; price_pesewas: number };

export function ReorderButton({ items }: { items: Line[] }) {
  const router = useRouter();
  return (
    <button
      className="btn btn--sm"
      type="button"
      style={{ marginTop: 12 }}
      onClick={() => {
        // Orders and the cart both store pesewas; no conversion.
        items.forEach((i) => addItem({ id: i.slug, name: i.name, price: i.price_pesewas, sample: false }, i.qty));
        router.push("/cart");
      }}
    >
      Reorder these items
    </button>
  );
}
