import { useState } from "react";
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Download,
  Globe2,
  Grid3X3,
  Moon,
  Navigation,
  Plus,
  Search,
  Sun,
  Timer,
  Truck,
  X,
} from "lucide-react";
import { navigate } from "../../utils";
import { SupplierSidebar } from "./SupplierSidebar";
import { SupplierProgress } from "./shared";

export function SupplierShipmentsPage({ theme, onToggleTheme }) {
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
        <SupplierSidebar active="Shipments" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/90 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/90 xl:px-10">
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

export function ShipmentSummaryCard({ icon: Icon, label, value, helper, warning = false }) {
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

export function ShipmentDetailTile({ label, value }) {
  return (
    <article className="rounded-md border border-[#cbd2cd] bg-[#fbf8f1] p-4 dark:border-white/10 dark:bg-[#202b28]">
      <span className="text-xs font-extrabold uppercase tracking-wide text-[#68716c] dark:text-stone-400">{label}</span>
      <strong className="mt-2 block break-words text-lg leading-tight text-[#202621] dark:text-stone-100">{value}</strong>
    </article>
  );
}

export function ManifestRow({ label, value }) {
  return (
    <div className="rounded-md border border-[#cbd2cd] bg-[#fbf8f1] p-4 dark:border-white/10 dark:bg-[#202b28]">
      <span className="text-xs font-extrabold uppercase tracking-wide text-[#68716c] dark:text-stone-400">{label}</span>
      <strong className="mt-2 block break-words text-[#202621] dark:text-stone-100">{value}</strong>
    </div>
  );
}

export function getShipmentStages(shipment) {
  return [
    { label: "Dispatch confirmed", detail: shipment.pickup, done: true },
    { label: "Loaded and sealed", detail: `${shipment.load} - Seal ${shipment.seal}`, done: shipment.status !== "Scheduled" },
    { label: "In transit", detail: shipment.driver, done: shipment.status === "In Transit" || shipment.status === "Delayed" },
    { label: "Customer handoff", detail: shipment.eta, done: shipment.status === "Delivered" },
  ];
}

export function downloadShipmentManifest(shipment, setNotice) {
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
