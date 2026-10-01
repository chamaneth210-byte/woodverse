import { useState } from "react";
import {
  Boxes,
  CheckCircle2,
  Globe2,
  Grid3X3,
  Moon,
  Plus,
  Search,
  Sun,
  Truck,
  Warehouse,
  Wallet,
  X,
} from "lucide-react";
import { navigate } from "../../utils";
import { publishAdminEvent } from "../../lib/adminEvents";
import { SupplierSidebar } from "./SupplierSidebar";
import { ProfileInfoRow, SupplierProfileField } from "./shared";

export function SupplierProfilePage({ theme, onToggleTheme }) {
  const defaultProfile = {
    companyName: "Lumbini Timber Co.",
    registration: "PV-20491",
    email: "operations@lumbinitimber.lk",
    phone: "+94 11 245 8891",
    address: "No. 18, Galle Main Yard, Galle, Sri Lanka",
    manager: "John Doe",
    managerRole: "Logistics Manager",
  };
  const [notice, setNotice] = useState("Supplier profile loaded.");
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-supplier-profile")) || defaultProfile;
    } catch {
      return defaultProfile;
    }
  });
  const [saved, setSaved] = useState(false);
  const [showYardForm, setShowYardForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [yards, setYards] = useState([
    { name: "Galle Main Yard", capacity: "88% full", materials: "Grade-A Teak, Jackwood", status: "Primary" },
    { name: "Matara Transit Hub", capacity: "32% full", materials: "Mahogany, Satinwood", status: "Transit" },
    { name: "Kandy Logging Yard", capacity: "54% full", materials: "Rosewood, Nedun", status: "Logging" },
  ]);
  const [documents, setDocuments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-supplier-verification-documents") || "null") || [
        { name: "Business Registration Certificate", status: "Required", detail: "Upload required for admin approval" },
        { name: "Owner / Director Identity Document", status: "Required", detail: "Upload required for admin approval" },
        { name: "Business Address Proof", status: "Required", detail: "Upload required for admin approval" },
        { name: "Material Source / Compliance Certificate", status: "Required", detail: "Upload required for admin approval" },
      ];
    } catch {
      return [];
    }
  });
  const [payout, setPayout] = useState({
    bank: "Commercial Bank PLC",
    account: "**** 4821",
    settlement: "Weekly, Monday",
    currency: "LKR",
  });

  const saveSupplierProfile = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextProfile = {
      companyName: formData.get("companyName").trim(),
      registration: formData.get("registration").trim(),
      email: formData.get("email").trim(),
      phone: formData.get("phone").trim(),
      address: formData.get("address").trim(),
      manager: formData.get("manager").trim(),
      managerRole: formData.get("managerRole").trim(),
    };
    setProfile(nextProfile);
    setSaved(true);
    setNotice("Supplier profile changes saved.");
    try {
      localStorage.setItem("woodverse-supplier-profile", JSON.stringify(nextProfile));
    } catch {}
    publishAdminEvent("Supplier", "Supplier profile updated", `${nextProfile.companyName} updated business and contact details.`, "Normal");
  };

  const addOperatingYard = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const yard = {
      name: formData.get("name").trim(),
      capacity: `${formData.get("capacity").trim()}% full`,
      materials: formData.get("materials").trim(),
      status: formData.get("status"),
    };
    setYards((items) => [yard, ...items]);
    setShowYardForm(false);
    setNotice(`${yard.name} added to operating yards.`);
  };

  const uploadComplianceDocument = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get("documentFile");
    if (!file?.name) {
      setNotice("Select a document file before uploading.");
      return;
    }
    const document = {
      name: formData.get("name").trim(),
      status: "Review",
      detail: `Uploaded ${file.name}`,
    };
    setDocuments((items) => {
      const next = [document, ...items];
      try { localStorage.setItem("woodverse-supplier-verification-documents", JSON.stringify(next)); } catch {}
      return next;
    });
    publishAdminEvent("Supplier", `Compliance document uploaded: ${document.name}`, `${profile.companyName} submitted ${document.name} for admin review.`, "High");
    setShowDocumentForm(false);
    setNotice(`${document.name} uploaded and sent for admin review.`);
  };

  const savePayoutPreferences = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextPayout = {
      bank: formData.get("bank").trim(),
      account: formData.get("account").trim(),
      settlement: formData.get("settlement").trim(),
      currency: formData.get("currency"),
    };
    setPayout(nextPayout);
    setShowPayoutForm(false);
    setNotice("Payout preferences saved.");
  };

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Profile" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/90 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/90 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search profile settings..." />
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
            <section className="grid grid-cols-[minmax(0,1fr)_300px] gap-6 max-lg:grid-cols-1">
              <div className="min-w-0">
                <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">Supplier Profile</h1>
                <p className="mt-2 max-w-3xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">Manage your business identity, compliance credentials, payout preferences, and operating locations.</p>
              </div>
              <article className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 rounded-lg bg-[#2f6757] p-5 text-white shadow-soft">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-white/15 text-xl font-extrabold">LT</span>
                <span className="min-w-0">
                  <strong className="block break-words text-xl leading-tight">{profile.companyName}</strong>
                  <span className="text-sm text-white/70">Verified Supplier</span>
                </span>
              </article>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="grid grid-cols-4 gap-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
              <SupplierProfileStat icon={CheckCircle2} label="Verification" value="Approved" />
              <SupplierProfileStat icon={Boxes} label="Materials Listed" value="24" />
              <SupplierProfileStat icon={Truck} label="Yards" value={String(yards.length).padStart(2, "0")} />
              <SupplierProfileStat icon={Wallet} label="Payout Status" value="Active" />
            </section>

            <section className="grid grid-cols-[minmax(0,1fr)_320px] gap-6 max-xl:grid-cols-1">
              <div className="grid gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="mb-6 flex items-center justify-between gap-4 max-sm:grid">
                    <div>
                      <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">Business Information</h2>
                      <p className="mt-1 text-[#68716c] dark:text-stone-400">These details appear on orders, invoices, and supplier verification records.</p>
                    </div>
                    {saved && <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold uppercase text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200">Saved</span>}
                  </div>

                  <form key={JSON.stringify(profile)} onSubmit={saveSupplierProfile} onChange={() => setSaved(false)} className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                    <SupplierProfileField label="Company name" name="companyName" defaultValue={profile.companyName} />
                    <SupplierProfileField label="Registration number" name="registration" defaultValue={profile.registration} />
                    <SupplierProfileField label="Business email" name="email" defaultValue={profile.email} type="email" />
                    <SupplierProfileField label="Business phone" name="phone" defaultValue={profile.phone} type="tel" />
                    <SupplierProfileField label="Primary manager" name="manager" defaultValue={profile.manager} />
                    <SupplierProfileField label="Manager role" name="managerRole" defaultValue={profile.managerRole} />
                    <label className="grid min-w-0 gap-2 sm:col-span-2">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Registered address</span>
                      <textarea name="address" rows={3} defaultValue={profile.address} className="min-w-0 resize-none rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 py-3 outline-none focus:border-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100" />
                    </label>
                    <div className="flex justify-end gap-3 sm:col-span-2 max-sm:flex-col">
                      <button type="reset" onClick={() => { setSaved(true); setNotice("Profile changes reset to saved values."); }} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold text-[#39433f] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">Cancel</button>
                      <button type="submit" className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white">Save Changes</button>
                    </div>
                  </form>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">Operating Yards</h2>
                    <button onClick={() => { setShowYardForm(true); setShowDocumentForm(false); setShowPayoutForm(false); setNotice("New operating yard form opened."); }} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#115745] px-4 font-bold text-white"><Plus className="h-4 w-4" /> Add Yard</button>
                  </div>
                  <div className="grid gap-4">
                    {yards.map(({ name, capacity, materials, status }) => (
                      <article key={name} className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-4 rounded-md bg-[#f4f0e8] p-4 dark:bg-[#202b28] max-sm:grid-cols-1">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#115745] dark:bg-[#18211f] dark:text-emerald-200"><Warehouse className="h-5 w-5" /></span>
                        <span className="min-w-0">
                          <strong className="block break-words text-[#202621] dark:text-stone-100">{name}</strong>
                          <span className="text-sm text-[#68716c] dark:text-stone-400">{materials} - {capacity}</span>
                        </span>
                        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase text-[#115745] dark:bg-[#18211f] dark:text-emerald-200">{status}</span>
                      </article>
                    ))}
                  </div>
                </article>
              </div>

              <aside className="grid h-fit gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="text-xl font-extrabold text-[#115745] dark:text-emerald-200">Verification Documents</h2>
                  <p className="mt-1 text-sm text-[#68716c] dark:text-stone-400">Submit all required documents before supplier approval.</p>
                  <div className="mt-5 grid gap-3">
                    {documents.map(({ name, status, detail }) => (
                      <article key={name} className="rounded-md border border-[#e2dfd7] p-4 dark:border-white/10">
                        <div className="flex justify-between gap-3">
                          <strong className="text-[#202621] dark:text-stone-100">{name}</strong>
                          <span className={`rounded-full px-2 py-1 text-xs font-extrabold uppercase ${status === "Review" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200" : "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200"}`}>{status}</span>
                        </div>
                        <p className="mt-2 text-sm text-[#68716c] dark:text-stone-400">{detail}</p>
                      </article>
                    ))}
                  </div>
                  <button onClick={() => { setShowDocumentForm(true); setShowYardForm(false); setShowPayoutForm(false); setNotice("Document upload panel opened."); }} className="mt-5 min-h-11 w-full rounded-md border border-[#cbd2cd] bg-white font-bold text-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-emerald-200">Upload Document</button>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-[#e9e5dc] p-6 shadow-sm dark:border-white/10 dark:bg-[#202b28]">
                  <h2 className="text-xl font-extrabold text-[#202621] dark:text-stone-100">Payout Preferences</h2>
                  <div className="mt-5 grid gap-3 text-sm">
                    <ProfileInfoRow label="Bank" value={payout.bank} />
                    <ProfileInfoRow label="Account" value={payout.account} />
                    <ProfileInfoRow label="Settlement" value={payout.settlement} />
                    <ProfileInfoRow label="Currency" value={payout.currency} />
                  </div>
                  <button onClick={() => { setShowPayoutForm(true); setShowYardForm(false); setShowDocumentForm(false); setNotice("Payout preferences editor opened."); }} className="mt-5 min-h-11 w-full rounded-md bg-[#115745] font-bold text-white">Edit Payouts</button>
                </article>
              </aside>
            </section>

            {showYardForm && (
              <ProfileModal title="Add Operating Yard" onClose={() => setShowYardForm(false)}>
                <form onSubmit={addOperatingYard} className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                  <SupplierProfileField label="Yard name" name="name" defaultValue="Kurunegala Storage Yard" />
                  <SupplierProfileField label="Capacity percentage" name="capacity" type="number" defaultValue="45" />
                  <SupplierProfileField label="Materials handled" name="materials" defaultValue="Teak, Mahogany" />
                  <label className="grid min-w-0 gap-2">
                    <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Yard type</span>
                    <select name="status" defaultValue="Storage" className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
                      <option>Primary</option>
                      <option>Transit</option>
                      <option>Logging</option>
                      <option>Storage</option>
                    </select>
                  </label>
                  <div className="flex justify-end gap-3 sm:col-span-2 max-sm:flex-col">
                    <button type="button" onClick={() => setShowYardForm(false)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28]">Cancel</button>
                    <button type="submit" className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white">Save Yard</button>
                  </div>
                </form>
              </ProfileModal>
            )}

            {showDocumentForm && (
              <ProfileModal title="Upload Compliance Document" onClose={() => setShowDocumentForm(false)}>
                <form onSubmit={uploadComplianceDocument} className="grid gap-5">
                  <SupplierProfileField label="Document name" name="name" defaultValue="Environmental Clearance" />
                  <SupplierProfileField label="Expiry or note" name="detail" defaultValue="Expires Jan 30, 2027" />
                  <label className="grid min-w-0 gap-2">
                    <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Status</span>
                  <p className="rounded-md bg-[#fff0cd] px-3 py-2 text-sm font-semibold text-[#8b5633]">New documents are marked Review until admin approves them.</p>
                  </label>
                  <label className="grid min-w-0 gap-2">
                    <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Document file</span>
                    <input name="documentFile" type="file" className="min-h-11 min-w-0 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 py-2 outline-none file:mr-3 file:rounded file:border-0 file:bg-[#115745] file:px-3 file:py-1 file:font-bold file:text-white dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100" />
                  </label>
                  <div className="flex justify-end gap-3 max-sm:flex-col">
                    <button type="button" onClick={() => setShowDocumentForm(false)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28]">Cancel</button>
                    <button type="submit" className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white">Upload Document</button>
                  </div>
                </form>
              </ProfileModal>
            )}

            {showPayoutForm && (
              <ProfileModal title="Edit Payout Preferences" onClose={() => setShowPayoutForm(false)}>
                <form onSubmit={savePayoutPreferences} className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                  <SupplierProfileField label="Bank" name="bank" defaultValue={payout.bank} />
                  <SupplierProfileField label="Account" name="account" defaultValue={payout.account} />
                  <SupplierProfileField label="Settlement schedule" name="settlement" defaultValue={payout.settlement} />
                  <label className="grid min-w-0 gap-2">
                    <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Currency</span>
                    <select name="currency" defaultValue={payout.currency} className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
                      <option>LKR</option>
                      <option>USD</option>
                    </select>
                  </label>
                  <div className="flex justify-end gap-3 sm:col-span-2 max-sm:flex-col">
                    <button type="button" onClick={() => setShowPayoutForm(false)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28]">Cancel</button>
                    <button type="submit" className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white">Save Payouts</button>
                  </div>
                </form>
              </ProfileModal>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export function ProfileModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#111816]/60 p-4">
      <section className="max-h-[92vh] w-full max-w-[760px] overflow-y-auto rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#18211f]">
        <div className="mb-5 flex min-w-0 items-start justify-between gap-4">
          <h2 className="break-words text-2xl font-extrabold text-[#115745] dark:text-emerald-200">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#202b28]" aria-label={`Close ${title}`}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function SupplierProfileStat({ icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
      <div className="flex items-center gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200">
          <Icon className="h-6 w-6" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-[#68716c] dark:text-stone-400">{label}</span>
          <strong className="break-words text-2xl leading-tight text-[#202621] dark:text-stone-100">{value}</strong>
        </span>
      </div>
    </article>
  );
}
