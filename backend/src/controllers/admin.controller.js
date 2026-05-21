import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { formatMoney, toPlain } from "../utils/helpers.js";

const orderStatuses = ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["pending", "paid", "failed"];

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function numberOrUndefined(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function splitList(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
  return undefined;
}

function splitParagraphs(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
  return undefined;
}

function parseIngredients(value) {
  if (Array.isArray(value)) {
    return value
      .map((ingredient) => {
        if (typeof ingredient === "object" && ingredient) {
          return {
            icon: String(ingredient.icon || "").trim(),
            title: String(ingredient.title || "").trim(),
            text: String(ingredient.text || "").trim(),
          };
        }
        return null;
      })
      .filter((ingredient) => ingredient?.title);
  }

  if (typeof value !== "string") return undefined;

  return value
    .split("\n")
    .map((row) => {
      const [icon = "", title = "", text = ""] = row.split("|").map((part) => part.trim());
      return title ? { icon, title, text } : null;
    })
    .filter(Boolean);
}

function formatOrder(order) {
  const plain = toPlain(order);
  return {
    ...plain,
    totalLabel: formatMoney(plain.total),
    subtotalLabel: formatMoney(plain.subtotal),
    shippingLabel: formatMoney(plain.shipping),
  };
}

function formatProduct(product) {
  const plain = toPlain(product);
  const stockQuantity = Number(plain.stockQuantity || 0);
  const lowStockThreshold = Number(plain.lowStockThreshold ?? 5);

  return {
    ...plain,
    stockQuantity,
    lowStockThreshold,
    stockStatus: stockQuantity <= 0 ? "out" : stockQuantity <= lowStockThreshold ? "low" : "healthy",
    priceLabel: formatMoney(plain.price),
  };
}

function productPayload(body, existingSlug) {
  const slug = slugify(body.slug || existingSlug || body.title);
  if (!slug) {
    throw AppError.badRequest("Product slug or title is required");
  }
  const sizeOptions = splitList(body.sizeOptions) || [];
  const pack = String(body.pack || sizeOptions[0] || "").trim();
  const packOptions = Array.from(new Set([pack, ...sizeOptions].filter(Boolean)));

  const payload = {
    slug,
    title: body.title,
    subtitle: body.subtitle,
    category: body.category,
    badge: body.badge,
    description: body.description,
    storyTitle: body.storyTitle,
    story: splitParagraphs(body.story),
    ingredientSectionTitle: body.ingredientSectionTitle,
    ingredientSectionText: body.ingredientSectionText,
    pack,
    sizeOptions: packOptions,
    tags: splitList(body.tags),
    images: splitList(body.images || body.imageLinks),
    ingredients: parseIngredients(body.ingredients),
    benefits: splitList(body.benefits),
    isListed: body.isListed,
  };

  const numericFields = ["price", "salePrice", "originalPrice", "cartUnitPrice", "stockQuantity", "lowStockThreshold", "sortOrder"];
  numericFields.forEach((field) => {
    const parsed = numberOrUndefined(body[field]);
    if (parsed !== undefined) payload[field] = Math.max(parsed, field.includes("stock") || field === "lowStockThreshold" ? 0 : parsed);
  });

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined || payload[key] === "") delete payload[key];
  });

  return payload;
}

/**
 * GET /api/admin/summary
 */
export async function getAdminSummary(_req, res, next) {
  try {
    const [orderCount, productCount, customerCount, orders, lowStockProducts] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Order.find().sort({ createdAt: -1 }).limit(8).populate("user", "name email").lean(),
      Product.find({
        $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] },
      })
        .sort({ stockQuantity: 1, title: 1 })
        .limit(8)
        .lean({ virtuals: true }),
    ]);

    const revenue = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    res.json({
      stats: {
        orderCount,
        productCount,
        customerCount,
        revenue: revenue[0]?.total || 0,
        revenueLabel: formatMoney(revenue[0]?.total || 0),
      },
      recentOrders: orders.map(formatOrder),
      lowStockProducts: lowStockProducts.map(formatProduct),
      orderStatuses,
      paymentStatuses,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/orders
 */
export async function listAdminOrders(req, res, next) {
  try {
    const query = {};
    if (req.query.status && orderStatuses.includes(req.query.status)) {
      query.status = req.query.status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).populate("user", "name email phone").lean();
    res.json({ items: orders.map(formatOrder), orderStatuses, paymentStatuses });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/orders/:id
 */
export async function updateAdminOrder(req, res, next) {
  try {
    const updates = {};

    if (req.body.status !== undefined) {
      if (!orderStatuses.includes(req.body.status)) {
        throw AppError.badRequest("Invalid order status");
      }
      updates.status = req.body.status;
    }

    if (req.body.paymentStatus !== undefined) {
      if (!paymentStatuses.includes(req.body.paymentStatus)) {
        throw AppError.badRequest("Invalid payment status");
      }
      updates.paymentStatus = req.body.paymentStatus;
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("user", "name email phone")
      .lean();

    if (!order) {
      throw AppError.notFound("Order not found");
    }

    res.json(formatOrder(order));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/products
 */
export async function listAdminProducts(_req, res, next) {
  try {
    const products = await Product.find().sort({ sortOrder: 1, createdAt: -1 }).lean({ virtuals: true });
    res.json({ items: products.map(formatProduct) });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/products
 */
export async function createAdminProduct(req, res, next) {
  try {
    const payload = productPayload(req.body);
    if (!payload.title || !payload.category || payload.price === undefined) {
      throw AppError.badRequest("Title, category, and price are required");
    }

    const existing = await Product.exists({ slug: payload.slug });
    if (existing) {
      throw AppError.conflict("A product with this slug already exists");
    }

    const product = await Product.create(payload);
    res.status(201).json(formatProduct(product));
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/products/:slug
 */
export async function updateAdminProduct(req, res, next) {
  try {
    const payload = productPayload(req.body, req.params.slug);
    const product = await Product.findOneAndUpdate({ slug: req.params.slug }, payload, {
      new: true,
      runValidators: true,
    }).lean({ virtuals: true });

    if (!product) {
      throw AppError.notFound("Product not found");
    }

    res.json(formatProduct(product));
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/products/:slug
 */
export async function deleteAdminProduct(req, res, next) {
  try {
    const product = await Product.findOneAndDelete({ slug: req.params.slug });

    if (!product) {
      throw AppError.notFound("Product not found");
    }

    res.json({ message: "Product deleted successfully", slug: req.params.slug });
  } catch (error) {
    next(error);
  }
}
