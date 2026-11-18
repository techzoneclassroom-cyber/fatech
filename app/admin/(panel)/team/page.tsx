import { supabaseAdmin, roleOf, permsOf, PERMS, type Perm } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { createCoworker, setCoworkerRole } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

type Account = { id: string; email?: string | null; app_metadata?: Record<string, unknown>; created_at?: string; last_sign_in_at?: string | null };

function PermChecks({ checked, label }: { checked: Perm[]; label: string }) {
  return (
    <span className="row-wrap" style={{ gap: 10 }}>
      {PERMS.map((p) => (
        <label key={p.key} style={{ display: "flex", gap: 4, alignItems: "center", fontWeight: 500, fontSize: 13 }}>
          <input type="checkbox" name="perm" value={p.key} defaultChecked={checked.includes(p.key)} aria-label={`${p.label} for ${label}`} style={{ width: "auto" }} />
          {p.label}
        </label>
      ))}
    </span>
  );
}

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { error, saved } = await searchParams;

  const me = (await (await supabaseServer()).auth.getUser()).data.user;
  if (roleOf(me) !== "admin") {
    return (
      <>
        <h1 style={{ fontSize: "1.5rem", margin: "0 0 6px" }}>Team</h1>
        <p className="notice" role="alert">Only an admin can manage accounts.</p>
      </>
    );
  }

  let accounts: Account[] = [];
  let loadError = "";
  try {
    const { data, error: listError } = await supabaseAdmin().auth.admin.listUsers({ page: 1, perPage: 200 });
    if (listError) throw listError;
    accounts = data.users;
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load accounts.";
  }

  return (
    <>
      <h1 style={{ fontSize: "1.5rem", margin: "0 0 6px" }}>Team</h1>
      <p className="muted" style={{ margin: "0 0 18px", fontSize: 13.5 }}>
        Admins run everything, including accounts and shop settings. Give a Staff account only the parts of the dashboard it
        needs; tick more later as the shop grows.
      </p>

      {(error || loadError || saved) && (
        <p className="notice" role={error || loadError ? "alert" : "status"} style={{ marginBottom: 16 }}>
          {error ?? loadError ?? (saved && saved !== "1" ? `Account created for ${saved}.` : "Access updated.")}
        </p>
      )}

      <form action={createCoworker} className="form-card" style={{ maxWidth: 720 }}>
        <p className="kicker" style={{ marginTop: 0 }}>Add a coworker</p>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" maxLength={200} required placeholder="coworker@example.com" />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="password">Temporary password (8+ characters)</label>
          <input id="password" name="password" type="password" minLength={8} maxLength={200} required autoComplete="new-password" />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="role">Role</label>
          <select id="role" name="role" defaultValue="staff">
            <option value="staff">Staff — only the ticked areas</option>
            <option value="admin">Admin — everything, including accounts</option>
          </select>
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 13.5 }}>Staff can use</span>
          <PermChecks checked={permsOf({ id: "new", app_metadata: { role: "staff" } })} label="the new account" />
        </div>
        <button className="btn btn--dark btn--sm" type="submit" style={{ marginTop: 16 }}>Create account</button>
      </form>

      <div className="table-wrap" style={{ marginTop: 22 }}>
        <table className="admin-table">
          <thead>
            <tr><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Last sign in</th><th scope="col">Role and access</th></tr>
          </thead>
          <tbody>
            {accounts.map((a) => {
              const role = roleOf(a);
              return (
                <tr key={a.id}>
                  <td>{a.email}{a.id === me?.id && <span className="muted"> (you)</span>}</td>
                  <td>{role ?? "none"}</td>
                  <td>{a.last_sign_in_at ? new Date(a.last_sign_in_at).toLocaleDateString() : "never"}</td>
                  <td>
                    {a.id === me?.id ? (
                      <span className="muted">—</span>
                    ) : (
                      <form action={setCoworkerRole} className="row-wrap" style={{ alignItems: "flex-start" }}>
                        <input type="hidden" name="id" value={a.id} />
                        <select name="role" defaultValue={role ?? "staff"} aria-label={`Role for ${a.email}`}>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                        <PermChecks checked={permsOf(a)} label={String(a.email ?? "this account")} />
                        <button className="btn btn--sm" type="submit">Save</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {!accounts.length && <tr><td colSpan={4} className="muted">No accounts yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
