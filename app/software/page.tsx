import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS, waLink } from "@/lib/site";
import { Code, WhatsApp } from "@/components/icons";

export const metadata: Metadata = {
  title: "Software Development",
  description: "Websites, business management systems, databases, mobile apps and automation built by F.A TECHNOLOGIES in Kumasi.",
};

const BUILD = [
  { title: "Websites & e-commerce", text: "Company sites, product catalogues and online shops that load fast and work on a phone in poor network conditions." },
  { title: "Business management systems", text: "Sales, stock, invoices, customers and reports in one place, shaped around how your team already works." },
  { title: "Custom software", text: "Internal tools for the tasks spreadsheets have outgrown — approvals, records, schedules and tracking." },
  { title: "Database applications", text: "Structured records with proper access control, backups and the reports you actually need." },
  { title: "Mobile applications", text: "Companion apps for customers or field staff, with a practical scope and clear running costs." },
  { title: "Automation & integrations", text: "Connecting existing tools, generating documents and removing repetitive manual steps." },
];

const STEPS = [
  ["01", "Discovery", "We write down what the system must do and who uses it."],
  ["02", "Proposal", "Scope, milestones, price and assumptions, in plain language."],
  ["03", "Build", "Short iterations with something you can look at and test."],
  ["04", "Test", "We test the workflows that matter, including failure cases."],
  ["05", "Launch & support", "Deployment, handover and a support arrangement you can budget for."],
];

export default function Software() {
  return (
    <>
      <div className="page-head">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>Software Development</span>
          </nav>
          <h1>Software that fits the business</h1>
          <p>Websites, management systems, databases and automation — built to be used, not just delivered.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">What we build</span>
              <h2>Practical software, clear scope</h2>
              <p>Every project starts with a written scope, so you know what you are paying for and what is deliberately left out.</p>
            </div>
          </div>
          <div className="info-grid">
            {BUILD.map((b) => (
              <div className="info-card" key={b.title}>
                <Code size={20} />
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--sand section--tight">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">How a project runs</span>
              <h2>Five stages, no surprises</h2>
            </div>
          </div>
          <div className="steps">
            {STEPS.map(([n, title, text]) => (
              <div className="step" key={n}>
                <b>{n}</b>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        <div className="band" style={{ marginBlock: 48 }}>
          <div>
            <h2>Have a project in mind?</h2>
            <p>Send us the idea and roughly who it is for. We will tell you what is realistic, what it takes and what it should cost.</p>
          </div>
          <div className="band-actions">
            <a
              className="btn btn--wa"
              href={waLink(BUSINESS.whatsapp[0].intl, "Hello F.A TECHNOLOGIES, I would like to discuss a software project.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsApp size={18} /> Discuss on WhatsApp
            </a>
            <Link className="btn" href="/quote">Request a Quote</Link>
          </div>
        </div>
      </div>
    </>
  );
}
