import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isDbConfigured, supabaseServer } from "@/lib/supabase/server";
import { isAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import { rateProduct, signOutCustomer } from "./actions";
import { ReorderButton } from "@/components/reorder-button";
import { ghs } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };

type Item = { slug: string; name: string; qty: number; price_pesewas: number };
type OrderRow = { ref: string; created_at: string; status: string; total_pesewas: number; items: Item[] };
type ReviewRow = { order_ref: string; product_slug: string; rating: number };

const label: Record<string, string> = { new: "New", confirmed: "Confirmed", delivered: "Delivered", cancelled: "Cancelled" };
const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string; rated?: string }> }) {
  const { error, rated } = await searchParams;

  let user: { id: string; email?: string | null } | null = null;
  if (isDbConfigured) {
    try {
      user = (await (await supabaseServer()).auth.getUser()).data.user;
    } catch {
      // Sign-in is checked again on every action.
    }
  }
  if (!user) redirect("/account/login");

  let orders: OrderRow[] = [];
  let reviews: ReviewRow[] = [];
  let setup = "";
  if (isAdminConfigured) {
    const { data, error: orderError } = await supabaseAdmin()
      .from("orders")
      .select("ref,created_at,status,total_pesewas,items")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (orderError) {
      setup = orderError.message.includes("user_id")
        ? "Purchase history starts working after the shop owner runs supabase/migrations/006_accounts_reviews.sql."
        : "Could not load your orders just now. Try again shortly.";
    }
    orders = (data ?? []) as OrderRow[];
    const { data: rv } = await supabaseAdmin()
      .from("reviews")
      .select("order_ref,product_slug,rating")
      .eq("user_id", user.id);
    reviews = (rv ?? []) as ReviewRow[];
  }

  return (
    <div className="container" style={{ paddingBlock: 40 }}>
      <div className="admin-head">
        <div>
          <p className="kicker">Your account</p>
          <h1 style={{ fontSize: "1.6rem", margin: "6px 0 4px" }}>{user.email}</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            Purchases sent on WhatsApp while signed in appear here. Rate an item once its order is delivered.
          </p>
        </div>
        <form action={signOutCustomer}>
          <button className="btn btn--sm" type="submit">Sign out</button>
        </form>
      </div>

      {error && <p className="notice" role="alert" style={{ margin: "16px 0" }}>{error}</p>}
      {rated && <p className="notice" role="status" style={{ margin: "16px 0" }}>Thanks — your rating is saved.</p>}
      {setup && <p className="notice" role="alert" style={{ margin: "16px 0" }}>{setup}</p>}

      {!orders.length && !setup && (
        <div className="empty" style={{ marginTop: 26 }}>
          <h2 style={{ marginTop: 0 }}>No saved purchases yet</h2>
          <p className="muted">
            Sign in before you send an order on WhatsApp and it will appear here. Orders placed as a guest are kept
            in the shop&apos;s records but not linked to an account.
          </p>
          <div className="row-wrap" style={{ justifyContent: "center" }}>
            <Link className="btn" href="/shop">Go to shop</Link>
            <Link className="btn btn--dark" href="/cart">Your cart</Link>
          </div>
        </div>
      )}

      <div className="stack" style={{ gap: 16, marginTop: 22 }}>
        {orders.map((o) => (
          <div className="form-card" key={o.ref} style={{ maxWidth: 760 }}>
            <div className="sum-row"><span>{o.ref}</span><b>{label[o.status] ?? o.status}</b></div>
            <div className="sum-row"><span>Placed</span><b>{new Date(o.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</b></div>
            <div className="sum-row total"><span>Total</span><b>{ghs(o.total_pesewas)}</b></div>

            {o.items.map((i) => {
              const mine = reviews.find((r) => r.order_ref === o.ref && r.product_slug === i.slug);
              return (
                <div className="sum-row" key={i.slug}>
                  <span><Link href={`/product/${i.slug}`}>{i.name}</Link> × {i.qty}</span>
                  {o.status !== "delivered" ? (
                    <span className="muted" style={{ fontSize: 13 }}>{ghs(i.price_pesewas * i.qty)}</span>
                  ) : mine ? (
                    <b style={{ color: "var(--gold)" }} aria-label={`Rated ${mine.rating} of 5`}>{stars(mine.rating)}</b>
                  ) : (
                    <form action={rateProduct} style={{ display: "flex", gap: 2 }}>
                      <input type="hidden" name="ref" value={o.ref} />
                      <input type="hidden" name="slug" value={i.slug} />
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} className="rate-star" type="submit" name="rating" value={n} aria-label={`Rate ${i.name} ${n} of 5`}>★</button>
                      ))}
                    </form>
                  )}
                </div>
              );
            })}
            {o.status === "delivered" && o.items.some((i) => !reviews.find((r) => r.order_ref === o.ref && r.product_slug === i.slug)) && (
              <p className="form-note" style={{ marginTop: 10 }}>Tap a star to rate an item — one rating per product per order.</p>
            )}
            {o.items.length > 0 && <ReorderButton items={o.items} />}
          </div>
        ))}
      </div>
    </div>
  );
}
