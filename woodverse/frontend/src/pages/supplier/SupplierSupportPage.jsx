import { useState } from "react";
import {
  Bell,
  Globe2,
  Grid3X3,
  Mail,
  Moon,
  Phone,
  Search,
  Send,
  Sun,
} from "lucide-react";
import { navigate } from "../../utils";
import { SupplierSidebar } from "./SupplierSidebar";

export function SupplierSupportPage({ theme, onToggleTheme }) {
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
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/90 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/90 xl:px-10">
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
