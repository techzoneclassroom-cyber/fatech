import type { Metadata } from "next";
import Link from "next/link";
import { waLink } from "@/lib/site";
import { getContact } from "@/lib/contact-server";
import { Graduation, WhatsApp } from "@/components/icons";

export const metadata: Metadata = {
  title: "Online IT Courses",
  description: "Practical online IT courses in computer fundamentals, hardware, networking, software development and cybersecurity from F.A TECHNOLOGIES.",
};

const COURSES = [
  { title: "Computer fundamentals", topics: ["Using Windows confidently", "Files, folders and backups", "Email, browsing and online safety", "Everyday office documents"] },
  { title: "Computer hardware", topics: ["Components and compatibility", "Assembling and upgrading a PC", "Diagnosing common faults", "Storage, RAM and power basics"] },
  { title: "Networking", topics: ["IP addressing and subnets", "Routers, switches and Wi-Fi", "Cabling and testing", "Basic network troubleshooting"] },
  { title: "Software development", topics: ["HTML, CSS and JavaScript", "Version control with Git", "Building a small web app", "Working with APIs"] },
  { title: "Cybersecurity basics", topics: ["Passwords and account security", "Phishing and social engineering", "Safe browsing and backups", "Basic device hardening"] },
  { title: "IT support practice", topics: ["Handling support requests", "Diagnosis and documentation", "Customer communication", "Preventive maintenance"] },
];

export default async function Courses() {
  const contact = await getContact();
  return (
    <>
      <div className="page-head">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>Online Courses</span>
          </nav>
          <h1>Learn IT with a technician, not a slide deck</h1>
          <p>Short, practical online courses for people who want to understand and fix the technology they use.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="notice">
            <strong>Course details:</strong> dates, fees, class size and mode (online or in person) are confirmed on WhatsApp.
            Before you pay, we tell you exactly what you will receive at the end of the course.
          </div>
          <div className="info-grid">
            {COURSES.map((c) => (
              <div className="info-card" key={c.title}>
                <Graduation size={20} />
                <h3>{c.title}</h3>
                <ul>{c.topics.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        <div className="band">
          <div>
            <h2>Ask about the next intake</h2>
            <p>Tell us which course interests you and whether you are a beginner. We will send the schedule and fee.</p>
          </div>
          <div className="band-actions">
            <a
              className="btn btn--wa"
              href={waLink(contact.whatsapp[0].intl, "Hello F.A TECHNOLOGIES, I would like details of your IT courses.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsApp size={18} /> Ask on WhatsApp
            </a>
            <Link className="btn" href="/contact">Contact us</Link>
          </div>
        </div>
      </div>
    </>
  );
}
