"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AddressForm from "./AddressForm";
import { updateUserProfile } from "../../lib/client-api";
import type { ProfileResponse } from "../../lib/types";

interface ProfileClientProps {
  profile: ProfileResponse;
}

export function ProfileClient({ profile }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "address" | "settings">("dashboard");
  const [updatingPrefs, setUpdatingPrefs] = useState(false);
  const [newsletter, setNewsletter] = useState(profile.user.preferences?.newsletter || false);
  const [smsUpdates, setSmsUpdates] = useState(profile.user.preferences?.smsUpdates || false);
  const [phone, setPhone] = useState(profile.user.phone || "");
  const [phoneEditable, setPhoneEditable] = useState(false);
  const router = useRouter();

  const defaultAddress = profile.user.addresses?.find((addr) => addr.isDefault) || profile.user.addresses?.[0];

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleUpdatePreferences = async (newsVal: boolean, smsVal: boolean) => {
    setUpdatingPrefs(true);
    try {
      await updateUserProfile({
        preferences: { newsletter: newsVal, smsUpdates: smsVal }
      });
      setNewsletter(newsVal);
      setSmsUpdates(smsVal);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update preferences");
    } finally {
      setUpdatingPrefs(false);
    }
  };

  const handleSavePhone = async () => {
    try {
      await updateUserProfile({ phone });
      setPhoneEditable(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update phone number");
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("DELIVERED")) return { bg: "rgba(18, 53, 31, 0.08)", text: "var(--heritage-forest)" };
    if (s.includes("PROCESSING") || s.includes("SHIPPED")) return { bg: "rgba(189, 131, 33, 0.08)", text: "var(--heritage-gold)" };
    return { bg: "rgba(91, 75, 48, 0.08)", text: "var(--on-surface-variant)" };
  };

  return (
    <div className="profile-layout-container" >
      <div className="promise-ornament promise-ornament-left" aria-hidden="true">
            <img src="/leaf-ornament.svg" alt="" className="" />
      </div>
      {/* Sidebar Navigation */}
      <aside className="profile-sidebar glass-panel">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">
            {profile.user.avatarInitials || profile.user.name.slice(0, 2).toUpperCase()}
          </div>
          <h3>{profile.user.name}</h3>
          <p>{profile.user.email}</p>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span className="material-symbols-outlined">dashboard</span>
            Overview
          </button>
          <button 
            className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            Orders History
          </button>
          <button 
            className={`nav-item ${activeTab === "address" ? "active" : ""}`}
            onClick={() => setActiveTab("address")}
          >
            <span className="material-symbols-outlined">location_on</span>
            Saved Addresses
          </button>
          <button 
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <span className="material-symbols-outlined">settings</span>
            Preferences
          </button>
        </nav>

        <button className="sidebar-signout-btn" onClick={handleSignOut}>
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>

      </aside>

      {/* Content Area */}
      <main className="profile-content-area" style={{ position: "relative"}}>
        <div className="promise-ornament promise-ornament-right" aria-hidden="true">
            <img src="/leaf-ornament.svg" alt="" className="" />
        </div>
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <section className="profile-tab-content fade-in-up">
            <header className="content-header">
              <span>Mindful Lifestyle</span>
              <h1>Welcome back, {profile.user.name.split(" ")[0]}!</h1>
              <p>Explore your heritage stats and track your latest artisanal orders.</p>
            </header>

            {/* Quick Stats Grid */}
            <div className="profile-stats-row">
              <article className="stat-card" onClick={() => setActiveTab("orders")}>
                <div className="stat-icon-wrapper">
                  <span className="material-symbols-outlined">shopping_bag</span>
                </div>
                <div className="stat-info">
                  <span className="stat-val">{profile.stats.orderCount}</span>
                  <p>Total Orders</p>
                </div>
              </article>

              <article className="stat-card">
                <Link href="/wishlist" style={{ display: "flex", alignItems: "center", gap: "20px", textDecoration: "none", color: "inherit", width: "100%" }}>
                  <div className="stat-icon-wrapper">
                    <span className="material-symbols-outlined">favorite</span>
                  </div>
                  <div className="stat-info">
                    <span className="stat-val">{profile.stats.wishlistItems}</span>
                    <p>Saved Items</p>
                  </div>
                </Link>
              </article>

              <article className="stat-card">
                <Link href="/cart" style={{ display: "flex", alignItems: "center", gap: "20px", textDecoration: "none", color: "inherit", width: "100%" }}>
                  <div className="stat-icon-wrapper">
                    <span className="material-symbols-outlined">shopping_cart</span>
                  </div>
                  <div className="stat-info">
                    <span className="stat-val">{profile.stats.cartItems}</span>
                    <p>Cart Items</p>
                  </div>
                </Link>
              </article>

              <article className="stat-card loyalty-stat-card">
                <div className="stat-icon-wrapper loyalty">
                  <span className="material-symbols-outlined">workspace_premium</span>
                </div>
                <div className="stat-info">
                  <span className="stat-val text-gold">{profile.stats.loyaltyPoints}</span>
                  <p>Veda Points</p>
                </div>
              </article>
            </div>

            {/* Main Dashboard Panel */}
            <div className="dashboard-grid">
              {/* Loyalty Widget */}
              <div className="dashboard-widget loyalty-widget glass-panel">
                <div className="widget-header">
                  <span className="material-symbols-outlined text-gold">reward</span>
                  <h3>Veda Club Loyalty</h3>
                </div>
                <div className="loyalty-progress-circle">
                  <div className="points-display">
                    <h3>{profile.stats.loyaltyPoints}</h3>
                    <p>Points</p>
                  </div>
                </div>
                <div className="loyalty-description">
                  <strong>Gold Tier Status</strong>
                  <p>Earn 150 more points to unlock premium organic recipes and heritage member perks!</p>
                </div>
              </div>

              {/* Recent Order Summary */}
              <div className="dashboard-widget recent-order-widget glass-panel">
                <div className="widget-header">
                  <span className="material-symbols-outlined">local_shipping</span>
                  <h3>Latest Order</h3>
                  <button className="widget-action-link" onClick={() => setActiveTab("orders")}>
                    View All
                  </button>
                </div>

                {profile.recentOrders.length > 0 ? (
                  <div className="latest-order-card">
                    <div className="order-card-header">
                      <strong>#{profile.recentOrders[0].orderNumber}</strong>
                      <span 
                        className="status-pill"
                        style={{
                          background: getStatusColor(profile.recentOrders[0].status).bg,
                          color: getStatusColor(profile.recentOrders[0].status).text
                        }}
                      >
                        {profile.recentOrders[0].status}
                      </span>
                    </div>
                    <p className="order-items-summary">
                      {profile.recentOrders[0].items.map((it) => `${it.title} x${it.quantity}`).join(", ")}
                    </p>
                    <div className="order-card-footer">
                      <span>Total: <strong>{profile.recentOrders[0].totalLabel || `₹${profile.recentOrders[0].total}`}</strong></span>
                      <Link href="/products" className="order-action-btn">
                        Order Again
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="empty-widget-state">
                    <span className="material-symbols-outlined">receipt_long</span>
                    <p>No active orders placed yet.</p>
                    <Link href="/products" className="widget-action-btn">Start Shopping</Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: ORDER HISTORY */}
        {activeTab === "orders" && (
          <section className="profile-tab-content fade-in-up">
            <header className="content-header">
              <span>Mindful Shopping</span>
              <h1>Your Order History</h1>
              <p>Review and track all your previous sustainable harvest selections.</p>
            </header>

            {profile.recentOrders.length ? (
              <div className="orders-timeline">
                {profile.recentOrders.map((order) => (
                  <article key={order._id} className="history-order-card glass-panel card-hover">
                    <div className="history-card-top">
                      <div>
                        <span className="order-num-label">Order Number</span>
                        <h3>#{order.orderNumber}</h3>
                      </div>
                      <div className="history-card-meta">
                        <span>Date Placed: <strong>{new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></span>
                        <span 
                          className="status-pill"
                          style={{
                            background: getStatusColor(order.status).bg,
                            color: getStatusColor(order.status).text
                          }}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="history-card-body">
                      <div className="order-thumbnail-row">
                        <span className="material-symbols-outlined package-icon">box</span>
                        <div className="order-items-list">
                          <strong>Items Ordered:</strong>
                          <p>{order.items.map((item) => `${item.title} × ${item.quantity}`).join(", ")}</p>
                        </div>
                      </div>
                    </div>

                    <div className="history-card-footer">
                      <span className="price-label">Order Total: <strong className="text-gold">{order.totalLabel || `₹${order.total}`}</strong></span>
                      <div className="history-card-actions">
                        <button className="secondary-action-btn">
                          Track Package
                        </button>
                        <Link href="/products" className="primary-action-btn">
                          Order Again
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state-card glass-panel">
                <span className="material-symbols-outlined large-icon">receipt_long</span>
                <h2>No Orders Yet</h2>
                <p>You haven't ordered any of our earthly treasures yet. Your first harvest selection will appear here.</p>
                <Link href="/products" className="primary-action-btn" style={{ marginTop: "1rem" }}>
                  Explore Our Products
                </Link>
              </div>
            )}
          </section>
        )}

        {/* TAB 3: SAVED ADDRESSES */}
        {activeTab === "address" && (
          <section className="profile-tab-content fade-in-up">
            <header className="content-header">
              <span>Shipping details</span>
              <h1>Delivery Addresses</h1>
              <p>Manage your default shipping coordinates to ensure smooth and organic delivery cycles.</p>
            </header>

            <div className="addresses-grid">
              {/* Default Address Panel */}
              <div className="address-card default-card glass-panel">
                <div className="card-tag">Default Shipping Address</div>
                {defaultAddress ? (
                  <>
                    <h3>{defaultAddress.recipient || ""}</h3>
                    <p className="address-lines">
                      {defaultAddress.line1 || ""}<br />
                      {defaultAddress.line2 ? <>{defaultAddress.line2}<br /></> : null}
                      {defaultAddress.city || ""}, {defaultAddress.state || ""} {defaultAddress.postalCode || ""}
                    </p>
                    <div className="phone-line">
                      <span className="material-symbols-outlined">call</span>
                      {defaultAddress.phone || ""}
                    </div>
                  </>
                ) : (
                  <p className="no-address-text">No delivery address saved yet. Please add your shipping details below.</p>
                )}
              </div>

              {/* Add New Address Panel */}
              <div className="address-card add-card glass-panel">
                <h3>Add New Coordinate</h3>
                <p className="add-card-desc">Add a new delivery address for shipping orders.</p>
                <AddressForm />
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: ACCOUNT PREFERENCES */}
        {activeTab === "settings" && (
          <section className="profile-tab-content fade-in-up">
            <header className="content-header">
              <span>Account customization</span>
              <h1>Your Preferences</h1>
              <p>Personalize your security coordinates and customize marketing notification cycles.</p>
            </header>

            <div className="preferences-layout">
              {/* User details */}
              <div className="prefs-section glass-panel">
                <div className="prefs-section-header">
                  <span className="material-symbols-outlined">contact_mail</span>
                  <h3>Account Credentials</h3>
                </div>

                <div className="prefs-fields">
                  <div className="pref-field-row">
                    <div className="field-label-group">
                      <strong>Full Name</strong>
                      <p>{profile.user.name}</p>
                    </div>
                  </div>

                  <div className="pref-field-row">
                    <div className="field-label-group">
                      <strong>Email Address</strong>
                      <p>{profile.user.email}</p>
                    </div>
                  </div>

                  <div className="pref-field-row">
                    <div className="field-label-group">
                      <strong>Phone Number</strong>
                      {phoneEditable ? (
                        <div className="editable-phone-row" style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                          <input 
                            type="text" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            className="premium-input"
                            style={{ margin: 0 }}
                          />
                          <button onClick={handleSavePhone} className="save-phone-btn">Save</button>
                          <button onClick={() => setPhoneEditable(false)} className="cancel-phone-btn">Cancel</button>
                        </div>
                      ) : (
                        <p style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {profile.user.phone || "Not added"}
                          <button onClick={() => setPhoneEditable(true)} className="edit-phone-link">
                            Edit
                          </button>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketing Preferences */}
              <div className="prefs-section glass-panel">
                <div className="prefs-section-header">
                  <span className="material-symbols-outlined">notifications_active</span>
                  <h3>Notification Preferences</h3>
                </div>

                <div className="prefs-toggles">
                  <div className="pref-toggle-row">
                    <div className="toggle-label">
                      <strong>Artisanal Newsletter</strong>
                      <p>Receive monthly organic recipe updates, harvest stories, and member deals.</p>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={newsletter}
                        disabled={updatingPrefs}
                        onChange={(e) => handleUpdatePreferences(e.target.checked, smsUpdates)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  <div className="pref-toggle-row">
                    <div className="toggle-label">
                      <strong>SMS Notifications</strong>
                      <p>Get delivery tracking updates and order progress directly on your mobile.</p>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={smsUpdates}
                        disabled={updatingPrefs}
                        onChange={(e) => handleUpdatePreferences(newsletter, e.target.checked)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
