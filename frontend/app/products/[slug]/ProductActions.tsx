"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addCartItem, buyNow, toggleWishlistItem } from "../../../lib/client-api";

type ProductActionsProps = {
  productSlug: string;
  productTitle: string;
  sizeOptions: string[];
  defaultWishlisted: boolean;
  outOfStock?: boolean;
};

function Icon({ name, fill = false }: { name: string; fill?: boolean }) {
  return <span className={`material-symbols-outlined${fill ? " fill" : ""}`}>{name}</span>;
}

export function ProductActions({ productSlug, productTitle, sizeOptions, defaultWishlisted, outOfStock }: ProductActionsProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);
  const [wishlisted, setWishlisted] = useState(defaultWishlisted);
  const [pending, setPending] = useState<"cart" | "buy" | "wishlist" | null>(null);
  const [message, setMessage] = useState("");

  async function run(action: "cart" | "buy" | "wishlist", work: () => Promise<void>) {
    setPending(action);
    setMessage("");

    try {
      await work();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="pdp-action-panel">
      <div className="pdp-sizes">
        <h2>Select Size</h2>
        <div>
          {sizeOptions.map((size, index) => (
            <button className={size === selectedSize || (!selectedSize && index === 0) ? "active" : ""} key={size} type="button" onClick={() => setSelectedSize(size)}>
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="pdp-cart-row">
        <div className="pdp-qty">
          <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
            <Icon name="remove" />
          </button>
          <span>{quantity}</span>
          <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}>
            <Icon name="add" />
          </button>
        </div>
        {outOfStock ? (
          <button type="button" className="premium-button" disabled>
            Notify Me
          </button>
        ) : (
          <button
            type="button"
            className="premium-button"
            onClick={() =>
              run("cart", async () => {
                await addCartItem({ productSlug, selectedSize, quantity });
                setMessage(`${productTitle} added to cart.`);
                router.refresh();
              })
            }
            disabled={pending !== null}
          >
            {pending === "cart" ? "Adding..." : "Add to Cart"}
          </button>
        )}
      </div>

      <div className="pdp-secondary-actions">
        {!outOfStock ? (
          <button
            className="pdp-buy premium-button premium-button-secondary"
            type="button"
            onClick={() =>
              run("buy", async () => {
                const qs = new URLSearchParams({ buyNow: "true", productSlug, quantity: String(quantity), selectedSize }).toString();
                router.push(`/checkout?${qs}`);
              })
            }
            disabled={pending !== null}
          >
            {pending === "buy" ? "Placing Order..." : "Buy Now"}
          </button>
        ) : null}
        <button
          className={wishlisted ? "pdp-wishlist active" : "pdp-wishlist"}
          type="button"
          onClick={() =>
            run("wishlist", async () => {
              await toggleWishlistItem(productSlug);
              setWishlisted((value) => !value);
              setMessage(wishlisted ? "Removed from wishlist." : "Saved to wishlist.");
              router.refresh();
            })
          }
          disabled={pending !== null}
          aria-pressed={wishlisted}
        >
          <Icon name="favorite" fill={wishlisted} />
          {wishlisted ? "Saved" : "Wishlist"}
        </button>
      </div>

      {message ? <p className="pdp-action-message">{message}</p> : null}
    </div>
  );
}
