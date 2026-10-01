import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  PlusCircle,
  Search,
  ShoppingCart,
} from "lucide-react";
import { VendorHeader } from "./VendorHeader";
import { VendorSidebar } from "./VendorSidebar";
import { getInitials, parseOrderAmount } from "./format.js";
import { NewOrderModal, OrderDetailsModal, ProductStat, SupplyCheckBadge, SupplyWarningPanel } from "./orderParts";
import { createProductionWorkOrderFromCustomerOrder, getOrderSupplyCheck, getStoredVendorOrders, getStoredVendorProducts, loadVendorOrders } from "./orders.js";
import { initialOrders } from "./seed.js";
import { vendorOpenNewOrderStorageKey, vendorOrdersStorageKey } from "./storageKeys.js";
import { getOrderTone } from "./tone.js";

export function VendorCustomerOrdersPage() {
  const [notice, setNotice] = useState("Loading your customer orders...");
  const [orders, setOrders] = useState(() => {
    try {
      return getStoredVendorOrders();
    } catch {
      return initialOrders;
    }
  });
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const vendorProducts = getStoredVendorProducts();

  // Real orders come from the API. The seeded demo rows are only used if the request
  // fails, so a reachable backend never shows invented orders.
  useEffect(() => {
    let cancelled = false;
    loadVendorOrders()
      .then((rows) => {
        if (cancelled) return;
        setOrders(rows);
        setNotice(rows.length ? `${rows.length} order(s) loaded from the database.` : "No customer orders yet.");
      })
      .catch(() => {
        if (cancelled) return;
        setNotice("Could not reach the orders API, showing saved demo data.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingOrders(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(vendorOrdersStorageKey, JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      if (localStorage.getItem(vendorOpenNewOrderStorageKey) === "true") {
        localStorage.removeItem(vendorOpenNewOrderStorageKey);
        setActiveModal("newOrder");
        setNotice("New customer order form opened.");
      }
    } catch {}
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesQuery = `${order.id} ${order.customer} ${order.product}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All" || order.status === status;
    return matchesQuery && matchesStatus;
  });
  const pendingCount = orders.filter((order) => order.status !== "Completed" && order.status !== "Cancelled").length;
  const completedCount = orders.filter((order) => order.status === "Completed").length;
  const totalValue = filteredOrders.reduce((sum, order) => sum + parseOrderAmount(order.amount), 0);
  const supplyWarnings = orders
    .map((order) => ({ order, check: getOrderSupplyCheck(order, vendorProducts) }))
    .filter(({ check }) => check.level !== "available");

  const createOrder = (form) => {
    const numericIds = orders.map((order) => Number(order.id.replace("#WV-", ""))).filter(Boolean);
    const nextId = `#WV-${Math.max(...numericIds, 9482) + 1}`;
    const amount = form.amount.trim().toUpperCase().startsWith("LKR") ? form.amount.trim() : `LKR ${form.amount.trim()}`;
    setOrders((items) => [
      {
        id: nextId,
        customer: form.customer,
        initials: getInitials(form.customer),
        product: form.product,
        date: "Today",
        dueDate: form.dueDate,
        amount,
        status: "Vendor Approval",
        tone: getOrderTone("Vendor Approval"),
        requiresManufacturing: true,
        fulfillmentPlan: [{
          name: form.product,
          quantity: 1,
          decision: "manufacture",
          label: "Manufacture",
          reason: "Manual vendor order needs stock review before production.",
        }],
      },
      ...items,
    ]);
    setStatus("All");
    setQuery("");
    setActiveModal(null);
    setNotice(`Customer order ${nextId} created and waiting for vendor approval.`);
  };

  const updateOrderStatus = (order, nextStatus) => {
    const approvalResult = nextStatus === "Approved" ? createProductionWorkOrderFromCustomerOrder(order) : null;
    setOrders((items) => items.map((item) => (
      item.id === order.id
        ? { ...item, status: nextStatus, tone: getOrderTone(nextStatus), workOrderId: approvalResult?.workOrder?.id || item.workOrderId }
        : item
    )));
    setActiveOrder((current) => (
      current?.id === order.id
        ? { ...current, status: nextStatus, tone: getOrderTone(nextStatus), workOrderId: approvalResult?.workOrder?.id || current.workOrderId }
        : current
    ));
    setStatus(nextStatus);
    setQuery("");
    if (approvalResult) {
      if (approvalResult.skipped) {
        setNotice(`${order.id} approved. All items are in stock, so no production work order was created.`);
        return;
      }
      setNotice(approvalResult.created
        ? `${order.id} approved and sent to Production Tracking as ${approvalResult.workOrder.id}.`
        : `${order.id} approved. ${approvalResult.workOrder.id} is already in Production Tracking.`);
      return;
    }
    setNotice(`${order.id} updated to ${nextStatus}.`);
  };

  const openOrder = (order) => {
    setActiveOrder(order);
    setActiveModal("details");
  };

  const createWorkOrderFromOrder = (order) => {
    const result = createProductionWorkOrderFromCustomerOrder(order, {
      priority: order.status === "Awaiting Payment" ? "Normal Priority" : "High Priority",
      notes: `Created from customer order ${order.id}.`,
    });
    if (result.skipped) {
      setNotice(`${order.id} is in stock. No production work order is needed.`);
      setActiveModal(null);
      return;
    }
    setOrders((items) => items.map((item) => (item.id === order.id ? { ...item, workOrderId: result.workOrder.id } : item)));
    setNotice(result.created
      ? `${result.workOrder.id} created from ${order.id}. Open Production Tracking to manage workshop stages.`
      : `${result.workOrder.id} already exists for ${order.id} in Production Tracking.`);
    setActiveModal(null);
  };

  const messageCustomer = (order) => {
    setNotice(`Message draft opened for ${order.customer} about ${order.id}.`);
    setActiveModal(null);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] pb-24 text-[#303833] lg:pb-0">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Customer Orders" onNavigate={setNotice} onNewOrder={() => setActiveModal("newOrder")} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Notifications are available from the Dashboard page.")} unreadCount={0} status="Orders" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#202621]">Customer Orders</h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#66716b]">
                  Track customer orders, update fulfillment status, message customers, and create production work orders.
                </p>
              </div>
              <button onClick={() => setActiveModal("newOrder")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0d4638]">
                <PlusCircle className="h-5 w-5" />
                New Customer Order
              </button>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">
              {notice}
            </div>

            <section className="grid gap-4 md:grid-cols-3">
              <ProductStat icon={ShoppingCart} label="Total Orders" value={String(orders.length).padStart(2, "0")} />
              <ProductStat icon={Clock3} label="Pending Work" value={String(pendingCount).padStart(2, "0")} warning />
              <ProductStat icon={CheckCircle2} label="Completed" value={String(completedCount).padStart(2, "0")} />
            </section>

            {supplyWarnings.length > 0 && <SupplyWarningPanel warnings={supplyWarnings} onReview={(order) => openOrder(order)} />}

            <section className="overflow-hidden rounded-xl border border-[#c2cac5] bg-white shadow-sm">
              <div className="grid gap-3 border-b border-[#d9d5cd] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center sm:px-6">
                <label className="flex min-h-11 items-center rounded-lg border border-[#c4cbc7] bg-white px-3 text-[#747a76]">
                  <Search className="h-4 w-4 shrink-0" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search order, customer, product..." />
                </label>
                <div className="flex flex-wrap gap-2">
                  {["All", "Vendor Approval", "Approved", "Processing", "Awaiting Payment", "Completed", "Cancelled"].map((item) => (
                    <button key={item} onClick={() => setStatus(item)} className={`min-h-10 rounded-lg px-3 text-sm font-extrabold ${status === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[0.85fr_1.25fr_1.35fr_0.9fr_1fr_1fr_1.15fr_0.8fr] bg-[#f3eee6] px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-[#56605b] max-xl:hidden">
                <span>Order</span><span>Customer</span><span>Product</span><span>Due</span><span>Amount</span><span>Status</span><span>Supply Check</span><span>Actions</span>
              </div>
              <div className="divide-y divide-[#d9d5cd]">
                {filteredOrders.map((order) => {
                  const supplyCheck = getOrderSupplyCheck(order, vendorProducts);
                  return (
                    <article key={order.id} className="grid grid-cols-[0.85fr_1.25fr_1.35fr_0.9fr_1fr_1fr_1.15fr_0.8fr] items-center gap-4 px-5 py-5 text-sm max-xl:grid-cols-1 sm:px-6">
                      <strong className="text-[#202621]">{order.id}</strong>
                      <span className="grid grid-cols-[32px_minmax(0,1fr)] items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2f6757] text-xs font-bold text-white">{order.initials}</span>
                        <span className="min-w-0 font-semibold">{order.customer}</span>
                      </span>
                      <span className="font-semibold text-[#3d4541]">{order.product}</span>
                      <span className="text-[#66716b]">{order.dueDate}</span>
                      <strong>{order.amount}</strong>
                      <select value={order.status} onChange={(event) => updateOrderStatus(order, event.target.value)} className={`min-h-10 w-fit rounded-full border-0 px-3 text-xs font-extrabold uppercase outline-none ${order.tone}`}>
                        <option>Vendor Approval</option>
                        <option>Approved</option>
                        <option>Processing</option>
                        <option>Awaiting Payment</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                      </select>
                      <SupplyCheckBadge check={supplyCheck} />
                      <button onClick={() => openOrder(order)} className="min-h-10 rounded-lg bg-[#eef4ef] px-3 text-sm font-extrabold text-[#115745]">View</button>
                    </article>
                  );
                })}
              </div>
              {filteredOrders.length === 0 && <p className="m-5 rounded-lg bg-[#f8f4ec] p-5 text-sm font-semibold text-[#66716b]">No customer orders match this filter.</p>}
            </section>

            <div className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
              <span className="text-xs font-extrabold uppercase tracking-wide text-[#66716b]">Filtered Order Value</span>
              <strong className="mt-1 block text-2xl text-[#202621]">LKR {totalValue.toLocaleString("en-US")}</strong>
            </div>
          </div>
        </section>
      </div>

      {activeModal === "newOrder" && <NewOrderModal onClose={() => setActiveModal(null)} onSubmit={createOrder} />}
      {activeModal === "details" && activeOrder && <OrderDetailsModal order={activeOrder} supplyCheck={getOrderSupplyCheck(activeOrder, vendorProducts)} onClose={() => setActiveModal(null)} onStatus={updateOrderStatus} onWorkOrder={createWorkOrderFromOrder} onMessage={messageCustomer} />}
    </main>
  );
}
