

export function AdminMetricCard({ icon: Icon, label, value, trend, color }) {
  return (
    <article className={`min-h-[190px] rounded-xl border border-[#d8d4cc] border-l-4 bg-white p-6 shadow-sm ${color}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-black/5"><Icon className="h-5 w-5" /></span>
        <span className="text-xs font-extrabold">{trend}</span>
      </div>
      <p className="mt-7 text-sm font-semibold text-[#3d4541]">{label}</p>
      <strong className="mt-2 block text-2xl font-extrabold text-[#202621]">{value}</strong>
    </article>
  );
}

export function AdminPanel({ title, detail, action, onAction, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#c6cdc8] bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 px-6 py-5">
        <div>
          <h3 className="text-xl font-extrabold text-[#104d3f]">{title}</h3>
          <p className="text-sm text-[#4f5853]">{detail}</p>
        </div>
        {action && <button onClick={onAction} className="text-sm font-extrabold text-[#104d3f]">{action}</button>}
      </div>
      {children}
    </section>
  );
}

export function HealthLine({ label, status, value, tone }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold">
        <span>{label}</span>
        <span className="rounded bg-white/20 px-2 py-1 text-xs font-extrabold uppercase">{status}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/15"><div className={`h-full rounded-full ${tone}`} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

export function ActivityItem({ item }) {
  const Icon = item.icon;
  return (
    <article className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
      <span className={`grid h-7 w-7 place-items-center rounded-full bg-[#f0ebe3] ${item.tone}`}><Icon className="h-4 w-4" /></span>
      <div>
        <h4 className="text-sm font-extrabold leading-snug text-[#202621]">{item.title}</h4>
        <p className="mt-1 text-sm leading-snug text-[#4f5853]">{item.detail}</p>
        <span className="mt-1 block text-xs font-extrabold uppercase text-[#a0a7a3]">{item.time}</span>
      </div>
    </article>
  );
}
