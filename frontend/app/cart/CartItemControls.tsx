"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useState } from "react";
import { checkoutCart, removeCartItem, updateCartItem } from "../../lib/client-api";

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

export function CartItemControls({ productSlug, quantity }: { productSlug: string; quantity: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function update(nextQuantity: number) {
    setPending(true);
    try {
      await updateCartItem(productSlug, Math.max(1, nextQuantity));
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="quantity-control" aria-label={`${productSlug} quantity`}>
      <button type="button" aria-label="Decrease quantity" disabled={pending || quantity <= 1} onClick={() => update(quantity - 1)}>
        <Icon name="remove" />
      </button>
      <span>{quantity}</span>
      <button type="button" aria-label="Increase quantity" disabled={pending} onClick={() => update(quantity + 1)}>
        <Icon name="add" />
      </button>
    </div>
  );
}

export function RemoveCartItemButton({ productSlug, label }: { productSlug: string; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setPending(true);
    try {
      await removeCartItem(productSlug);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button className="cart-remove" type="button" aria-label={`Remove ${label}`} disabled={pending} onClick={handleClick}>
      <Icon name="close" />
    </button>
  );
}

export function CheckoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  function handleClick() {
    setPending(true);
    router.push("/checkout");
  }

  return (
    <button className="premium-button" type="button" disabled={pending} onClick={handleClick} style={{ width: "100%" }}>
      {pending ? "Loading..." : "Proceed to Checkout"} <Icon name="arrow_forward" />
    </button>
  );
}
