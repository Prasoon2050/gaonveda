import { cookies } from "next/headers";
import { authCookieName } from "./auth-cookie";
import { backendApiUrl } from "./backend-url";
import { fallbackCart, fallbackProducts, fallbackProfile, fallbackReviews, fallbackWishlist } from "./fallback-data";
import type {
  AdminOrdersResponse,
  AdminProductsResponse,
  AdminSummary,
  CartResponse,
  Product,
  ProfileResponse,
  ReviewsResponse,
  WishlistResponse,
} from "./types";

export class ApiError extends Error {
  status: number;

  constructor(path: string, status: number) {
    super(`API ${path} returned ${status}`);
    this.status = status;
  }
}

export function isAuthApiError(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

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
    const response = await fetch(backendApiUrl(path), { cache: "no-store", headers: await authHeaders() });

    if (!response.ok) {
      throw new Error(`API ${path} returned ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`Using fallback data for ${path}`, error);
    return fallback;
  }
}

async function getJsonStrict<T>(path: string): Promise<T> {
  const response = await fetch(backendApiUrl(path), { cache: "no-store", headers: await authHeaders() });

  if (!response.ok) {
    throw new ApiError(path, response.status);
  }

  return (await response.json()) as T;
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

export async function getProducts(search?: string) {
  const path = search ? `/api/products?search=${encodeURIComponent(search)}` : "/api/products";
  return getJson<Product[]>(path, fallbackProducts.filter((product) => product.isListed !== false));
}

export async function getProduct(slug: string) {
  const fallback = fallbackProducts.find((product) => product.slug === slug) || fallbackProducts[0];
  return getJson<Product>(`/api/products/${slug}`, fallback);
}

export async function getCart() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(authCookieName)?.value;
    if (!token) {
      return {
        items: [],
        totals: {
          itemCount: 0,
          subtotal: 0,
          subtotalLabel: "₹0",
          shipping: 0,
          shippingLabel: "₹0",
          total: 0,
          totalLabel: "₹0",
        },
      };
    }
  } catch {
    // Fall through to standard fetch/fallback if cookies() is called in an unsupported context
  }
  return getJson<CartResponse>("/api/cart", fallbackCart);
}

export async function getWishlist() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(authCookieName)?.value;
    if (!token) {
      return {
        items: [],
      };
    }
  } catch {
    // Fall through to standard fetch/fallback if cookies() is called in an unsupported context
  }
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

export async function getProfileStrict() {
  return getJsonStrict<ProfileResponse>("/api/profile");
}

export async function getAdminSummary() {
  return getJsonStrict<AdminSummary>("/api/admin/summary");
}

export async function getAdminOrders() {
  return getJsonStrict<AdminOrdersResponse>("/api/admin/orders");
}

export async function getAdminProducts() {
  return getJsonStrict<AdminProductsResponse>("/api/admin/products");
}
