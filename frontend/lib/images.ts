import type { Product } from "./types";

export function productImage(product: string | Pick<Product, "images">) {
  if (typeof product === "string") return undefined;
  return product.images?.find(Boolean);
}

export function productImages(product: Pick<Product, "images">) {
  return product.images?.filter(Boolean) || [];
}

export function productHref(slug: string) {
  return `/products/${slug}`;
}
