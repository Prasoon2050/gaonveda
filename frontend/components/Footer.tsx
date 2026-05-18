import Link from "next/link";

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

function FooterLinks({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="footer-links">
      <h4>{title}</h4>
      {links.map((link) => (
        <Link href="#" key={link}>
          {link}
        </Link>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="footer-watermark" aria-hidden="true">
        <div className="watermark-content">
          <span>GAONVEDA</span><span className="dot">✧</span>
          <span>GAONVEDA</span><span className="dot">✧</span>
          <span>GAONVEDA</span><span className="dot">✧</span>
          <span>GAONVEDA</span><span className="dot">✧</span>
        </div>
        <div className="watermark-content">
          <span>GAONVEDA</span><span className="dot">✧</span>
          <span>GAONVEDA</span><span className="dot">✧</span>
          <span>GAONVEDA</span><span className="dot">✧</span>
          <span>GAONVEDA</span><span className="dot">✧</span>
        </div>
      </div>
      <div className="container footer-grid">
        <div>
          <Link className="brand footer-brand" href="/">
            <img src="/logo.png" alt="GAONVEDA Logo" />
            <span>GAONVEDA</span>
          </Link>
          <p>
            Preserving Heritage, One Harvest at a Time. Bringing the tactile richness of traditional Indian food production to the modern table.
          </p>
          <div className="socials">
            <Link href="#" aria-label="Sustainability">
              <Icon name="nest_eco_leaf" />
            </Link>
            <Link href="#" aria-label="Instagram">
              <Icon name="photo_camera" />
            </Link>
          </div>
        </div>
        <FooterLinks title="Shop" links={["Shop All", "Cold Pressed Oils", "Stone Ground Flours", "Traditional Pickles"]} />
        <FooterLinks title="About" links={["Our Heritage", "Sustainability", "The Process"]} />
        <FooterLinks title="Support" links={["Shipping Policy", "Refund Policy", "Contact Us"]} />
        <div className="footer-bottom">
          <p>© 2025 GAONVEDA. Preserving Heritage, One Harvest at a Time.</p>
          <div>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
