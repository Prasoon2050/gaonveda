import { Router } from "express";
import { listProducts, getProduct, getProductReviews, createProductReview } from "../controllers/product.controller.js";
import { attachUser, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", listProducts);

router.get("/:slug", getProduct);

router.get("/:slug/reviews", getProductReviews);

router.post(
  "/:slug/reviews",
  attachUser,
  requireAuth,
  validate({
    rating: { required: true, type: "number", min: 1, max: 5, message: "Rating must be between 1 and 5" },
    title: { required: true, type: "string", message: "Review title is required" },
    comment: { required: true, type: "string", message: "Review comment is required" },
  }),
  createProductReview,
);

export default router;
