import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Package,
  Plus,
  Search,
  ShoppingCart,
} from "lucide-react";
import { ApprovalStatusBadge, DirectoryStat } from "./AdminDirectoryPage";

export function AdminProductsPage({ products, onCreate, onStatus, onFeature, onRestock, onMessage }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const statuses = ["Draft", "Pending Review", "Published", "Stock Hold", "Archived", "Rejected"];
  const categories = ["All", ...Array.from(new Set(products.map((product) => product.category)))];
  const filteredProducts = products.filter((product) => {
    const text = `${product.id} ${product.name} ${product.vendor} ${product.category} ${product.status}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || product.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    return matchesQuery && matchesStatus && matchesCategory;
  });
  const publishedCount = products.filter((product) => product.status === "Published").length;
  const reviewCount = products.filter((product) => product.status === "Pending Review").length;
  const stockHoldCount = products.filter((product) => Number(product.stock) <= 0 || product.status === "Stock Hold").length;
  const totalSales = products.reduce((sum, product) => sum + Number(product.sales || 0), 0);

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-[#104d3f]">Products</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#66716b]">
            Manage marketplace catalog listings, vendor product approvals, stock holds, featured products, and product notifications.
          </p>
        </div>
        <button onClick={onCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
          <Plus className="h-4 w-4" />
          Create Product
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <DirectoryStat icon={Package} label="Total Products" value={String(products.length)} />
        <DirectoryStat icon={CheckCircle2} label="Published" value={String(publishedCount)} />
        <DirectoryStat icon={AlertTriangle} label="Needs Review" value={String(reviewCount)} warning />
        <DirectoryStat icon={ShoppingCart} label="Total Sales" value={String(totalSales)} />
      </section>

      {stockHoldCount > 0 && (
        <div className="rounded-lg border border-[#f0c46f] bg-[#fff8e8] px-4 py-3 text-sm font-bold text-[#8b5633]">
          {stockHoldCount} product{stockHoldCount === 1 ? "" : "s"} need stock attention before reliable marketplace selling.
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-[#c6cdc8] bg-white shadow-sm">
        <div className="grid gap-3 border-b border-[#d8d4cc] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_200px_200px] lg:items-center">
          <label className="flex min-h-11 items-center rounded-lg border border-[#c6cdc8] bg-white px-3 text-[#66716b]">
            <Search className="h-4 w-4 shrink-0" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search products, vendors, categories..." />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            <option>All</option>
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-[#f3eee6] text-xs font-extrabold uppercase text-[#56605b]">
              <tr><th className="px-5 py-4">Product</th><th className="px-4 py-4">Vendor</th><th className="px-4 py-4">Price</th><th className="px-4 py-4">Stock</th><th className="px-4 py-4">Status</th><th className="px-5 py-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-[#e2ded7]">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-4">
                    <span className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#e9f2ed] text-[#104d3f]"><Package className="h-5 w-5" /></span>
                      <span>
                        <strong className="block text-[#202621]">{product.name}</strong>
                        <span className="text-xs font-semibold text-[#66716b]">{product.id} - {product.category} - Submitted {product.submitted}</span>
                        {product.featured && <span className="mt-1 inline-flex rounded-full bg-[#fff0cd] px-2 py-1 text-[10px] font-extrabold uppercase text-[#8b5633]">Featured</span>}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#4f5853]">{product.vendor}</td>
                  <td className="px-4 py-4 font-extrabold">{product.price}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${Number(product.stock) <= 0 ? "bg-[#ffe1df] text-[#b83f47]" : Number(product.stock) < 10 ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#d9ecd8] text-[#104d3f]"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-4"><ApprovalStatusBadge status={product.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => onStatus(product, "Published")} disabled={product.status === "Published"} className="min-h-9 rounded-lg bg-[#104d3f] px-3 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:bg-[#c6cdc8]">Approve</button>
                      <button onClick={() => onStatus(product, "Pending Review")} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Review</button>
                      <button onClick={() => onFeature(product)} className="min-h-9 rounded-lg bg-[#fff0cd] px-3 text-xs font-extrabold text-[#8b5633]">{product.featured ? "Unfeature" : "Feature"}</button>
                      <button onClick={() => onRestock(product)} className="min-h-9 rounded-lg bg-[#d9ecd8] px-3 text-xs font-extrabold text-[#104d3f]">Restock</button>
                      <button onClick={() => onStatus(product, "Archived")} className="min-h-9 rounded-lg bg-[#e9e4dc] px-3 text-xs font-extrabold text-[#3d4541]">Archive</button>
                      <button onClick={() => onMessage(product)} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Message Vendor</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && <p className="p-5 text-sm font-semibold text-[#66716b]">No products match this filter.</p>}
        </div>
      </section>
    </section>
  );
}
