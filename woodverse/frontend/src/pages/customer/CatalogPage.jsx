import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Home,
} from "lucide-react";
import { navigate, sortProducts } from "../../utils";
import { CroppedImage } from "../../components/CroppedImage";
import { Footer, SectionHeading } from "../../components/LayoutParts";
import { ProductCard } from "../../components/ProductCard";
import { categories, crop, vendors } from "../../data/catalog";

export function CatalogPage({ title, subtitle, items, addToCart }) {
  const [sort, setSort] = useState("featured");
  const sorted = useMemo(() => sortProducts(items, sort), [items, sort]);

  return (
    <>
      <CatalogHero title={title} subtitle={subtitle} eyebrow="Marketplace Catalog" />
      <section className="page-shell grid grid-cols-[240px_minmax(0,1fr)] gap-8 pb-16 max-lg:grid-cols-1">
        <FilterPanel title="Category" first={["Dining Tables", "Beds & Bedroom", "Living", "Workspace", "Wooden Gifts"]} secondTitle="Material" second={["Solid Teak", "Mahogany", "Jackwood", "Bamboo"]} />
        <div>
          <CatalogToolbar title="All Collections" subtitle={`Showing ${items.length} curated products`} sort={sort} setSort={setSort} />
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 max-sm:grid-cols-1">
            {categories.map((category) => (
              <button key={category.title} onClick={() => navigate(category.href)} className="category-strip-card">
                <CroppedImage crop={category.crop} src={category.image} label={category.title} />
                <span>{category.title.replace(" Tables", "")}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {sorted.map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export function CategoryPage({ type, items: catalogItems = [], addToCart }) {
  const gift = type === "gift";
  const [sort, setSort] = useState("featured");
  const items = catalogItems.filter((item) => item.category === type);
  const sorted = useMemo(() => sortProducts(items, sort), [items, sort]);
  const title = gift ? "Handcrafted Wooden Gifts for Every Occasion" : "Furniture for Dining, Rest, Living, and Work";
  const subtitle = gift
    ? "Discover carved boxes, desk accessories, keepsakes, and small decor made by Sri Lankan artisans."
    : "Explore durable teak, mahogany, walnut, and bamboo furniture from verified WoodVerse vendors.";

  return (
    <>
      <section className="page-shell grid grid-cols-[minmax(0,1fr)_minmax(260px,340px)] items-center gap-10 py-14 lg:gap-16 max-lg:grid-cols-1">
        <div className="min-w-0">
          <BackHome />
          <p className="eyebrow">{gift ? "Wooden Gift Collection" : "Sri Lankan Furniture"}</p>
          <h1 className="max-w-3xl break-words text-4xl font-bold leading-tight text-slate-800 dark:text-stone-100 sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl break-words text-lg leading-relaxed text-slate-600 dark:text-stone-300">{subtitle}</p>
        </div>
        <div className="overflow-hidden rounded-[72px_72px_36px_36px] shadow-soft dark:shadow-dark">
          <div className="h-[clamp(240px,52vw,350px)]"><CroppedImage src={gift ? "/assets/site-hero.png" : "/assets/furniture-hero.png"} label={title} /></div>
        </div>
      </section>
      <section className="page-shell grid grid-cols-2 gap-5 pb-8 lg:grid-cols-4 max-sm:grid-cols-1">
        {(gift ? ["Keepsakes", "Desk Gifts", "Home Decor", "Gift Sets"] : ["Dining", "Bedroom", "Living", "Workspace"]).map((label, index) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#202624]">
            <span className="text-sm font-extrabold text-forest dark:text-emerald-200">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="mt-3 break-words text-lg font-semibold leading-snug">{label}</h3>
            <p className="mt-1 break-words leading-snug text-slate-500 dark:text-stone-400">{gift ? "Gift-ready artisan products" : "Room-ready wooden furniture"}</p>
          </div>
        ))}
      </section>
      <section className="page-shell grid grid-cols-[240px_minmax(0,1fr)] gap-8 pb-16 max-lg:grid-cols-1">
        <FilterPanel title={gift ? "Gift Type" : "Room"} first={gift ? ["Keepsakes", "Desk Gifts", "Home Decor", "Gift Sets"] : ["Dining", "Bedroom", "Living", "Workspace"]} secondTitle="Material" second={gift ? ["Jackwood", "Mahogany", "Teak Offcuts", "Bamboo"] : ["Solid Teak", "Mahogany", "Walnut", "Bamboo"]} />
        <div>
          <CatalogToolbar title={gift ? "Wooden Gift Products" : "Furniture Collections"} subtitle={`Showing ${items.length} products`} sort={sort} setSort={setSort} />
          <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {sorted.map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}
          </div>
        </div>
      </section>
      <VendorBand />
      <Footer />
    </>
  );
}

export function CatalogHero({ title, subtitle, eyebrow }) {
  return (
    <section className="page-shell grid grid-cols-[minmax(0,1fr)_minmax(260px,340px)] items-end gap-10 py-14 lg:gap-16 max-lg:grid-cols-1">
      <div className="min-w-0">
        <BackHome />
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="max-w-4xl break-words text-4xl font-bold leading-tight text-slate-800 dark:text-stone-100 sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl break-words text-lg leading-relaxed text-slate-600 dark:text-stone-300">{subtitle}</p>
      </div>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-lg border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-[#202624]">
        <strong className="text-2xl text-forest dark:text-emerald-200">128</strong><span className="self-center break-words text-slate-500 dark:text-stone-400">listed items</span>
        <strong className="text-2xl text-forest dark:text-emerald-200">24</strong><span className="self-center break-words text-slate-500 dark:text-stone-400">verified vendors</span>
        <strong className="text-2xl text-forest dark:text-emerald-200">6</strong><span className="self-center break-words text-slate-500 dark:text-stone-400">material families</span>
      </div>
    </section>
  );
}

export function FilterPanel({ title, first, secondTitle, second }) {
  return (
    <aside className="sticky top-20 self-start rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#202624] max-lg:static">
      <FilterGroup title={title} items={first} />
      <FilterGroup title={secondTitle} items={second} />
      <FilterGroup title="Availability" items={["Available now", "Include low stock", "All products"]} radio />
    </aside>
  );
}

export function FilterGroup({ title, items, radio = false }) {
  return (
    <div className="border-b border-slate-200 py-5 first:pt-0 last:border-b-0 dark:border-slate-700">
      <h2 className="mb-3 text-sm font-bold text-slate-700 dark:text-stone-100">{title}</h2>
      <div className="grid gap-2">
        {items.map((item) => <label key={item} className="flex min-w-0 items-start gap-2 break-words leading-snug text-slate-500 dark:text-stone-400"><input type={radio ? "radio" : "checkbox"} name={title} className="mt-0.5 shrink-0 accent-forest" /> <span className="min-w-0">{item}</span></label>)}
      </div>
    </div>
  );
}

export function CatalogToolbar({ title, subtitle, sort, setSort }) {
  return (
    <div className="mb-5 flex min-w-0 items-center justify-between gap-5 max-sm:flex-col max-sm:items-start">
      <div className="min-w-0"><h2 className="break-words text-2xl font-bold leading-tight">{title}</h2><p className="break-words text-slate-500 dark:text-stone-400">{subtitle}</p></div>
      <div className="flex flex-wrap gap-2 max-sm:w-full">
        {["featured", "newest", "price"].map((key) => (
          <button key={key} onClick={() => setSort(key)} className={`min-w-0 rounded-full border px-4 py-2 capitalize leading-tight max-sm:flex-1 ${sort === key ? "border-forest bg-forest text-white" : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-[#202624] dark:text-stone-300"}`}>{key}</button>
        ))}
      </div>
    </div>
  );
}

export function BackHome() {
  return <button onClick={() => navigate("/")} className="mb-6 flex w-fit items-center gap-2 font-semibold leading-none text-forest dark:text-emerald-200"><ArrowLeft className="h-4 w-4 shrink-0" /> <span>Home</span></button>;
}

export function VendorBand() {
  return (
    <section className="bg-[#cbd8dc] py-16 dark:bg-[#253530]">
      <div className="page-shell">
        <SectionHeading title="Verified Vendors" subtitle="Supporting Sri Lankan master craftsmen" />
        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {vendors.map((vendor) => (
            <article key={vendor.name} className="grid min-h-40 grid-cols-[76px_minmax(0,1fr)] items-center gap-7 rounded-lg bg-white p-8 shadow-sm dark:bg-[#202624] max-sm:grid-cols-1 max-sm:gap-4 max-sm:p-6">
              <div className="grid h-14 w-20 place-items-center rounded-lg bg-blue-50 font-extrabold text-forest dark:bg-slate-800 dark:text-emerald-200">{vendor.initials}</div>
              <div className="min-w-0">
                <h3 className="break-words font-semibold leading-snug text-slate-700 dark:text-stone-100">{vendor.name}</h3>
                <p className="break-words text-slate-700 before:text-amber-500 before:content-['★_'] dark:text-stone-300">{vendor.rating}</p>
                <p className="break-words leading-snug text-slate-500 dark:text-stone-400">{vendor.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
