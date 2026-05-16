import { Router } from "express";
import { signup, login, me } from "../controllers/auth.controller.js";
import { attachUser } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post(
  "/signup",
  validate({
    name: { required: true, type: "string", message: "Name is required" },
    email: { required: true, type: "string", message: "Email is required" },
    password: { required: true, type: "string", minLength: 8, message: "Password must be at least 8 characters" },
  }),
  signup,
);

router.post(
  "/login",
  validate({
    email: { required: true, type: "string", message: "Email is required" },
    password: { required: true, type: "string", message: "Password is required" },
  }),
  login,
);

router.get("/me", attachUser, me);

export default router;
