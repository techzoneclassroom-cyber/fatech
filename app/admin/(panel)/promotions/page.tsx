import Link from "next/link";
import { listPromotions, type Promotion } from "@/lib/admin/data";
import { savePromotion, togglePromotion, deletePromotion } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function PromotionsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;
  let promos: Promotion[] = [];
  let loadError = "";
  try {
    promos = await listPromotions();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load promotions.";
  }

  return (
    <>
      <h1 style={{ fontSize: "1.5rem", margin: "0 0 6px" }}>Promotions</h1>
      <p className="muted" style={{ margin: "0 0 18px", fontSize: 13.5 }}>
        The newest active message shows as a banner above the header on every page, within a minute of saving.
      </p>

      {(error || loadError || saved) && (
        <p className="notice" role={error || loadError ? "alert" : "status"} style={{ marginBottom: 16 }}>
          {error ?? loadError ?? "Promotion saved."}
        </p>
      )}

      <form action={savePromotion} className="form-card" style={{ maxWidth: 640 }}>
        <div className="field">
          <label htmlFor="message">Message</label>
          <input id="message" name="message" maxLength={200} required placeholder="Festive sale on laptops — 10% off this week" />
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label htmlFor="href">Link (internal path)</label>
          <input id="href" name="href" defaultValue="/shop" placeholder="/shop" />
        </div>
        <button className="btn btn--dark btn--sm" type="submit" style={{ marginTop: 16 }}>Publish banner</button>
      </form>

      <div className="table-wrap" style={{ marginTop: 22 }}>
        <table className="admin-table">
          <thead>
            <tr><th scope="col">Message</th><th scope="col">Link</th><th scope="col">Active</th><th scope="col">Actions</th></tr>
          </thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p.id}>
                <td>{p.message}</td>
                <td><Link href={p.href} className="muted">{p.href}</Link></td>
                <td>{p.active ? "Yes" : "No"}</td>
                <td>
                  <div className="row-wrap">
                    <form action={togglePromotion}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="active" value={String(p.active)} />
                      <button className="btn btn--sm" type="submit">{p.active ? "Hide" : "Show"}</button>
                    </form>
                    <form action={deletePromotion}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="btn btn--sm" type="submit">Delete</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {!promos.length && <tr><td colSpan={4} className="muted">No promotions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
