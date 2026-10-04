import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Building2,
  ClipboardList,
  Send,
} from "lucide-react";
import { publishAdminEvent } from "../../lib/adminEvents";
import {
  appendStoredList,
} from "../../lib/storage";
import { VendorHeader } from "./VendorHeader";
import { VendorSidebar } from "./VendorSidebar";
import { getMaterialStockDecision } from "./inventory.js";
import { ProductStat } from "./orderParts";
import { getSupplierDefaultMaterial, getSupplierForMaterial, requestVendorNewOrder } from "./orders.js";
import { initialMaterialRequests, supplierMaterialStock, vendorSupplierDirectory } from "./seed.js";
import { SettingsInput, SettingsSelect } from "./shared";
import { supplierIncomingRequestsStorageKey, supplierNotificationsStorageKey } from "./storageKeys.js";
import { getFutureDateLabel } from "../../lib/dates.js";

export function VendorSuppliersPage() {
  const [notice, setNotice] = useState("Supplier coordination loaded.");
  const [requests, setRequests] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-vendor-material-requests") || "null") || initialMaterialRequests;
    } catch {
      return initialMaterialRequests;
    }
  });
  const [material, setMaterial] = useState("Mahogany");
  const [quantity, setQuantity] = useState("40 planks");
  const [supplierId, setSupplierId] = useState(vendorSupplierDirectory[0].id);
  const [linkedWork, setLinkedWork] = useState("WO-0417");
  const requestFormRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem("woodverse-vendor-material-requests", JSON.stringify(requests));
    } catch {}
  }, [requests]);

  const preferredSupplier = vendorSupplierDirectory.find((supplier) => supplier.id === supplierId) || vendorSupplierDirectory[0];
  const lowStockMaterials = supplierMaterialStock.filter((item) => item.available <= 3);
  const activeRequests = requests.filter((request) => request.status !== "Received").length;

  const selectSupplier = (supplier) => {
    setSupplierId(supplier.id);
    setMaterial(getSupplierDefaultMaterial(supplier));
    setNotice(`${supplier.name} selected. The material request form is ready for this supplier.`);
    window.setTimeout(() => {
      requestFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const prepareMaterialRequest = (stockItem) => {
    const supplier = getSupplierForMaterial(stockItem.material) || preferredSupplier;
    const decision = getMaterialStockDecision(stockItem);
    setSupplierId(supplier.id);
    setMaterial(stockItem.material);
    setQuantity(decision.requestQuantity);
    setNotice(`${stockItem.material} request prepared with ${supplier.name}. Review the linked work order, then send the request.`);
    window.setTimeout(() => {
      requestFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const createMaterialRequest = (event) => {
    event.preventDefault();
    if (!preferredSupplier?.name) {
      setNotice("Select a supplier before sending the request.");
      return;
    }
    if (!material.trim() || !quantity.trim() || !linkedWork.trim()) {
      setNotice("Supplier, material, quantity, and linked work order are required.");
      return;
    }
    const numericIds = requests.map((request) => Number(request.id.replace("MR-", ""))).filter(Boolean);
    const nextId = `MR-${Math.max(...numericIds, 1208) + 1}`;
    const request = {
      id: nextId,
      supplier: preferredSupplier.name,
      supplierId: preferredSupplier.id,
      material,
      quantity,
      linkedWork,
      status: "Requested",
      dueDate: getFutureDateLabel(5),
      vendor: "Perera Artisan Works",
      sentAt: "Just now",
    };
    const supplierRequest = {
      ...request,
      id: `SR-${nextId.replace("MR-", "")}`,
      vendorRequestId: nextId,
      type: "Material Request",
      priority: supplierMaterialStock.find((item) => item.material === material)?.available <= 3 ? "High" : "Normal",
    };
    setRequests((items) => [request, ...items]);
    appendStoredList(supplierIncomingRequestsStorageKey, supplierRequest);
    appendStoredList(supplierNotificationsStorageKey, {
      id: `sn-${Date.now()}`,
      type: "Material Request",
      title: `${request.vendor} requested ${quantity} of ${material}`,
      detail: `Linked work order ${linkedWork}. Requested from ${preferredSupplier.name}; due ${request.dueDate}.`,
      time: "Just now",
      priority: supplierRequest.priority,
      sourceRequestId: supplierRequest.id,
    });
    publishAdminEvent("Vendor", `Material request ${nextId} sent`, `${request.vendor} requested ${quantity} of ${material} from ${preferredSupplier.name} for ${linkedWork}.`, supplierRequest.priority);
    setNotice(`${nextId} sent to ${preferredSupplier.name}. It is now visible in the supplier portal notifications.`);
  };

  const updateRequestStatus = (request, status) => {
    setRequests((items) => items.map((item) => (item.id === request.id ? { ...item, status } : item)));
    setNotice(`${request.id} updated to ${status}.`);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] pb-24 text-[#303833] lg:pb-0">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Suppliers" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Supplier notifications are available from the Dashboard page.")} unreadCount={0} status="Suppliers" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#202621]">Suppliers</h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#66716b]">
                  Review supplier stock, create material requests, and connect manufacturing work orders with raw material supply.
                </p>
              </div>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">{notice}</div>

            <section className="grid gap-4 md:grid-cols-3">
              <ProductStat icon={Building2} label="Connected Suppliers" value={String(vendorSupplierDirectory.length).padStart(2, "0")} />
              <ProductStat icon={AlertTriangle} label="Low Materials" value={String(lowStockMaterials.length).padStart(2, "0")} warning />
              <ProductStat icon={ClipboardList} label="Active Requests" value={String(activeRequests).padStart(2, "0")} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="grid gap-6">
                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5">
                    <h2 className="text-xl font-semibold text-[#202621]">Supplier Directory</h2>
                    <p className="mt-1 text-sm text-[#66716b]">Approved material partners available to vendor production teams.</p>
                  </div>
                  <div className="grid gap-4">
                    {vendorSupplierDirectory.map((supplier) => {
                      const selected = supplier.id === supplierId;
                      return (
                      <article key={supplier.id} className={`grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_auto] lg:items-center ${selected ? "border-[#115745] bg-[#f3faf4] shadow-sm" : "border-[#d9d5cd] bg-[#fbfaf6]"}`}>
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <strong className="text-[#202621]">{supplier.name}</strong>
                            <span className="rounded-full bg-[#eef4ef] px-2.5 py-1 text-xs font-extrabold uppercase text-[#115745]">{supplier.status}</span>
                            {selected && <span className="rounded-full bg-[#115745] px-2.5 py-1 text-xs font-extrabold uppercase text-white">Selected</span>}
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-[#66716b]">{supplier.material} - {supplier.location} - lead time {supplier.leadTime}</p>
                          <p className="mt-2 text-xs font-bold uppercase text-[#66716b]">Rating {supplier.rating} / Contact {supplier.contact}</p>
                        </div>
                        <button onClick={() => selectSupplier(supplier)} className={`min-h-10 rounded-lg px-4 text-sm font-extrabold ${selected ? "bg-[#d9ecd8] text-[#115745]" : "bg-[#115745] text-white"}`}>
                          {selected ? "Selected" : "Select"}
                        </button>
                      </article>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5">
                    <h2 className="text-xl font-semibold text-[#202621]">Material Requests</h2>
                    <p className="mt-1 text-sm text-[#66716b]">Track requests sent from vendor manufacturing needs to suppliers.</p>
                  </div>
                  <div className="grid gap-3">
                    {requests.map((request) => (
                      <article key={request.id} className="grid gap-3 rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] p-4 md:grid-cols-[1fr_1fr_auto] md:items-center">
                        <div>
                          <strong className="text-[#202621]">{request.id} - {request.material}</strong>
                          <p className="mt-1 text-sm text-[#66716b]">{request.quantity} from {request.supplier}</p>
                        </div>
                        <div className="text-sm">
                          <span className="block font-bold text-[#202621]">{request.linkedWork}</span>
                          <span className="text-[#66716b]">Due {request.dueDate}</span>
                        </div>
                        <select value={request.status} onChange={(event) => updateRequestStatus(request, event.target.value)} className="min-h-10 rounded-lg border border-[#c4cbc7] bg-white px-3 text-sm font-extrabold outline-none">
                          <option>Requested</option>
                          <option>Supplier Confirmed</option>
                          <option>In Transit</option>
                          <option>Received</option>
                        </select>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="grid content-start gap-6">
                <section ref={requestFormRef} className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-xl font-semibold text-[#202621]">Create Material Request</h2>
                  <p className="mt-1 text-sm text-[#66716b]">Selected supplier: <strong className="text-[#115745]">{preferredSupplier.name}</strong></p>
                  <form onSubmit={createMaterialRequest} className="mt-5 grid gap-4">
                    <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
                      Supplier
                      <select
                        value={supplierId}
                        onChange={(event) => {
                          const supplier = vendorSupplierDirectory.find((item) => item.id === event.target.value);
                          if (supplier) selectSupplier(supplier);
                        }}
                        className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-3 font-semibold outline-none transition focus:border-[#115745]"
                      >
                        {vendorSupplierDirectory.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                        ))}
                      </select>
                    </label>
                    <SettingsSelect label="Material" value={material} options={supplierMaterialStock.map((item) => item.material)} onChange={setMaterial} />
                    <SettingsInput label="Quantity" value={quantity} onChange={setQuantity} />
                    <SettingsInput label="Linked Work Order" value={linkedWork} onChange={setLinkedWork} />
                    <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
                      <Send className="h-4 w-4" />
                      Send Request
                    </button>
                  </form>
                </section>

                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-xl font-semibold text-[#202621]">Material Stock Watch</h2>
                  <p className="mt-1 text-sm leading-relaxed text-[#66716b]">Use this to decide whether production can start or a supplier request is needed.</p>
                  <div className="mt-4 grid gap-3">
                    {supplierMaterialStock.map((item) => {
                      const decision = getMaterialStockDecision(item);
                      return (
                        <article key={item.material} className="rounded-lg border border-[#d9d5cd] bg-[#f8f4ec] p-4 text-sm">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <strong className="block text-base text-[#202621]">{item.material}</strong>
                              <span className="mt-1 block text-[#66716b]">Current stock: {item.available} {item.unit}</span>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold uppercase ${decision.tone}`}>{decision.label}</span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="rounded-md bg-white px-3 py-2">
                              <span className="block text-xs font-extrabold uppercase text-[#66716b]">Reorder Point</span>
                              <strong className="text-[#202621]">{decision.reorderPoint} {item.unit}</strong>
                            </div>
                            <div className="rounded-md bg-white px-3 py-2">
                              <span className="block text-xs font-extrabold uppercase text-[#66716b]">Covers</span>
                              <strong className="text-[#202621]">{decision.coverage}</strong>
                            </div>
                          </div>
                          <p className="mt-3 leading-relaxed text-[#4d5651]">{decision.message}</p>
                          <button
                            onClick={() => prepareMaterialRequest(item)}
                            className={`mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg px-3 text-sm font-extrabold ${decision.actionNeeded ? "bg-[#115745] text-white" : "border border-[#115745] bg-white text-[#115745]"}`}
                          >
                            <Send className="h-4 w-4" />
                            {decision.actionLabel} {decision.requestQuantity}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
