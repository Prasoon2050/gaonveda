import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_API_URL || "http://localhost:4000";
const cookieName = "gaon_veda_token";

export async function POST(request: NextRequest) {
  const response = await fetch(`${backendUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await request.text(),
  });
  const payload = await response.json();
  const nextResponse = NextResponse.json(payload, { status: response.status });

  if (response.ok && payload.token) {
    nextResponse.cookies.set(cookieName, payload.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return nextResponse;
}
