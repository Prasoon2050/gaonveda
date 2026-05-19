import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfileStrict, getCart, isAuthApiError } from "../../lib/api";
import { isLoggedIn } from "../../lib/session";
import SignOutButton from "./SignOutButton";
import AddressForm from "./AddressForm";
import { Footer } from "../../components/Footer";
import { Navbar } from "../../components/Navbar";
import { ProfileClient } from "./ProfileClient";

export const dynamic = "force-dynamic";

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

export default async function ProfilePage() {
  if (!(await isLoggedIn())) {
    redirect("/login");
  }

  let profile;
  try {
    profile = await getProfileStrict();
  } catch (error) {
    if (isAuthApiError(error)) {
      redirect("/login");
    }

    const cart = await getCart();
    return (
      <div className="profile-page">
        <Navbar loggedIn={true} cartCount={cart.totals.itemCount} />
        <main className="profile-load-error">
          <h1>Profile could not load</h1>
          <p>We could not load your profile data. Please refresh the page in a moment.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const cart = await getCart();
  const defaultAddress = profile.user.addresses?.find((address) => address.isDefault) || profile.user.addresses?.[0];

  return (
    <div className="profile-page">
      <Navbar loggedIn={true} cartCount={cart.totals.itemCount} />
      <ProfileClient profile={profile} />
      <Footer />
    </div>
  );
}
