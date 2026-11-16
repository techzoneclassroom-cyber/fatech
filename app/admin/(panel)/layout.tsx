import Link from "next/link";
import { redirect } from "next/navigation";
import { isDbConfigured, supabaseServer } from "@/lib/supabase/server";
import { signOut } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!isDbConfigured) {
    return (
      <div className="container" style={{ paddingBlock: 48 }}>
        <div className="form-card" style={{ maxWidth: 640 }}>
          <p className="kicker">Admin</p>
          <h1 style={{ fontSize: "1.55rem", margin: "6px 0 10px" }}>Connect the catalogue first</h1>
          <p className="muted" style={{ marginTop: 0 }}>
            The dashboard needs a Supabase project. Until it is connected, the shop keeps using the
            built-in sample catalogue and no admin can sign in.
          </p>
          <ol className="steps">
            <li>Create a project at supabase.com, then run <code>supabase/migrations/001_init.sql</code> and <code>supabase/seed.sql</code> in the SQL editor.</li>
            <li>Add a user under Authentication → Users (email and password, confirmed).</li>
            <li>Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>, then rebuild.</li>
          </ol>
          <p className="form-note">Full steps are in the README under “Admin setup”.</p>
        </div>
      </div>
    );
  }

  let user: { email?: string | null } | null = null;
  try {
    user = (await (await supabaseServer()).auth.getUser()).data.user;
  } catch {
    // Fail closed: an unreachable auth server must not open the dashboard.
  }
  if (!user) redirect("/admin/login");

  return (
    <>
      <div className="admin-bar">
        <div className="container">
          <b>F.A TECHNOLOGIES <span className="admin-tag">Admin</span></b>
          <nav className="admin-nav" aria-label="Admin">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/products">Products</Link>
            <Link href="/admin/orders">Orders</Link>
            <Link href="/admin/import">Import</Link>
            <Link href="/admin/promotions">Promotions</Link>
          </nav>
          <div className="admin-tools">
            <span className="admin-who">{user.email}</span>
            <form action={signOut}>
              <button className="btn btn--sm" type="submit">Sign out</button>
            </form>
          </div>
        </div>
      </div>
      <div className="container" style={{ paddingBlock: 28 }}>{children}</div>
    </>
  );
}
