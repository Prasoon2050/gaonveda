import { NextResponse } from "next/server";

const cookieName = "gaon_veda_token";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(cookieName);
  return response;
}
