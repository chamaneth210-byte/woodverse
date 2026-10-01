import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FileText,
  PlusCircle,
  Save,
  Search,
  Send,
} from "lucide-react";
import { VendorHeader } from "./VendorHeader";
import { VendorSidebar } from "./VendorSidebar";
import { getInitials, normalizeLkrPrice, parseOrderAmount } from "./format.js";
import { ProductStat } from "./orderParts";
import { getNextStoredVendorOrderId, requestVendorNewOrder } from "./orders.js";
import { initialOrders, initialQuotations } from "./seed.js";
import { ModalShell, SettingsInput, SettingsSelect } from "./shared";
import { getOrderTone, getQuoteTone } from "./tone.js";

export function VendorQuotationsPage() {
  const [notice, setNotice] = useState("Quotations loaded.");
  const [quotations, setQuotations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-vendor-quotations") || "null") || initialQuotations;
    } catch {
      return initialQuotations;
    }
  });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [activeQuote, setActiveQuote] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("woodverse-vendor-quotations", JSON.stringify(quotations));
    } catch {}
  }, [quotations]);

  const filteredQuotes = quotations.filter((quote) => {
    const matchesQuery = `${quote.id} ${quote.customer} ${quote.product}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All" || quote.status === status;
    return matchesQuery && matchesStatus;
  });
  const totalValue = filteredQuotes.reduce((sum, quote) => sum + parseOrderAmount(quote.amount), 0);
  const pendingQuotes = quotations.filter((quote) => ["Draft", "Sent"].includes(quote.status)).length;
  const approvedQuotes = quotations.filter((quote) => quote.status === "Approved").length;

  const openNewQuote = () => {
    setActiveQuote(null);
    setModalOpen(true);
  };

  const openEditQuote = (quote) => {
    setActiveQuote(quote);
    setModalOpen(true);
  };

  const saveQuote = (form) => {
    const normalizedQuote = {
      ...form,
      customer: form.customer.trim(),
      product: form.product.trim(),
      amount: normalizeLkrPrice(form.amount),
    };
    if (activeQuote) {
      setQuotations((items) => items.map((item) => (item.id === activeQuote.id ? { ...item, ...normalizedQuote } : item)));
      setNotice(`${activeQuote.id} updated.`);
    } else {
      const numericIds = quotations.map((quote) => Number(quote.id.replace("QT-", ""))).filter(Boolean);
      const nextId = `QT-${Math.max(...numericIds, 7800) + 1}`;
      setQuotations((items) => [{ id: nextId, date: "Today", ...normalizedQuote }, ...items]);
      setNotice(`${nextId} created for ${normalizedQuote.customer}.`);
    }
    setStatus(normalizedQuote.status);
    setQuery("");
    setActiveQuote(null);
    setModalOpen(false);
  };

  const updateQuoteStatus = (quote, nextStatus) => {
    setQuotations((items) => items.map((item) => (item.id === quote.id ? { ...item, status: nextStatus } : item)));
    setStatus(nextStatus);
    setQuery("");
    setNotice(`${quote.id} marked as ${nextStatus}.`);
  };

  const convertQuoteToOrder = (quote) => {
    const order = {
      id: getNextStoredVendorOrderId(),
      customer: quote.customer,
      initials: getInitials(quote.customer),
      product: quote.product,
      date: "Today",
      dueDate: quote.validUntil,
      amount: quote.amount,
      status: "Processing",
      tone: getOrderTone("Processing"),
      source: quote.id,
    };
    try {
      const existingOrders = JSON.parse(localStorage.getItem("woodverse-vendor-orders") || "null") || initialOrders;
      localStorage.setItem("woodverse-vendor-orders", JSON.stringify([order, ...existingOrders]));
    } catch {}
    setQuotations((items) => items.map((item) => (item.id === quote.id ? { ...item, status: "Converted" } : item)));
    setStatus("Converted");
    setNotice(`${quote.id} converted to customer order ${order.id}.`);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] pb-24 text-[#303833] lg:pb-0">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Quotations" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Notifications are available from the Dashboard page.")} unreadCount={0} status="Quotes" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#202621]">Quotations</h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#66716b]">
                  Prepare custom furniture estimates, send quotes to customers, and convert approved quotes into customer orders.
                </p>
              </div>
              <button onClick={openNewQuote} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0d4638]">
                <PlusCircle className="h-5 w-5" />
                Create Quotation
              </button>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">{notice}</div>

            <section className="grid gap-4 md:grid-cols-3">
              <ProductStat icon={FileText} label="Total Quotes" value={String(quotations.length).padStart(2, "0")} />
              <ProductStat icon={Clock3} label="Pending" value={String(pendingQuotes).padStart(2, "0")} warning />
              <ProductStat icon={CheckCircle2} label="Approved" value={String(approvedQuotes).padStart(2, "0")} />
            </section>

            <section className="overflow-hidden rounded-xl border border-[#c2cac5] bg-white shadow-sm">
              <div className="grid gap-3 border-b border-[#d9d5cd] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center sm:px-6">
                <label className="flex min-h-11 items-center rounded-lg border border-[#c4cbc7] bg-white px-3 text-[#747a76]">
                  <Search className="h-4 w-4 shrink-0" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search quotation, customer, product..." />
                </label>
                <div className="flex flex-wrap gap-2">
                  {["All", "Draft", "Sent", "Approved", "Converted", "Expired"].map((item) => (
                    <button key={item} onClick={() => setStatus(item)} className={`min-h-10 rounded-lg px-3 text-sm font-extrabold ${status === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[0.9fr_1.3fr_1.4fr_1fr_1fr_1fr_1.4fr] bg-[#f3eee6] px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-[#56605b] max-xl:hidden">
                <span>Quote</span><span>Customer</span><span>Product</span><span>Valid Until</span><span>Amount</span><span>Status</span><span>Actions</span>
              </div>
              <div className="divide-y divide-[#d9d5cd]">
                {filteredQuotes.map((quote) => (
                  <article key={quote.id} className="grid grid-cols-[0.9fr_1.3fr_1.4fr_1fr_1fr_1fr_1.4fr] items-center gap-4 px-5 py-5 text-sm max-xl:grid-cols-1 sm:px-6">
                    <strong className="text-[#202621]">{quote.id}</strong>
                    <span className="font-semibold">{quote.customer}</span>
                    <span className="font-semibold text-[#3d4541]">{quote.product}</span>
                    <span className="text-[#66716b]">{quote.validUntil}</span>
                    <strong>{quote.amount}</strong>
                    <span className={`w-fit rounded-full px-3 py-2 text-xs font-extrabold uppercase ${getQuoteTone(quote.status)}`}>{quote.status}</span>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openEditQuote(quote)} className="min-h-9 rounded-lg border border-[#c4cbc7] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Edit</button>
                      <button onClick={() => updateQuoteStatus(quote, "Sent")} className="min-h-9 rounded-lg bg-[#eef4ef] px-3 text-xs font-extrabold text-[#115745]">Send</button>
                      <button onClick={() => convertQuoteToOrder(quote)} disabled={!["Approved", "Sent"].includes(quote.status)} className="min-h-9 rounded-lg bg-[#115745] px-3 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:bg-[#c9c3b8]">Convert</button>
                    </div>
                  </article>
                ))}
              </div>
              {filteredQuotes.length === 0 && <p className="m-5 rounded-lg bg-[#f8f4ec] p-5 text-sm font-semibold text-[#66716b]">No quotations match this filter.</p>}
            </section>

            <div className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
              <span className="text-xs font-extrabold uppercase tracking-wide text-[#66716b]">Filtered Quote Value</span>
              <strong className="mt-1 block text-2xl text-[#202621]">LKR {totalValue.toLocaleString("en-US")}</strong>
            </div>
          </div>
        </section>
      </div>

      {modalOpen && <QuotationFormModal quote={activeQuote} onClose={() => { setModalOpen(false); setActiveQuote(null); }} onSubmit={saveQuote} />}
    </main>
  );
}

export function QuotationFormModal({ quote, onClose, onSubmit }) {
  const [form, setForm] = useState({
    customer: quote?.customer || "",
    product: quote?.product || "",
    validUntil: quote?.validUntil || getFutureDateLabel(10),
    amount: quote?.amount || "",
    status: quote?.status || "Draft",
    notes: quote?.notes || "",
  });
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const submitQuote = (event) => {
    event.preventDefault();
    if (!form.customer.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (!form.product.trim()) {
      setError("Product or custom request is required.");
      return;
    }
    if (parseOrderAmount(form.amount) <= 0) {
      setError("Enter a valid quotation amount.");
      return;
    }
    onSubmit(form);
  };

  return (
    <ModalShell title={quote ? "Edit Quotation" : "Create Quotation"} subtitle="Prepare a customer quotation with price, validity, and notes." onClose={onClose}>
      <form onSubmit={submitQuote} className="grid max-h-[calc(90vh-86px)] overflow-y-auto">
        <div className="grid gap-4 px-5 py-5 sm:px-6">
          {error && <p className="rounded-lg border border-[#f0b4b4] bg-[#fff0f0] px-3 py-2 text-sm font-bold text-[#b10015]">{error}</p>}
          <SettingsInput label="Customer Name" value={form.customer} onChange={(value) => updateField("customer", value)} />
          <SettingsInput label="Product / Custom Request" value={form.product} onChange={(value) => updateField("product", value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsInput label="Amount" value={form.amount} onChange={(value) => updateField("amount", value)} />
            <SettingsInput label="Valid Until" value={form.validUntil} onChange={(value) => updateField("validUntil", value)} />
          </div>
          <SettingsSelect label="Status" value={form.status} options={["Draft", "Sent", "Approved", "Converted", "Expired"]} onChange={(value) => updateField("status", value)} />
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Notes
            <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} rows={4} className="rounded-lg border border-[#c4cbc7] bg-white px-3 py-2 font-semibold outline-none transition focus:border-[#115745]" />
          </label>
        </div>
        <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-[#d9d5cd] bg-white px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
            <Save className="h-4 w-4" />
            {quote ? "Save Quotation" : "Create Quotation"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
