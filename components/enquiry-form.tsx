"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { BUSINESS, waLink } from "@/lib/site";
import { WhatsApp } from "./icons";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "tel" | "email" | "url" | "number" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  maxLength?: number;
  pattern?: string;
  autoComplete?: string;
  half?: boolean;
  hint?: string;
};

type Props = { subject: string; fields: Field[]; submitLabel?: string; note?: string };

export function EnquiryForm({ subject, fields, submitLabel = "Send on WhatsApp", note }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [sent, setSent] = useState<{ intl: string; text: string } | null>(null);

  const send = (intl: string) => {
    if (!formRef.current?.reportValidity()) return;
    const data = new FormData(formRef.current);
    const lines = fields
      .map((f) => {
        const value = String(data.get(f.name) ?? "").trim();
        return value ? `${f.label}: ${value}` : null;
      })
      .filter(Boolean);
    const text = [`Hello F.A TECHNOLOGIES, ${subject}.`, "", ...lines, "", "Sent from the website."].join("\n");
    setSent({ intl, text });
    window.open(waLink(intl, text), "_blank", "noopener,noreferrer");
  };

  const control = (f: Field) => {
    const common = {
      id: f.name,
      name: f.name,
      required: f.required,
      placeholder: f.placeholder,
      maxLength: f.maxLength,
      pattern: f.pattern,
      autoComplete: f.autoComplete,
    };
    if (f.type === "textarea") return <textarea {...common} />;
    if (f.type === "select") {
      return (
        <select {...common}>
          {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    return <input {...common} type={f.type ?? "text"} min={f.type === "number" ? 1 : undefined} />;
  };

  const half = fields.filter((f) => f.half);
  const full = fields.filter((f) => !f.half);

  return (
    <form
      ref={formRef}
      className="form"
      onSubmit={(e) => { e.preventDefault(); send(BUSINESS.whatsapp[0].intl); }}
    >
      {half.length > 0 && (
        <div className="form-grid">
          {half.map((f) => (
            <div className="field" key={f.name}>
              <label htmlFor={f.name}>{f.label}{!f.required && <span className="hint"> (optional)</span>}</label>
              {control(f)}
            </div>
          ))}
        </div>
      )}
      {full.map((f) => (
        <div className="field" key={f.name}>
          <label htmlFor={f.name}>{f.label}{!f.required && <span className="hint"> (optional)</span>}</label>
          {control(f)}
          {f.hint && <span className="hint">{f.hint}</span>}
        </div>
      ))}

      <button className="btn btn--wa btn--block" type="submit">
        <WhatsApp size={18} /> {submitLabel}
      </button>
      <p className="form-note">
        This opens WhatsApp with your request written out, addressed to {BUSINESS.whatsapp[0].label}.
        You can also send it to {BUSINESS.whatsapp[1].label} on WhatsApp.
      </p>
      {sent && (
        <p className="form-note">
          WhatsApp did not open?{" "}
          <a href={waLink(sent.intl, sent.text)} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, textDecoration: "underline" }}>
            Tap here to send your request.
          </a>
        </p>
      )}
      {note && <p className="form-note">{note}</p>}
      <p className="form-note">
        We use your details only to respond to this request. See our{" "}
        <Link href="/policies/privacy" style={{ textDecoration: "underline" }}>privacy policy</Link>.
      </p>
    </form>
  );
}
