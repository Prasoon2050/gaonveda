import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductImage } from "../../components/ProductImage";
import { getProfile, getCart, getProduct, formatPrice } from "../../lib/api";
import { isOutOfStock } from "../../lib/inventory";
import { isLoggedIn } from "../../lib/session";
import AddressSelector from "./AddressSelector";
import { Navbar } from "../../components/Navbar";

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
  const cart = await getCart();
  const defaultAddress = profile.user.addresses?.find((address) => address.isDefault) || profile.user.addresses?.[0];

  let items: any[] = [];
  let totals = { subtotalLabel: "", shippingLabel: "", totalLabel: "" };

  // Determine query string to pass to the next step
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
  }

  return (
    <div className="commerce-page checkout-page">
      <div className="promise-ornament promise-ornament-left" aria-hidden="true">
        <img src="/leaf-ornament.svg" alt="" className="" />
      </div>
      <div className="promise-ornament promise-ornament-right" aria-hidden="true">
        <img src="/leaf-ornament.svg" alt="" className="" />
      </div>
      <Navbar loggedIn={true} cartCount={cart.totals.itemCount} />

      <main className="commerce-main cart-main">
        <header className="commerce-title">
          <h1>Checkout — Step 1: Address</h1>
          <p>Review your items and select a shipping address.</p>
        </header>

        <div className="cart-grid">
          <section className="cart-list" aria-label="Order Items">
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
                    <h2 title={item.product?.title || item.title}>
                      <Link href={`/products/${item.productSlug}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <span>{item.product?.title || item.title}</span>
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

          <aside className="cart-summary glass-panel" aria-label="Order Summary">
            <h2>Shipping Address</h2>
            <AddressSelector addresses={profile.user.addresses || []} />

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

            <div style={{ marginTop: "20px" }}>
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
