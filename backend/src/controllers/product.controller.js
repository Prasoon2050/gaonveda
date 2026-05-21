import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { AppError } from "../utils/AppError.js";

/**
 * GET /api/products
 * Returns all listed products (without the full reviews array for list performance).
 */
export async function listProducts(req, res, next) {
  try {
    const { search } = req.query;
    const filter = { isListed: true };
    if (search) {
      filter.$or = [
        { title: { $regex: String(search), $options: "i" } },
        { subtitle: { $regex: String(search), $options: "i" } },
        { description: { $regex: String(search), $options: "i" } },
        { category: { $regex: String(search), $options: "i" } },
      ];
    }
    const products = await Product.find(filter).sort({ sortOrder: 1 }).lean({ virtuals: true });

    // Strip the full reviews array from the list response for performance
    const slim = products.map(({ reviews, ...product }) => product);
    res.json(slim);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/:slug
 * Returns a single product with full details (including computed rating/reviewCount).
 */
export async function getProduct(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).lean({ virtuals: true });

    if (!product) {
      throw AppError.notFound("Product not found");
    }

    // Strip the full reviews array from the product response (use /reviews endpoint)
    const { reviews, ...productData } = product;
    res.json(productData);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/:slug/reviews
 * Returns approved reviews for a product, with user details populated.
 */
export async function getProductReviews(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("reviews.user", "name avatarInitials")
      .lean({ virtuals: true });

    if (!product) {
      throw AppError.notFound("Product not found");
    }

    const approvedReviews = (product.reviews || [])
      .filter((review) => review.status === "approved")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      items: approvedReviews,
      summary: {
        average: product.rating,
        count: product.reviewCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/products/:slug/reviews
 * Adds a review to the product's embedded reviews array.
 */
export async function createProductReview(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      throw AppError.notFound("Product not found");
    }

    const hasPurchased = await Order.exists({ user: req.user._id, "items.productSlug": req.params.slug });

    product.reviews.push({
      user: req.user._id,
      rating: Number(req.body.rating),
      title: req.body.title,
      comment: req.body.comment,
      verifiedPurchase: Boolean(hasPurchased),
      status: "approved",
    });

    await product.save();

    // Re-fetch with populated user for the response
    const updated = await Product.findOne({ slug: req.params.slug })
      .populate("reviews.user", "name avatarInitials")
      .lean({ virtuals: true });

    const newReview = updated.reviews[updated.reviews.length - 1];
    res.status(201).json(newReview);
  } catch (error) {
    next(error);
  }
}
