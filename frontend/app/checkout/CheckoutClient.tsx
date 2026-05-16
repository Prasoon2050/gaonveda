"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkoutCart, buyNow } from "../../lib/client-api";

type CheckoutClientProps = {
  isBuyNow: boolean;
  orderData?: {
    productSlug: string;
    quantity: number;
    selectedSize?: string;
  };
  hasAddress: boolean;
};

export default function CheckoutClient({ isBuyNow, orderData, hasAddress }: CheckoutClientProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    if (!hasAddress) {
      setError("Please add a shipping address in your profile before checking out.");
      return;
    }

    setPending(true);
    setError("");

    try {
      if (isBuyNow && orderData) {
        await buyNow(orderData);
      } else {
        await checkoutCart();
      }
      router.push("/profile");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setPending(false);
    }
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      {error ? <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p> : null}
      <button 
        className="checkout-button" 
        disabled={pending} 
        onClick={handleCheckout}
        style={{ width: "100%", justifyContent: "center" }}
      >
        {pending ? "Placing Order..." : "Place Order"} <span className="material-symbols-outlined">arrow_forward</span>
      </button>
    </div>
  );
}
