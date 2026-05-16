import { cookies } from "next/headers";
import { fallbackCart, fallbackProducts, fallbackProfile, fallbackReviews, fallbackWishlist } from "./fallback-data";
import type { CartResponse, Product, ProfileResponse, ReviewsResponse, WishlistResponse } from "./types";

const apiBaseUrl = process.env.BACKEND_API_URL || "http://localhost:4000";
const authCookieName = "gaon_veda_token";

async function authHeaders(): Promise<HeadersInit> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(authCookieName)?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, { cache: "no-store", headers: await authHeaders() });

    if (!response.ok) {
      throw new Error(`API ${path} returned ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`Using fallback data for ${path}`, error);
    return fallback;
  }
}

export function formatPrice(value?: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export function ratingIcons(rating = 0) {
  const full = Math.floor(rating);
  const hasHalf = rating > full && rating < 5;

  return Array.from({ length: 5 }, (_, index) => {
    if (index < full) return "star";
    if (index === full && hasHalf) return "star_half";
    return "star_outline";
  });
}

export async function getProducts() {
  return getJson<Product[]>("/api/products", fallbackProducts.filter((product) => product.isListed !== false));
}

export async function getProduct(slug: string) {
  const fallback = fallbackProducts.find((product) => product.slug === slug) || fallbackProducts[0];
  return getJson<Product>(`/api/products/${slug}`, fallback);
}

export async function getCart() {
  return getJson<CartResponse>("/api/cart", fallbackCart);
}

export async function getWishlist() {
  return getJson<WishlistResponse>("/api/wishlist", fallbackWishlist);
}

export async function getReviews(slug: string) {
  const fallback =
    fallbackReviews.items[0]?.productSlug === slug
      ? fallbackReviews
      : { summary: { average: 0, count: 0 }, items: fallbackReviews.items.filter((review) => review.productSlug === slug) };

  return getJson<ReviewsResponse>(`/api/products/${slug}/reviews`, fallback);
}

export async function getProfile() {
  return getJson<ProfileResponse>("/api/profile", fallbackProfile);
}
