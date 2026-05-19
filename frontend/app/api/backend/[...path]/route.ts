import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { authCookieName } from "../../../../lib/auth-cookie";
import { backendApiUrl } from "../../../../lib/backend-url";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName)?.value;
  const target = backendApiUrl(`/${path.join("/")}${request.nextUrl.search}`);
  const headers: HeadersInit = { "Content-Type": request.headers.get("content-type") || "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(target, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.text(),
    cache: "no-store",
  });
  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") || "application/json",
    },
  });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
