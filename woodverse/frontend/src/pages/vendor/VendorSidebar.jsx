import { useState } from "react";
import {
  LogOut,
  PlusCircle,
  Menu,
  X,
} from "lucide-react";
import { navigate, signOut } from "../../utils";
import { mobileNavigationItems, navigationItems } from "./navigation.js";

export function VendorSidebar({ active = "Dashboard", onNavigate, onNewOrder }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const openMobileItem = (path) => {
    setMobileMenuOpen(false);
    if (path) navigate(path);
  };

  return (
    <>
      <aside className="hidden border-r border-[#d8d2c7] bg-[#f3eee6] px-4 py-6 lg:sticky lg:top-0 lg:block lg:h-screen">
        <button onClick={() => onNavigate("Vendor dashboard opened.")} className="mb-7 flex items-center gap-3 px-3 text-left">
          <span className="h-10 w-10 shrink-0 rounded-lg bg-[#102f27] bg-no-repeat" style={{ backgroundImage: "url('/assets/admin-vendor-logo.webp')", backgroundSize: "500% auto", backgroundPosition: "25% 35%" }} aria-hidden="true" />
          <span><strong className="block text-xl font-extrabold text-[#115745]">WoodVerse</strong>
          <span className="text-sm font-semibold text-[#777b76]">Vendor Portal</span>
          </span>
        </button>

        <nav className="grid gap-1.5 text-sm font-bold">
          {navigationItems.map(([Icon, label, path]) => (
            <button
              key={label}
              onClick={() => (path ? navigate(path) : onNavigate(`${label} section opened.`))}
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-left transition ${active === label ? "bg-[#e1ddd4] text-[#115745] shadow-inner" : "text-[#46504b] hover:bg-[#e9e4dc] hover:text-[#115745]"}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="min-w-0">{label}</span>
            </button>
          ))}
        </nav>

        <button onClick={onNewOrder} className="mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0d4638]">
          <PlusCircle className="h-5 w-5" />
          New Order
        </button>

        <button onClick={signOut} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#c2cac5] px-4 text-sm font-extrabold text-[#d24b53] transition hover:bg-white">
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-x-3 bottom-[5.75rem] z-30 rounded-xl border border-[#c2cac5] bg-[#fffdf8] p-3 shadow-2xl lg:hidden">
          <div className="mb-2 flex items-center justify-between px-2">
            <strong className="text-sm text-[#202621]">Vendor navigation</strong>
            <button onClick={() => setMobileMenuOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg text-[#46504b] hover:bg-[#eeeae4]" aria-label="Close vendor navigation"><X className="h-5 w-5" /></button>
          </div>
          <nav className="grid grid-cols-2 gap-1.5">
            {navigationItems.filter(([, label]) => !mobileNavigationItems.some(([, mobileLabel]) => mobileLabel === label)).map(([Icon, label, path]) => (
              <button key={label} onClick={() => openMobileItem(path)} className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-left text-xs font-extrabold ${active === label ? "bg-[#e1ddd4] text-[#115745]" : "text-[#46504b] hover:bg-[#eeeae4]"}`}>
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
            <button onClick={onNewOrder} className="flex min-h-11 items-center gap-2 rounded-lg bg-[#115745] px-3 text-left text-xs font-extrabold text-white">
              <PlusCircle className="h-4 w-4 shrink-0" />
              <span>New Order</span>
            </button>
          </nav>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-[#c2cac5] bg-[#fffdf8]/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(48,56,51,0.08)] backdrop-blur lg:hidden" aria-label="Mobile vendor navigation">
        {mobileNavigationItems.map(([Icon, label, path]) => (
          <button key={label} onClick={() => openMobileItem(path)} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-extrabold leading-tight ${active === label ? "bg-[#e1ddd4] text-[#115745]" : "text-[#68716c]"}`} aria-current={active === label ? "page" : undefined}>
            <Icon className="h-5 w-5" />
            <span>{label === "Customer Orders" ? "Orders" : label === "Production Tracking" ? "Production" : label}</span>
          </button>
        ))}
        <button onClick={() => setMobileMenuOpen((value) => !value)} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-extrabold leading-tight ${mobileMenuOpen ? "bg-[#e1ddd4] text-[#115745]" : "text-[#68716c]"}`} aria-expanded={mobileMenuOpen} aria-label="More vendor navigation"><Menu className="h-5 w-5" /><span>More</span></button>
      </nav>
    </>
  );
}
