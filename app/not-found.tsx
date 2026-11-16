import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container">
      <div className="nf">
        <p className="kicker">404</p>
        <h1>That page isn&apos;t here.</h1>
        <p>
          The link may be old or mistyped. Try the shop, our services, or simply message us and we&apos;ll point you in
          the right direction.
        </p>
        <div className="hero-actions" style={{ justifyContent: "center" }}>
          <Link className="btn" href="/shop">Browse the shop</Link>
          <Link className="btn btn--ghost" href="/services">Our services</Link>
          <Link className="btn btn--ghost" href="/contact">Contact us</Link>
        </div>
      </div>
    </div>
  );
}
