import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isDbConfigured, supabaseServer } from "@/lib/supabase/server";
import { signInCustomer } from "../actions";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

const MESSAGES: Record<string, string> = {
  invalid: "Email or password is incorrect.",
  missing: "Enter your email and password.",
  config: "Accounts are not set up yet. Please order on WhatsApp meanwhile.",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  if (isDbConfigured) {
    try {
      if ((await (await supabaseServer()).auth.getUser()).data.user) redirect("/account");
    } catch {
      // Supabase unreachable: show the form so the customer sees a real error on submit.
    }
  }

  return (
    <div className="container" style={{ paddingBlock: 56 }}>
      <div className="form-card" style={{ maxWidth: 420, margin: "0 auto" }}>
        <p className="kicker">Your account</p>
        <h1 style={{ fontSize: "1.6rem", margin: "6px 0 4px" }}>Sign in</h1>
        <p className="muted" style={{ marginBottom: 18 }}>
          Optional. Sign in to see your past orders and rate products after delivery — or keep shopping as a guest.
        </p>

        {error && MESSAGES[error] && (
          <p className="notice" role="alert" style={{ marginBottom: 16 }}>{MESSAGES[error]}</p>
        )}

        <form action={signInCustomer} className="form">
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
          New here? <Link href="/account/signup">Create an account</Link> ·{" "}
          <Link href="/shop">Continue shopping as a guest</Link>
        </p>
      </div>
    </div>
  );
}
