import { NextResponse } from "next/server";
import { authCookieName } from "../../../../lib/auth-cookie";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(authCookieName);
  return response;
}
