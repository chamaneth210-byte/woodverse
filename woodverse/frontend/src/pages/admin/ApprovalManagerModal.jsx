import { useState } from "react";
import {
  Search,
  X,
} from "lucide-react";
import { ApprovalStatusBadge } from "./AdminDirectoryPage";

export function ApprovalManagerModal({ approvals, onApprove, onReview, onClose }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredApprovals = approvals.filter((item) => {
    const matchesQuery = `${item.name} ${item.email} ${item.type} ${item.status}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === "All" || item.type === typeFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesQuery && matchesType && matchesStatus;
  });

  const approvalCounts = approvals.reduce((counts, item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }, {});

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/35 px-4 py-6">
      <section className="grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#d8d4cc] px-6 py-5">
          <div>
            <h3 className="text-xl font-extrabold text-[#104d3f]">All Pending Approvals</h3>
            <p className="mt-1 text-sm text-[#66716b]">Review vendor and supplier verification requests in one place.</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#f3eee6]" aria-label="Close approvals">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 overflow-y-auto px-6 py-5">
          <section className="grid gap-3 sm:grid-cols-4">
            <ApprovalStat label="Total" value={approvals.length} />
            <ApprovalStat label="Pending" value={approvalCounts.Pending || 0} />
            <ApprovalStat label="Review" value={(approvalCounts.Review || 0) + (approvalCounts["Review Requested"] || 0)} />
            <ApprovalStat label="Approved" value={approvalCounts.Approved || 0} />
          </section>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            <label className="flex min-h-11 items-center rounded-lg border border-[#c6cdc8] bg-white px-3 text-[#66716b]">
              <Search className="h-4 w-4 shrink-0" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search approvals..." />
            </label>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
              <option>All</option>
              <option>Vendor</option>
              <option>Supplier</option>
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
              <option>All</option>
              <option>Pending</option>
              <option>Review</option>
              <option>Review Requested</option>
              <option>Approved</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#d8d4cc]">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-[#f3eee6] text-xs font-extrabold uppercase text-[#56605b]">
                <tr><th className="px-5 py-4">Entity</th><th className="px-4 py-4">Type</th><th className="px-4 py-4">Requested</th><th className="px-4 py-4">Status</th><th className="px-5 py-4">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-[#e2ded7] bg-white">
                {filteredApprovals.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4">
                      <span className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#ffd7bd] font-extrabold text-[#202621]">{item.initials}</span>
                        <span>
                          <strong className="block text-[#202621]">{item.name}</strong>
                          <span className="text-xs font-semibold text-[#66716b]">{item.email}</span>
                          {item.reviewNote && <span className="mt-1 block text-xs font-bold text-[#8b5633]">{item.reviewNote}</span>}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-4"><span className="rounded bg-[#bfe6d7] px-2 py-1 text-xs font-extrabold uppercase text-[#104d3f]">{item.type}</span></td>
                    <td className="px-4 py-4 text-[#4f5853]">{item.requested}</td>
                    <td className="px-4 py-4"><ApprovalStatusBadge status={item.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => onApprove(item)} disabled={item.status === "Approved"} className="min-h-9 rounded-lg bg-[#104d3f] px-3 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:bg-[#c6cdc8]">Approve</button>
                        <button onClick={() => onReview(item)} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Review</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredApprovals.length === 0 && <p className="p-5 text-sm font-semibold text-[#66716b]">No approvals match this filter.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

export function ApprovalStat({ label, value }) {
  return (
    <div className="rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] p-4">
      <span className="text-xs font-extrabold uppercase text-[#66716b]">{label}</span>
      <strong className="mt-1 block text-2xl text-[#104d3f]">{value}</strong>
    </div>
  );
}
