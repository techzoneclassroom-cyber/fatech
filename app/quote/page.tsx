import type { Metadata } from "next";
import Link from "next/link";
import { waLink } from "@/lib/site";
import { getContact } from "@/lib/contact-server";
import { EnquiryForm } from "@/components/enquiry-form";
import { WhatsApp } from "@/components/icons";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Request a quote for products, bulk orders, IT services or equipment from F.A TECHNOLOGIES in Kumasi.",
};

export default async function Quote() {
  const contact = await getContact();
  return (
    <>
      <div className="page-head">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>Request a Quote</span>
          </nav>
          <h1>Request a quote</h1>
          <p>Products, bulk orders or services. Give us the details and we will come back with a price and availability.</p>
        </div>
      </div>

      <div className="container">
        <div className="split" style={{ alignItems: "start", paddingBlock: 34 }}>
          <div className="form-card">
            <EnquiryForm
              subject="I would like a quotation"
              submitLabel="Send quote request on WhatsApp"
              fields={[
                { name: "name", label: "Full name", required: true, half: true, maxLength: 100, autoComplete: "name" },
                { name: "phone", label: "Phone number", type: "tel", required: true, half: true, pattern: "[0-9+ ]{9,15}", placeholder: "054 000 0000", autoComplete: "tel" },
                { name: "email", label: "Email", type: "email", half: true, maxLength: 120, autoComplete: "email" },
                { name: "type", label: "Quote type", type: "select", required: true, half: true, options: ["Product quote", "Bulk / wholesale order", "IT service", "Repair", "Software project", "Other"] },
                { name: "item", label: "Product or service", required: true, maxLength: 200, placeholder: "e.g. 5 × HP EliteBook 840 G6, or network installation for a shop" },
                { name: "quantity", label: "Quantity", type: "number", half: true, placeholder: "1" },
                { name: "location", label: "Delivery location", half: true, maxLength: 120, placeholder: "Town / region" },
                { name: "details", label: "Details", type: "textarea", required: true, maxLength: 1000, placeholder: "Specifications, deadline, site details or anything else we should know." },
              ]}
              note="Quotes are confirmed in writing on WhatsApp or email. Nothing is ordered until you approve the price."
            />
          </div>

          <div>
            <div className="form-card">
              <h2 style={{ marginTop: 0, fontSize: "1.2rem" }}>What happens next</h2>
              <ol className="muted" style={{ paddingLeft: 18, fontSize: 14, lineHeight: 1.8 }}>
                <li>You send the request with the details you have.</li>
                <li>We confirm the price, condition and availability.</li>
                <li>You approve; we agree delivery or pickup.</li>
                <li>Payment and delivery are arranged and confirmed.</li>
              </ol>
              <p className="form-note">
                Urgent? Call <a href={contact.phoneHref} style={{ textDecoration: "underline" }}>{contact.phone}</a> or
                message us directly.
              </p>
              <a
                className="btn btn--wa btn--sm"
                href={waLink(contact.whatsapp[0].intl, "Hello F.A TECHNOLOGIES, I would like a quote.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsApp size={16} /> WhatsApp {contact.whatsapp[0].label}
              </a>
            </div>
            <p className="form-note" style={{ marginTop: 14 }}>
              Looking for something we do not stock? Use the <Link href="/import" style={{ textDecoration: "underline" }}>import request</Link> instead.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
