import type { Metadata } from "next";
import Link from "next/link";
import { waLink } from "@/lib/site";
import { getContact } from "@/lib/contact-server";
import { Check, Mail, Phone, Pin, Store, WhatsApp } from "@/components/icons";

export const metadata: Metadata = {
  title: "About Us",
  description: "F.A TECHNOLOGIES is an IT equipment, electronics and technology services business based in Kumasi–Kwadaso, Ghana.",
};

export default async function About() {
  const contact = await getContact();
  return (
    <>
      <div className="page-head">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>About Us</span>
          </nav>
          <h1>About F.A TECHNOLOGIES</h1>
          <p>An IT equipment, electronics and technology services business based in Kumasi–Kwadaso, Ghana.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="split">
            <div>
              <span className="kicker">Who we are</span>
              <h2 style={{ marginTop: 6 }}>Sell it, install it, support it.</h2>
              <p className="muted" style={{ fontSize: 15 }}>
                F.A TECHNOLOGIES supplies IT equipment, networking and security gear, kitchen and home appliances,
                and consumer electronics. Alongside the shop, our team installs and maintains networks and CCTV systems,
                repairs computers, develops software and runs practical IT training.
              </p>
              <p className="muted" style={{ fontSize: 15 }}>
                Because the same team handles the sale and the service, you get one point of contact when something
                needs configuring, upgrading or fixing.
              </p>
              <div className="stack" style={{ marginTop: 18 }}>
                <span className="row-wrap" style={{ alignItems: "center", gap: 8, fontSize: 14 }}>
                  <Check size={16} /> <span>Based at {contact.location}</span>
                </span>
                <span className="row-wrap" style={{ alignItems: "center", gap: 8, fontSize: 14 }}>
                  <Check size={16} /> <span>Order and book by phone or WhatsApp</span>
                </span>
                <span className="row-wrap" style={{ alignItems: "center", gap: 8, fontSize: 14 }}>
                  <Check size={16} /> <span>Prices and availability confirmed before payment</span>
                </span>
              </div>
              <div className="row-wrap" style={{ marginTop: 22 }}>
                <a
                  className="btn btn--wa"
                  href={waLink(contact.whatsapp[0].intl, "Hello F.A TECHNOLOGIES, I would like to know more about your business.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsApp size={17} /> Chat with us
                </a>
                <a className="btn btn--dark" href="/flyer.jpg" download>Download services flyer</a>
              </div>
            </div>

            <div>
              <div className="flyer-frame">
                <img src="/flyer.jpg" alt="F.A TECHNOLOGIES services flyer listing repairs, networking, CCTV, software development, courses and consultancy" width={729} height={1024} loading="lazy" />
              </div>
              <p className="form-note" style={{ textAlign: "center" }}>Our current services flyer. Tap “Download services flyer” above to save a copy.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--sand section--tight">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">How we work</span>
              <h2>Straight answers, confirmed prices</h2>
            </div>
          </div>
          <div className="why-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <div className="why">
              <span className="num">01</span>
              <h3>We explain it plainly</h3>
              <p>What is wrong, what it costs, and what happens if you do nothing. No pressure and no mystery line items.</p>
            </div>
            <div className="why">
              <span className="num">02</span>
              <h3>Nothing is charged unseen</h3>
              <p>Item prices, delivery and repair costs are confirmed with you before payment or work begins.</p>
            </div>
            <div className="why">
              <span className="num">03</span>
              <h3>You know who to call</h3>
              <p>Local phone and WhatsApp contacts, and a reference number for every repair you book in.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Visit or contact</span>
              <h2>Kumasi–Kwadaso, Ghana</h2>
              <p>Call ahead before visiting for a repair or pickup so we can have the right person available.</p>
            </div>
            <Link className="link-more" href="/contact">Contact details</Link>
          </div>
          <div className="contact-grid" style={{ marginBottom: 0 }}>
            <div className="contact-card">
              <span className="ico"><Pin size={20} /></span>
              <b>Location</b>
              <span>{contact.location}</span>
            </div>
            <div className="contact-card">
              <span className="ico"><Phone size={20} /></span>
              <b>Call</b>
              <a href={contact.phoneHref}>{contact.phone}</a>
            </div>
            <div className="contact-card">
              <span className="ico"><Mail size={20} /></span>
              <b>Email</b>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </div>
            <div className="contact-card">
              <span className="ico"><Store size={20} /></span>
              <b>Shop</b>
              <Link href="/shop">Browse sample products</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
