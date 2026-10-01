import { useState } from "react";
import {
  AlertTriangle,
  Clock3,
  Plus,
  Search,
  ShoppingCart,
  WalletCards,
} from "lucide-react";
import { ApprovalStatusBadge, DirectoryStat, parseDirectoryValue } from "./AdminDirectoryPage";

export function AdminOrdersPage({ orders, onCreate, onUpdate, onMessage }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const statuses = ["Vendor Approval", "Processing", "Ready for Delivery", "Completed", "Refund Review", "Cancelled"];
  const payments = ["Pending", "Authorized", "Paid", "Refund Requested", "Refunded"];
  const filteredOrders = orders.filter((order) => {
    const text = `${order.id} ${order.customer} ${order.vendor} ${order.product} ${order.status} ${order.payment}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    const matchesPayment = paymentFilter === "All" || order.payment === paymentFilter;
    return matchesQuery && matchesStatus && matchesPayment;
  });
  const totalValue = orders.reduce((sum, order) => sum + parseDirectoryValue(order.amount), 0);
  const activeCount = orders.filter((order) => !["Completed", "Cancelled"].includes(order.status)).length;
  const refundCount = orders.filter((order) => order.status === "Refund Review" || order.payment === "Refund Requested").length;
  const completedCount = orders.filter((order) => order.status === "Completed").length;

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-[#104d3f]">Orders</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#66716b]">
            Manage customer orders across vendor approval, production, payment, delivery, completion, cancellation, and refund review.
          </p>
        </div>
        <button onClick={onCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
          <Plus className="h-4 w-4" />
          Create Order
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <DirectoryStat icon={ShoppingCart} label="Total Orders" value={String(orders.length)} />
        <DirectoryStat icon={Clock3} label="Active Orders" value={String(activeCount)} />
        <DirectoryStat icon={AlertTriangle} label="Refund Review" value={String(refundCount)} warning />
        <DirectoryStat icon={WalletCards} label="Order Value" value={`LKR ${totalValue.toLocaleString("en-US")}`} />
      </section>

      <section className="overflow-hidden rounded-xl border border-[#c6cdc8] bg-white shadow-sm">
        <div className="grid gap-3 border-b border-[#d8d4cc] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_210px_210px] lg:items-center">
          <label className="flex min-h-11 items-center rounded-lg border border-[#c6cdc8] bg-white px-3 text-[#66716b]">
            <Search className="h-4 w-4 shrink-0" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search orders, customers, vendors..." />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            <option>All</option>
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
          <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            <option>All</option>
            {payments.map((payment) => <option key={payment}>{payment}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-[#f3eee6] text-xs font-extrabold uppercase text-[#56605b]">
              <tr><th className="px-5 py-4">Order</th><th className="px-4 py-4">Customer</th><th className="px-4 py-4">Vendor</th><th className="px-4 py-4">Amount</th><th className="px-4 py-4">Payment</th><th className="px-4 py-4">Status</th><th className="px-5 py-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-[#e2ded7]">
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-5 py-4">
                    <strong className="block text-[#202621]">{order.id}</strong>
                    <span className="text-xs font-semibold text-[#66716b]">{order.product} - {order.date}</span>
                    <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-extrabold uppercase ${order.priority === "Urgent" ? "bg-[#ffe1df] text-[#b83f47]" : order.priority === "High" ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#e9f2ed] text-[#104d3f]"}`}>{order.priority}</span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#4f5853]">{order.customer}</td>
                  <td className="px-4 py-4 font-semibold text-[#4f5853]">{order.vendor}</td>
                  <td className="px-4 py-4 font-extrabold">{order.amount}</td>
                  <td className="px-4 py-4"><ApprovalStatusBadge status={order.payment} /></td>
                  <td className="px-4 py-4"><ApprovalStatusBadge status={order.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => onUpdate(order, "status", "Processing")} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Process</button>
                      <button onClick={() => onUpdate(order, "status", "Ready for Delivery")} className="min-h-9 rounded-lg bg-[#d9ecd8] px-3 text-xs font-extrabold text-[#104d3f]">Ready</button>
                      <button onClick={() => onUpdate(order, "status", "Completed")} className="min-h-9 rounded-lg bg-[#104d3f] px-3 text-xs font-extrabold text-white">Complete</button>
                      <button onClick={() => onUpdate(order, "payment", "Paid")} className="min-h-9 rounded-lg bg-[#fff0cd] px-3 text-xs font-extrabold text-[#8b5633]">Mark Paid</button>
                      <button onClick={() => onUpdate(order, "status", "Refund Review")} className="min-h-9 rounded-lg border border-[#f0c46f] bg-white px-3 text-xs font-extrabold text-[#8b5633]">Refund</button>
                      <button onClick={() => onUpdate(order, "status", "Cancelled")} className="min-h-9 rounded-lg bg-[#ffe1df] px-3 text-xs font-extrabold text-[#b83f47]">Cancel</button>
                      <button onClick={() => onMessage(order)} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Notify</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && <p className="p-5 text-sm font-semibold text-[#66716b]">No orders match this filter.</p>}
        </div>
      </section>

      <div className="rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] px-4 py-3 text-sm font-semibold text-[#66716b]">
        Completed orders: {completedCount}. Admin updates notify both the customer and vendor.
      </div>
    </section>
  );
}
