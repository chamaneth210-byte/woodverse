import { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Download,
  Globe2,
  Moon,
  Search,
  Sun,
  Truck,
} from "lucide-react";
import { navigate } from "../../utils";
import { SupplierSidebar } from "./SupplierSidebar";
import { ProfileInfoRow, SupplierProfileField, SupplierProgress } from "./shared";

export function SupplierNewShipmentPage({ theme, onToggleTheme }) {
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
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/90 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/90 xl:px-10">
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
