import {
  Quote,
} from "lucide-react";
import { CroppedImage } from "../../components/CroppedImage";
import { Footer } from "../../components/LayoutParts";
import { crop } from "../../data/catalog";
import { Panel } from "./CartPage";
import { BackHome } from "./CatalogPage";
import { CheckoutGrid } from "./DeliveryPage";

export function SellerPage() {
  return (
    <>
      <section className="page-shell grid grid-cols-[minmax(0,1fr)_minmax(260px,360px)] items-center gap-10 py-14 lg:gap-16 max-lg:grid-cols-1">
        <div className="min-w-0"><BackHome /><p className="eyebrow">Seller Program</p><h1 className="break-words text-4xl font-bold leading-tight sm:text-5xl">Sell Furniture and Wooden Products on WoodVerse</h1><p className="mt-5 max-w-2xl break-words text-lg leading-relaxed text-slate-500 dark:text-stone-400">Join a marketplace built for Sri Lankan woodcraft, custom furniture requests, managed payments, and delivery coordination.</p></div>
        <div className="overflow-hidden rounded-lg bg-white shadow-soft dark:bg-[#202624]"><div className="h-64"><CroppedImage crop={crop.sideboard} label="Seller product" /></div><div className="p-6"><strong className="break-words text-forest dark:text-emerald-200">Vendor profile review</strong><p className="break-words leading-snug">Typical approval in 2-3 business days</p></div></div>
      </section>
      <section className="page-shell grid grid-cols-[.95fr_1.05fr] gap-8 pb-16 max-lg:grid-cols-1">
        <Panel title="What Sellers Get" subtitle="Tools for listing, quoting, and fulfilling custom wood products."><div className="grid gap-4">{["Verified Marketplace Profile", "Order and Quote Management", "Payment and Delivery Support"].map((item, index) => <article key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#1d2422]"><span className="font-extrabold text-forest dark:text-emerald-200">{String(index + 1).padStart(2, "0")}</span><h3 className="break-words font-bold leading-snug">{item}</h3><p className="break-words leading-snug text-slate-500 dark:text-stone-400">Showcase products and manage marketplace workflows.</p></article>)}</div></Panel>
        <Panel title="Seller Application" subtitle="Submit your workshop details for review."><CheckoutGrid /><button onClick={() => window.alert("Seller application submitted for review.")} className="mt-6 w-full rounded-md bg-forest py-3 font-bold text-white">Submit Application</button></Panel>
      </section>
      <Footer />
    </>
  );
}
