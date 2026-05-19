import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { AppError } from "../utils/AppError.js";
import { formatMoney, toPlain, buildOrderNumber } from "../utils/helpers.js";
import { getHydratedCart, findProductsBySlug } from "./cart.controller.js";

const shippingFee = Number(process.env.SHIPPING_FEE || 80);

// ─── Internal Helpers ──────────────────────────────────────────────

async function createOrderFromItems(user, items, paymentMethod = "Cash on Delivery") {
  const productMap = await findProductsBySlug(items.map((item) => item.productSlug));
  const outOfStockProduct = items
    .map((item) => productMap.get(item.productSlug))
    .find((product) => product && Number(product.stockQuantity || 0) <= 0);

  if (outOfStockProduct) {
    throw AppError.badRequest(`${outOfStockProduct.title} is out of stock`);
  }

  const orderItems = items
    .map((item) => {
      const product = productMap.get(item.productSlug);
      if (!product) return null;

      const unitPrice = item.unitPrice || product.salePrice || product.price;
      const lineTotal = unitPrice * item.quantity;

      return {
        productSlug: product.slug,
        title: product.title,
        selectedSize: item.selectedSize || product.pack,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      };
    })
    .filter(Boolean);

  if (!orderItems.length) {
    throw AppError.badRequest("Cart is empty");
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const defaultAddress = user.addresses?.find((address) => address.isDefault) || user.addresses?.[0];

  return Order.create({
    orderNumber: buildOrderNumber(),
    user: user._id,
    items: orderItems,
    subtotal,
    shipping: shippingFee,
    total: subtotal + shippingFee,
    shippingAddress: defaultAddress,
    paymentMethod,
    paymentStatus: paymentMethod === "Cash on Delivery" ? "pending" : "paid",
  });
}

// ─── Route Handlers ────────────────────────────────────────────────

/**
 * POST /api/checkout
 */
export async function checkout(req, res, next) {
  try {
    const { paymentMethod } = req.body || {};
    const order = await createOrderFromItems(req.user, req.user.cart.map(toPlain), paymentMethod);

    req.user.cart = [];
    await req.user.save();

    res.status(201).json({
      order: { ...toPlain(order), totalLabel: formatMoney(order.total) },
      cart: await getHydratedCart(req.user),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/orders/buy-now
 */
export async function buyNow(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.body.productSlug }).lean({ virtuals: true });

    if (!product) {
      throw AppError.notFound("Product not found");
    }

    const { paymentMethod } = req.body || {};
    const order = await createOrderFromItems(req.user, [
      {
        productSlug: product.slug,
        selectedSize: req.body.selectedSize || product.pack,
        quantity: Math.max(Number(req.body.quantity || 1), 1),
        unitPrice: product.salePrice || product.price,
      },
    ], paymentMethod);

    res.status(201).json({ order: { ...toPlain(order), totalLabel: formatMoney(order.total) } });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders
 */
export async function listOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({
      items: orders.map((order) => ({ ...order, totalLabel: formatMoney(order.total) })),
    });
  } catch (error) {
    next(error);
  }
}
