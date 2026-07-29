import { Bell, Heart, ShoppingCart } from "lucide-react";
import { CroppedImage } from "./CroppedImage";
import { formatPrice } from "../utils";

const generated = {
  desk: "from-[#c8945b] via-[#8d5932] to-[#d8e1de]",
  stool: "from-[#dcb374] via-[#8d5c34] to-[#cbd8dc]",
  gift: "from-[#7c4a2e] to-[#c9904d]",
  shelf: "from-[#a96f35] via-[#4d3427] to-[#cbd8dc]",
};

export function ProductMedia({ product }) {
  if (product.image) {
    return <CroppedImage src={product.image} label={product.name} />;
  }

  if (product.crop) {
    return <CroppedImage crop={product.crop} label={product.name} />;
  }

  return (
    <div className={`grid h-full place-items-center bg-gradient-to-br ${generated[product.generated] || generated.gift}`}>
      <span className="grid h-20 w-20 place-items-center rounded-full bg-white/80 text-xl font-extrabold text-forest shadow-soft">
        {product.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}
      </span>
    </div>
  );
}

export function ProductCard({ product, onAdd }) {
  const stockClass = {
    in: "bg-emerald-600",
    low: "bg-amber-500",
    out: "bg-rose-500",
  }[product.stockType];

  return (
    <article className="grid h-full grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#202624]">
      <div className="relative h-48 overflow-hidden bg-slate-200 dark:bg-slate-800 sm:h-52 lg:h-56">
        <ProductMedia product={product} />
        <button className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-wood shadow" aria-label={`Save ${product.name}`}>
          <Heart className="h-4 w-4" />
        </button>
        <span className={`absolute bottom-3 left-3 rounded-sm px-2 py-1 text-[11px] font-extrabold uppercase text-white ${stockClass}`}>
          {product.stock}
        </span>
      </div>
      <div className="flex min-h-48 flex-col p-5 sm:min-h-52 sm:p-6">
        <h3 className="break-words text-[17px] font-semibold leading-snug text-slate-600 dark:text-stone-100">{product.name}</h3>
        <p className="mt-1 break-words text-sm uppercase leading-snug text-slate-500 dark:text-stone-400">Vendor: {product.vendor}</p>
        <div className="mt-3 flex min-h-7 flex-wrap gap-1.5">
          {product.tags.map((tag) => (
            <span key={tag} className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-stone-300">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <strong className="min-w-0 break-words text-[17px] leading-tight text-forest dark:text-emerald-200">{formatPrice(product.price)}</strong>
          <button
            onClick={() => onAdd?.(product)}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white ${product.stockType === "out" ? "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-stone-300" : "bg-forest"}`}
            aria-label={product.stockType === "out" ? `Notify me when ${product.name} is available` : `Add ${product.name} to cart`}
          >
            {product.stockType === "out" ? <Bell className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </article>
  );
}
