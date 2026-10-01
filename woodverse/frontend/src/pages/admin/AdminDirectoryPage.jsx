import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  WalletCards,
} from "lucide-react";

export function AdminDirectoryPage({ section, config, onStatus, onMessage, onCreate }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const Icon = config.icon;
  const statuses = section === "Customers" ? ["Active", "Watch", "Suspended"] : ["Verified", "Pending", "Review", "Suspended"];
  const filteredItems = config.items.filter((item) => {
    const matchesQuery = `${item.id} ${item.name} ${item.email} ${item.location} ${item.status}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesQuery && matchesStatus;
  });
  const activeCount = config.items.filter((item) => ["Active", "Verified"].includes(item.status)).length;
  const reviewCount = config.items.filter((item) => ["Watch", "Review", "Pending"].includes(item.status)).length;
  const totalValue = config.items.reduce((sum, item) => sum + parseDirectoryValue(item.value), 0);

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-[#104d3f]">{section}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#66716b]">
            Manage {section.toLowerCase()} records, account state, admin messages, and operational value.
          </p>
        </div>
        <button onClick={() => onCreate(section)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
          <Plus className="h-4 w-4" />
          Create {section.slice(0, -1)}
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <DirectoryStat icon={Icon} label={`Total ${section}`} value={String(config.items.length)} />
        <DirectoryStat icon={CheckCircle2} label="Active / Verified" value={String(activeCount)} />
        <DirectoryStat icon={AlertTriangle} label="Needs Review" value={String(reviewCount)} warning />
        <DirectoryStat icon={WalletCards} label="Total Value" value={`LKR ${totalValue.toLocaleString("en-US")}`} />
      </section>

      <section className="overflow-hidden rounded-xl border border-[#c6cdc8] bg-white shadow-sm">
        <div className="grid gap-3 border-b border-[#d8d4cc] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
          <label className="flex min-h-11 items-center rounded-lg border border-[#c6cdc8] bg-white px-3 text-[#66716b]">
            <Search className="h-4 w-4 shrink-0" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder={`Search ${section.toLowerCase()}...`} />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            <option>All</option>
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-[#f3eee6] text-xs font-extrabold uppercase text-[#56605b]">
              <tr><th className="px-5 py-4">Name</th><th className="px-4 py-4">Location</th><th className="px-4 py-4">Orders</th><th className="px-4 py-4">Value</th><th className="px-4 py-4">Status</th><th className="px-5 py-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-[#e2ded7]">
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4">
                    <span className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#d9ecd8] font-extrabold text-[#104d3f]">{getDirectoryInitials(item.name)}</span>
                      <span>
                        <strong className="block text-[#202621]">{item.name}</strong>
                        <span className="text-xs font-semibold text-[#66716b]">{item.id} - {item.email}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#4f5853]">{item.location}</td>
                  <td className="px-4 py-4 font-extrabold">{item.orders}</td>
                  <td className="px-4 py-4 font-extrabold">{item.value}</td>
                  <td className="px-4 py-4"><ApprovalStatusBadge status={item.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {statuses.map((status) => (
                        <button key={status} onClick={() => onStatus(section, item, status)} disabled={item.status === status} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541] disabled:cursor-not-allowed disabled:bg-[#e9e4dc]">
                          {status}
                        </button>
                      ))}
                      <button onClick={() => onMessage(section, item)} className="min-h-9 rounded-lg bg-[#104d3f] px-3 text-xs font-extrabold text-white">Message</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && <p className="p-5 text-sm font-semibold text-[#66716b]">No {section.toLowerCase()} match this filter.</p>}
        </div>
      </section>
    </section>
  );
}

export function DirectoryStat({ icon: Icon, label, value, warning = false }) {
  return (
    <article className="rounded-xl border border-[#c6cdc8] bg-white p-5 shadow-sm">
      <span className={`grid h-10 w-10 place-items-center rounded-lg ${warning ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#e9f2ed] text-[#104d3f]"}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-semibold text-[#66716b]">{label}</p>
      <strong className="mt-1 block text-2xl text-[#202621]">{value}</strong>
    </article>
  );
}

export function getDirectoryInitials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function parseDirectoryValue(value) {
  const text = String(value).toUpperCase();
  const amount = Number.parseFloat(text.replace(/[^0-9.]/g, "")) || 0;
  if (text.includes("M")) return amount * 1000000;
  if (text.includes("K")) return amount * 1000;
  return amount;
}

export function ApprovalStatusBadge({ status }) {
  const approved = status === "Approved";
  const review = status === "Review" || status === "Review Requested";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold uppercase ${approved ? "bg-[#d9ecd8] text-[#104d3f]" : review ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#f3eee6] text-[#d2861d]"}`}>
      {status}
    </span>
  );
}
