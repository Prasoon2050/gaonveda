"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";
import { addCartItem } from "../lib/client-api";

type AddToCartButtonProps = {
  productSlug: string;
  selectedSize?: string;
  quantity?: number;
  className?: string;
  children?: ReactNode;
  iconOnly?: boolean;
  ariaLabel?: string;
};

export function AddToCartButton({ productSlug, selectedSize, quantity = 1, className, children, iconOnly, ariaLabel }: AddToCartButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setPending(true);

    try {
      await addCartItem({ productSlug, selectedSize, quantity });
      setAdded(true);
      router.refresh();
      window.setTimeout(() => setAdded(false), 1400);
    } finally {
      setPending(false);
    }
  }

  return (
    <button className={className} type="button" onClick={handleClick} disabled={pending} aria-live="polite" aria-label={ariaLabel}>
      {iconOnly ? (
        <span className="material-symbols-outlined">{added ? "check" : "add_shopping_cart"}</span>
      ) : (
        children || (added ? "Added" : pending ? "Adding..." : "Add to Cart")
      )}
    </button>
  );
}
