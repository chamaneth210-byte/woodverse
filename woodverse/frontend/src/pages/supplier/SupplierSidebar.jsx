import {
  Bell,
  Boxes,
  CircleHelp,
  ClipboardList,
  Handshake,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Truck,
  UserRound,
} from "lucide-react";
import { navigate, signOut } from "../../utils";
import { BrandLogo } from "../../components/BrandLogo";
import { supplierText, useSupplierLanguage } from "./i18n.js";

export const supplierNavItems = [
  [LayoutDashboard, "Dashboard", "/supplier"],
  [ClipboardList, "Purchase Orders", "/supplier/purchase-orders/po-8921"],
  [Boxes, "Materials", "/supplier/materials"],
  [Truck, "Shipments", "/supplier/shipments"],
  [Handshake, "Vendors", "/supplier/vendors"],
  [Bell, "Notifications", "/supplier/notifications"],
  [UserRound, "Profile", "/supplier/profile"],
];

export function SupplierSidebar({ active, onUnavailable }) {
  const language = useSupplierLanguage();
  const t = (text) => supplierText(language, text);
  const navItems = supplierNavItems;

  return (
    <>
    <nav className="flex items-center gap-2 overflow-x-auto border-b border-[#5b513f] bg-[#332a1a] px-3 py-3 text-[14px] font-extrabold lg:hidden" aria-label="Supplier navigation">
      {navItems.map(([Icon, label, href]) => {
        const selected = active === label;
        return (
          <button
            key={label}
            onClick={() => (href ? navigate(href) : onUnavailable?.(label))}
            aria-current={selected ? "page" : undefined}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 transition ${
              selected
                ? "bg-[#00614d] text-white"
                : "text-[#d8c9b5] hover:bg-[#2d2616] hover:text-[#6ff4db]"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={2.2} />
            <span className="whitespace-nowrap">{t(label)}</span>
          </button>
        );
      })}
      <button onClick={() => navigate("/supplier/support")} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 transition ${active === "Support" ? "bg-[#00614d] text-white" : "text-[#c8bba8] hover:bg-[#2d2616] hover:text-[#6ff4db]"}`}>
        <CircleHelp className="h-4 w-4 shrink-0" strokeWidth={2.2} />
        <span className="whitespace-nowrap">{t("Support")}</span>
      </button>
      <button onClick={() => navigate("/supplier/settings")} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 transition ${active === "Settings" ? "bg-[#00614d] text-white" : "text-[#c8bba8] hover:bg-[#2d2616] hover:text-[#6ff4db]"}`}>
        <Settings className="h-4 w-4 shrink-0" strokeWidth={2.2} />
        <span className="whitespace-nowrap">{t("Settings")}</span>
      </button>
      <button onClick={() => navigate("/supplier/shipments/new")} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-[#00614d] px-4 text-white transition hover:bg-[#08715c]">
        <Plus className="h-4 w-4 shrink-0" strokeWidth={2.2} />
        <span className="whitespace-nowrap">{t("New Shipment")}</span>
      </button>
      <button onClick={signOut} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[#e8a3a3] transition hover:bg-[#2d2616] hover:text-[#ff9b9b]">
        <LogOut className="h-4 w-4 shrink-0" strokeWidth={2.2} />
        <span className="whitespace-nowrap">Log out</span>
      </button>
    </nav>

    <aside className="relative hidden border-r border-[#5b513f] bg-[#332a1a] text-[#e3d8c8] lg:sticky lg:top-0 lg:block lg:h-screen">
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
        <button onClick={signOut} className="mt-2 flex min-h-10 w-full items-center gap-3 border-t border-[#5b513f] px-3 pt-3 text-left text-[15px] text-[#e8a3a3] transition hover:text-[#ff9b9b]">
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
    </>
  );
}
