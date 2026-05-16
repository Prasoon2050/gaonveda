"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkoutCart, buyNow } from "../../../lib/client-api";

type PaymentClientProps = {
  isBuyNow: boolean;
  orderData?: {
    productSlug: string;
    quantity: number;
    selectedSize?: string;
  };
};

export default function PaymentClient({ isBuyNow, orderData }: PaymentClientProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  const options = ["Credit Card", "UPI", "Cash on Delivery"];

  async function handleCheckout() {
    setPending(true);
    setError("");

    try {
      if (isBuyNow && orderData) {
        await buyNow({ ...orderData, paymentMethod });
      } else {
        await checkoutCart(paymentMethod);
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
      <div style={{ marginBottom: "2rem" }}>
        {options.map((option) => (
          <label 
            key={option} 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem", 
              padding: "1rem", 
              border: paymentMethod === option ? "2px solid var(--color-primary)" : "1px solid #ccc",
              borderRadius: "8px",
              marginBottom: "0.5rem",
              cursor: "pointer",
              background: paymentMethod === option ? "#f9fdfa" : "white"
            }}
          >
            <input 
              type="radio" 
              name="paymentMethod" 
              value={option} 
              checked={paymentMethod === option} 
              onChange={() => setPaymentMethod(option)} 
            />
            {option}
          </label>
        ))}
      </div>

      {error ? <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p> : null}
      
      <button 
        className="premium-button" 
        disabled={pending} 
        onClick={handleCheckout}
        style={{ width: "100%" }}
      >
        {pending ? "Processing..." : "Place Order"} <span className="material-symbols-outlined">arrow_forward</span>
      </button>
    </div>
  );
}
