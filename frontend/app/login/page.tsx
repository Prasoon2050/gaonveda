import { redirect } from "next/navigation";
import { isLoggedIn } from "../../lib/session";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await isLoggedIn()) {
    redirect("/profile");
  }

  return <LoginForm />;
}
