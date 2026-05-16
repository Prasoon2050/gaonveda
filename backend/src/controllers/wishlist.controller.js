import { Product } from "../models/Product.js";
import { AppError } from "../utils/AppError.js";
import { toPlain } from "../utils/helpers.js";
import { findProductsBySlug } from "./cart.controller.js";

// ─── Internal Helpers ──────────────────────────────────────────────

async function getHydratedWishlist(user) {
  const productMap = await findProductsBySlug((user.wishlist || []).map((item) => item.productSlug));

  return {
    userId: String(user._id),
    items: (user.wishlist || [])
      .map((item) => {
        const plainItem = toPlain(item);
        const product = productMap.get(plainItem.productSlug) || null;

        if (product) {
          const { reviews, ...slimProduct } = product;
          return { ...plainItem, product: slimProduct };
        }

        return null;
      })
      .filter(Boolean),
  };
}

// ─── Exported Helpers (for user controller) ────────────────────────

export { getHydratedWishlist };

// ─── Route Handlers ────────────────────────────────────────────────

/**
 * GET /api/wishlist
 */
export async function getWishlist(req, res, next) {
  try {
    res.json(await getHydratedWishlist(req.user));
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/wishlist/items
 */
export async function addWishlistItem(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.body.productSlug }).lean({ virtuals: true });

    if (!product) {
      throw AppError.notFound("Product not found");
    }

    const exists = req.user.wishlist.some((item) => item.productSlug === product.slug);

    if (!exists) {
      req.user.wishlist.push({
        productSlug: product.slug,
        status: product.isListed === false ? "OUT OF SEASON" : "IN STOCK",
        actionLabel: product.isListed === false ? "Notify Me" : "Add to Cart",
      });
      await req.user.save();
    }

    res.status(201).json(await getHydratedWishlist(req.user));
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/wishlist/items/:slug
 */
export async function removeWishlistItem(req, res, next) {
  try {
    req.user.wishlist = req.user.wishlist.filter((item) => item.productSlug !== req.params.slug);
    await req.user.save();
    res.json(await getHydratedWishlist(req.user));
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/wishlist/toggle
 */
export async function toggleWishlistItem(req, res, next) {
  try {
    const productSlug = req.body.productSlug;
    const existingIndex = req.user.wishlist.findIndex((item) => item.productSlug === productSlug);

    if (existingIndex >= 0) {
      req.user.wishlist.splice(existingIndex, 1);
    } else {
      const product = await Product.findOne({ slug: productSlug }).lean({ virtuals: true });
      if (!product) {
        throw AppError.notFound("Product not found");
      }
      req.user.wishlist.push({
        productSlug,
        status: product.isListed === false ? "OUT OF SEASON" : "IN STOCK",
        actionLabel: product.isListed === false ? "Notify Me" : "Add to Cart",
      });
    }

    await req.user.save();
    res.json(await getHydratedWishlist(req.user));
  } catch (error) {
    next(error);
  }
}
