"use client";

import { useState } from "react";
import { validatePromoCode } from "../lib/client-api";

type PromoWidgetProps = {
  initialCode?: string;
  initialDiscountPercent?: number;
  onPromoApplied: (code: string, discountPercent: number) => void;
  onPromoRemoved: () => void;
};

export default function PromoWidget({
  initialCode = "",
  initialDiscountPercent = 0,
  onPromoApplied,
  onPromoRemoved,
}: PromoWidgetProps) {
  const [code, setCode] = useState(initialCode);
  const [appliedCode, setAppliedCode] = useState(initialCode);
  const [discountPercent, setDiscountPercent] = useState(initialDiscountPercent);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    initialCode ? { type: "success", message: `Promo code ${initialCode} applied (${initialDiscountPercent}% off)` } : null
  );

  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setPending(true);
    setFeedback(null);

    try {
      const result = await validatePromoCode(code.trim());
      if (result.valid) {
        setAppliedCode(result.code);
        setDiscountPercent(result.discountPercent);
        setFeedback({
          type: "success",
          message: `Promo code "${result.code}" successfully applied! (${result.discountPercent}% off)`,
        });
        onPromoApplied(result.code, result.discountPercent);
      } else {
        setFeedback({ type: "error", message: "Invalid promo code." });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Invalid promo code.",
      });
    } finally {
      setPending(false);
    }
  }

  function handleRemove() {
    setCode("");
    setAppliedCode("");
    setDiscountPercent(0);
    setFeedback(null);
    onPromoRemoved();
  }

  return (
    <div 
      className="promo-widget-container" 
      style={{
        marginTop: "16px",
        padding: "18px 16px",
        background: "rgba(141, 110, 63, 0.04)",
        border: "1px dashed rgba(91, 75, 48, 0.25)",
        borderRadius: "16px",
        boxShadow: "inset 0 1px 3px rgba(91, 75, 48, 0.03)",
        transition: "all 0.3s ease",
      }}
    >
      <label 
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          fontWeight: "700",
          marginBottom: "10px",
          color: "var(--heritage-forest)",
          textTransform: "uppercase",
          letterSpacing: "0.08em"
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--heritage-gold)" }}>
          local_offer
        </span>
        Apply Promo Code
      </label>

      {appliedCode ? (
        <div 
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(26, 80, 48, 0.06)",
            border: "1px solid rgba(26, 80, 48, 0.2)",
            padding: "12px 16px",
            borderRadius: "14px",
            fontSize: "14px",
            boxShadow: "0 2px 8px rgba(26, 80, 48, 0.04)",
            animation: "fadeIn 0.25s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--heritage-gold)", fontSize: "20px" }}>
              stars
            </span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: "700", color: "var(--heritage-forest)", letterSpacing: "0.02em" }}>
                {appliedCode} APPLIED
              </span>
              <span style={{ fontSize: "12px", color: "var(--heritage-forest)", opacity: 0.85 }}>
                Saving {discountPercent}% on your earthly treasures
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            style={{
              background: "none",
              border: "none",
              color: "var(--heritage-clay)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: "6px",
              borderRadius: "50%",
              backgroundColor: "rgba(148, 58, 36, 0.05)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(148, 58, 36, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(148, 58, 36, 0.05)";
            }}
            title="Remove Promo Code"
            aria-label="Remove Promo Code"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            className="premium-input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="PROMOCODE"
            disabled={pending}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "12px",
              textTransform: "uppercase",
              fontSize: "14px",
              border: isFocused ? "1px solid var(--heritage-gold)" : "1px solid rgba(91, 75, 48, 0.2)",
              background: "#fff",
              color: "var(--heritage-ink)",
              outline: "none",
              boxShadow: isFocused ? "0 0 0 3px rgba(180, 122, 26, 0.15)" : "none",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
          <button
            type="submit"
            disabled={pending || !code.trim()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              padding: "0 20px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              whiteSpace: "nowrap",
              cursor: pending || !code.trim() ? "not-allowed" : "pointer",
              background: pending || !code.trim() ? "rgba(91, 75, 48, 0.15)" : isHovered ? "var(--heritage-forest)" : "var(--heritage-gold)",
              color: pending || !code.trim() ? "var(--on-surface-variant)" : "#fff",
              border: "none",
              boxShadow: isHovered && !pending && code.trim() ? "0 4px 12px rgba(180, 122, 26, 0.25)" : "none",
              transform: isHovered && !pending && code.trim() ? "translateY(-1px)" : "none",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {pending ? "Applying..." : "Apply"}
          </button>
        </form>
      )}

      {feedback && (
        <p
          style={{
            marginTop: "10px",
            fontSize: "13px",
            fontWeight: "600",
            color: feedback.type === "success" ? "var(--heritage-forest)" : "var(--heritage-clay)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            borderRadius: "8px",
            background: feedback.type === "success" ? "rgba(26, 80, 48, 0.05)" : "rgba(148, 58, 36, 0.05)",
            border: feedback.type === "success" ? "1px solid rgba(26, 80, 48, 0.1)" : "1px solid rgba(148, 58, 36, 0.1)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            {feedback.type === "success" ? "check_circle" : "error"}
          </span>
          {feedback.message}
        </p>
      )}
    </div>
  );
}
