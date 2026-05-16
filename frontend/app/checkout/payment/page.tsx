import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile, getCart, getProduct, formatPrice } from "../../../lib/api";
import { isLoggedIn } from "../../../lib/session";
import PaymentClient from "./PaymentClient";

export const dynamic = "force-dynamic";

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

export default async function PaymentPage({ searchParams }: { searchParams: Promise<{ buyNow?: string; productSlug?: string; quantity?: string; selectedSize?: string }> }) {
  if (!(await isLoggedIn())) {
    redirect("/login");
  }

  const { buyNow, productSlug, quantity, selectedSize } = await searchParams;
  const profile = await getProfile();
  const defaultAddress = profile.user.addresses?.find((address) => address.isDefault) || profile.user.addresses?.[0];

  if (!defaultAddress) {
    redirect("/checkout");
  }

  let orderData: any = null;
  let items: any[] = [];
  let totals = { subtotalLabel: "", shippingLabel: "", totalLabel: "" };

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
    
    orderData = { productSlug, quantity: qty, selectedSize: selectedSize || product.pack };
    
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
    orderData = null;
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
          <h1>Checkout — Step 2: Payment</h1>
          <p>Select your payment method and complete the order.</p>
        </div>

        <div className="cart-grid">
          <section className="cart-items glass-panel" aria-label="Order Items" style={{ padding: "2rem", borderRadius: "12px" }}>
            <div style={{ marginBottom: "2rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Shipping To</h2>
                <Link href={`/checkout?${qs.toString()}`} style={{ color: "var(--color-primary)", textDecoration: "underline" }}>Change</Link>
              </div>
              <address style={{ fontStyle: "normal", lineHeight: 1.5, marginTop: "0.5rem" }}>
                <strong>{defaultAddress.recipient}</strong><br />
                {defaultAddress.line1}<br />
                {defaultAddress.line2 ? <>{defaultAddress.line2}<br /></> : null}
                {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}<br />
                {defaultAddress.phone}
              </address>
            </div>

            <h2>Order Summary</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              {items.map((item) => (
                <article key={`${item.productSlug}-${item.selectedSize}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <img src={`/products/${item.productSlug}.jpg`} alt={item.product?.title || item.title} style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "8px" }} />
                    <div>
                      <h4 style={{ margin: 0 }}>{item.product?.title || item.title}</h4>
                      <p style={{ margin: 0, color: "var(--color-text-light)", fontSize: "0.875rem" }}>{item.selectedSize} × {item.quantity}</p>
                    </div>
                  </div>
                  <strong>{item.lineTotalLabel}</strong>
                </article>
              ))}
            </div>
            
            <dl style={{ marginTop: "2rem", borderTop: "1px solid var(--color-border)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <dt>Subtotal</dt>
                <dd>{totals.subtotalLabel}</dd>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <dt>Shipping</dt>
                <dd>{totals.shippingLabel}</dd>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.25rem", fontWeight: "bold", marginTop: "0.5rem" }}>
                <dt>Total</dt>
                <dd>{totals.totalLabel}</dd>
              </div>
            </dl>
          </section>

          <aside className="cart-summary glass-panel" aria-label="Payment Options">
            <h2>Payment Method</h2>
            
            <PaymentClient 
              isBuyNow={buyNow === "true"} 
              orderData={orderData} 
            />

            <p className="secure-checkout">
              <Icon name="lock" /> Secure Checkout
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
