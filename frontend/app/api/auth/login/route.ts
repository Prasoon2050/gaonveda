import { NextRequest, NextResponse } from "next/server";
import { authCookieName, authCookieOptions } from "../../../../lib/auth-cookie";
import { backendApiUrl } from "../../../../lib/backend-url";

export async function POST(request: NextRequest) {
  const response = await fetch(backendApiUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await request.text(),
  });

  const text = await response.text();
  let payload: any = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch (err) {
    console.error("Failed to parse backend response on login:", err, text);
    payload = { message: "Internal server error. Please try again later." };
  }

  const nextResponse = NextResponse.json(payload, { status: response.status });

  if (response.ok && payload.token) {
    nextResponse.cookies.set(authCookieName, payload.token, authCookieOptions(request));
  }

  return nextResponse;
}
