import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductImage } from "../../../components/ProductImage";
import { getProfile, getCart, getProduct, formatPrice } from "../../../lib/api";
import { isOutOfStock } from "../../../lib/inventory";
import { isLoggedIn } from "../../../lib/session";
import PaymentClient from "./PaymentClient";
import { Navbar } from "../../../components/Navbar";

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
  const cart = await getCart();
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
    if (isOutOfStock(product)) redirect(`/products/${productSlug}`);

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
    if (!cart.items || cart.items.length === 0) {
      redirect("/cart");
    }
    if (cart.items.some((item) => isOutOfStock(item.product))) {
      redirect("/cart");
    }
    items = cart.items;
    totals = cart.totals;
    orderData = null;
  }

  return (
    <div className="commerce-page payment-page">
      <div className="promise-ornament promise-ornament-left" aria-hidden="true">
        <img src="/leaf-ornament.svg" alt="" className="" />
      </div>
      <div className="promise-ornament promise-ornament-right" aria-hidden="true">
        <img src="/leaf-ornament.svg" alt="" className="" />
      </div>
      <Navbar loggedIn={true} cartCount={cart.totals.itemCount} />

      <main className="commerce-main cart-main">
        <header className="commerce-title">
          <h1>Checkout — Step 2: Payment</h1>
          <p>Select your payment method and complete the order.</p>
        </header>

        <div className="cart-grid">
          <section className="cart-list" aria-label="Order Items">
            <div className="payment-shipping-card">
              <div className="payment-shipping-header">
                <h2>Shipping Destination</h2>
                <Link href={`/checkout?${qs.toString()}`} className="payment-change-link">
                  Change
                </Link>
              </div>
              <address className="payment-address-details">
                <strong>{defaultAddress.recipient}</strong><br />
                {defaultAddress.line1}<br />
                {defaultAddress.line2 ? <>{defaultAddress.line2}<br /></> : null}
                {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}<br />
                {defaultAddress.phone}
              </address>
            </div>

            <div className="checkout-summary-container" style={{ marginTop: 0, paddingTop: 0, border: "none" }}>
              <h2 style={{ fontSize: "22px", margin: "0 0 16px" }}>Order Items</h2>
            </div>

            {items.map((item) => (
              <article key={`${item.productSlug}-${item.selectedSize}`} className="cart-item card-hover">
                <div className="cart-item-image">
                  <ProductImage product={item.product} alt={item.product?.title || item.title} />
                </div>
                <div className="cart-item-body">
                  <div>
                    {item.product?.badge || isOutOfStock(item.product) ? (
                      <span className={isOutOfStock(item.product) ? "cart-badge out-of-stock-label" : "cart-badge"}>
                        {isOutOfStock(item.product) ? "Out of stock" : item.product?.badge}
                      </span>
                    ) : null}
                    <h2>
                      <Link href={`/products/${item.productSlug}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {item.product?.title || item.title}
                      </Link>
                    </h2>
                    <p className="cart-item-size" style={{ fontSize: "14px", fontWeight: "600", color: "var(--heritage-gold)", margin: "4px 0 0" }}>
                      Pack Size: {item.selectedSize}
                    </p>
                  </div>
                  <div className="cart-item-bottom">
                    <span style={{ fontSize: "14px", color: "var(--on-surface-variant)" }}>
                      Qty: <strong>{item.quantity}</strong> × {item.unitPriceLabel}
                    </span>
                    <strong>{item.lineTotalLabel}</strong>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="cart-summary glass-panel" aria-label="Payment Options">
            <h2>Payment Method</h2>
            
            <PaymentClient 
              isBuyNow={buyNow === "true"} 
              orderData={orderData} 
            />

            <div className="checkout-summary-container">
              <h2>Order Summary</h2>
              <dl className="checkout-summary-lines">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{totals.subtotalLabel}</dd>
                </div>
                <div>
                  <dt>Shipping</dt>
                  <dd>{totals.shippingLabel}</dd>
                </div>
                <div className="checkout-total-row">
                  <dt>Total</dt>
                  <dd>{totals.totalLabel}</dd>
                </div>
              </dl>
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
