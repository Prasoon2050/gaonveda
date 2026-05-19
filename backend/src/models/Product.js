import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
  {
    icon: String,
    title: String,
    text: String,
  },
  { _id: false },
);

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, maxlength: 200 },
    comment: { type: String, required: true, maxlength: 2000 },
    verifiedPurchase: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: String,
    category: { type: String, required: true },
    badge: String,
    description: String,
    storyTitle: String,
    story: [String],
    ingredientSectionTitle: String,
    ingredientSectionText: String,
    price: { type: Number, required: true },
    salePrice: Number,
    originalPrice: Number,
    cartUnitPrice: Number,
    pack: String,
    sizeOptions: [String],
    tags: [String],
    images: [String],
    ingredients: [ingredientSchema],
    benefits: [String],
    reviews: [reviewSchema],
    stockQuantity: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    isListed: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/**
 * Virtual: average rating computed from approved reviews.
 */
productSchema.virtual("rating").get(function () {
  const approved = (this.reviews || []).filter((r) => r.status === "approved");
  if (!approved.length) return 0;
  return Number((approved.reduce((sum, r) => sum + r.rating, 0) / approved.length).toFixed(1));
});

/**
 * Virtual: count of approved reviews.
 */
productSchema.virtual("reviewCount").get(function () {
  return (this.reviews || []).filter((r) => r.status === "approved").length;
});

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
