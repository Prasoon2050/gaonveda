import { Router } from "express";
import { getWishlist, addWishlistItem, removeWishlistItem, toggleWishlistItem } from "../controllers/wishlist.controller.js";
import { attachUser, requireAuth } from "../middleware/auth.js";

const router = Router();

// All wishlist routes require authentication
router.use(attachUser, requireAuth);

router.get("/", getWishlist);
router.post("/items", addWishlistItem);
router.delete("/items/:slug", removeWishlistItem);
router.post("/toggle", toggleWishlistItem);

export default router;
