import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    recipient: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: "India" },
    phone: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: String,
    passwordHash: String,
    passwordSalt: String,
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    avatarInitials: String,
    loyaltyPoints: { type: Number, default: 0 },
    addresses: [addressSchema],
    cart: {
      type: [
        {
          productSlug: { type: String, required: true },
          quantity: { type: Number, required: true, min: 1, default: 1 },
          selectedSize: String,
          unitPrice: { type: Number, required: true },
        },
      ],
      default: [],
    },
    wishlist: {
      type: [
        {
          productSlug: { type: String, required: true },
          status: { type: String, enum: ["IN STOCK", "LOW STOCK", "OUT OF SEASON"], default: "IN STOCK" },
          actionLabel: { type: String, default: "Add to Cart" },
          addedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    preferences: {
      newsletter: { type: Boolean, default: true },
      smsUpdates: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
