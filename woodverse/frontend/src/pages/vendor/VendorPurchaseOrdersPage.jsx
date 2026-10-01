import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Send,
} from "lucide-react";
import {
  appendStoredList,
} from "../../lib/storage";
import { VendorHeader } from "./VendorHeader";
import { VendorSidebar } from "./VendorSidebar";
import { ProductStat } from "./orderParts";
import { getSupplierDefaultMaterial, requestVendorNewOrder } from "./orders.js";
import { initialVendorPurchaseOrders, supplierMaterialStock, vendorSupplierDirectory } from "./seed.js";
import { SettingsInput, SettingsSelect } from "./shared";
import { supplierNotificationsStorageKey, vendorPurchaseOrdersStorageKey } from "./storageKeys.js";
import { getPurchaseOrderTone } from "./tone.js";

export function VendorPurchaseOrdersPage() {
  const [notice, setNotice] = useState("Vendor purchase orders loaded.");
  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(vendorPurchaseOrdersStorageKey) || "null") || initialVendorPurchaseOrders;
    } catch {
      return initialVendorPurchaseOrders;
    }
  });
  const [supplierId, setSupplierId] = useState(vendorSupplierDirectory[0].id);
  const [material, setMaterial] = useState("Mahogany");
  const [quantity, setQuantity] = useState("40");
  const [unit, setUnit] = useState("planks");
  const [unitPrice, setUnitPrice] = useState("4200");
  const [linkedWork, setLinkedWork] = useState("WO-0417");
  const [dueDate, setDueDate] = useState("2026-08-03");
  const [notes, setNotes] = useState("Required for approved manufacturing work.");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    try {
      localStorage.setItem(vendorPurchaseOrdersStorageKey, JSON.stringify(purchaseOrders));
    } catch {}
  }, [purchaseOrders]);

  const selectedSupplier = vendorSupplierDirectory.find((supplier) => supplier.id === supplierId) || vendorSupplierDirectory[0];
  const numericQuantity = Math.max(0, Number(quantity) || 0);
  const numericUnitPrice = Math.max(0, Number(unitPrice) || 0);
  const draftTotal = numericQuantity * numericUnitPrice;
  const filteredOrders = status === "All" ? purchaseOrders : purchaseOrders.filter((order) => order.status === status);
  const sentCount = purchaseOrders.filter((order) => order.status === "Sent").length;
  const draftCount = purchaseOrders.filter((order) => order.status === "Draft").length;
  const receivedCount = purchaseOrders.filter((order) => order.status === "Received").length;

  const selectSupplier = (id) => {
    const supplier = vendorSupplierDirectory.find((item) => item.id === id);
    setSupplierId(id);
    if (supplier) {
      setMaterial(getSupplierDefaultMaterial(supplier));
      setNotice(`${supplier.name} selected for this purchase order.`);
    }
  };

  const createPurchaseOrder = (event) => {
    event.preventDefault();
    if (!selectedSupplier?.name || !material.trim() || numericQuantity <= 0 || numericUnitPrice <= 0 || !linkedWork.trim() || !dueDate) {
      setNotice("Supplier, material, quantity, unit price, work order, and due date are required.");
      return;
    }
    const numericIds = purchaseOrders.map((order) => Number(order.id.replace("VPO-", ""))).filter(Boolean);
    const nextId = `VPO-${Math.max(...numericIds, 2104) + 1}`;
    const purchaseOrder = {
      id: nextId,
      supplier: selectedSupplier.name,
      supplierId: selectedSupplier.id,
      material,
      quantity: numericQuantity,
      unit,
      unitPrice: numericUnitPrice,
      linkedWork,
      status: "Sent",
      dueDate,
      total: draftTotal,
      notes: notes.trim(),
      createdAt: "Just now",
    };
    setPurchaseOrders((items) => [purchaseOrder, ...items]);
    appendStoredList(supplierNotificationsStorageKey, {
      id: `spo-${Date.now()}`,
      type: "Purchase Order",
      title: `New purchase order ${nextId} from Perera Artisan Works`,
      detail: `${numericQuantity} ${unit} of ${material} for ${linkedWork}. Total LKR ${draftTotal.toLocaleString("en-US")}. Due ${dueDate}.`,
      time: "Just now",
      priority: "High",
      sourcePurchaseOrderId: nextId,
    });
    setStatus("Sent");
    setNotice(`${nextId} sent to ${selectedSupplier.name}. Supplier can see it in notifications.`);
  };

  const updatePurchaseOrderStatus = (order, nextStatus) => {
    setPurchaseOrders((items) => items.map((item) => (item.id === order.id ? { ...item, status: nextStatus } : item)));
    setStatus(nextStatus);
    setNotice(`${order.id} updated to ${nextStatus}.`);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] pb-24 text-[#303833] lg:pb-0">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Purchase Orders" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Supplier purchase order notifications are sent to the supplier portal.")} unreadCount={0} status="Purchase Orders" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-5">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#202621]">Purchase Orders</h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#66716b]">
                  Create supplier purchase orders for materials needed by manufacturing work orders.
                </p>
              </div>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">{notice}</div>

            <section className="grid gap-4 md:grid-cols-3">
              <ProductStat icon={ClipboardList} label="Draft POs" value={String(draftCount).padStart(2, "0")} />
              <ProductStat icon={Send} label="Sent POs" value={String(sentCount).padStart(2, "0")} />
              <ProductStat icon={CheckCircle2} label="Received" value={String(receivedCount).padStart(2, "0")} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
              <form onSubmit={createPurchaseOrder} className="grid content-start gap-4 rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#202621]">Create Vendor Purchase Order</h2>
                  <p className="mt-1 text-sm text-[#66716b]">Send a confirmed material order to the selected supplier.</p>
                </div>
                <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
                  Supplier
                  <select value={supplierId} onChange={(event) => selectSupplier(event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-3 font-semibold outline-none transition focus:border-[#115745]">
                    {vendorSupplierDirectory.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                </label>
                <SettingsSelect label="Material" value={material} options={supplierMaterialStock.map((item) => item.material)} onChange={setMaterial} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <SettingsInput label="Quantity" type="number" value={quantity} onChange={setQuantity} />
                  <SettingsSelect label="Unit" value={unit} options={["planks", "boards", "pieces", "meters"]} onChange={setUnit} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SettingsInput label="Unit Price (LKR)" type="number" value={unitPrice} onChange={setUnitPrice} />
                  <SettingsInput label="Due Date" type="date" value={dueDate} onChange={setDueDate} />
                </div>
                <SettingsInput label="Linked Work Order" value={linkedWork} onChange={setLinkedWork} />
                <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
                  Notes
                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="rounded-lg border border-[#c4cbc7] bg-white px-3 py-2 font-semibold outline-none transition focus:border-[#115745]" />
                </label>
                <div className="rounded-lg bg-[#f8f4ec] px-4 py-3">
                  <span className="text-xs font-extrabold uppercase text-[#66716b]">Estimated Total</span>
                  <strong className="mt-1 block text-2xl text-[#202621]">LKR {draftTotal.toLocaleString("en-US")}</strong>
                </div>
                <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
                  <Send className="h-4 w-4" />
                  Create And Send PO
                </button>
              </form>

              <section className="overflow-hidden rounded-xl border border-[#c2cac5] bg-white shadow-sm">
                <div className="grid gap-3 border-b border-[#d9d5cd] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center sm:px-6">
                  <div>
                    <h2 className="text-xl font-semibold text-[#202621]">Vendor Purchase Orders</h2>
                    <p className="mt-1 text-sm text-[#66716b]">Track supplier POs created by the vendor team.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["All", "Draft", "Sent", "Supplier Confirmed", "In Transit", "Received", "Cancelled"].map((item) => (
                      <button key={item} onClick={() => setStatus(item)} className={`min-h-10 rounded-lg px-3 text-sm font-extrabold ${status === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="divide-y divide-[#d9d5cd]">
                  {filteredOrders.map((order) => (
                    <article key={order.id} className="grid grid-cols-[0.9fr_1.2fr_1fr_1fr_1fr_1fr] items-center gap-4 px-5 py-5 text-sm max-xl:grid-cols-1 sm:px-6">
                      <div>
                        <strong className="text-[#202621]">{order.id}</strong>
                        <p className="mt-1 text-xs font-bold uppercase text-[#66716b]">{order.linkedWork}</p>
                      </div>
                      <span className="font-semibold">{order.supplier}</span>
                      <span>{order.quantity} {order.unit} {order.material}</span>
                      <strong>LKR {Number(order.total || 0).toLocaleString("en-US")}</strong>
                      <span className="text-[#66716b]">Due {order.dueDate}</span>
                      <select value={order.status} onChange={(event) => updatePurchaseOrderStatus(order, event.target.value)} className={`min-h-10 w-fit rounded-lg border border-[#c4cbc7] bg-white px-3 text-xs font-extrabold uppercase outline-none ${getPurchaseOrderTone(order.status)}`}>
                        <option>Draft</option>
                        <option>Sent</option>
                        <option>Supplier Confirmed</option>
                        <option>In Transit</option>
                        <option>Received</option>
                        <option>Cancelled</option>
                      </select>
                    </article>
                  ))}
                </div>
                {filteredOrders.length === 0 && <p className="m-5 rounded-lg bg-[#f8f4ec] p-5 text-sm font-semibold text-[#66716b]">No vendor purchase orders match this filter.</p>}
              </section>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
