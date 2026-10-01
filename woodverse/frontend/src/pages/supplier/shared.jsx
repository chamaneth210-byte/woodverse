import {
  Warehouse,
} from "lucide-react";

export function SupplierMetricCard({ icon: Icon, title, value, helper, helperClass = "text-[#39433f] dark:text-stone-300", tone = "bg-[#bcefd9] text-[#115745]", dark = false }) {
  return (
    <article className={`relative min-h-[158px] overflow-hidden rounded-lg border border-[#cbd2cd] p-6 shadow-sm dark:border-white/10 ${dark ? "bg-[#2f6757] text-white dark:bg-[#214d43]" : "bg-[#fbf8f1] text-[#39433f] dark:bg-[#18211f] dark:text-stone-100"}`}>
      {dark && <Warehouse className="absolute -bottom-8 -right-6 h-28 w-28 text-white/8" />}
      <div className="mb-5 flex items-start justify-between gap-4">
        <span className={`grid h-11 w-11 place-items-center rounded-md ${dark ? "bg-[#164f40] text-white" : tone}`}><Icon className="h-6 w-6" /></span>
        {helper && <span className={`max-w-[110px] text-right font-semibold leading-snug ${dark ? "text-white/80" : helperClass}`}>{helper}</span>}
      </div>
      <h2 className={`text-sm font-semibold uppercase tracking-[0.08em] ${dark ? "text-white/70" : "text-[#4b5651] dark:text-stone-400"}`}>{title}</h2>
      <p className={`mt-3 text-xl font-medium ${dark ? "text-white" : "text-[#115745] dark:text-emerald-200"}`}>{value}</p>
    </article>
  );
}

export function SupplierProgress({ label, value, percent }) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex justify-between gap-3 text-xs font-extrabold text-[#202621] dark:text-stone-100">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[#d7d3ca] dark:bg-white/10">
        <span className="block h-full rounded-full bg-[#115745] dark:bg-emerald-300" style={{ width: percent }} />
      </div>
    </div>
  );
}

export function SupplierProfileField({ label, name, defaultValue, type = "text" }) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">{label}</span>
      <input required name={name} type={type} defaultValue={defaultValue} className="min-h-11 min-w-0 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none focus:border-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100" />
    </label>
  );
}

export function ProfileInfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 rounded-md bg-white/70 p-3 dark:bg-[#18211f]">
      <span className="text-[#68716c] dark:text-stone-400">{label}</span>
      <strong className="text-right text-[#202621] dark:text-stone-100">{value}</strong>
    </div>
  );
}
