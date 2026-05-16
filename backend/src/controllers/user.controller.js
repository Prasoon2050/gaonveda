import { Order } from "../models/Order.js";
import { publicUser } from "../utils/auth.js";
import { formatMoney, toPlain } from "../utils/helpers.js";
import { getHydratedCart } from "./cart.controller.js";
import { getHydratedWishlist } from "./wishlist.controller.js";

/**
 * GET /api/me
 */
export async function getUser(req, res) {
  res.json(publicUser(req.user));
}

/**
 * PATCH /api/me
 */
export async function updateUser(req, res, next) {
  try {
    const { name, phone, preferences, addresses } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (addresses) updates.addresses = addresses;
    if (preferences) {
      updates.preferences = { ...toPlain(req.user).preferences, ...preferences };
    }

    const { User } = await import("../models/User.js");
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(publicUser(updatedUser));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/profile
 */
export async function getProfile(req, res, next) {
  try {
    const [cart, wishlist, orders] = await Promise.all([
      getHydratedCart(req.user),
      getHydratedWishlist(req.user),
      Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    res.json({
      user: publicUser(req.user),
      stats: {
        cartItems: cart.totals.itemCount,
        wishlistItems: wishlist.items.length,
        orderCount: await Order.countDocuments({ user: req.user._id }),
        loyaltyPoints: req.user.loyaltyPoints || 0,
      },
      recentOrders: orders.map((order) => ({
        ...order,
        totalLabel: formatMoney(order.total),
      })),
    });
  } catch (error) {
    next(error);
  }
}
