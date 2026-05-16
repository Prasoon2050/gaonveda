import { AppError } from "../utils/AppError.js";

/**
 * Factory that creates a validation middleware from a set of field rules.
 *
 * @param {Object} rules - Keyed by field name, each value is an object:
 *   { required?: boolean, type?: string, min?: number, max?: number,
 *     minLength?: number, message?: string }
 * @returns {import("express").RequestHandler}
 *
 * @example
 *   validate({
 *     email:    { required: true, type: "string", message: "Email is required" },
 *     password: { required: true, minLength: 8, message: "Password must be at least 8 characters" },
 *   })
 */
export function validate(rules) {
  return (req, _res, next) => {
    const errors = {};

    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field];

      if (rule.required && (value === undefined || value === null || value === "")) {
        errors[field] = rule.message || `${field} is required`;
        continue;
      }

      // Skip optional fields that are absent
      if (value === undefined || value === null) continue;

      if (rule.type === "string" && typeof value !== "string") {
        errors[field] = `${field} must be a string`;
        continue;
      }

      if (rule.type === "number") {
        const num = Number(value);
        if (Number.isNaN(num)) {
          errors[field] = `${field} must be a number`;
          continue;
        }
        if (rule.min !== undefined && num < rule.min) {
          errors[field] = `${field} must be at least ${rule.min}`;
          continue;
        }
        if (rule.max !== undefined && num > rule.max) {
          errors[field] = `${field} must be at most ${rule.max}`;
          continue;
        }
      }

      if (rule.minLength && typeof value === "string" && value.length < rule.minLength) {
        errors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return next(new AppError(Object.values(errors)[0], 400));
    }

    next();
  };
}
