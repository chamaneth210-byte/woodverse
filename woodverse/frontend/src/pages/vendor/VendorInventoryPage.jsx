import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Archive,
  Boxes,
  Save,
  Search,
  Warehouse,
} from "lucide-react";
import { navigate } from "../../utils";
import { VendorHeader } from "./VendorHeader";
import { VendorSidebar } from "./VendorSidebar";
import { getInitialVendorInventory, getInventoryStatus } from "./inventory.js";
import { ProductStat } from "./orderParts";
import { requestVendorNewOrder } from "./orders.js";
import { ModalShell, SettingsInput } from "./shared";
import { vendorInventoryStorageKey } from "./storageKeys.js";
import { getInventoryTone } from "./tone.js";

export function VendorInventoryPage() {
  const [notice, setNotice] = useState("Inventory loaded.");
  const [inventory, setInventory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(vendorInventoryStorageKey) || "null") || getInitialVendorInventory();
    } catch {
      return getInitialVendorInventory();
    }
  });
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [activeItem, setActiveItem] = useState(null);
  const [adjustment, setAdjustment] = useState("5");
  const [reason, setReason] = useState("Manual stock correction");

  useEffect(() => {
    try {
      localStorage.setItem(vendorInventoryStorageKey, JSON.stringify(inventory));
    } catch {}
  }, [inventory]);

  const filteredInventory = inventory.filter((item) => {
    const matchesQuery = `${item.name} ${item.category} ${item.location}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = type === "All" || item.type === type || item.status === type;
    return matchesQuery && matchesType;
  });
  const productCount = inventory.filter((item) => item.type === "Product").length;
  const materialCount = inventory.filter((item) => item.type === "Material").length;
  const lowCount = inventory.filter((item) => item.status !== "Ready").length;
  const totalValue = inventory.reduce((sum, item) => sum + item.quantity * item.unitValue, 0);

  const openAdjustment = (item) => {
    setActiveItem(item);
    setAdjustment("5");
    setReason("Manual stock correction");
    setNotice(`${item.name} stock adjustment opened.`);
  };

  const saveAdjustment = (event) => {
    event.preventDefault();
    if (!activeItem) return;
    const delta = Number(adjustment);
    if (!Number.isFinite(delta) || delta === 0) {
      setNotice("Enter a positive or negative stock adjustment.");
      return;
    }
    setInventory((items) => items.map((item) => {
      if (item.id !== activeItem.id) return item;
      const nextQuantity = Math.max(0, item.quantity + delta);
      return {
        ...item,
        quantity: nextQuantity,
        status: getInventoryStatus(nextQuantity, item.reorderPoint),
        lastUpdated: "Just now",
        lastReason: reason.trim(),
      };
    }));
    setNotice(`${activeItem.name} adjusted by ${delta > 0 ? "+" : ""}${delta} ${activeItem.unit}.`);
    setActiveItem(null);
  };

  const preparePurchaseOrder = (item) => {
    if (item.type !== "Material") {
      setNotice(`${item.name} is product inventory. Restock finished products from Products.`);
      return;
    }
    navigate("/vendor/purchase-orders");
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] pb-24 text-[#303833] lg:pb-0">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Inventory" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Inventory alerts are shown in dashboard notifications.")} unreadCount={0} status="Inventory" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-3">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
              <h1 className="text-3xl font-semibold leading-tight text-[#202621]">Inventory</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-[#66716b]">
                Track finished product stock and raw materials used by manufacturing work orders.
              </p>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">{notice}</div>

            <section className="grid gap-4 md:grid-cols-4">
              <ProductStat icon={Archive} label="Product SKUs" value={String(productCount).padStart(2, "0")} />
              <ProductStat icon={Boxes} label="Materials" value={String(materialCount).padStart(2, "0")} />
              <ProductStat icon={AlertTriangle} label="Low / Out" value={String(lowCount).padStart(2, "0")} warning />
              <ProductStat icon={Warehouse} label="Stock Value" value={`LKR ${Math.round(totalValue / 1000)}K`} />
            </section>

            <section className="overflow-hidden rounded-xl border border-[#c2cac5] bg-white shadow-sm">
              <div className="grid gap-3 border-b border-[#d9d5cd] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center sm:px-6">
                <label className="flex min-h-11 items-center rounded-lg border border-[#c4cbc7] bg-white px-3 text-[#747a76]">
                  <Search className="h-4 w-4 shrink-0" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search product, material, location..." />
                </label>
                <div className="flex flex-wrap gap-2">
                  {["All", "Product", "Material", "Ready", "Low Stock", "Out of Stock"].map((item) => (
                    <button key={item} onClick={() => setType(item)} className={`min-h-10 rounded-lg px-3 text-sm font-extrabold ${type === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[1.2fr_.75fr_.85fr_.9fr_.9fr_1fr_auto] bg-[#f3eee6] px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-[#56605b] max-xl:hidden">
                <span>Item</span><span>Type</span><span>Stock</span><span>Reorder</span><span>Status</span><span>Location</span><span>Action</span>
              </div>
              <div className="divide-y divide-[#d9d5cd]">
                {filteredInventory.map((item) => (
                  <article key={item.id} className="grid grid-cols-[1.2fr_.75fr_.85fr_.9fr_.9fr_1fr_auto] items-center gap-4 px-5 py-5 text-sm max-xl:grid-cols-1 sm:px-6">
                    <div>
                      <strong className="text-[#202621]">{item.name}</strong>
                      <p className="mt-1 text-xs font-bold uppercase text-[#66716b]">{item.category}</p>
                    </div>
                    <span className="font-semibold">{item.type}</span>
                    <strong>{item.quantity} {item.unit}</strong>
                    <span>{item.reorderPoint} {item.unit}</span>
                    <span className={`w-fit rounded-full px-3 py-2 text-xs font-extrabold uppercase ${getInventoryTone(item.status)}`}>{item.status}</span>
                    <span className="text-[#66716b]">{item.location}</span>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openAdjustment(item)} className="min-h-10 rounded-lg bg-[#eef4ef] px-3 text-sm font-extrabold text-[#115745]">Adjust</button>
                      {item.type === "Material" && item.status !== "Ready" && <button onClick={() => preparePurchaseOrder(item)} className="min-h-10 rounded-lg bg-[#115745] px-3 text-sm font-extrabold text-white">Create PO</button>}
                    </div>
                  </article>
                ))}
              </div>
              {filteredInventory.length === 0 && <p className="m-5 rounded-lg bg-[#f8f4ec] p-5 text-sm font-semibold text-[#66716b]">No inventory rows match this filter.</p>}
            </section>
          </div>
        </section>
      </div>

      {activeItem && (
        <ModalShell title="Adjust Inventory" subtitle={`${activeItem.name} - current stock ${activeItem.quantity} ${activeItem.unit}`} onClose={() => setActiveItem(null)}>
          <form onSubmit={saveAdjustment} className="grid gap-4 px-5 py-5 sm:px-6">
            <SettingsInput label="Adjustment (+ add, - remove)" type="number" value={adjustment} onChange={setAdjustment} />
            <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
              Reason
              <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="rounded-lg border border-[#c4cbc7] bg-white px-3 py-2 font-semibold outline-none transition focus:border-[#115745]" />
            </label>
            <div className="flex flex-wrap justify-end gap-3 border-t border-[#d9d5cd] pt-4">
              <button type="button" onClick={() => setActiveItem(null)} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
              <button type="submit" className="min-h-11 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">Save Adjustment</button>
            </div>
          </form>
        </ModalShell>
      )}
    </main>
  );
}
