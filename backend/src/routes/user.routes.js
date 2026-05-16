import { Router } from "express";
import { getProfile, getUser, updateUser } from "../controllers/user.controller.js";
import { attachUser, requireAuth } from "../middleware/auth.js";

const router = Router();

// All user routes require authentication
router.use(attachUser, requireAuth);

router.get("/me", getUser);
router.patch("/me", updateUser);
router.get("/profile", getProfile);

export default router;
