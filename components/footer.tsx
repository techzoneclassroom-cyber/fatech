import Link from "next/link";
import { waLink } from "@/lib/site";
import type { Contact } from "@/lib/contact";
import { CATEGORIES } from "@/lib/catalogue";
import { Mail, Phone, Pin, WhatsApp } from "./icons";

export function Footer({ contact }: { contact: Contact }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brandline">F.A TECHNOLOGIES</div>
            <div className="tagline">Digital, Secure and Reliable.</div>
            <div className="fcontact">
              <a href={contact.phoneHref}><Phone size={15} /> {contact.phone}</a>
              {contact.whatsapp.map((w) => (
                <a key={w.intl} href={waLink(w.intl, "Hello F.A TECHNOLOGIES")} target="_blank" rel="noopener noreferrer">
                  <WhatsApp size={15} /> {w.label}
                </a>
              ))}
              <a href={`mailto:${contact.email}`}><Mail size={15} /> {contact.email}</a>
              <span><Pin size={15} /> {contact.location}</span>
            </div>
          </div>

          <div>
            <h4>Shop</h4>
            <ul className="flinks">
              <li><Link href="/shop">All products</Link></li>
              {CATEGORIES.map((c) => (
                <li key={c.slug}><Link href={`/shop?cat=${c.slug}`}>{c.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul className="flinks">
              <li><Link href="/services">IT services</Link></li>
              <li><Link href="/software">Software development</Link></li>
              <li><Link href="/courses">Online courses</Link></li>
              <li><Link href="/about">About us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4>Orders &amp; policies</h4>
            <ul className="flinks">
              <li><Link href="/quote">Request a quote</Link></li>
              <li><Link href="/import">Import request</Link></li>
              <li><Link href="/repair">Repair booking &amp; tracking</Link></li>
              <li><Link href="/policies/shipping">Shipping &amp; delivery</Link></li>
              <li><Link href="/policies/returns">Returns &amp; refunds</Link></li>
              <li><Link href="/policies/privacy">Privacy</Link></li>
              <li><Link href="/policies/terms">Terms</Link></li>
              <li><Link href="/policies/cookies">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} F.A TECHNOLOGIES · {contact.location}</span>
          <span>Prices in Ghana cedis (GHS). Sample entries show example prices — price and availability are confirmed on WhatsApp.</span>
        </div>
      </div>
    </footer>
  );
}
