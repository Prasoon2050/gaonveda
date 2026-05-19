import { Router } from "express";
import {
  createAdminProduct,
  getAdminSummary,
  listAdminOrders,
  listAdminProducts,
  updateAdminOrder,
  updateAdminProduct,
} from "../controllers/admin.controller.js";
import { attachUser, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(attachUser, requireAdmin);

router.get("/summary", getAdminSummary);
router.get("/orders", listAdminOrders);
router.patch("/orders/:id", updateAdminOrder);
router.get("/products", listAdminProducts);
router.post("/products", createAdminProduct);
router.patch("/products/:slug", updateAdminProduct);

export default router;
