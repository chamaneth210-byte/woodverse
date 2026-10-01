import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Search,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { VendorHeader } from "./VendorHeader";
import { VendorSidebar } from "./VendorSidebar";
import { ProductStat } from "./orderParts";
import { requestVendorNewOrder } from "./orders.js";
import { initialVendorShipments } from "./seed.js";
import { SettingsInput, SettingsSelect } from "./shared";
import { vendorShipmentsStorageKey } from "./storageKeys.js";
import { getShipmentTone } from "./tone.js";

export function VendorShipmentsPage() {
  const [notice, setNotice] = useState("Shipments loaded.");
  const [shipments, setShipments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(vendorShipmentsStorageKey) || "null") || initialVendorShipments;
    } catch {
      return initialVendorShipments;
    }
  });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [draft, setDraft] = useState({
    type: "Customer Delivery",
    reference: "#WV-9482",
    contact: "Kasun Wijesinghe",
    destination: "Colombo 07",
    carrier: "Lanka Freight",
    date: "2026-08-04",
    items: "Teak executive desk",
    priority: "High",
  });

  useEffect(() => {
    try {
      localStorage.setItem(vendorShipmentsStorageKey, JSON.stringify(shipments));
    } catch {}
  }, [shipments]);

  const filteredShipments = shipments.filter((shipment) => {
    const matchesQuery = `${shipment.id} ${shipment.reference} ${shipment.contact} ${shipment.destination} ${shipment.items}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All" || shipment.status === status || shipment.type === status;
    return matchesQuery && matchesStatus;
  });
  const outboundCount = shipments.filter((shipment) => shipment.type === "Customer Delivery").length;
  const inboundCount = shipments.filter((shipment) => shipment.type === "Inbound Material").length;
  const activeCount = shipments.filter((shipment) => !["Delivered", "Cancelled"].includes(shipment.status)).length;
  const delayedCount = shipments.filter((shipment) => shipment.status === "Delayed").length;

  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  const createShipment = (event) => {
    event.preventDefault();
    if (!draft.reference.trim() || !draft.contact.trim() || !draft.destination.trim() || !draft.items.trim() || !draft.date) {
      setNotice("Reference, contact, destination, items, and date are required.");
      return;
    }
    const numericIds = shipments.map((shipment) => Number(shipment.id.replace("SHP-", ""))).filter(Boolean);
    const nextId = `SHP-${Math.max(...numericIds, 3304) + 1}`;
    const shipment = {
      id: nextId,
      ...draft,
      status: "Scheduled",
    };
    setShipments((items) => [shipment, ...items]);
    setStatus("Scheduled");
    setNotice(`${nextId} scheduled for ${draft.type.toLowerCase()} to ${draft.destination}.`);
  };

  const updateShipmentStatus = (shipment, nextStatus) => {
    setShipments((items) => items.map((item) => (item.id === shipment.id ? { ...item, status: nextStatus } : item)));
    setStatus(nextStatus);
    setNotice(`${shipment.id} updated to ${nextStatus}.`);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] pb-24 text-[#303833] lg:pb-0">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Shipments" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Shipment notifications are connected to customer and supplier updates.")} unreadCount={0} status="Shipments" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-3">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
              <h1 className="text-3xl font-semibold leading-tight text-[#202621]">Shipments</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-[#66716b]">
                Schedule customer deliveries, track inbound supplier material shipments, and update delivery status.
              </p>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">{notice}</div>

            <section className="grid gap-4 md:grid-cols-4">
              <ProductStat icon={Truck} label="Active" value={String(activeCount).padStart(2, "0")} />
              <ProductStat icon={ShoppingCart} label="Customer Delivery" value={String(outboundCount).padStart(2, "0")} />
              <ProductStat icon={Boxes} label="Inbound Material" value={String(inboundCount).padStart(2, "0")} />
              <ProductStat icon={AlertTriangle} label="Delayed" value={String(delayedCount).padStart(2, "0")} warning />
            </section>

            <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
              <form onSubmit={createShipment} className="grid content-start gap-4 rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#202621]">Create Shipment</h2>
                  <p className="mt-1 text-sm text-[#66716b]">Use outbound for customers and inbound for supplier materials.</p>
                </div>
                <SettingsSelect label="Shipment Type" value={draft.type} options={["Customer Delivery", "Inbound Material"]} onChange={(value) => updateDraft("type", value)} />
                <SettingsInput label="Reference Order / PO" value={draft.reference} onChange={(value) => updateDraft("reference", value)} />
                <SettingsInput label="Customer / Supplier" value={draft.contact} onChange={(value) => updateDraft("contact", value)} />
                <SettingsInput label="Destination" value={draft.destination} onChange={(value) => updateDraft("destination", value)} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <SettingsSelect label="Carrier" value={draft.carrier} options={["Lanka Freight", "Express Move", "Supplier Truck", "In-house Van"]} onChange={(value) => updateDraft("carrier", value)} />
                  <SettingsInput label="Ship Date" type="date" value={draft.date} onChange={(value) => updateDraft("date", value)} />
                </div>
                <SettingsInput label="Items" value={draft.items} onChange={(value) => updateDraft("items", value)} />
                <SettingsSelect label="Priority" value={draft.priority} options={["High", "Normal", "Low"]} onChange={(value) => updateDraft("priority", value)} />
                <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
                  <Truck className="h-4 w-4" />
                  Schedule Shipment
                </button>
              </form>

              <section className="overflow-hidden rounded-xl border border-[#c2cac5] bg-white shadow-sm">
                <div className="grid gap-3 border-b border-[#d9d5cd] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center sm:px-6">
                  <label className="flex min-h-11 items-center rounded-lg border border-[#c4cbc7] bg-white px-3 text-[#747a76]">
                    <Search className="h-4 w-4 shrink-0" />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search shipment, reference, contact, destination..." />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["All", "Customer Delivery", "Inbound Material", "Scheduled", "Ready for Dispatch", "In Transit", "Delivered", "Delayed", "Cancelled"].map((item) => (
                      <button key={item} onClick={() => setStatus(item)} className={`min-h-10 rounded-lg px-3 text-sm font-extrabold ${status === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-[.9fr_1fr_1.1fr_1fr_1fr_.9fr_auto] bg-[#f3eee6] px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-[#56605b] max-xl:hidden">
                  <span>Shipment</span><span>Type</span><span>Reference</span><span>Contact</span><span>Destination</span><span>Date</span><span>Status</span>
                </div>
                <div className="divide-y divide-[#d9d5cd]">
                  {filteredShipments.map((shipment) => (
                    <article key={shipment.id} className="grid grid-cols-[.9fr_1fr_1.1fr_1fr_1fr_.9fr_auto] items-center gap-4 px-5 py-5 text-sm max-xl:grid-cols-1 sm:px-6">
                      <div>
                        <strong className="text-[#202621]">{shipment.id}</strong>
                        <p className="mt-1 text-xs font-bold uppercase text-[#66716b]">{shipment.carrier}</p>
                      </div>
                      <span className="font-semibold">{shipment.type}</span>
                      <span>{shipment.reference}</span>
                      <span>{shipment.contact}</span>
                      <span>{shipment.destination}</span>
                      <span className="text-[#66716b]">{shipment.date}</span>
                      <select value={shipment.status} onChange={(event) => updateShipmentStatus(shipment, event.target.value)} className={`min-h-10 w-fit rounded-lg border border-[#c4cbc7] bg-white px-3 text-xs font-extrabold uppercase outline-none ${getShipmentTone(shipment.status)}`}>
                        <option>Scheduled</option>
                        <option>Ready for Dispatch</option>
                        <option>In Transit</option>
                        <option>Delivered</option>
                        <option>Delayed</option>
                        <option>Cancelled</option>
                      </select>
                    </article>
                  ))}
                </div>
                {filteredShipments.length === 0 && <p className="m-5 rounded-lg bg-[#f8f4ec] p-5 text-sm font-semibold text-[#66716b]">No shipments match this filter.</p>}
              </section>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
