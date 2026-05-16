import { User } from "../models/User.js";

import { AppError } from "../utils/AppError.js";
import { hashPassword, verifyPassword, signToken, publicUser } from "../utils/auth.js";

/**
 * POST /api/auth/signup
 */
export async function signup(req, res, next) {
  try {
    const { name, email, password, phone } = req.body;
    const normalizedEmail = String(email).toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser?.passwordHash) {
      throw AppError.conflict("An account already exists for this email");
    }

    const passwordFields = await hashPassword(password);
    const avatarInitials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        name,
        email: normalizedEmail,
        phone,
        avatarInitials,
        ...passwordFields,
      },
      { new: true, setDefaultsOnInsert: true, upsert: true },
    );

    const token = signToken({ sub: String(user._id), email: user.email });
    res.status(201).json({ user: publicUser(user), token });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "");

    const user = await User.findOne({ email });
    if (!user || !(await verifyPassword(password, user))) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const token = signToken({ sub: String(user._id), email: user.email });
    res.json({ user: publicUser(user), token });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 */
export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}
