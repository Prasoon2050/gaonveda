import { redirect } from "next/navigation";
import { getProfileStrict } from "../../lib/api";
import { isLoggedIn } from "../../lib/session";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (!(await isLoggedIn())) {
    return <LoginForm />;
  }

  let hasValidSession = false;

  try {
    await getProfileStrict();
    hasValidSession = true;
  } catch {
    hasValidSession = false;
  }

  if (hasValidSession) {
    redirect("/profile");
  }

  return <LoginForm />;
}
