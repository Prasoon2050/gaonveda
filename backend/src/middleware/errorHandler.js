/**
 * Centralized error handler middleware for the GAONVEDA API.
 *
 * - Operational errors (AppError) return their message + status code.
 * - Mongoose validation errors are mapped to 400 with field-level messages.
 * - Unknown errors return a generic 500 in production and full details in dev.
 */
export function errorHandler(error, _req, res, _next) {
  // Log every error for observability
  console.error(`[ERROR] ${error.message}`, error.stack ? `\n${error.stack}` : "");

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const fields = Object.entries(error.errors || {}).reduce((acc, [field, err]) => {
      acc[field] = err.message;
      return acc;
    }, {});

    res.status(400).json({
      message: "Validation failed",
      errors: fields,
    });
    return;
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    res.status(409).json({
      message: `A record with this ${field} already exists`,
    });
    return;
  }

  // Operational errors (thrown intentionally via AppError)
  if (error.isOperational) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  // Unknown / programming errors
  const isProduction = process.env.NODE_ENV === "production";
  res.status(500).json({
    message: isProduction ? "Something went wrong" : error.message,
    ...(isProduction ? {} : { stack: error.stack }),
  });
}
