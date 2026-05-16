"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useState } from "react";
import { addCartItem, removeWishlistItem } from "../../lib/client-api";

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

export function RemoveWishlistButton({ productSlug, label }: { productSlug: string; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setPending(true);

    try {
      await removeWishlistItem(productSlug);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button type="button" aria-label={`Remove ${label}`} disabled={pending} onClick={handleClick}>
      <Icon name="close" />
    </button>
  );
}

export function WishlistAddToCartButton({ productSlug, disabled, label }: { productSlug: string; disabled?: boolean; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setPending(true);

    try {
      await addCartItem({ productSlug, quantity: 1 });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button type="button" disabled={disabled || pending} onClick={handleClick}>
      {pending ? "Adding..." : label}
    </button>
  );
}
