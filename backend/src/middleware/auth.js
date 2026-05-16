import mongoose from "mongoose";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/auth.js";

const defaultCustomerEmail = process.env.DEFAULT_CUSTOMER_EMAIL || "prasoon@example.com";

/**
 * Extract a Bearer token from the Authorization header.
 * @param {import("express").Request} req
 * @returns {string|null}
 */
function extractToken(req) {
  const authorization = req.header("authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
}

/**
 * Middleware that attaches the authenticated user to `req.user`.
 * Does NOT reject unauthenticated requests — use `requireAuth` for that.
 *
 * Resolution order:
 *  1. Bearer token (JWT)
 *  2. x-user-id header (legacy / development)
 *  3. x-user-email header or default email (upserts a guest user)
 */
export async function attachUser(req, _res, next) {
  try {
    const tokenPayload = verifyToken(extractToken(req));

    if (tokenPayload?.sub && mongoose.isValidObjectId(tokenPayload.sub)) {
      const user = await User.findById(tokenPayload.sub);
      if (user) {
        req.user = user;
        return next();
      }
    }

    const userId = req.header("x-user-id");
    if (userId && mongoose.isValidObjectId(userId)) {
      const user = await User.findById(userId);
      if (user) {
        req.user = user;
        return next();
      }
    }

    const email = (req.header("x-user-email") || defaultCustomerEmail).toLowerCase();
    req.user = await User.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          name: "GAONVEDA Customer",
          email,
          avatarInitials: "GV",
          addresses: [],
          loyaltyPoints: 0,
        },
      },
      { new: true, setDefaultsOnInsert: true, upsert: true },
    );

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware that rejects unauthenticated requests with a 401.
 * Must be used AFTER `attachUser`.
 */
export function requireAuth(req, _res, next) {
  if (!req.user) {
    return next(AppError.unauthorized("Authentication required"));
  }
  next();
}
