import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS, waLink } from "@/lib/site";
import { EnquiryForm } from "@/components/enquiry-form";
import { Mail, Phone, Pin, WhatsApp } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact F.A TECHNOLOGIES in Kumasi–Kwadaso by phone, WhatsApp or email for products, repairs, quotes and IT services.",
};

export default function Contact() {
  return (
    <>
      <div className="page-head">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>Contact</span>
          </nav>
          <h1>Talk to F.A TECHNOLOGIES</h1>
          <p>Call, message or send an enquiry. We reply with a clear answer, a price and the next step.</p>
        </div>
      </div>

      <div className="container">
        <div className="contact-grid">
          <div className="contact-card">
            <span className="ico"><Phone size={20} /></span>
            <b>Call us</b>
            <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
          </div>
          {BUSINESS.whatsapp.map((w) => (
            <div className="contact-card" key={w.intl}>
              <span className="ico"><WhatsApp size={20} /></span>
              <b>WhatsApp</b>
              <a href={waLink(w.intl, "Hello F.A TECHNOLOGIES")} target="_blank" rel="noopener noreferrer">{w.label}</a>
            </div>
          ))}
          <div className="contact-card">
            <span className="ico"><Mail size={20} /></span>
            <b>Email</b>
            <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
          </div>
          <div className="contact-card">
            <span className="ico"><Pin size={20} /></span>
            <b>Visit</b>
            <span>{BUSINESS.location}</span>
          </div>
        </div>

        <div className="split" style={{ alignItems: "start", paddingBottom: 20 }}>
          <div className="form-card">
            <h2 style={{ marginTop: 0, fontSize: "1.35rem" }}>Send an enquiry</h2>
            <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
              Write your message here and send it to us on WhatsApp. We keep your details only to answer this request.
            </p>
            <EnquiryForm
              subject="I have an enquiry"
              submitLabel="Send enquiry on WhatsApp"
              fields={[
                { name: "name", label: "Full name", required: true, half: true, maxLength: 100, autoComplete: "name" },
                { name: "phone", label: "Phone number", type: "tel", required: true, half: true, pattern: "[0-9+ ]{9,15}", placeholder: "054 000 0000", autoComplete: "tel" },
                { name: "email", label: "Email", type: "email", half: true, maxLength: 120, autoComplete: "email" },
                { name: "subject", label: "What is this about?", type: "select", required: true, half: true, options: ["General enquiry", "Product availability", "Repair or IT service", "Bulk or wholesale order", "Software project", "Course or training"] },
                { name: "message", label: "Message", type: "textarea", required: true, maxLength: 1000, placeholder: "Tell us what you need. Include a model number or reference if you have one." },
              ]}
            />
          </div>

          <div>
            <div className="form-card">
              <h2 style={{ marginTop: 0, fontSize: "1.2rem" }}>Visiting the shop</h2>
              <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>
                We are at <strong>{BUSINESS.location}</strong>. Call or message before you come for a repair or a
                collection so we can have the item or technician ready.
              </p>
              <p className="form-note">
                Bring the device, charger and any accessories that came with it for repairs.
                For network or CCTV site visits, send your location on WhatsApp and we will confirm the arrangement.
              </p>
              <div className="row-wrap">
                <a className="btn btn--wa btn--sm" href={waLink(BUSINESS.whatsapp[0].intl, "Hello F.A TECHNOLOGIES, I would like directions to your shop.")} target="_blank" rel="noopener noreferrer">
                  <WhatsApp size={16} /> Ask for directions
                </a>
                <a className="btn btn--dark btn--sm" href={BUSINESS.phoneHref}>Call {BUSINESS.phone}</a>
              </div>
            </div>

            <p className="form-note" style={{ marginTop: 16 }}>
              For quotes and import requests, use the <Link href="/quote" style={{ textDecoration: "underline" }}>quote form</Link> or the{" "}
              <Link href="/import" style={{ textDecoration: "underline" }}>import request</Link> so we get all the details at once.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
