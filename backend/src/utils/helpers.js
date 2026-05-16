/**
 * Shared utility functions for the GAONVEDA API.
 */

/**
 * Format a numeric value as an Indian Rupee string.
 * @param {number} value
 * @returns {string}
 */
export function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

/**
 * Convert a Mongoose document to a plain JS object.
 * Returns the input as-is if it's already a plain object.
 * @param {*} document
 * @returns {object}
 */
export function toPlain(document) {
  return document?.toObject ? document.toObject() : document;
}

/**
 * Generate a unique order number in the format GV-YYYYMMDD-XXXXXX.
 * @returns {string}
 */
export function buildOrderNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GV-${datePart}-${randomPart}`;
}
