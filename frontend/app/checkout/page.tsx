import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile, getCart, getProduct, formatPrice } from "../../lib/api";
import { isLoggedIn } from "../../lib/session";
import AddressSelector from "./AddressSelector";

export const dynamic = "force-dynamic";

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ buyNow?: string; productSlug?: string; quantity?: string; selectedSize?: string }> }) {
  if (!(await isLoggedIn())) {
    redirect("/login");
  }

  const { buyNow, productSlug, quantity, selectedSize } = await searchParams;
  const profile = await getProfile();
  const defaultAddress = profile.user.addresses?.find((address) => address.isDefault) || profile.user.addresses?.[0];

  let items: any[] = [];
  let totals = { subtotalLabel: "", shippingLabel: "", totalLabel: "" };

  // Determine query string to pass to the next step
  const qs = new URLSearchParams();
  if (buyNow === "true" && productSlug) {
    const product = await getProduct(productSlug);
    if (!product) redirect("/products");

    const qty = Math.max(1, Number(quantity) || 1);
    const unitPrice = product.salePrice || product.price;
    const lineTotal = unitPrice * qty;
    const subtotal = lineTotal;
    const shipping = 80;
    const total = subtotal + shipping;
    
    items = [{
      productSlug,
      title: product.title,
      selectedSize: selectedSize || product.pack,
      quantity: qty,
      unitPriceLabel: formatPrice(unitPrice),
      lineTotalLabel: formatPrice(lineTotal),
      product
    }];
    
    totals = {
      subtotalLabel: formatPrice(subtotal),
      shippingLabel: formatPrice(shipping),
      totalLabel: formatPrice(total),
    };
    
    qs.set("buyNow", "true");
    qs.set("productSlug", productSlug);
    qs.set("quantity", String(qty));
    if (selectedSize) qs.set("selectedSize", selectedSize);
  } else {
    const cart = await getCart();
    if (!cart.items || cart.items.length === 0) {
      redirect("/cart");
    }
    items = cart.items;
    totals = cart.totals;
  }

  return (
    <div className="cart-page">
      <header className="commerce-nav">
        <div className="commerce-nav-inner">
          <Link className="commerce-brand" href="/">
            <img src="/logo.png" alt="" />
            GAONVEDA
          </Link>
          <nav>
            <Link href="/products">Shop</Link>
            <Link href="/#story">Our Story</Link>
          </nav>
          <div className="commerce-actions">
            <Link className="commerce-cart-link" href="/profile" aria-label="Profile">
              <Icon name="person" />
            </Link>
            <Link className="commerce-cart-link" href="/cart" aria-label="Shopping Cart">
              <Icon name="shopping_cart" />
              {profile.stats.cartItems ? <span className="commerce-cart-count">{profile.stats.cartItems}</span> : null}
            </Link>
          </div>
        </div>
      </header>

      <main className="cart-main">
        <div className="cart-heading">
          <h1>Checkout — Step 1: Address</h1>
          <p>Review your items and select a shipping address.</p>
        </div>

        <div className="cart-grid">
          <section className="cart-items" aria-label="Order Items">
            {items.map((item) => (
              <article key={`${item.productSlug}-${item.selectedSize}`} className="cart-item card-hover">
                <img src={`/products/${item.productSlug}.jpg`} alt={item.product?.title || item.title} />
                <div className="cart-item-details">
                  <div className="cart-item-header">
                    <h3>
                      <Link href={`/products/${item.productSlug}`}>{item.product?.title || item.title}</Link>
                    </h3>
                  </div>
                  <p className="cart-item-size">{item.selectedSize}</p>
                  <p className="cart-item-price">
                    {item.unitPriceLabel} × {item.quantity} = <strong>{item.lineTotalLabel}</strong>
                  </p>
                </div>
              </article>
            ))}
          </section>

          <aside className="cart-summary glass-panel" aria-label="Order Summary">
            <h2>Shipping Address</h2>
            <AddressSelector addresses={profile.user.addresses || []} />

            <div style={{ marginTop: "2rem", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
              <h2>Order Summary</h2>
              <dl>
                <div>
                  <dt>Subtotal</dt>
                  <dd>{totals.subtotalLabel}</dd>
                </div>
                <div>
                  <dt>Shipping</dt>
                  <dd>{totals.shippingLabel}</dd>
                </div>
                <div className="cart-total">
                  <dt>Total</dt>
                  <dd>{totals.totalLabel}</dd>
                </div>
              </dl>
            </div>

            <div style={{ marginTop: "1rem" }}>
              {defaultAddress ? (
                <Link 
                  href={`/checkout/payment?${qs.toString()}`} 
                  className="premium-button"
                  style={{ width: "100%", textDecoration: "none" }}
                >
                  Continue to Payment <Icon name="arrow_forward" />
                </Link>
              ) : (
                <button 
                  className="premium-button" 
                  disabled 
                  style={{ width: "100%" }}
                >
                  Select an address to continue
                </button>
              )}
            </div>

            <p className="secure-checkout">
              <Icon name="lock" /> Secure Checkout
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
