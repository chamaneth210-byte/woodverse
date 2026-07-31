import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Boxes,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  CreditCard,
  Download,
  EllipsisVertical,
  Eye,
  FileText,
  Globe2,
  Grid3X3,
  Handshake,
  Home,
  LayoutDashboard,
  LayoutGrid,
  LayoutList,
  Layers,
  Lock,
  Mail,
  MapPin,
  Moon,
  Navigation,
  PackageCheck,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  ShoppingCart,
  Store,
  Sun,
  Timer,
  TrendingUp,
  Truck,
  UserPlus,
  Warehouse,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";
import { navigate } from "../utils";

function publishAdminEvent(source, title, message, priority = "Normal") {
  try {
    const key = "woodverse-admin-notifications";
    const current = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([{ id: `EV-${Date.now()}`, audience: "Admin", type: source, source: `${source} Portal`, title, message, detail: message, priority, time: "Just now", createdAt: new Date().toISOString() }, ...current]));
  } catch {}
}

const SUPPLIER_TRANSLATIONS = {
  Sinhala: {
    "Supplier Portal": "සැපයුම්කරු ද්වාරය",
    Dashboard: "පාලන පුවරුව",
    "Purchase Orders": "මිලදී ගැනීම් ඇණවුම්",
    Materials: "ද්‍රව්‍ය",
    Shipments: "නැව්ගත කිරීම්",
    Vendors: "වෙළෙන්දන්",
    Notifications: "දැනුම්දීම්",
    Profile: "පැතිකඩ",
    Support: "සහාය",
    Settings: "සැකසුම්",
    "New Shipment": "නව නැව්ගත කිරීම",
    "Search settings...": "සැකසුම් සොයන්න...",
    "Language selector opened.": "භාෂා තේරීම විවෘත කරන ලදී.",
    Apps: "යෙදුම්",
    "Switch to light mode": "ආලෝක ප්‍රකාරයට මාරු වන්න",
    "Switch to dark mode": "අඳුරු ප්‍රකාරයට මාරු වන්න",
    "Settings loaded.": "සැකසුම් පූරණය විය.",
    "Supplier settings saved.": "සැපයුම්කරු සැකසුම් සුරකින ලදී.",
    "Settings reset to defaults.": "සැකසුම් පෙරනිමියට නැවත සකසන ලදී.",
    "Settings export downloaded.": "සැකසුම් අපනයනය බාගත කරන ලදී.",
    "Preference updated.": "කැමතිකම යාවත්කාලීන කරන ලදී.",
    "API key copied.": "API යතුර පිටපත් කරන ලදී.",
    "API key copy unavailable.": "API යතුර පිටපත් කළ නොහැක.",
    "Password reset": "මුරපද නැවත සැකසීම",
    "Sent": "යවන ලදී",
    "Not sent": "යවා නැත",
    "Active sessions": "සක්‍රිය සැසි",
    "Copy API Key": "API යතුර පිටපත් කරන්න",
    "Sinhala language enabled.": "සිංහල භාෂාව සක්‍රිය කරන ලදී.",
    "English language enabled.": "ඉංග්‍රීසි භාෂාව සක්‍රිය කරන ලදී.",
    "Tamil language enabled.": "දෙමළ භාෂාව සක්‍රිය කරන ලදී.",
    "Configure supplier portal preferences, notifications, automation, security, and connected API access.": "සැපයුම්කරු ද්වාර කැමතිකම්, දැනුම්දීම්, ස්වයංක්‍රීයකරණය, ආරක්ෂාව සහ API ප්‍රවේශය සකසන්න.",
    "Security Status": "ආරක්ෂක තත්ත්වය",
    Strong: "ශක්තිමත්",
    Basic: "මූලික",
    "2FA enabled": "2FA සක්‍රියයි",
    "Enable 2FA recommended": "2FA සක්‍රිය කිරීම නිර්දේශිතයි",
    "Portal Preferences": "ද්වාර කැමතිකම්",
    Language: "භාෂාව",
    Timezone: "කාල කලාපය",
    "Default page": "පෙරනිමි පිටුව",
    English: "ඉංග්‍රීසි",
    Sinhala: "සිංහල",
    Tamil: "දෙමළ",
    "Asia/Colombo": "ආසියා/කොළඹ",
    UTC: "UTC",
    "Asia/Dubai": "ආසියා/ඩුබායි",
    Reset: "නැවත සකසන්න",
    "Save Settings": "සැකසුම් සුරකින්න",
    "Auto-assign shipments": "නැව්ගත කිරීම් ස්වයංක්‍රීයව පවරන්න",
    "Create shipment drafts when purchase orders are accepted.": "මිලදී ගැනීම් ඇණවුම් පිළිගත් විට නැව්ගත කිරීමේ කෙටුම්පත් සාදන්න.",
    "Low stock alerts": "අඩු තොග අනතුරු ඇඟවීම්",
    "Notify operations before inventory reaches reorder threshold.": "තොගය නැවත ඇණවුම් සීමාවට ළඟාවීමට පෙර මෙහෙයුම් කණ්ඩායමට දැනුම් දෙන්න.",
    "Email digest": "ඊමේල් සාරාංශය",
    "Send a daily summary for orders, materials, payouts, and compliance.": "ඇණවුම්, ද්‍රව්‍ය, ගෙවීම් සහ අනුකූලතාව සඳහා දෛනික සාරාංශයක් යවන්න.",
    "Shipment SMS alerts": "නැව්ගත කිරීමේ SMS දැනුම්දීම්",
    "Send SMS when shipments are delayed or rerouted.": "නැව්ගත කිරීම් ප්‍රමාද වූ විට හෝ මාර්ගය වෙනස් වූ විට SMS යවන්න.",
    Security: "ආරක්ෂාව",
    "Two-factor auth": "දෙපියවර සත්‍යාපනය",
    "Require verification for payout and profile changes.": "ගෙවීම් සහ පැතිකඩ වෙනස්කම් සඳහා සත්‍යාපනය අවශ්‍ය කරන්න.",
    "Send Password Reset": "මුරපද නැවත සැකසීම යවන්න",
    "Sign Out Other Sessions": "අනෙකුත් සැසිවලින් ඉවත් කරන්න",
    "Password reset link sent to operations@lumbinitimber.lk.": "මුරපද නැවත සැකසුම් සබැඳිය operations@lumbinitimber.lk වෙත යවන ලදී.",
    "All other supplier sessions signed out.": "අනෙකුත් සියලු සැපයුම්කරු සැසි ඉවත් කරන ලදී.",
    "API Access": "API ප්‍රවේශය",
    "Socket URL": "Socket URL",
    "API key": "API යතුර",
    "Hide API Key": "API යතුර සඟවන්න",
    "Show API Key": "API යතුර පෙන්වන්න",
    "Export Settings": "සැකසුම් අපනයනය කරන්න",
  },
};

function supplierText(language, text) {
  return SUPPLIER_TRANSLATIONS[language]?.[text] || text;
}

function getStoredSupplierLanguage() {
  try {
    return JSON.parse(localStorage.getItem("woodverse-supplier-settings"))?.language || "English";
  } catch {
    return "English";
  }
}

function getStoredSupplierNotifications() {
  try {
    return JSON.parse(localStorage.getItem("woodverse-supplier-notifications") || "null") || [];
  } catch {
    return [];
  }
}

function getStoredSupplierIncomingRequests() {
  try {
    return JSON.parse(localStorage.getItem("woodverse-supplier-incoming-requests") || "null") || [];
  } catch {
    return [];
  }
}

function notifySupplierLanguageChange(language) {
  window.dispatchEvent(new CustomEvent("woodverse-supplier-language-change", { detail: language }));
}

function useSupplierLanguage() {
  const [language, setLanguage] = useState(getStoredSupplierLanguage);

  useEffect(() => {
    const updateLanguage = (event) => setLanguage(event.detail || getStoredSupplierLanguage());
    const updateFromStorage = () => setLanguage(getStoredSupplierLanguage());
    window.addEventListener("woodverse-supplier-language-change", updateLanguage);
    window.addEventListener("storage", updateFromStorage);
    return () => {
      window.removeEventListener("woodverse-supplier-language-change", updateLanguage);
      window.removeEventListener("storage", updateFromStorage);
    };
  }, []);

  return language;
}

function SupplierSidebar({ active, onUnavailable }) {
  const language = useSupplierLanguage();
  const t = (text) => supplierText(language, text);
  const navItems = [
    [LayoutDashboard, "Dashboard", "/supplier"],
    [ClipboardList, "Purchase Orders", "/supplier/purchase-orders/po-8921"],
    [Boxes, "Materials", "/supplier/materials"],
    [Truck, "Shipments", "/supplier/shipments"],
    [Handshake, "Vendors", "/supplier/vendors"],
    [Bell, "Notifications", "/supplier/notifications"],
    [UserRound, "Profile", "/supplier/profile"],
  ];

  return (
    <aside className="relative min-h-screen border-r border-[#5b513f] bg-[#332a1a] text-[#e3d8c8] lg:sticky lg:top-0 lg:h-screen">
      <div className="px-5 pb-8 pt-4">
        <button onClick={() => navigate("/supplier")} className="text-left">
          <BrandLogo
            imageClassName="h-10 w-10"
            textClassName="text-[18px] text-[#6ff4db]"
            subtitle={t("Supplier Portal")}
            subtitleClassName="text-[13px] font-bold uppercase tracking-[0.22em] text-[#d8c9b5]"
          />
        </button>
      </div>

      <nav className="grid gap-2 px-1 text-[16px] font-extrabold">
        {navItems.map(([Icon, label, href]) => {
          const selected = active === label;
          return (
            <button
              key={label}
              onClick={() => (href ? navigate(href) : onUnavailable?.(label))}
              aria-current={selected ? "page" : undefined}
              className={`relative flex min-h-12 min-w-0 items-center gap-4 px-6 text-left transition ${
                selected
                  ? "bg-[#2d2616] text-[#6ff4db] after:absolute after:right-0 after:top-0 after:h-full after:w-1 after:bg-[#48d6ba]"
                  : "text-[#d8c9b5] hover:bg-[#2d2616] hover:text-[#6ff4db]"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2.2} />
              <span className="min-w-0 break-words">{t(label)}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[#5b513f] px-3 py-4 lg:absolute lg:bottom-0 lg:left-0 lg:right-0">
        <button
          onClick={() => navigate("/supplier/shipments/new")}
          className="mb-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-md bg-[#00614d] px-4 text-[16px] font-extrabold text-white shadow-sm transition hover:bg-[#08715c]"
        >
          <Plus className="h-5 w-5" />
          {t("New Shipment")}
        </button>
        <button onClick={() => navigate("/supplier/support")} className={`flex min-h-10 items-center gap-3 px-3 text-[15px] transition hover:text-[#6ff4db] ${active === "Support" ? "text-[#6ff4db]" : "text-[#c8bba8]"}`}>
          <CircleHelp className="h-4 w-4" />
          {t("Support")}
        </button>
        <button onClick={() => navigate("/supplier/settings")} className={`flex min-h-10 items-center gap-3 px-3 text-[15px] transition hover:text-[#6ff4db] ${active === "Settings" ? "text-[#6ff4db]" : "text-[#c8bba8]"}`}>
          <Settings className="h-4 w-4" />
          {t("Settings")}
        </button>
      </div>
    </aside>
  );
}

function SupplierDashboardPage({ theme, onToggleTheme }) {
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
        <SupplierSidebar active="Dashboard" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} onNewShipment={() => setNotice("New shipment draft opened.")} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-10">
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

function SupplierDeliveryCalendar({ deliveries, selectedDay, onSelectDay }) {
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

function getCalendarDay(dateLabel) {
  return Number(dateLabel.match(/\b(\d{1,2})\b/)?.[1]);
}

function SupplierPurchaseOrderPage({ theme, onToggleTheme }) {
  const [orderStatus, setOrderStatus] = useState("In Review");
  const [notice, setNotice] = useState("Purchase order PO-8921 is ready for review.");
  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState([
    {
      author: "Sarah Wickrama (Inventory)",
      time: "Oct 24, 10:15 AM",
      text: "Checked current stock levels at Gampaha depot. We can fulfill the full 150m3 by the requested date without affecting other POs.",
    },
  ]);
  const timeline = [
    { label: "Order Received", detail: "Oct 24, 09:42 AM", icon: CheckCircle2, done: true },
    { label: "Accepted", detail: orderStatus === "Accepted" || orderStatus === "Processing" ? "Confirmed" : "Pending", icon: ClipboardList, done: orderStatus === "Accepted" || orderStatus === "Processing" },
    { label: "Processing", detail: orderStatus === "Processing" ? "Active" : "", icon: Building2, done: orderStatus === "Processing" },
    { label: "Shipped", detail: "", icon: Truck, done: false },
  ];

  const postNote = () => {
    if (!noteInput.trim()) return;
    setNotes((items) => [
      ...items,
      {
        author: "John Doe (Logistics Mgr)",
        time: "Just now",
        text: noteInput.trim(),
      },
    ]);
    setNoteInput("");
    setNotice("Internal note posted to PO-8921.");
  };

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Purchase Orders" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} onNewShipment={() => setNotice("Shipment draft created for PO-8921.")} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-8">
            <div className="hidden min-w-0 items-center gap-2 text-sm font-medium text-[#39433f] dark:text-stone-300 md:flex">
              <button onClick={() => navigate("/supplier")} className="hover:text-[#115745] dark:hover:text-emerald-200">Purchase Orders</button>
              <ChevronRight className="h-4 w-4 shrink-0" />
              <strong className="text-[#202621] dark:text-stone-100">PO-8921</strong>
            </div>
            <label className="ml-auto flex h-11 w-full max-w-[260px] min-w-0 items-center rounded-full bg-[#f4f0e8] px-3 text-[#7a8480] dark:bg-[#202b28] dark:text-stone-400 max-md:max-w-none">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search orders..." />
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
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-8 px-6 py-9 xl:px-8">
            <section className="flex min-w-0 items-start justify-between gap-5 max-md:grid">
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <h1 className="break-words text-3xl font-extrabold leading-tight text-[#202621] dark:text-stone-100">Order PO-8921</h1>
                  <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${orderStatus === "Rejected" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200" : orderStatus === "Accepted" || orderStatus === "Processing" ? "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200" : "bg-[#ffd4b5] text-[#87512f] dark:bg-amber-950/50 dark:text-amber-200"}`}>{orderStatus}</span>
                </div>
                <p className="mt-2 text-lg text-[#4d5651] dark:text-stone-300">Created on Oct 24, 2023 - 09:42 AM</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => { setOrderStatus("Rejected"); setNotice("PO-8921 has been marked for rejection review."); }} className="min-h-11 rounded-md border border-[#9ca39e] bg-white px-5 font-bold text-[#39433f] dark:border-white/15 dark:bg-[#202b28] dark:text-stone-100">Reject Order</button>
                <button onClick={() => { setOrderStatus("Accepted"); setNotice("PO-8921 accepted. Create shipment when stock is allocated."); }} className="min-h-11 rounded-md bg-[#115745] px-6 font-bold text-white">Accept Order</button>
              </div>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="rounded-lg border border-[#cbd2cd] bg-[#fbf8f1] p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
              <div className="relative grid grid-cols-4 gap-4 max-sm:grid-cols-2">
                <span className="absolute left-[12%] right-[12%] top-5 hidden h-px bg-[#c8d1ca] dark:bg-white/10 sm:block" />
                {timeline.map((step) => {
                  const Icon = step.icon;
                  return (
                    <article key={step.label} className="relative z-10 grid justify-items-center gap-2 text-center">
                      <span className={`grid h-11 w-11 place-items-center rounded-full border-4 ${step.done ? "border-[#c2d5cc] bg-[#2f8b55] text-white dark:border-emerald-900 dark:bg-emerald-500" : "border-[#eee9df] bg-[#e5e2da] text-[#747d78] dark:border-[#18211f] dark:bg-[#2a3532] dark:text-stone-400"}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <strong className={`text-sm ${step.done ? "text-[#115745] dark:text-emerald-200" : "text-[#717a75] dark:text-stone-400"}`}>{step.label}</strong>
                      {step.detail && <span className="text-xs text-[#68716c] dark:text-stone-400">{step.detail}</span>}
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-[minmax(0,1fr)_304px] gap-6 max-xl:grid-cols-1">
              <div className="grid gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="mb-6 flex items-center gap-2 border-b border-[#dedbd3] pb-5 dark:border-white/10">
                    <Layers className="h-5 w-5 text-[#115745] dark:text-emerald-200" />
                    <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">Timber Specifications</h2>
                  </div>

                  <div className="grid grid-cols-[96px_minmax(0,1fr)_130px_130px] gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
                    <img className="h-24 w-24 rounded-md border border-[#d8d7d0] object-cover dark:border-white/10" src="/assets/product-walnut-task-table.png" alt="Grade-A teak grain" />
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold uppercase tracking-wide text-[#4d5651] dark:text-stone-400">Wood Type & Grade</p>
                      <h3 className="mt-2 text-3xl font-extrabold leading-tight text-[#202621] dark:text-stone-100">Grade-A Teak</h3>
                      <p className="mt-2 leading-relaxed text-[#4d5651] dark:text-stone-300">FSC Certified, Sustainably Harvested</p>
                    </div>
                    <SpecBox label="Total Volume" value="150 m3" />
                    <SpecBox label="Moisture Content" value="< 12%" />
                  </div>

                  <div className="mt-6 overflow-hidden rounded-md border border-[#cbd2cd] dark:border-white/10">
                    <div className="grid grid-cols-[1.2fr_.7fr_.8fr_.8fr] bg-[#e9e5dc] text-sm font-extrabold uppercase text-[#4d5651] dark:bg-[#202b28] dark:text-stone-300 max-sm:hidden">
                      <span className="px-4 py-4">Description</span>
                      <span className="px-4 py-4">Dimensions (cm)</span>
                      <span className="px-4 py-4 text-right">Unit Price</span>
                      <span className="px-4 py-4 text-right">Subtotal</span>
                    </div>
                    <div className="grid grid-cols-[1.2fr_.7fr_.8fr_.8fr] items-center bg-white text-lg dark:bg-[#18211f] max-sm:grid-cols-1">
                      <span className="px-4 py-6 font-medium text-[#202621] dark:text-stone-100">Raw Teak Planks (Standard)</span>
                      <span className="px-4 py-6">240 x 15 x 5</span>
                      <span className="px-4 py-6 text-right max-sm:text-left">LKR 42,500 / m3</span>
                      <strong className="px-4 py-6 text-right text-[#202621] dark:text-stone-100 max-sm:text-left">LKR 6,375,000</strong>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 bg-[#f1eee7] px-4 py-7 dark:bg-[#202b28]">
                      <strong className="justify-self-end text-lg dark:text-stone-200">Grand Total</strong>
                      <strong className="text-right text-2xl leading-tight text-[#115745] dark:text-emerald-200">LKR<br />6,375,000</strong>
                    </div>
                  </div>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#115745] dark:text-emerald-200" />
                      <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">Internal Notes</h2>
                    </div>
                    <button onClick={() => setNotice("Note composer focused for PO-8921.")} className="font-semibold text-[#115745] dark:text-emerald-200">Add Note</button>
                  </div>
                  <div className="grid gap-4">
                    {notes.map((note, index) => (
                      <article key={`${note.author}-${index}`} className="border-l-4 border-[#115745] bg-[#f4f0e8] p-5 dark:bg-[#202b28]">
                        <div className="flex justify-between gap-4 max-sm:grid">
                          <strong className="text-[#202621] dark:text-stone-100">{note.author}</strong>
                          <span className="text-sm text-[#68716c] dark:text-stone-400">{note.time}</span>
                        </div>
                        <p className="mt-3 leading-relaxed text-[#4d5651] dark:text-stone-300">{note.text}</p>
                      </article>
                    ))}
                    <div className="rounded-md border border-[#cbd2cd] bg-white p-4 dark:border-white/10 dark:bg-[#111816]">
                      <textarea value={noteInput} onChange={(event) => setNoteInput(event.target.value)} rows={3} className="w-full resize-none bg-transparent text-[#39433f] outline-none placeholder:text-[#8c958f] dark:text-stone-100 dark:placeholder:text-stone-500" placeholder="Write a note to your team..." />
                      <div className="mt-3 flex justify-end">
                        <button onClick={postNote} className="min-h-9 rounded-md bg-[#115745] px-4 text-sm font-bold text-white">Post Note</button>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <aside className="grid h-fit gap-6">
                <OrderSideCard icon={CalendarCheck} title="Delivery Schedule">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#4d5651] dark:text-stone-400">Required Delivery Date</p>
                  <div className="mt-3 flex items-center gap-2 text-[#115745] dark:text-emerald-200">
                    <CalendarCheck className="h-5 w-5" />
                    <strong className="text-3xl leading-tight">Nov 15, 2023</strong>
                  </div>
                  <p className="mt-2 text-sm text-[#d58a1b]">21 days remaining</p>
                  <div className="mt-6 border-t border-[#dedbd3] pt-5 dark:border-white/10">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-[#4d5651] dark:text-stone-400">Delivery Location</p>
                    <div className="mt-3 grid grid-cols-[22px_minmax(0,1fr)] gap-2">
                      <MapPin className="h-5 w-5 text-[#68716c] dark:text-stone-400" />
                      <p className="leading-relaxed"><strong className="block text-[#202621] dark:text-stone-100">Manufacturing Hub B</strong>No. 45, Industrial Zone Phase 2, Kandy Road, Malwana, Sri Lanka</p>
                    </div>
                  </div>
                </OrderSideCard>

                <OrderSideCard icon={Building2} title="Customer Details">
                  <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-md bg-[#ffd8bd] text-xl font-extrabold text-[#202621]">S</span>
                    <div>
                      <strong className="block text-[#202621] dark:text-stone-100">Silva Woodworks PLC</strong>
                      <span className="text-xs uppercase text-[#68716c] dark:text-stone-400">Customer ID: CUST-0492</span>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 border-t border-[#dedbd3] pt-5 text-sm dark:border-white/10">
                    <ContactRow icon={UserRound} text="Amara Silva (Procurement)" />
                    <ContactRow icon={Mail} text="amara@silvawoodworks.lk" />
                    <ContactRow icon={Phone} text="+94 11 234 5678" />
                  </div>
                </OrderSideCard>

                <button onClick={() => { setOrderStatus("Processing"); setNotice("PO-8921 moved to processing."); }} className="flex min-h-14 items-center justify-between gap-4 rounded-lg border border-[#cbd2cd] bg-white px-5 font-extrabold text-[#202621] shadow-sm dark:border-white/10 dark:bg-[#18211f] dark:text-stone-100">
                  <span className="inline-flex items-center gap-3"><FileText className="h-5 w-5 text-[#115745] dark:text-emerald-200" /> Mark as Processing</span>
                  <ChevronRight className="h-5 w-5 text-[#68716c]" />
                </button>
                <button onClick={() => setNotice("Shipment draft created for PO-8921.")} className="flex min-h-14 items-center justify-between gap-4 rounded-lg bg-[#115745] px-5 font-extrabold text-white shadow-soft">
                  <span className="inline-flex items-center gap-3"><Truck className="h-5 w-5" /> Create Shipment</span>
                  <Plus className="h-5 w-5" />
                </button>
                <button onClick={() => { setOrderStatus("Rejected"); setNotice("Cancellation request prepared for PO-8921."); }} className="inline-flex min-h-12 items-center justify-center gap-2 font-bold text-[#d94d58]">
                  <X className="h-5 w-5" />
                  Request Cancellation
                </button>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

const VENDOR_MESSAGE_SEEDS = {
  "Lanka Teak Estates": [
    { id: "lt-1", sender: "vendor", text: "Grade-A teak allocation is ready for your next PO.", time: "09:42 AM" },
  ],
  "Heritage Brassworks": [
    { id: "hb-1", sender: "vendor", text: "Copper inlay samples can ship with the next hardware batch.", time: "10:15 AM" },
  ],
  "EcoGloss Finishes": [
    { id: "eg-1", sender: "vendor", text: "We are updating compliance documents before accepting new orders.", time: "Yesterday" },
  ],
  "Royal Jackwood Supplies": [
    { id: "rj-1", sender: "vendor", text: "Jack wood stock is available from the Galle yard.", time: "08:30 AM" },
  ],
};

function SupplierVendorsPage({ theme, onToggleTheme }) {
  const [notice, setNotice] = useState("Vendor network loaded with 42 active marketplace partners.");
  const [showMap, setShowMap] = useState(false);
  const [mapRegion, setMapRegion] = useState("Sri Lanka timber suppliers");
  const [activeMessageVendor, setActiveMessageVendor] = useState(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [vendorMessages, setVendorMessages] = useState(VENDOR_MESSAGE_SEEDS);
  const [socketClient, setSocketClient] = useState(null);
  const [socketStatus, setSocketStatus] = useState("Connecting");
  const [activePoVendor, setActivePoVendor] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const vendorsList = [
    {
      name: "Lanka Teak Estates",
      location: "Colombo, LK",
      email: "saman.p@lankateak.lk",
      phone: "+94 11 234 5678",
      materials: ["Teak", "Mahogany", "Nedun"],
      status: "Preferred",
      statusClass: "bg-[#3f835d] text-white",
      initials: "LT",
    },
    {
      name: "Heritage Brassworks",
      location: "Moratuwa, LK",
      email: "orders@heritagebrass.com",
      phone: "+94 11 888 2233",
      materials: ["Brass Hardware", "Copper Inlays"],
      status: "Active",
      statusClass: "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200",
      initials: "HB",
    },
    {
      name: "EcoGloss Finishes",
      location: "Kandy, LK",
      email: "hello@ecogloss.com",
      phone: "+94 81 555 4444",
      materials: ["Varnish", "Natural Oils"],
      status: "Inactive",
      statusClass: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200",
      initials: "EG",
    },
    {
      name: "Royal Jackwood Supplies",
      location: "Galle, LK",
      email: "contact@royaljackwood.lk",
      phone: "+94 91 111 2222",
      materials: ["Jack Wood", "Mara Wood"],
      status: "Preferred",
      statusClass: "bg-[#3f835d] text-white",
      initials: "RJ",
    },
  ];
  const activeMessages = activeMessageVendor ? vendorMessages[activeMessageVendor.name] || [] : [];
  const nextPoNumber = `PO-${String(8931 + purchaseOrders.length).padStart(4, "0")}`;

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";
    const socket = io(socketUrl, {
      autoConnect: true,
      reconnectionAttempts: 3,
      transports: ["websocket", "polling"],
    });

    const handleConnect = () => {
      setSocketStatus("Connected");
      socket.emit("vendor:join", { room: "supplier-vendor-messages", supplier: "Lumbini Timber Co." });
    };
    const handleDisconnect = () => setSocketStatus("Offline");
    const handleConnectError = () => setSocketStatus("Offline");
    const handleIncomingMessage = (message) => {
      if (!message?.vendor || !message?.text) {
        return;
      }
      setVendorMessages((threads) => ({
        ...threads,
        [message.vendor]: [
          ...(threads[message.vendor] || []),
          {
            id: message.id || `socket-${Date.now()}`,
            sender: message.sender || "vendor",
            text: message.text,
            time: message.time || formatMessageTime(new Date()),
          },
        ],
      }));
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("vendor:message", handleIncomingMessage);
    setSocketClient(socket);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("vendor:message", handleIncomingMessage);
      socket.disconnect();
    };
  }, []);

  const openVendorMessages = (vendor) => {
    setActiveMessageVendor(vendor);
    setMessageDraft("");
    setNotice(`Socket.IO message thread opened for ${vendor.name}.`);
    socketClient?.emit("vendor:thread:open", { vendor: vendor.name, supplier: "Lumbini Timber Co." });
  };

  const sendVendorMessage = (event) => {
    event.preventDefault();
    const text = messageDraft.trim();
    if (!text || !activeMessageVendor) {
      return;
    }
    const message = {
      id: `msg-${Date.now()}`,
      vendor: activeMessageVendor.name,
      sender: "supplier",
      text,
      time: formatMessageTime(new Date()),
    };
    setVendorMessages((threads) => ({
      ...threads,
      [activeMessageVendor.name]: [...(threads[activeMessageVendor.name] || []), message],
    }));
    socketClient?.emit("vendor:message:send", {
      room: "supplier-vendor-messages",
      supplier: "Lumbini Timber Co.",
      vendor: activeMessageVendor.name,
      text,
      sentAt: new Date().toISOString(),
    });
    setMessageDraft("");
    setNotice(socketClient?.connected ? `Message sent to ${activeMessageVendor.name}.` : `Message queued locally for ${activeMessageVendor.name}.`);
  };

  const openPurchaseOrderDraft = (vendor) => {
    setActivePoVendor(vendor);
    setActiveMessageVendor(null);
    setNotice(`Purchase order draft opened for ${vendor.name}.`);
  };

  const createPurchaseOrder = (event) => {
    event.preventDefault();
    if (!activePoVendor) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    const quantity = Number(formData.get("quantity"));
    const unitPrice = Number(formData.get("unitPrice"));
    const po = {
      id: formData.get("poNumber"),
      vendor: activePoVendor.name,
      material: formData.get("material"),
      quantity,
      unitPrice,
      total: quantity * unitPrice,
      deliveryDate: formData.get("deliveryDate"),
      destination: formData.get("destination").trim(),
      notes: formData.get("notes").trim(),
      status: "Draft",
      createdAt: formatMessageTime(new Date()),
    };
    setPurchaseOrders((orders) => [po, ...orders]);
    setVendorMessages((threads) => ({
      ...threads,
      [activePoVendor.name]: [
        ...(threads[activePoVendor.name] || []),
        {
          id: `po-message-${Date.now()}`,
          sender: "supplier",
          text: `${po.id} created for ${po.quantity} units of ${po.material}.`,
          time: po.createdAt,
        },
      ],
    }));
    socketClient?.emit("vendor:message:send", {
      room: "supplier-vendor-messages",
      supplier: "Lumbini Timber Co.",
      vendor: activePoVendor.name,
      text: `${po.id} purchase order draft created for ${po.material}.`,
      sentAt: new Date().toISOString(),
    });
    setNotice(`${po.id} created for ${activePoVendor.name}.`);
    setActivePoVendor(null);
  };

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Vendors" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} onNewShipment={() => setNotice("New shipment draft opened from Vendors.")} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search vendors, materials, or regions..." />
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
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-7 px-6 py-9 xl:px-10">
            <section className="grid grid-cols-[minmax(0,1fr)_auto] gap-6 max-lg:grid-cols-1">
              <div className="min-w-0">
                <p className="mb-2 text-sm font-semibold text-[#4d5651] dark:text-stone-400">Dashboard <ChevronRight className="inline h-4 w-4" /> <strong className="text-[#115745] dark:text-emerald-200">Vendor Directory</strong></p>
                <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">Vendor Directory</h1>
                <p className="mt-2 max-w-3xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">Manage your supply chain network, track material availability, and maintain vendor relationships for artisanal wood production.</p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <button onClick={() => setNotice("Vendor CSV export started.")} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-[#e3ded5] px-5 font-bold text-[#115745] dark:bg-[#202b28] dark:text-emerald-200">
                  <Download className="h-5 w-5" />
                  Export CSV
                </button>
                <button onClick={() => setNotice("Vendor onboarding form opened.")} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-[#115745] px-5 font-bold text-white shadow-sm">
                  <UserPlus className="h-5 w-5" />
                  Onboard Vendor
                </button>
              </div>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="grid grid-cols-[minmax(0,1fr)_220px] gap-6 max-lg:grid-cols-1">
              <div className="grid grid-cols-3 gap-4 rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f] max-md:grid-cols-1">
                <FilterSelect label="Filter by Material" value="All Timber & Hardware" />
                <FilterSelect label="Supplier Status" value="All" segmented />
                <FilterSelect label="Location" value="All Regions" icon={MapPin} />
              </div>
              <article className="rounded-lg bg-[#2f6757] p-6 text-white shadow-soft">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/60">Network Strength</p>
                <strong className="mt-4 block text-3xl">42 Suppliers</strong>
                <p className="mt-5 text-sm text-white/75">12 Preferred Partners</p>
              </article>
            </section>

            <section className="overflow-hidden rounded-lg border border-[#cbd2cd] bg-white shadow-sm dark:border-white/10 dark:bg-[#18211f]">
              <div className="grid grid-cols-[1.2fr_1.35fr_1.35fr_.8fr_1fr] bg-[#e9e5dc] text-sm font-extrabold uppercase tracking-wide text-[#39433f] dark:bg-[#202b28] dark:text-stone-300 max-lg:hidden">
                {["Supplier & Info", "Contact Details", "Materials Supplied", "Status", "Actions"].map((heading) => (
                  <span key={heading} className="px-6 py-5">{heading}</span>
                ))}
              </div>
              <div className="divide-y divide-[#e2dfd7] dark:divide-white/10">
                {vendorsList.map((vendor) => (
                  <article key={vendor.name} className="grid grid-cols-[1.2fr_1.35fr_1.35fr_.8fr_1fr] items-center gap-4 px-6 py-5 max-lg:grid-cols-1">
                    <div className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-md bg-[#e9e5dc] text-sm font-extrabold text-[#115745] dark:bg-[#202b28] dark:text-emerald-200">{vendor.initials}</span>
                      <div className="min-w-0">
                        <h2 className="break-words text-lg font-extrabold leading-tight text-[#115745] dark:text-emerald-200">{vendor.name}</h2>
                        <p className="mt-1 flex items-center gap-1 text-sm text-[#4d5651] dark:text-stone-400"><MapPin className="h-3.5 w-3.5" /> {vendor.location}</p>
                      </div>
                    </div>
                    <div className="min-w-0 text-[#202621] dark:text-stone-200">
                      <p className="break-words">{vendor.email}</p>
                      <p className="mt-1 text-sm text-[#68716c] dark:text-stone-400">{vendor.phone}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {vendor.materials.map((material) => (
                        <span key={material} className="rounded bg-[#d8eccf] px-2 py-1 text-xs font-extrabold uppercase text-[#28513c] dark:bg-emerald-950/40 dark:text-emerald-200">{material}</span>
                      ))}
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-sm font-extrabold ${vendor.statusClass}`}>{vendor.status}</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setNotice(`${vendor.name} profile opened.`)} className="grid h-9 w-9 place-items-center rounded-md text-[#115745] hover:bg-[#f4f0e8] dark:text-emerald-200 dark:hover:bg-[#202b28]" aria-label={`View ${vendor.name}`}>
                        <Eye className="h-5 w-5" />
                      </button>
                      <button onClick={() => openVendorMessages(vendor)} className="grid h-9 w-9 place-items-center rounded-md text-[#115745] hover:bg-[#f4f0e8] dark:text-emerald-200 dark:hover:bg-[#202b28]" aria-label={`Message ${vendor.name}`}>
                        <Send className="h-5 w-5" />
                      </button>
                      <button onClick={() => openPurchaseOrderDraft(vendor)} disabled={vendor.status === "Inactive"} className="min-h-11 rounded-md bg-[#8b5633] px-4 text-sm font-extrabold text-white disabled:bg-[#aeb8b1] disabled:text-[#52605a]">
                        Create PO
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="flex min-w-0 items-center justify-between gap-4 border-t border-[#e2dfd7] px-6 py-4 text-sm dark:border-white/10 max-sm:flex-col max-sm:items-start">
                <p>Showing 1-4 of 42 suppliers</p>
                <div className="flex gap-2">
                  {["1", "2", "3", "...", "11"].map((page, index) => (
                    <button key={`${page}-${index}`} onClick={() => setNotice(`Supplier directory page ${page} opened.`)} className={`grid h-9 min-w-9 place-items-center rounded-md px-2 font-bold ${index === 0 ? "bg-[#115745] text-white" : "border border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#202b28]"}`}>{page}</button>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-[.9fr_1.1fr] gap-6 max-lg:grid-cols-1">
              <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                <div className="mb-5 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-[#115745] dark:text-emerald-200" />
                  <h2 className="text-xl font-semibold text-[#115745] dark:text-emerald-200">Pending Onboarding</h2>
                </div>
                <div className="grid gap-4">
                  {[
                    ["Southern Hardwoods", "Vetting stage: Compliance", "border-[#e7a12a]"],
                    ["Fine Grain Textiles", "Vetting stage: Site Visit", "border-sky-500"],
                  ].map(([name, detail, border]) => (
                    <article key={name} className={`rounded-md border-l-4 ${border} bg-[#fbf8f1] p-4 dark:bg-[#202b28]`}>
                      <div className="flex justify-between gap-4">
                        <span>
                          <strong className="block text-[#202621] dark:text-stone-100">{name}</strong>
                          <span className="text-sm text-[#68716c] dark:text-stone-400">{detail}</span>
                        </span>
                        <button onClick={() => setNotice(`${name} onboarding review opened.`)} className="font-bold text-[#115745] dark:text-emerald-200">Review</button>
                      </div>
                    </article>
                  ))}
                </div>
              </article>
              <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-[#115745] dark:text-emerald-200">Regional Distribution</h2>
                  <button
                    onClick={() => {
                      setShowMap((visible) => !visible);
                      setNotice(showMap ? "Google vendor map minimized." : "Google vendor map opened.");
                    }}
                    className="font-bold text-[#115745] dark:text-emerald-200"
                  >
                    {showMap ? "Hide Map" : "View Map"}
                  </button>
                </div>
                <GoogleVendorMap expanded={showMap} selectedRegion={mapRegion} onSelectRegion={(region) => {
                  setMapRegion(region);
                  setShowMap(true);
                  setNotice(`Google map centered on ${region}.`);
                }} />
                <div className="mt-6 grid grid-cols-3 divide-x divide-[#d3d0c8] text-center dark:divide-white/10">
                  {[
                    ["18", "Colombo Region"],
                    ["14", "Southern Hub"],
                    ["10", "Central Highlands"],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <strong className="text-3xl text-[#115745] dark:text-emerald-200">{value}</strong>
                      <p className="text-xs uppercase text-[#68716c] dark:text-stone-400">{label}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            {purchaseOrders.length > 0 && (
              <section className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                <div className="mb-5 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-[#115745] dark:text-emerald-200" />
                  <h2 className="text-xl font-semibold text-[#115745] dark:text-emerald-200">Recent Purchase Orders</h2>
                </div>
                <div className="grid gap-3">
                  {purchaseOrders.slice(0, 4).map((po) => (
                    <article key={po.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 rounded-md border border-[#e2dfd7] bg-[#fbf8f1] p-4 dark:border-white/10 dark:bg-[#202b28] max-md:grid-cols-1">
                      <div className="min-w-0">
                        <strong className="block break-words text-[#202621] dark:text-stone-100">{po.id} - {po.vendor}</strong>
                        <span className="text-sm text-[#68716c] dark:text-stone-400">{po.material} / {po.quantity} units / due {po.deliveryDate}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-sm font-bold text-[#115745] dark:text-emerald-200">{formatLkrCompact(po.total)}</span>
                        <span className="text-sm text-[#68716c] dark:text-stone-400">{po.destination}</span>
                      </div>
                      <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-sm font-extrabold text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">{po.status}</span>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {activeMessageVendor && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-[#111816]/60 p-4">
                <section className="grid max-h-[92vh] w-full max-w-[760px] overflow-hidden rounded-lg border border-[#cbd2cd] bg-white shadow-2xl dark:border-white/10 dark:bg-[#18211f]">
                  <header className="flex min-w-0 items-start justify-between gap-4 border-b border-[#e2dfd7] p-5 dark:border-white/10">
                    <div className="grid min-w-0 grid-cols-[46px_minmax(0,1fr)] items-center gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-md bg-[#e9e5dc] text-sm font-extrabold text-[#115745] dark:bg-[#202b28] dark:text-emerald-200">{activeMessageVendor.initials}</span>
                      <div className="min-w-0">
                        <h2 className="break-words text-2xl font-extrabold text-[#115745] dark:text-emerald-200">{activeMessageVendor.name}</h2>
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#68716c] dark:text-stone-400">
                          <span>{activeMessageVendor.location}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${socketStatus === "Connected" ? "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200" : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200"}`}>
                            Socket.IO {socketStatus}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setActiveMessageVendor(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#202b28]" aria-label="Close vendor messages">
                      <X className="h-5 w-5" />
                    </button>
                  </header>

                  <div className="grid max-h-[52vh] gap-4 overflow-y-auto bg-[#fbf8f1] p-5 dark:bg-[#111816]">
                    {activeMessages.map((message) => (
                      <article key={message.id} className={`max-w-[82%] min-w-0 ${message.sender === "supplier" ? "justify-self-end" : ""}`}>
                        <p className={`break-words rounded-lg p-4 leading-relaxed ${message.sender === "supplier" ? "bg-[#115745] text-white" : "border border-[#cbd2cd] bg-white text-[#202621] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100"}`}>
                          {message.text}
                        </p>
                        <time className={`mt-1 block text-xs text-[#68716c] dark:text-stone-400 ${message.sender === "supplier" ? "text-right" : ""}`}>{message.time}</time>
                      </article>
                    ))}
                  </div>

                  <form onSubmit={sendVendorMessage} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-[#e2dfd7] p-5 dark:border-white/10">
                    <input
                      value={messageDraft}
                      onChange={(event) => setMessageDraft(event.target.value)}
                      className="min-h-12 min-w-0 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none focus:border-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100"
                      placeholder={`Message ${activeMessageVendor.name}...`}
                    />
                    <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#115745] px-5 font-bold text-white">
                      <Send className="h-4 w-4" />
                      Send
                    </button>
                  </form>
                </section>
              </div>
            )}

            {activePoVendor && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-[#111816]/60 p-4">
                <form onSubmit={createPurchaseOrder} className="grid max-h-[92vh] w-full max-w-[860px] gap-5 overflow-y-auto rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#18211f]">
                  <div className="flex min-w-0 items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold uppercase tracking-wide text-[#68716c] dark:text-stone-400">New purchase order</p>
                      <h2 className="mt-1 break-words text-3xl font-extrabold text-[#115745] dark:text-emerald-200">{activePoVendor.name}</h2>
                      <p className="mt-2 break-words text-[#4d5651] dark:text-stone-300">{activePoVendor.email} / {activePoVendor.location}</p>
                    </div>
                    <button type="button" onClick={() => setActivePoVendor(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#202b28]" aria-label="Close purchase order draft">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
                    <SupplierProfileField label="PO number" name="poNumber" defaultValue={nextPoNumber} />
                    <label className="grid min-w-0 gap-2">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Material</span>
                      <select name="material" defaultValue={activePoVendor.materials[0]} className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
                        {activePoVendor.materials.map((material) => (
                          <option key={material}>{material}</option>
                        ))}
                      </select>
                    </label>
                    <SupplierProfileField label="Quantity" name="quantity" type="number" defaultValue="25" />
                    <SupplierProfileField label="Unit price (LKR)" name="unitPrice" type="number" defaultValue="125000" />
                    <SupplierProfileField label="Required delivery date" name="deliveryDate" type="date" defaultValue="2026-08-15" />
                    <SupplierProfileField label="Delivery destination" name="destination" defaultValue="Manufacturing Hub B, Malwana" />
                    <label className="grid min-w-0 gap-2 sm:col-span-2 lg:col-span-3">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Notes</span>
                      <textarea name="notes" rows="4" defaultValue="Confirm stock availability, packing details, and dispatch window before approval." className="min-w-0 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 py-3 outline-none focus:border-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100" />
                    </label>
                  </div>

                  <div className="rounded-md border border-[#cbd2cd] bg-[#fbf8f1] p-4 dark:border-white/10 dark:bg-[#202b28]">
                    <p className="text-sm font-semibold text-[#68716c] dark:text-stone-400">Default status</p>
                    <strong className="mt-1 block text-[#115745] dark:text-emerald-200">Draft purchase order will be added to Recent Purchase Orders.</strong>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <button type="button" onClick={() => setActivePoVendor(null)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28]">Cancel</button>
                    <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#115745] px-5 font-bold text-white">
                      <ClipboardList className="h-4 w-4" />
                      Create PO
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function FilterSelect({ label, value, segmented = false, icon: Icon }) {
  return (
    <div>
      <p className="mb-2 text-xs font-extrabold uppercase text-[#4d5651] dark:text-stone-400">{label}</p>
      {segmented ? (
        <div className="grid min-h-10 grid-cols-3 rounded-md border border-[#cbd2cd] bg-[#f4f0e8] p-1 text-sm font-bold dark:border-white/10 dark:bg-[#202b28]">
          {["All", "Preferred", "Active"].map((item, index) => (
            <button key={item} onClick={() => window.alert(`${label}: ${item} selected.`)} className={`rounded ${index === 0 ? "bg-white text-[#115745] dark:bg-[#18211f] dark:text-emerald-200" : "text-[#4d5651] dark:text-stone-300"}`}>{item}</button>
          ))}
        </div>
      ) : (
        <button onClick={() => window.alert(`${label} selector opened.`)} className="flex min-h-10 w-full items-center justify-between gap-3 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-3 text-left dark:border-white/10 dark:bg-[#202b28]">
          <span className="min-w-0 break-words">{value}</span>
          {Icon ? <Icon className="h-5 w-5 shrink-0 text-[#115745] dark:text-emerald-200" /> : <ChevronRight className="h-5 w-5 shrink-0 rotate-90 text-[#68716c]" />}
        </button>
      )}
    </div>
  );
}

function GoogleVendorMap({ expanded, selectedRegion, onSelectRegion }) {
  const regions = [
    { name: "Sri Lanka timber suppliers", detail: "All regions", tone: "bg-[#115745]" },
    { name: "Colombo timber suppliers", detail: "18 suppliers", tone: "bg-[#115745]" },
    { name: "Galle timber suppliers", detail: "10 suppliers", tone: "bg-[#8b5633]" },
    { name: "Kandy timber suppliers", detail: "10 suppliers", tone: "bg-[#2f6757]" },
    { name: "Matara timber suppliers", detail: "4 suppliers", tone: "bg-[#d58a1b]" },
  ];
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(selectedRegion)}&output=embed`;

  return (
    <div className="grid gap-4">
      <div className={`relative overflow-hidden rounded-md border border-[#d5d1c9] bg-[#eee9df] transition-all dark:border-white/10 dark:bg-[#202b28] ${expanded ? "min-h-[360px]" : "min-h-[190px]"}`}>
        <iframe
          title={`Google map for ${selectedRegion}`}
          src={mapSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
        <div className="absolute left-4 top-4 max-w-[calc(100%-2rem)] rounded-md bg-white/92 px-3 py-2 shadow-sm backdrop-blur dark:bg-[#111816]/92">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#68716c] dark:text-stone-400">Google Vendor Map</p>
          <p className="break-words text-sm font-bold text-[#115745] dark:text-emerald-200">{selectedRegion}</p>
        </div>
      </div>
      {expanded && (
        <div className="grid grid-cols-5 gap-2 max-lg:grid-cols-3 max-sm:grid-cols-1">
          {regions.map((region) => (
            <button
              key={region.name}
              onClick={() => onSelectRegion(region.name)}
              className={`rounded-md border p-3 text-left shadow-sm transition ${
                selectedRegion === region.name
                  ? "border-[#115745] bg-emerald-50 dark:border-emerald-300 dark:bg-emerald-950/20"
                  : "border-[#cbd2cd] bg-white hover:border-[#115745] dark:border-white/10 dark:bg-[#18211f]"
              }`}
            >
              <span className={`mb-2 block h-1.5 rounded-full ${region.tone}`} />
              <strong className="block break-words text-[#202621] dark:text-stone-100">{region.name.replace(" timber suppliers", "")}</strong>
              <span className="text-sm text-[#68716c] dark:text-stone-400">{region.detail}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatMessageTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function SupplierMaterialsPage({ theme, onToggleTheme }) {
  const [notice, setNotice] = useState("Material catalog synced with marketplace inventory.");
  const [viewMode, setViewMode] = useState("grid");
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [showNewMaterial, setShowNewMaterial] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [updatingMaterialId, setUpdatingMaterialId] = useState(null);
  const [bulkPercent, setBulkPercent] = useState(5);
  const [materials, setMaterials] = useState([
    {
      id: "mat-teak-grade-a",
      name: "Grade A Teak Log",
      grade: "Grade A",
      status: "In Stock",
      image: "/assets/material-teak-log.png",
      price: "LKR 450,000 / m3",
      qty: "124.50 m3",
      percent: "82%",
      tone: "bg-[#3f835d] text-white",
    },
    {
      id: "mat-mahogany-planks",
      name: "Mahogany Planks",
      grade: "Grade B",
      status: "Low Stock",
      image: "/assets/material-mahogany-planks.png",
      price: "LKR 380,000 / m3",
      qty: "12.20 m3",
      percent: "22%",
      tone: "bg-[#e7a12a] text-[#202621]",
    },
    {
      id: "mat-satinwood-slabs",
      name: "Satinwood Slabs",
      grade: "Prime",
      status: "In Stock",
      image: "/assets/material-satinwood-slabs.png",
      price: "LKR 520,000 / m3",
      qty: "45.00 m3",
      percent: "58%",
      tone: "bg-[#3f835d] text-white",
    },
    {
      id: "mat-premium-rosewood",
      name: "Premium Rosewood",
      grade: "Grade A",
      status: "In Stock",
      image: "/assets/material-premium-rosewood.png",
      price: "LKR 610,000 / m3",
      qty: "88.25 m3",
      percent: "74%",
      tone: "bg-[#3f835d] text-white",
    },
  ]);
  const editingMaterial = materials.find((material) => material.id === editingMaterialId);
  const updatingMaterial = materials.find((material) => material.id === updatingMaterialId);
  const lowStockCount = materials.filter((material) => material.status === "Low Stock").length;
  const totalInventoryValue = materials.reduce((total, material) => total + materialPriceNumber(material.price) * materialQuantityNumber(material.qty), 0);

  const addMaterial = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const status = formData.get("status");
    const name = formData.get("name").trim();
    const qty = formData.get("qty").trim();
    const unitPrice = Number(formData.get("unitPrice"));
    const nextMaterial = {
      id: `mat-${Date.now()}`,
      name,
      grade: formData.get("grade").trim(),
      status,
      image: "/assets/material-teak-log.png",
      price: `LKR ${new Intl.NumberFormat("en-LK").format(unitPrice)} / m3`,
      qty: `${qty} m3`,
      percent: status === "Low Stock" ? "24%" : "68%",
      tone: materialTone(status),
    };
    setMaterials((items) => [nextMaterial, ...items]);
    setNotice(`${name} added to timber inventory.`);
    setShowNewMaterial(false);
    event.currentTarget.reset();
  };

  const applyBulkPriceUpdate = (direction) => {
    const multiplier = direction === "increase" ? 1 + bulkPercent / 100 : 1 - bulkPercent / 100;
    setMaterials((items) => items.map((material) => ({
      ...material,
      price: formatMaterialPrice(material.price, multiplier),
    })));
    setNotice(`Bulk price ${direction === "increase" ? "increase" : "decrease"} of ${bulkPercent}% applied to ${materials.length} materials.`);
    setShowBulkUpdate(false);
  };

  const openMaterialEditor = (material) => {
    setEditingMaterialId(material.id);
    setUpdatingMaterialId(null);
    setShowBulkUpdate(false);
    setShowNewMaterial(false);
    setNotice(`${material.name} editor opened.`);
  };

  const openMaterialUpdater = (material) => {
    setUpdatingMaterialId(material.id);
    setEditingMaterialId(null);
    setShowBulkUpdate(false);
    setShowNewMaterial(false);
    setNotice(`${material.name} stock update opened.`);
  };

  const saveMaterialEdit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const materialId = formData.get("materialId");
    const status = formData.get("status");
    const imageFile = formData.get("imageFile");
    const uploadedImage = imageFile && imageFile.size ? URL.createObjectURL(imageFile) : "";
    const imageUrl = formData.get("imageUrl").trim();
    const nextName = formData.get("name").trim();
    const qty = formData.get("qty").trim();
    const percent = `${Math.min(100, Math.max(0, Number(formData.get("percent"))))}%`;
    setMaterials((items) => items.map((material) => material.id === materialId ? {
      ...material,
      name: nextName,
      grade: formData.get("grade").trim(),
      status,
      image: uploadedImage || imageUrl || material.image,
      price: `LKR ${new Intl.NumberFormat("en-LK").format(Number(formData.get("unitPrice")))} / m3`,
      qty: `${qty} m3`,
      percent,
      tone: materialTone(status),
    } : material));
    setEditingMaterialId(null);
    setNotice(`${nextName} changes saved.`);
  };

  const saveMaterialStockUpdate = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const materialId = formData.get("materialId");
    const status = formData.get("status");
    const qty = formData.get("qty").trim();
    const percent = `${Math.min(100, Math.max(0, Number(formData.get("percent"))))}%`;
    const currentMaterial = materials.find((material) => material.id === materialId);
    setMaterials((items) => items.map((material) => {
      if (material.id !== materialId) {
        return material;
      }
      return {
        ...material,
        status,
        qty: `${qty} m3`,
        percent,
        tone: materialTone(status),
      };
    }));
    setUpdatingMaterialId(null);
    setNotice(`${currentMaterial?.name || "Material"} stock update saved.`);
  };

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Materials" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} onNewShipment={() => setNotice("New shipment draft opened from Materials.")} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search catalog by species or grade..." />
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
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-7 px-6 py-9 xl:px-10">
            <section className="flex min-w-0 items-start justify-between gap-5 max-md:grid">
              <div className="min-w-0">
                <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">Timber Inventory</h1>
                <p className="mt-2 max-w-2xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">Manage your raw material stock and pricing for the marketplace.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setShowBulkUpdate((visible) => !visible);
                    setShowNewMaterial(false);
                    setEditingMaterialId(null);
                    setUpdatingMaterialId(null);
                    setNotice(showBulkUpdate ? "Bulk price update closed." : "Bulk price update workspace opened.");
                  }}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#8b5633] bg-[#fbf8f1] px-4 font-bold text-[#8b5633] dark:border-amber-500/60 dark:bg-[#202b28] dark:text-amber-200"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Bulk Update Prices
                </button>
                <button
                  onClick={() => {
                    setShowNewMaterial((visible) => !visible);
                    setShowBulkUpdate(false);
                    setEditingMaterialId(null);
                    setUpdatingMaterialId(null);
                    setNotice(showNewMaterial ? "New material form closed." : "New material form opened.");
                  }}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#115745] px-5 font-bold text-white shadow-sm"
                >
                  <Plus className="h-5 w-5" />
                  Add New Material
                </button>
              </div>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            {showBulkUpdate && (
              <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-5 rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f] max-md:grid-cols-1">
                <label className="grid min-w-0 gap-2">
                  <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Bulk price adjustment percentage</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={bulkPercent}
                    onChange={(event) => setBulkPercent(Number(event.target.value))}
                    className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none focus:border-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100"
                  />
                </label>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => applyBulkPriceUpdate("increase")} className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white">Increase Prices</button>
                  <button onClick={() => applyBulkPriceUpdate("decrease")} className="min-h-11 rounded-md border border-[#8b5633] bg-[#fbf8f1] px-5 font-bold text-[#8b5633] dark:border-amber-500/60 dark:bg-[#202b28] dark:text-amber-200">Decrease Prices</button>
                  <button onClick={() => setShowBulkUpdate(false)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28]">Cancel</button>
                </div>
              </section>
            )}

            {showNewMaterial && (
              <form onSubmit={addMaterial} className="grid grid-cols-4 gap-5 rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f] max-lg:grid-cols-2 max-sm:grid-cols-1">
                <SupplierProfileField label="Material name" name="name" defaultValue="Nedun Boards" />
                <SupplierProfileField label="Grade" name="grade" defaultValue="Grade A" />
                <SupplierProfileField label="Unit price (LKR / m3)" name="unitPrice" type="number" defaultValue="295000" />
                <SupplierProfileField label="Available quantity" name="qty" type="number" defaultValue="36.00" />
                <label className="grid min-w-0 gap-2">
                  <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Status</span>
                  <select name="status" className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
                    <option>In Stock</option>
                    <option>Low Stock</option>
                  </select>
                </label>
                <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-3 max-sm:flex-col">
                  <button type="submit" className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white max-sm:w-full">Save Material</button>
                  <button type="button" onClick={() => setShowNewMaterial(false)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28] max-sm:w-full">Cancel</button>
                </div>
              </form>
            )}

            {editingMaterial && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-[#111816]/60 p-4">
                <form onSubmit={saveMaterialEdit} className="grid max-h-[92vh] w-full max-w-[940px] grid-cols-[180px_minmax(0,1fr)] gap-5 overflow-y-auto rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#18211f] max-md:grid-cols-1">
                  <input type="hidden" name="materialId" value={editingMaterial.id} />
                  <div className="overflow-hidden rounded-md border border-[#cbd2cd] bg-[#e9e5dc] dark:border-white/10">
                    <img src={editingMaterial.image} alt={editingMaterial.name} className="h-44 w-full object-cover" />
                  </div>
                  <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
                    <div className="flex min-w-0 items-start justify-between gap-3 sm:col-span-2 lg:col-span-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#68716c] dark:text-stone-400">Edit material</p>
                        <h2 className="break-words text-2xl font-extrabold text-[#115745] dark:text-emerald-200">{editingMaterial.name}</h2>
                      </div>
                      <button type="button" onClick={() => setEditingMaterialId(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#202b28]" aria-label="Close material editor">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <SupplierProfileField label="Material name" name="name" defaultValue={editingMaterial.name} />
                    <SupplierProfileField label="Grade" name="grade" defaultValue={editingMaterial.grade} />
                    <SupplierProfileField label="Unit price (LKR / m3)" name="unitPrice" type="number" defaultValue={String(materialPriceNumber(editingMaterial.price))} />
                    <SupplierProfileField label="Available quantity" name="qty" type="number" defaultValue={String(materialQuantityNumber(editingMaterial.qty))} />
                    <SupplierProfileField label="Capacity percentage" name="percent" type="number" defaultValue={String(materialPercentNumber(editingMaterial.percent))} />
                    <label className="grid min-w-0 gap-2">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Status</span>
                      <select name="status" defaultValue={editingMaterial.status} className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
                        <option>In Stock</option>
                        <option>Low Stock</option>
                      </select>
                    </label>
                    <SupplierProfileField label="Image URL" name="imageUrl" defaultValue={editingMaterial.image} />
                    <label className="grid min-w-0 gap-2 sm:col-span-2">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Upload image</span>
                      <input name="imageFile" type="file" accept="image/*" className="min-h-11 min-w-0 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 py-2 outline-none file:mr-3 file:rounded file:border-0 file:bg-[#115745] file:px-3 file:py-1 file:font-bold file:text-white dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100" />
                    </label>
                    <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-3 max-sm:flex-col">
                      <button type="submit" className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white max-sm:w-full">Save Edit</button>
                      <button type="button" onClick={() => setEditingMaterialId(null)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28] max-sm:w-full">Cancel</button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {updatingMaterial && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-[#111816]/60 p-4">
                <form onSubmit={saveMaterialStockUpdate} className="grid max-h-[92vh] w-full max-w-[760px] grid-cols-4 gap-5 overflow-y-auto rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#18211f] max-lg:grid-cols-2 max-sm:grid-cols-1">
                  <input type="hidden" name="materialId" value={updatingMaterial.id} />
                  <div className="flex min-w-0 items-start justify-between gap-3 lg:col-span-4 max-lg:col-span-2 max-sm:col-span-1">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#39433f] dark:text-stone-100">Updating material</p>
                      <h2 className="mt-2 break-words text-2xl font-extrabold text-[#115745] dark:text-emerald-200">{updatingMaterial.name}</h2>
                    </div>
                    <button type="button" onClick={() => setUpdatingMaterialId(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#202b28]" aria-label="Close stock updater">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <SupplierProfileField label="Available quantity" name="qty" type="number" defaultValue={String(materialQuantityNumber(updatingMaterial.qty))} />
                  <SupplierProfileField label="Capacity percentage" name="percent" type="number" defaultValue={String(materialPercentNumber(updatingMaterial.percent))} />
                  <label className="grid min-w-0 gap-2">
                    <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Status</span>
                    <select name="status" defaultValue={updatingMaterial.status} className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
                      <option>In Stock</option>
                      <option>Low Stock</option>
                    </select>
                  </label>
                  <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-4 max-sm:flex-col">
                    <button type="submit" className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white max-sm:w-full">Save Update</button>
                    <button type="button" onClick={() => setUpdatingMaterialId(null)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28] max-sm:w-full">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <section className="flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-lg border border-[#cbd2cd] bg-[#fbf8f1] p-4 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
              <div className="flex flex-wrap gap-3">
                {["All Materials", "Species: Teak", "Status: Low Stock"].map((filter, index) => (
                  <button key={filter} onClick={() => setNotice(`${filter} filter selected.`)} className={`min-h-9 rounded-full border px-4 text-sm font-semibold ${index === 0 ? "border-[#115745] text-[#115745] dark:border-emerald-200 dark:text-emerald-200" : "border-[#cbd2cd] bg-[#e9e5dc] text-[#4d5651] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-300"}`}>
                    {filter}
                  </button>
                ))}
              </div>
              <div className="flex rounded-md bg-[#e9e5dc] p-1 dark:bg-[#202b28]">
                <button onClick={() => setViewMode("grid")} className={`grid h-10 w-10 place-items-center rounded-md ${viewMode === "grid" ? "bg-[#2f6757] text-white" : "text-[#4d5651] dark:text-stone-300"}`} aria-label="Grid view">
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button onClick={() => setViewMode("list")} className={`grid h-10 w-10 place-items-center rounded-md ${viewMode === "list" ? "bg-[#2f6757] text-white" : "text-[#4d5651] dark:text-stone-300"}`} aria-label="List view">
                  <LayoutList className="h-5 w-5" />
                </button>
              </div>
            </section>

            <section className={viewMode === "grid" ? "grid grid-cols-3 gap-6 max-xl:grid-cols-2 max-sm:grid-cols-1" : "grid gap-4"}>
              {materials.map((material) => (
                <MaterialCard key={material.id} material={material} viewMode={viewMode} onEdit={() => openMaterialEditor(material)} onUpdate={() => openMaterialUpdater(material)} />
              ))}
            </section>

            <section className="grid grid-cols-3 gap-6 max-xl:grid-cols-1">
              <article className="relative overflow-hidden rounded-lg bg-[#2f6757] p-7 text-white shadow-soft">
                <Wallet className="absolute bottom-5 right-6 h-10 w-10 rounded-full bg-white/14 p-2 text-white/80" />
                <p className="text-sm font-semibold text-white/75">Total Inventory Value</p>
                <strong className="mt-3 block text-4xl leading-tight">{formatLkrCompact(totalInventoryValue)}</strong>
                <p className="mt-3 text-sm font-bold">{materials.length} active materials</p>
              </article>
              <article className="rounded-lg border border-[#cbd2cd] bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                <div className="mb-6 flex justify-between gap-4">
                  <p className="font-semibold text-[#68716c] dark:text-stone-400">Low Stock Alerts</p>
                  <span className="rounded bg-rose-100 px-2 py-1 text-xs font-extrabold uppercase text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">Critical</span>
                </div>
                <strong className="text-3xl text-[#d94d58]">{lowStockCount} {lowStockCount === 1 ? "Material" : "Materials"}</strong>
                <p className="mt-2 leading-relaxed text-[#4d5651] dark:text-stone-300">{lowStockCount ? "Requires immediate update to avoid stockout." : "No immediate stock update required."}</p>
              </article>
              <article className="relative overflow-hidden rounded-lg bg-[#ffc090] p-7 text-[#7b4b2d] shadow-sm dark:bg-[#6a452f] dark:text-amber-100">
                <Truck className="absolute bottom-6 right-6 h-10 w-10 text-[#7b4b2d]/35 dark:text-amber-100/30" />
                <p className="font-semibold">Pending Shipments</p>
                <strong className="mt-6 block text-4xl leading-tight">1,240 m3</strong>
                <p className="mt-2">Awaiting logistics pickup</p>
              </article>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function MaterialCard({ material, viewMode, onEdit, onUpdate }) {
  const list = viewMode === "list";
  return (
    <article className={`overflow-hidden rounded-lg border border-[#cbd2cd] bg-white shadow-sm dark:border-white/10 dark:bg-[#18211f] ${list ? "grid grid-cols-[180px_minmax(0,1fr)_auto] items-center max-md:grid-cols-1" : ""}`}>
      <div className={`relative overflow-hidden bg-[#e9e5dc] ${list ? "h-36 md:h-full" : "h-48"}`}>
        <img src={material.image} alt={material.name} className="h-full w-full object-cover" />
        <span className={`absolute left-3 top-3 rounded px-2 py-1 text-xs font-extrabold uppercase ${material.tone}`}>{material.status}</span>
        <span className="absolute bottom-3 right-3 rounded-md bg-white px-3 py-2 text-sm font-extrabold text-[#115745] shadow-sm dark:bg-[#202b28] dark:text-emerald-200">{material.grade}</span>
      </div>
      <div className="min-w-0 p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="break-words text-2xl font-extrabold leading-tight text-[#202621] dark:text-stone-100">{material.name}</h2>
          <button onClick={onEdit} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#68716c] hover:bg-[#f4f0e8] dark:text-stone-400 dark:hover:bg-[#202b28]" aria-label={`More actions for ${material.name}`}>
            <EllipsisVertical className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-3">
          <div className="flex justify-between gap-4">
            <span className="text-[#68716c] dark:text-stone-400">Unit Price</span>
            <strong className="text-[#8b5633] dark:text-amber-200">{material.price}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#68716c] dark:text-stone-400">Available Qty</span>
            <strong className={material.status === "Low Stock" ? "text-[#d58a1b]" : "text-[#202621] dark:text-stone-100"}>{material.qty}</strong>
          </div>
          <div className="h-1.5 rounded-full bg-[#e2dfd7] dark:bg-white/10">
            <span className={`block h-full rounded-full ${material.status === "Low Stock" ? "bg-[#d58a1b]" : "bg-[#3f835d]"}`} style={{ width: material.percent }} />
          </div>
        </div>
      </div>
      <div className={`grid gap-2 p-5 ${list ? "min-w-44" : "grid-cols-2 border-t border-[#edf0ed] dark:border-white/10"}`}>
        <button onClick={onEdit} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#cbd2cd] bg-white px-4 font-semibold text-[#39433f] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
          <Pencil className="h-4 w-4" />
          Edit
        </button>
        <button onClick={onUpdate} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#cbd2cd] bg-white px-4 font-semibold text-[#39433f] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
          <RefreshCw className="h-4 w-4" />
          Update
        </button>
      </div>
    </article>
  );
}

function formatMaterialPrice(price, multiplier) {
  const currentValue = materialPriceNumber(price);
  const nextValue = Math.max(0, Math.round(currentValue * multiplier));
  return `LKR ${new Intl.NumberFormat("en-LK").format(nextValue)} / m3`;
}

function materialPriceNumber(price) {
  return Number(price.replace(/[^\d]/g, ""));
}

function materialQuantityNumber(qty) {
  return Number(qty.replace(/[^\d.]/g, ""));
}

function materialPercentNumber(percent) {
  return Number(percent.replace(/[^\d]/g, ""));
}

function formatLkrCompact(value) {
  if (value >= 1_000_000) {
    return `LKR ${(value / 1_000_000).toFixed(1)}M`;
  }
  return `LKR ${new Intl.NumberFormat("en-LK").format(Math.round(value))}`;
}

function materialTone(status) {
  return status === "Low Stock" ? "bg-[#e7a12a] text-[#202621]" : "bg-[#3f835d] text-white";
}

function SupplierShipmentsPage({ theme, onToggleTheme }) {
  const [notice, setNotice] = useState("Shipment board synced with logistics partners.");
  const [selectedShipment, setSelectedShipment] = useState("LV-721");
  const [trackingShipmentId, setTrackingShipmentId] = useState(null);
  const [manifestShipmentId, setManifestShipmentId] = useState(null);
  const shipments = [
    {
      id: "LV-721",
      po: "PO-8921",
      customer: "Silva Woodworks PLC",
      route: "Galle Main Yard to Malwana Hub",
      load: "150 m3 Grade-A Teak",
      status: "Delayed",
      statusClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
      eta: "Nov 15, 08:30",
      driver: "Ruwan Logistics",
      progress: "62%",
      vehicle: "TRK-GA-2148",
      seal: "SL-88421",
      pickup: "Galle Main Yard",
      destination: "Manufacturing Hub B, Malwana",
      contact: "Nimal Perera",
      documents: ["Purchase order", "Forest permit", "Load certificate", "Driver handoff"],
    },
    {
      id: "LV-718",
      po: "PO-8890",
      customer: "Arpico Interiors",
      route: "Matara Transit Hub to Colombo",
      load: "80 m3 Mahogany",
      status: "In Transit",
      statusClass: "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200",
      eta: "Oct 25, 14:00",
      driver: "Lanka Freight",
      progress: "78%",
      vehicle: "TRK-MA-7731",
      seal: "SL-87718",
      pickup: "Matara Transit Hub",
      destination: "Colombo Vendor Dock",
      contact: "Dinuka Silva",
      documents: ["Purchase order", "Load certificate", "Insurance note", "Customer receipt"],
    },
    {
      id: "LV-716",
      po: "PO-8874",
      customer: "Royal Furniture",
      route: "Kandy Logging Yard to Moratuwa",
      load: "45 m3 Satinwood",
      status: "Scheduled",
      statusClass: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200",
      eta: "Oct 26, 09:15",
      driver: "Pending dispatch",
      progress: "18%",
      vehicle: "Awaiting assignment",
      seal: "Pending",
      pickup: "Kandy Logging Yard",
      destination: "Moratuwa Production Yard",
      contact: "Dispatch desk",
      documents: ["Purchase order", "Forest permit", "Packing list"],
    },
  ];
  const selected = shipments.find((shipment) => shipment.id === selectedShipment) || shipments[0];
  const trackingShipment = shipments.find((shipment) => shipment.id === trackingShipmentId);
  const manifestShipment = shipments.find((shipment) => shipment.id === manifestShipmentId);
  const shipmentStages = selected ? getShipmentStages(selected) : [];

  const openTracking = (shipment) => {
    setSelectedShipment(shipment.id);
    setTrackingShipmentId(shipment.id);
    setManifestShipmentId(null);
    setNotice(`Live tracking opened for ${shipment.id}.`);
  };

  const openManifest = (shipment) => {
    setSelectedShipment(shipment.id);
    setManifestShipmentId(shipment.id);
    setTrackingShipmentId(null);
    setNotice(`Manifest opened for ${shipment.id}.`);
  };

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Shipments" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} onNewShipment={() => setNotice("New shipment form opened.")} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search shipment ID, customer, or destination..." />
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
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-7 px-6 py-9 xl:px-10">
            <section className="flex min-w-0 items-start justify-between gap-5 max-md:grid">
              <div className="min-w-0">
                <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">Shipment Management</h1>
                <p className="mt-2 max-w-2xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">Track timber dispatch, delivery timing, logistics partners, and route exceptions.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setNotice("Route calendar opened.")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#8b5633] bg-[#fbf8f1] px-4 font-bold text-[#8b5633] dark:border-amber-500/60 dark:bg-[#202b28] dark:text-amber-200">
                  <CalendarCheck className="h-4 w-4" />
                  Route Calendar
                </button>
                <button onClick={() => navigate("/supplier/shipments/new")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#115745] px-5 font-bold text-white shadow-sm">
                  <Plus className="h-5 w-5" />
                  Create Shipment
                </button>
              </div>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="grid grid-cols-4 gap-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
              <ShipmentSummaryCard icon={Truck} label="Active Shipments" value="08" helper="3 arriving today" />
              <ShipmentSummaryCard icon={Timer} label="Delayed Loads" value="02" helper="Needs dispatch review" warning />
              <ShipmentSummaryCard icon={Navigation} label="In Transit" value="05" helper="Across 4 routes" />
              <ShipmentSummaryCard icon={CheckCircle2} label="Delivered This Week" value="17" helper="+11% weekly" />
            </section>

            <section className="grid grid-cols-[minmax(0,1fr)_320px] gap-6 max-xl:grid-cols-1">
              <div className="grid gap-5">
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-lg border border-[#cbd2cd] bg-[#fbf8f1] p-4 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="flex flex-wrap gap-3">
                    {["All Shipments", "Status: In Transit", "Partner: Lanka Freight"].map((filter, index) => (
                      <button key={filter} onClick={() => setNotice(`${filter} filter selected.`)} className={`min-h-9 rounded-full border px-4 text-sm font-semibold ${index === 0 ? "border-[#115745] text-[#115745] dark:border-emerald-200 dark:text-emerald-200" : "border-[#cbd2cd] bg-[#e9e5dc] text-[#4d5651] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-300"}`}>
                        {filter}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setNotice("Dispatch report downloaded.")} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#cbd2cd] bg-white px-4 font-semibold dark:border-white/10 dark:bg-[#202b28]">
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>

                <div className="grid gap-4">
                  {shipments.map((shipment) => (
                    <article key={shipment.id} className={`rounded-lg border p-5 shadow-sm transition ${selectedShipment === shipment.id ? "border-[#115745] bg-emerald-50/50 dark:border-emerald-300 dark:bg-emerald-950/10" : "border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#18211f]"}`}>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 max-sm:grid-cols-1">
                        <div className="min-w-0">
                          <div className="flex min-w-0 flex-wrap items-center gap-3">
                            <button onClick={() => setSelectedShipment(shipment.id)} className="break-words text-xl font-extrabold leading-tight text-[#202621] dark:text-stone-100">{shipment.id}</button>
                            <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${shipment.statusClass}`}>{shipment.status}</span>
                          </div>
                          <p className="mt-2 break-words font-semibold text-[#115745] dark:text-emerald-200">{shipment.po} - {shipment.customer}</p>
                          <p className="mt-2 break-words text-[#4d5651] dark:text-stone-300">{shipment.route}</p>
                        </div>
                        <div className="grid justify-items-end gap-2 max-sm:justify-items-start">
                          <span className="text-sm font-bold text-[#68716c] dark:text-stone-400">ETA</span>
                          <strong className="text-lg text-[#202621] dark:text-stone-100">{shipment.eta}</strong>
                        </div>
                      </div>
                      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_180px] items-center gap-5 max-sm:grid-cols-1">
                        <div>
                          <div className="mb-2 flex justify-between gap-4 text-sm">
                            <span className="font-semibold text-[#4d5651] dark:text-stone-300">{shipment.load}</span>
                            <span className="font-bold text-[#115745] dark:text-emerald-200">{shipment.progress}</span>
                          </div>
                          <div className="h-2 rounded-full bg-[#e2dfd7] dark:bg-white/10">
                            <span className="block h-full rounded-full bg-[#115745] dark:bg-emerald-300" style={{ width: shipment.progress }} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openTracking(shipment)} className="min-h-10 flex-1 rounded-md border border-[#cbd2cd] bg-white px-3 font-semibold dark:border-white/10 dark:bg-[#202b28]">Track</button>
                          <button onClick={() => openManifest(shipment)} className="min-h-10 flex-1 rounded-md bg-[#115745] px-3 font-semibold text-white">Manifest</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="grid h-fit gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="mb-5 flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-[#115745] dark:text-emerald-200" />
                    <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">Live Tracking</h2>
                  </div>
                  <div className="rounded-lg bg-[#e9e5dc] p-5 dark:bg-[#202b28]">
                    <p className="text-sm font-extrabold uppercase tracking-wide text-[#68716c] dark:text-stone-400">Selected Shipment</p>
                    <strong className="mt-2 block text-3xl text-[#115745] dark:text-emerald-200">{selected.id}</strong>
                    <p className="mt-3 leading-relaxed text-[#4d5651] dark:text-stone-300">{selected.route}</p>
                  </div>
                  <div className="mt-5 grid gap-4">
                    {shipmentStages.map(({ label, detail, done }, index) => (
                      <article key={label} className="grid grid-cols-[34px_minmax(0,1fr)] gap-3">
                        <span className={`grid h-8 w-8 place-items-center rounded-full ${done ? "bg-[#115745] text-white dark:bg-emerald-500" : "bg-[#e2dfd7] text-[#68716c] dark:bg-[#2a3532] dark:text-stone-400"}`}>{done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}</span>
                        <span className="min-w-0">
                          <strong className="block break-words text-[#202621] dark:text-stone-100">{label}</strong>
                          <span className="text-sm text-[#68716c] dark:text-stone-400">{detail}</span>
                        </span>
                      </article>
                    ))}
                  </div>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-[#e9e5dc] p-6 shadow-sm dark:border-white/10 dark:bg-[#202b28]">
                  <h2 className="mb-5 font-extrabold uppercase text-[#39433f] dark:text-stone-100">Logistics Capacity</h2>
                  <SupplierProgress label="Lanka Freight" value="76% used" percent="76%" />
                  <SupplierProgress label="Ruwan Logistics" value="91% used" percent="91%" />
                  <SupplierProgress label="Express Timber" value="38% used" percent="38%" />
                </article>

                <button onClick={() => setNotice("Delay escalation sent to logistics coordinator.")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 font-bold text-amber-700 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-200">
                  <AlertTriangle className="h-5 w-5" />
                  Escalate Delay
                </button>
              </aside>
            </section>

            {trackingShipment && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-[#111816]/60 p-4">
                <section className="max-h-[92vh] w-full max-w-[820px] overflow-y-auto rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#18211f]">
                  <div className="flex min-w-0 items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold uppercase tracking-wide text-[#68716c] dark:text-stone-400">Live shipment tracking</p>
                      <h2 className="mt-1 break-words text-3xl font-extrabold text-[#115745] dark:text-emerald-200">{trackingShipment.id}</h2>
                      <p className="mt-2 break-words text-[#4d5651] dark:text-stone-300">{trackingShipment.route}</p>
                    </div>
                    <button type="button" onClick={() => setTrackingShipmentId(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#202b28]" aria-label="Close shipment tracking">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
                    <ShipmentDetailTile label="Status" value={trackingShipment.status} />
                    <ShipmentDetailTile label="Progress" value={trackingShipment.progress} />
                    <ShipmentDetailTile label="ETA" value={trackingShipment.eta} />
                    <ShipmentDetailTile label="Logistics" value={trackingShipment.driver} />
                  </div>

                  <div className="mt-6 rounded-lg bg-[#e9e5dc] p-5 dark:bg-[#202b28]">
                    <div className="mb-3 flex justify-between gap-4 text-sm">
                      <span className="font-bold text-[#39433f] dark:text-stone-100">{trackingShipment.pickup}</span>
                      <span className="font-bold text-[#115745] dark:text-emerald-200">{trackingShipment.destination}</span>
                    </div>
                    <div className="h-3 rounded-full bg-white dark:bg-white/10">
                      <span className="block h-full rounded-full bg-[#115745] dark:bg-emerald-300" style={{ width: trackingShipment.progress }} />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4">
                    {getShipmentStages(trackingShipment).map(({ label, detail, done }, index) => (
                      <article key={label} className="grid grid-cols-[38px_minmax(0,1fr)] gap-3">
                        <span className={`grid h-9 w-9 place-items-center rounded-full ${done ? "bg-[#115745] text-white dark:bg-emerald-500" : "bg-[#e2dfd7] text-[#68716c] dark:bg-[#2a3532] dark:text-stone-400"}`}>{done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}</span>
                        <span className="min-w-0">
                          <strong className="block break-words text-[#202621] dark:text-stone-100">{label}</strong>
                          <span className="text-sm text-[#68716c] dark:text-stone-400">{detail}</span>
                        </span>
                      </article>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button type="button" onClick={() => openManifest(trackingShipment)} className="min-h-11 rounded-md border border-[#8b5633] bg-[#fbf8f1] px-5 font-bold text-[#8b5633] dark:border-amber-500/60 dark:bg-[#202b28] dark:text-amber-200">Open Manifest</button>
                    <button type="button" onClick={() => setTrackingShipmentId(null)} className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white">Done</button>
                  </div>
                </section>
              </div>
            )}

            {manifestShipment && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-[#111816]/60 p-4">
                <section className="max-h-[92vh] w-full max-w-[760px] overflow-y-auto rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#18211f]">
                  <div className="flex min-w-0 items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold uppercase tracking-wide text-[#68716c] dark:text-stone-400">Shipment manifest</p>
                      <h2 className="mt-1 break-words text-3xl font-extrabold text-[#115745] dark:text-emerald-200">{manifestShipment.id}</h2>
                      <p className="mt-2 break-words text-[#4d5651] dark:text-stone-300">{manifestShipment.po} - {manifestShipment.customer}</p>
                    </div>
                    <button type="button" onClick={() => setManifestShipmentId(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#202b28]" aria-label="Close shipment manifest">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                    <ManifestRow label="Load" value={manifestShipment.load} />
                    <ManifestRow label="Route" value={manifestShipment.route} />
                    <ManifestRow label="Pickup" value={manifestShipment.pickup} />
                    <ManifestRow label="Destination" value={manifestShipment.destination} />
                    <ManifestRow label="Vehicle" value={manifestShipment.vehicle} />
                    <ManifestRow label="Seal number" value={manifestShipment.seal} />
                    <ManifestRow label="Logistics partner" value={manifestShipment.driver} />
                    <ManifestRow label="Contact" value={manifestShipment.contact} />
                    <ManifestRow label="ETA" value={manifestShipment.eta} />
                    <ManifestRow label="Status" value={manifestShipment.status} />
                  </div>

                  <div className="mt-6 rounded-lg border border-[#cbd2cd] bg-[#fbf8f1] p-5 dark:border-white/10 dark:bg-[#202b28]">
                    <h3 className="font-extrabold text-[#202621] dark:text-stone-100">Required Documents</h3>
                    <div className="mt-4 grid gap-3">
                      {manifestShipment.documents.map((document) => (
                        <div key={document} className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#115745] dark:text-emerald-200" />
                          <span className="font-semibold text-[#4d5651] dark:text-stone-300">{document}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button type="button" onClick={() => openTracking(manifestShipment)} className="min-h-11 rounded-md border border-[#8b5633] bg-[#fbf8f1] px-5 font-bold text-[#8b5633] dark:border-amber-500/60 dark:bg-[#202b28] dark:text-amber-200">Track Shipment</button>
                    <button type="button" onClick={() => downloadShipmentManifest(manifestShipment, setNotice)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#115745] px-5 font-bold text-white">
                      <Download className="h-4 w-4" />
                      Download Manifest
                    </button>
                  </div>
                </section>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ShipmentSummaryCard({ icon: Icon, label, value, helper, warning = false }) {
  return (
    <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
      <div className="flex items-center gap-4">
        <span className={`grid h-12 w-12 place-items-center rounded-full ${warning ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200" : "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200"}`}>
          <Icon className="h-6 w-6" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-[#68716c] dark:text-stone-400">{label}</span>
          <strong className="text-3xl leading-tight text-[#202621] dark:text-stone-100">{value}</strong>
        </span>
      </div>
      <p className="mt-4 text-sm font-semibold text-[#4d5651] dark:text-stone-300">{helper}</p>
    </article>
  );
}

function ShipmentDetailTile({ label, value }) {
  return (
    <article className="rounded-md border border-[#cbd2cd] bg-[#fbf8f1] p-4 dark:border-white/10 dark:bg-[#202b28]">
      <span className="text-xs font-extrabold uppercase tracking-wide text-[#68716c] dark:text-stone-400">{label}</span>
      <strong className="mt-2 block break-words text-lg leading-tight text-[#202621] dark:text-stone-100">{value}</strong>
    </article>
  );
}

function ManifestRow({ label, value }) {
  return (
    <div className="rounded-md border border-[#cbd2cd] bg-[#fbf8f1] p-4 dark:border-white/10 dark:bg-[#202b28]">
      <span className="text-xs font-extrabold uppercase tracking-wide text-[#68716c] dark:text-stone-400">{label}</span>
      <strong className="mt-2 block break-words text-[#202621] dark:text-stone-100">{value}</strong>
    </div>
  );
}

function getShipmentStages(shipment) {
  return [
    { label: "Dispatch confirmed", detail: shipment.pickup, done: true },
    { label: "Loaded and sealed", detail: `${shipment.load} - Seal ${shipment.seal}`, done: shipment.status !== "Scheduled" },
    { label: "In transit", detail: shipment.driver, done: shipment.status === "In Transit" || shipment.status === "Delayed" },
    { label: "Customer handoff", detail: shipment.eta, done: shipment.status === "Delivered" },
  ];
}

function downloadShipmentManifest(shipment, setNotice) {
  const manifest = [
    `Shipment Manifest: ${shipment.id}`,
    `Purchase Order: ${shipment.po}`,
    `Customer: ${shipment.customer}`,
    `Load: ${shipment.load}`,
    `Route: ${shipment.route}`,
    `Pickup: ${shipment.pickup}`,
    `Destination: ${shipment.destination}`,
    `Vehicle: ${shipment.vehicle}`,
    `Seal Number: ${shipment.seal}`,
    `Logistics Partner: ${shipment.driver}`,
    `Contact: ${shipment.contact}`,
    `ETA: ${shipment.eta}`,
    `Status: ${shipment.status}`,
    "",
    "Documents:",
    ...shipment.documents.map((document) => `- ${document}`),
  ].join("\n");
  const blob = new Blob([manifest], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${shipment.id}-manifest.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setNotice(`Manifest downloaded for ${shipment.id}.`);
}

function SupplierNewShipmentPage({ theme, onToggleTheme }) {
  const [notice, setNotice] = useState("Create a shipment draft and assign it to an active purchase order.");
  const [created, setCreated] = useState(false);

  const createShipment = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setCreated(true);
    setNotice(`Shipment draft ${formData.get("shipmentId")} created for ${formData.get("purchaseOrder")}.`);
  };

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Shipments" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-10">
            <div className="hidden min-w-0 items-center gap-2 text-sm font-medium text-[#39433f] dark:text-stone-300 md:flex">
              <button onClick={() => navigate("/supplier/shipments")} className="hover:text-[#115745] dark:hover:text-emerald-200">Shipments</button>
              <ChevronRight className="h-4 w-4 shrink-0" />
              <strong className="text-[#202621] dark:text-stone-100">New Shipment</strong>
            </div>
            <label className="ml-auto flex h-11 w-full max-w-[360px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400 max-md:max-w-none">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search purchase order..." />
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
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-7 px-6 py-9 xl:px-10">
            <section className="flex min-w-0 items-start justify-between gap-5 max-md:grid">
              <div className="min-w-0">
                <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">New Shipment</h1>
                <p className="mt-2 max-w-2xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">Create a logistics draft, allocate timber volume, assign pickup and delivery points, and prepare the manifest.</p>
              </div>
              <button onClick={() => navigate("/supplier/shipments")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#8b5633] bg-[#fbf8f1] px-4 font-bold text-[#8b5633] dark:border-amber-500/60 dark:bg-[#202b28] dark:text-amber-200">
                <ArrowLeft className="h-4 w-4" />
                Back to Shipments
              </button>
            </section>

            <div className={`rounded-md border px-4 py-3 text-sm font-semibold shadow-sm ${created ? "border-emerald-200 bg-emerald-50 text-[#115745] dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200" : "border-[#cbd7cf] bg-white/65 text-[#115745] dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200"}`}>
              {notice}
            </div>

            <form onSubmit={createShipment} className="grid grid-cols-[minmax(0,1fr)_320px] gap-6 max-xl:grid-cols-1">
              <div className="grid gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="mb-5 text-2xl font-extrabold text-[#202621] dark:text-stone-100">Shipment Details</h2>
                  <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                    <SupplierProfileField label="Shipment ID" name="shipmentId" defaultValue="LV-724" />
                    <SupplierProfileField label="Purchase order" name="purchaseOrder" defaultValue="PO-8921" />
                    <SupplierProfileField label="Customer" name="customer" defaultValue="Silva Woodworks PLC" />
                    <SupplierProfileField label="Material load" name="materialLoad" defaultValue="150 m3 Grade-A Teak" />
                    <SupplierProfileField label="Pickup yard" name="pickupYard" defaultValue="Galle Main Yard" />
                    <SupplierProfileField label="Delivery hub" name="deliveryHub" defaultValue="Manufacturing Hub B, Malwana" />
                    <SupplierProfileField label="Pickup date" name="pickupDate" type="date" defaultValue="2026-08-01" />
                    <SupplierProfileField label="Delivery ETA" name="deliveryEta" type="date" defaultValue="2026-08-03" />
                  </div>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="mb-5 text-2xl font-extrabold text-[#202621] dark:text-stone-100">Logistics Assignment</h2>
                  <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                    <label className="grid min-w-0 gap-2">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Logistics partner</span>
                      <select name="partner" className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
                        <option>Ruwan Logistics</option>
                        <option>Lanka Freight</option>
                        <option>Express Timber</option>
                      </select>
                    </label>
                    <SupplierProfileField label="Vehicle / container" name="vehicle" defaultValue="TRK-GA-2148" />
                    <label className="grid min-w-0 gap-2 sm:col-span-2">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Handling instructions</span>
                      <textarea name="instructions" rows={4} defaultValue="Seal teak bundle after moisture check. Call receiving manager 30 minutes before arrival." className="min-w-0 resize-none rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 py-3 outline-none focus:border-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100" />
                    </label>
                  </div>
                </article>
              </div>

              <aside className="grid h-fit gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="text-xl font-extrabold text-[#115745] dark:text-emerald-200">Manifest Preview</h2>
                  <div className="mt-5 grid gap-3 text-sm">
                    <ProfileInfoRow label="Load" value="150 m3" />
                    <ProfileInfoRow label="Route" value="Galle to Malwana" />
                    <ProfileInfoRow label="Priority" value="High" />
                    <ProfileInfoRow label="Insurance" value="Required" />
                  </div>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-[#e9e5dc] p-6 shadow-sm dark:border-white/10 dark:bg-[#202b28]">
                  <h2 className="mb-5 font-extrabold uppercase text-[#39433f] dark:text-stone-100">Readiness</h2>
                  <SupplierProgress label="Inventory allocated" value="100%" percent="100%" />
                  <SupplierProgress label="Partner capacity" value="76%" percent="76%" />
                  <SupplierProgress label="Documents" value="60%" percent="60%" />
                </article>

                <button type="submit" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[#115745] px-5 font-extrabold text-white shadow-soft">
                  <Truck className="h-5 w-5" />
                  Create Shipment Draft
                </button>
                <button type="button" onClick={() => setNotice("Manifest downloaded for draft shipment.")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#cbd2cd] bg-white px-5 font-bold text-[#115745] dark:border-white/10 dark:bg-[#18211f] dark:text-emerald-200">
                  <Download className="h-5 w-5" />
                  Download Manifest
                </button>
              </aside>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function SpecBox({ label, value }) {
  return (
    <div className="grid min-h-24 content-center rounded-md border border-[#e1dfd7] bg-[#f4f0e8] p-4 dark:border-white/10 dark:bg-[#202b28]">
      <span className="text-xs font-extrabold uppercase tracking-wide text-[#4d5651] dark:text-stone-400">{label}</span>
      <strong className="mt-2 text-2xl leading-tight text-[#202621] dark:text-stone-100">{value}</strong>
    </div>
  );
}

function OrderSideCard({ icon: Icon, title, children }) {
  return (
    <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
      <div className="mb-6 flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#115745] dark:text-emerald-200" />
        <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">{title}</h2>
      </div>
      <div className="text-[#4d5651] dark:text-stone-300">{children}</div>
    </article>
  );
}

function ContactRow({ icon: Icon, text }) {
  return (
    <p className="flex min-w-0 items-center gap-3 text-[#4d5651] dark:text-stone-300">
      <Icon className="h-4 w-4 shrink-0 text-[#68716c] dark:text-stone-400" />
      <span className="min-w-0 break-words">{text}</span>
    </p>
  );
}

function SupplierNotificationsPage({ theme, onToggleTheme }) {
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
        <SupplierSidebar active="Notifications" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} onNewShipment={() => setNotice("New shipment draft opened from Notifications.")} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-10">
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

function NotificationStat({ icon: Icon, label, value, warning = false }) {
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

function SupplierProfilePage({ theme, onToggleTheme }) {
  const defaultProfile = {
    companyName: "Lumbini Timber Co.",
    registration: "PV-20491",
    email: "operations@lumbinitimber.lk",
    phone: "+94 11 245 8891",
    address: "No. 18, Galle Main Yard, Galle, Sri Lanka",
    manager: "John Doe",
    managerRole: "Logistics Manager",
  };
  const [notice, setNotice] = useState("Supplier profile loaded.");
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-supplier-profile")) || defaultProfile;
    } catch {
      return defaultProfile;
    }
  });
  const [saved, setSaved] = useState(false);
  const [showYardForm, setShowYardForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [yards, setYards] = useState([
    { name: "Galle Main Yard", capacity: "88% full", materials: "Grade-A Teak, Jackwood", status: "Primary" },
    { name: "Matara Transit Hub", capacity: "32% full", materials: "Mahogany, Satinwood", status: "Transit" },
    { name: "Kandy Logging Yard", capacity: "54% full", materials: "Rosewood, Nedun", status: "Logging" },
  ]);
  const [documents, setDocuments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-supplier-verification-documents") || "null") || [
        { name: "Business Registration Certificate", status: "Required", detail: "Upload required for admin approval" },
        { name: "Owner / Director Identity Document", status: "Required", detail: "Upload required for admin approval" },
        { name: "Business Address Proof", status: "Required", detail: "Upload required for admin approval" },
        { name: "Material Source / Compliance Certificate", status: "Required", detail: "Upload required for admin approval" },
      ];
    } catch {
      return [];
    }
  });
  const [payout, setPayout] = useState({
    bank: "Commercial Bank PLC",
    account: "**** 4821",
    settlement: "Weekly, Monday",
    currency: "LKR",
  });

  const saveSupplierProfile = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextProfile = {
      companyName: formData.get("companyName").trim(),
      registration: formData.get("registration").trim(),
      email: formData.get("email").trim(),
      phone: formData.get("phone").trim(),
      address: formData.get("address").trim(),
      manager: formData.get("manager").trim(),
      managerRole: formData.get("managerRole").trim(),
    };
    setProfile(nextProfile);
    setSaved(true);
    setNotice("Supplier profile changes saved.");
    try {
      localStorage.setItem("woodverse-supplier-profile", JSON.stringify(nextProfile));
    } catch {}
    publishAdminEvent("Supplier", "Supplier profile updated", `${nextProfile.companyName} updated business and contact details.`, "Normal");
  };

  const addOperatingYard = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const yard = {
      name: formData.get("name").trim(),
      capacity: `${formData.get("capacity").trim()}% full`,
      materials: formData.get("materials").trim(),
      status: formData.get("status"),
    };
    setYards((items) => [yard, ...items]);
    setShowYardForm(false);
    setNotice(`${yard.name} added to operating yards.`);
  };

  const uploadComplianceDocument = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get("documentFile");
    if (!file?.name) {
      setNotice("Select a document file before uploading.");
      return;
    }
    const document = {
      name: formData.get("name").trim(),
      status: "Review",
      detail: `Uploaded ${file.name}`,
    };
    setDocuments((items) => {
      const next = [document, ...items];
      try { localStorage.setItem("woodverse-supplier-verification-documents", JSON.stringify(next)); } catch {}
      return next;
    });
    publishAdminEvent("Supplier", `Compliance document uploaded: ${document.name}`, `${profile.companyName} submitted ${document.name} for admin review.`, "High");
    setShowDocumentForm(false);
    setNotice(`${document.name} uploaded and sent for admin review.`);
  };

  const savePayoutPreferences = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextPayout = {
      bank: formData.get("bank").trim(),
      account: formData.get("account").trim(),
      settlement: formData.get("settlement").trim(),
      currency: formData.get("currency"),
    };
    setPayout(nextPayout);
    setShowPayoutForm(false);
    setNotice("Payout preferences saved.");
  };

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Profile" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} onNewShipment={() => setNotice("New shipment draft opened from Profile.")} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search profile settings..." />
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
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-7 px-6 py-9 xl:px-10">
            <section className="grid grid-cols-[minmax(0,1fr)_300px] gap-6 max-lg:grid-cols-1">
              <div className="min-w-0">
                <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">Supplier Profile</h1>
                <p className="mt-2 max-w-3xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">Manage your business identity, compliance credentials, payout preferences, and operating locations.</p>
              </div>
              <article className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 rounded-lg bg-[#2f6757] p-5 text-white shadow-soft">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-white/16 text-xl font-extrabold">LT</span>
                <span className="min-w-0">
                  <strong className="block break-words text-xl leading-tight">{profile.companyName}</strong>
                  <span className="text-sm text-white/70">Verified Supplier</span>
                </span>
              </article>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="grid grid-cols-4 gap-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
              <SupplierProfileStat icon={CheckCircle2} label="Verification" value="Approved" />
              <SupplierProfileStat icon={Boxes} label="Materials Listed" value="24" />
              <SupplierProfileStat icon={Truck} label="Yards" value={String(yards.length).padStart(2, "0")} />
              <SupplierProfileStat icon={Wallet} label="Payout Status" value="Active" />
            </section>

            <section className="grid grid-cols-[minmax(0,1fr)_320px] gap-6 max-xl:grid-cols-1">
              <div className="grid gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="mb-6 flex items-center justify-between gap-4 max-sm:grid">
                    <div>
                      <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">Business Information</h2>
                      <p className="mt-1 text-[#68716c] dark:text-stone-400">These details appear on orders, invoices, and supplier verification records.</p>
                    </div>
                    {saved && <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold uppercase text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200">Saved</span>}
                  </div>

                  <form key={JSON.stringify(profile)} onSubmit={saveSupplierProfile} onChange={() => setSaved(false)} className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                    <SupplierProfileField label="Company name" name="companyName" defaultValue={profile.companyName} />
                    <SupplierProfileField label="Registration number" name="registration" defaultValue={profile.registration} />
                    <SupplierProfileField label="Business email" name="email" defaultValue={profile.email} type="email" />
                    <SupplierProfileField label="Business phone" name="phone" defaultValue={profile.phone} type="tel" />
                    <SupplierProfileField label="Primary manager" name="manager" defaultValue={profile.manager} />
                    <SupplierProfileField label="Manager role" name="managerRole" defaultValue={profile.managerRole} />
                    <label className="grid min-w-0 gap-2 sm:col-span-2">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Registered address</span>
                      <textarea name="address" rows={3} defaultValue={profile.address} className="min-w-0 resize-none rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 py-3 outline-none focus:border-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100" />
                    </label>
                    <div className="flex justify-end gap-3 sm:col-span-2 max-sm:flex-col">
                      <button type="reset" onClick={() => { setSaved(true); setNotice("Profile changes reset to saved values."); }} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold text-[#39433f] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">Cancel</button>
                      <button type="submit" className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white">Save Changes</button>
                    </div>
                  </form>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">Operating Yards</h2>
                    <button onClick={() => { setShowYardForm(true); setShowDocumentForm(false); setShowPayoutForm(false); setNotice("New operating yard form opened."); }} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#115745] px-4 font-bold text-white"><Plus className="h-4 w-4" /> Add Yard</button>
                  </div>
                  <div className="grid gap-4">
                    {yards.map(({ name, capacity, materials, status }) => (
                      <article key={name} className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-4 rounded-md bg-[#f4f0e8] p-4 dark:bg-[#202b28] max-sm:grid-cols-1">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#115745] dark:bg-[#18211f] dark:text-emerald-200"><Warehouse className="h-5 w-5" /></span>
                        <span className="min-w-0">
                          <strong className="block break-words text-[#202621] dark:text-stone-100">{name}</strong>
                          <span className="text-sm text-[#68716c] dark:text-stone-400">{materials} - {capacity}</span>
                        </span>
                        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase text-[#115745] dark:bg-[#18211f] dark:text-emerald-200">{status}</span>
                      </article>
                    ))}
                  </div>
                </article>
              </div>

              <aside className="grid h-fit gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="text-xl font-extrabold text-[#115745] dark:text-emerald-200">Verification Documents</h2>
                  <p className="mt-1 text-sm text-[#68716c] dark:text-stone-400">Submit all required documents before supplier approval.</p>
                  <div className="mt-5 grid gap-3">
                    {documents.map(({ name, status, detail }) => (
                      <article key={name} className="rounded-md border border-[#e2dfd7] p-4 dark:border-white/10">
                        <div className="flex justify-between gap-3">
                          <strong className="text-[#202621] dark:text-stone-100">{name}</strong>
                          <span className={`rounded-full px-2 py-1 text-xs font-extrabold uppercase ${status === "Review" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200" : "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200"}`}>{status}</span>
                        </div>
                        <p className="mt-2 text-sm text-[#68716c] dark:text-stone-400">{detail}</p>
                      </article>
                    ))}
                  </div>
                  <button onClick={() => { setShowDocumentForm(true); setShowYardForm(false); setShowPayoutForm(false); setNotice("Document upload panel opened."); }} className="mt-5 min-h-11 w-full rounded-md border border-[#cbd2cd] bg-white font-bold text-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-emerald-200">Upload Document</button>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-[#e9e5dc] p-6 shadow-sm dark:border-white/10 dark:bg-[#202b28]">
                  <h2 className="text-xl font-extrabold text-[#202621] dark:text-stone-100">Payout Preferences</h2>
                  <div className="mt-5 grid gap-3 text-sm">
                    <ProfileInfoRow label="Bank" value={payout.bank} />
                    <ProfileInfoRow label="Account" value={payout.account} />
                    <ProfileInfoRow label="Settlement" value={payout.settlement} />
                    <ProfileInfoRow label="Currency" value={payout.currency} />
                  </div>
                  <button onClick={() => { setShowPayoutForm(true); setShowYardForm(false); setShowDocumentForm(false); setNotice("Payout preferences editor opened."); }} className="mt-5 min-h-11 w-full rounded-md bg-[#115745] font-bold text-white">Edit Payouts</button>
                </article>
              </aside>
            </section>

            {showYardForm && (
              <ProfileModal title="Add Operating Yard" onClose={() => setShowYardForm(false)}>
                <form onSubmit={addOperatingYard} className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                  <SupplierProfileField label="Yard name" name="name" defaultValue="Kurunegala Storage Yard" />
                  <SupplierProfileField label="Capacity percentage" name="capacity" type="number" defaultValue="45" />
                  <SupplierProfileField label="Materials handled" name="materials" defaultValue="Teak, Mahogany" />
                  <label className="grid min-w-0 gap-2">
                    <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Yard type</span>
                    <select name="status" defaultValue="Storage" className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
                      <option>Primary</option>
                      <option>Transit</option>
                      <option>Logging</option>
                      <option>Storage</option>
                    </select>
                  </label>
                  <div className="flex justify-end gap-3 sm:col-span-2 max-sm:flex-col">
                    <button type="button" onClick={() => setShowYardForm(false)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28]">Cancel</button>
                    <button type="submit" className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white">Save Yard</button>
                  </div>
                </form>
              </ProfileModal>
            )}

            {showDocumentForm && (
              <ProfileModal title="Upload Compliance Document" onClose={() => setShowDocumentForm(false)}>
                <form onSubmit={uploadComplianceDocument} className="grid gap-5">
                  <SupplierProfileField label="Document name" name="name" defaultValue="Environmental Clearance" />
                  <SupplierProfileField label="Expiry or note" name="detail" defaultValue="Expires Jan 30, 2027" />
                  <label className="grid min-w-0 gap-2">
                    <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Status</span>
                  <p className="rounded-md bg-[#fff0cd] px-3 py-2 text-sm font-semibold text-[#8b5633]">New documents are marked Review until admin approves them.</p>
                  </label>
                  <label className="grid min-w-0 gap-2">
                    <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Document file</span>
                    <input name="documentFile" type="file" className="min-h-11 min-w-0 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 py-2 outline-none file:mr-3 file:rounded file:border-0 file:bg-[#115745] file:px-3 file:py-1 file:font-bold file:text-white dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100" />
                  </label>
                  <div className="flex justify-end gap-3 max-sm:flex-col">
                    <button type="button" onClick={() => setShowDocumentForm(false)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28]">Cancel</button>
                    <button type="submit" className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white">Upload Document</button>
                  </div>
                </form>
              </ProfileModal>
            )}

            {showPayoutForm && (
              <ProfileModal title="Edit Payout Preferences" onClose={() => setShowPayoutForm(false)}>
                <form onSubmit={savePayoutPreferences} className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                  <SupplierProfileField label="Bank" name="bank" defaultValue={payout.bank} />
                  <SupplierProfileField label="Account" name="account" defaultValue={payout.account} />
                  <SupplierProfileField label="Settlement schedule" name="settlement" defaultValue={payout.settlement} />
                  <label className="grid min-w-0 gap-2">
                    <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Currency</span>
                    <select name="currency" defaultValue={payout.currency} className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
                      <option>LKR</option>
                      <option>USD</option>
                    </select>
                  </label>
                  <div className="flex justify-end gap-3 sm:col-span-2 max-sm:flex-col">
                    <button type="button" onClick={() => setShowPayoutForm(false)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28]">Cancel</button>
                    <button type="submit" className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white">Save Payouts</button>
                  </div>
                </form>
              </ProfileModal>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ProfileModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#111816]/60 p-4">
      <section className="max-h-[92vh] w-full max-w-[760px] overflow-y-auto rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#18211f]">
        <div className="mb-5 flex min-w-0 items-start justify-between gap-4">
          <h2 className="break-words text-2xl font-extrabold text-[#115745] dark:text-emerald-200">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#202b28]" aria-label={`Close ${title}`}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function SupplierProfileField({ label, name, defaultValue, type = "text" }) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">{label}</span>
      <input required name={name} type={type} defaultValue={defaultValue} className="min-h-11 min-w-0 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none focus:border-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100" />
    </label>
  );
}

function SupplierProfileStat({ icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
      <div className="flex items-center gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200">
          <Icon className="h-6 w-6" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-[#68716c] dark:text-stone-400">{label}</span>
          <strong className="break-words text-2xl leading-tight text-[#202621] dark:text-stone-100">{value}</strong>
        </span>
      </div>
    </article>
  );
}

function ProfileInfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 rounded-md bg-white/70 p-3 dark:bg-[#18211f]">
      <span className="text-[#68716c] dark:text-stone-400">{label}</span>
      <strong className="text-right text-[#202621] dark:text-stone-100">{value}</strong>
    </div>
  );
}

function SupplierMetricCard({ icon: Icon, title, value, helper, helperClass = "text-[#39433f] dark:text-stone-300", tone = "bg-[#bcefd9] text-[#115745]", dark = false }) {
  return (
    <article className={`relative min-h-[158px] overflow-hidden rounded-lg border border-[#cbd2cd] p-6 shadow-sm dark:border-white/10 ${dark ? "bg-[#2f6757] text-white dark:bg-[#214d43]" : "bg-[#fbf8f1] text-[#39433f] dark:bg-[#18211f] dark:text-stone-100"}`}>
      {dark && <Warehouse className="absolute -bottom-8 -right-6 h-28 w-28 text-white/8" />}
      <div className="mb-5 flex items-start justify-between gap-4">
        <span className={`grid h-11 w-11 place-items-center rounded-md ${dark ? "bg-[#164f40] text-white" : tone}`}><Icon className="h-6 w-6" /></span>
        {helper && <span className={`max-w-[110px] text-right font-semibold leading-snug ${dark ? "text-white/80" : helperClass}`}>{helper}</span>}
      </div>
      <h2 className={`text-sm font-semibold uppercase tracking-[0.08em] ${dark ? "text-white/70" : "text-[#4b5651] dark:text-stone-400"}`}>{title}</h2>
      <p className={`mt-3 text-xl font-medium ${dark ? "text-white" : "text-[#115745] dark:text-emerald-200"}`}>{value}</p>
    </article>
  );
}

function SupplierProgress({ label, value, percent }) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex justify-between gap-3 text-xs font-extrabold text-[#202621] dark:text-stone-100">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[#d7d3ca] dark:bg-white/10">
        <span className="block h-full rounded-full bg-[#115745] dark:bg-emerald-300" style={{ width: percent }} />
      </div>
    </div>
  );
}

function SupplierSupportPage({ theme, onToggleTheme }) {
  const [notice, setNotice] = useState("Support center ready.");
  const [activeTopic, setActiveTopic] = useState("Orders");
  const [tickets, setTickets] = useState([
    { id: "SUP-1042", topic: "Shipment Delay", priority: "High", status: "Open", detail: "LV-721 weather reroute confirmation needed." },
    { id: "SUP-1039", topic: "Payout", priority: "Normal", status: "In Review", detail: "Weekly settlement reference mismatch." },
  ]);
  const topics = ["Orders", "Shipments", "Materials", "Payments", "Compliance"];
  const faqs = {
    Orders: "Use Purchase Orders to accept, reject, or add an internal note before shipment creation.",
    Shipments: "Open the shipment page, select Track, and review the route timeline or manifest.",
    Materials: "Edit updates item details; Update changes stock quantity, status, and capacity.",
    Payments: "Payout changes are managed from Profile and reviewed before the next settlement.",
    Compliance: "Upload renewed certificates in Profile so support can approve supplier records.",
  };

  const createSupportTicket = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const ticket = {
      id: `SUP-${1043 + tickets.length}`,
      topic: formData.get("topic"),
      priority: formData.get("priority"),
      status: "Open",
      detail: formData.get("detail").trim(),
    };
    setTickets((items) => [ticket, ...items]);
    setNotice(`${ticket.id} created for ${ticket.topic}.`);
    event.currentTarget.reset();
  };

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Support" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search help topics or tickets..." />
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
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-7 px-6 py-9 xl:px-10">
            <section className="grid grid-cols-[minmax(0,1fr)_280px] gap-6 max-lg:grid-cols-1">
              <div className="min-w-0">
                <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">Support Center</h1>
                <p className="mt-2 max-w-3xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">Create supplier support tickets, contact operations, and find answers for orders, shipments, materials, payments, and compliance.</p>
              </div>
              <article className="rounded-lg bg-[#2f6757] p-6 text-white shadow-soft">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/60">Average Response</p>
                <strong className="mt-4 block text-3xl">18 min</strong>
                <p className="mt-5 text-sm text-white/75">Critical supplier issues</p>
              </article>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="grid grid-cols-[minmax(0,1fr)_320px] gap-6 max-xl:grid-cols-1">
              <div className="grid gap-6">
                <form onSubmit={createSupportTicket} className="grid gap-5 rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">Create Ticket</h2>
                  <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                    <label className="grid min-w-0 gap-2">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Topic</span>
                      <select name="topic" defaultValue="Shipment Delay" className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
                        <option>Shipment Delay</option>
                        <option>Purchase Order</option>
                        <option>Material Inventory</option>
                        <option>Payout</option>
                        <option>Compliance</option>
                      </select>
                    </label>
                    <label className="grid min-w-0 gap-2">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Priority</span>
                      <select name="priority" defaultValue="Normal" className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
                        <option>Low</option>
                        <option>Normal</option>
                        <option>High</option>
                        <option>Critical</option>
                      </select>
                    </label>
                    <label className="grid min-w-0 gap-2 sm:col-span-2">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Issue details</span>
                      <textarea required name="detail" rows="4" defaultValue="Need help confirming the latest supplier workflow." className="min-w-0 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 py-3 outline-none focus:border-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100" />
                    </label>
                  </div>
                  <div className="flex justify-end gap-3 max-sm:flex-col">
                    <button type="reset" onClick={() => setNotice("Ticket form reset.")} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28]">Reset</button>
                    <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#115745] px-5 font-bold text-white">
                      <Send className="h-4 w-4" />
                      Submit Ticket
                    </button>
                  </div>
                </form>

                <section className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">Open Tickets</h2>
                  <div className="mt-5 grid gap-4">
                    {tickets.map((ticket) => (
                      <article key={ticket.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-md bg-[#f4f0e8] p-4 dark:bg-[#202b28] max-sm:grid-cols-1">
                        <div className="min-w-0">
                          <strong className="block break-words text-[#115745] dark:text-emerald-200">{ticket.id} - {ticket.topic}</strong>
                          <span className="mt-1 block break-words text-sm text-[#68716c] dark:text-stone-400">{ticket.detail}</span>
                        </div>
                        <div className="flex flex-wrap items-start gap-2">
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold uppercase text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">{ticket.priority}</span>
                          <button onClick={() => setNotice(`${ticket.id} status: ${ticket.status}.`)} className="rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase text-[#115745] dark:bg-[#18211f] dark:text-emerald-200">{ticket.status}</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="grid h-fit gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="text-xl font-extrabold text-[#115745] dark:text-emerald-200">Contact Channels</h2>
                  <div className="mt-5 grid gap-3">
                    {[
                      [Phone, "Call Operations", "+94 11 245 8800"],
                      [Mail, "Email Support", "support@woodverse.lk"],
                      [Bell, "Urgent Alert", "Escalate active issue"],
                    ].map(([Icon, label, detail]) => (
                      <button key={label} onClick={() => setNotice(`${label}: ${detail}`)} className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3 rounded-md border border-[#e2dfd7] bg-[#fbf8f1] p-3 text-left dark:border-white/10 dark:bg-[#202b28]">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#115745] dark:bg-[#18211f] dark:text-emerald-200"><Icon className="h-5 w-5" /></span>
                        <span className="min-w-0">
                          <strong className="block break-words text-[#202621] dark:text-stone-100">{label}</strong>
                          <span className="text-sm text-[#68716c] dark:text-stone-400">{detail}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-[#e9e5dc] p-6 shadow-sm dark:border-white/10 dark:bg-[#202b28]">
                  <h2 className="text-xl font-extrabold text-[#202621] dark:text-stone-100">Help Topics</h2>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {topics.map((topic) => (
                      <button key={topic} onClick={() => { setActiveTopic(topic); setNotice(`${topic} help opened.`); }} className={`min-h-9 rounded-full border px-3 text-sm font-bold ${activeTopic === topic ? "border-[#115745] bg-white text-[#115745] dark:border-emerald-200 dark:bg-[#18211f] dark:text-emerald-200" : "border-[#cbd2cd] bg-[#f4f0e8] text-[#4d5651] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-300"}`}>{topic}</button>
                    ))}
                  </div>
                  <p className="mt-5 break-words leading-relaxed text-[#4d5651] dark:text-stone-300">{faqs[activeTopic]}</p>
                </article>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function SupplierSettingsPage({ theme, onToggleTheme }) {
  const [notice, setNotice] = useState(() => supplierText(getStoredSupplierLanguage(), "Settings loaded."));
  const [preferences, setPreferences] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-supplier-settings")) || {
        language: "English",
        timezone: "Asia/Colombo",
        defaultView: "Dashboard",
        autoAssignShipments: true,
        lowStockAlerts: true,
        emailDigest: true,
        smsAlerts: false,
        twoFactor: true,
      };
    } catch {
      return {
        language: "English",
        timezone: "Asia/Colombo",
        defaultView: "Dashboard",
        autoAssignShipments: true,
        lowStockAlerts: true,
        emailDigest: true,
        smsAlerts: false,
        twoFactor: true,
      };
    }
  });
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [activeSessions, setActiveSessions] = useState(3);
  const apiKey = "wv_live_supplier_4f8c_91a2_7740";
  const maskedKey = apiKeyVisible ? apiKey : "wv_live_supplier_••••_••••_7740";
  const languageSelectRef = useRef(null);
  const t = (text) => supplierText(preferences.language, text);

  const updatePreference = (key, value) => {
    setPreferences((current) => {
      const next = { ...current, [key]: value };
      try {
        localStorage.setItem("woodverse-supplier-settings", JSON.stringify(next));
      } catch {}
      if (key === "language") {
        notifySupplierLanguageChange(value);
        setNotice(supplierText(value, `${value} language enabled.`));
      } else {
        setNotice(supplierText(next.language, "Preference updated."));
      }
      return next;
    });
  };

  const focusLanguageSelect = () => {
    languageSelectRef.current?.focus();
    setNotice(t("Language selector opened."));
  };

  const sendPasswordReset = () => {
    setPasswordResetSent(true);
    setNotice(t("Password reset link sent to operations@lumbinitimber.lk."));
  };

  const signOutOtherSessions = () => {
    setActiveSessions(1);
    setNotice(t("All other supplier sessions signed out."));
  };

  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setNotice(t("API key copied."));
    } catch {
      setNotice(t("API key copy unavailable."));
    }
  };

  const saveSettings = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const next = {
      ...preferences,
      language: formData.get("language"),
      timezone: formData.get("timezone"),
      defaultView: formData.get("defaultView"),
    };
    setPreferences(next);
    try {
      localStorage.setItem("woodverse-supplier-settings", JSON.stringify(next));
    } catch {}
    notifySupplierLanguageChange(next.language);
    setNotice(supplierText(next.language, "Supplier settings saved."));
  };

  const resetSettings = () => {
    const defaults = {
      language: "English",
      timezone: "Asia/Colombo",
      defaultView: "Dashboard",
      autoAssignShipments: true,
      lowStockAlerts: true,
      emailDigest: true,
      smsAlerts: false,
      twoFactor: true,
    };
    setPreferences(defaults);
    try {
      localStorage.setItem("woodverse-supplier-settings", JSON.stringify(defaults));
    } catch {}
    notifySupplierLanguageChange(defaults.language);
    setNotice("Settings reset to defaults.");
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(preferences, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "woodverse-supplier-settings.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice(t("Settings export downloaded."));
  };

  return (
    <main lang={preferences.language === "Sinhala" ? "si" : "en"} className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Settings" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder={t("Search settings...")} />
            </label>
            <div className="flex shrink-0 items-center gap-3">
              <button onClick={focusLanguageSelect} className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label={t("Language")}>
                <Globe2 className="h-5 w-5" />
              </button>
              <button
                onClick={onToggleTheme}
                className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]"
                aria-label={theme === "dark" ? t("Switch to light mode") : t("Switch to dark mode")}
                title={theme === "dark" ? t("Switch to light mode") : t("Switch to dark mode")}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button onClick={() => navigate("/supplier/apps")} className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label={t("Apps")}>
                <Grid3X3 className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-7 px-6 py-9 xl:px-10">
            <section className="grid grid-cols-[minmax(0,1fr)_260px] gap-6 max-lg:grid-cols-1">
              <div className="min-w-0">
                <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">{t("Settings")}</h1>
                <p className="mt-2 max-w-3xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">{t("Configure supplier portal preferences, notifications, automation, security, and connected API access.")}</p>
              </div>
              <article className="rounded-lg bg-[#2f6757] p-6 text-white shadow-soft">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/60">{t("Security Status")}</p>
                <strong className="mt-4 block text-3xl">{preferences.twoFactor ? t("Strong") : t("Basic")}</strong>
                <p className="mt-5 text-sm text-white/75">{preferences.twoFactor ? t("2FA enabled") : t("Enable 2FA recommended")}</p>
              </article>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="grid grid-cols-[minmax(0,1fr)_320px] gap-6 max-xl:grid-cols-1">
              <div className="grid gap-6">
                <form onSubmit={saveSettings} className="grid gap-5 rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">{t("Portal Preferences")}</h2>
                  <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
                    <SettingsSelect inputRef={languageSelectRef} label={t("Language")} name="language" value={preferences.language} options={["English", "Sinhala", "Tamil"]} language={preferences.language} onChange={(value) => updatePreference("language", value)} />
                    <SettingsSelect label={t("Timezone")} name="timezone" value={preferences.timezone} options={["Asia/Colombo", "UTC", "Asia/Dubai"]} language={preferences.language} onChange={(value) => updatePreference("timezone", value)} />
                    <SettingsSelect label={t("Default page")} name="defaultView" value={preferences.defaultView} options={["Dashboard", "Materials", "Shipments", "Vendors"]} language={preferences.language} onChange={(value) => updatePreference("defaultView", value)} />
                  </div>
                  <div className="flex justify-end gap-3 max-sm:flex-col">
                    <button type="button" onClick={resetSettings} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28]">{t("Reset")}</button>
                    <button type="submit" className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white">{t("Save Settings")}</button>
                  </div>
                </form>

                <section className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
                  <SettingsToggle title={t("Auto-assign shipments")} detail={t("Create shipment drafts when purchase orders are accepted.")} checked={preferences.autoAssignShipments} onChange={() => updatePreference("autoAssignShipments", !preferences.autoAssignShipments)} />
                  <SettingsToggle title={t("Low stock alerts")} detail={t("Notify operations before inventory reaches reorder threshold.")} checked={preferences.lowStockAlerts} onChange={() => updatePreference("lowStockAlerts", !preferences.lowStockAlerts)} />
                  <SettingsToggle title={t("Email digest")} detail={t("Send a daily summary for orders, materials, payouts, and compliance.")} checked={preferences.emailDigest} onChange={() => updatePreference("emailDigest", !preferences.emailDigest)} />
                  <SettingsToggle title={t("Shipment SMS alerts")} detail={t("Send SMS when shipments are delayed or rerouted.")} checked={preferences.smsAlerts} onChange={() => updatePreference("smsAlerts", !preferences.smsAlerts)} />
                </section>
              </div>

              <aside className="grid h-fit gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="text-xl font-extrabold text-[#115745] dark:text-emerald-200">{t("Security")}</h2>
                  <div className="mt-5 grid gap-3">
                    <SettingsToggle title={t("Two-factor auth")} detail={t("Require verification for payout and profile changes.")} checked={preferences.twoFactor} onChange={() => updatePreference("twoFactor", !preferences.twoFactor)} compact />
                    <ProfileInfoRow label={t("Password reset")} value={passwordResetSent ? t("Sent") : t("Not sent")} />
                    <ProfileInfoRow label={t("Active sessions")} value={String(activeSessions)} />
                    <button onClick={sendPasswordReset} className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 font-bold text-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-emerald-200">{t("Send Password Reset")}</button>
                    <button onClick={signOutOtherSessions} className="min-h-11 rounded-md bg-[#8b5633] px-4 font-bold text-white">{t("Sign Out Other Sessions")}</button>
                  </div>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-[#e9e5dc] p-6 shadow-sm dark:border-white/10 dark:bg-[#202b28]">
                  <h2 className="text-xl font-extrabold text-[#202621] dark:text-stone-100">{t("API Access")}</h2>
                  <div className="mt-5 grid gap-3 text-sm">
                    <ProfileInfoRow label={t("Socket URL")} value="localhost:4000" />
                    <ProfileInfoRow label={t("API key")} value={maskedKey} />
                  </div>
                  <div className="mt-5 grid gap-3">
                    <button onClick={() => setApiKeyVisible((visible) => !visible)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-4 font-bold text-[#115745] dark:border-white/10 dark:bg-[#18211f] dark:text-emerald-200">{apiKeyVisible ? t("Hide API Key") : t("Show API Key")}</button>
                    <button onClick={copyApiKey} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-4 font-bold text-[#115745] dark:border-white/10 dark:bg-[#18211f] dark:text-emerald-200">{t("Copy API Key")}</button>
                    <button onClick={exportSettings} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#115745] px-4 font-bold text-white">
                      <Download className="h-4 w-4" />
                      {t("Export Settings")}
                    </button>
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

function SettingsSelect({ label, name, value, options, language, onChange, inputRef }) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">{label}</span>
      <select ref={inputRef} name={name} value={value} onChange={(event) => onChange?.(event.target.value)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
        {options.map((option) => (
          <option key={option} value={option}>{supplierText(language, option)}</option>
        ))}
      </select>
    </label>
  );
}

function SettingsToggle({ title, detail, checked, onChange, compact = false }) {
  return (
    <article className={`rounded-lg border border-[#cbd2cd] bg-white shadow-sm dark:border-white/10 dark:bg-[#18211f] ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="min-w-0">
          <strong className="block break-words text-[#202621] dark:text-stone-100">{title}</strong>
          <span className="mt-1 block break-words text-sm leading-relaxed text-[#68716c] dark:text-stone-400">{detail}</span>
        </span>
        <button
          type="button"
          onClick={onChange}
          aria-pressed={checked}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-[#115745]" : "bg-[#aeb8b1] dark:bg-[#39433f]"}`}
        >
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
        </button>
      </div>
    </article>
  );
}

function SupplierAppsPage({ theme, onToggleTheme }) {
  const [notice, setNotice] = useState("Apps launcher ready.");
  const apps = [
    { icon: LayoutDashboard, title: "Dashboard", detail: "Operational overview, deliveries, notices, and yard status.", href: "/supplier" },
    { icon: ClipboardList, title: "Purchase Orders", detail: "Review order requests, accept POs, add notes, and prepare shipments.", href: "/supplier/purchase-orders/po-8921" },
    { icon: Boxes, title: "Materials", detail: "Manage timber inventory, pricing, stock levels, and material availability.", href: "/supplier/materials" },
    { icon: Truck, title: "Shipments", detail: "Track dispatches, logistics partners, route progress, and delivery exceptions.", href: "/supplier/shipments" },
    { icon: Handshake, title: "Vendors", detail: "Manage connected suppliers, onboarding, regional coverage, and contacts.", href: "/supplier/vendors" },
    { icon: Bell, title: "Notifications", detail: "Monitor PO alerts, shipment delays, payment updates, and stock warnings.", href: "/supplier/notifications" },
    { icon: UserRound, title: "Profile", detail: "Update business information, compliance documents, yards, and payouts.", href: "/supplier/profile" },
    { icon: CircleHelp, title: "Support", detail: "Create support tickets, contact operations, and browse supplier help topics.", href: "/supplier/support" },
    { icon: Settings, title: "Settings", detail: "Configure portal preferences, notifications, security, and API access.", href: "/supplier/settings" },
    { icon: Plus, title: "New Shipment", detail: "Create a shipment draft and assign logistics details to a purchase order.", href: "/supplier/shipments/new" },
  ];

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Apps" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search supplier apps..." />
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
              <button onClick={() => setNotice("You are already viewing the apps launcher.")} className="grid h-10 w-10 place-items-center rounded-full bg-[#eee9df] text-[#115745] dark:bg-[#202b28] dark:text-emerald-200" aria-label="Apps">
                <Grid3X3 className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-7 px-6 py-9 xl:px-10">
            <section className="min-w-0">
              <p className="mb-2 text-sm font-semibold text-[#4d5651] dark:text-stone-400">Supplier Portal</p>
              <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">Apps</h1>
              <p className="mt-2 max-w-3xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">Open supplier tools for orders, materials, shipments, vendors, notifications, profile management, and logistics creation.</p>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="grid grid-cols-4 gap-5 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {apps.map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.title}
                    onClick={() => navigate(app.href)}
                    className="grid min-h-52 content-start gap-4 rounded-lg border border-[#cbd2cd] bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#115745] hover:shadow-soft dark:border-white/10 dark:bg-[#18211f]"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-md bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="min-w-0">
                      <strong className="block break-words text-xl leading-tight text-[#202621] dark:text-stone-100">{app.title}</strong>
                      <span className="mt-2 block break-words text-sm leading-relaxed text-[#4d5651] dark:text-stone-300">{app.detail}</span>
                    </span>
                  </button>
                );
              })}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

export {
  SupplierDashboardPage,
  SupplierPurchaseOrderPage,
  SupplierMaterialsPage,
  SupplierShipmentsPage,
  SupplierNewShipmentPage,
  SupplierVendorsPage,
  SupplierNotificationsPage,
  SupplierProfilePage,
  SupplierSupportPage,
  SupplierSettingsPage,
  SupplierAppsPage,
};
