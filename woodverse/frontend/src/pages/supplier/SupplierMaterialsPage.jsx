import { useState } from "react";
import {
  EllipsisVertical,
  Globe2,
  Grid3X3,
  LayoutGrid,
  LayoutList,
  Moon,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sun,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { navigate } from "../../utils";
import { SupplierSidebar } from "./SupplierSidebar";
import { formatLkrCompact, formatMaterialPrice, materialPercentNumber, materialPriceNumber, materialQuantityNumber, materialTone } from "./format.js";
import { SupplierProfileField } from "./shared";

export function SupplierMaterialsPage({ theme, onToggleTheme }) {
  const [notice, setNotice] = useState("Material catalog synced with marketplace inventory.");
  const [viewMode, setViewMode] = useState("grid");
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [showNewMaterial, setShowNewMaterial] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [updatingMaterialId, setUpdatingMaterialId] = useState(null);
  const [bulkPercent, setBulkPercent] = useState(5);
  const [materials, setMaterials] = useState([
    {
      id: "mat-teak-grade-a",
      name: "Grade A Teak Log",
      grade: "Grade A",
      status: "In Stock",
      image: "/assets/material-teak-log.webp",
      price: "LKR 450,000 / m3",
      qty: "124.50 m3",
      percent: "82%",
      tone: "bg-[#3f835d] text-white",
    },
    {
      id: "mat-mahogany-planks",
      name: "Mahogany Planks",
      grade: "Grade B",
      status: "Low Stock",
      image: "/assets/material-mahogany-planks.webp",
      price: "LKR 380,000 / m3",
      qty: "12.20 m3",
      percent: "22%",
      tone: "bg-[#e7a12a] text-[#202621]",
    },
    {
      id: "mat-satinwood-slabs",
      name: "Satinwood Slabs",
      grade: "Prime",
      status: "In Stock",
      image: "/assets/material-satinwood-slabs.webp",
      price: "LKR 520,000 / m3",
      qty: "45.00 m3",
      percent: "58%",
      tone: "bg-[#3f835d] text-white",
    },
    {
      id: "mat-premium-rosewood",
      name: "Premium Rosewood",
      grade: "Grade A",
      status: "In Stock",
      image: "/assets/material-premium-rosewood.webp",
      price: "LKR 610,000 / m3",
      qty: "88.25 m3",
      percent: "74%",
      tone: "bg-[#3f835d] text-white",
    },
  ]);
  const editingMaterial = materials.find((material) => material.id === editingMaterialId);
  const updatingMaterial = materials.find((material) => material.id === updatingMaterialId);
  const lowStockCount = materials.filter((material) => material.status === "Low Stock").length;
  const totalInventoryValue = materials.reduce((total, material) => total + materialPriceNumber(material.price) * materialQuantityNumber(material.qty), 0);

  const addMaterial = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const status = formData.get("status");
    const name = formData.get("name").trim();
    const qty = formData.get("qty").trim();
    const unitPrice = Number(formData.get("unitPrice"));
    const nextMaterial = {
      id: `mat-${Date.now()}`,
      name,
      grade: formData.get("grade").trim(),
      status,
      image: "/assets/material-teak-log.webp",
      price: `LKR ${new Intl.NumberFormat("en-LK").format(unitPrice)} / m3`,
      qty: `${qty} m3`,
      percent: status === "Low Stock" ? "24%" : "68%",
      tone: materialTone(status),
    };
    setMaterials((items) => [nextMaterial, ...items]);
    setNotice(`${name} added to timber inventory.`);
    setShowNewMaterial(false);
    event.currentTarget.reset();
  };

  const applyBulkPriceUpdate = (direction) => {
    const multiplier = direction === "increase" ? 1 + bulkPercent / 100 : 1 - bulkPercent / 100;
    setMaterials((items) => items.map((material) => ({
      ...material,
      price: formatMaterialPrice(material.price, multiplier),
    })));
    setNotice(`Bulk price ${direction === "increase" ? "increase" : "decrease"} of ${bulkPercent}% applied to ${materials.length} materials.`);
    setShowBulkUpdate(false);
  };

  const openMaterialEditor = (material) => {
    setEditingMaterialId(material.id);
    setUpdatingMaterialId(null);
    setShowBulkUpdate(false);
    setShowNewMaterial(false);
    setNotice(`${material.name} editor opened.`);
  };

  const openMaterialUpdater = (material) => {
    setUpdatingMaterialId(material.id);
    setEditingMaterialId(null);
    setShowBulkUpdate(false);
    setShowNewMaterial(false);
    setNotice(`${material.name} stock update opened.`);
  };

  const saveMaterialEdit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const materialId = formData.get("materialId");
    const status = formData.get("status");
    const imageFile = formData.get("imageFile");
    const uploadedImage = imageFile && imageFile.size ? URL.createObjectURL(imageFile) : "";
    const imageUrl = formData.get("imageUrl").trim();
    const nextName = formData.get("name").trim();
    const qty = formData.get("qty").trim();
    const percent = `${Math.min(100, Math.max(0, Number(formData.get("percent"))))}%`;
    setMaterials((items) => items.map((material) => material.id === materialId ? {
      ...material,
      name: nextName,
      grade: formData.get("grade").trim(),
      status,
      image: uploadedImage || imageUrl || material.image,
      price: `LKR ${new Intl.NumberFormat("en-LK").format(Number(formData.get("unitPrice")))} / m3`,
      qty: `${qty} m3`,
      percent,
      tone: materialTone(status),
    } : material));
    setEditingMaterialId(null);
    setNotice(`${nextName} changes saved.`);
  };

  const saveMaterialStockUpdate = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const materialId = formData.get("materialId");
    const status = formData.get("status");
    const qty = formData.get("qty").trim();
    const percent = `${Math.min(100, Math.max(0, Number(formData.get("percent"))))}%`;
    const currentMaterial = materials.find((material) => material.id === materialId);
    setMaterials((items) => items.map((material) => {
      if (material.id !== materialId) {
        return material;
      }
      return {
        ...material,
        status,
        qty: `${qty} m3`,
        percent,
        tone: materialTone(status),
      };
    }));
    setUpdatingMaterialId(null);
    setNotice(`${currentMaterial?.name || "Material"} stock update saved.`);
  };

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Materials" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/90 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/90 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search catalog by species or grade..." />
            </label>
            <div className="flex shrink-0 items-center gap-3">
              <button onClick={() => setNotice("Language selector opened.")} className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Language">
                <Globe2 className="h-5 w-5" />
              </button>
              <button
                onClick={onToggleTheme}
                className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button onClick={() => navigate("/supplier/apps")} className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Apps">
                <Grid3X3 className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-7 px-6 py-9 xl:px-10">
            <section className="flex min-w-0 items-start justify-between gap-5 max-md:grid">
              <div className="min-w-0">
                <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">Timber Inventory</h1>
                <p className="mt-2 max-w-2xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">Manage your raw material stock and pricing for the marketplace.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setShowBulkUpdate((visible) => !visible);
                    setShowNewMaterial(false);
                    setEditingMaterialId(null);
                    setUpdatingMaterialId(null);
                    setNotice(showBulkUpdate ? "Bulk price update closed." : "Bulk price update workspace opened.");
                  }}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#8b5633] bg-[#fbf8f1] px-4 font-bold text-[#8b5633] dark:border-amber-500/60 dark:bg-[#202b28] dark:text-amber-200"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Bulk Update Prices
                </button>
                <button
                  onClick={() => {
                    setShowNewMaterial((visible) => !visible);
                    setShowBulkUpdate(false);
                    setEditingMaterialId(null);
                    setUpdatingMaterialId(null);
                    setNotice(showNewMaterial ? "New material form closed." : "New material form opened.");
                  }}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#115745] px-5 font-bold text-white shadow-sm"
                >
                  <Plus className="h-5 w-5" />
                  Add New Material
                </button>
              </div>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            {showBulkUpdate && (
              <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-5 rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f] max-md:grid-cols-1">
                <label className="grid min-w-0 gap-2">
                  <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Bulk price adjustment percentage</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={bulkPercent}
                    onChange={(event) => setBulkPercent(Number(event.target.value))}
                    className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none focus:border-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100"
                  />
                </label>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => applyBulkPriceUpdate("increase")} className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white">Increase Prices</button>
                  <button onClick={() => applyBulkPriceUpdate("decrease")} className="min-h-11 rounded-md border border-[#8b5633] bg-[#fbf8f1] px-5 font-bold text-[#8b5633] dark:border-amber-500/60 dark:bg-[#202b28] dark:text-amber-200">Decrease Prices</button>
                  <button onClick={() => setShowBulkUpdate(false)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28]">Cancel</button>
                </div>
              </section>
            )}

            {showNewMaterial && (
              <form onSubmit={addMaterial} className="grid grid-cols-4 gap-5 rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f] max-lg:grid-cols-2 max-sm:grid-cols-1">
                <SupplierProfileField label="Material name" name="name" defaultValue="Nedun Boards" />
                <SupplierProfileField label="Grade" name="grade" defaultValue="Grade A" />
                <SupplierProfileField label="Unit price (LKR / m3)" name="unitPrice" type="number" defaultValue="295000" />
                <SupplierProfileField label="Available quantity" name="qty" type="number" defaultValue="36.00" />
                <label className="grid min-w-0 gap-2">
                  <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Status</span>
                  <select name="status" className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
                    <option>In Stock</option>
                    <option>Low Stock</option>
                  </select>
                </label>
                <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-3 max-sm:flex-col">
                  <button type="submit" className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white max-sm:w-full">Save Material</button>
                  <button type="button" onClick={() => setShowNewMaterial(false)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28] max-sm:w-full">Cancel</button>
                </div>
              </form>
            )}

            {editingMaterial && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-[#111816]/60 p-4">
                <form onSubmit={saveMaterialEdit} className="grid max-h-[92vh] w-full max-w-[940px] grid-cols-[180px_minmax(0,1fr)] gap-5 overflow-y-auto rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#18211f] max-md:grid-cols-1">
                  <input type="hidden" name="materialId" value={editingMaterial.id} />
                  <div className="overflow-hidden rounded-md border border-[#cbd2cd] bg-[#e9e5dc] dark:border-white/10">
                    <img src={editingMaterial.image} alt={editingMaterial.name} className="h-44 w-full object-cover" />
                  </div>
                  <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
                    <div className="flex min-w-0 items-start justify-between gap-3 sm:col-span-2 lg:col-span-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#68716c] dark:text-stone-400">Edit material</p>
                        <h2 className="break-words text-2xl font-extrabold text-[#115745] dark:text-emerald-200">{editingMaterial.name}</h2>
                      </div>
                      <button type="button" onClick={() => setEditingMaterialId(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#202b28]" aria-label="Close material editor">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <SupplierProfileField label="Material name" name="name" defaultValue={editingMaterial.name} />
                    <SupplierProfileField label="Grade" name="grade" defaultValue={editingMaterial.grade} />
                    <SupplierProfileField label="Unit price (LKR / m3)" name="unitPrice" type="number" defaultValue={String(materialPriceNumber(editingMaterial.price))} />
                    <SupplierProfileField label="Available quantity" name="qty" type="number" defaultValue={String(materialQuantityNumber(editingMaterial.qty))} />
                    <SupplierProfileField label="Capacity percentage" name="percent" type="number" defaultValue={String(materialPercentNumber(editingMaterial.percent))} />
                    <label className="grid min-w-0 gap-2">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Status</span>
                      <select name="status" defaultValue={editingMaterial.status} className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
                        <option>In Stock</option>
                        <option>Low Stock</option>
                      </select>
                    </label>
                    <SupplierProfileField label="Image URL" name="imageUrl" defaultValue={editingMaterial.image} />
                    <label className="grid min-w-0 gap-2 sm:col-span-2">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Upload image</span>
                      <input name="imageFile" type="file" accept="image/*" className="min-h-11 min-w-0 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 py-2 outline-none file:mr-3 file:rounded file:border-0 file:bg-[#115745] file:px-3 file:py-1 file:font-bold file:text-white dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100" />
                    </label>
                    <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-3 max-sm:flex-col">
                      <button type="submit" className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white max-sm:w-full">Save Edit</button>
                      <button type="button" onClick={() => setEditingMaterialId(null)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28] max-sm:w-full">Cancel</button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {updatingMaterial && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-[#111816]/60 p-4">
                <form onSubmit={saveMaterialStockUpdate} className="grid max-h-[92vh] w-full max-w-[760px] grid-cols-4 gap-5 overflow-y-auto rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#18211f] max-lg:grid-cols-2 max-sm:grid-cols-1">
                  <input type="hidden" name="materialId" value={updatingMaterial.id} />
                  <div className="flex min-w-0 items-start justify-between gap-3 lg:col-span-4 max-lg:col-span-2 max-sm:col-span-1">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#39433f] dark:text-stone-100">Updating material</p>
                      <h2 className="mt-2 break-words text-2xl font-extrabold text-[#115745] dark:text-emerald-200">{updatingMaterial.name}</h2>
                    </div>
                    <button type="button" onClick={() => setUpdatingMaterialId(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#202b28]" aria-label="Close stock updater">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <SupplierProfileField label="Available quantity" name="qty" type="number" defaultValue={String(materialQuantityNumber(updatingMaterial.qty))} />
                  <SupplierProfileField label="Capacity percentage" name="percent" type="number" defaultValue={String(materialPercentNumber(updatingMaterial.percent))} />
                  <label className="grid min-w-0 gap-2">
                    <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Status</span>
                    <select name="status" defaultValue={updatingMaterial.status} className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
                      <option>In Stock</option>
                      <option>Low Stock</option>
                    </select>
                  </label>
                  <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-4 max-sm:flex-col">
                    <button type="submit" className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white max-sm:w-full">Save Update</button>
                    <button type="button" onClick={() => setUpdatingMaterialId(null)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28] max-sm:w-full">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <section className="flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-lg border border-[#cbd2cd] bg-[#fbf8f1] p-4 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
              <div className="flex flex-wrap gap-3">
                {["All Materials", "Species: Teak", "Status: Low Stock"].map((filter, index) => (
                  <button key={filter} onClick={() => setNotice(`${filter} filter selected.`)} className={`min-h-9 rounded-full border px-4 text-sm font-semibold ${index === 0 ? "border-[#115745] text-[#115745] dark:border-emerald-200 dark:text-emerald-200" : "border-[#cbd2cd] bg-[#e9e5dc] text-[#4d5651] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-300"}`}>
                    {filter}
                  </button>
                ))}
              </div>
              <div className="flex rounded-md bg-[#e9e5dc] p-1 dark:bg-[#202b28]">
                <button onClick={() => setViewMode("grid")} className={`grid h-10 w-10 place-items-center rounded-md ${viewMode === "grid" ? "bg-[#2f6757] text-white" : "text-[#4d5651] dark:text-stone-300"}`} aria-label="Grid view">
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button onClick={() => setViewMode("list")} className={`grid h-10 w-10 place-items-center rounded-md ${viewMode === "list" ? "bg-[#2f6757] text-white" : "text-[#4d5651] dark:text-stone-300"}`} aria-label="List view">
                  <LayoutList className="h-5 w-5" />
                </button>
              </div>
            </section>

            <section className={viewMode === "grid" ? "grid grid-cols-3 gap-6 max-xl:grid-cols-2 max-sm:grid-cols-1" : "grid gap-4"}>
              {materials.map((material) => (
                <MaterialCard key={material.id} material={material} viewMode={viewMode} onEdit={() => openMaterialEditor(material)} onUpdate={() => openMaterialUpdater(material)} />
              ))}
            </section>

            <section className="grid grid-cols-3 gap-6 max-xl:grid-cols-1">
              <article className="relative overflow-hidden rounded-lg bg-[#2f6757] p-7 text-white shadow-soft">
                <Wallet className="absolute bottom-5 right-6 h-10 w-10 rounded-full bg-white/15 p-2 text-white/80" />
                <p className="text-sm font-semibold text-white/75">Total Inventory Value</p>
                <strong className="mt-3 block text-4xl leading-tight">{formatLkrCompact(totalInventoryValue)}</strong>
                <p className="mt-3 text-sm font-bold">{materials.length} active materials</p>
              </article>
              <article className="rounded-lg border border-[#cbd2cd] bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                <div className="mb-6 flex justify-between gap-4">
                  <p className="font-semibold text-[#68716c] dark:text-stone-400">Low Stock Alerts</p>
                  <span className="rounded bg-rose-100 px-2 py-1 text-xs font-extrabold uppercase text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">Critical</span>
                </div>
                <strong className="text-3xl text-[#d94d58]">{lowStockCount} {lowStockCount === 1 ? "Material" : "Materials"}</strong>
                <p className="mt-2 leading-relaxed text-[#4d5651] dark:text-stone-300">{lowStockCount ? "Requires immediate update to avoid stockout." : "No immediate stock update required."}</p>
              </article>
              <article className="relative overflow-hidden rounded-lg bg-[#ffc090] p-7 text-[#7b4b2d] shadow-sm dark:bg-[#6a452f] dark:text-amber-100">
                <Truck className="absolute bottom-6 right-6 h-10 w-10 text-[#7b4b2d]/35 dark:text-amber-100/30" />
                <p className="font-semibold">Pending Shipments</p>
                <strong className="mt-6 block text-4xl leading-tight">1,240 m3</strong>
                <p className="mt-2">Awaiting logistics pickup</p>
              </article>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

export function MaterialCard({ material, viewMode, onEdit, onUpdate }) {
  const list = viewMode === "list";
  return (
    <article className={`overflow-hidden rounded-lg border border-[#cbd2cd] bg-white shadow-sm dark:border-white/10 dark:bg-[#18211f] ${list ? "grid grid-cols-[180px_minmax(0,1fr)_auto] items-center max-md:grid-cols-1" : ""}`}>
      <div className={`relative overflow-hidden bg-[#e9e5dc] ${list ? "h-36 md:h-full" : "h-48"}`}>
        <img src={material.image} alt={material.name} className="h-full w-full object-cover" />
        <span className={`absolute left-3 top-3 rounded px-2 py-1 text-xs font-extrabold uppercase ${material.tone}`}>{material.status}</span>
        <span className="absolute bottom-3 right-3 rounded-md bg-white px-3 py-2 text-sm font-extrabold text-[#115745] shadow-sm dark:bg-[#202b28] dark:text-emerald-200">{material.grade}</span>
      </div>
      <div className="min-w-0 p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="break-words text-2xl font-extrabold leading-tight text-[#202621] dark:text-stone-100">{material.name}</h2>
          <button onClick={onEdit} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#68716c] hover:bg-[#f4f0e8] dark:text-stone-400 dark:hover:bg-[#202b28]" aria-label={`More actions for ${material.name}`}>
            <EllipsisVertical className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-3">
          <div className="flex justify-between gap-4">
            <span className="text-[#68716c] dark:text-stone-400">Unit Price</span>
            <strong className="text-[#8b5633] dark:text-amber-200">{material.price}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#68716c] dark:text-stone-400">Available Qty</span>
            <strong className={material.status === "Low Stock" ? "text-[#d58a1b]" : "text-[#202621] dark:text-stone-100"}>{material.qty}</strong>
          </div>
          <div className="h-1.5 rounded-full bg-[#e2dfd7] dark:bg-white/10">
            <span className={`block h-full rounded-full ${material.status === "Low Stock" ? "bg-[#d58a1b]" : "bg-[#3f835d]"}`} style={{ width: material.percent }} />
          </div>
        </div>
      </div>
      <div className={`grid gap-2 p-5 ${list ? "min-w-44" : "grid-cols-2 border-t border-[#edf0ed] dark:border-white/10"}`}>
        <button onClick={onEdit} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#cbd2cd] bg-white px-4 font-semibold text-[#39433f] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
          <Pencil className="h-4 w-4" />
          Edit
        </button>
        <button onClick={onUpdate} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#cbd2cd] bg-white px-4 font-semibold text-[#39433f] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
          <RefreshCw className="h-4 w-4" />
          Update
        </button>
      </div>
    </article>
  );
}
