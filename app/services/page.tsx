import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS, waLink } from "@/lib/site";
import { Camera, Chat, Code, Graduation, Shield, WhatsApp, Wifi, Wrench } from "@/components/icons";

export const metadata: Metadata = {
  title: "IT Services",
  description: "Computer repairs, network installation, CCTV, IT consultancy and training in Kumasi from F.A TECHNOLOGIES.",
};

const SERVICES = [
  {
    id: "repairs",
    icon: Wrench,
    title: "System servicing & repairs",
    lead: "Laptops and desktops diagnosed and repaired by people who explain what is wrong before they charge you.",
    items: [
      "Hardware diagnosis and repairs",
      "Operating system installation",
      "Hardware upgrades (RAM, SSD, screen, battery)",
      "Software troubleshooting",
      "Virus and malware cleanup",
      "Data recovery assessment",
      "System optimisation and maintenance",
    ],
    message: "I need a computer repair. My device is:",
  },
  {
    id: "networks",
    icon: Wifi,
    title: "Network installation & servicing",
    lead: "Home, office and shop networks planned, installed and supported — from one router to structured cabling.",
    items: [
      "Network installation and configuration",
      "Routers, switches and Wi-Fi access points",
      "Structured cabling",
      "Network troubleshooting",
      "Network monitoring and maintenance",
      "Server installation",
      "Network security configuration",
    ],
    message: "I need help with a network installation or issue:",
  },
  {
    id: "cctv",
    icon: Camera,
    title: "CCTV installation & maintenance",
    lead: "Camera systems installed properly, with remote viewing set up on your phone and a maintenance plan that makes sense.",
    items: [
      "CCTV camera installation",
      "IP camera configuration",
      "DVR / NVR installation",
      "Remote viewing setup",
      "CCTV maintenance and repairs",
      "Cabling and power for cameras",
    ],
    message: "I need a CCTV installation or repair. My location is:",
  },
  {
    id: "consultancy",
    icon: Shield,
    title: "IT consultancy",
    lead: "Straight advice on the technology your business needs — and the equipment it does not.",
    items: [
      "Technology and equipment advice",
      "IT infrastructure planning",
      "Business technology solutions",
      "IT support and maintenance arrangements",
      "Procurement guidance",
    ],
    message: "I would like IT consultancy for my business:",
  },
];

export default function Services() {
  return (
    <>
      <div className="page-head">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>IT Services</span>
          </nav>
          <h1>IT services in Kumasi</h1>
          <p>Repairs, networks, CCTV and practical technology advice — from the same team that sells and supports the equipment.</p>
        </div>
      </div>

      <div className="container">
        <div className="notice" style={{ marginTop: 26 }}>
          <strong>How it works:</strong> send us the details on WhatsApp, we agree the scope and price, then you book a drop-off or an on-site visit.
          Diagnostic results and repair quotes are confirmed before any work starts.
        </div>

        <div className="svc-list">
          {SERVICES.map((s) => (
            <section className="svc" id={s.id} key={s.id}>
              <div>
                <span className="service-ico" style={{ background: "rgba(230,0,0,.08)", color: "var(--red)" }}>
                  <s.icon size={22} />
                </span>
                <h2>{s.title}</h2>
                <p>{s.lead}</p>
                <div className="svc-cta">
                  <a
                    className="btn btn--wa btn--sm"
                    href={waLink(BUSINESS.whatsapp[0].intl, `Hello F.A TECHNOLOGIES, ${s.message}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsApp size={16} /> Book on WhatsApp
                  </a>
                  <Link className="btn btn--dark btn--sm" href="/quote">Request a quote</Link>
                </div>
              </div>
              <div>
                <ul>{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            </section>
          ))}
        </div>

        <div className="band" style={{ marginBlock: 44 }}>
          <div>
            <h2>Software and training</h2>
            <p>We also build websites and business systems, and run practical online IT courses.</p>
          </div>
          <div className="band-actions">
            <Link className="btn" href="/software"><Code size={17} /> Software development</Link>
            <Link className="btn btn--ghost" href="/courses"><Graduation size={17} /> Online courses</Link>
          </div>
        </div>
      </div>
    </>
  );
}
