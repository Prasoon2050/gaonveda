import { Router } from "express";
import { checkout, buyNow, listOrders, cancelOrder } from "../controllers/order.controller.js";
import { attachUser, requireAuth } from "../middleware/auth.js";

const router = Router();

// All order routes require authentication
router.use(attachUser, requireAuth);

router.post("/checkout", checkout);
router.post("/buy-now", buyNow);
router.patch("/:id/cancel", cancelOrder);
router.get("/", listOrders);

export default router;
