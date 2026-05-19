import type { Product } from "./types";

export function isOutOfStock(product?: Pick<Product, "stockQuantity"> | null) {
  return Number(product?.stockQuantity ?? 0) <= 0;
}

export function productStockLabel(product?: Pick<Product, "stockQuantity"> | null) {
  return isOutOfStock(product) ? "Out of stock" : null;
}
