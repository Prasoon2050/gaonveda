"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "../../lib/client-api";

type Address = {
  recipient?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  isDefault?: boolean;
};

type Props = {
  addresses: Address[];
};

export default function AddressSelector({ addresses }: Props) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(addresses.length === 0);
  const [pending, setPending] = useState(false);

  async function handleSelect(index: number) {
    setPending(true);
    const updatedAddresses = addresses.map((addr, i) => ({
      ...addr,
      isDefault: i === index,
    }));

    try {
      await updateUserProfile({ addresses: updatedAddresses });
      router.refresh();
    } catch (err) {
      alert("Failed to update default address.");
    } finally {
      setPending(false);
    }
  }

  async function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const newAddress: Address = {
      recipient: String(formData.get("recipient") || ""),
      line1: String(formData.get("line1") || ""),
      line2: String(formData.get("line2") || ""),
      city: String(formData.get("city") || ""),
      state: String(formData.get("state") || ""),
      postalCode: String(formData.get("postalCode") || ""),
      phone: String(formData.get("phone") || ""),
      isDefault: true,
    };

    const updatedAddresses: Address[] = addresses.map((addr) => ({ ...addr, isDefault: false }));
    updatedAddresses.push(newAddress);

    try {
      await updateUserProfile({ addresses: updatedAddresses });
      setIsAdding(false);
      router.refresh();
    } catch (err) {
      alert("Failed to add address.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="checkout-addresses-selector">
      {addresses.length > 0 && !isAdding && (
        <div className="checkout-addresses-list">
          {addresses.map((addr, i) => (
            <label
              key={i}
              className={`address-option-card ${addr.isDefault ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="selectedAddress"
                checked={addr.isDefault || false}
                onChange={() => handleSelect(i)}
                disabled={pending}
                className="address-radio"
              />
              <address className="address-details-block">
                <strong>{addr.recipient}</strong><br />
                {addr.line1}<br />
                {addr.line2 ? <>{addr.line2}<br /></> : null}
                {addr.city}, {addr.state} {addr.postalCode}<br />
                {addr.phone}
              </address>
            </label>
          ))}
          <button 
            type="button" 
            onClick={() => setIsAdding(true)}
            className="add-address-dash-btn"
          >
            + Add New Address
          </button>
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAdd} className="add-address-form-panel">
          <h3 className="add-address-title">Add New Address</h3>
          <input name="recipient" placeholder="Recipient Name" required className="premium-input" />
          <input name="phone" placeholder="Phone Number" required className="premium-input" />
          <input name="line1" placeholder="Address Line 1" required className="premium-input" />
          <input name="line2" placeholder="Address Line 2 (Optional)" className="premium-input" />
          <div className="form-grid-row">
            <input name="city" placeholder="City" required className="premium-input" />
            <input name="state" placeholder="State" required className="premium-input" />
          </div>
          <input name="postalCode" placeholder="Postal Code" required className="premium-input" />
          
          <div className="form-actions-row">
            <button type="submit" disabled={pending} className="premium-button">
              {pending ? "Saving..." : "Save & Use Address"}
            </button>
            {addresses.length > 0 && (
              <button type="button" onClick={() => setIsAdding(false)} className="premium-button premium-button-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
