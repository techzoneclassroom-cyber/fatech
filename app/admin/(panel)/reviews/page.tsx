import Link from "next/link";
import { listReviews } from "@/lib/admin/data";
import { setReviewHidden } from "../../actions";

export const dynamic = "force-dynamic";

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ error?: string; shown?: string; hidden?: string }> }) {
  const { error, shown, hidden } = await searchParams;
  let reviews: Awaited<ReturnType<typeof listReviews>> = [];
  let loadError = "";
  try {
    reviews = await listReviews();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load ratings.";
  }

  return (
    <>
      <h1 style={{ fontSize: "1.5rem", margin: "0 0 6px" }}>Ratings</h1>
      <p className="muted" style={{ margin: "0 0 18px", fontSize: 13.5 }}>
        Customers rate a product once their order is marked delivered. Hidden ratings stay on record but drop out of the shop.
      </p>

      {(error || loadError || shown || hidden) && (
        <p className="notice" role={error || loadError ? "alert" : "status"} style={{ marginBottom: 16 }}>
          {error ?? loadError ?? (shown ? "Rating is visible again." : "Rating hidden from the shop.")}
        </p>
      )}

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Product</th>
              <th scope="col">Stars</th>
              <th scope="col">Order</th>
              <th scope="col">Shown</th>
              <th scope="col"><span className="sr-only">Action</span></th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                <td><Link href={`/product/${r.product_slug}`} style={{ fontWeight: 700 }}>{r.product_slug}</Link></td>
                <td><span style={{ color: "var(--gold)" }} aria-label={`${r.rating} of 5`}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span></td>
                <td><Link href={`/admin/orders/${r.order_ref}`}>{r.order_ref}</Link></td>
                <td>{r.hidden ? "Hidden" : "Yes"}</td>
                <td>
                  <form action={setReviewHidden}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="slug" value={r.product_slug} />
                    <input type="hidden" name="hidden" value={String(r.hidden)} />
                    <button className="btn btn--sm" type="submit">{r.hidden ? "Show" : "Hide"}</button>
                  </form>
                </td>
              </tr>
            ))}
            {!reviews.length && <tr><td colSpan={6} className="muted">No ratings yet. They appear after a delivered order is rated.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
