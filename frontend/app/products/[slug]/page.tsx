import Link from "next/link";
import { ProductPrice } from "../../../components/ProductPrice";
import { getCart, getProduct, getReviews, getWishlist, ratingIcons } from "../../../lib/api";
import { productImage, productImages } from "../../../lib/images";
import { isOutOfStock } from "../../../lib/inventory";
import { isLoggedIn } from "../../../lib/session";
import { ProductActions } from "./ProductActions";
import { ReviewForm } from "./ReviewForm";
import { Gallery } from "./Gallery";
import { Footer } from "../../../components/Footer";
import { Navbar } from "../../../components/Navbar";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

function Icon({ name, fill = false }: { name: string; fill?: boolean }) {
  return <span className={`material-symbols-outlined${fill ? " fill" : ""}`}>{name}</span>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, cart, wishlist, reviews, loggedIn] = await Promise.all([getProduct(slug), getCart(), getWishlist(), getReviews(slug), isLoggedIn()]);
  const mainImage = productImage(product);
  const thumbnails = Array.from(new Set(productImages(product)));
  const story = product.story?.length ? product.story : [product.description || product.subtitle || "Prepared in careful small batches."];
  const ingredients = product.ingredients?.length
    ? product.ingredients
    : [{ icon: "spa", title: product.category, text: product.subtitle || "Crafted with traditional care" }];
  const tags = product.tags?.length ? product.tags : [product.category, product.pack].filter(Boolean);
  const sizeOptions = (product.sizeOptions || [product.pack]).filter(Boolean) as string[];
  const isWishlisted = wishlist.items.some((item) => item.productSlug === product.slug);
  const outOfStock = isOutOfStock(product);

  return (
    <div className="pdp-page">
      <div className="promise-ornament promise-ornament-left" aria-hidden="true">
        <img src="/leaf-ornament.svg" alt="" className="" />
      </div>
      <div className="promise-ornament promise-ornament-right" aria-hidden="true">
        <img src="/leaf-ornament.svg" alt="" className="" />
      </div>
      <Navbar loggedIn={loggedIn} cartCount={cart.totals.itemCount} />
      <main className="pdp-main">
        <nav className="pdp-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/products">Shop</Link>
          <Icon name="chevron_right" />
          <Link href="/products">{product.category}</Link>
          <Icon name="chevron_right" />
          <span>{product.title}</span>
        </nav>

        <section className="pdp-hero">
          <Gallery mainImage={mainImage} thumbnails={thumbnails} productTitle={product.title} />

          <div className="pdp-details">
            <h1>{product.title}</h1>
            <div className="pdp-rating">
              <div>
                {ratingIcons(product.rating).map((star, index) => (
                  <Icon name={star} fill={star !== "star_outline"} key={`${star}-${index}`} />
                ))}
              </div>
              <span>
                {product.rating || 0}/5 ({product.reviewCount || 0} reviews)
              </span>
            </div>
            <ProductPrice product={product} className="pdp-price" />
            <div className="pdp-description">
              <h2>Product Description</h2>
              <p>{product.description}</p>
            </div>
            {outOfStock ? <p className="pdp-stock-message">Out of stock</p> : null}

            <ProductActions
              productSlug={product.slug}
              productTitle={product.title}
              sizeOptions={sizeOptions}
              defaultWishlisted={isWishlisted}
              outOfStock={outOfStock}
            />
            <div className="pdp-shipping">
              <Icon name="local_shipping" />
              <span>Free authentic packaging & delivery on orders above ₹500.</span>
            </div>
          </div>
        </section>

        <section className="pdp-story">
          <div>
            <h2>{product.storyTitle || `${product.title}, Made the Old Way`}</h2>
            {story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <ul>
              {(product.benefits || ["Small-batch preparation", "Sourced through trusted farming partners"]).map((benefit, index) => (
                <li key={benefit}>
                  <Icon name={index === 0 ? "energy_savings_leaf" : "agriculture"} /> {benefit}
                </li>
              ))}
            </ul>
          </div>
          <figure>
            <img src="/hero.png" alt="Traditional ingredients" />
          </figure>
        </section>

        <section className="pdp-ingredients">
          <header>
            <h2>{product.ingredientSectionTitle || "Pure Ingredients, Honest Flavor"}</h2>
            <p>{product.ingredientSectionText || "We believe in complete transparency. Every pack contains only what nature provides, blended with care."}</p>
          </header>
          <div className="pdp-ingredient-grid">
            {ingredients.map((ingredient) => (
              <article key={ingredient.title}>
                <Icon name={ingredient.icon || "spa"} />
                <h3>{ingredient.title}</h3>
                <p>{ingredient.text}</p>
              </article>
            ))}
          </div>
          <div className="pdp-tags">
            {tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </section>

        <section className="pdp-reviews">
          <header>
            <div>
              <p className="kicker">
                <span />
                Customer Notes
              </p>
              <h2>Reviews from the Pantry</h2>
            </div>
            <div className="review-summary">
              <strong>{reviews.summary.average || product.rating || 0}</strong>
              <span>{reviews.summary.count || product.reviewCount || 0} reviews</span>
            </div>
          </header>
          <div className="review-layout">
            <div className="review-list">
              {reviews.items.length ? (
                reviews.items.map((review) => (
                  <article className="review-card" key={review._id}>
                    <div>
                      <span>{review.user?.avatarInitials || review.user?.name?.slice(0, 2) || "GV"}</span>
                      <div>
                        <h3>{review.title}</h3>
                        <p>{review.user?.name || "GAONVEDA Customer"}</p>
                      </div>
                    </div>
                    <div className="review-stars">
                      {ratingIcons(review.rating).map((star, index) => (
                        <Icon key={`${review._id}-${star}-${index}`} name={star} fill={star !== "star_outline"} />
                      ))}
                      {review.verifiedPurchase ? <em>Verified purchase</em> : null}
                    </div>
                    <p>{review.comment}</p>
                  </article>
                ))
              ) : (
                <article className="review-card">
                  <p>No reviews yet. Be the first to share how this harvest tasted at home.</p>
                </article>
              )}
            </div>
            <ReviewForm productSlug={product.slug} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
