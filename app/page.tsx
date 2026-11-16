import Link from "next/link";
import { BUSINESS, waLink } from "@/lib/site";
import { CATEGORIES } from "@/lib/catalogue";
import { getFeatured } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import {
  ArrowRight, Camera, Check, Code, Graduation, Shield, Store, WhatsApp, Wifi, Wrench,
} from "@/components/icons";

const SERVICES = [
  { icon: Wrench, title: "System servicing & repairs", text: "Diagnosis, repairs, upgrades, Windows installs and data recovery assessments for laptops and desktops.", href: "/services#repairs" },
  { icon: Wifi, title: "Network installation", text: "Routers, switches, structured cabling and Wi-Fi setup for homes, offices and shops.", href: "/services#networks" },
  { icon: Camera, title: "CCTV installation", text: "Camera and recorder installation with remote viewing, plus maintenance when you need it.", href: "/services#cctv" },
  { icon: Code, title: "Software development", text: "Websites, business systems, databases and mobile apps built around how your business actually works.", href: "/software" },
  { icon: Graduation, title: "Online IT courses", text: "Practical computer, hardware, networking, software and cybersecurity fundamentals.", href: "/courses" },
  { icon: Shield, title: "IT consultancy", text: "Technology advice, infrastructure planning and support contracts for growing businesses.", href: "/services#consultancy" },
];

export const revalidate = 60;

export default async function Home() {
  const featured = await getFeatured();
  return (
    <>
      <section className="hero">
        <div className="container">
          <div>
            <span className="eyebrow">Kumasi · IT sales, services &amp; support</span>
            <h1>Your Trusted Technology &amp; Shopping Partner.</h1>
            <p>
              Quality IT equipment, electronics, kitchen appliances and reliable technology
              solutions — backed by people you can call, visit and rely on in Kumasi.
            </p>
            <div className="hero-actions">
              <Link className="btn" href="/shop">Shop Now <ArrowRight size={17} /></Link>
              <Link className="btn btn--ghost" href="/services">Explore Our Services</Link>
              <Link className="btn btn--ghost" href="/quote">Request a Quote</Link>
            </div>
            <div className="hero-points">
              <span><Check size={15} /> Order on WhatsApp</span>
              <span><Check size={15} /> Repair updates by reference</span>
              <span><Check size={15} /> Kumasi–Kwadaso</span>
            </div>
          </div>

          <div className="hero-media">
            <img
              src="/images/hero.webp"
              alt="Laptop, CCTV camera, router and network tools on a workshop bench"
              width={1400}
              height={933}
              fetchPriority="high"
            />
            <a
              className="hero-card"
              href={waLink(BUSINESS.whatsapp[0].intl, "Hello F.A TECHNOLOGIES, I have a question.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="ico"><WhatsApp size={22} /></span>
              <span>
                <b>Chat with us on WhatsApp</b>
                <small>{BUSINESS.phone} · quick answers on stock, prices and repairs</small>
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Shop by category</span>
              <h2>What are you looking for?</h2>
              <p>Five departments, one trusted store — from office equipment to the kitchen and living room.</p>
            </div>
            <Link className="link-more" href="/shop">All products <ArrowRight size={15} /></Link>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/shop?cat=${c.slug}`} className="cat-card">
                <img src={c.image} alt="" width={900} height={675} loading="lazy" />
                <span className="cat-body">
                  <strong>{c.name}</strong>
                  <span>{c.short}</span>
                  <span className="go">Browse <ArrowRight size={13} /></span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--sand section--tight">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">New in the shop</span>
              <h2>Popular picks</h2>
              <p>Sample items while we load the live catalogue. Every price, warranty and spec is confirmed on WhatsApp before you pay.</p>
            </div>
            <Link className="link-more" href="/shop">View the shop <ArrowRight size={15} /></Link>
          </div>
          <div className="product-grid">
            {featured.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Services</span>
              <h2>We fix all your system &amp; network challenges</h2>
              <p>From a single laptop to a full office network and CCTV system — the same team sells it, installs it and supports it.</p>
            </div>
            <Link className="link-more" href="/services">All services <ArrowRight size={15} /></Link>
          </div>
          <div className="service-grid">
            {SERVICES.map((s) => (
              <div className="service-card" key={s.title}>
                <span className="service-ico"><s.icon size={22} /></span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <Link href={s.href}>Learn more <ArrowRight size={14} /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Why F.A TECHNOLOGIES</span>
              <h2>Local, reachable and straight with you</h2>
            </div>
          </div>
          <div className="why-grid">
            <div className="why">
              <span className="num">01</span>
              <h3>Real people in Kumasi</h3>
              <p>Based at Kumasi–Kwadaso. Call, message or visit — you are not dealing with an anonymous online shop.</p>
            </div>
            <div className="why">
              <span className="num">02</span>
              <h3>Clear item details</h3>
              <p>Condition, warranty and specifications are stated on each item, and confirmed again before payment.</p>
            </div>
            <div className="why">
              <span className="num">03</span>
              <h3>Order without a long form</h3>
              <p>Build a cart, add your delivery details, and send the whole order to us on WhatsApp in one message.</p>
            </div>
            <div className="why">
              <span className="num">04</span>
              <h3>Support after the sale</h3>
              <p>Repairs, upgrades, networking and CCTV come from the same team that sold you the equipment.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="band">
          <div>
            <h2>Need a repair, a quote or a bulk order?</h2>
            <p>Tell us what you need. We will confirm price, availability and delivery before anything is paid.</p>
          </div>
          <div className="band-actions">
            <a
              className="btn btn--wa"
              href={waLink(BUSINESS.whatsapp[0].intl, "Hello F.A TECHNOLOGIES, I would like some help.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsApp size={18} /> WhatsApp us
            </a>
            <Link className="btn" href="/quote">Request a Quote</Link>
            <Link className="btn btn--ghost" href="/shop"><Store size={17} /> Visit the shop</Link>
          </div>
        </div>
      </div>
    </>
  );
}
