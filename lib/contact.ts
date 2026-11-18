// Contact details shown across the site. DB values override these defaults;
// keep the defaults in step with supabase/migrations/004_settings.sql.
export const DEFAULT_CONTACT: Contact = {
  phone: "054 257 5486",
  phoneHref: "tel:+233542575486",
  email: "f.a.enterprisegh@gmail.com",
  location: "Kumasi–Kwadaso, Ghana",
  whatsapp: [
    { label: "054 257 5486", intl: "233542575486" },
    { label: "059 243 0443", intl: "233592430443" },
  ],
  signatory: "",
  signatureUrl: "",
};

export type Contact = {
  phone: string;
  phoneHref: string;
  email: string;
  location: string;
  whatsapp: { label: string; intl: string }[];
  signatory: string;
  signatureUrl: string;
};

export type SettingsRow = {
  id: number;
  phone: string;
  whatsapp1: string;
  whatsapp2: string;
  email: string;
  location: string;
  signatory: string;
  signature_url: string;
};

// Ghana numbers are stored as 0244…; WhatsApp links need 233244… without spaces.
export const intlPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("0") ? `233${digits.slice(1)}` : digits;
};

export const contactFromRow = (r: SettingsRow | null): Contact => {
  if (!r) return DEFAULT_CONTACT;
  const phone = r.phone.trim() || DEFAULT_CONTACT.phone;
  const numbers = [r.whatsapp1, r.whatsapp2].map((n) => n.trim()).filter(Boolean);
  const labels = numbers.length ? numbers : DEFAULT_CONTACT.whatsapp.map((w) => w.label);
  const whatsapp = labels.map((label) => ({ label, intl: intlPhone(label) }));
  // The cart offers both numbers; leave a slot free rather than crash on [1].
  while (whatsapp.length < 2) whatsapp.push(DEFAULT_CONTACT.whatsapp[whatsapp.length]);
  return {
    phone,
    phoneHref: `tel:+${intlPhone(phone)}`,
    email: r.email.trim() || DEFAULT_CONTACT.email,
    location: r.location.trim() || DEFAULT_CONTACT.location,
    whatsapp,
    signatory: r.signatory.trim(),
    signatureUrl: r.signature_url,
  };
};
