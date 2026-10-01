import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Archive,
  Boxes,
  Truck,
  Warehouse,
} from "lucide-react";
import { VendorHeader } from "./VendorHeader";
import { VendorSidebar } from "./VendorSidebar";
import { getInitialVendorInventory, getWarehouseUsage } from "./inventory.js";
import { ProductStat } from "./orderParts";
import { requestVendorNewOrder } from "./orders.js";
import { initialVendorWarehouses } from "./seed.js";
import { SettingsInput, SettingsSelect } from "./shared";
import { vendorInventoryStorageKey, vendorWarehousesStorageKey } from "./storageKeys.js";
import { getInventoryTone, getWarehouseGuidance, getWarehouseTone } from "./tone.js";

export function VendorWarehousesPage() {
  const [notice, setNotice] = useState("Warehouses loaded.");
  const [warehouses, setWarehouses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(vendorWarehousesStorageKey) || "null") || initialVendorWarehouses;
    } catch {
      return initialVendorWarehouses;
    }
  });
  const [inventory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(vendorInventoryStorageKey) || "null") || getInitialVendorInventory();
    } catch {
      return getInitialVendorInventory();
    }
  });
  const [activeWarehouseId, setActiveWarehouseId] = useState(initialVendorWarehouses[0].id);
  const [transferItemId, setTransferItemId] = useState("");
  const [transferTo, setTransferTo] = useState(initialVendorWarehouses[1].id);
  const [transferQty, setTransferQty] = useState("5");

  useEffect(() => {
    try {
      localStorage.setItem(vendorWarehousesStorageKey, JSON.stringify(warehouses));
    } catch {}
  }, [warehouses]);

  const activeWarehouse = warehouses.find((warehouse) => warehouse.id === activeWarehouseId) || warehouses[0];
  const warehouseItems = inventory.filter((item) => item.location.includes(activeWarehouse.name) || item.location.includes(activeWarehouse.name.replace("Warehouse ", "Warehouse ")));
  const totalCapacity = warehouses.reduce((sum, warehouse) => sum + warehouse.capacity, 0);
  const totalUsed = warehouses.reduce((sum, warehouse) => sum + warehouse.used, 0);
  const nearCapacity = warehouses.filter((warehouse) => getWarehouseUsage(warehouse) >= 85).length;
  const availableSpace = totalCapacity - totalUsed;
  const selectedTransferItem = inventory.find((item) => item.id === transferItemId) || inventory[0];

  useEffect(() => {
    if (!transferItemId && inventory[0]) {
      setTransferItemId(inventory[0].id);
    }
  }, [inventory, transferItemId]);

  const updateWarehouseStatus = (warehouse, status) => {
    setWarehouses((items) => items.map((item) => (item.id === warehouse.id ? { ...item, status } : item)));
    setNotice(`${warehouse.name} updated to ${status}.`);
  };

  const createTransfer = (event) => {
    event.preventDefault();
    const qty = Number(transferQty);
    const destination = warehouses.find((warehouse) => warehouse.id === transferTo);
    if (!selectedTransferItem || !destination || !Number.isFinite(qty) || qty <= 0) {
      setNotice("Select an item, destination warehouse, and valid quantity.");
      return;
    }
    setNotice(`${qty} ${selectedTransferItem.unit} of ${selectedTransferItem.name} transfer scheduled to ${destination.name}.`);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] pb-24 text-[#303833] lg:pb-0">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Warehouses" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Warehouse alerts are shown in dashboard notifications.")} unreadCount={0} status="Warehouses" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-3">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
              <h1 className="text-3xl font-semibold leading-tight text-[#202621]">Warehouses</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-[#66716b]">
                Manage storage locations, capacity pressure, warehouse zones, and movement of product/material stock.
              </p>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">{notice}</div>

            <section className="grid gap-4 md:grid-cols-4">
              <ProductStat icon={Warehouse} label="Warehouses" value={String(warehouses.length).padStart(2, "0")} />
              <ProductStat icon={Boxes} label="Used Capacity" value={`${Math.round((totalUsed / totalCapacity) * 100)}%`} />
              <ProductStat icon={AlertTriangle} label="Near Capacity" value={String(nearCapacity).padStart(2, "0")} warning />
              <ProductStat icon={Archive} label="Free Space" value={`${availableSpace} slots`} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="grid gap-6">
                <section className="grid gap-4 md:grid-cols-3">
                  {warehouses.map((warehouse) => {
                    const usage = getWarehouseUsage(warehouse);
                    const active = warehouse.id === activeWarehouseId;
                    return (
                      <button key={warehouse.id} onClick={() => { setActiveWarehouseId(warehouse.id); setNotice(`${warehouse.name} opened.`); }} className={`rounded-xl border p-5 text-left shadow-sm ${active ? "border-[#115745] bg-[#f3faf4]" : "border-[#c2cac5] bg-white"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#eef4ef] text-[#115745]">
                            <Warehouse className="h-5 w-5" />
                          </span>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold uppercase ${getWarehouseTone(warehouse.status)}`}>{warehouse.status}</span>
                        </div>
                        <h2 className="mt-4 text-lg font-semibold text-[#202621]">{warehouse.name}</h2>
                        <p className="mt-1 text-sm text-[#66716b]">{warehouse.location}</p>
                        <div className="mt-4">
                          <div className="flex justify-between text-xs font-extrabold uppercase text-[#66716b]">
                            <span>Capacity</span>
                            <span>{warehouse.used}/{warehouse.capacity}</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-[#e9e4dc]">
                            <span className={`block h-full rounded-full ${usage >= 90 ? "bg-[#d24b53]" : usage >= 75 ? "bg-[#d58a1b]" : "bg-[#115745]"}`} style={{ width: `${Math.min(100, usage)}%` }} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </section>

                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-[#202621]">{activeWarehouse.name}</h2>
                      <p className="mt-1 text-sm leading-relaxed text-[#66716b]">{activeWarehouse.focus}</p>
                    </div>
                    <select value={activeWarehouse.status} onChange={(event) => updateWarehouseStatus(activeWarehouse, event.target.value)} className={`min-h-10 rounded-lg border border-[#c4cbc7] bg-white px-3 text-xs font-extrabold uppercase outline-none ${getWarehouseTone(activeWarehouse.status)}`}>
                      <option>Operational</option>
                      <option>Near Capacity</option>
                      <option>Maintenance</option>
                      <option>Paused</option>
                    </select>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <WarehouseInfo label="Manager" value={activeWarehouse.manager} />
                    <WarehouseInfo label="Zones" value={`${activeWarehouse.zones} zones`} />
                    <WarehouseInfo label="Usage" value={`${getWarehouseUsage(activeWarehouse)}% full`} />
                  </div>

                  <div className="mt-6 overflow-hidden rounded-lg border border-[#d9d5cd]">
                    <div className="grid grid-cols-[1.2fr_.8fr_.8fr_1fr] bg-[#f3eee6] px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-[#56605b] max-lg:hidden">
                      <span>Stored Item</span><span>Type</span><span>Qty</span><span>Status</span>
                    </div>
                    <div className="divide-y divide-[#d9d5cd]">
                      {(warehouseItems.length ? warehouseItems : inventory.slice(0, 4)).map((item) => (
                        <article key={`${activeWarehouse.id}-${item.id}`} className="grid grid-cols-[1.2fr_.8fr_.8fr_1fr] items-center gap-3 px-4 py-4 text-sm max-lg:grid-cols-1">
                          <strong className="text-[#202621]">{item.name}</strong>
                          <span>{item.type}</span>
                          <span>{item.quantity} {item.unit}</span>
                          <span className={`w-fit rounded-full px-3 py-2 text-xs font-extrabold uppercase ${getInventoryTone(item.status)}`}>{item.status}</span>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              <aside className="grid content-start gap-6">
                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-xl font-semibold text-[#202621]">Schedule Stock Transfer</h2>
                  <p className="mt-1 text-sm text-[#66716b]">Move stock between warehouse locations when capacity or production needs change.</p>
                  <form onSubmit={createTransfer} className="mt-5 grid gap-4">
                    <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
                      Item
                      <select value={transferItemId} onChange={(event) => setTransferItemId(event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-3 font-semibold outline-none transition focus:border-[#115745]">
                        {inventory.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </label>
                    <SettingsSelect label="Destination" value={transferTo} options={warehouses.map((warehouse) => warehouse.id)} onChange={setTransferTo} />
                    <SettingsInput label="Quantity" type="number" value={transferQty} onChange={setTransferQty} />
                    <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
                      <Truck className="h-4 w-4" />
                      Schedule Transfer
                    </button>
                  </form>
                </section>

                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-xl font-semibold text-[#202621]">Capacity Guidance</h2>
                  <div className="mt-4 grid gap-3">
                    {warehouses.map((warehouse) => {
                      const usage = getWarehouseUsage(warehouse);
                      return (
                        <article key={`guide-${warehouse.id}`} className="rounded-lg bg-[#f8f4ec] p-4 text-sm">
                          <div className="flex justify-between gap-3">
                            <strong className="text-[#202621]">{warehouse.name}</strong>
                            <span className="font-extrabold text-[#115745]">{usage}%</span>
                          </div>
                          <p className="mt-2 leading-relaxed text-[#66716b]">{getWarehouseGuidance(warehouse)}</p>
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

export function WarehouseInfo({ label, value }) {
  return (
    <div className="rounded-lg bg-[#f8f4ec] px-4 py-3">
      <span className="block text-xs font-extrabold uppercase text-[#66716b]">{label}</span>
      <strong className="mt-1 block text-[#202621]">{value}</strong>
    </div>
  );
}
