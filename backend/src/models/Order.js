import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productSlug: { type: String, required: true },
    title: { type: String, required: true },
    selectedSize: String,
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled"],
      default: "placed",
      index: true,
    },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paymentMethod: { type: String, enum: ["Credit Card", "UPI", "Cash on Delivery"], default: "Cash on Delivery" },
    shippingAddress: {
      recipient: String,
      line1: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
    },
  },
  { timestamps: true },
);

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
