type JsonBody = Record<string, unknown>;

async function apiRequest<T>(path: string, options: RequestInit & { body?: BodyInit | null } = {}) {
  const response = await fetch(`/api/backend${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let payload: any = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch (err) {
    // Gracefully handle empty or non-JSON body
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload as T;
}

export function addCartItem(body: JsonBody) {
  return apiRequest("/api/cart/items", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateCartItem(productSlug: string, quantity: number, selectedSize?: string) {
  return apiRequest(`/api/cart/items/${productSlug}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity, selectedSize }),
  });
}

export function removeCartItem(productSlug: string, selectedSize?: string) {
  const qs = selectedSize ? `?selectedSize=${encodeURIComponent(selectedSize)}` : "";
  return apiRequest(`/api/cart/items/${productSlug}${qs}`, {
    method: "DELETE",
  });
}

export function checkoutCart(paymentMethod?: string, promoCode?: string) {
  return apiRequest("/api/checkout", {
    method: "POST",
    body: JSON.stringify({
      ...(paymentMethod ? { paymentMethod } : {}),
      ...(promoCode ? { promoCode } : {}),
    }),
  });
}

export function buyNow(body: JsonBody & { paymentMethod?: string }) {
  return apiRequest("/api/orders/buy-now", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function cancelUserOrder(orderId: string) {
  return apiRequest(`/api/orders/${orderId}/cancel`, {
    method: "PATCH",
  });
}

export function addWishlistItem(productSlug: string) {
  return apiRequest("/api/wishlist/items", {
    method: "POST",
    body: JSON.stringify({ productSlug }),
  });
}

export function removeWishlistItem(productSlug: string) {
  return apiRequest(`/api/wishlist/items/${productSlug}`, {
    method: "DELETE",
  });
}

export function toggleWishlistItem(productSlug: string) {
  return apiRequest("/api/wishlist/toggle", {
    method: "POST",
    body: JSON.stringify({ productSlug }),
  });
}

export function createReview(productSlug: string, body: JsonBody) {
  return apiRequest(`/api/products/${productSlug}/reviews`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateUserProfile(body: JsonBody) {
  return apiRequest("/api/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function updateAdminOrder(orderId: string, body: JsonBody) {
  return apiRequest(`/api/admin/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function createAdminProduct(body: JsonBody) {
  return apiRequest("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateAdminProduct(productSlug: string, body: JsonBody) {
  return apiRequest(`/api/admin/products/${productSlug}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteAdminProduct(productSlug: string) {
  return apiRequest(`/api/admin/products/${productSlug}`, {
    method: "DELETE",
  });
}

export function validatePromoCode(code: string) {
  return apiRequest<{ valid: boolean; discountPercent: number; code: string }>("/api/cart/promo/validate", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}
