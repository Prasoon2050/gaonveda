import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "../../components/Footer";
import { Navbar } from "../../components/Navbar";
import { ProductImage } from "../../components/ProductImage";
import { ProductPrice } from "../../components/ProductPrice";
import { getWishlist, getCart } from "../../lib/api";
import { productHref } from "../../lib/images";
import { isOutOfStock } from "../../lib/inventory";
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
  const cart = await getCart();

  return (
    <div className="commerce-page wishlist-page">
      <div className="promise-ornament promise-ornament-left" aria-hidden="true">
        <img src="/leaf-ornament.svg" alt="" className="" />
      </div>
      <div className="promise-ornament promise-ornament-right" aria-hidden="true">
        <img src="/leaf-ornament.svg" alt="" className="" />
      </div>
      <div className="texture-overlay" />
      <Navbar loggedIn={loggedIn} cartCount={cart.totals.itemCount} />
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
            const outOfStock = isOutOfStock(product);

            return (
              <article className={`wishlist-card wishlist-card-${state}`} key={item.productSlug}>
                <Link className="card-cover-link" href={productHref(product.slug)} aria-label={`View ${product.title}`} />
                <div className="wishlist-image">
                  {state === "placeholder" ? <Icon name="image" /> : <ProductImage product={product} alt={product.title} />}
                  <RemoveWishlistButton productSlug={product.slug} label={product.title} />
                  {outOfStock ? (
                    <span className="stock-tag out-of-stock-label">Out of stock</span>
                  ) : state === "disabled" ? (
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
                    <ProductPrice product={product} />
                    <WishlistAddToCartButton productSlug={product.slug} disabled={state === "disabled" || outOfStock} label={outOfStock ? "Out of stock" : item.actionLabel} />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
      <Footer />
    </div>
  );
}
