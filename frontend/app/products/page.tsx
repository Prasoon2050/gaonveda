import Link from "next/link";
import { AddToCartButton } from "../../components/AddToCartButton";
import { formatPrice, getProducts } from "../../lib/api";
import { productHref, productImage } from "../../lib/images";
import { isLoggedIn } from "../../lib/session";

export const dynamic = "force-dynamic";

const categories = [
  ["spa", "Pickles", true],
  ["water_drop", "Oils", false],
  ["grass", "Flours", false],
] as const;

const promiseItems = [
  ["verified", "100% Authentic", "Sourced directly from traditional farms ensuring untainted quality."],
  ["eco", "Earth Friendly", "Sustainable packaging and harvesting practices that respect nature."],
  ["diversity_1", "Community First", "Empowering rural artisans and farmers with fair trade."],
] as const;

function Icon({ name, fill = false }: { name: string; fill?: boolean }) {
  return <span className={`material-symbols-outlined${fill ? " fill" : ""}`}>{name}</span>;
}

export default async function ProductsPage() {
  const products = await getProducts();
  const loggedIn = await isLoggedIn();

  return (
    <div className="catalog-page">
      <CatalogNav loggedIn={loggedIn} />
      <main className="catalog-main">
        <header className="catalog-hero">
          <h1>Our Earthly Treasures</h1>
          <p>
            Discover our curated collection of authentically sourced essentials. Crafted using traditional methods, each product
            reflects our commitment to purity, heritage, and the natural rhythms of the earth.
          </p>
        </header>

        <section className="catalog-layout">
          <aside className="catalog-sidebar">
            <div>
              <h2>Categories</h2>
              <ul>
                {categories.map(([icon, label, active]) => (
                  <li key={label}>
                    <a className={active ? "active" : ""} href="#">
                      <Icon name={icon} /> {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="catalog-soon">
              <h3>Coming Soon</h3>
              <p>We are nurturing new additions to our heritage collection. Stay tuned for wild honeys and organic spices.</p>
              <a href="#">
                Get Notified <Icon name="arrow_forward" />
              </a>
            </div>
          </aside>

          <div className="catalog-grid">
            {products.map((product) => (
              <article className="catalog-card" key={product.slug}>
                <Link className="card-cover-link" href={productHref(product.slug)} aria-label={`View ${product.title}`} />
                <div className="catalog-card-image">
                  <img src={productImage(product.slug)} alt={product.title} />
                  <span>{product.badge}</span>
                </div>
                <div className="catalog-card-body">
                  <h2>{product.title}</h2>
                  <p>{product.subtitle}</p>
                  <strong>{formatPrice(product.price)}</strong>
                  <div>
                    <AddToCartButton productSlug={product.slug} selectedSize={product.pack}>
                      Add to Cart
                    </AddToCartButton>
                    <Link href={productHref(product.slug)}>View Details</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="catalog-promise">
          <div>
            <h2>The GAONVEDA Promise</h2>
            <div className="catalog-promise-grid">
              {promiseItems.map(([icon, title, text]) => (
                <article key={title}>
                  <Icon name={icon} fill />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <CatalogFooter />
    </div>
  );
}

function CatalogNav({ loggedIn }: { loggedIn: boolean }) {
  return (
    <nav className="catalog-nav">
      <div className="catalog-nav-inner">
        <Link className="catalog-brand" href="/">
          <img src="/logo.png" alt="" />
          GAONVEDA
        </Link>
        <div className="catalog-links">
          <Link className="active" href="/products">
            Shop
          </Link>
          <Link href="/#story">Our Story</Link>
          <Link href="/#process">Process</Link>
          <Link href="/#coming-soon">Coming Soon</Link>
        </div>
        <div className="catalog-actions">
          <button aria-label="search">
            <Icon name="search" />
          </button>
          <Link href="/wishlist" aria-label="wishlist">
            <Icon name="favorite" />
          </Link>
          {loggedIn ? (
            <Link href="/profile" aria-label="profile">
              <Icon name="person" />
            </Link>
          ) : (
            <Link className="login-pill" href="/login">
              Login
            </Link>
          )}
          <Link href="/cart" aria-label="shopping_cart">
            <Icon name="shopping_cart" />
          </Link>
          <button className="catalog-menu" aria-label="menu">
            <Icon name="menu" />
          </button>
        </div>
      </div>
    </nav>
  );
}

function CatalogFooter() {
  return (
    <footer className="catalog-footer">
      <div className="catalog-footer-inner">
        <div>
          <h2>GAONVEDA</h2>
          <p>Preserving Heritage, One Harvest at a Time.</p>
        </div>
        <nav>
          <Link href="/products">Shop All</Link>
          <Link href="/#story">Our Heritage</Link>
          <Link href="/#coming-soon">Sustainability</Link>
          <Link href="/cart">Shipping Policy</Link>
          <Link href="/wishlist">Contact Us</Link>
        </nav>
      </div>
      <p>© 2024 GAONVEDA. Preserving Heritage, One Harvest at a Time.</p>
    </footer>
  );
}
