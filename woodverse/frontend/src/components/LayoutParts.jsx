import { MessageSquare } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { navigate } from "../utils";

export function SectionHeading({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex min-w-0 items-end justify-between gap-6 max-sm:flex-col max-sm:items-start">
      <div className="min-w-0">
        <h2 className="break-words text-lg font-semibold leading-snug text-slate-700 dark:text-stone-100">{title}</h2>
        {subtitle && <p className="break-words leading-snug text-slate-500 dark:text-stone-400">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 max-sm:w-full">{action}</div>}
    </div>
  );
}

export function Footer() {
  const openFooterLink = (link) => {
    const routes = {
      "New Arrivals": "/shop",
      "Top Vendors": "/seller",
      "Timber Guides": "/shop",
      "Special Offers": "/shop",
      "Teak Sourcing": "/vendor/suppliers",
      "Mahogany Standards": "/vendor/suppliers",
      "Forestry Policy": "/vendor/purchase-orders",
      "Durability Testing": "/vendor/suppliers",
    };
    navigate(routes[link] || "/shop");
  };

  return (
    <footer className="bg-white dark:bg-[#202624]">
      <div className="page-shell grid grid-cols-[1.8fr_.75fr_.85fr_1.7fr] gap-10 py-14 lg:gap-16 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div>
          <button onClick={() => navigate("/")} className="text-left text-forest dark:text-emerald-200">
            <BrandLogo imageClassName="h-10 w-10" textClassName="text-lg text-forest dark:text-emerald-200" />
          </button>
          <p className="mt-6 max-w-sm break-words leading-relaxed text-slate-500 dark:text-stone-400">Bridging the gap between traditional craftsmanship and modern living. WoodVerse is the digital destination for premium Sri Lankan timber products.</p>
        </div>
        <FooterLinks title="Marketplace" links={["New Arrivals", "Top Vendors", "Timber Guides", "Special Offers"]} onOpen={openFooterLink} />
        <FooterLinks title="Materials" links={["Teak Sourcing", "Mahogany Standards", "Forestry Policy", "Durability Testing"]} onOpen={openFooterLink} />
        <div>
          <h2 className="mb-6 font-semibold text-slate-700 dark:text-stone-100">Stay Updated</h2>
          <p className="break-words leading-snug text-slate-500 dark:text-stone-400">Join our mailing list for timber care tips and vendor releases.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              window.alert("You are subscribed to WoodVerse updates.");
              event.currentTarget.reset();
            }}
            className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] gap-2 max-sm:grid-cols-1"
          >
            <input type="email" required className="min-w-0 rounded-md border border-slate-200 bg-blue-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-[#1d2422]" placeholder="Your email address" />
            <button type="submit" className="rounded-md bg-forest px-5 py-2 text-white">Join</button>
          </form>
        </div>
      </div>
      <div className="page-shell flex justify-between gap-6 border-t border-slate-200 py-8 text-sm text-slate-500 dark:border-slate-700 dark:text-stone-400 max-sm:flex-col">
        <span>© 2026 WoodVerse.</span>
        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          {["Sustainability", "Vendor Policy", "Privacy"].map((link) => (
            <button key={link} onClick={() => window.alert(`${link} details opened.`)} className="text-left">
              {link}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links, onOpen }) {
  return (
    <div>
      <h2 className="mb-6 font-semibold text-slate-700 dark:text-stone-100">{title}</h2>
      <div className="grid gap-3 text-slate-500 dark:text-stone-400">
        {links.map((link) => (
          <button key={link} onClick={() => onOpen(link)} className="break-words text-left leading-snug">
            {link}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChatLauncher() {
  return (
    <button onClick={() => navigate("/chatbot")} className="fixed bottom-3 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-forest text-white shadow-dark sm:bottom-5 sm:right-8 sm:h-16 sm:w-16" aria-label="Open chat assistant">
      <MessageSquare className="h-7 w-7 sm:h-8 sm:w-8" />
      <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold">1</span>
    </button>
  );
}
