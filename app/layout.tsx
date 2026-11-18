import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import { getContact } from "@/lib/contact-server";
import { ContactProvider } from "@/components/contact-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Assistant } from "@/components/assistant";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Sora({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "F.A TECHNOLOGIES | IT equipment, electronics and IT services in Kumasi",
    template: "%s | F.A TECHNOLOGIES",
  },
  description:
    "Quality IT equipment, electronics, kitchen appliances and reliable technology solutions from Kumasi–Kwadaso, Ghana. Shop, request a quote or chat with us on WhatsApp.",
  keywords: [
    "F.A TECHNOLOGIES", "Kumasi electronics shop", "IT services Ghana", "laptops Kumasi",
    "CCTV installation Kumasi", "computer repair Kumasi", "kitchen appliances Ghana",
  ],
  openGraph: {
    type: "website",
    siteName: "F.A TECHNOLOGIES",
    title: "F.A TECHNOLOGIES | Digital, Secure and Reliable",
    description: "IT equipment, electronics, appliances and technology services in Kumasi, Ghana.",
    images: [{ url: "/images/hero.webp", width: 1400, height: 933, alt: "IT equipment and networking gear" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#080808" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const contact = await getContact();
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body>
        <ContactProvider value={contact}>
          <Header contact={contact} />
          <main id="main">{children}</main>
          <Footer contact={contact} />
          <Assistant />
        </ContactProvider>
      </body>
    </html>
  );
}
