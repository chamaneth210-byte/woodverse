import {
  Phone,
} from "lucide-react";
import { CheckoutHero, OrderSummary, Panel } from "./CartPage";

export function DeliveryPage({ cart = [] }) {
  // Priced from the cart, not from a fixed demo number.
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0);
  return (
    <>
      <CheckoutHero title="Delivery Details" subtitle="Confirm receiving address, delivery window, and handling instructions." active="Delivery" back="/cart" />
      <section className="page-shell grid grid-cols-[minmax(0,1fr)_minmax(280px,340px)] gap-8 pb-16 max-lg:grid-cols-1">
        <Panel title="Shipping Address" subtitle="Large furniture needs an accessible delivery entrance."><CheckoutGrid /></Panel>
        <OrderSummary subtotal={subtotal} cta="Continue to Payment" next="/payment" />
      </section>
    </>
  );
}

export function CheckoutGrid({ payment = false }) {
  const fields = payment ? ["Card number", "Name on card", "Expiry", "CVC"] : ["Full name", "Phone number", "Street address", "District"];
  return <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">{fields.map((field) => <label key={field} className="grid min-w-0 gap-2 break-words font-bold leading-snug text-slate-600 dark:text-stone-300">{field}<input className="min-w-0 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 outline-none dark:border-slate-700 dark:bg-[#1d2422]" placeholder={field} /></label>)}</div>;
}
