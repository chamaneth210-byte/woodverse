import { useState } from "react";
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  Globe2,
  Grid3X3,
  Layers,
  Mail,
  MapPin,
  Moon,
  Phone,
  Plus,
  Search,
  Sun,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { navigate } from "../../utils";
import { SupplierSidebar } from "./SupplierSidebar";

export function SupplierPurchaseOrderPage({ theme, onToggleTheme }) {
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
        <SupplierSidebar active="Purchase Orders" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/90 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/90 xl:px-8">
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

export function SpecBox({ label, value }) {
  return (
    <div className="grid min-h-24 content-center rounded-md border border-[#e1dfd7] bg-[#f4f0e8] p-4 dark:border-white/10 dark:bg-[#202b28]">
      <span className="text-xs font-extrabold uppercase tracking-wide text-[#4d5651] dark:text-stone-400">{label}</span>
      <strong className="mt-2 text-2xl leading-tight text-[#202621] dark:text-stone-100">{value}</strong>
    </div>
  );
}

export function OrderSideCard({ icon: Icon, title, children }) {
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

export function ContactRow({ icon: Icon, text }) {
  return (
    <p className="flex min-w-0 items-center gap-3 text-[#4d5651] dark:text-stone-300">
      <Icon className="h-4 w-4 shrink-0 text-[#68716c] dark:text-stone-400" />
      <span className="min-w-0 break-words">{text}</span>
    </p>
  );
}
