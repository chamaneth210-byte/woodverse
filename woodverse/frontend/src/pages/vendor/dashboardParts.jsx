import { useState } from "react";
import {
  Send,
} from "lucide-react";
import { ModalShell } from "./shared";

export function StatCard({ stat }) {
  return (
    <article className={`grid min-h-[142px] content-between rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm ${stat.danger ? "border-[#e8a4a4] bg-[#fff1f0] text-[#a80012]" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${stat.tone}`}><stat.icon className="h-5 w-5" /></span>
        {stat.helper && <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold uppercase ${stat.badge || stat.danger ? "bg-[#d84d54] text-white" : "bg-[#eef4ef] text-[#2f8b55]"}`}>{stat.helper}</span>}
      </div>
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-[#66716b]">{stat.label}</h2>
        <p className="mt-1 text-2xl font-semibold text-[#202621]">{stat.value}</p>
      </div>
    </article>
  );
}

export function RecentOrders({ orders, onViewAll }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#c2cac5] bg-white shadow-sm xl:col-span-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9d5cd] px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-xl font-semibold text-[#202621]">Recent Orders</h2>
          <p className="mt-1 text-sm text-[#66716b]">Latest customer order activity.</p>
        </div>
        <button onClick={onViewAll} className="rounded-lg bg-[#eef4ef] px-3 py-2 text-sm font-extrabold text-[#115745] transition hover:bg-[#dfeae1]">View All Orders</button>
      </div>
      <div className="grid grid-cols-[1fr_1.6fr_1fr_1.2fr_1.2fr] bg-[#f3eee6] px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-[#56605b] max-lg:hidden">
        <span>Order ID</span><span>Customer</span><span>Date</span><span>Amount</span><span>Status</span>
      </div>
      <div className="divide-y divide-[#d9d5cd]">
        {orders.slice(0, 3).map((order) => (
          <article key={order.id} className="grid grid-cols-[1fr_1.6fr_1fr_1.2fr_1.2fr] items-center gap-4 px-5 py-5 text-sm max-lg:grid-cols-1 sm:px-6">
            <strong className="text-base text-[#202621]">{order.id}</strong>
            <span className="grid grid-cols-[32px_minmax(0,1fr)] items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2f6757] text-xs font-bold text-white">{order.initials}</span>
              <span className="min-w-0 font-semibold">{order.customer}</span>
            </span>
            <span className="text-[#66716b]">{order.date}</span>
            <strong>{order.amount}</strong>
            <span className={`w-fit rounded-full px-3 py-2 text-xs font-extrabold uppercase ${order.tone}`}>{order.status}</span>
          </article>
        ))}
      </div>
    </article>
  );
}

export function SystemAlerts({ alerts, onClear, onManageAll }) {
  return (
    <article className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6 xl:col-span-4">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#202621]">System Alerts</h2>
          <p className="mt-1 text-sm text-[#66716b]">Operational items requiring action.</p>
        </div>
        <span className="rounded-full bg-[#d24b53] px-2.5 py-1 text-xs font-extrabold uppercase text-white">Live</span>
      </div>

      <div className="grid gap-3">
        {alerts.length === 0 && (
          <div className="rounded-lg border border-[#d9d5cd] bg-[#f8f4ec] px-4 py-5 text-sm font-semibold text-[#66716b]">
            No active alerts.
          </div>
        )}
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <article key={alert.id} className={`rounded-lg border-l-4 p-4 ${alert.tone}`}>
              <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-3">
                <Icon className="h-5 w-5 text-[#d24b53]" />
                <div>
                  <strong className="block text-sm leading-tight text-[#202621]">{alert.title}</strong>
                  <p className="mt-2 text-sm leading-relaxed text-[#545c58]">{alert.detail}</p>
                  <button onClick={() => onClear(alert.id)} className="mt-3 text-xs font-extrabold uppercase text-[#68716c] hover:text-[#115745]">{alert.time}</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <button onClick={onManageAll} className="mt-5 min-h-11 w-full rounded-lg bg-[#e9e4dc] text-sm font-extrabold text-[#3d4541] transition hover:bg-[#ded7ca]">Manage All Alerts</button>
    </article>
  );
}

export function WorkOrderQueue({ workOrders }) {
  return (
    <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#202621]">Created Work Orders</h2>
          <p className="mt-1 text-sm text-[#66716b]">New production tasks created from the vendor dashboard.</p>
        </div>
        <span className="rounded-full bg-[#eef4ef] px-3 py-1 text-xs font-extrabold uppercase text-[#115745]">{workOrders.length} Active</span>
      </div>
      <div className="grid gap-3">
        {workOrders.map((workOrder) => (
          <article key={workOrder.id} className="grid gap-3 rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
            <div>
              <strong className="block text-[#202621]">{workOrder.id}</strong>
              <span className="text-sm text-[#66716b]">{workOrder.product}</span>
            </div>
            <div className="text-sm">
              <span className="block font-bold text-[#202621]">{workOrder.stage}</span>
              <span className="text-[#66716b]">Stage</span>
            </div>
            <div className="text-sm">
              <span className="block font-bold text-[#202621]">{workOrder.quantity} units</span>
              <span className="text-[#66716b]">Due {workOrder.dueDate}</span>
            </div>
            <span className="w-fit rounded-full bg-[#ffe4b8] px-3 py-2 text-xs font-extrabold uppercase text-[#8b5633]">{workOrder.priority}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AlertManagerModal({ alerts, resolvedAlerts, onClose, onResolve, onResolveAll, onRestore }) {
  const [tab, setTab] = useState("active");
  const visibleAlerts = tab === "active" ? alerts : resolvedAlerts;

  return (
    <ModalShell title="Manage System Alerts" subtitle="Review active alerts, mark them managed, or restore resolved items." onClose={onClose} size="large">
      <div className="grid max-h-[calc(90vh-86px)] gap-5 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setTab("active")} className={`min-h-10 rounded-lg px-4 text-sm font-extrabold ${tab === "active" ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
              Active Alerts ({alerts.length})
            </button>
            <button onClick={() => setTab("resolved")} className={`min-h-10 rounded-lg px-4 text-sm font-extrabold ${tab === "resolved" ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
              Managed Alerts ({resolvedAlerts.length})
            </button>
          </div>
          <button onClick={onResolveAll} disabled={alerts.length === 0} className="min-h-10 rounded-lg bg-[#d24b53] px-4 text-sm font-extrabold text-white transition hover:bg-[#b83f47] disabled:cursor-not-allowed disabled:bg-[#d9d5cd] disabled:text-[#777b76]">
            Mark All Managed
          </button>
        </div>

        <div className="grid gap-3">
          {visibleAlerts.length === 0 && (
            <div className="rounded-lg border border-[#d9d5cd] bg-[#f8f4ec] px-4 py-8 text-center text-sm font-semibold text-[#66716b]">
              {tab === "active" ? "No active alerts." : "No managed alerts yet."}
            </div>
          )}

          {visibleAlerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <article key={`${tab}-${alert.id}`} className={`rounded-xl border border-[#d9d5cd] border-l-4 p-4 ${alert.tone}`}>
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white">
                      <Icon className="h-5 w-5 text-[#d24b53]" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-base text-[#202621]">{alert.title}</strong>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-extrabold uppercase text-[#3d4541]">{alert.severity}</span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-extrabold uppercase text-[#66716b]">{alert.owner}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[#545c58]">{alert.detail}</p>
                      <p className="mt-3 text-xs font-bold uppercase text-[#66716b]">
                        {tab === "active" ? alert.time : `Managed ${alert.resolvedAt}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => (tab === "active" ? onResolve(alert.id) : onRestore(alert.id))}
                    className="min-h-10 rounded-lg bg-white px-4 text-sm font-extrabold text-[#115745] shadow-sm transition hover:bg-[#eef4ef]"
                  >
                    {tab === "active" ? "Mark Managed" : "Restore Alert"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </ModalShell>
  );
}

export function NotificationCenterModal({ notifications, readIds, status, onClose, onRead, onReadAll, onSendDemo }) {
  const [filter, setFilter] = useState("All");
  const filteredNotifications = notifications.filter((item) => {
    if (filter === "Unread") return !readIds.includes(item.id);
    if (filter === "All") return true;
    return item.audience === filter;
  });
  const unreadCount = notifications.filter((item) => !readIds.includes(item.id)).length;
  const supplierCount = notifications.filter((item) => item.audience === "Supplier").length;
  const customerCount = notifications.filter((item) => item.audience === "Customer").length;

  return (
    <ModalShell title="Notification Center" subtitle="Supplier and customer updates connected through Socket.IO." onClose={onClose} size="large">
      <div className="grid max-h-[calc(90vh-86px)] gap-5 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-3 sm:grid-cols-4">
            <NotificationSummary label="Socket" value={status} connected={status === "Connected"} />
            <NotificationSummary label="Unread" value={String(unreadCount)} />
            <NotificationSummary label="Supplier" value={String(supplierCount)} />
            <NotificationSummary label="Customer" value={String(customerCount)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onSendDemo("Supplier")} className="min-h-10 rounded-lg bg-[#eef4ef] px-3 text-sm font-extrabold text-[#115745]">Send Supplier Notice</button>
            <button onClick={() => onSendDemo("Customer")} className="min-h-10 rounded-lg bg-[#fff0cd] px-3 text-sm font-extrabold text-[#8b5633]">Send Customer Notice</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {["All", "Unread", "Supplier", "Customer", "System"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`min-h-10 rounded-lg px-4 text-sm font-extrabold ${filter === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <button onClick={onReadAll} className="min-h-10 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
            Mark All Read
          </button>
        </div>

        <div className="grid gap-3">
          {filteredNotifications.length === 0 && (
            <div className="rounded-lg border border-[#d9d5cd] bg-[#f8f4ec] px-4 py-8 text-center text-sm font-semibold text-[#66716b]">
              No notifications for this filter.
            </div>
          )}

          {filteredNotifications.map((notification) => {
            const isUnread = !readIds.includes(notification.id);
            return (
              <article key={notification.id} className={`rounded-xl border p-4 ${isUnread ? "border-[#115745] bg-[#f3faf4]" : "border-[#d9d5cd] bg-[#fbfaf6]"}`}>
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold uppercase ${notification.audience === "Supplier" ? "bg-[#d9ecd8] text-[#115745]" : notification.audience === "Customer" ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#e9e4dc] text-[#3d4541]"}`}>
                        {notification.audience}
                      </span>
                      {isUnread && <span className="rounded-full bg-[#d24b53] px-2.5 py-1 text-xs font-extrabold uppercase text-white">Unread</span>}
                      <span className="text-xs font-bold uppercase text-[#66716b]">{notification.time}</span>
                    </div>
                    <strong className="mt-3 block text-base text-[#202621]">{notification.title}</strong>
                    <p className="mt-2 text-sm leading-relaxed text-[#545c58]">{notification.message}</p>
                    <p className="mt-3 text-xs font-bold uppercase text-[#66716b]">From {notification.source}</p>
                  </div>
                  <button
                    onClick={() => onRead(notification.id)}
                    disabled={!isUnread}
                    className="min-h-10 rounded-lg bg-white px-4 text-sm font-extrabold text-[#115745] shadow-sm transition hover:bg-[#eef4ef] disabled:cursor-not-allowed disabled:text-[#9aa29d]"
                  >
                    {isUnread ? "Mark Read" : "Read"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </ModalShell>
  );
}

export function NotificationSummary({ label, value, connected = false }) {
  return (
    <div className="rounded-lg border border-[#d9d5cd] bg-[#f8f4ec] px-4 py-3">
      <span className="text-xs font-extrabold uppercase tracking-wide text-[#66716b]">{label}</span>
      <strong className={`mt-1 block text-lg ${connected ? "text-[#115745]" : "text-[#202621]"}`}>{value}</strong>
    </div>
  );
}
