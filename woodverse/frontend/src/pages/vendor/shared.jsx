import {
  X,
} from "lucide-react";

export function ModalShell({ title, subtitle, children, onClose, size = "normal" }) {
  const sizeClass = size === "large" ? "max-w-5xl" : "max-w-xl";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#202621]/45 px-4 py-8">
      <section className={`max-h-[90vh] w-full overflow-hidden rounded-xl bg-white shadow-2xl ${sizeClass}`}>
        <div className="flex items-start justify-between gap-4 border-b border-[#d9d5cd] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-semibold text-[#202621]">{title}</h2>
            <p className="mt-1 text-sm text-[#66716b]">{subtitle}</p>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f3eee6] text-[#3d4541] transition hover:bg-[#e3ddd2]" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function SettingsInput({ label, value, onChange, type = "text" }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-3 font-semibold outline-none transition focus:border-[#115745]"
      />
    </label>
  );
}

export function SettingsSelect({ label, value, options, onChange, icon: Icon }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
      {label}
      <span className="flex min-h-11 items-center rounded-lg border border-[#c4cbc7] bg-white px-3 focus-within:border-[#115745]">
        {Icon && <Icon className="mr-2 h-4 w-4 text-[#66716b]" />}
        <select value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent font-semibold outline-none">
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </span>
    </label>
  );
}

export function OrderInfo({ label, value }) {
  return (
    <div>
      <span className="text-xs font-extrabold uppercase tracking-wide text-[#66716b]">{label}</span>
      <strong className="mt-1 block text-[#202621]">{value}</strong>
    </div>
  );
}
