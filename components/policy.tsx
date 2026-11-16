import Link from "next/link";
import { BUSINESS } from "@/lib/site";

export function Policy({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <>
      <div className="page-head">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>Policies</span> <span aria-hidden="true">/</span> <span>{title}</span>
          </nav>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
      </div>

      <div className="container">
        <article className="prose">
          <p className="draft">
            <strong>Draft policy.</strong> This is a working draft prepared for F.A TECHNOLOGIES and must be reviewed
            and approved by the business before launch. It is not legal advice.
          </p>
          {children}
          <hr className="rule" />
          <p className="small muted">
            Questions about this policy? Email <a href={`mailto:${BUSINESS.email}`} style={{ textDecoration: "underline" }}>{BUSINESS.email}</a>{" "}
            or message us on WhatsApp at {BUSINESS.phone}. F.A TECHNOLOGIES · {BUSINESS.location}.
          </p>
        </article>
      </div>
    </>
  );
}
