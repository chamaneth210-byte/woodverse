import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  PlusCircle,
  Save,
  Search,
} from "lucide-react";
import { publishAdminEvent } from "../../lib/adminEvents";
import { dropStaleAssetCaches } from "../../lib/storage";
import { VendorHeader } from "./VendorHeader";
import { VendorSidebar } from "./VendorSidebar";
import { normalizeLkrPrice, parseOrderAmount } from "./format.js";
import { ProductStat } from "./orderParts";
import { requestVendorNewOrder } from "./orders.js";
import { initialVendorProducts } from "./seed.js";
import { ModalShell, SettingsInput, SettingsSelect } from "./shared";
import { vendorProductsStorageKey } from "./storageKeys.js";

export function VendorProductsPage() {
  const [notice, setNotice] = useState("Products loaded.");
  const [products, setProducts] = useState(() => {
    dropStaleAssetCaches([vendorProductsStorageKey]);
    try {
      return JSON.parse(localStorage.getItem(vendorProductsStorageKey) || "null") || initialVendorProducts;
    } catch {
      return initialVendorProducts;
    }
  });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [activeProduct, setActiveProduct] = useState(null);
  const [modalMode, setModalMode] = useState(null);

  const filteredProducts = products.filter((product) => {
    const matchesQuery = `${product.name} ${product.category} ${product.material}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All" || product.status === status;
    return matchesQuery && matchesStatus;
  });
  const publishedCount = products.filter((product) => product.status === "Published").length;
  const lowStockCount = products.filter((product) => product.stock <= 10).length;

  useEffect(() => {
    try {
      localStorage.setItem(vendorProductsStorageKey, JSON.stringify(products));
    } catch {}
  }, [products]);

  const openAddProduct = () => {
    setActiveProduct(null);
    setModalMode("product");
  };

  const openEditProduct = (product) => {
    setActiveProduct(product);
    setModalMode("product");
  };

  const saveProduct = (form) => {
    const normalizedProduct = {
      ...form,
      name: form.name.trim(),
      material: form.material.trim(),
      price: normalizeLkrPrice(form.price),
      stock: Math.max(0, Number(form.stock)),
    };
    if (activeProduct) {
      setProducts((items) => items.map((item) => (item.id === activeProduct.id ? { ...item, ...normalizedProduct } : item)));
      setStatus(normalizedProduct.status);
      setQuery("");
      setNotice(`${normalizedProduct.name} updated.`);
    } else {
      const numericIds = products.map((item) => Number(item.id.replace("VP-", ""))).filter(Boolean);
      const nextId = `VP-${Math.max(...numericIds, 1000) + 1}`;
      setProducts((items) => [{ id: nextId, ...normalizedProduct }, ...items]);
      setStatus(normalizedProduct.status);
      setQuery("");
      setNotice(`${normalizedProduct.name} added to vendor products as ${nextId}.`);
    }
    setModalMode(null);
    setActiveProduct(null);
  };

  const updateStatus = (id, nextStatus) => {
    setProducts((items) => items.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)));
    setStatus(nextStatus);
    setQuery("");
    publishAdminEvent("Vendor", `Order ${order.id} ${nextStatus.toLowerCase()}`, `Vendor updated ${order.customer}'s order to ${nextStatus}.${approvalResult?.workOrder ? ` Work order ${approvalResult.workOrder.id} is linked.` : ""}`, nextStatus === "Approved" ? "High" : "Normal");
    setNotice(`Product ${id} marked as ${nextStatus}.`);
  };

  const restockProduct = (product) => {
    setProducts((items) => items.map((item) => (item.id === product.id ? { ...item, stock: item.stock + 10 } : item)));
    setNotice(`${product.name} stock increased by 10 units.`);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] pb-24 text-[#303833] lg:pb-0">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Products" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Notifications are available from the Dashboard page.")} unreadCount={0} status="Products" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#202621]">Products</h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#66716b]">
                  Manage vendor catalog items, stock, pricing, and publish status for customer-facing products.
                </p>
              </div>
              <button onClick={openAddProduct} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0d4638]">
                <PlusCircle className="h-5 w-5" />
                Add Product
              </button>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">
              {notice}
            </div>

            <section className="grid gap-4 md:grid-cols-3">
              <ProductStat icon={Archive} label="Total Products" value={String(products.length).padStart(2, "0")} />
              <ProductStat icon={CheckCircle2} label="Published" value={String(publishedCount).padStart(2, "0")} />
              <ProductStat icon={AlertTriangle} label="Low Stock" value={String(lowStockCount).padStart(2, "0")} warning />
            </section>

            <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <label className="flex min-h-11 items-center rounded-lg border border-[#c4cbc7] bg-white px-3 text-[#747a76]">
                  <Search className="h-4 w-4 shrink-0" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search products, category, material..." />
                </label>
                <div className="flex flex-wrap gap-2">
                  {["All", "Published", "Draft", "Archived"].map((item) => (
                    <button key={item} onClick={() => setStatus(item)} className={`min-h-10 rounded-lg px-4 text-sm font-extrabold ${status === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onEdit={() => openEditProduct(product)} onRestock={() => restockProduct(product)} onStatus={updateStatus} />
                ))}
              </div>
              {filteredProducts.length === 0 && <p className="rounded-lg bg-[#f8f4ec] p-5 text-sm font-semibold text-[#66716b]">No products match this filter.</p>}
            </section>
          </div>
        </section>
      </div>

      {modalMode === "product" && <ProductFormModal product={activeProduct} onClose={() => { setModalMode(null); setActiveProduct(null); }} onSubmit={saveProduct} />}
    </main>
  );
}

export function ProductCard({ product, onEdit, onRestock, onStatus }) {
  const isArchived = product.status === "Archived";
  return (
    <article className="w-full overflow-hidden rounded-xl border border-[#c2cac5] bg-white shadow-sm">
      <div className="aspect-[5/4] overflow-hidden bg-[#f3eee6]">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
      </div>
      <div className="grid gap-3 p-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold leading-tight text-[#202621]">{product.name}</h2>
              <p className="mt-1 text-xs text-[#66716b]">{product.category} - {product.material}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold uppercase ${product.status === "Published" ? "bg-[#d9ecd8] text-[#115745]" : product.status === "Draft" ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#e9e4dc] text-[#66716b]"}`}>
              {product.status}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-[#f8f4ec] px-2.5 py-2">
              <span className="block text-[10px] font-extrabold uppercase text-[#66716b]">Price</span>
              <strong className="mt-1 block text-[13px]">{product.price}</strong>
            </div>
            <div className="rounded-lg bg-[#f8f4ec] px-2.5 py-2">
              <span className="block text-[10px] font-extrabold uppercase text-[#66716b]">Stock</span>
              <strong className={`mt-1 block text-[13px] ${product.stock <= 10 ? "text-[#d24b53]" : "text-[#202621]"}`}>{product.stock} units</strong>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onEdit} className="min-h-9 rounded-lg border border-[#c4cbc7] bg-white px-2 text-xs font-extrabold text-[#3d4541]">Edit</button>
            <button onClick={onRestock} className="min-h-9 rounded-lg bg-[#eef4ef] px-2 text-xs font-extrabold text-[#115745]">Restock</button>
          </div>
          <button onClick={() => onStatus(product.id, isArchived ? "Published" : "Archived")} className="min-h-9 rounded-lg bg-[#e9e4dc] px-2 text-xs font-extrabold text-[#3d4541]">
            {isArchived ? "Publish Product" : "Archive Product"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductFormModal({ product, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "Furniture",
    material: product?.material || "",
    price: product?.price || "",
    stock: product?.stock ?? 1,
    status: product?.status || "Draft",
    image: product?.image || "/assets/workspace-desk-neutral.webp",
  });
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const submitProduct = (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!form.material.trim()) {
      setError("Material is required.");
      return;
    }
    if (parseOrderAmount(form.price) <= 0) {
      setError("Enter a valid product price.");
      return;
    }
    if (!Number.isFinite(Number(form.stock)) || Number(form.stock) < 0) {
      setError("Stock must be zero or more.");
      return;
    }
    onSubmit(form);
  };

  return (
    <ModalShell title={product ? "Edit Product" : "Add Product"} subtitle="Manage product details shown in the vendor catalog." onClose={onClose}>
      <form onSubmit={submitProduct} className="grid max-h-[calc(90vh-86px)] overflow-y-auto">
        <div className="grid gap-4 px-5 py-5 sm:px-6">
          <div className="overflow-hidden rounded-lg border border-[#d9d5cd] bg-[#f3eee6]">
            <img src={form.image} alt={form.name || "Product preview"} className="h-44 w-full object-cover" />
          </div>
          {error && <p className="rounded-lg border border-[#f0b4b4] bg-[#fff0f0] px-3 py-2 text-sm font-bold text-[#b10015]">{error}</p>}
          <SettingsInput label="Product Name" value={form.name} onChange={(value) => updateField("name", value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsSelect label="Category" value={form.category} options={["Furniture", "Living Room", "Bedroom", "Wooden Gifts", "Office"]} onChange={(value) => updateField("category", value)} />
            <SettingsInput label="Material" value={form.material} onChange={(value) => updateField("material", value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsInput label="Price" value={form.price} onChange={(value) => updateField("price", value)} />
            <SettingsInput label="Stock" type="number" value={form.stock} onChange={(value) => updateField("stock", value)} />
          </div>
          <SettingsSelect label="Image" value={form.image} options={["/assets/workspace-desk-neutral.webp", "/assets/product-walnut-task-table.webp", "/assets/royal-majesty-sofa-set.webp", "/assets/signature-bedframe.webp", "/assets/product-carved-gift-box.webp", "/assets/product-modular-shelf-unit.webp"]} onChange={(value) => updateField("image", value)} />
          <SettingsSelect label="Status" value={form.status} options={["Draft", "Published", "Archived"]} onChange={(value) => updateField("status", value)} />
        </div>
        <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-[#d9d5cd] bg-white px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
            <Save className="h-4 w-4" />
            {product ? "Save Product" : "Add Product"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
