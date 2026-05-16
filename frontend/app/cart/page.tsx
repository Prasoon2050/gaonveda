import Link from "next/link";
import { redirect } from "next/navigation";
import { getCart } from "../../lib/api";
import { productImage } from "../../lib/images";
import { isLoggedIn } from "../../lib/session";
import { CartItemControls, CheckoutButton, RemoveCartItemButton } from "./CartItemControls";

export const dynamic = "force-dynamic";

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

export default async function CartPage() {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    redirect("/login");
  }
  const cart = await getCart();

  return (
    <div className="commerce-page">
      <CommerceNav cartCount={String(cart.totals.itemCount)} loggedIn={loggedIn} />
      <main className="commerce-main cart-main">
        <header className="commerce-title">
          <h1>Your Cart</h1>
          <p>Review your heritage selections.</p>
        </header>

        <div className="cart-layout">
          <section className="cart-list" aria-label="Shopping cart items">
            {cart.items.map((item) => {
              if (!item.product) return null;

              return (
                <article className="cart-item card-hover" key={item.productSlug}>
                  <RemoveCartItemButton productSlug={item.productSlug} label={item.product.title} />
                  <div className="cart-item-image">
                    <img src={productImage(item.product.slug)} alt={item.product.title} />
                  </div>
                  <div className="cart-item-body">
                    <div>
                      <span className="cart-badge">{item.product.badge}</span>
                      <h2>{item.product.title}</h2>
                      <p>{item.product.description}</p>
                    </div>
                    <div className="cart-item-bottom">
                      <CartItemControls productSlug={item.productSlug} quantity={item.quantity} />
                      <strong>{item.lineTotalLabel}</strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="order-summary glass-panel" aria-label="Order summary">
            <h2>Order Summary</h2>
            <div className="summary-lines">
              <p>
                <span>Subtotal ({cart.totals.itemCount} items)</span>
                <strong>{cart.totals.subtotalLabel}</strong>
              </p>
              <p>
                <span>Estimated Shipping</span>
                <strong>{cart.totals.shippingLabel}</strong>
              </p>
              <p>
                <span>Taxes</span>
                <strong>Calculated at checkout</strong>
              </p>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>{cart.totals.totalLabel}</strong>
            </div>
            <CheckoutButton />
            <p className="secure-checkout">
              <Icon name="lock" /> Secure Checkout
            </p>
          </aside>
        </div>
      </main>
      <CommerceFooter variant="cart" />
    </div>
  );
}

function CommerceNav({ cartCount, loggedIn }: { cartCount?: string; loggedIn: boolean }) {
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
            {cartCount ? <span className="commerce-cart-count">{cartCount}</span> : null}
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
          <p>
            {variant === "cart"
              ? "© 2024 GAONVEDA. Preserving Heritage, One Harvest at a Time."
              : "Preserving Heritage, One Harvest at a Time."}
          </p>
        </div>
        <nav className="commerce-footer-links">
          <Link href="/#shop">Shop All</Link>
          <Link href="/#story">Our Heritage</Link>
          <Link href="/#coming-soon">Sustainability</Link>
          <Link href="/cart">Shipping Policy</Link>
          <Link href="/wishlist">Contact Us</Link>
        </nav>
        {variant === "wishlist" ? (
          <p className="commerce-footer-copy">© 2024 GAONVEDA. Preserving Heritage, One Harvest at a Time.</p>
        ) : null}
      </div>
    </footer>
  );
}
