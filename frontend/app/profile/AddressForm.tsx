"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "../../lib/client-api";

export default function AddressForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const newAddress = {
      recipient: String(formData.get("recipient") || ""),
      line1: String(formData.get("line1") || ""),
      line2: String(formData.get("line2") || ""),
      city: String(formData.get("city") || ""),
      state: String(formData.get("state") || ""),
      postalCode: String(formData.get("postalCode") || ""),
      phone: String(formData.get("phone") || ""),
      isDefault: true,
    };

    try {
      await updateUserProfile({ addresses: [newAddress] });
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to save address");
    } finally {
      setPending(false);
    }
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="premium-button" style={{ marginTop: "1rem" }}>
        Add Address
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
      <input name="recipient" placeholder="Recipient Name" required className="premium-input" />
      <input name="phone" placeholder="Phone Number" required className="premium-input" />
      <input name="line1" placeholder="Address Line 1" required className="premium-input" />
      <input name="line2" placeholder="Address Line 2 (Optional)" className="premium-input" />
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <input name="city" placeholder="City" required className="premium-input" />
        <input name="state" placeholder="State" required className="premium-input" />
      </div>
      <input name="postalCode" placeholder="Postal Code" required className="premium-input" />
      
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button type="submit" disabled={pending} className="premium-button" style={{ flex: 1 }}>
          {pending ? "Saving..." : "Save Address"}
        </button>
        <button type="button" onClick={() => setIsOpen(false)} className="premium-button premium-button-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
