"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PromoWidget from "./PromoWidget";

type InteractiveOrderSummaryProps = {
  subtotal: number;
  shipping: number;
  itemCount: number;
  flow: "cart" | "checkout-step1" | "checkout-step2";
  disabledCheckout?: boolean;
  disabledMessage?: string;
  buyNowQueryString?: string;
  onPromoUpdated?: (code: string | null) => void;
};

export default function InteractiveOrderSummary({
  subtotal,
  shipping,
  itemCount,
  flow,
  disabledCheckout = false,
  disabledMessage,
  buyNowQueryString = "",
  onPromoUpdated,
}: InteractiveOrderSummaryProps) {
  const router = useRouter();
  const [promoCode, setPromoCode] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);
  const [pending, setPending] = useState(false);

  // Sync with sessionStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const storedCode = sessionStorage.getItem("appliedPromoCode");
    const storedPercent = sessionStorage.getItem("appliedDiscountPercent");

    if (storedCode && storedPercent) {
      setPromoCode(storedCode);
      setDiscountPercent(Number(storedPercent));
      if (onPromoUpdated) {
        onPromoUpdated(storedCode);
      }
    }
  }, [onPromoUpdated]);

  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const finalTotal = Math.max(0, subtotal - discountAmount + shipping);

  function formatMoney(value: number) {
    return `₹${value.toLocaleString("en-IN")}`;
  }

  function handlePromoApplied(code: string, percent: number) {
    sessionStorage.setItem("appliedPromoCode", code);
    sessionStorage.setItem("appliedDiscountPercent", String(percent));
    setPromoCode(code);
    setDiscountPercent(percent);
    if (onPromoUpdated) {
      onPromoUpdated(code);
    }
  }

  function handlePromoRemoved() {
    sessionStorage.removeItem("appliedPromoCode");
    sessionStorage.removeItem("appliedDiscountPercent");
    setPromoCode("");
    setDiscountPercent(0);
    if (onPromoUpdated) {
      onPromoUpdated(null);
    }
  }

  function handleProceed() {
    setPending(true);
    router.push("/checkout" + (buyNowQueryString ? `?${buyNowQueryString}` : ""));
  }

  const qs = new URLSearchParams(buyNowQueryString);

  return (
    <div className="summary-card-inner">
      <div className="summary-lines" style={{ display: "grid", gap: "12px", marginBottom: "16px" }}>
        <p style={{ display: "flex", justifyContent: "space-between", margin: 0, fontSize: "14px", color: "var(--on-surface-variant)" }}>
          <span>Subtotal ({itemCount} items)</span>
          <strong style={{ color: "var(--on-surface)" }}>{formatMoney(subtotal)}</strong>
        </p>

        {isMounted && discountAmount > 0 && (
          <p style={{ display: "flex", justifyContent: "space-between", margin: 0, fontSize: "14px", color: "var(--heritage-forest)", fontWeight: "600" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>local_offer</span>
              Promo ({promoCode} — {discountPercent}%)
            </span>
            <strong>-{formatMoney(discountAmount)}</strong>
          </p>
        )}

        <p style={{ display: "flex", justifyContent: "space-between", margin: 0, fontSize: "14px", color: "var(--on-surface-variant)" }}>
          <span>Estimated Shipping</span>
          <strong style={{ color: "var(--on-surface)" }}>{shipping > 0 ? formatMoney(shipping) : "Free"}</strong>
        </p>

        {flow === "cart" && (
          <p style={{ display: "flex", justifyContent: "space-between", margin: 0, fontSize: "14px", color: "var(--on-surface-variant)" }}>
            <span>Taxes</span>
            <strong>Calculated at checkout</strong>
          </p>
        )}
      </div>

      {flow !== "checkout-step2" && (
        <PromoWidget
          key={promoCode}
          initialCode={promoCode}
          initialDiscountPercent={discountPercent}
          onPromoApplied={handlePromoApplied}
          onPromoRemoved={handlePromoRemoved}
        />
      )}

      <div 
        className="summary-total" 
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
          paddingTop: "16px",
          borderTop: "2px solid rgba(91, 75, 48, 0.15)",
          fontSize: "18px",
          fontWeight: "700",
          color: "var(--heritage-forest)"
        }}
      >
        <span>Total</span>
        <strong style={{ fontSize: "22px", fontFamily: "var(--font-display)" }}>
          {isMounted ? formatMoney(finalTotal) : formatMoney(subtotal + shipping)}
        </strong>
      </div>

      <div style={{ marginTop: "20px" }}>
        {flow === "cart" && (
          <>
            {disabledMessage && <p className="checkout-block-message" style={{ color: "#dc3545", fontSize: "12px", marginBottom: "8px", fontWeight: "600" }}>{disabledMessage}</p>}
            <button 
              className="premium-button checkout-button" 
              type="button" 
              disabled={pending || disabledCheckout} 
              onClick={handleProceed}
              style={{ width: "100%", padding: "14px", borderRadius: "12px" }}
            >
              {disabledCheckout ? "Checkout unavailable" : pending ? "Loading..." : "Proceed to Checkout"}{" "}
              <span className="material-symbols-outlined" style={{ fontSize: "18px", marginLeft: "4px" }}>arrow_forward</span>
            </button>
          </>
        )}

        {flow === "checkout-step1" && (
          <>
            {subtotal > 0 ? (
              <Link 
                href={`/checkout/payment?${qs.toString()}`} 
                className="premium-button"
                style={{ width: "100%", textDecoration: "none", display: "flex", justifyContent: "center", alignItems: "center", padding: "14px", borderRadius: "12px", boxSizing: "border-box" }}
              >
                Continue to Payment{" "}
                <span className="material-symbols-outlined" style={{ fontSize: "18px", marginLeft: "4px" }}>arrow_forward</span>
              </Link>
            ) : (
              <button 
                className="premium-button" 
                disabled 
                style={{ width: "100%", padding: "14px", borderRadius: "12px" }}
              >
                Select an address to continue
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
