import { Router } from "express";
import { getCart, addCartItem, updateCartItem, removeCartItem } from "../controllers/cart.controller.js";
import { attachUser, requireAuth } from "../middleware/auth.js";

const router = Router();

// All cart routes require authentication
router.use(attachUser, requireAuth);

router.get("/", getCart);
router.post("/items", addCartItem);
router.patch("/items/:slug", updateCartItem);
router.delete("/items/:slug", removeCartItem);

export default router;
