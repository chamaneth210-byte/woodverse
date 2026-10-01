import {
  Send,
  X,
} from "lucide-react";

export function AdminNotificationModal({ form, notifications, onChange, onClose, onSend }) {
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/35 px-4 py-6">
      <section className="grid max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#d8d4cc] px-6 py-5">
          <div>
            <h3 className="text-xl font-extrabold text-[#104d3f]">Admin Notifications</h3>
            <p className="mt-1 text-sm text-[#66716b]">Send operational notices to customers, vendors, suppliers, or all portal users.</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#f3eee6]" aria-label="Close notifications">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 overflow-y-auto px-6 py-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form onSubmit={onSend} className="grid content-start gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
                Send To
                <select value={form.audience} onChange={(event) => onChange("audience", event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 font-semibold outline-none focus:border-[#104d3f]">
                  <option>Customer</option>
                  <option>Vendor</option>
                  <option>Supplier</option>
                  <option>All</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
                Priority
                <select value={form.priority} onChange={(event) => onChange("priority", event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 font-semibold outline-none focus:border-[#104d3f]">
                  <option>Normal</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </label>
            </div>
            <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
              Title
              <input value={form.title} onChange={(event) => onChange("title", event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 font-semibold outline-none focus:border-[#104d3f]" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
              Message
              <textarea value={form.message} onChange={(event) => onChange("message", event.target.value)} rows={6} className="rounded-lg border border-[#c6cdc8] bg-white px-3 py-2 font-semibold outline-none focus:border-[#104d3f]" />
            </label>
            <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
              <Send className="h-4 w-4" />
              Send Notification
            </button>
          </form>

          <aside className="grid content-start gap-3">
            <div className="rounded-lg bg-[#f3eee6] p-4">
              <span className="text-xs font-extrabold uppercase text-[#66716b]">Connection</span>
              <strong className="mt-1 block text-[#104d3f]">Customer + Vendor + Supplier</strong>
              <p className="mt-2 text-sm leading-relaxed text-[#66716b]">Admin messages are saved into each audience notification queue.</p>
            </div>
            <h4 className="text-sm font-extrabold uppercase text-[#66716b]">Sent History</h4>
            <div className="grid gap-3">
              {notifications.length === 0 ? (
                <p className="rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] p-4 text-sm font-semibold text-[#66716b]">No admin notifications sent yet.</p>
              ) : (
                notifications.slice(0, 6).map((item) => (
                  <article key={item.id} className="rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.audiences.map((audience) => (
                        <span key={`${item.id}-${audience}`} className="rounded-full bg-[#d9ecd8] px-2 py-1 text-[10px] font-extrabold uppercase text-[#104d3f]">{audience}</span>
                      ))}
                      <span className="rounded-full bg-[#fff0cd] px-2 py-1 text-[10px] font-extrabold uppercase text-[#8b5633]">{item.priority}</span>
                    </div>
                    <strong className="mt-3 block text-sm text-[#202621]">{item.title}</strong>
                    <p className="mt-2 text-sm leading-relaxed text-[#66716b]">{item.message}</p>
                    <span className="mt-2 block text-xs font-extrabold uppercase text-[#9aa09c]">{item.time}</span>
                  </article>
                ))
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
