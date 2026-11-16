import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isDbConfigured, supabaseServer } from "@/lib/supabase/server";
import { signIn } from "../actions";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, string> = {
  invalid: "Email or password is incorrect.",
  missing: "Enter your email and password.",
  config: "Supabase isn't configured yet — follow the admin steps in the README.",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  let user: { email?: string | null } | null = null;
  if (isDbConfigured) {
    try {
      user = (await (await supabaseServer()).auth.getUser()).data.user;
    } catch {
      // Supabase unreachable: show the form so the user sees a real error on submit.
    }
  }
  if (user) redirect("/admin");

  return (
    <div className="container" style={{ paddingBlock: 56 }}>
      <div className="form-card" style={{ maxWidth: 420, margin: "0 auto" }}>
        <p className="kicker">Staff only</p>
        <h1 style={{ fontSize: "1.6rem", margin: "6px 0 4px" }}>Admin sign in</h1>
        <p className="muted" style={{ marginBottom: 18 }}>
          Products, orders and promotions. Not linked from the public site.
        </p>

        {error && MESSAGES[error] && (
          <p className="notice" role="alert" style={{ marginBottom: 16 }}>{MESSAGES[error]}</p>
        )}

        <form action={signIn} className="form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="username" maxLength={200} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" maxLength={200} required />
          </div>
          <button className="btn btn--block" type="submit">Sign in</button>
        </form>

        <p className="form-note" style={{ marginTop: 14 }}>
          Lost the password? Reset it from the Supabase dashboard. <Link href="/">Back to the shop</Link>
        </p>
      </div>
    </div>
  );
}
