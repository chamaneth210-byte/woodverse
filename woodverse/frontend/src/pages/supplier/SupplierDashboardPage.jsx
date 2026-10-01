import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Download,
  Globe2,
  Grid3X3,
  Moon,
  RefreshCw,
  Search,
  ShoppingCart,
  Sun,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";
import { navigate } from "../../utils";
import { SupplierSidebar } from "./SupplierSidebar";
import { SupplierMetricCard, SupplierProgress } from "./shared";
import { getStoredSupplierNotifications } from "./storage.js";

export function SupplierDashboardPage({ theme, onToggleTheme }) {
  const [notice, setNotice] = useState("Inventory synchronized 12 minutes ago.");
  const [showDeliveryCalendar, setShowDeliveryCalendar] = useState(false);
  const [selectedDeliveryDay, setSelectedDeliveryDay] = useState(null);
  const deliveries = [
    { date: "Oct 25, 09:00", customer: "Arpico Interiors", material: "Mahogany", badge: "bg-[#cfe6c7] text-[#28513c]", volume: "450 m3" },
    { date: "Oct 25, 14:30", customer: "Ceylinco Homes", material: "Satinwood", badge: "bg-[#bfe9dc] text-[#195b4b]", volume: "120 m3" },
    { date: "Oct 26, 11:00", customer: "Royal Furniture", material: "Teak Grade-A", badge: "bg-[#ffd8bd] text-[#87512f]", volume: "2,100 m3" },
  ];
  const visibleDeliveries = selectedDeliveryDay ? deliveries.filter((delivery) => getCalendarDay(delivery.date) === selectedDeliveryDay) : deliveries;
  const incomingNotifications = getStoredSupplierNotifications().slice(0, 3).map((item) => ({
    icon: ClipboardList,
    tone: item.priority === "High"
      ? "bg-[#fbecd5] text-[#b06c2e]"
      : "bg-[#bcefd9] text-[#115745]",
    title: item.title,
    time: item.time,
  }));
  const notifications = [
    ...incomingNotifications,
    { icon: ShoppingCart, tone: "bg-[#bcefd9] text-[#115745]", title: "Silva Woodworks placed PO #8930 for Grade-A Teak.", time: "2 minutes ago" },
    { icon: AlertTriangle, tone: "bg-[#fbecd5] text-[#b06c2e]", title: "Shipment #LV-721 is delayed due to weather in Galle.", time: "45 minutes ago" },
    { icon: ClipboardList, tone: "bg-[#dce9f5] text-[#3f729a]", title: "Monthly Compliance Certificate for Logging Rights is now verified.", time: "3 hours ago" },
    { icon: CheckCircle2, tone: "bg-[#d6e9dd] text-[#2f6757]", title: "Payment of LKR 840,000 settled for PO #8812.", time: "Yesterday" },
  ];

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Dashboard" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/90 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/90 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search orders, materials, or shipments..." />
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
              <button onClick={() => navigate("/supplier/apps")} className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Apps">
                <Grid3X3 className="h-5 w-5" />
              </button>
              <span className="hidden h-8 w-px bg-[#cfd4cf] dark:bg-white/10 sm:block" />
              <div className="hidden text-right sm:block">
                <p className="font-extrabold leading-tight text-[#222621] dark:text-stone-100">Lumbini Timber Co.</p>
                <p className="text-sm text-[#5d675f] dark:text-stone-400">Verified Supplier</p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-full border-2 border-[#b8c7bd] bg-[linear-gradient(135deg,#f2d3ba,#7b4a30)] text-sm font-extrabold text-white dark:border-emerald-200/40">
                LT
              </div>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-8 px-6 py-9 xl:px-10">
            <div className="flex min-w-0 items-start justify-between gap-5 max-md:grid">
              <div className="min-w-0">
                <p className="text-lg text-[#2f6757] dark:text-emerald-200">Good morning, Lumbini Timber</p>
                <h1 className="mt-1 break-words text-xl leading-snug text-[#39433f] dark:text-stone-200">Here's your operational overview for today, October 24th.</h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setNotice("Reports are ready for download.")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#8b5633] bg-[#fbf8f1] px-4 font-semibold text-[#8b5633] dark:border-amber-500/60 dark:bg-[#202b28] dark:text-amber-200">
                  <Download className="h-4 w-4" />
                  Download Reports
                </button>
                <button onClick={() => setNotice("Inventory update saved for Grade-A Teak and Mahogany.")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#115745] px-4 font-semibold text-white">
                  <RefreshCw className="h-4 w-4" />
                  Update Inventory
                </button>
              </div>
            </div>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="grid grid-cols-4 gap-6 max-xl:grid-cols-2 max-sm:grid-cols-1">
              <SupplierMetricCard icon={ShoppingCart} title="New POs Today" value="12" helper="+8%" helperClass="text-[#2f8b55]" />
              <SupplierMetricCard icon={ClipboardList} title="Pending Orders" value="48" helper="Review Required" tone="bg-[#ffd9c4] text-[#915531]" helperClass="text-[#e28a1d]" />
              <SupplierMetricCard icon={Truck} title="Active Shipments" value="08" helper="In Transit" tone="bg-[#d9ecd8] text-[#2f6757]" />
              <SupplierMetricCard icon={Wallet} title="Monthly Revenue" value="LKR 4.2M" dark />
            </section>

            <section className="grid grid-cols-[minmax(0,1fr)_300px] gap-8 max-xl:grid-cols-1">
              <div className="grid gap-6">
                <article className="overflow-hidden rounded-lg border border-[#cbd2cd] bg-[#fbf8f1] shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="flex min-h-14 items-center justify-between gap-4 border-b border-[#d9d7cf] px-6 dark:border-white/10">
                    <div>
                      <h2 className="text-lg font-semibold text-[#2f6757] dark:text-emerald-200">Upcoming Deliveries</h2>
                      <p className="text-sm text-[#68716c] dark:text-stone-400">{selectedDeliveryDay ? `Showing Oct ${selectedDeliveryDay}` : "Showing all scheduled dates"}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDeliveryCalendar((visible) => !visible);
                        setNotice(showDeliveryCalendar ? "Delivery calendar closed." : "Delivery calendar opened.");
                      }}
                      className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#cbd2cd] bg-white px-3 font-semibold text-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-emerald-200"
                    >
                      <CalendarCheck className="h-4 w-4" />
                      {showDeliveryCalendar ? "Hide Calendar" : "View Calendar"}
                    </button>
                  </div>
                  {showDeliveryCalendar && (
                    <SupplierDeliveryCalendar
                      deliveries={deliveries}
                      selectedDay={selectedDeliveryDay}
                      onSelectDay={(day) => {
                        setSelectedDeliveryDay(day);
                        setNotice(day ? `Delivery calendar filtered to Oct ${day}.` : "Delivery calendar showing all scheduled dates.");
                      }}
                    />
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left">
                      <thead className="bg-white/55 text-sm text-[#39433f] dark:bg-white/5 dark:text-stone-300">
                        <tr>
                          {["Date", "Customer", "Material", "Volume", "Action"].map((head) => (
                            <th key={head} className="px-6 py-4 font-extrabold">{head}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleDeliveries.map((delivery) => (
                          <tr key={`${delivery.customer}-${delivery.date}`} className="border-t border-[#dedbd3] dark:border-white/10">
                            <td className="px-6 py-5 font-medium">{delivery.date}</td>
                            <td className="px-6 py-5 font-extrabold text-[#202621] dark:text-stone-100">{delivery.customer}</td>
                            <td className="px-6 py-5"><span className={`rounded px-2 py-1 text-[11px] font-extrabold uppercase ${delivery.badge}`}>{delivery.material}</span></td>
                            <td className="px-6 py-5 font-medium">{delivery.volume}</td>
                            <td className="px-6 py-5"><button onClick={() => setNotice(`Manifest opened for ${delivery.customer}.`)} className="font-semibold text-[#8b5633] dark:text-amber-200">Manifest</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {visibleDeliveries.length === 0 && (
                    <div className="border-t border-[#dedbd3] px-6 py-8 text-center font-semibold text-[#68716c] dark:border-white/10 dark:text-stone-400">
                      No deliveries scheduled for Oct {selectedDeliveryDay}.
                    </div>
                  )}
                  <button onClick={() => setNotice("Loaded 12 more scheduled deliveries.")} className="min-h-14 w-full border-t border-[#dedbd3] font-medium text-[#4d5651] dark:border-white/10 dark:text-stone-300">Load 12 more deliveries</button>
                </article>

                <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                  <article className="grid min-h-52 grid-cols-[116px_minmax(0,1fr)] items-center gap-7 rounded-lg border border-[#cbd2cd] bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#18211f] max-sm:grid-cols-1">
                    <div className="grid h-24 w-24 place-items-center rounded-full border-[8px] border-[#115745] text-2xl font-extrabold text-[#115745] dark:border-emerald-300 dark:text-emerald-200">75%</div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#202621] dark:text-stone-100">Inventory Capacity</h3>
                      <p className="mt-2 leading-relaxed text-[#4d5651] dark:text-stone-300">Storage Yard A is reaching full capacity (4,200/5,000 m3).</p>
                      <button onClick={() => setNotice("Yard management view opened.")} className="mt-3 inline-flex items-center gap-1 font-semibold text-[#115745] dark:text-emerald-200">Manage Yard <ArrowRight className="h-4 w-4" /></button>
                    </div>
                  </article>

                  <article className="grid min-h-52 grid-cols-[70px_minmax(0,1fr)] items-center gap-8 rounded-lg border border-[#cbd2cd] bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#18211f] max-sm:grid-cols-1">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-[#fbefe7] text-[#8b5633] dark:bg-amber-950/40 dark:text-amber-200"><TrendingUp className="h-7 w-7" /></span>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#202621] dark:text-stone-100">Teak Price Spike</h3>
                      <p className="mt-2 leading-relaxed text-[#4d5651] dark:text-stone-300">Global market prices for Grade-A Teak rose by 14% this week.</p>
                      <button onClick={() => setNotice("Market analysis opened for Grade-A Teak.")} className="mt-3 inline-flex items-center gap-1 font-semibold text-[#115745] dark:text-emerald-200">Market Analysis <ArrowRight className="h-4 w-4" /></button>
                    </div>
                  </article>
                </div>
              </div>

              <aside className="grid h-fit gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-[#2f6757] dark:text-emerald-200">Recent Notifications</h2>
                    <span className="rounded-full bg-[#d94d58] px-2 py-1 text-[10px] font-extrabold uppercase text-white">3 New</span>
                  </div>
                  <div className="grid gap-5">
                    {notifications.map((item) => {
                      const Icon = item.icon;
                      return (
                        <article key={item.title} className="grid grid-cols-[40px_minmax(0,1fr)] gap-4">
                          <span className={`grid h-10 w-10 place-items-center rounded-full ${item.tone}`}><Icon className="h-5 w-5" /></span>
                          <div className="min-w-0">
                            <h3 className="break-words font-semibold leading-snug text-[#202621] dark:text-stone-100">{item.title}</h3>
                            <p className="mt-1 text-sm text-[#68716c] dark:text-stone-400">{item.time}</p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  <button onClick={() => setNotice("All activity opened.")} className="mt-6 min-h-12 w-full border-t border-[#d9d7cf] pt-4 font-semibold text-[#2f6757] dark:border-white/10 dark:text-emerald-200">View All Activity</button>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-[#e9e5dc] p-6 shadow-sm dark:border-white/10 dark:bg-[#202b28]">
                  <h2 className="mb-5 font-extrabold uppercase text-[#39433f] dark:text-stone-100">Yard Status</h2>
                  <SupplierProgress label="Galle Main Yard" value="88% Full" percent="88%" />
                  <SupplierProgress label="Matara Transit Hub" value="32% Full" percent="32%" />
                  <div className="mt-6 border-t border-[#c7c8c1] pt-6 dark:border-white/10">
                    <h3 className="mb-4 font-extrabold uppercase text-[#39433f] dark:text-stone-100">Logistics Partners</h3>
                    <div className="flex -space-x-2">
                      {["LK", "TR", "EX"].map((initials) => (
                        <span key={initials} className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#e9e5dc] bg-white text-xs font-extrabold text-[#115745] dark:border-[#202b28] dark:bg-[#18211f] dark:text-emerald-200">{initials}</span>
                      ))}
                      <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#e9e5dc] bg-[#f5f1e8] text-sm font-bold text-[#5b655f] dark:border-[#202b28] dark:bg-[#151d1b] dark:text-stone-300">+4</span>
                    </div>
                  </div>
                </article>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

export function SupplierDeliveryCalendar({ deliveries, selectedDay, onSelectDay }) {
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  const scheduledDays = deliveries.reduce((map, delivery) => {
    const day = getCalendarDay(delivery.date);
    if (!day) return map;
    return {
      ...map,
      [day]: [...(map[day] || []), delivery],
    };
  }, {});
  const selectedDeliveries = selectedDay ? scheduledDays[selectedDay] || [] : deliveries;

  return (
    <section className="grid grid-cols-[minmax(0,1fr)_260px] gap-5 border-b border-[#dedbd3] bg-white/55 p-5 dark:border-white/10 dark:bg-[#111816]/35 max-lg:grid-cols-1">
      <div className="rounded-md border border-[#d8d4cc] bg-[#fbf8f1] p-4 dark:border-white/10 dark:bg-[#202b28]">
        <div className="mb-4 flex min-w-0 items-center justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#68716c] dark:text-stone-400">Delivery Calendar</p>
            <h3 className="text-xl font-extrabold text-[#202621] dark:text-stone-100">October 2026</h3>
          </div>
          <button
            onClick={() => onSelectDay(null)}
            className={`min-h-9 rounded-md border px-3 text-sm font-bold ${
              selectedDay
                ? "border-[#cbd2cd] bg-white text-[#115745] dark:border-white/10 dark:bg-[#18211f] dark:text-emerald-200"
                : "border-[#115745] bg-[#115745] text-white"
            }`}
          >
            All
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day} className="py-1 text-xs font-extrabold uppercase text-[#68716c] dark:text-stone-400">{day}</span>
          ))}
          {Array.from({ length: 4 }, (_, index) => (
            <span key={`blank-${index}`} />
          ))}
          {days.map((day) => {
            const events = scheduledDays[day] || [];
            const active = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => onSelectDay(day)}
                className={`relative grid min-h-12 place-items-center rounded-md border text-sm font-extrabold transition ${
                  active
                    ? "border-[#115745] bg-[#115745] text-white"
                    : events.length
                      ? "border-emerald-200 bg-emerald-50 text-[#115745] hover:border-[#115745] dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                      : "border-[#e2dfd7] bg-white text-[#39433f] hover:border-[#c0c8c2] dark:border-white/10 dark:bg-[#18211f] dark:text-stone-300"
                }`}
                title={events.length ? `${events.length} scheduled deliver${events.length === 1 ? "y" : "ies"}` : "No deliveries scheduled"}
              >
                {day}
                {events.length > 0 && <span className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${active ? "bg-white" : "bg-[#115745] dark:bg-emerald-200"}`} />}
              </button>
            );
          })}
        </div>
      </div>

      <aside className="rounded-md border border-[#d8d4cc] bg-[#fbf8f1] p-4 dark:border-white/10 dark:bg-[#202b28]">
        <h3 className="text-lg font-extrabold text-[#202621] dark:text-stone-100">
          {selectedDay ? `Oct ${selectedDay}` : "All Deliveries"}
        </h3>
        <div className="mt-4 grid gap-3">
          {selectedDeliveries.length > 0 ? selectedDeliveries.map((delivery) => (
            <article key={`${delivery.customer}-${delivery.date}`} className="rounded-md border border-[#e2dfd7] bg-white p-3 dark:border-white/10 dark:bg-[#18211f]">
              <p className="text-xs font-extrabold uppercase text-[#68716c] dark:text-stone-400">{delivery.date}</p>
              <h4 className="mt-1 break-words font-extrabold text-[#202621] dark:text-stone-100">{delivery.customer}</h4>
              <p className="mt-1 text-sm text-[#4d5651] dark:text-stone-300">{delivery.material} - {delivery.volume}</p>
            </article>
          )) : (
            <p className="rounded-md border border-dashed border-[#cbd2cd] p-4 text-sm font-semibold text-[#68716c] dark:border-white/10 dark:text-stone-400">No delivery planned for this day.</p>
          )}
        </div>
      </aside>
    </section>
  );
}

export function getCalendarDay(dateLabel) {
  return Number(dateLabel.match(/\b(\d{1,2})\b/)?.[1]);
}
