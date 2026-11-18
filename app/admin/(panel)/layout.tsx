import Link from "next/link";
import { redirect } from "next/navigation";
import { isDbConfigured, supabaseServer } from "@/lib/supabase/server";
import { isAdminConfigured, permsOf, roleOf } from "@/lib/supabase/admin";
import { signOut } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Reads need the project URL + publishable key; every dashboard write needs the service key too.
  if (!isDbConfigured || !isAdminConfigured) {
    return (
      <div className="container" style={{ paddingBlock: 48 }}>
        <div className="form-card" style={{ maxWidth: 640 }}>
          <p className="kicker">Admin</p>
          <h1 style={{ fontSize: "1.55rem", margin: "6px 0 10px" }}>
            {isDbConfigured ? "Add the server write key" : "Connect the catalogue first"}
          </h1>
          <p className="muted" style={{ marginTop: 0 }}>
            {isDbConfigured
              ? "The shop can read products, but saving anything needs SUPABASE_SERVICE_ROLE_KEY on the server."
              : "The dashboard needs a Supabase project. Until it is connected, the shop keeps using the built-in sample catalogue and no admin can sign in."}
          </p>
          <ol className="steps">
            <li>Create a project at supabase.com, then run <code>supabase/migrations/001_init.sql</code>, <code>supabase/migrations/002_admin.sql</code> and <code>supabase/seed.sql</code> in the SQL editor.</li>
            <li>Add a user under Authentication → Users (email and password, confirmed).</li>
            <li>Set <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code>, then rebuild.</li>
          </ol>
          <p className="form-note">Full steps are in the README under “Admin setup”.</p>
        </div>
      </div>
    );
  }

  let user: { id: string; email?: string | null; app_metadata?: Record<string, unknown> } | null = null;
  try {
    user = (await (await supabaseServer()).auth.getUser()).data.user;
  } catch {
    // Fail closed: an unreachable auth server must not open the dashboard.
  }
  if (!user) redirect("/admin/login");

  // Signing up is disabled, but a role check keeps any stray account out of the dashboard.
  const role = roleOf(user);
  const perms = permsOf(user);
  if (!role) {
    return (
      <div className="container" style={{ paddingBlock: 48 }}>
        <div className="form-card" style={{ maxWidth: 560 }}>
          <p className="kicker">No access</p>
          <h1 style={{ fontSize: "1.4rem", margin: "6px 0 10px" }}>This account has no dashboard role</h1>
          <p className="muted" style={{ marginTop: 0 }}>
            Ask an admin to add <b>{user.email}</b> as staff, then sign in again.
          </p>
          <form action={signOut}>
            <button className="btn btn--sm" type="submit">Sign out</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-bar">
        <div className="container">
          <b>F.A TECHNOLOGIES <span className="admin-tag">Admin</span></b>
          <nav className="admin-nav" aria-label="Admin">
            <Link href="/admin">Dashboard</Link>
            {perms.includes("products") && <Link href="/admin/products">Products</Link>}
            {perms.includes("orders") && <Link href="/admin/orders">Orders</Link>}
            {perms.includes("products") && <Link href="/admin/import">Import</Link>}
            {perms.includes("promotions") && <Link href="/admin/promotions">Promotions</Link>}
            {perms.includes("settings") && <Link href="/admin/settings">Settings</Link>}
            {role === "admin" && <Link href="/admin/team">Team</Link>}
          </nav>
          <div className="admin-tools">
            <span className="admin-who">{user.email} · {role}</span>
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
