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

    const item = req.user.cart.find(
      (cartItem) => cartItem.productSlug === productSlug && cartItem.selectedSize === selectedSize,
    );
    const unitPrice = product.cartUnitPrice || product.salePrice || product.price;

    if (item) {
      item.quantity += quantity;
      item.unitPrice = unitPrice;
    } else {
      req.user.cart.push({
        productSlug,
        quantity,
        selectedSize: selectedSize || product.pack,
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
    const item = req.user.cart.find((cartItem) => cartItem.productSlug === req.params.slug);

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
    req.user.cart = req.user.cart.filter((item) => item.productSlug !== req.params.slug);
    await req.user.save();
    res.json(await getHydratedCart(req.user));
  } catch (error) {
    next(error);
  }
}
