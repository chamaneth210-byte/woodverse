import { useEffect, useState } from "react";
import {
  Bell,
  HelpCircle,
  Search,
  Settings,
} from "lucide-react";
import { navigate } from "../../utils";
import { getVendorIdentity, getVendorInitials, loadVendorIdentity } from "./identity.js";

export function VendorHeader({ onAction, onNotifications, unreadCount, status }) {
  // Re-read after the fetch resolves; the synchronous getter is what renders.
  const [identity, setIdentity] = useState(getVendorIdentity);
  const { businessName, ownerName, verificationStatus } = identity;
  const initials = getVendorInitials();
  const roleLabel = verificationStatus === "approved" ? "Verified Vendor" : "Pending Verification";

  // Every vendor screen renders this header, so resolving the identity here
  // covers the whole portal in one place. The first paint uses the seeded
  // fallback and re-renders once the real vendor row arrives.
  useEffect(() => {
    let active = true;
    loadVendorIdentity().then((resolved) => {
      if (active) setIdentity(resolved);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-10 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#d4d1ca] bg-[#fbf8f1]/95 px-5 py-3 backdrop-blur sm:px-8 lg:px-10">
      <label className="flex h-10 w-full max-w-[520px] items-center rounded-full bg-[#eeeae4] px-4 text-[#747a76]">
        <Search className="h-5 w-5 shrink-0" />
        <input className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" placeholder="Search orders, products..." />
      </label>

      <div className="ml-auto flex min-w-0 items-center justify-end gap-2.5 sm:gap-4">
        <button onClick={onNotifications} className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#3d4541] transition hover:bg-[#eeeae4]" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#d24b53] px-1 text-[10px] font-extrabold text-white">{unreadCount}</span>}
        </button>
        <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold uppercase sm:inline-flex ${status === "Connected" ? "bg-[#d9ecd8] text-[#115745]" : "bg-[#fff0cd] text-[#8b5633]"}`}>
          {status}
        </span>
        <button onClick={() => navigate("/vendor/settings")} className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition hover:bg-[#eeeae4]" aria-label="Settings"><Settings className="h-5 w-5" /></button>
        <button onClick={() => navigate("/vendor/help")} className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition hover:bg-[#eeeae4]" aria-label="Help"><HelpCircle className="h-5 w-5" /></button>
        <span className="hidden h-8 w-px shrink-0 bg-[#d4d1ca] sm:block" />
        <div className="hidden min-w-0 text-right sm:block">
          <strong className="block truncate leading-tight text-[#202621]" title={businessName}>{businessName}</strong>
          <span className="block text-xs font-bold uppercase tracking-wide text-[#68716c]">{roleLabel}</span>
        </div>
        <button onClick={() => navigate("/vendor/profile")} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#115745] bg-[#d8c0a4] font-extrabold text-[#115745]" aria-label="Vendor profile" title={ownerName}>{initials}</button>
      </div>
    </header>
  );
}
