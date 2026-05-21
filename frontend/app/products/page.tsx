import Link from "next/link";
import { Footer } from "../../components/Footer";
import { Navbar } from "../../components/Navbar";
import { AddToCartButton } from "../../components/AddToCartButton";
import { ProductImage } from "../../components/ProductImage";
import { ProductPrice } from "../../components/ProductPrice";
import { getProducts, getCart } from "../../lib/api";
import { productHref } from "../../lib/images";
import { isOutOfStock, productStockLabel } from "../../lib/inventory";
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

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search } = await searchParams;
  const products = await getProducts(search);
  const loggedIn = await isLoggedIn();
  const cart = await getCart();

  return (
    <div className="catalog-page">
      <div className="promise-ornament promise-ornament-left" aria-hidden="true">
        <img src="/leaf-ornament.svg" alt="" className="" />
      </div>
      <div className="promise-ornament promise-ornament-right" aria-hidden="true">
        <img src="/leaf-ornament.svg" alt="" className="" />
      </div>
      <Navbar loggedIn={loggedIn} cartCount={cart.totals.itemCount} />
      <main className="catalog-main">
        <header className="catalog-hero">
          {search ? (
            <>
              <h1>Search Results for "{search}"</h1>
              <p>Explore our organic heritage collections matching your query.</p>
            </>
          ) : (
            <>
              <h1>Our Earthly Treasures</h1>
              <p>
                Discover our curated collection of authentically sourced essentials. Crafted using traditional methods, each product
                reflects our commitment to purity, heritage, and the natural rhythms of the earth.
              </p>
            </>
          )}
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
            {products.length === 0 ? (
              <div className="glass-panel fade-in-up" style={{ gridColumn: "1 / -1", padding: "48px 24px", textAlign: "center", borderRadius: "24px", border: "1px dashed rgba(91, 75, 48, 0.2)" }}>
                <div style={{ display: "inline-flex", padding: "16px", borderRadius: "50%", background: "rgba(141, 110, 63, 0.08)", marginBottom: "16px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--heritage-gold)" }}>search_off</span>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", color: "var(--heritage-forest)", fontSize: "22px", margin: "0 0 8px" }}>No Earthly Treasures Found</h3>
                <p style={{ color: "var(--on-surface-variant)", fontSize: "14px", margin: "0 auto 24px", maxWidth: "460px", lineHeight: "1.5" }}>We couldn't find any products matching "{search}". Try searching for categories like "Pickles", "Oils", or "Flours"!</p>
                <Link href="/products" className="premium-button" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  Clear Search <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>refresh</span>
                </Link>
              </div>
            ) : (
              products.map((product) => {
                const outOfStock = isOutOfStock(product);
                return (
                  <article className="catalog-card" key={product.slug}>
                  <Link className="card-cover-link" href={productHref(product.slug)} aria-label={`View ${product.title}`} />
                  <div className="catalog-card-image">
                    <ProductImage product={product} alt={product.title} />
                    <span className={outOfStock ? "out-of-stock-label" : ""}>{productStockLabel(product) || product.badge}</span>
                  </div>
                  <div className="catalog-card-body">
                    <h2 title={product.title}><span>{product.title}</span></h2>
                    <p>{product.subtitle}</p>
                    <ProductPrice product={product} />
                    <div className="catalog-card-actions">
                      <AddToCartButton productSlug={product.slug} selectedSize={product.pack} disabled={outOfStock} disabledLabel="Notify Me">
                        Add to Cart
                      </AddToCartButton>
                      <Link href={productHref(product.slug)}>View Details</Link>
                    </div>
                  </div>
                </article>
              );
            }))}
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
      <Footer />
    </div>
  );
}
