import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Factory,
  PackagePlus,
  Save,
  Search,
} from "lucide-react";
import { VendorHeader } from "./VendorHeader";
import { VendorSidebar } from "./VendorSidebar";
import { ProductStat } from "./orderParts";
import { createStoredProductionWorkOrder, getStoredProductionWorks, requestVendorNewOrder } from "./orders.js";
import { productionStages } from "./seed.js";
import { ModalShell, OrderInfo, SettingsInput, SettingsSelect } from "./shared";
import { vendorProductionStorageKey } from "./storageKeys.js";
import { getProductionProgress, getProductionTone } from "./tone.js";
import { getFutureDateLabel } from "../../lib/dates.js";

export function VendorProductionTrackingPage() {
  const [notice, setNotice] = useState("Production tracking loaded.");
  const [works, setWorks] = useState(() => {
    return getStoredProductionWorks();
  });
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("All");
  const [activeWork, setActiveWork] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(vendorProductionStorageKey, JSON.stringify(works));
    } catch {}
  }, [works]);

  const filteredWorks = works.filter((work) => {
    const matchesQuery = `${work.id} ${work.orderId} ${work.product} ${work.customer} ${work.assignedTo}`.toLowerCase().includes(query.toLowerCase());
    const matchesStage = stage === "All" || work.stage === stage;
    return matchesQuery && matchesStage;
  });
  const activeCount = works.filter((work) => work.stage !== "Completed").length;
  const completedCount = works.filter((work) => work.stage === "Completed").length;
  const urgentCount = works.filter((work) => work.priority === "High Priority" && work.stage !== "Completed").length;

  const openNewWork = () => {
    setActiveWork(null);
    setModalOpen(true);
  };

  const openEditWork = (work) => {
    setActiveWork(work);
    setModalOpen(true);
  };

  const saveWork = (form) => {
    const normalizedWork = {
      ...form,
      product: form.product.trim(),
      customer: form.customer.trim(),
      quantity: Math.max(1, Number(form.quantity)),
    };
    if (activeWork) {
      setWorks((items) => items.map((item) => (item.id === activeWork.id ? { ...item, ...normalizedWork } : item)));
      setNotice(`${activeWork.id} updated.`);
    } else {
      const { workOrder, updatedWorks } = createStoredProductionWorkOrder(normalizedWork);
      setWorks(updatedWorks);
      setNotice(`${workOrder.id} created for ${workOrder.product}.`);
    }
    setStage(normalizedWork.stage);
    setQuery("");
    setActiveWork(null);
    setModalOpen(false);
  };

  const updateWorkStage = (work, nextStage) => {
    setWorks((items) => items.map((item) => (item.id === work.id ? { ...item, stage: nextStage } : item)));
    setStage(nextStage);
    setQuery("");
    setNotice(`${work.id} moved to ${nextStage}.`);
  };

  const moveNextStage = (work) => {
    const currentIndex = productionStages.indexOf(work.stage);
    const nextStage = productionStages[Math.min(currentIndex + 1, productionStages.length - 1)];
    updateWorkStage(work, nextStage);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] pb-24 text-[#303833] lg:pb-0">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Production Tracking" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Production alerts are connected from the Dashboard notifications.")} unreadCount={0} status="Production" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#202621]">Production Tracking</h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#66716b]">
                  Track active work orders, move items through workshop stages, and monitor production readiness.
                </p>
              </div>
              <button onClick={openNewWork} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0d4638]">
                <PackagePlus className="h-5 w-5" />
                Create Work Order
              </button>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">{notice}</div>

            <section className="grid gap-4 md:grid-cols-3">
              <ProductStat icon={Factory} label="Active Works" value={String(activeCount).padStart(2, "0")} />
              <ProductStat icon={AlertTriangle} label="High Priority" value={String(urgentCount).padStart(2, "0")} warning />
              <ProductStat icon={CheckCircle2} label="Completed" value={String(completedCount).padStart(2, "0")} />
            </section>

            <section className="grid gap-4 rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <label className="flex min-h-11 items-center rounded-lg border border-[#c4cbc7] bg-white px-3 text-[#747a76]">
                  <Search className="h-4 w-4 shrink-0" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search work order, order, product, customer..." />
                </label>
                <div className="flex flex-wrap gap-2">
                  {["All", ...productionStages].map((item) => (
                    <button key={item} onClick={() => setStage(item)} className={`min-h-10 rounded-lg px-3 text-sm font-extrabold ${stage === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {filteredWorks.map((work) => (
                  <ProductionWorkCard key={work.id} work={work} onEdit={() => openEditWork(work)} onStage={updateWorkStage} onNext={() => moveNextStage(work)} />
                ))}
              </div>
              {filteredWorks.length === 0 && <p className="rounded-lg bg-[#f8f4ec] p-5 text-sm font-semibold text-[#66716b]">No production work orders match this filter.</p>}
            </section>
          </div>
        </section>
      </div>

      {modalOpen && <ProductionWorkModal work={activeWork} onClose={() => { setModalOpen(false); setActiveWork(null); }} onSubmit={saveWork} />}
    </main>
  );
}

export function ProductionWorkCard({ work, onEdit, onStage, onNext }) {
  const progress = getProductionProgress(work.stage);
  const completed = work.stage === "Completed";
  return (
    <article className="rounded-xl border border-[#d9d5cd] bg-[#fbfaf6] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-lg text-[#202621]">{work.id}</strong>
            <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold uppercase ${work.priority === "High Priority" ? "bg-[#fff0f0] text-[#b10015]" : work.priority === "Low Priority" ? "bg-[#e9e4dc] text-[#66716b]" : "bg-[#fff0cd] text-[#8b5633]"}`}>{work.priority}</span>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-[#202621]">{work.product}</h2>
          <p className="mt-1 text-sm text-[#66716b]">{work.orderId} - {work.customer}</p>
        </div>
        <span className={`rounded-full px-3 py-2 text-xs font-extrabold uppercase ${getProductionTone(work.stage)}`}>{work.stage}</span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs font-extrabold uppercase text-[#66716b]">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[#e9e4dc]">
          <div className="h-full rounded-full bg-[#115745]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <OrderInfo label="Quantity" value={`${work.quantity} units`} />
        <OrderInfo label="Due Date" value={work.dueDate} />
        <OrderInfo label="Assigned" value={work.assignedTo} />
      </div>
      {work.notes && <p className="mt-4 rounded-lg bg-white p-3 text-sm leading-relaxed text-[#545c58]">{work.notes}</p>}

      <div className="mt-5 flex flex-wrap gap-2">
        <select value={work.stage} onChange={(event) => onStage(work, event.target.value)} className="min-h-10 rounded-lg border border-[#c4cbc7] bg-white px-3 text-sm font-extrabold outline-none">
          {productionStages.map((item) => <option key={item}>{item}</option>)}
        </select>
        <button onClick={onNext} disabled={completed} className="min-h-10 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-[#c9c3b8]">Next Stage</button>
        <button onClick={onEdit} className="min-h-10 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Edit</button>
      </div>
    </article>
  );
}

export function ProductionWorkModal({ work, onClose, onSubmit }) {
  const [form, setForm] = useState({
    orderId: work?.orderId || "#WV-9482",
    product: work?.product || "",
    customer: work?.customer || "",
    stage: work?.stage || "Carpentry",
    priority: work?.priority || "Normal Priority",
    quantity: work?.quantity || 1,
    dueDate: work?.dueDate || getFutureDateLabel(10),
    assignedTo: work?.assignedTo || "Workshop A",
    notes: work?.notes || "",
  });
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const submitWork = (event) => {
    event.preventDefault();
    if (!form.product.trim()) {
      setError("Product is required.");
      return;
    }
    if (!form.customer.trim()) {
      setError("Customer is required.");
      return;
    }
    if (!Number.isFinite(Number(form.quantity)) || Number(form.quantity) < 1) {
      setError("Quantity must be at least 1.");
      return;
    }
    onSubmit(form);
  };

  return (
    <ModalShell title={work ? "Edit Work Order" : "Create Work Order"} subtitle="Schedule and assign production work for the workshop." onClose={onClose}>
      <form onSubmit={submitWork} className="grid max-h-[calc(90vh-86px)] overflow-y-auto">
        <div className="grid gap-4 px-5 py-5 sm:px-6">
          {error && <p className="rounded-lg border border-[#f0b4b4] bg-[#fff0f0] px-3 py-2 text-sm font-bold text-[#b10015]">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsInput label="Order ID" value={form.orderId} onChange={(value) => updateField("orderId", value)} />
            <SettingsInput label="Customer" value={form.customer} onChange={(value) => updateField("customer", value)} />
          </div>
          <SettingsInput label="Product" value={form.product} onChange={(value) => updateField("product", value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsSelect label="Stage" value={form.stage} options={productionStages} onChange={(value) => updateField("stage", value)} />
            <SettingsSelect label="Priority" value={form.priority} options={["High Priority", "Normal Priority", "Low Priority"]} onChange={(value) => updateField("priority", value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsInput label="Quantity" type="number" value={form.quantity} onChange={(value) => updateField("quantity", value)} />
            <SettingsInput label="Due Date" value={form.dueDate} onChange={(value) => updateField("dueDate", value)} />
          </div>
          <SettingsInput label="Assigned To" value={form.assignedTo} onChange={(value) => updateField("assignedTo", value)} />
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Notes
            <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} rows={4} className="rounded-lg border border-[#c4cbc7] bg-white px-3 py-2 font-semibold outline-none transition focus:border-[#115745]" />
          </label>
        </div>
        <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-[#d9d5cd] bg-white px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
            <Save className="h-4 w-4" />
            {work ? "Save Work Order" : "Create Work Order"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
