import "dotenv/config";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { attachUser, requireAuth } from "./middleware/auth.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import userRoutes from "./routes/user.routes.js";
import { checkout } from "./controllers/order.controller.js";

const app = express();
const port = process.env.PORT || 4000;

// ─── Global Middleware ─────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") || "http://localhost:3000",
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ─── Health Check ──────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "gaon-veda-backend", timestamp: new Date().toISOString() });
});

// ─── API Routes ────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.post("/api/checkout", attachUser, requireAuth, checkout);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api", userRoutes);             // GET /api/me, PATCH /api/me, GET /api/profile

// ─── 404 Catch-all ─────────────────────────────────────────────────

app.use("/api/{*path}", (_req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// ─── Error Handler (must be last) ──────────────────────────────────

app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────

await connectDB();

app.listen(port, () => {
  console.log(`Gaon Veda API running on http://localhost:${port}`);
});
