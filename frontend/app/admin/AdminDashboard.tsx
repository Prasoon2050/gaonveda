"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminProduct, updateAdminOrder, updateAdminProduct } from "../../lib/client-api";
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
    <div className="admin-image-fields">
      <div className="admin-image-preview">
        {preview ? <img src={preview} alt="" /> : <Icon name="image" />}
      </div>
      <div className="admin-image-controls">
        {links.map((link, index) => (
          <div className="admin-image-link-row" key={`${index}-${links.length}`}>
            <input
              name="imageLinks"
              value={link}
              onChange={(event) => updateLink(index, event.target.value)}
              placeholder="https://example.com/product-image.jpg"
              aria-label={`Product image link ${index + 1}`}
            />
            <button type="button" onClick={() => removeLink(index)} aria-label="Remove image link">
              <Icon name="close" />
            </button>
          </div>
        ))}
        <div className="admin-image-actions">
          <button type="button" onClick={addLink}>
            <Icon name="add_photo_alternate" /> Add more image
          </button>
          <button type="button" className="admin-upload-button">
            <Icon name="upload" /> Upload image
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard({ summary, ordersData, productsData, adminName }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>(ordersData.items);
  const [products, setProducts] = useState<Product[]>(productsData.items);
  const [message, setMessage] = useState("");
  const [pendingKey, setPendingKey] = useState("");
  const router = useRouter();

  const inventoryStats = useMemo(() => {
    const listed = products.filter((product) => product.isListed !== false).length;
    const low = products.filter((product) => product.stockStatus === "low").length;
    const out = products.filter((product) => product.stockStatus === "out" || Number(product.stockQuantity || 0) === 0).length;
    return { listed, low, out };
  }, [products]);

  async function saveOrder(orderId: string, formData: FormData) {
    setPendingKey(`order-${orderId}`);
    setMessage("");

    try {
      const updated = (await updateAdminOrder(orderId, {
        status: String(formData.get("status") || ""),
        paymentStatus: String(formData.get("paymentStatus") || ""),
      })) as Order;

      setOrders((current) => current.map((order) => (order._id === orderId ? updated : order)));
      setMessage(`Order ${updated.orderNumber} updated.`);
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
        stockQuantity: formNumber(formData.get("stockQuantity")),
        lowStockThreshold: formNumber(formData.get("lowStockThreshold")),
        imageLinks: formImageLinks(formData),
        isListed: String(formData.get("isListed")) === "true",
        sortOrder: formNumber(formData.get("sortOrder")),
      })) as Product;

      setProducts((current) => current.map((product) => (product.slug === productSlug ? updated : product)));
      setMessage(`${updated.title} saved.`);
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
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-person">
          <span><Icon name="admin_panel_settings" /></span>
          <div>
            <strong>{adminName}</strong>
            <small>Store administrator</small>
          </div>
        </div>
        <nav>
          {(["overview", "orders", "products"] as Tab[]).map((tab) => (
            <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
              <Icon name={tab === "overview" ? "monitoring" : tab === "orders" ? "receipt_long" : "inventory_2"} />
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <span>GAONVEDA operations</span>
            <h1>Inventory and order dashboard</h1>
          </div>
          {message ? <p className="admin-message">{message}</p> : null}
        </header>

        {activeTab === "overview" ? (
          <>
            <div className="admin-stat-grid">
              <article><Icon name="payments" /><span>Revenue</span><strong>{summary.stats.revenueLabel}</strong></article>
              <article><Icon name="shopping_bag" /><span>Orders</span><strong>{summary.stats.orderCount}</strong></article>
              <article><Icon name="inventory_2" /><span>Products</span><strong>{summary.stats.productCount}</strong></article>
              <article><Icon name="groups" /><span>Customers</span><strong>{summary.stats.customerCount}</strong></article>
            </div>

            <div className="admin-two-column">
              <section className="admin-panel">
                <div className="admin-panel-title">
                  <h2>Recent orders</h2>
                  <button onClick={() => setActiveTab("orders")}>Manage</button>
                </div>
                {orders.slice(0, 6).map((order) => (
                  <div className="admin-list-row" key={order._id}>
                    <div>
                      <strong>#{order.orderNumber}</strong>
                      <span>{order.user?.name || "Customer"} · {order.items.length} item(s)</span>
                    </div>
                    <em>{order.status}</em>
                    <b>{order.totalLabel || money(order.total)}</b>
                  </div>
                ))}
              </section>

              <section className="admin-panel">
                <div className="admin-panel-title">
                  <h2>Inventory alerts</h2>
                  <button onClick={() => setActiveTab("products")}>Review</button>
                </div>
                <div className="inventory-mini-stats">
                  <span>{inventoryStats.listed} listed</span>
                  <span>{inventoryStats.low} low stock</span>
                  <span>{inventoryStats.out} out</span>
                </div>
                {products.filter((product) => product.stockStatus !== "healthy").slice(0, 6).map((product) => (
                  <div className="admin-list-row" key={product.slug}>
                    <div>
                      <strong>{product.title}</strong>
                      <span>{product.category} · threshold {product.lowStockThreshold ?? 5}</span>
                    </div>
                    <em className={product.stockStatus === "out" ? "danger" : ""}>{stockLabel(product)}</em>
                    <b>{product.stockQuantity ?? 0}</b>
                  </div>
                ))}
              </section>
            </div>
          </>
        ) : null}

        {activeTab === "orders" ? (
          <section className="admin-panel admin-table-panel">
            <div className="admin-panel-title">
              <h2>All orders</h2>
              <span>{orders.length} orders</span>
            </div>
            <div className="admin-table orders-table">
              {orders.map((order) => (
                <form key={order._id} action={(formData) => saveOrder(order._id, formData)} className="admin-table-row">
                  <div>
                    <strong>#{order.orderNumber}</strong>
                    <span>{new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN")}</span>
                  </div>
                  <div>
                    <strong>{order.user?.name || "Customer"}</strong>
                    <span>{order.user?.email}</span>
                  </div>
                  <div>
                    <strong>{order.items.map((item) => `${item.title} x${item.quantity}`).join(", ")}</strong>
                    <span>{order.paymentMethod}</span>
                  </div>
                  <select name="status" defaultValue={order.status} aria-label="Order status">
                    {ordersData.orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <select name="paymentStatus" defaultValue={order.paymentStatus || "pending"} aria-label="Payment status">
                    {ordersData.paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <strong>{order.totalLabel || money(order.total)}</strong>
                  <button type="submit" disabled={pendingKey === `order-${order._id}`}>
                    {pendingKey === `order-${order._id}` ? "Saving" : "Save"}
                  </button>
                </form>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "products" ? (
          <div className="admin-products-layout">
            <section className="admin-panel">
              <div className="admin-panel-title">
                <h2>Add product</h2>
              </div>
              <form action={createProduct} className="admin-product-form">
                <label>Title<input name="title" required /></label>
                <label>URL slug (optional)<input name="slug" placeholder="auto from title" /></label>
                <label>Category<input name="category" required /></label>
                <label>Badge<input name="badge" placeholder="Sun-dried, New, Low stock" /></label>
                <label>Pack<input name="pack" placeholder="400g Jar" /></label>
                <label>Price<input name="price" type="number" min="0" required /></label>
                <label>Sale price<input name="salePrice" type="number" min="0" /></label>
                <label>Stock<input name="stockQuantity" type="number" min="0" defaultValue="0" /></label>
                <label>Low stock at<input name="lowStockThreshold" type="number" min="0" defaultValue="5" /></label>
                <label>Story title<input name="storyTitle" placeholder="Aged in Tradition, Sun-Kissed for Soul" /></label>
                <label className="admin-form-wide">Story paragraphs<textarea name="story" rows={5} placeholder={"Paragraph one...\n\nParagraph two..."} /></label>
                <label className="admin-form-wide">Benefits<textarea name="benefits" rows={3} placeholder={"100% Sun-Dried Naturally\nSourced from Local Organic Farms"} /></label>
                <div className="admin-form-wide">
                  <span className="admin-field-label">Product images</span>
                  <ImageLinkFields />
                </div>
                <label>Description<textarea name="description" rows={3} /></label>
                <label>Ingredients title<input name="ingredientSectionTitle" placeholder="Pure Ingredients, Honest Flavor" /></label>
                <label className="admin-form-wide">Ingredients intro<textarea name="ingredientSectionText" rows={2} placeholder="We believe in complete transparency..." /></label>
                <label className="admin-form-wide">Ingredients<textarea name="ingredients" rows={5} placeholder={"eco | Raw Mangoes | Crisp, farm-fresh\nwater_drop | Mustard Oil | Cold-pressed pure"} /></label>
                <label className="admin-form-wide">Tags<textarea name="tags" rows={3} placeholder={"No Added Preservatives\nGluten-Free\nVegan\nTraditionally Fermented"} /></label>
                <label>Visibility<select name="isListed" defaultValue="true"><option value="true">Listed</option><option value="false">Hidden</option></select></label>
                <div className="admin-form-actions">
                  <button className="admin-primary-action" type="submit" disabled={pendingKey === "create-product"}>
                    <Icon name="add" /> {pendingKey === "create-product" ? "Adding product" : "Add product"}
                  </button>
                </div>
              </form>
            </section>

            <section className="admin-panel admin-table-panel">
              <div className="admin-panel-title">
                <h2>Products and inventory</h2>
                <span>{products.length} products</span>
              </div>
              <div className="admin-table products-table">
                {products.map((product) => (
                  <form key={product.slug} action={(formData) => saveProduct(product.slug, formData)} className="admin-table-row">
                    <div className="admin-product-card-head">
                      <div>
                        <strong>{product.title}</strong>
                        <span>{product.slug}</span>
                      </div>
                      <span className={`stock-badge ${product.stockStatus || "healthy"}`}>{stockLabel(product)}</span>
                    </div>
                    <div className="admin-product-card-grid">
                      <label>Product<input name="title" defaultValue={product.title} /></label>
                      <label>Category<input name="category" defaultValue={product.category} /></label>
                      <label>Badge<input name="badge" defaultValue={product.badge || ""} placeholder="Sun-dried" /></label>
                      <label>Pack<input name="pack" defaultValue={product.pack || ""} /></label>
                      <label>Price<input name="price" type="number" min="0" defaultValue={product.price} /></label>
                      <label>Sale<input name="salePrice" type="number" min="0" defaultValue={product.salePrice || ""} /></label>
                      <label>Stock<input name="stockQuantity" type="number" min="0" defaultValue={product.stockQuantity || 0} /></label>
                      <label>Low at<input name="lowStockThreshold" type="number" min="0" defaultValue={product.lowStockThreshold ?? 5} /></label>
                      <label>Order<input name="sortOrder" type="number" defaultValue={product.sortOrder || 0} /></label>
                      <label>Status<select name="isListed" defaultValue={String(product.isListed !== false)}><option value="true">Listed</option><option value="false">Hidden</option></select></label>
                    </div>
                    <div className="admin-product-content-grid">
                      <label>Story title<input name="storyTitle" defaultValue={product.storyTitle || ""} /></label>
                      <label>Ingredients title<input name="ingredientSectionTitle" defaultValue={product.ingredientSectionTitle || ""} /></label>
                      <label className="admin-form-wide">Description<textarea name="description" rows={3} defaultValue={product.description || ""} /></label>
                      <label className="admin-form-wide">Story paragraphs<textarea name="story" rows={5} defaultValue={(product.story || []).join("\n\n")} /></label>
                      <label className="admin-form-wide">Benefits<textarea name="benefits" rows={3} defaultValue={(product.benefits || []).join("\n")} /></label>
                      <label className="admin-form-wide">Ingredients intro<textarea name="ingredientSectionText" rows={2} defaultValue={product.ingredientSectionText || ""} /></label>
                      <label className="admin-form-wide">Ingredients<textarea name="ingredients" rows={5} defaultValue={ingredientsText(product)} /></label>
                      <label className="admin-form-wide">Tags<textarea name="tags" rows={3} defaultValue={(product.tags || []).join("\n")} /></label>
                    </div>
                    <div className="admin-product-images-block">
                      <span className="admin-field-label">Product images</span>
                      <ImageLinkFields initialLinks={product.images || []} />
                    </div>
                    <div className="admin-form-actions">
                      <button className="admin-primary-action admin-product-save" type="submit" disabled={pendingKey === `product-${product.slug}`}>
                        <Icon name="save" /> {pendingKey === `product-${product.slug}` ? "Updating details" : "Update details"}
                      </button>
                    </div>
                  </form>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
