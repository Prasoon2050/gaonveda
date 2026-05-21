"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAdminProduct, updateAdminOrder, updateAdminProduct, deleteAdminProduct } from "../../lib/client-api";
import type { AdminOrdersResponse, AdminProductsResponse, AdminSummary, Order, Product } from "../../lib/types";

type AdminDashboardProps = {
  summary: AdminSummary;
  ordersData: AdminOrdersResponse;
  productsData: AdminProductsResponse;
  adminName: string;
};

type Tab = "overview" | "orders" | "products";

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

function money(value?: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function stockLabel(product: Product) {
  const status = product.stockStatus || "healthy";
  if (status === "out") return "Out of stock";
  if (status === "low") return "Low stock";
  return "Healthy";
}

function getStatusColor(status: string) {
  const s = status.toUpperCase();
  if (s.includes("DELIVERED")) return { bg: "rgba(18, 53, 31, 0.08)", text: "var(--heritage-forest)" };
  if (s.includes("PROCESSING") || s.includes("SHIPPED")) return { bg: "rgba(189, 131, 33, 0.08)", text: "var(--heritage-gold)" };
  return { bg: "rgba(91, 75, 48, 0.08)", text: "var(--on-surface-variant)" };
}

function formNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function optionalFormNumber(value: FormDataEntryValue | null) {
  if (value === null || String(value) === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formImageLinks(formData: FormData) {
  return formData
    .getAll("imageLinks")
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function formText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function ingredientsText(product: Product) {
  return (product.ingredients || []).map((ingredient) => `${ingredient.icon || ""} | ${ingredient.title || ""} | ${ingredient.text || ""}`).join("\n");
}

function ImageLinkFields({ initialLinks = [] }: { initialLinks?: string[] }) {
  const [links, setLinks] = useState(initialLinks.length ? initialLinks : [""]);

  function updateLink(index: number, value: string) {
    setLinks((current) => current.map((link, currentIndex) => (currentIndex === index ? value : link)));
  }

  function addLink() {
    setLinks((current) => [...current, ""]);
  }

  function removeLink(index: number) {
    setLinks((current) => (current.length === 1 ? [""] : current.filter((_, currentIndex) => currentIndex !== index)));
  }

  const preview = links.find(Boolean);

  return (
    <div className="admin-image-fields" style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "16px", alignItems: "start" }}>
      <div className="admin-image-preview" style={{ width: "100px", height: "100px", borderRadius: "12px", border: "1px dashed var(--outline-variant)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "var(--surface-container-low)" }}>
        {preview ? <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="image" />}
      </div>
      <div className="admin-image-controls" style={{ display: "grid", gap: "10px" }}>
        {links.map((link, index) => (
          <div className="admin-image-link-row" key={`${index}-${links.length}`} style={{ display: "flex", gap: "8px" }}>
            <input
              className="premium-input"
              name="imageLinks"
              value={link}
              onChange={(event) => updateLink(index, event.target.value)}
              placeholder="https://example.com/product-image.jpg"
              aria-label={`Product image link ${index + 1}`}
            />
            <button type="button" className="premium-button premium-button-secondary" style={{ padding: "0 12px", borderRadius: "8px" }} onClick={() => removeLink(index)} aria-label="Remove image link">
              <Icon name="close" />
            </button>
          </div>
        ))}
        <div className="admin-image-actions" style={{ display: "flex", gap: "10px" }}>
          <button type="button" className="premium-button premium-button-secondary" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={addLink}>
            <Icon name="add_photo_alternate" /> Add Image Field
          </button>
        </div>
      </div>
    </div>
  );
}

function PackSizeFields({ initialSizes = [] }: { initialSizes?: string[] }) {
  const [sizes, setSizes] = useState(initialSizes.length ? initialSizes : [""]);

  function updateSize(index: number, value: string) {
    setSizes((current) => current.map((size, currentIndex) => (currentIndex === index ? value : size)));
  }

  function addSize() {
    setSizes((current) => [...current, ""]);
  }

  function removeSize(index: number) {
    setSizes((current) => (current.length === 1 ? [""] : current.filter((_, currentIndex) => currentIndex !== index)));
  }

  return (
    <div className="admin-pack-size-fields" style={{ display: "grid", gap: "10px" }}>
      {sizes.map((size, index) => (
        <div className="admin-pack-size-row" key={`${index}-${sizes.length}`} style={{ display: "flex", gap: "8px" }}>
          <input
            className="premium-input"
            name="sizeOptions"
            value={size}
            onChange={(event) => updateSize(index, event.target.value)}
            placeholder={index === 0 ? "e.g. 400g Jar" : "e.g. 800g Jar"}
            aria-label={`Pack size option ${index + 1}`}
          />
          <button type="button" className="premium-button premium-button-secondary" style={{ padding: "0 12px", borderRadius: "8px" }} onClick={() => removeSize(index)} aria-label="Remove pack size">
            <Icon name="close" />
          </button>
        </div>
      ))}
      <button type="button" className="premium-button premium-button-secondary" style={{ width: "fit-content", padding: "8px 16px", fontSize: "13px" }} onClick={addSize}>
        <Icon name="add" /> Add Pack Size
      </button>
    </div>
  );
}

export function AdminDashboard({ summary, ordersData, productsData, adminName }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>(ordersData.items);
  const [products, setProducts] = useState<Product[]>(productsData.items);
  const [message, setMessage] = useState("");
  const [pendingKey, setPendingKey] = useState("");
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const router = useRouter();

  const inventoryStats = useMemo(() => {
    const listed = products.filter((product) => product.isListed !== false).length;
    const low = products.filter((product) => product.stockStatus === "low").length;
    const out = products.filter((product) => product.stockStatus === "out" || Number(product.stockQuantity || 0) === 0).length;
    return { listed, low, out };
  }, [products]);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  async function handleDeleteProduct(slug: string) {
    setPendingKey(`delete-${slug}`);
    setMessage("");
    try {
      await deleteAdminProduct(slug);
      setProducts((current) => current.filter((p) => p.slug !== slug));
      setMessage("Product deleted successfully.");
      setProductToDelete(null);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete product.");
    } finally {
      setPendingKey("");
    }
  }

  async function saveOrder(orderId: string, formData: FormData) {
    setPendingKey(`order-${orderId}`);
    setMessage("");

    try {
      const updated = (await updateAdminOrder(orderId, {
        status: String(formData.get("status") || ""),
        paymentStatus: String(formData.get("paymentStatus") || ""),
      })) as Order;

      setOrders((current) => current.map((order) => (order._id === orderId ? updated : order)));
      setMessage(`Order ${updated.orderNumber} updated successfully.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update order.");
    } finally {
      setPendingKey("");
    }
  }

  async function saveProduct(productSlug: string, formData: FormData) {
    setPendingKey(`product-${productSlug}`);
    setMessage("");

    try {
      const updated = (await updateAdminProduct(productSlug, {
        title: formText(formData.get("title")),
        category: formText(formData.get("category")),
        badge: formText(formData.get("badge")),
        description: formText(formData.get("description")),
        storyTitle: formText(formData.get("storyTitle")),
        story: formText(formData.get("story")),
        benefits: formText(formData.get("benefits")),
        ingredientSectionTitle: formText(formData.get("ingredientSectionTitle")),
        ingredientSectionText: formText(formData.get("ingredientSectionText")),
        ingredients: formText(formData.get("ingredients")),
        tags: formText(formData.get("tags")),
        price: formNumber(formData.get("price")),
        salePrice: optionalFormNumber(formData.get("salePrice")),
        pack: formText(formData.get("pack")),
        sizeOptions: formData.getAll("sizeOptions"),
        stockQuantity: formNumber(formData.get("stockQuantity")),
        lowStockThreshold: formNumber(formData.get("lowStockThreshold")),
        imageLinks: formImageLinks(formData),
        isListed: String(formData.get("isListed")) === "true",
        sortOrder: formNumber(formData.get("sortOrder")),
      })) as Product;

      setProducts((current) => current.map((product) => (product.slug === productSlug ? updated : product)));
      setMessage(`${updated.title} updated successfully.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update product.");
    } finally {
      setPendingKey("");
    }
  }

  async function createProduct(formData: FormData) {
    setPendingKey("create-product");
    setMessage("");

    try {
      const created = (await createAdminProduct({
        title: formText(formData.get("title")),
        slug: formText(formData.get("slug")),
        category: formText(formData.get("category")),
        badge: formText(formData.get("badge")),
        price: formNumber(formData.get("price")),
        salePrice: optionalFormNumber(formData.get("salePrice")),
        pack: formText(formData.get("pack")),
        sizeOptions: formData.getAll("sizeOptions"),
        stockQuantity: formNumber(formData.get("stockQuantity")),
        lowStockThreshold: formNumber(formData.get("lowStockThreshold")),
        imageLinks: formImageLinks(formData),
        description: formText(formData.get("description")),
        storyTitle: formText(formData.get("storyTitle")),
        story: formText(formData.get("story")),
        benefits: formText(formData.get("benefits")),
        ingredientSectionTitle: formText(formData.get("ingredientSectionTitle")),
        ingredientSectionText: formText(formData.get("ingredientSectionText")),
        ingredients: formText(formData.get("ingredients")),
        tags: formText(formData.get("tags")),
        isListed: String(formData.get("isListed")) === "true",
      })) as Product;

      setProducts((current) => [created, ...current]);
      setMessage(`${created.title} added to inventory.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create product.");
    } finally {
      setPendingKey("");
    }
  }

  return (
    <div className="profile-layout-container">
      <div className="promise-ornament promise-ornament-left" aria-hidden="true">
        <img src="/leaf-ornament.svg" alt="" />
      </div>

      {/* Sidebar Navigation */}
      <aside className="profile-sidebar glass-panel">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar" style={{ background: "linear-gradient(135deg, var(--heritage-forest), var(--primary))", boxShadow: "0 8px 24px rgba(31, 66, 41, 0.25)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "var(--heritage-paper)" }}>admin_panel_settings</span>
          </div>
          <h3>{adminName}</h3>
          <p>Store Administrator</p>
        </div>

        <nav className="sidebar-nav">
          <Link className="nav-item" href="/profile">
            <span className="material-symbols-outlined">person</span>
            User Profile
          </Link>
          <button
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span className="material-symbols-outlined">dashboard</span>
            Overview
          </button>
          <button
            className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <span className="material-symbols-outlined">receipt_long</span>
            Manage Orders
          </button>
          <button
            className={`nav-item ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <span className="material-symbols-outlined">inventory_2</span>
            Manage Products
          </button>
        </nav>

        <button className="sidebar-signout-btn" onClick={() => setShowSignOutConfirm(true)}>
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </aside>

      {showSignOutConfirm && (
        <div className="modal-overlay" onClick={() => setShowSignOutConfirm(false)}>
          <div className="modal-content signout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="material-symbols-outlined modal-icon">logout</span>
              <h2>Confirm Sign Out</h2>
            </div>
            <p>Are you sure you want to sign out of your Gaonveda account?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowSignOutConfirm(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleSignOut}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {productToDelete && (
        <div className="modal-overlay" onClick={() => setProductToDelete(null)}>
          <div className="modal-content signout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="material-symbols-outlined modal-icon" style={{ color: "#dc3545", background: "rgba(220, 53, 69, 0.1)" }}>delete</span>
              <h2 style={{ color: "#dc3545" }}>Delete Product</h2>
            </div>
            <p>Are you sure you want to completely delete <strong>{productToDelete.title}</strong>? This action will permanently remove it from the database and inventory, and cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setProductToDelete(null)}>Cancel</button>
              <button className="btn-confirm" style={{ background: "#dc3545", color: "white" }} onClick={() => handleDeleteProduct(productToDelete.slug)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <main className="profile-content-area" style={{ position: "relative" }}>
        <div className="promise-ornament promise-ornament-right" aria-hidden="true">
          <img src="/leaf-ornament.svg" alt="" />
        </div>

        {activeTab === "overview" && (
          <section className="profile-tab-content fade-in-up">
            <header className="content-header">
              <span>GAONVEDA OPERATIONS</span>
              <h1>Operations Overview</h1>
              <p>Review real time performance metrics and manage organic product selections.</p>
              {message && (
                <div className="glass-panel" style={{ marginTop: "16px", padding: "12px 18px", borderLeft: "4px solid var(--heritage-gold)", color: "var(--heritage-leaf)" }}>
                  {message}
                </div>
              )}
            </header>

            {/* Quick Stats Grid */}
            <div className="profile-stats-row" style={{ marginBottom: "32px" }}>
              <article className="stat-card">
                <div className="stat-icon-wrapper loyalty">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <div className="stat-info">
                  <span className="stat-val text-gold">{summary.stats.revenueLabel}</span>
                  <p>Revenue</p>
                </div>
              </article>

              <article className="stat-card" onClick={() => setActiveTab("orders")}>
                <div className="stat-icon-wrapper">
                  <span className="material-symbols-outlined">shopping_bag</span>
                </div>
                <div className="stat-info">
                  <span className="stat-val">{summary.stats.orderCount}</span>
                  <p>Orders</p>
                </div>
              </article>

              <article className="stat-card" onClick={() => setActiveTab("products")}>
                <div className="stat-icon-wrapper">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <div className="stat-info">
                  <span className="stat-val">{summary.stats.productCount}</span>
                  <p>Products</p>
                </div>
              </article>

              <article className="stat-card">
                <div className="stat-icon-wrapper">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <div className="stat-info">
                  <span className="stat-val">{summary.stats.customerCount}</span>
                  <p>Customers</p>
                </div>
              </article>
            </div>

            {/* Overview Details Grid */}
            <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "28px" }}>
              {/* Recent Orders */}
              <div className="dashboard-widget glass-panel" style={{ padding: "24px" }}>
                <div className="widget-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px dashed rgba(91, 75, 48, 0.1)", paddingBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="material-symbols-outlined" style={{ color: "var(--heritage-forest)" }}>receipt_long</span>
                    <h3 style={{ margin: 0, fontFamily: "var(--font-display)", color: "var(--heritage-forest)" }}>Recent Orders</h3>
                  </div>
                  <button onClick={() => setActiveTab("orders")} className="premium-button premium-button-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>Manage</button>
                </div>

                 <div style={{ display: "grid", gap: "12px" }}>
                  {orders.slice(0, 5).map((order) => (
                    <div key={order._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderRadius: "12px", background: "rgba(255, 253, 247, 0.4)", border: "1px solid rgba(91, 75, 48, 0.05)" }}>
                      <div>
                        <strong style={{ display: "block", color: "var(--heritage-forest)" }}>#{order.orderNumber}</strong>
                        <span style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>{order.user?.name || "Guest User"} &middot; {order.items.length} items</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span className="status-pill" style={{ background: getStatusColor(order.status).bg, color: getStatusColor(order.status).text, padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: "700" }}>{order.status}</span>
                        <strong style={{ color: "var(--heritage-forest)" }}>{order.totalLabel || money(order.total)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inventory Alerts */}
              <div className="dashboard-widget glass-panel" style={{ padding: "24px" }}>
                <div className="widget-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px dashed rgba(91, 75, 48, 0.1)", paddingBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="material-symbols-outlined" style={{ color: "var(--heritage-forest)" }}>warning</span>
                    <h3 style={{ margin: 0, fontFamily: "var(--font-display)", color: "var(--heritage-forest)" }}>Inventory Alerts</h3>
                  </div>
                  <button onClick={() => setActiveTab("products")} className="premium-button premium-button-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>Review</button>
                </div>

                <div className="inventory-mini-stats" style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "8px", background: "rgba(18, 53, 31, 0.06)", color: "var(--heritage-forest)", fontWeight: "600" }}>{inventoryStats.listed} listed</span>
                  <span style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "8px", background: "rgba(189, 131, 33, 0.08)", color: "var(--heritage-gold)", fontWeight: "600" }}>{inventoryStats.low} low stock</span>
                  <span style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "8px", background: "rgba(159, 29, 22, 0.08)", color: "#9f1d16", fontWeight: "600" }}>{inventoryStats.out} out</span>
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  {products.filter((product) => product.stockStatus !== "healthy").slice(0, 5).map((product) => (
                    <div key={product.slug} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderRadius: "12px", background: "rgba(255, 253, 247, 0.4)", border: "1px solid rgba(91, 75, 48, 0.05)" }}>
                      <div>
                        <strong style={{ display: "block", color: "var(--heritage-forest)", fontSize: "14px" }}>{product.title}</strong>
                        <span style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>{product.category} &middot; threshold {product.lowStockThreshold ?? 5}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span className={`stock-badge ${product.stockStatus || "healthy"}`} style={{ fontSize: "11px", fontWeight: "700" }}>{stockLabel(product)}</span>
                        <strong style={{ color: "var(--heritage-forest)" }}>{product.stockQuantity ?? 0} left</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "orders" && (
          <section className="profile-tab-content fade-in-up">
            <header className="content-header">
              <span>Mindful Operations</span>
              <h1>Customer Orders</h1>
              <p>Track payments and manage processing status coordinates for all purchases.</p>
              {message && (
                <div className="glass-panel" style={{ marginTop: "16px", padding: "12px 18px", borderLeft: "4px solid var(--heritage-gold)", color: "var(--heritage-leaf)" }}>
                  {message}
                </div>
              )}
            </header>

            <div style={{ display: "grid", gap: "20px" }}>
              {orders.map((order) => (
                <form key={order._id} action={(formData) => saveOrder(order._id, formData)} className="glass-panel" style={{ padding: "24px", borderRadius: "20px", display: "grid", gap: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", borderBottom: "1px dashed rgba(91, 75, 48, 0.1)", paddingBottom: "16px" }}>
                    <div>
                      <span style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--on-surface-variant)", fontWeight: "600", letterSpacing: "0.04em" }}>Order Reference</span>
                      <h3 style={{ margin: 0, fontFamily: "var(--font-display)", color: "var(--heritage-forest)" }}>#{order.orderNumber}</h3>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--on-surface-variant)", fontWeight: "600", letterSpacing: "0.04em" }}>Total Payment</span>
                      <h3 style={{ margin: 0, fontFamily: "var(--font-display)", color: "var(--heritage-gold)" }}>{order.totalLabel || money(order.total)}</h3>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                    <div>
                      <strong style={{ display: "block", fontSize: "13px", color: "var(--heritage-forest)", marginBottom: "4px" }}>Customer Identity</strong>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>{order.user?.name || "Guest User"}</p>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--on-surface-variant)" }}>{order.user?.email}</p>
                    </div>
                    <div>
                      <strong style={{ display: "block", fontSize: "13px", color: "var(--heritage-forest)", marginBottom: "4px" }}>Items &amp; Method</strong>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: "500" }}>{order.items.map((item) => `${item.title} x${item.quantity}`).join(", ")}</p>
                      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--on-surface-variant)" }}>Method: {order.paymentMethod}</p>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "var(--heritage-forest)", marginBottom: "4px", fontWeight: "700" }}>Order Status</label>
                      <select name="status" className="premium-input" defaultValue={order.status} aria-label="Order status">
                        {ordersData.orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "var(--heritage-forest)", marginBottom: "4px", fontWeight: "700" }}>Payment Status</label>
                      <select name="paymentStatus" className="premium-input" defaultValue={order.paymentStatus || "pending"} aria-label="Payment status">
                        {ordersData.paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                    <button type="submit" className="premium-button" disabled={pendingKey === `order-${order._id}`} style={{ padding: "10px 24px", fontSize: "14px" }}>
                      {pendingKey === `order-${order._id}` ? "Saving Status..." : "Save Coordinates"}
                    </button>
                  </div>
                </form>
              ))}
            </div>
          </section>
        )}

        {activeTab === "products" && (
          <section className="profile-tab-content fade-in-up">
            <header className="content-header">
              <span>Artisanal Collections</span>
              <h1>Products &amp; Inventory</h1>
              <p>List new treasures and adjust catalog credentials for active heritage products.</p>
              {message && (
                <div className="glass-panel" style={{ marginTop: "16px", padding: "12px 18px", borderLeft: "4px solid var(--heritage-gold)", color: "var(--heritage-leaf)" }}>
                  {message}
                </div>
              )}
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
              {/* Add Product Panel */}
              <div className="glass-panel" style={{ padding: "32px", borderRadius: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px", borderBottom: "1px dashed rgba(91, 75, 48, 0.1)", paddingBottom: "12px" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--heritage-forest)", fontSize: "28px" }}>add_box</span>
                  <h2 style={{ margin: 0, fontFamily: "var(--font-display)", color: "var(--heritage-forest)" }}>Add New Product</h2>
                </div>

                <form action={createProduct} className="admin-product-form" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Title</label>
                    <input className="premium-input" name="title" required placeholder="e.g. Organic Mustard Oil" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Slug (optional)</label>
                    <input className="premium-input" name="slug" placeholder="e.g. organic-mustard-oil" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Category</label>
                    <input className="premium-input" name="category" required placeholder="e.g. Oils" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Badge</label>
                    <input className="premium-input" name="badge" placeholder="e.g. Sun-dried, Cold-pressed" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Default Pack Size</label>
                    <input className="premium-input" name="pack" placeholder="e.g. 500ml Glass Bottle" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Price (₹)</label>
                    <input className="premium-input" name="price" type="number" min="0" required placeholder="e.g. 299" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Sale Price (₹)</label>
                    <input className="premium-input" name="salePrice" type="number" min="0" placeholder="e.g. 249" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Stock Quantity</label>
                    <input className="premium-input" name="stockQuantity" type="number" min="0" defaultValue="0" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Low Stock Alert Threshold</label>
                    <input className="premium-input" name="lowStockThreshold" type="number" min="0" defaultValue="5" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Story Section Title</label>
                    <input className="premium-input" name="storyTitle" placeholder="e.g. Crafted in the Heart of Rajasthan" />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Description</label>
                    <textarea className="premium-input" name="description" rows={3} placeholder="A short introduction to the product..." />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Story Paragraphs</label>
                    <textarea className="premium-input" name="story" rows={5} placeholder="One paragraph per block..." />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Health Benefits</label>
                    <textarea className="premium-input" name="benefits" rows={3} placeholder="Put one benefit per line..." />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span className="admin-field-label" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)" }}>Pack Size Options</span>
                    <PackSizeFields />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span className="admin-field-label" style={{ display: "block", marginBottom: "8px", color: "var(--on-surface-variant)" }}>Product Images</span>
                    <ImageLinkFields />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Ingredients Header</label>
                    <input className="premium-input" name="ingredientSectionTitle" placeholder="e.g. 100% Pure Sourced" />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Ingredients Intro Text</label>
                    <textarea className="premium-input" name="ingredientSectionText" rows={2} placeholder="Brief introduction text about ingredients..." />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Ingredients Details</label>
                    <textarea className="premium-input" name="ingredients" rows={5} placeholder="icon_name | title | description (one per line)" />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Product Tags</label>
                    <textarea className="premium-input" name="tags" rows={3} placeholder="e.g. Vegan (one per line)" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "var(--on-surface-variant)" }}>Product Visibility</label>
                    <select className="premium-input" name="isListed" defaultValue="true">
                      <option value="true">Listed</option>
                      <option value="false">Hidden</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                    <button className="premium-button" type="submit" disabled={pendingKey === "create-product"}>
                      <Icon name="add" /> {pendingKey === "create-product" ? "Listing..." : "List Product"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Edit / List Products Table */}
              <div style={{ display: "grid", gap: "24px" }}>
                {products.map((product) => (
                  <form key={product.slug} action={(formData) => saveProduct(product.slug, formData)} className="glass-panel" style={{ padding: "28px", borderRadius: "24px", display: "grid", gap: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", borderBottom: "1px dashed rgba(91, 75, 48, 0.1)", paddingBottom: "16px" }}>
                      <div>
                        <span style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--on-surface-variant)", fontWeight: "600", letterSpacing: "0.04em" }}>Catalog Product</span>
                        <h3 style={{ margin: 0, fontFamily: "var(--font-display)", color: "var(--heritage-forest)" }}>{product.title}</h3>
                        <span style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>Slug: {product.slug}</span>
                      </div>
                      <span className={`stock-badge ${product.stockStatus || "healthy"}`} style={{ fontSize: "12px", fontWeight: "700" }}>{stockLabel(product)}</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Title</label>
                        <input className="premium-input" name="title" defaultValue={product.title} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Category</label>
                        <input className="premium-input" name="category" defaultValue={product.category} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Badge</label>
                        <input className="premium-input" name="badge" defaultValue={product.badge || ""} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Default Pack Size</label>
                        <input className="premium-input" name="pack" defaultValue={product.pack || ""} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Price (₹)</label>
                        <input className="premium-input" name="price" type="number" min="0" defaultValue={product.price} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Sale Price (₹)</label>
                        <input className="premium-input" name="salePrice" type="number" min="0" defaultValue={product.salePrice || ""} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Stock Quantity</label>
                        <input className="premium-input" name="stockQuantity" type="number" min="0" defaultValue={product.stockQuantity || 0} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Low Alert Level</label>
                        <input className="premium-input" name="lowStockThreshold" type="number" min="0" defaultValue={product.lowStockThreshold ?? 5} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Sort Order</label>
                        <input className="premium-input" name="sortOrder" type="number" defaultValue={product.sortOrder || 0} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Visibility</label>
                        <select className="premium-input" name="isListed" defaultValue={String(product.isListed !== false)}>
                          <option value="true">Listed</option>
                          <option value="false">Hidden</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: "12px" }}>
                      <span className="admin-field-label" style={{ display: "block", marginBottom: "8px" }}>Pack Size Options</span>
                      <PackSizeFields initialSizes={product.sizeOptions?.length ? product.sizeOptions : product.pack ? [product.pack] : []} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginTop: "12px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Story Title</label>
                        <input className="premium-input" name="storyTitle" defaultValue={product.storyTitle || ""} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Ingredients Title</label>
                        <input className="premium-input" name="ingredientSectionTitle" defaultValue={product.ingredientSectionTitle || ""} />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Description</label>
                        <textarea className="premium-input" name="description" rows={3} defaultValue={product.description || ""} />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Story Paragraphs</label>
                        <textarea className="premium-input" name="story" rows={5} defaultValue={(product.story || []).join("\n\n")} />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Benefits</label>
                        <textarea className="premium-input" name="benefits" rows={3} defaultValue={(product.benefits || []).join("\n")} />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Ingredients Introduction</label>
                        <textarea className="premium-input" name="ingredientSectionText" rows={2} defaultValue={product.ingredientSectionText || ""} />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Ingredients Detail List</label>
                        <textarea className="premium-input" name="ingredients" rows={5} defaultValue={ingredientsText(product)} />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px", fontWeight: "700" }}>Product Tags</label>
                        <textarea className="premium-input" name="tags" rows={3} defaultValue={(product.tags || []).join("\n")} />
                      </div>
                    </div>

                    <div style={{ marginTop: "12px" }}>
                      <span className="admin-field-label" style={{ display: "block", marginBottom: "8px" }}>Product Images</span>
                      <ImageLinkFields initialLinks={product.images || []} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                      <button
                        className="premium-button"
                        style={{ background: "rgba(220, 53, 69, 0.12)", border: "1px solid rgba(220, 53, 69, 0.3)", color: "#dc3545" }}
                        type="button"
                        onClick={() => setProductToDelete(product)}
                        disabled={pendingKey === `delete-${product.slug}`}
                      >
                        <Icon name="delete" /> Delete Product
                      </button>
                      <button className="premium-button" type="submit" disabled={pendingKey === `product-${product.slug}`}>
                        <Icon name="save" /> {pendingKey === `product-${product.slug}` ? "Saving..." : "Update Details"}
                      </button>
                    </div>
                  </form>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
