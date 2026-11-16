import type { Metadata } from "next";
import Link from "next/link";
import { Policy } from "@/components/policy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What information F.A TECHNOLOGIES collects, why, and how it is protected.",
};

export default function PrivacyPolicy() {
  return (
    <Policy
      title="Privacy policy"
      intro="What information we collect when you contact us or order, why we need it, and your rights."
    >
      <h2>Who we are</h2>
      <p>
        F.A TECHNOLOGIES is a technology and retail business based in Kumasi–Kwadaso, Ghana. We handle personal
        information in line with the Data Protection Act, 2012 (Act 843).
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Contact details</strong> you give us: name, phone number, email address and delivery town.</li>
        <li><strong>Order and enquiry details</strong>: items, quantities, notes, and device information for repairs.</li>
        <li><strong>Repair records</strong>: device model, serial number, reported fault and work carried out.</li>
        <li><strong>Messages</strong> you send us on WhatsApp, email or through the forms on this site.</li>
      </ul>
      <p>
        We do not ask for payment card numbers. Payment happens in person, through a licensed payment provider, or by
        mobile money transfer that you initiate yourself.
      </p>

      <h2>How your order reaches us</h2>
      <p>
        Forms on this website do not store your details on our servers. When you submit a form or place an order, the
        site prepares a message and opens WhatsApp on your device so that you send it from your own account. WhatsApp&apos;s
        own privacy policy then applies to the message. If you email us instead, your email provider&apos;s policy applies
        to that email.
      </p>

      <h2>Why we use it</h2>
      <ul>
        <li>To answer enquiries and prepare quotes.</li>
        <li>To arrange delivery, repairs and after-sales support.</li>
        <li>To keep records of repairs and orders so we can help you later.</li>
        <li>To meet legal, tax and accounting obligations.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We share information only where needed to complete your order — for example a courier or delivery rider needs a
        name, phone number and address. We do not sell your personal information, and we do not send marketing messages
        to people who have not asked for them.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep order and repair records for as long as needed for warranty and accounting purposes, then securely
        delete or archive them. You can ask us to delete information we no longer need to keep.
      </p>

      <h2>Your rights</h2>
      <p>
        Under Act 843 you can ask us what personal information we hold about you, ask us to correct it, or ask us to
        delete it where we are not required to keep it. Contact us using the details below.
      </p>

      <h2>Cookies and local storage</h2>
      <p>
        This site does not use advertising or analytics cookies. Your shopping cart is kept in your own browser using
        local storage. See the <Link href="/policies/cookies">cookie notice</Link> for details.
      </p>
    </Policy>
  );
}
