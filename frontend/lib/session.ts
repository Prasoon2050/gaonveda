import { cookies } from "next/headers";
import { authCookieName } from "./auth-cookie";

export async function isLoggedIn() {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(authCookieName)?.value);
}
