import type { Metadata } from "next";
import Link from "next/link";
import { Policy } from "@/components/policy";

export const metadata: Metadata = {
  title: "Cookie Notice",
  description: "What this website stores in your browser, and how to clear it.",
};

export default function CookiesPolicy() {
  return (
    <Policy
      title="Cookie notice"
      intro="This site keeps things simple: it does not run advertising or analytics cookies."
    >
      <h2>No tracking cookies</h2>
      <p>
        This website does not set advertising, analytics or social-media tracking cookies. We do not profile visitors
        across other websites.
      </p>

      <h2>What is stored in your browser</h2>
      <p>
        Your shopping cart is saved in local storage under the key <code>fa_cart</code> so items stay in the cart when
        you move between pages or come back later. It contains only the item identifiers, names, prices and quantities
        you added. It stays on your device and is never sent to us automatically.
      </p>

      <h2>Essential technical storage</h2>
      <p>
        Our hosting provider may keep short-lived technical records needed to serve pages securely, such as server logs.
        These are not used to build a profile of you.
      </p>

      <h2>Third-party embeds</h2>
      <p>
        Contact buttons open WhatsApp, your phone dialler or your email app. Once you leave this site those services set
        their own cookies and apply their own policies.
      </p>

      <h2>Clearing your cart</h2>
      <p>
        Use &quot;Clear cart&quot; on the <Link href="/cart">cart page</Link>, or clear site data in your browser settings.
        Either removes the saved cart from your device.
      </p>
    </Policy>
  );
}
