import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Factory,
  MessageSquare,
  PackagePlus,
  Send,
} from "lucide-react";
import { parseOrderAmount } from "./format.js";
import { getOrderFulfillmentPlan, getStoredVendorProducts } from "./orders.js";
import { ModalShell, OrderInfo } from "./shared";

export function ProductStat({ icon: Icon, label, value, warning = false }) {
  return (
    <article className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <span className={`grid h-11 w-11 place-items-center rounded-lg ${warning ? "bg-[#fff0f0] text-[#d24b53]" : "bg-[#eef4ef] text-[#115745]"}`}>
          <Icon className="h-5 w-5" />
        </span>
        <strong className="text-2xl text-[#202621]">{value}</strong>
      </div>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-[#66716b]">{label}</p>
    </article>
  );
}

export function SupplyWarningPanel({ warnings, onReview }) {
  return (
    <section className="rounded-xl border border-[#efb1b1] bg-[#fff0f0] p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[#d24b53]" />
            <h2 className="text-lg font-semibold text-[#202621]">Vendor Supply Warning</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[#6c3a3a]">
            {warnings.length} customer order{warnings.length === 1 ? "" : "s"} need supplier or stock review before production can continue.
          </p>
        </div>
        <div className="grid gap-2">
          {warnings.slice(0, 3).map(({ order, check }) => (
            <button key={order.id} onClick={() => onReview(order)} className="rounded-lg bg-white px-4 py-3 text-left text-sm shadow-sm">
              <strong className="block text-[#202621]">{order.id} - {order.product}</strong>
              <span className="mt-1 block text-[#6c3a3a]">{check.message}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SupplyCheckBadge({ check }) {
  const tone = check.level === "available"
    ? "bg-[#d9ecd8] text-[#115745]"
    : check.level === "low"
      ? "bg-[#fff0cd] text-[#8b5633]"
      : "bg-[#fff0f0] text-[#b10015]";
  return (
    <span className={`w-fit rounded-full px-3 py-2 text-xs font-extrabold uppercase ${tone}`} title={check.message}>
      {check.label}
    </span>
  );
}

export function FulfillmentPlanPanel({ plan }) {
  return (
    <section className="rounded-xl border border-[#d9d5cd] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[#202621]">Stock Or Manufacture Decision</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#66716b]">The system checks ordered items before sending anything to production.</p>
        </div>
        <span className="rounded-full bg-[#eef4ef] px-3 py-1 text-xs font-extrabold uppercase text-[#115745]">
          {plan.filter((item) => item.decision === "manufacture").length} manufacture
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {plan.map((item) => {
          const manufacture = item.decision === "manufacture";
          const Icon = manufacture ? Factory : CheckCircle2;
          return (
            <article key={`${item.name}-${item.quantity}`} className="grid gap-3 rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
              <span className={`grid h-10 w-10 place-items-center rounded-lg ${manufacture ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#d9ecd8] text-[#115745]"}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <strong className="block text-[#202621]">{item.name} x{item.quantity}</strong>
                <span className="mt-1 block text-sm leading-relaxed text-[#66716b]">{item.reason}</span>
              </div>
              <span className={`w-fit rounded-full px-3 py-2 text-xs font-extrabold uppercase ${manufacture ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#d9ecd8] text-[#115745]"}`}>
                {item.label}
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function OrderDetailsModal({ order, supplyCheck, onClose, onStatus, onWorkOrder, onMessage }) {
  const fulfillmentPlan = getOrderFulfillmentPlan(order, getStoredVendorProducts());
  return (
    <ModalShell title={`${order.id} Details`} subtitle="Customer order details and fulfillment actions." onClose={onClose} size="large">
      <div className="grid max-h-[calc(90vh-86px)] gap-5 overflow-y-auto px-5 py-5 sm:px-6">
        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border border-[#d9d5cd] bg-[#fbfaf6] p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <OrderInfo label="Customer" value={order.customer} />
              <OrderInfo label="Order Date" value={order.date} />
              <OrderInfo label="Product" value={order.product} />
              <OrderInfo label="Due Date" value={order.dueDate} />
              <OrderInfo label="Amount" value={order.amount} />
              <OrderInfo label="Current Status" value={order.status} />
              <OrderInfo label="Production Work Order" value={order.workOrderId || "Not created yet"} />
            </div>
          </div>
          <div className="grid content-start gap-3 rounded-xl border border-[#d9d5cd] bg-white p-5">
            <span className={`w-fit rounded-full px-3 py-2 text-xs font-extrabold uppercase ${order.tone}`}>{order.status}</span>
            <button onClick={() => onStatus(order, "Approved")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
              <CheckCircle2 className="h-4 w-4" />
              Approve And Send To Production
            </button>
            <button onClick={() => onStatus(order, "Processing")} className="min-h-10 rounded-lg bg-[#ffd0a8] px-4 text-sm font-extrabold text-[#8b5633]">Mark Processing</button>
            <button onClick={() => onStatus(order, "Completed")} className="min-h-10 rounded-lg bg-[#d9ecd8] px-4 text-sm font-extrabold text-[#115745]">Mark Completed</button>
            <button onClick={() => onWorkOrder(order)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
              <PackagePlus className="h-4 w-4" />
              Create Work Order
            </button>
            <button onClick={() => onMessage(order)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
              <MessageSquare className="h-4 w-4" />
              Message Customer
            </button>
          </div>
        </section>

        <FulfillmentPlanPanel plan={fulfillmentPlan} />

        <section className={`rounded-xl border p-5 ${supplyCheck.level === "available" ? "border-[#b9d8c8] bg-[#f3faf4]" : "border-[#efb1b1] bg-[#fff0f0]"}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-[#202621]">Supplier And Stock Check</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#545c58]">{supplyCheck.message}</p>
            </div>
            <SupplyCheckBadge check={supplyCheck} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <OrderInfo label="Checked Item" value={supplyCheck.item} />
            <OrderInfo label="Required" value={supplyCheck.required} />
            <OrderInfo label="Available" value={supplyCheck.available} />
          </div>
        </section>

        <section className="rounded-xl border border-[#d9d5cd] bg-[#fbfaf6] p-5">
          <h3 className="font-semibold text-[#202621]">Fulfillment Timeline</h3>
          <div className="mt-4 grid gap-3">
            {["Order received", "Material check", "Production scheduled", "Quality review", "Ready for delivery"].map((step, index) => (
              <div key={step} className="grid grid-cols-[28px_minmax(0,1fr)] items-center gap-3 text-sm">
                <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-extrabold ${index < 2 ? "bg-[#115745] text-white" : "bg-[#e9e4dc] text-[#66716b]"}`}>{index + 1}</span>
                <span className="font-semibold text-[#3d4541]">{step}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ModalShell>
  );
}

export function AllOrdersModal({ orders, onClose }) {
  const [status, setStatus] = useState("All");
  const statuses = ["All", ...Array.from(new Set(orders.map((order) => order.status)))];
  const filteredOrders = status === "All" ? orders : orders.filter((order) => order.status === status);
  const totalValue = filteredOrders.reduce((sum, order) => sum + parseOrderAmount(order.amount), 0);

  return (
    <ModalShell title="All Customer Orders" subtitle="View every customer order currently tracked in the vendor portal." onClose={onClose} size="large">
      <div className="grid max-h-[calc(90vh-86px)] gap-4 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-wrap gap-2">
            {statuses.map((item) => (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`min-h-10 rounded-lg px-3 text-sm font-extrabold transition ${status === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541] hover:bg-[#e3ddd2]"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-[#f8f4ec] px-4 py-3">
              <span className="block text-xs font-extrabold uppercase text-[#66716b]">Orders</span>
              <strong className="text-lg text-[#202621]">{filteredOrders.length}</strong>
            </div>
            <div className="rounded-lg bg-[#f8f4ec] px-4 py-3">
              <span className="block text-xs font-extrabold uppercase text-[#66716b]">Value</span>
              <strong className="text-lg text-[#202621]">LKR {totalValue.toLocaleString("en-US")}</strong>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#d9d5cd]">
          <div className="grid grid-cols-[0.9fr_1.4fr_1.4fr_1fr_1fr_1.1fr] bg-[#f3eee6] px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-[#56605b] max-lg:hidden">
            <span>Order</span><span>Customer</span><span>Product</span><span>Due</span><span>Amount</span><span>Status</span>
          </div>
          <div className="divide-y divide-[#d9d5cd]">
            {filteredOrders.map((order) => (
              <article key={order.id} className="grid grid-cols-[0.9fr_1.4fr_1.4fr_1fr_1fr_1.1fr] items-center gap-4 px-5 py-4 text-sm max-lg:grid-cols-1">
                <strong className="text-[#202621]">{order.id}</strong>
                <span className="grid grid-cols-[32px_minmax(0,1fr)] items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2f6757] text-xs font-bold text-white">{order.initials}</span>
                  <span className="min-w-0 font-semibold">{order.customer}</span>
                </span>
                <span className="font-semibold text-[#3d4541]">{order.product}</span>
                <span className="text-[#66716b]">{order.dueDate}</span>
                <strong>{order.amount}</strong>
                <span className={`w-fit rounded-full px-3 py-2 text-xs font-extrabold uppercase ${order.tone}`}>{order.status}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

export function NewOrderModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    customer: "Nimali Fernando",
    product: "Custom teak dining table",
    amount: "LKR 180,000",
    dueDate: "2026-08-15",
    notes: "Confirm preferred finish before production starts.",
  });

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <ModalShell title="New Order" subtitle="Create a customer order and add it to recent orders." onClose={onClose}>
      <form onSubmit={handleSubmit} className="grid gap-4 px-5 py-5 sm:px-6">
        <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
          Customer Name
          <input required value={form.customer} onChange={(event) => updateField("customer", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
          Product
          <input required value={form.product} onChange={(event) => updateField("product", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Amount
            <input required value={form.amount} onChange={(event) => updateField("amount", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Due Date
            <input required type="date" value={form.dueDate} onChange={(event) => updateField("dueDate", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
          Notes
          <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} rows={3} className="rounded-lg border border-[#c4cbc7] px-3 py-2 font-semibold outline-none focus:border-[#115745]" />
        </label>
        <div className="flex flex-wrap justify-end gap-3 border-t border-[#d9d5cd] pt-4">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
          <button type="submit" className="min-h-11 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">Create Order</button>
        </div>
      </form>
    </ModalShell>
  );
}

export function WorkOrderModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    orderId: "#WV-9482",
    customer: "Kasun Wijesinghe",
    product: "Royal teak lounge chair",
    stage: "Carpentry",
    priority: "High Priority",
    quantity: "12",
    dueDate: "2026-08-20",
    assignedTo: "Workshop A",
    notes: "Confirm material availability before cutting.",
  });
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = (event) => {
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
    <ModalShell title="Create Work Order" subtitle="Schedule production work for the artisan team." onClose={onClose}>
      <form onSubmit={handleSubmit} className="grid gap-4 px-5 py-5 sm:px-6">
        {error && <p className="rounded-lg border border-[#f0b4b4] bg-[#fff0f0] px-3 py-2 text-sm font-bold text-[#b10015]">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Order ID
            <input required value={form.orderId} onChange={(event) => updateField("orderId", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Customer
            <input required value={form.customer} onChange={(event) => updateField("customer", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
          Product
          <input required value={form.product} onChange={(event) => updateField("product", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Production Stage
            <select value={form.stage} onChange={(event) => updateField("stage", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]">
              <option>Carpentry</option>
              <option>Polishing</option>
              <option>Upholstery</option>
              <option>Quality Check</option>
              <option>Packing</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Priority
            <select value={form.priority} onChange={(event) => updateField("priority", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]">
              <option>High Priority</option>
              <option>Normal Priority</option>
              <option>Low Priority</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Quantity
            <input required min="1" type="number" value={form.quantity} onChange={(event) => updateField("quantity", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Due Date
            <input required type="date" value={form.dueDate} onChange={(event) => updateField("dueDate", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
          Assigned To
          <input required value={form.assignedTo} onChange={(event) => updateField("assignedTo", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
          Notes
          <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} rows={3} className="rounded-lg border border-[#c4cbc7] px-3 py-2 font-semibold outline-none focus:border-[#115745]" />
        </label>
        <div className="flex flex-wrap justify-end gap-3 border-t border-[#d9d5cd] pt-4">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
          <button type="submit" className="min-h-11 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">Create Work Order</button>
        </div>
      </form>
    </ModalShell>
  );
}
