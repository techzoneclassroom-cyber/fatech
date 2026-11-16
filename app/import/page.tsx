import type { Metadata } from "next";
import Link from "next/link";
import { EnquiryForm } from "@/components/enquiry-form";

export const metadata: Metadata = {
  title: "Import Request",
  description: "Request a special-order or importation quote for products not stocked by F.A TECHNOLOGIES in Kumasi.",
};

export default function ImportPage() {
  return (
    <>
      <div className="page-head">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>Import Request</span>
          </nav>
          <h1>Import or special order</h1>
          <p>Looking for an item we do not stock? Send the details and we will check supplier price, shipping and delivery time.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBlock: 32 }}>
        <div className="notice" style={{ marginBottom: 22 }}>
          <strong>Please note:</strong> import prices are estimates until a supplier confirms. Exchange rates,
          shipping and customs duties can change the final cost. We will not promise a landed price until it is confirmed in writing.
        </div>

        <div className="form-card" style={{ maxWidth: 780 }}>
          <EnquiryForm
            subject="I would like to request an import or special order"
            submitLabel="Send import request on WhatsApp"
            fields={[
              { name: "name", label: "Full name", required: true, half: true, maxLength: 100, autoComplete: "name" },
              { name: "phone", label: "Phone number", type: "tel", required: true, half: true, pattern: "[0-9+ ]{9,15}", placeholder: "054 000 0000", autoComplete: "tel" },
              { name: "email", label: "Email", type: "email", half: true, maxLength: 120, autoComplete: "email" },
              { name: "qty", label: "Quantity", type: "number", half: true, placeholder: "1" },
              { name: "product", label: "Product name", required: true, maxLength: 200, placeholder: "Exact model or the closest name you know" },
              { name: "link", label: "Reference link", type: "url", maxLength: 400, placeholder: "https://" },
              { name: "specs", label: "Specifications", maxLength: 500, placeholder: "Model, colour, size, capacity, version — whatever matters" },
              { name: "destination", label: "Deliver to", required: true, maxLength: 150, placeholder: "Town / region, or pickup in Kumasi" },
              { name: "notes", label: "Anything else", type: "textarea", maxLength: 700, placeholder: "Deadline, budget range, condition preference (new / refurbished)." },
            ]}
            note="We reply with supplier options, an estimate and the expected timeline. Nothing is ordered until you approve the confirmed price."
          />
        </div>

        <p className="form-note" style={{ marginTop: 16 }}>
          Not sure it needs importing? Check the <Link href="/shop" style={{ textDecoration: "underline" }}>shop</Link> first,
          or send the item name on WhatsApp and we will tell you.
        </p>
      </div>
    </>
  );
}
