export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const BUSINESS = {
  name: "F.A TECHNOLOGIES",
  tagline: "Digital, Secure and Reliable.",
  location: "Kumasi–Kwadaso, Ghana",
  phone: "054 257 5486",
  phoneHref: "tel:+233542575486",
  email: "f.a.enterprisegh@gmail.com",
  whatsapp: [
    { label: "054 257 5486", intl: "233542575486" },
    { label: "059 243 0443", intl: "233592430443" },
  ],
};

export const waLink = (intl: string, text: string) =>
  `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;

// Prices are stored in pesewas, like the original store schema.
export const ghs = (pesewas: number) =>
  "GH₵" + (pesewas / 100).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
