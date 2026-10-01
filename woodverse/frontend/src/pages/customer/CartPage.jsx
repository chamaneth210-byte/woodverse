import {
  ArrowLeft,
  ShoppingCart,
  X,
} from "lucide-react";
import { navigate, formatPrice, DELIVERY_FEE, ASSURANCE_FEE } from "../../utils";
import { Footer } from "../../components/LayoutParts";
import { vendors } from "../../data/catalog";
import { ProductCardMedia } from "./ProductDetailsPage";

export function CartPage({ cart, setCart }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const updateQty = (id, delta) => setCart((items) => items.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));

  return (
    <>
      <CheckoutHero title="Your Cart" subtitle="Review your selected timber products before placing the order." active="Cart" back="/shop" />
      {cart.length === 0 ? (
        <section className="page-shell pb-16">
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-[#202624]">
            <ShoppingCart className="mx-auto h-10 w-10 text-forest dark:text-emerald-200" />
            <h2 className="mt-4 text-2xl font-bold">Your cart is empty</h2>
            <p className="mt-2 break-words text-slate-500 dark:text-stone-400">Add products from the marketplace to start an order.</p>
            <button onClick={() => navigate("/shop")} className="mt-6 rounded-md bg-forest px-6 py-3 font-bold text-white">Browse Products</button>
          </div>
        </section>
      ) : (
      <section className="page-shell grid grid-cols-[minmax(0,1fr)_minmax(280px,340px)] gap-8 pb-16 max-lg:grid-cols-1">
        <div className="grid gap-6">
          <Panel title="Order Items" subtitle={`${cart.length} items from verified vendors`} action={<button onClick={() => setCart([])} className="font-bold text-forest">Clear Cart</button>}>
            {cart.map((item) => (
              <article key={item.id} className="grid grid-cols-[150px_minmax(0,1fr)_auto] items-center gap-5 border-t border-slate-200 py-5 dark:border-slate-700 max-sm:grid-cols-[96px_minmax(0,1fr)]">
                <div className="h-32 overflow-hidden rounded-lg bg-slate-200"><ProductCardMedia product={item} /></div>
                <div className="min-w-0">
                  <h3 className="break-words font-semibold leading-snug">{item.name}</h3>
                  <p className="break-words text-sm uppercase leading-snug text-slate-500 dark:text-stone-400">Vendor: {item.vendor}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button onClick={() => updateQty(item.id, -1)} className="qty-btn">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="qty-btn">+</button>
                  </div>
                </div>
                <div className="grid justify-items-end gap-4 max-sm:col-span-2 max-sm:justify-items-start">
                  <strong className="break-words leading-tight text-forest dark:text-emerald-200">{formatPrice(item.price * item.quantity)}</strong>
                  <button onClick={() => setCart((items) => items.filter((row) => row.id !== item.id))} className="rounded-full border border-rose-200 p-2 text-rose-500"><X className="h-4 w-4" /></button>
                </div>
              </article>
            ))}
          </Panel>
        </div>
        <OrderSummary subtotal={subtotal} cta="Proceed to Checkout" next="/delivery" />
      </section>
      )}
      <Footer />
    </>
  );
}

export function CheckoutHero({ title, subtitle, active, back }) {
  const steps = ["Cart", "Delivery", "Payment"];
  const links = { Cart: "/cart", Delivery: "/delivery", Payment: "/payment" };
  const activeIndex = steps.indexOf(active);
  return (
    <section className="page-shell grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8 py-14 max-lg:grid-cols-1">
      <div className="min-w-0"><button onClick={() => navigate(back)} className="mb-6 inline-flex items-center gap-2 font-semibold text-forest dark:text-emerald-200"><ArrowLeft className="h-4 w-4 shrink-0" /> Back</button><p className="eyebrow">Secure Checkout</p><h1 className="break-words text-4xl font-bold leading-tight sm:text-5xl">{title}</h1><p className="mt-4 max-w-2xl break-words text-lg leading-relaxed text-slate-500 dark:text-stone-400">{subtitle}</p></div>
      <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-[#202624]">
        {steps.map((step, index) => <button key={step} onClick={() => navigate(links[step])} className={`min-w-0 rounded-full px-4 py-2 text-sm font-bold leading-tight ${index <= activeIndex ? "bg-forest text-white" : "text-slate-500 dark:text-stone-400"}`}>{step}</button>)}
      </div>
    </section>
  );
}

export function Panel({ title, subtitle, action, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-[#202624]">
      <div className="mb-6 flex min-w-0 justify-between gap-5 max-sm:flex-col"><div className="min-w-0"><h2 className="break-words text-2xl font-bold leading-tight">{title}</h2>{subtitle && <p className="break-words text-slate-500 dark:text-stone-400">{subtitle}</p>}</div>{action && <div className="shrink-0">{action}</div>}</div>
      {children}
    </section>
  );
}

export function OrderSummary({ subtotal, cta, next, onAction, notice, error, disabled }) {
  const delivery = subtotal ? DELIVERY_FEE : 0;
  const assurance = subtotal ? ASSURANCE_FEE : 0;
  return (
    <aside className="sticky top-20 self-start rounded-lg border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-[#202624] max-lg:static">
      <h2 className="text-2xl font-bold">Order Summary</h2>
      {[["Subtotal", subtotal], ["Delivery", delivery], ["Platform assurance", assurance]].map(([label, value]) => <div key={label} className="flex min-w-0 justify-between gap-4 border-b border-slate-200 py-4 dark:border-slate-700"><span className="min-w-0 break-words text-slate-500 dark:text-stone-400">{label}</span><strong className="shrink-0">{formatPrice(value)}</strong></div>)}
      <div className="flex min-w-0 justify-between gap-4 py-6 text-lg font-bold"><span>Total</span><strong className="shrink-0 text-forest dark:text-emerald-200">{formatPrice(subtotal + delivery + assurance)}</strong></div>
      <button
        onClick={() => (onAction ? onAction() : navigate(next))}
        disabled={disabled}
        className="grid min-h-14 w-full place-items-center rounded-md bg-forest font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {cta}
      </button>
      {notice && <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-forest dark:border-emerald-900 dark:bg-[#1d2422] dark:text-emerald-200">{notice}</p>}
      {error && <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700 dark:border-red-900 dark:bg-[#2a1a1a] dark:text-red-300">{error}</p>}
      <p className="mt-4 text-sm text-slate-500 dark:text-stone-400">Payments are held until vendor stock and delivery readiness are confirmed.</p>
    </aside>
  );
}
