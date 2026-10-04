import { useState } from "react";
import {
  ArrowRight,
  CreditCard,
  Download,
  Home,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";
import { navigate, formatPrice, getSession } from "../../utils";
import { Footer } from "../../components/LayoutParts";
import { getFutureDateLabel } from "../../lib/dates.js";

// Each trade role works in its own portal. Without this the storefront has no route
// into them, so a signed in vendor or supplier could only get there by typing a URL.
export const workspaceByRole = {
  vendor: { label: "Vendor workspace", detail: "Products, quotations, production, inventory, and shipments.", href: "/vendor-dashboard" },
  supplier: { label: "Supplier portal", detail: "Materials, purchase orders, shipments, and your supplier profile.", href: "/supplier" },
  admin: { label: "Admin console", detail: "WoodVerse ERP for customers, vendors, orders, and platform settings.", href: "/admin" },
};

// Writes a file to the visitor's device. The object URL is released immediately, so a
// long session does not keep the blob alive.
export function downloadTextFile(filename, contents, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildInvoice(order, customer) {
  const lines = [
    "WOODVERSE INVOICE",
    `Invoice number: ${order.id}`,
    `Order date: ${order.date}`,
    `Status: ${order.status}`,
    "",
    `Billed to: ${customer.fullName}`,
    `Email: ${customer.email}`,
    "",
    "Items",
    ...order.items.map((item, index) => `${index + 1}. ${item}`),
    "",
    `Total paid: ${formatPrice(order.total)}`,
    `Payment method: ${order.payment}`,
    `Delivery: ${order.delivery}`,
  ];
  return lines.join("\n");
}

export function ProfilePage({ isLoggedIn, role, onLogout }) {
  const defaultProfile = {
    fullName: "WoodVerse Customer",
    email: "customer@woodverse.lk",
    phone: "+94 77 245 9012",
    city: "Colombo, Sri Lanka",
    notes: "Call before delivery. Prefer weekend drop-offs.",
  };
  const [profileInfo, setProfileInfo] = useState(() => {
    try {
      const session = getSession();

      if (session?.user) {
        return {
          ...defaultProfile,
          ...session.user,
          fullName:
            session.user.fullName ||
            session.user.full_name ||
            defaultProfile.fullName,
          email: session.user.email || defaultProfile.email,
        };
      }

      if (session) {
        return {
          ...defaultProfile,
          ...session,
          fullName:
            session.fullName ||
            session.full_name ||
            defaultProfile.fullName,
          email: session.email || defaultProfile.email,
        };
      }

      const savedProfile = JSON.parse(
        localStorage.getItem("woodverse-profile-info") || "null"
      );

      return savedProfile
        ? { ...defaultProfile, ...savedProfile }
        : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const workspace = workspaceByRole[role] || null;
  const [paymentPreferences, setPaymentPreferences] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-payment-preferences")) || {
        defaultMethod: "card",
        saveForCheckout: true,
      };
    } catch {
      return {
        defaultMethod: "card",
        saveForCheckout: true,
      };
    }
  });
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deliveryAddresses, setDeliveryAddresses] = useState([
    {
      id: "home",
      label: "Home",
      status: "Default",
      name: "WoodVerse Customer",
      line: "42 Lake View Road, Colombo 05",
      details: "Colombo, Western Province 00500",
      phone: "+94 77 245 9012",
    },
    {
      id: "workshop",
      label: "Workshop",
      status: "Backup",
      name: "Urban Log Studio",
      line: "18 Timber Lane, Moratuwa",
      details: "Moratuwa, Western Province 10400",
      phone: "+94 71 882 4410",
    },
  ]);

  const saveDeliveryAddress = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const city = formData.get("city").trim();
    const postalCode = formData.get("postalCode").trim();
    const savedAddress = {
      id: editingAddress?.id || `address-${Date.now()}`,
      label: formData.get("label").trim(),
      status: editingAddress?.status || "New",
      name: formData.get("name").trim(),
      line: formData.get("line").trim(),
      details: postalCode ? `${city} ${postalCode}` : city,
      phone: formData.get("phone").trim(),
    };
    setDeliveryAddresses((addresses) => editingAddress
      ? addresses.map((address) => (address.id === editingAddress.id ? savedAddress : address))
      : [...addresses, savedAddress]);
    event.currentTarget.reset();
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const useDeliveryAddress = (id) => {
    setDeliveryAddresses((addresses) => addresses.map((address) => ({
      ...address,
      status: address.id === id ? "Default" : address.status === "Default" ? "Backup" : address.status,
    })));
  };

  const editDeliveryAddress = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const closeDeliveryAddressForm = () => {
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const saveProfileInfo = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextProfileInfo = {
      fullName: formData.get("fullName").trim(),
      email: formData.get("email").trim(),
      phone: formData.get("phone").trim(),
      city: formData.get("city").trim(),
      notes: formData.get("notes").trim(),
    };
    setProfileInfo(nextProfileInfo);
    setProfileSaved(true);
    try {
      localStorage.setItem("woodverse-profile-info", JSON.stringify(nextProfileInfo));
    } catch {}
  };

  const updatePaymentPreference = (nextPreferences) => {
    setPaymentPreferences(nextPreferences);
    setPaymentSaved(true);
    try {
      localStorage.setItem("woodverse-payment-preferences", JSON.stringify(nextPreferences));
    } catch {}
  };

  const selectPaymentMethod = (methodId) => {
    updatePaymentPreference({
      ...paymentPreferences,
      defaultMethod: methodId,
    });
  };

  const toggleSavedPayment = () => {
    updatePaymentPreference({
      ...paymentPreferences,
      saveForCheckout: !paymentPreferences.saveForCheckout,
    });
  };

  if (!isLoggedIn) {
    return (
      <>
        <section className="page-shell grid min-h-[calc(100svh-56px)] place-items-center py-14 text-center">
          <div className="max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-700 dark:bg-[#202624]">
            <UserRound className="mx-auto h-10 w-10 text-forest dark:text-emerald-200" />
            <h1 className="mt-4 text-2xl font-bold text-slate-800 dark:text-stone-100">Sign in to view your profile</h1>
            <p className="mt-3 leading-relaxed text-slate-500 dark:text-stone-400">Your WoodVerse profile appears here after login.</p>
            <button onClick={() => navigate("/login")} className="mt-6 rounded-md bg-forest px-6 py-3 font-bold text-white">Login</button>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <section className="page-shell grid grid-cols-[minmax(0,1fr)_320px] gap-8 py-14 max-lg:grid-cols-1">
        <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-700 dark:bg-[#202624]">
          <div className="flex min-w-0 items-center gap-5 max-sm:flex-col max-sm:items-start">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-forest text-2xl font-extrabold text-white">WV</span>
            <div className="min-w-0">
              <p className="eyebrow mb-3">My Profile</p>
              <h1 className="break-words text-3xl font-bold leading-tight text-slate-800 dark:text-stone-100">{profileInfo.fullName}</h1>
              <p className="mt-2 break-words text-slate-500 dark:text-stone-400">{profileInfo.email}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            {[
              ["Active orders", "2"],
              ["Saved items", "8"],
              ["Support tickets", "1"],
            ].map(([label, value]) => (
              <article key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-[#1d2422]">
                <strong className="text-2xl text-forest dark:text-emerald-200">{value}</strong>
                <p className="mt-2 break-words text-sm font-bold text-slate-600 dark:text-stone-300">{label}</p>
              </article>
            ))}
          </div>

          <section className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-700">
            <div className="mb-6 flex min-w-0 items-start justify-between gap-5 max-sm:flex-col">
              <div className="min-w-0">
                <h2 className="break-words text-xl font-bold leading-tight text-slate-800 dark:text-stone-100">Personal Information</h2>
                <p className="mt-1 break-words leading-snug text-slate-500 dark:text-stone-400">Manage the contact details used for orders, delivery updates, and support.</p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold uppercase text-forest dark:border-emerald-900 dark:bg-[#1d2422] dark:text-emerald-200">Verified</span>
            </div>

            <form key={JSON.stringify(profileInfo)} onSubmit={saveProfileInfo} onChange={() => setProfileSaved(false)} className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
              <ProfileField label="Full name" name="fullName" defaultValue={profileInfo.fullName} icon={UserRound} />
              <ProfileField label="Email address" name="email" defaultValue={profileInfo.email} type="email" icon={Mail} />
              <ProfileField label="Phone number" name="phone" defaultValue={profileInfo.phone} type="tel" icon={Phone} />
              <ProfileField label="City / District" name="city" defaultValue={profileInfo.city} icon={MapPin} />
              <label className="grid min-w-0 gap-2 sm:col-span-2">
                <span className="text-sm font-bold text-slate-700 dark:text-stone-100">Delivery notes</span>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={profileInfo.notes}
                  className="min-w-0 resize-none rounded-md border border-slate-200 bg-blue-50 px-4 py-3 leading-relaxed text-slate-700 outline-none focus:border-forest dark:border-slate-700 dark:bg-[#1d2422] dark:text-stone-100"
                />
              </label>
              <div className="flex min-w-0 items-center justify-end gap-3 sm:col-span-2 max-sm:flex-col">
                {profileSaved && <p className="mr-auto break-words text-sm font-bold text-forest dark:text-emerald-200 max-sm:w-full">Personal information saved.</p>}
                <button type="reset" className="min-h-11 rounded-md border border-slate-200 px-5 font-bold text-slate-600 dark:border-slate-700 dark:text-stone-300 max-sm:w-full">Cancel</button>
                <button type="submit" className="min-h-11 rounded-md bg-forest px-5 font-bold text-white max-sm:w-full">Save Changes</button>
              </div>
            </form>
          </section>

          <section className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-700">
            <div className="mb-6 flex min-w-0 items-start justify-between gap-5 max-sm:flex-col">
              <div className="min-w-0">
                <h2 className="break-words text-xl font-bold leading-tight text-slate-800 dark:text-stone-100">Delivery Addresses</h2>
                <p className="mt-1 break-words leading-snug text-slate-500 dark:text-stone-400">Choose where WoodVerse orders should be delivered and keep backup addresses ready.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setShowAddressForm((visible) => !visible);
                }}
                className="inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-md bg-forest px-4 font-bold leading-tight text-white max-sm:w-full"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span className="min-w-0 break-words">{showAddressForm && !editingAddress ? "Close Form" : "Add Address"}</span>
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={saveDeliveryAddress} className="mb-5 grid grid-cols-2 gap-4 rounded-lg border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-[#1d2422] max-sm:grid-cols-1">
                <div className="min-w-0 sm:col-span-2">
                  <h3 className="break-words text-lg font-bold leading-tight text-slate-800 dark:text-stone-100">{editingAddress ? "Edit Address" : "Add Address"}</h3>
                  <p className="mt-1 break-words text-sm leading-snug text-slate-500 dark:text-stone-400">{editingAddress ? "Update the selected delivery address." : "Add a new delivery location to your profile."}</p>
                </div>
                <AddressField label="Address label" name="label" placeholder="Home, Office, Workshop" defaultValue={editingAddress?.label} />
                <AddressField label="Recipient name" name="name" placeholder="Full name" defaultValue={editingAddress?.name} />
                <AddressField label="Street address" name="line" placeholder="Street, building, apartment" defaultValue={editingAddress?.line} className="sm:col-span-2" />
                <AddressField label="City / District" name="city" placeholder="Colombo, Western Province" defaultValue={editingAddress?.details} />
                <AddressField label="Postal code" name="postalCode" placeholder="00500" required={false} />
                <AddressField label="Phone number" name="phone" placeholder="+94 77 000 0000" type="tel" defaultValue={editingAddress?.phone} className="sm:col-span-2" />
                <div className="flex justify-end gap-3 sm:col-span-2 max-sm:flex-col">
                  <button type="button" onClick={closeDeliveryAddressForm} className="min-h-10 rounded-md border border-slate-200 bg-white px-4 font-bold text-slate-600 dark:border-slate-700 dark:bg-[#202624] dark:text-stone-300">Cancel</button>
                  <button type="submit" className="min-h-10 rounded-md bg-forest px-4 font-bold text-white">{editingAddress ? "Update Address" : "Save Address"}</button>
                </div>
              </form>
            )}

            <div className="grid gap-4">
              {deliveryAddresses.map((address) => (
                <article key={address.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-[#1d2422] max-sm:grid-cols-1">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-forest shadow-sm dark:bg-[#202624] dark:text-emerald-200">
                    <Home className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h3 className="break-words font-bold leading-tight text-slate-800 dark:text-stone-100">{address.label}</h3>
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-extrabold uppercase text-slate-500 dark:border-slate-700 dark:bg-[#202624] dark:text-stone-400">{address.status}</span>
                    </div>
                    <p className="mt-2 break-words font-semibold leading-snug text-slate-700 dark:text-stone-200">{address.name}</p>
                    <p className="mt-1 break-words leading-snug text-slate-500 dark:text-stone-400">{address.line}</p>
                    <p className="break-words leading-snug text-slate-500 dark:text-stone-400">{address.details}</p>
                    <p className="mt-2 break-words text-sm font-bold leading-snug text-forest dark:text-emerald-200">{address.phone}</p>
                  </div>
                  <div className="flex shrink-0 items-start gap-2 max-sm:w-full">
                    <button type="button" onClick={() => editDeliveryAddress(address)} className="min-h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 dark:border-slate-700 dark:bg-[#202624] dark:text-stone-300 max-sm:flex-1">Edit</button>
                    <button type="button" onClick={() => useDeliveryAddress(address.id)} disabled={address.status === "Default"} className="min-h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-forest disabled:cursor-default disabled:text-slate-400 dark:border-slate-700 dark:bg-[#202624] dark:text-emerald-200 dark:disabled:text-stone-500 max-sm:flex-1">{address.status === "Default" ? "Using" : "Use"}</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-700">
            <div className="mb-6 flex min-w-0 items-start justify-between gap-5 max-sm:flex-col">
              <div className="min-w-0">
                <h2 className="break-words text-xl font-bold leading-tight text-slate-800 dark:text-stone-100">Payment Preferences</h2>
                <p className="mt-1 break-words leading-snug text-slate-500 dark:text-stone-400">Choose the default payment method used during checkout.</p>
              </div>
              {paymentSaved && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold uppercase text-forest dark:border-emerald-900 dark:bg-[#1d2422] dark:text-emerald-200">Saved</span>}
            </div>

            <div className="grid gap-4">
              {[
                { id: "card", title: "Credit or debit card", detail: "Visa ending 4821", helper: "Fastest checkout option" },
                { id: "bank", title: "Bank transfer", detail: "Manual confirmation", helper: "Best for large furniture orders" },
                { id: "cod", title: "Cash on delivery deposit", detail: "Pay deposit at delivery handoff", helper: "Available in selected districts" },
              ].map((method) => {
                const active = paymentPreferences.defaultMethod === method.id;
                return (
                  <article key={method.id} className={`grid grid-cols-[auto_minmax(0,1fr)_auto] gap-4 rounded-lg border p-5 dark:bg-[#1d2422] max-sm:grid-cols-1 ${active ? "border-forest bg-emerald-50/70 dark:border-emerald-700" : "border-slate-200 bg-slate-50 dark:border-slate-700"}`}>
                    <span className={`grid h-11 w-11 place-items-center rounded-full shadow-sm ${active ? "bg-forest text-white" : "bg-white text-forest dark:bg-[#202624] dark:text-emerald-200"}`}>
                      <CreditCard className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="break-words font-bold leading-tight text-slate-800 dark:text-stone-100">{method.title}</h3>
                        {active && <span className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[11px] font-extrabold uppercase text-forest dark:border-emerald-900 dark:bg-[#202624] dark:text-emerald-200">Default</span>}
                      </div>
                      <p className="mt-2 break-words font-semibold leading-snug text-slate-700 dark:text-stone-200">{method.detail}</p>
                      <p className="mt-1 break-words leading-snug text-slate-500 dark:text-stone-400">{method.helper}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectPaymentMethod(method.id)}
                      disabled={active}
                      className="min-h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-forest disabled:cursor-default disabled:text-slate-400 dark:border-slate-700 dark:bg-[#202624] dark:text-emerald-200 dark:disabled:text-stone-500 max-sm:w-full"
                    >
                      {active ? "Using" : "Use"}
                    </button>
                  </article>
                );
              })}
            </div>

            <label className="mt-5 flex min-w-0 items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#1d2422]">
              <input type="checkbox" checked={paymentPreferences.saveForCheckout} onChange={toggleSavedPayment} className="mt-1 shrink-0 accent-forest" />
              <span className="min-w-0">
                <span className="block break-words font-bold leading-snug text-slate-700 dark:text-stone-100">Remember payment preference for checkout</span>
                <span className="mt-1 block break-words text-sm leading-snug text-slate-500 dark:text-stone-400">WoodVerse will preselect this method when you place your next order.</span>
              </span>
            </label>
          </section>

          <section className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-700">
            <div className="mb-6 flex min-w-0 items-start justify-between gap-5 max-sm:flex-col">
              <div className="min-w-0">
                <h2 className="break-words text-xl font-bold leading-tight text-slate-800 dark:text-stone-100">Order History</h2>
                <p className="mt-1 break-words leading-snug text-slate-500 dark:text-stone-400">Review recent WoodVerse orders, delivery status, and order totals.</p>
              </div>
              <button onClick={() => navigate("/shop")} className="inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 font-bold leading-tight text-forest dark:border-slate-700 dark:bg-[#202624] dark:text-emerald-200 max-sm:w-full">
                <span className="min-w-0 break-words">Shop Again</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            </div>

            <div className="grid gap-4">
              {[
                {
                  id: "WV-10482",
                  date: "Jul 24, 2026",
                  status: "In production",
                  statusTone: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900",
                  items: ["Walnut Task Table", "Teak Desk Tray"],
                  total: 87000,
                  delivery: "Estimated Aug 2, 2026",
                  payment: "Credit or debit card",
                },
                {
                  id: "WV-10391",
                  date: "Jul 18, 2026",
                  status: "Delivered",
                  statusTone: "bg-emerald-50 text-forest border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900",
                  items: ["Housewarming Gift Set", "Bamboo Coaster Set"],
                  total: 28800,
                  delivery: "Delivered Jul 21, 2026",
                  payment: "Bank transfer",
                },
                {
                  id: "WV-10277",
                  date: "Jun 30, 2026",
                  status: "Cancelled",
                  statusTone: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900",
                  items: ["Heritage Sideboard"],
                  total: 112500,
                  delivery: "Cancelled before dispatch",
                  payment: "Cash on delivery deposit",
                },
              ].map((order) => {
                const expanded = expandedOrder === order.id;
                return (
                  <article key={order.id} className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-[#1d2422]">
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-4 max-sm:grid-cols-1">
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-forest shadow-sm dark:bg-[#202624] dark:text-emerald-200">
                        <PackageCheck className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h3 className="break-words font-bold leading-tight text-slate-800 dark:text-stone-100">{order.id}</h3>
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-extrabold uppercase ${order.statusTone}`}>{order.status}</span>
                        </div>
                        <p className="mt-2 break-words text-sm font-semibold leading-snug text-slate-500 dark:text-stone-400">{order.date}</p>
                        <p className="mt-1 break-words leading-snug text-slate-700 dark:text-stone-200">{order.items.join(", ")}</p>
                      </div>
                      <div className="grid justify-items-end gap-2 max-sm:justify-items-stretch">
                        <strong className="break-words text-right text-lg leading-tight text-forest dark:text-emerald-200 max-sm:text-left">{formatPrice(order.total)}</strong>
                        <button type="button" onClick={() => setExpandedOrder(expanded ? null : order.id)} className="min-h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-forest dark:border-slate-700 dark:bg-[#202624] dark:text-emerald-200">
                          {expanded ? "Hide Details" : "View Details"}
                        </button>
                      </div>
                    </div>
                    {expanded && (
                      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-200 pt-5 dark:border-slate-700 max-sm:grid-cols-1">
                        <OrderDetail label="Delivery" value={order.delivery} />
                        <OrderDetail label="Payment" value={order.payment} />
                        <OrderDetail label="Items" value={`${order.items.length} product${order.items.length === 1 ? "" : "s"}`} />
                        <div className="flex gap-2 sm:col-span-3 max-sm:flex-col">
                          <button type="button" onClick={() => navigate("/chatbot")} className="min-h-10 rounded-md bg-forest px-4 font-bold text-white">Track Order</button>
                          <button type="button" onClick={() => downloadTextFile(`woodverse-invoice-${order.id}.txt`, buildInvoice(order, profileInfo))} className="min-h-10 rounded-md border border-slate-200 bg-white px-4 font-bold text-slate-600 dark:border-slate-700 dark:bg-[#202624] dark:text-stone-300">Download Invoice</button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#202624]">
          {workspace && (
            <>
              <h2 className="text-xl font-bold text-slate-800 dark:text-stone-100">{workspace.label}</h2>
              <p className="mt-2 break-words text-sm leading-relaxed text-slate-500 dark:text-stone-400">{workspace.detail}</p>
              <button onClick={() => navigate(workspace.href)} className="mt-4 w-full rounded-md bg-forest px-4 py-3 font-bold text-white">Open {workspace.label}</button>
            </>
          )}
          <h2 className={`text-xl font-bold text-slate-800 dark:text-stone-100 ${workspace ? "mt-7 border-t border-slate-200 pt-6 dark:border-slate-700" : ""}`}>Account Actions</h2>
          <button onClick={() => navigate("/cart")} className="mt-5 w-full rounded-md border border-slate-200 px-4 py-3 font-bold text-forest dark:border-slate-700 dark:text-emerald-200">View Cart</button>
          <button onClick={() => navigate("/shop")} className="mt-3 w-full rounded-md border border-slate-200 px-4 py-3 font-bold text-forest dark:border-slate-700 dark:text-emerald-200">Continue Shopping</button>
          <button onClick={onLogout} className="mt-3 w-full rounded-md bg-forest px-4 py-3 font-bold text-white">Logout</button>
        </aside>
      </section>
      <Footer />
    </>
  );
}

export function AddressField({ label, name, placeholder, type = "text", defaultValue = "", required = true, className = "" }) {
  return (
    <label className={`grid min-w-0 gap-2 ${className}`}>
      <span className="text-sm font-bold text-slate-700 dark:text-stone-100">{label}</span>
      <input
        required={required}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="min-h-11 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-slate-700 outline-none focus:border-forest dark:border-slate-700 dark:bg-[#202624] dark:text-stone-100"
      />
    </label>
  );
}

export function OrderDetail({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-[#202624]">
      <p className="text-xs font-extrabold uppercase text-slate-400 dark:text-stone-500">{label}</p>
      <p className="mt-1 break-words text-sm font-bold leading-snug text-slate-700 dark:text-stone-200">{value}</p>
    </div>
  );
}

export function ProfileField({ label, name, defaultValue, type = "text", icon: Icon }) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-sm font-bold text-slate-700 dark:text-stone-100">{label}</span>
      <span className="flex min-h-12 min-w-0 items-center gap-3 rounded-md border border-slate-200 bg-blue-50 px-4 focus-within:border-forest dark:border-slate-700 dark:bg-[#1d2422]">
        <Icon className="h-5 w-5 shrink-0 text-slate-400 dark:text-stone-500" />
        <input
          required
          name={name}
          type={type}
          defaultValue={defaultValue}
          className="min-w-0 flex-1 bg-transparent text-slate-700 outline-none dark:text-stone-100"
        />
      </span>
    </label>
  );
}

export function getStoredCustomerProfile() {
  try {
    return JSON.parse(localStorage.getItem("woodverse-profile-info")) || { fullName: "WoodVerse Customer" };
  } catch {
    return { fullName: "WoodVerse Customer" };
  }
}

export function getCustomerInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "WC";
}

export function getNextVendorOrderId() {
  try {
    const existing = JSON.parse(localStorage.getItem("woodverse-vendor-orders") || "null") || [];
    const numericIds = existing.map((order) => Number(String(order.id).replace("#WV-", ""))).filter(Boolean);
    return `#WV-${Math.max(...numericIds, 9482) + 1}`;
  } catch {
    return `#WV-${Date.now().toString().slice(-4)}`;
  }
}

export function buildCustomerFulfillmentPlan(orderItems) {
  return orderItems.map((item) => {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const stockType = item.stockType || "review";
    const mustManufacture = stockType === "out";
    return {
      name: item.name,
      vendor: item.vendor,
      quantity,
      stock: item.stock || "Needs stock check",
      stockType,
      decision: mustManufacture ? "manufacture" : "stock",
      reason: mustManufacture
        ? "Catalog marks this item as out of stock."
        : "Catalog stock is available for customer fulfillment.",
    };
  });
}
