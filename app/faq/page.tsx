import type { Metadata } from "next";
import Link from "next/link";
import { waLink } from "@/lib/site";
import { getContact } from "@/lib/contact-server";
import { WhatsApp } from "@/components/icons";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about ordering, delivery, payment, warranty, repairs and imports at F.A TECHNOLOGIES in Kumasi.",
};

// Built per request so the shop address can change in admin settings.
const faqs = (location: string): [string, React.ReactNode][] => [
  ["How do I place an order?", <>Browse the <Link href="/shop">shop</Link>, add items to the cart, then add your name, phone and delivery town. Press “Send order on WhatsApp” and the whole order is written out for you to send to us. We reply to confirm price, availability and delivery.</>],
  ["Are the prices and items on this site final?", <>Not yet. The shop currently shows a <strong>sample catalogue</strong> while real stock is being loaded. Treat the items and prices as examples until we confirm them with you on WhatsApp. We never take payment for an item we have not confirmed.</>],
  ["How do I pay?", <>Payment is arranged when your order is confirmed — Mobile Money or card, once our payment provider setup is complete. We do not ask for card numbers or PINs on this site or on WhatsApp. Never send money to any number that we have not confirmed to you directly.</>],
  ["Do you deliver outside Kumasi?", <>Yes where a courier route is available. Delivery cost and time are confirmed per order based on your location. You can also collect from our shop at {location}.</>],
  ["Can I return an item?", <>Faulty, damaged or wrong items should be reported as soon as possible, preferably within 48 hours of delivery. See our <Link href="/policies/returns">returns and refunds policy</Link> — it is still a draft pending the business's final approval.</>],
  ["Do you repair laptops and desktops?", <>Yes. We diagnose the fault first, then send you the repair price for approval before any work starts. Use the <Link href="/repair">repair page</Link> to book a device in.</>],
  ["How do I track my repair?", <>When we accept a device we give you a repair reference. Send that reference and the phone number used at booking on WhatsApp and we will tell you the current status. Repair details are not displayed publicly on this site.</>],
  ["Do you install CCTV and networks for businesses?", <>Yes — cameras, recorders, remote viewing, routers, switches and structured cabling. See <Link href="/services">IT services</Link>. For site work we confirm the scope and price before visiting.</>],
  ["Can you get an item you don't stock?", <>Use the <Link href="/import">import request</Link>. We check supplier price, shipping and timing, then send an estimate. Import prices are not final until a supplier and shipping cost are confirmed.</>],
  ["Are your courses certified?", <>Course topics are listed on the <Link href="/courses">courses page</Link>. Ask us what documentation you will receive before you pay — we only tell you what we can actually provide.</>],
];

export default async function FAQ() {
  const contact = await getContact();
  const FAQS = faqs(contact.location);
  return (
    <>
      <div className="page-head">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>FAQ</span>
          </nav>
          <h1>Frequently asked questions</h1>
          <p>Orders, delivery, repairs and imports — the answers people ask us most.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 30 }}>
        <div className="faq">
          {FAQS.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <div className="faq-body">{a}</div>
            </details>
          ))}
        </div>

        <div className="band" style={{ marginBlock: 40 }}>
          <div>
            <h2>Still not sure?</h2>
            <p>Send the question directly. We answer on WhatsApp and by phone during business hours.</p>
          </div>
          <div className="band-actions">
            <a
              className="btn btn--wa"
              href={waLink(contact.whatsapp[0].intl, "Hello F.A TECHNOLOGIES, I have a question.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsApp size={18} /> Ask on WhatsApp
            </a>
            <a className="btn btn--ghost" href={contact.phoneHref}>Call {contact.phone}</a>
          </div>
        </div>
      </div>
    </>
  );
}
