import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isDbConfigured, supabaseServer } from "@/lib/supabase/server";
import { signUpCustomer } from "../actions";

export const metadata: Metadata = { title: "Create account", robots: { index: false, follow: false } };

const MESSAGES: Record<string, string> = {
  email: "Enter a valid email address.",
  password: "Use a password of at least 8 characters.",
  config: "Accounts are not set up yet. Please order on WhatsApp meanwhile.",
};

export default async function SignUp({ searchParams }: { searchParams: Promise<{ error?: string; sent?: string }> }) {
  const { error, sent } = await searchParams;

  if (isDbConfigured) {
    try {
      if ((await (await supabaseServer()).auth.getUser()).data.user) redirect("/account");
    } catch {
      // Supabase unreachable: show the form so the customer sees a real error on submit.
    }
  }

  if (sent) {
    return (
      <div className="container" style={{ paddingBlock: 56 }}>
        <div className="form-card" style={{ maxWidth: 420, margin: "0 auto" }}>
          <p className="kicker">Almost there</p>
          <h1 style={{ fontSize: "1.6rem", margin: "6px 0 10px" }}>Confirm your email</h1>
          <p className="muted" style={{ marginTop: 0 }}>
            We sent you a link. Open it, then <Link href="/account/login">sign in</Link> to see your orders and ratings.
          </p>
          <p className="form-note">No email after a few minutes? Check the spam folder, or sign up again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBlock: 56 }}>
      <div className="form-card" style={{ maxWidth: 420, margin: "0 auto" }}>
        <p className="kicker">Your account</p>
        <h1 style={{ fontSize: "1.6rem", margin: "6px 0 4px" }}>Create an account</h1>
        <p className="muted" style={{ marginBottom: 18 }}>
          Optional — you can always order as a guest. An account keeps a record of what you buy, lets you
          reorder in one tap, and lets you rate products once delivered. Sign in before sending an order on
          WhatsApp so it appears here.
        </p>

        {error && (
          <p className="notice" role="alert" style={{ marginBottom: 16 }}>
            {MESSAGES[error] ?? error}
          </p>
        )}

        <form action={signUpCustomer} className="form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" maxLength={200} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={200} required />
            <span className="hint">At least 8 characters</span>
          </div>
          <button className="btn btn--block" type="submit">Create account</button>
        </form>

        <p className="form-note" style={{ marginTop: 14 }}>
          Already have an account? <Link href="/account/login">Sign in</Link> ·{" "}
          <Link href="/shop">Continue shopping as a guest</Link>
        </p>
      </div>
    </div>
  );
}
