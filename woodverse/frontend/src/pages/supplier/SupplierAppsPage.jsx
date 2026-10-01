import { useState } from "react";
import {
  Bell,
  Boxes,
  CircleHelp,
  ClipboardList,
  Globe2,
  Grid3X3,
  Handshake,
  LayoutDashboard,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  Truck,
  UserRound,
} from "lucide-react";
import { navigate } from "../../utils";
import { SupplierSidebar } from "./SupplierSidebar";

export function SupplierAppsPage({ theme, onToggleTheme }) {
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
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/90 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/90 xl:px-10">
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
