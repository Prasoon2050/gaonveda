import { cookies } from "next/headers";

const authCookieName = "gaon_veda_token";

export async function isLoggedIn() {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(authCookieName)?.value);
}
