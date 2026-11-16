export type CartItem = { id: string; name: string; price: number; qty: number };

const KEY = "fa_cart";

const valid = (i: unknown): i is CartItem => {
  const x = i as CartItem;
  return !!x && typeof x.id === "string" && typeof x.name === "string" &&
    Number.isFinite(x.price) && x.price >= 0 && Number.isInteger(x.qty) && x.qty > 0 && x.qty <= 50;
};

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter(valid) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addItem(p: { id: string; name: string; price: number }, qty = 1) {
  const cart = readCart();
  const found = cart.find((x) => x.id === p.id);
  if (found) found.qty = Math.min(50, found.qty + qty);
  else cart.push({ ...p, qty: Math.min(50, Math.max(1, qty)) });
  writeCart(cart);
  return cart;
}

export function setQty(id: string, qty: number) {
  const cart = readCart().map((x) => (x.id === id ? { ...x, qty: Math.min(50, Math.max(1, Math.floor(qty) || 1)) } : x));
  writeCart(cart);
  return cart;
}

export function removeItem(id: string) {
  const cart = readCart().filter((x) => x.id !== id);
  writeCart(cart);
  return cart;
}

export function clearCart() {
  writeCart([]);
}
