import {
  CheckCircle2,
} from "lucide-react";
import { Footer } from "../../components/LayoutParts";
import { vendors } from "../../data/catalog";

export function FeaturesPage() {
  const features = [
    ["Discover better woodcraft", "Browse curated furniture and wooden gifts from verified Sri Lankan makers."],
    ["Stay close to every order", "Follow approvals, production, shipment, and delivery from one connected view."],
    ["Run your workshop", "Vendors get practical tools for products, quotes, inventory, production, and customer orders."],
    ["Keep materials moving", "Suppliers and vendors stay aligned on availability, purchase orders, and fulfillment."],
  ];

  return (
    <main className="overflow-hidden bg-[#f7f8f5] text-[#17231f] dark:bg-[#101714] dark:text-stone-100">
      <section className="page-shell grid gap-10 py-20 lg:grid-cols-[1fr_.85fr] lg:items-end lg:py-28">
        <div>
          <p className="eyebrow">WoodVerse features</p>
          <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] sm:text-6xl">Everything woodcraft needs to move forward.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-stone-300">One connected platform for customers, vendors, and suppliers to discover, create, and deliver better work.</p>
        </div>
        <div className="rounded-lg bg-[#102f27] p-7 text-white shadow-xl sm:p-9">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-200">Built around the craft</p>
          <p className="mt-5 text-2xl font-bold leading-snug">From first idea to front door, every handoff stays visible.</p>
        </div>
      </section>
      <section className="page-shell grid gap-4 pb-24 sm:grid-cols-2">
        {features.map(([title, description], index) => (
          <article key={title} className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#1b2521] sm:p-9">
            <div className="flex items-start justify-between gap-4">
              <CheckCircle2 className="h-7 w-7 shrink-0 text-[#b77a45]" />
              <span className="text-sm font-extrabold text-slate-400 dark:text-stone-500">0{index + 1}</span>
            </div>
            <h2 className="mt-8 text-2xl font-extrabold">{title}</h2>
            <p className="mt-3 max-w-md leading-relaxed text-slate-600 dark:text-stone-300">{description}</p>
          </article>
        ))}
      </section>
      <Footer />
    </main>
  );
}
