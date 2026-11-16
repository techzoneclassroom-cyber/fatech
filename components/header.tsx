import Link from "next/link";
import { BUSINESS, waLink } from "@/lib/site";
import { NavLinks } from "./nav-links";
import { NAV } from "@/lib/nav";
import { Cart, Mail, Menu as MenuIcon, Phone, Pin, WhatsApp } from "./icons";
import { Menu } from "./menu";
import { getActivePromo } from "@/lib/promos";

export async function Header() {
  const promo = await getActivePromo();
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <div className="topbar">
        <div className="container">
          <div className="topbar-group">
            <a href={BUSINESS.phoneHref}><Phone size={14} /> {BUSINESS.phone}</a>
            <a href={waLink(BUSINESS.whatsapp[0].intl, "Hello F.A TECHNOLOGIES")} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
              <WhatsApp size={14} /> <span className="hide-sm">WhatsApp</span>
            </a>
            <a className="hide-sm" href={`mailto:${BUSINESS.email}`}><Mail size={14} /> {BUSINESS.email}</a>
          </div>
          <div className="topbar-group">
            <Link href="/repair">Track a repair</Link>
            <span className="hide-sm"><Pin size={14} /> {BUSINESS.location}</span>
          </div>
        </div>
      </div>

      {promo && (
        <div className="promo-bar">
          <div className="container">
            <Link href={promo.href}>{promo.message} <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      )}

      <header className="site-header">
        <div className="container">
          <Link href="/" className="brand" aria-label="F.A TECHNOLOGIES home">
            <img src="/logo.png" alt="F.A TECHNOLOGIES logo" width={54} height={54} />
            <span className="brand-text">
              <b>F.A TECHNOLOGIES</b>
              <span>Digital, Secure and Reliable</span>
            </span>
          </Link>

          <nav className="main-nav" aria-label="Main">
            <NavLinks />
          </nav>

          <div className="header-actions">
            <Link className="btn btn--sm" href="/quote">Request a Quote</Link>
            <Link className="cart-link" href="/cart" aria-label="Cart">
              <Cart size={17} /> <span>Cart</span>
            </Link>
            <Menu>
              <summary><MenuIcon size={18} /> Menu</summary>
              <div className="menu-panel">
                <span className="menu-note">Navigate</span>
                {NAV.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
                <span className="menu-note">Orders &amp; support</span>
                <Link href="/quote">Request a quote</Link>
                <Link href="/import">Import a product</Link>
                <Link href="/repair">Book or track a repair</Link>
                <Link href="/faq">FAQ</Link>
                <a
                  className="btn btn--wa"
                  href={waLink(BUSINESS.whatsapp[0].intl, "Hello F.A TECHNOLOGIES")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsApp size={17} /> WhatsApp us
                </a>
              </div>
            </Menu>
          </div>
        </div>
      </header>
    </>
  );
}
