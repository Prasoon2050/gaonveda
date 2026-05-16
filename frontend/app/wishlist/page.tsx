import Link from "next/link";
import { redirect } from "next/navigation";
import { formatPrice, getWishlist } from "../../lib/api";
import { productHref, productImage } from "../../lib/images";
import { isLoggedIn } from "../../lib/session";
import { RemoveWishlistButton, WishlistAddToCartButton } from "./WishlistActions";

export const dynamic = "force-dynamic";

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

function stateClass(status: string) {
  if (status === "OUT OF SEASON") return "disabled";
  if (status === "LOW STOCK") return "placeholder";
  return "available";
}

export default async function WishlistPage() {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    redirect("/login");
  }

  const wishlist = await getWishlist();
  const visibleItems = wishlist.items.filter((item) => item.product);

  return (
    <div className="commerce-page wishlist-page">
      <div className="texture-overlay" />
      <CommerceNav loggedIn={loggedIn} />
      <main className="commerce-main wishlist-main">
        <header className="wishlist-title">
          <div>
            <h1>Your Harvest Collection</h1>
            <p>Curated treasures saved for your next mindful choice. These artisanal selections are waiting to bring heritage purity into your home.</p>
          </div>
          <span>{visibleItems.length} Items Saved</span>
        </header>

        <section className="wishlist-grid" aria-label="Wishlist items">
          {visibleItems.map((item) => {
            const product = item.product!;
            const state = stateClass(item.status);

            return (
              <article className={`wishlist-card wishlist-card-${state}`} key={item.productSlug}>
                <Link className="card-cover-link" href={productHref(product.slug)} aria-label={`View ${product.title}`} />
                <div className="wishlist-image">
                  {state === "placeholder" ? <Icon name="image" /> : <img src={productImage(product.slug)} alt={product.title} />}
                  <RemoveWishlistButton productSlug={product.slug} label={product.title} />
                  {state === "disabled" ? (
                    <div className="season-overlay">
                      <span>{item.status}</span>
                    </div>
                  ) : (
                    <span className="stock-tag">{item.status}</span>
                  )}
                </div>
                <div className="wishlist-body">
                  <h2>{product.title}</h2>
                  <p>{product.subtitle || product.description}</p>
                  <div>
                    <strong>{formatPrice(product.price)}</strong>
                    <WishlistAddToCartButton productSlug={product.slug} disabled={state === "disabled"} label={item.actionLabel} />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
      <CommerceFooter variant="wishlist" />
    </div>
  );
}

function CommerceNav({ loggedIn }: { loggedIn: boolean }) {
  return (
    <header className="commerce-nav">
      <div className="commerce-nav-inner">
        <Link className="commerce-brand" href="/">
          <img src="/logo.png" alt="" />
          GAONVEDA
        </Link>
        <nav>
          <Link href="/#shop">Shop</Link>
          <Link href="/#story">Our Story</Link>
          <Link href="/#process">Process</Link>
          <Link href="/#coming-soon">Coming Soon</Link>
        </nav>
        <div className="commerce-actions">
          <button aria-label="Search">
            <Icon name="search" />
          </button>
          <Link className="commerce-cart-link" href="/wishlist" aria-label="Wishlist">
            <Icon name="favorite" />
          </Link>
          {loggedIn ? (
            <Link className="commerce-cart-link" href="/profile" aria-label="Profile">
              <Icon name="person" />
            </Link>
          ) : (
            <Link className="login-pill" href="/login">
              Login
            </Link>
          )}
          <Link className="commerce-cart-link" href="/cart" aria-label="Shopping Cart">
            <Icon name="shopping_cart" />
          </Link>
          <button className="commerce-menu" aria-label="Menu">
            <Icon name="menu" />
          </button>
        </div>
      </div>
    </header>
  );
}

function CommerceFooter({ variant }: { variant: "cart" | "wishlist" }) {
  return (
    <footer className={`commerce-footer commerce-footer-${variant}`}>
      <div className="commerce-footer-inner">
        <div className="commerce-footer-brand">
          <span>GAONVEDA</span>
          <p>Preserving Heritage, One Harvest at a Time.</p>
        </div>
        <nav className="commerce-footer-links">
          <Link href="/#shop">Shop All</Link>
          <Link href="/#story">Our Heritage</Link>
          <Link href="/#coming-soon">Sustainability</Link>
          <Link href="/cart">Shipping Policy</Link>
          <Link href="/wishlist">Contact Us</Link>
        </nav>
        <p className="commerce-footer-copy">© 2024 GAONVEDA. Preserving Heritage, One Harvest at a Time.</p>
      </div>
    </footer>
  );
}
