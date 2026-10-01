import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Grid2X2,
  Package,
  Plus,
  Search,
} from "lucide-react";
import { ApprovalStatusBadge, DirectoryStat } from "./AdminDirectoryPage";

export function AdminCategoriesPage({ categories, onCreate, onUpdate, onMove }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [parentFilter, setParentFilter] = useState("All");
  const parents = ["All", ...Array.from(new Set(categories.map((category) => category.parent)))];
  const filteredCategories = categories
    .slice()
    .sort((a, b) => Number(a.order) - Number(b.order))
    .filter((category) => {
      const text = `${category.id} ${category.name} ${category.parent} ${category.status}`.toLowerCase();
      const matchesQuery = text.includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || category.status === statusFilter;
      const matchesParent = parentFilter === "All" || category.parent === parentFilter;
      return matchesQuery && matchesStatus && matchesParent;
    });
  const visibleCount = categories.filter((category) => category.status === "Visible").length;
  const hiddenCount = categories.filter((category) => category.status === "Hidden").length;
  const featuredCount = categories.filter((category) => category.featured).length;
  const totalProducts = categories.reduce((sum, category) => sum + Number(category.products || 0), 0);

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-[#104d3f]">Categories</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#66716b]">
            Manage marketplace category visibility, parent grouping, display order, commission, and featured sections.
          </p>
        </div>
        <button onClick={onCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
          <Plus className="h-4 w-4" />
          Create Category
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <DirectoryStat icon={Grid2X2} label="Total Categories" value={String(categories.length)} />
        <DirectoryStat icon={CheckCircle2} label="Visible" value={String(visibleCount)} />
        <DirectoryStat icon={AlertTriangle} label="Hidden" value={String(hiddenCount)} warning />
        <DirectoryStat icon={Package} label="Linked Products" value={String(totalProducts)} />
      </section>

      <section className="overflow-hidden rounded-xl border border-[#c6cdc8] bg-white shadow-sm">
        <div className="grid gap-3 border-b border-[#d8d4cc] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_180px_180px] lg:items-center">
          <label className="flex min-h-11 items-center rounded-lg border border-[#c6cdc8] bg-white px-3 text-[#66716b]">
            <Search className="h-4 w-4 shrink-0" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search categories..." />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            <option>All</option>
            <option>Visible</option>
            <option>Hidden</option>
          </select>
          <select value={parentFilter} onChange={(event) => setParentFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            {parents.map((parent) => <option key={parent}>{parent}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead className="bg-[#f3eee6] text-xs font-extrabold uppercase text-[#56605b]">
              <tr><th className="px-5 py-4">Category</th><th className="px-4 py-4">Parent</th><th className="px-4 py-4">Products</th><th className="px-4 py-4">Vendors</th><th className="px-4 py-4">Commission</th><th className="px-4 py-4">Status</th><th className="px-5 py-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-[#e2ded7]">
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td className="px-5 py-4">
                    <span className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#e9f2ed] text-[#104d3f]"><Grid2X2 className="h-5 w-5" /></span>
                      <span>
                        <strong className="block text-[#202621]">{category.name}</strong>
                        <span className="text-xs font-semibold text-[#66716b]">{category.id} - Display order {category.order}</span>
                        {category.featured && <span className="mt-1 inline-flex rounded-full bg-[#fff0cd] px-2 py-1 text-[10px] font-extrabold uppercase text-[#8b5633]">Featured</span>}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#4f5853]">{category.parent}</td>
                  <td className="px-4 py-4 font-extrabold">{category.products}</td>
                  <td className="px-4 py-4 font-extrabold">{category.vendors}</td>
                  <td className="px-4 py-4 font-extrabold">{category.commission}</td>
                  <td className="px-4 py-4"><ApprovalStatusBadge status={category.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => onUpdate(category, "status", "Visible")} disabled={category.status === "Visible"} className="min-h-9 rounded-lg bg-[#104d3f] px-3 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:bg-[#c6cdc8]">Show</button>
                      <button onClick={() => onUpdate(category, "status", "Hidden")} disabled={category.status === "Hidden"} className="min-h-9 rounded-lg bg-[#e9e4dc] px-3 text-xs font-extrabold text-[#3d4541] disabled:cursor-not-allowed disabled:bg-[#c6cdc8]">Hide</button>
                      <button onClick={() => onUpdate(category, "featured", !category.featured)} className="min-h-9 rounded-lg bg-[#fff0cd] px-3 text-xs font-extrabold text-[#8b5633]">{category.featured ? "Unfeature" : "Feature"}</button>
                      <button onClick={() => onMove(category, -1)} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Move Up</button>
                      <button onClick={() => onMove(category, 1)} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Move Down</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCategories.length === 0 && <p className="p-5 text-sm font-semibold text-[#66716b]">No categories match this filter.</p>}
        </div>
      </section>

      <div className="rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] px-4 py-3 text-sm font-semibold text-[#66716b]">
        Featured categories: {featuredCount}. Visible categories are shown in customer marketplace navigation.
      </div>
    </section>
  );
}
