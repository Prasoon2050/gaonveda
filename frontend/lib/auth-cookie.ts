import type { NextRequest } from "next/server";

export const authCookieName = "gaon_veda_token";

export function isSecureRequest(request: NextRequest) {
  return request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
}

export function authCookieOptions(request: NextRequest) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isSecureRequest(request),
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
