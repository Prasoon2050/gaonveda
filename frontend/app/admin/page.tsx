import { redirect } from "next/navigation";
import { Footer } from "../../components/Footer";
import { Navbar } from "../../components/Navbar";
import { getAdminOrders, getAdminProducts, getAdminSummary, getCart, getProfileStrict } from "../../lib/api";
import { isLoggedIn } from "../../lib/session";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isLoggedIn())) {
    redirect("/login");
  }

  let profile;
  try {
    profile = await getProfileStrict();
  } catch {
    redirect("/login");
  }

  if (profile.user.role !== "admin") {
    redirect("/profile");
  }

  try {
    const [summary, orders, products, cart] = await Promise.all([
      getAdminSummary(),
      getAdminOrders(),
      getAdminProducts(),
      getCart(),
    ]);

    return (
      <div className="admin-page">
        <Navbar loggedIn={true} cartCount={cart.totals.itemCount} />
        <AdminDashboard summary={summary} ordersData={orders} productsData={products} adminName={profile.user.name} />
        <Footer />
      </div>
    );
  } catch {
    redirect("/profile");
  }
}
