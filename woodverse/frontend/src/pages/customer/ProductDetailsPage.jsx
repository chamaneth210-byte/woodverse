import { useState } from "react";
import {
  Bell,
  BellOff,
  ShoppingCart,
} from "lucide-react";
import { navigate, formatPrice } from "../../utils";
import { Footer } from "../../components/LayoutParts";
import { ProductMedia } from "../../components/ProductCard";
import { isRestockAlerted, toggleRestockAlert } from "../../lib/wishlist";
import { BackHome } from "./CatalogPage";
import { ProductSection } from "./HomePage";

export function ProductDetailsPage({ product, catalogItems = [], addToCart }) {
  const [alerted, setAlerted] = useState(() => (product ? isRestockAlerted(product.id) : false));

  if (!product) {
    return (
      <>
        <section className="page-shell grid min-h-[calc(100svh-56px)] place-items-center py-14 text-center">
          <div className="max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-700 dark:bg-[#202624]">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-stone-100">Product not found</h1>
            <p className="mt-3 leading-relaxed text-slate-500 dark:text-stone-400">The selected WoodVerse item is no longer available in this catalog.</p>
            <button onClick={() => navigate("/shop")} className="mt-6 rounded-md bg-forest px-6 py-3 font-bold text-white">Back to Shop</button>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const details = [
    ["Material", product.tags[0] || "Solid wood"],
    ["Vendor", product.vendor],
    ["Room / Use", product.room],
    ["Availability", product.stock],
  ];
  const recommendations = catalogItems.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 3);

  return (
    <>
      <section className="page-shell grid grid-cols-[minmax(0,1fr)_minmax(320px,460px)] gap-10 py-12 lg:gap-14 max-lg:grid-cols-1">
        <div className="min-w-0">
          <BackHome />
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-[#202624]">
            <div className="h-[clamp(280px,52vw,560px)] bg-slate-200 dark:bg-slate-800">
              <ProductCardMedia product={product} />
            </div>
          </div>
        </div>

        <aside className="min-w-0 self-start rounded-lg border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-[#202624]">
          <p className="eyebrow">Product Details</p>
          <h1 className="mt-3 break-words text-4xl font-bold leading-tight text-slate-800 dark:text-stone-100">{product.name}</h1>
          <p className="mt-3 break-words text-sm uppercase tracking-wide text-slate-500 dark:text-stone-400">Vendor: {product.vendor}</p>
          <p className="mt-5 break-words text-lg leading-relaxed text-slate-600 dark:text-stone-300">{product.description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-bold text-forest dark:border-emerald-900 dark:bg-[#1d2422] dark:text-emerald-200">{tag}</span>
            ))}
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            {details.map(([label, value]) => (
              <article key={label} className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#1d2422]">
                <p className="text-xs font-extrabold uppercase text-slate-400 dark:text-stone-500">{label}</p>
                <strong className="mt-1 block break-words text-slate-700 dark:text-stone-100">{value}</strong>
              </article>
            ))}
          </div>

          <div className="mt-7 flex min-w-0 items-center justify-between gap-5 border-t border-slate-200 pt-6 dark:border-slate-700 max-sm:flex-col max-sm:items-stretch">
            <strong className="break-words text-3xl leading-tight text-forest dark:text-emerald-200">{formatPrice(product.price)}</strong>
            <div className="flex min-w-0 flex-wrap justify-end gap-3 max-sm:grid max-sm:w-full max-sm:grid-cols-1">
              <button
                onClick={() => {
                  if (product.stockType === "out") {
                    setAlerted(toggleRestockAlert(product));
                    return;
                  }
                  addToCart(product);
                  navigate("/cart");
                }}
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 font-bold text-white ${product.stockType === "out" ? "bg-slate-400" : "bg-forest"}`}
                aria-pressed={product.stockType === "out" ? alerted : undefined}
              >
                {product.stockType === "out" ? (alerted ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />) : <ShoppingCart className="h-5 w-5" />}
                {product.stockType === "out" ? (alerted ? "Alert Set" : "Notify Me") : "Add to Cart"}
              </button>
            </div>
          </div>
        </aside>
      </section>

      {recommendations.length > 0 && (
        <ProductSection title="Related Items" subtitle="More products from the same collection" items={recommendations} addToCart={addToCart} />
      )}
      <Footer />
    </>
  );
}

export function ProductCardMedia({ product }) {
  return <ProductMedia product={product} />;
}
