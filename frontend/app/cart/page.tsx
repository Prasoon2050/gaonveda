import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "../../components/Footer";
import { Navbar } from "../../components/Navbar";
import { ProductImage } from "../../components/ProductImage";
import { getCart } from "../../lib/api";
import { isOutOfStock } from "../../lib/inventory";
import { isLoggedIn } from "../../lib/session";
import { CartItemControls, RemoveCartItemButton } from "./CartItemControls";
import InteractiveOrderSummary from "../../components/InteractiveOrderSummary";

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
  const isEmpty = !cart.items || cart.items.length === 0;
  const outOfStockItem = cart.items.find((item) => isOutOfStock(item.product));

  return (
    <div className="commerce-page cart-page">
      <div className="promise-ornament promise-ornament-left" aria-hidden="true">
        <img src="/leaf-ornament.svg" alt="" className="" />
      </div>
      <div className="promise-ornament promise-ornament-right" aria-hidden="true">
        <img src="/leaf-ornament.svg" alt="" className="" />
      </div>
      <Navbar loggedIn={loggedIn} cartCount={cart.totals.itemCount} />
      <main className="commerce-main cart-main">
        <header className="commerce-title">
          <h1>Your Cart</h1>
          <p>Review your heritage selections.</p>
        </header>

        {isEmpty ? (
          <div className="empty-cart-card fade-in-up">
            <div className="empty-cart-icon-wrapper">
              <span className="material-symbols-outlined empty-cart-icon">shopping_bag</span>
            </div>
            <h2>Your Cart is Empty</h2>
            <p>Explore our organic heritage pickles, stone ground grains, and kachi ghani oils directly from the heart of our farms.</p>
            <Link href="/products" className="premium-button" style={{ textDecoration: "none" }}>
              Continue Shopping <Icon name="arrow_forward" />
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-list" aria-label="Shopping cart items">
              {cart.items.map((item) => {
                if (!item.product) return null;

                return (
                  <article className="cart-item card-hover" key={`${item.productSlug}-${item.selectedSize || "default"}`}>
                    <RemoveCartItemButton productSlug={item.productSlug} selectedSize={item.selectedSize} label={item.product.title} />
                    <div className="cart-item-image">
                      <ProductImage product={item.product} alt={item.product.title} />
                    </div>
                    <div className="cart-item-body">
                      <div>
                        <span className={isOutOfStock(item.product) ? "cart-badge out-of-stock-label" : "cart-badge"}>{isOutOfStock(item.product) ? "Out of stock" : item.product.badge}</span>
                        <h2 title={item.product.title}><span>{item.product.title}</span></h2>
                        {item.selectedSize ? <span className="cart-pack-size">Pack Size: {item.selectedSize}</span> : null}
                      </div>
                      <div className="cart-item-bottom">
                        <CartItemControls productSlug={item.productSlug} selectedSize={item.selectedSize} quantity={item.quantity} />
                        <strong>{item.lineTotalLabel}</strong>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="order-summary glass-panel" aria-label="Order summary">
              <h2>Order Summary</h2>
              <InteractiveOrderSummary
                subtotal={cart.totals.subtotal}
                shipping={cart.totals.shipping}
                itemCount={cart.totals.itemCount}
                flow="cart"
                disabledCheckout={Boolean(outOfStockItem)}
                disabledMessage={outOfStockItem ? `${outOfStockItem.product?.title || outOfStockItem.productSlug} is out of stock. Remove it before checkout.` : undefined}
              />
              <p className="secure-checkout" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", margin: "16px 0 0", fontSize: "12px", color: "var(--on-surface-variant)", fontWeight: "600" }}>
                <Icon name="lock" /> Secure Checkout
              </p>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
