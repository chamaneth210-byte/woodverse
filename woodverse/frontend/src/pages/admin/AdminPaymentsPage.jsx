import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Plus,
  Search,
  WalletCards,
} from "lucide-react";
import { ApprovalStatusBadge, DirectoryStat, parseDirectoryValue } from "./AdminDirectoryPage";

export function AdminPaymentsPage({ payments, onCreate, onUpdate, onMessage }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [payoutFilter, setPayoutFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const statuses = ["Pending", "Authorized", "Settled", "Refund Requested", "Refunded", "Failed"];
  const payouts = ["Not Ready", "Hold", "Released", "Blocked"];
  const risks = ["Low", "Medium", "High"];
  const filteredPayments = payments.filter((payment) => {
    const text = `${payment.id} ${payment.orderId} ${payment.customer} ${payment.vendor} ${payment.status} ${payment.payout}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || payment.status === statusFilter;
    const matchesPayout = payoutFilter === "All" || payment.payout === payoutFilter;
    const matchesRisk = riskFilter === "All" || payment.risk === riskFilter;
    return matchesQuery && matchesStatus && matchesPayout && matchesRisk;
  });
  const totalValue = payments.reduce((sum, payment) => sum + parseDirectoryValue(payment.amount), 0);
  const settledValue = payments.filter((payment) => payment.status === "Settled").reduce((sum, payment) => sum + parseDirectoryValue(payment.amount), 0);
  const refundCount = payments.filter((payment) => payment.status === "Refund Requested" || payment.status === "Refunded").length;
  const payoutHoldCount = payments.filter((payment) => payment.payout === "Hold" || payment.payout === "Blocked").length;

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-[#104d3f]">Payments</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#66716b]">
            Manage customer payments, vendor payouts, refunds, payment risk, and settlement status across the marketplace.
          </p>
        </div>
        <button onClick={onCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
          <Plus className="h-4 w-4" />
          Create Payment
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <DirectoryStat icon={WalletCards} label="Total Volume" value={`LKR ${totalValue.toLocaleString("en-US")}`} />
        <DirectoryStat icon={CheckCircle2} label="Settled Volume" value={`LKR ${settledValue.toLocaleString("en-US")}`} />
        <DirectoryStat icon={AlertTriangle} label="Refunds" value={String(refundCount)} warning />
        <DirectoryStat icon={Clock3} label="Payout Holds" value={String(payoutHoldCount)} warning={payoutHoldCount > 0} />
      </section>

      <section className="overflow-hidden rounded-xl border border-[#c6cdc8] bg-white shadow-sm">
        <div className="grid gap-3 border-b border-[#d8d4cc] px-5 py-5 xl:grid-cols-[minmax(0,1fr)_190px_170px_150px] xl:items-center">
          <label className="flex min-h-11 items-center rounded-lg border border-[#c6cdc8] bg-white px-3 text-[#66716b]">
            <Search className="h-4 w-4 shrink-0" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search payment, order, customer, vendor..." />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            <option>All</option>
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
          <select value={payoutFilter} onChange={(event) => setPayoutFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            <option>All</option>
            {payouts.map((payout) => <option key={payout}>{payout}</option>)}
          </select>
          <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            <option>All</option>
            {risks.map((risk) => <option key={risk}>{risk}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-[#f3eee6] text-xs font-extrabold uppercase text-[#56605b]">
              <tr><th className="px-5 py-4">Payment</th><th className="px-4 py-4">Customer</th><th className="px-4 py-4">Vendor</th><th className="px-4 py-4">Amount</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Payout</th><th className="px-5 py-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-[#e2ded7]">
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-5 py-4">
                    <strong className="block text-[#202621]">{payment.id}</strong>
                    <span className="text-xs font-semibold text-[#66716b]">{payment.orderId} - {payment.method} - {payment.date}</span>
                    <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-extrabold uppercase ${payment.risk === "High" ? "bg-[#ffe1df] text-[#b83f47]" : payment.risk === "Medium" ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#e9f2ed] text-[#104d3f]"}`}>{payment.risk} risk</span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#4f5853]">{payment.customer}</td>
                  <td className="px-4 py-4 font-semibold text-[#4f5853]">{payment.vendor}</td>
                  <td className="px-4 py-4 font-extrabold">{payment.amount}</td>
                  <td className="px-4 py-4"><ApprovalStatusBadge status={payment.status} /></td>
                  <td className="px-4 py-4"><ApprovalStatusBadge status={payment.payout} /></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => onUpdate(payment, "status", "Authorized")} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Authorize</button>
                      <button onClick={() => onUpdate(payment, "status", "Settled")} className="min-h-9 rounded-lg bg-[#104d3f] px-3 text-xs font-extrabold text-white">Settle</button>
                      <button onClick={() => onUpdate(payment, "payout", "Released")} className="min-h-9 rounded-lg bg-[#d9ecd8] px-3 text-xs font-extrabold text-[#104d3f]">Release Payout</button>
                      <button onClick={() => onUpdate(payment, "payout", "Hold")} className="min-h-9 rounded-lg bg-[#fff0cd] px-3 text-xs font-extrabold text-[#8b5633]">Hold</button>
                      <button onClick={() => onUpdate(payment, "status", "Refunded")} className="min-h-9 rounded-lg bg-[#ffe1df] px-3 text-xs font-extrabold text-[#b83f47]">Refund</button>
                      <button onClick={() => onMessage(payment)} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Notify</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && <p className="p-5 text-sm font-semibold text-[#66716b]">No payments match this filter.</p>}
        </div>
      </section>

      <div className="rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] px-4 py-3 text-sm font-semibold text-[#66716b]">
        Payment updates notify the customer and the related vendor payout queue.
      </div>
    </section>
  );
}
