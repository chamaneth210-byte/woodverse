import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Globe2,
  Moon,
  Search,
  Settings,
  ShoppingCart,
  Sun,
  Truck,
  Wallet,
} from "lucide-react";
import { SupplierSidebar } from "./SupplierSidebar";
import { SupplierProgress } from "./shared";
import { getStoredSupplierIncomingRequests, getStoredSupplierNotifications } from "./storage.js";

export function SupplierNotificationsPage({ theme, onToggleTheme }) {
  const [notice, setNotice] = useState("Notifications synced. 6 unread items need attention.");
  const [activeFilter, setActiveFilter] = useState("All");
  const [readIds, setReadIds] = useState([]);
  const incomingRequestNotifications = getStoredSupplierNotifications().map((item) => ({
    ...item,
    type: item.sourceRequestId ? "Material Request" : item.type,
    icon: ClipboardList,
    tone: item.priority === "High"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
      : "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200",
  }));
  const incomingRequests = getStoredSupplierIncomingRequests();
  const notifications = [
    ...incomingRequestNotifications,
    {
      id: "nt-1",
      type: "Purchase Order",
      title: "Silva Woodworks placed PO #8930 for Grade-A Teak",
      detail: "Review requested quantity, delivery date, and pricing before 5:00 PM.",
      time: "2 minutes ago",
      icon: ShoppingCart,
      tone: "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200",
      priority: "High",
    },
    {
      id: "nt-2",
      type: "Shipment",
      title: "Shipment #LV-721 delayed due to weather in Galle",
      detail: "Logistics partner recommends rerouting through Matara Transit Hub.",
      time: "45 minutes ago",
      icon: Truck,
      tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
      priority: "Critical",
    },
    {
      id: "nt-3",
      type: "Compliance",
      title: "Monthly logging-rights certificate verified",
      detail: "Your July compliance certificate is approved and attached to supplier records.",
      time: "3 hours ago",
      icon: ClipboardList,
      tone: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200",
      priority: "Normal",
    },
    {
      id: "nt-4",
      type: "Payment",
      title: "Payment of LKR 840,000 settled for PO #8812",
      detail: "Funds are available in the supplier wallet after delivery confirmation.",
      time: "Yesterday",
      icon: Wallet,
      tone: "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200",
      priority: "Normal",
    },
    {
      id: "nt-5",
      type: "Materials",
      title: "Mahogany Planks reached low-stock threshold",
      detail: "Available quantity is now 12.20 m3. Update availability or pause new POs.",
      time: "Yesterday",
      icon: Boxes,
      tone: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200",
      priority: "High",
    },
  ];
  const filtered = activeFilter === "All" ? notifications : notifications.filter((item) => item.type === activeFilter || item.priority === activeFilter);
  const unreadCount = notifications.length - readIds.length;
  const materialRequestCount = incomingRequestNotifications.length;

  const markRead = (id) => {
    setReadIds((items) => items.includes(id) ? items : [...items, id]);
    setNotice("Notification marked as read.");
  };

  const openNotification = (item) => {
    if (item.sourceRequestId) {
      const request = incomingRequests.find((row) => row.id === item.sourceRequestId);
      setNotice(request
        ? `${request.id} opened: ${request.vendor} requested ${request.quantity} of ${request.material} for ${request.linkedWork}.`
        : `${item.sourceRequestId} request details opened.`);
      markRead(item.id);
      return;
    }
    setNotice(`${item.type} details opened.`);
  };

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Notifications" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/90 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/90 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search notifications..." />
            </label>
            <div className="flex shrink-0 items-center gap-3">
              <button onClick={() => setNotice("Language selector opened.")} className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Language">
                <Globe2 className="h-5 w-5" />
              </button>
              <button
                onClick={onToggleTheme}
                className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button onClick={() => setNotice("Unread notifications panel opened.")} className="relative grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Unread notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[#d94d58]" />}
              </button>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-7 px-6 py-9 xl:px-10">
            <section className="flex min-w-0 items-start justify-between gap-5 max-md:grid">
              <div className="min-w-0">
                <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">Notifications</h1>
                <p className="mt-2 max-w-2xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">Monitor purchase orders, shipment exceptions, compliance approvals, payment updates, and stock alerts.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => { setReadIds(notifications.map((item) => item.id)); setNotice("All notifications marked as read."); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#8b5633] bg-[#fbf8f1] px-4 font-bold text-[#8b5633] dark:border-amber-500/60 dark:bg-[#202b28] dark:text-amber-200">
                  <CheckCircle2 className="h-4 w-4" />
                  Mark All Read
                </button>
                <button onClick={() => setNotice("Notification preferences opened.")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#115745] px-5 font-bold text-white shadow-sm">
                  <Settings className="h-5 w-5" />
                  Preferences
                </button>
              </div>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="grid grid-cols-4 gap-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
              <NotificationStat icon={Bell} label="Unread" value={String(unreadCount).padStart(2, "0")} />
              <NotificationStat icon={AlertTriangle} label="Critical" value="01" warning />
              <NotificationStat icon={Truck} label="Shipment Alerts" value="02" />
              <NotificationStat icon={ClipboardList} label="Material Requests" value={String(materialRequestCount).padStart(2, "0")} />
            </section>

            <section className="grid grid-cols-[minmax(0,1fr)_300px] gap-6 max-xl:grid-cols-1">
              <div className="grid gap-5">
                <div className="flex flex-wrap gap-3 rounded-lg border border-[#cbd2cd] bg-[#fbf8f1] p-4 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  {["All", "Critical", "Material Request", "Purchase Order", "Shipment", "Materials", "Payment"].map((filter) => (
                    <button key={filter} onClick={() => setActiveFilter(filter)} className={`min-h-9 rounded-full border px-4 text-sm font-semibold ${activeFilter === filter ? "border-[#115745] bg-white text-[#115745] dark:border-emerald-200 dark:bg-[#202b28] dark:text-emerald-200" : "border-[#cbd2cd] bg-[#e9e5dc] text-[#4d5651] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-300"}`}>
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="grid gap-4">
                  {filtered.map((item) => {
                    const Icon = item.icon;
                    const read = readIds.includes(item.id);
                    return (
                      <article key={item.id} className={`grid grid-cols-[52px_minmax(0,1fr)_auto] gap-4 rounded-lg border p-5 shadow-sm max-sm:grid-cols-1 ${read ? "border-[#d8d6cf] bg-white/70 opacity-75 dark:border-white/10 dark:bg-[#18211f]/70" : "border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#18211f]"}`}>
                        <span className={`grid h-12 w-12 place-items-center rounded-full ${item.tone}`}>
                          <Icon className="h-6 w-6" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#f4f0e8] px-2 py-1 text-xs font-extrabold uppercase text-[#68716c] dark:bg-[#202b28] dark:text-stone-400">{item.type}</span>
                            <span className={`rounded-full px-2 py-1 text-xs font-extrabold uppercase ${item.priority === "Critical" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200" : item.priority === "High" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200" : "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200"}`}>{item.priority}</span>
                            {read && <span className="text-xs font-bold text-[#68716c] dark:text-stone-400">Read</span>}
                          </div>
                          <h2 className="mt-3 break-words text-xl font-extrabold leading-tight text-[#202621] dark:text-stone-100">{item.title}</h2>
                          <p className="mt-2 break-words leading-relaxed text-[#4d5651] dark:text-stone-300">{item.detail}</p>
                          <p className="mt-3 text-sm font-semibold text-[#68716c] dark:text-stone-400">{item.time}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <button onClick={() => markRead(item.id)} disabled={read} className="min-h-10 rounded-md border border-[#cbd2cd] bg-white px-3 text-sm font-bold text-[#115745] disabled:text-[#9aa39e] dark:border-white/10 dark:bg-[#202b28] dark:text-emerald-200 dark:disabled:text-stone-500">
                            {read ? "Read" : "Mark Read"}
                          </button>
                          <button onClick={() => openNotification(item)} className="grid h-10 w-10 place-items-center rounded-md bg-[#115745] text-white" aria-label={`Open ${item.type}`}>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <aside className="grid h-fit gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="text-xl font-extrabold text-[#115745] dark:text-emerald-200">Alert Channels</h2>
                  <div className="mt-5 grid gap-3">
                    {[
                      ["Email digest", "Enabled"],
                      ["Shipment SMS alerts", "Enabled"],
                      ["Low stock alerts", "Immediate"],
                      ["Payment updates", "Daily"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4 rounded-md bg-[#f4f0e8] p-3 dark:bg-[#202b28]">
                        <span className="font-semibold text-[#4d5651] dark:text-stone-300">{label}</span>
                        <strong className="text-[#115745] dark:text-emerald-200">{value}</strong>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-[#e9e5dc] p-6 shadow-sm dark:border-white/10 dark:bg-[#202b28]">
                  <h2 className="mb-5 font-extrabold uppercase text-[#39433f] dark:text-stone-100">Response SLA</h2>
                  <SupplierProgress label="Critical alerts" value="18 min avg" percent="72%" />
                  <SupplierProgress label="PO reviews" value="2.4 hrs avg" percent="54%" />
                  <SupplierProgress label="Compliance tasks" value="1 day avg" percent="42%" />
                </article>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

export function NotificationStat({ icon: Icon, label, value, warning = false }) {
  return (
    <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
      <div className="flex items-center gap-4">
        <span className={`grid h-12 w-12 place-items-center rounded-full ${warning ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200" : "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200"}`}>
          <Icon className="h-6 w-6" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-[#68716c] dark:text-stone-400">{label}</span>
          <strong className="text-3xl leading-tight text-[#202621] dark:text-stone-100">{value}</strong>
        </span>
      </div>
    </article>
  );
}
