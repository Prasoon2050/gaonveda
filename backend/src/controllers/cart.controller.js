import { Product } from "../models/Product.js";
import { AppError } from "../utils/AppError.js";
import { formatMoney, toPlain } from "../utils/helpers.js";

const shippingFee = Number(process.env.SHIPPING_FEE || 80);

// ─── Internal Helpers ──────────────────────────────────────────────

async function findProductsBySlug(slugs) {
  const products = await Product.find({ slug: { $in: slugs } }).lean({ virtuals: true });
  return new Map(products.map((product) => [product.slug, product]));
}

function buildCartResponse(user, productMap) {
  const items = (user.cart || [])
    .map((item) => {
      const plainItem = toPlain(item);
      const product = productMap.get(plainItem.productSlug) || null;
      const unitPrice = plainItem.unitPrice || product?.cartUnitPrice || product?.salePrice || product?.price || 0;
      const lineTotal = unitPrice * plainItem.quantity;

      // Strip reviews from the product in cart responses
      if (product) {
        const { reviews, ...slimProduct } = product;
        return {
          ...plainItem,
          unitPrice,
          unitPriceLabel: formatMoney(unitPrice),
          lineTotal,
          lineTotalLabel: formatMoney(lineTotal),
          product: slimProduct,
        };
      }

      return null;
    })
    .filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = subtotal > 0 ? shippingFee : 0;

  return {
    userId: String(user._id),
    items,
    totals: {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      subtotalLabel: formatMoney(subtotal),
      shipping,
      shippingLabel: formatMoney(shipping),
      total: subtotal + shipping,
      totalLabel: formatMoney(subtotal + shipping),
    },
  };
}

async function getHydratedCart(user) {
  const productMap = await findProductsBySlug((user.cart || []).map((item) => item.productSlug));
  return buildCartResponse(user, productMap);
}

// ─── Exported Helpers (for order controller) ───────────────────────

export { getHydratedCart, findProductsBySlug };

// ─── Route Handlers ────────────────────────────────────────────────

function normalizedCartSize(value, product) {
  return String(value || product?.pack || "").trim();
}

function cartItemMatches(cartItem, productSlug, selectedSize, product) {
  if (cartItem.productSlug !== productSlug) return false;
  if (!selectedSize) return true;
  return normalizedCartSize(cartItem.selectedSize, product) === selectedSize;
}

/**
 * GET /api/cart
 */
export async function getCart(req, res, next) {
  try {
    res.json(await getHydratedCart(req.user));
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/cart/items
 */
export async function addCartItem(req, res, next) {
  try {
    const { productSlug, selectedSize } = req.body;
    const quantity = Math.max(Number(req.body.quantity || 1), 1);
    const product = await Product.findOne({ slug: productSlug }).lean({ virtuals: true });

    if (!product) {
      throw AppError.notFound("Product not found");
    }

    const normalizedSize = normalizedCartSize(selectedSize, product);
    const matchingItems = req.user.cart.filter((cartItem) => cartItemMatches(cartItem, productSlug, normalizedSize, product));
    const unitPrice = product.cartUnitPrice || product.salePrice || product.price;

    if (matchingItems.length) {
      const existingQuantity = matchingItems.reduce((sum, cartItem) => sum + Number(cartItem.quantity || 0), 0);
      const existingSize = matchingItems[0].selectedSize || normalizedSize;

      req.user.cart = req.user.cart.filter((cartItem) => !cartItemMatches(cartItem, productSlug, normalizedSize, product));
      req.user.cart.push({
        productSlug,
        quantity: existingQuantity + quantity,
        selectedSize: existingSize,
        unitPrice,
      });
    } else {
      req.user.cart.push({
        productSlug,
        quantity,
        selectedSize: normalizedSize,
        unitPrice,
      });
    }

    await req.user.save();
    res.status(201).json(await getHydratedCart(req.user));
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/cart/items/:slug
 */
export async function updateCartItem(req, res, next) {
  try {
    const quantity = Math.max(Number(req.body.quantity || 1), 1);
    const selectedSize = req.body.selectedSize ? String(req.body.selectedSize).trim() : "";
    const item = req.user.cart.find((cartItem) => cartItemMatches(cartItem, req.params.slug, selectedSize));

    if (!item) {
      throw AppError.notFound("Cart item not found");
    }

    item.quantity = quantity;
    await req.user.save();
    res.json(await getHydratedCart(req.user));
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/cart/items/:slug
 */
export async function removeCartItem(req, res, next) {
  try {
    const selectedSize = req.query.selectedSize ? String(req.query.selectedSize).trim() : "";
    req.user.cart = req.user.cart.filter((item) => !cartItemMatches(item, req.params.slug, selectedSize));
    await req.user.save();
    res.json(await getHydratedCart(req.user));
  } catch (error) {
    next(error);
  }
}
