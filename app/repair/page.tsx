import type { Metadata } from "next";
import Link from "next/link";
import { EnquiryForm } from "@/components/enquiry-form";
import { waLink } from "@/lib/site";
import { getContact } from "@/lib/contact-server";
import { WhatsApp } from "@/components/icons";

export const metadata: Metadata = {
  title: "Repair Booking & Tracking",
  description: "Book a computer, laptop or device repair with F.A TECHNOLOGIES in Kumasi and check the status using your repair reference.",
};

export default async function RepairPage() {
  const contact = await getContact();
  return (
    <>
      <div className="page-head">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>Repair</span>
          </nav>
          <h1>Book a repair or check its status</h1>
          <p>Send the device details to book it in. When we accept the device you get a repair reference — use it with your phone number to ask for an update.</p>
        </div>
      </div>

      <div className="container">
        <div className="repair-grid">
          <div className="form-card">
            <h2 style={{ marginTop: 0, fontSize: "1.3rem" }}>Book a repair</h2>
            <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>
              Tell us what is happening with the device. Bring the charger and any accessories when you drop it off.
            </p>
            <EnquiryForm
              subject="I would like to book a repair"
              submitLabel="Send repair request on WhatsApp"
              fields={[
                { name: "name", label: "Full name", required: true, half: true, maxLength: 100, autoComplete: "name" },
                { name: "phone", label: "Phone number", type: "tel", required: true, half: true, pattern: "[0-9+ ]{9,15}", placeholder: "054 000 0000", autoComplete: "tel" },
                { name: "device", label: "Device make and model", required: true, maxLength: 150, placeholder: "e.g. HP EliteBook 840 G6" },
                { name: "serial", label: "Serial number", maxLength: 80, placeholder: "If visible on the device" },
                { name: "fault", label: "What is wrong?", type: "textarea", required: true, maxLength: 700, placeholder: "What it does, when it started, and anything you already tried." },
                { name: "accessories", label: "Accessories included", maxLength: 200, placeholder: "Charger, bag, external drive…" },
              ]}
              note="Diagnosis results and the repair price are sent to you for approval before work starts."
            />
          </div>

          <div>
            <div className="form-card">
              <h2 style={{ marginTop: 0, fontSize: "1.3rem" }}>Check repair status</h2>
              <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>
                We check the status manually and reply on WhatsApp — this keeps your repair details private.
              </p>
              <EnquiryForm
                subject="I would like an update on my repair"
                submitLabel="Request status on WhatsApp"
                fields={[
                  { name: "ref", label: "Repair reference", required: true, half: true, maxLength: 40, placeholder: "e.g. A1B2C3D4" },
                  { name: "phone", label: "Phone at booking", type: "tel", required: true, half: true, pattern: "[0-9+ ]{9,15}", placeholder: "054 000 0000" },
                ]}
                note="Use the phone number you gave when the device was booked in. We will not share another customer's repair details."
              />
            </div>

            <div className="notice" style={{ marginTop: 18 }}>
              <span>
                <strong>Urgent?</strong> Call <a href={contact.phoneHref} style={{ textDecoration: "underline" }}>{contact.phone}</a> or
                WhatsApp us on{" "}
                <a href={waLink(contact.whatsapp[1].intl, "Hello F.A TECHNOLOGIES, I need urgent repair help.")} style={{ textDecoration: "underline" }} target="_blank" rel="noopener noreferrer">
                  {contact.whatsapp[1].label}
                </a>.
              </span>
            </div>

            <a
              className="btn btn--wa btn--sm"
              style={{ marginTop: 16 }}
              href={waLink(contact.whatsapp[0].intl, "Hello F.A TECHNOLOGIES, I have a repair question.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsApp size={16} /> Chat about a repair
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
