import { NextRequest, NextResponse } from "next/server";
import { authCookieName, authCookieOptions } from "../../../../lib/auth-cookie";
import { backendApiUrl } from "../../../../lib/backend-url";

export async function POST(request: NextRequest) {
  const response = await fetch(backendApiUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await request.text(),
  });
  const payload = await response.json();
  const nextResponse = NextResponse.json(payload, { status: response.status });

  if (response.ok && payload.token) {
    nextResponse.cookies.set(authCookieName, payload.token, authCookieOptions(request));
  }

  return nextResponse;
}
