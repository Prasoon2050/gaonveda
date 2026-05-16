import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "../../lib/api";
import { isLoggedIn } from "../../lib/session";
import SignOutButton from "./SignOutButton";
import AddressForm from "./AddressForm";

export const dynamic = "force-dynamic";

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

export default async function ProfilePage() {
  if (!(await isLoggedIn())) {
    redirect("/login");
  }

  const profile = await getProfile();
  const defaultAddress = profile.user.addresses?.find((address) => address.isDefault) || profile.user.addresses?.[0];

  return (
    <div className="profile-page">
      <header className="commerce-nav">
        <div className="commerce-nav-inner">
          <Link className="commerce-brand" href="/">
            <img src="/logo.png" alt="" />
            GAONVEDA
          </Link>
          <nav>
            <Link href="/products">Shop</Link>
            <Link href="/#story">Our Story</Link>
            <Link href="/#process">Process</Link>
            <Link href="/#coming-soon">Coming Soon</Link>
          </nav>
          <div className="commerce-actions">
            <Link className="commerce-cart-link" href="/wishlist" aria-label="Wishlist">
              <Icon name="favorite" />
            </Link>
            <Link className="commerce-cart-link active" href="/profile" aria-label="Profile">
              <Icon name="person" />
            </Link>
            <Link className="commerce-cart-link" href="/cart" aria-label="Shopping Cart">
              <Icon name="shopping_cart" />
              {profile.stats.cartItems ? <span className="commerce-cart-count">{profile.stats.cartItems}</span> : null}
            </Link>
          </div>
        </div>
      </header>

      <main className="profile-main">
        <section className="profile-hero">
          <div className="profile-avatar">{profile.user.avatarInitials || profile.user.name.slice(0, 2)}</div>
          <div>
            <span>Customer Profile</span>
            <h1>{profile.user.name}</h1>
            <p>{profile.user.email}</p>
          </div>
        </section>

        <section className="profile-stats" aria-label="Account stats">
          <article>
            <Icon name="shopping_bag" />
            <span>{profile.stats.orderCount}</span>
            <p>Orders</p>
          </article>
          <article>
            <Icon name="favorite" />
            <span>{profile.stats.wishlistItems}</span>
            <p>Saved Items</p>
          </article>
          <article>
            <Icon name="shopping_cart" />
            <span>{profile.stats.cartItems}</span>
            <p>Cart Items</p>
          </article>
          <article>
            <Icon name="workspace_premium" />
            <span>{profile.stats.loyaltyPoints}</span>
            <p>Veda Points</p>
          </article>
        </section>

        <div className="profile-grid">
          <section className="profile-panel glass-panel" style={{ borderRadius: "12px", marginBottom: "2rem" }}>
            <div className="profile-panel-heading">
              <h2>Account Details</h2>
              <SignOutButton />
            </div>
            <dl>
              <div>
                <dt>Phone</dt>
                <dd>{profile.user.phone || "Not added"}</dd>
              </div>
              <div>
                <dt>Newsletter</dt>
                <dd>{profile.user.preferences?.newsletter ? "Subscribed" : "Not subscribed"}</dd>
              </div>
              <div>
                <dt>SMS Updates</dt>
                <dd>{profile.user.preferences?.smsUpdates ? "Enabled" : "Disabled"}</dd>
              </div>
            </dl>
          </section>

          <section className="profile-panel glass-panel" style={{ borderRadius: "12px", marginBottom: "2rem" }}>
            <div className="profile-panel-heading">
              <h2>Default Address</h2>
              <Link href="/cart">Use at Checkout</Link>
            </div>
            {defaultAddress ? (
              <address>
                <strong>{defaultAddress.recipient}</strong>
                <span>{defaultAddress.line1}</span>
                {defaultAddress.line2 ? <span>{defaultAddress.line2}</span> : null}
                <span>
                  {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}
                </span>
                <span>{defaultAddress.phone}</span>
              </address>
            ) : (
              <p>No address saved yet.</p>
            )}
            <AddressForm />
          </section>
        </div>

        <section className="profile-panel profile-orders glass-panel" style={{ borderRadius: "12px", marginBottom: "2rem" }}>
          <div className="profile-panel-heading">
            <h2>Recent Orders</h2>
            <Link href="/products">Continue Shopping</Link>
          </div>
          {profile.recentOrders.length ? (
            <div className="order-list">
              {profile.recentOrders.map((order) => (
                <article key={order._id}>
                  <div>
                    <strong>{order.orderNumber}</strong>
                    <span>{new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <p>{order.items.map((item) => `${item.title} x${item.quantity}`).join(", ")}</p>
                  <div>
                    <em>{order.status}</em>
                    <strong>{order.totalLabel}</strong>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-orders">
              <Icon name="receipt_long" />
              <p>No orders yet. Your first heritage harvest will appear here.</p>
              <Link href="/products">Explore Products</Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
