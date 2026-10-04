import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Download,
  FileText,
  Globe2,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { navigate } from "../../utils";
import { VendorHeader } from "./VendorHeader";
import { SettingsPanel, SettingsToggle } from "./VendorSettingsPage";
import { VendorSidebar } from "./VendorSidebar";
import { getInitials } from "./format.js";
import { getVendorIdentity } from "./identity.js";
import { requestVendorNewOrder } from "./orders.js";
import { SettingsInput, SettingsSelect } from "./shared";

export function VendorProfilePage() {
  const identity = getVendorIdentity();
  const defaultProfile = {
    businessName: identity.businessName,
    ownerName: identity.ownerName,
    role: identity.verificationStatus === "approved" ? "Verified Vendor" : "Pending Verification",
    email: identity.email,
    phone: "+94 77 412 8890",
    location: "Moratuwa, Sri Lanka",
    workshopAddress: "42 Timber Craft Lane, Moratuwa",
    businessType: "Furniture Manufacturer",
    taxId: "VAT-LK-104882",
    publicSlug: identity.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    yearsActive: "12",
    teamSize: "24",
    specialty: "Custom teak, walnut, and mahogany furniture",
    bio: identity.description || "Verified Sri Lankan woodcraft vendor specializing in bespoke home and office furniture.",
    publicProfile: true,
    acceptCustomOrders: true,
    showPhone: true,
    showEmail: true,
    verificationStatus: "Verified",
    payoutStatus: "Active",
  };
  const [profile, setProfile] = useState(() => {
    try {
      return { ...defaultProfile, ...JSON.parse(localStorage.getItem("woodverse-vendor-profile") || "{}") };
    } catch {
      return defaultProfile;
    }
  });
  const [notice, setNotice] = useState("Vendor profile loaded.");
  const [profileActions, setProfileActions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-vendor-profile-actions") || "[]");
    } catch {
      return [];
    }
  });
  const [verificationDocuments, setVerificationDocuments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-vendor-verification-documents") || "null") || [
        { id: "businessRegistration", name: "Business Registration Certificate", status: "Required", fileName: "" },
        { id: "identityDocument", name: "Owner / Director Identity Document", status: "Required", fileName: "" },
        { id: "addressProof", name: "Business Address Proof", status: "Required", fileName: "" },
        { id: "bankProof", name: "Bank Account Confirmation", status: "Required", fileName: "" },
      ];
    } catch {
      return [];
    }
  });

  const updateProfile = (field, value) => setProfile((current) => ({ ...current, [field]: value }));

  const recordProfileAction = (message) => {
    const action = {
      id: `VPA-${Date.now()}`,
      message,
      time: new Date().toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" }),
    };
    setProfileActions((items) => {
      const next = [action, ...items].slice(0, 5);
      try {
        localStorage.setItem("woodverse-vendor-profile-actions", JSON.stringify(next));
      } catch {}
      return next;
    });
    setNotice(message);
  };

  const saveProfile = (event) => {
    event.preventDefault();
    try {
      localStorage.setItem("woodverse-vendor-profile", JSON.stringify(profile));
      localStorage.setItem("woodverse-vendor-settings", JSON.stringify({
        businessName: profile.businessName,
        contactName: profile.ownerName,
        email: profile.email,
        phone: profile.phone,
      }));
    } catch {}
    recordProfileAction("Vendor profile saved.");
  };

  const resetProfile = () => {
    setProfile(defaultProfile);
    try {
      localStorage.setItem("woodverse-vendor-profile", JSON.stringify(defaultProfile));
    } catch {}
    recordProfileAction("Vendor profile reset to default business details.");
  };

  const exportProfile = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), profile }, null, 2);
    try {
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "woodverse-vendor-profile.json";
      link.click();
      URL.revokeObjectURL(url);
      recordProfileAction("Vendor profile export downloaded.");
    } catch {
      setNotice(payload);
    }
  };

  const copyPublicLink = async () => {
    const link = `${window.location.origin}/seller?vendor=${profile.publicSlug}`;
    try {
      await navigator.clipboard.writeText(link);
      recordProfileAction("Public vendor profile link copied.");
    } catch {
      setNotice(link);
    }
  };

  const requestVerification = () => {
    if (verificationDocuments.some((document) => !document.fileName)) {
      recordProfileAction("Upload all required verification documents before requesting approval.");
      return;
    }
    const request = {
      id: `VVR-${Date.now()}`,
      businessName: profile.businessName,
      ownerName: profile.ownerName,
      requestedAt: new Date().toISOString(),
      status: "Submitted",
      documents: verificationDocuments,
    };
    try {
      const existing = JSON.parse(localStorage.getItem("woodverse-vendor-verification-requests") || "[]");
      localStorage.setItem("woodverse-vendor-verification-requests", JSON.stringify([request, ...existing]));
      const applications = JSON.parse(localStorage.getItem("woodverse-registration-applications") || "[]");
      localStorage.setItem("woodverse-registration-applications", JSON.stringify([{
        id: request.id,
        type: "Vendor",
        name: profile.businessName,
        email: profile.email,
        status: "Pending",
        submittedAt: request.requestedAt,
        documents: verificationDocuments,
      }, ...applications]));
    } catch {}
    updateProfile("verificationStatus", "Review Requested");
    recordProfileAction(`Verification request ${request.id} submitted to admin.`);
  };

  const uploadVerificationDocument = (documentId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setVerificationDocuments((items) => {
      const next = items.map((document) => document.id === documentId ? { ...document, fileName: file.name, status: "Submitted" } : document);
      try { localStorage.setItem("woodverse-vendor-verification-documents", JSON.stringify(next)); } catch {}
      return next;
    });
    setProfile((current) => ({ ...current, verificationStatus: "Review Requested" }));
    setNotice(`${file.name} uploaded for admin verification.`);
  };

  const toggleProfileSetting = (field, label) => {
    const nextValue = !profile[field];
    updateProfile(field, nextValue);
    recordProfileAction(`${label} ${nextValue ? "enabled" : "disabled"}.`);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] pb-24 text-[#303833] lg:pb-0">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Profile" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Profile notifications are available from the Dashboard page.")} unreadCount={0} status="Profile" />

          <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#202621]">Vendor Profile</h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#66716b]">
                  Manage the business identity shown to customers, admin, suppliers, and internal vendor tools.
                </p>
              </div>
              <button onClick={() => navigate("/vendor/settings")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#c4cbc7] bg-white px-3 text-sm font-extrabold text-[#3d4541]">
                <Settings className="h-4 w-4" />
                Open Settings
              </button>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">
              {notice}
            </div>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <form onSubmit={saveProfile} className="grid gap-6">
                <SettingsPanel icon={UserCog} title="Public Business Profile" detail="Details customers see when they review the vendor.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SettingsInput label="Business Name" value={profile.businessName} onChange={(value) => updateProfile("businessName", value)} />
                    <SettingsInput label="Owner Name" value={profile.ownerName} onChange={(value) => updateProfile("ownerName", value)} />
                    <SettingsInput label="Role" value={profile.role} onChange={(value) => updateProfile("role", value)} />
                    <SettingsSelect label="Business Type" value={profile.businessType} options={["Furniture Manufacturer", "Wooden Gifts Seller", "Timber Vendor", "Interior Workshop"]} onChange={(value) => updateProfile("businessType", value)} />
                    <SettingsInput label="Public Slug" value={profile.publicSlug} onChange={(value) => updateProfile("publicSlug", value.toLowerCase().replace(/\s+/g, "-"))} />
                    <SettingsInput label="Specialty" value={profile.specialty} onChange={(value) => updateProfile("specialty", value)} />
                  </div>
                  <label className="mt-4 grid gap-2 text-sm font-bold text-[#3d4541]">
                    Business Bio
                    <textarea value={profile.bio} onChange={(event) => updateProfile("bio", event.target.value)} rows={4} className="rounded-lg border border-[#c4cbc7] bg-white px-3 py-2 font-semibold outline-none transition focus:border-[#115745]" />
                  </label>
                </SettingsPanel>

                <SettingsPanel icon={Building2} title="Contact And Workshop" detail="Operational contacts for delivery, production, and admin verification.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SettingsInput label="Email" type="email" value={profile.email} onChange={(value) => updateProfile("email", value)} />
                    <SettingsInput label="Phone" value={profile.phone} onChange={(value) => updateProfile("phone", value)} />
                    <SettingsInput label="Location" value={profile.location} onChange={(value) => updateProfile("location", value)} />
                    <SettingsInput label="Workshop Address" value={profile.workshopAddress} onChange={(value) => updateProfile("workshopAddress", value)} />
                    <SettingsInput label="Tax / VAT ID" value={profile.taxId} onChange={(value) => updateProfile("taxId", value)} />
                    <SettingsInput label="Years Active" type="number" value={profile.yearsActive} onChange={(value) => updateProfile("yearsActive", value)} />
                    <SettingsInput label="Team Size" type="number" value={profile.teamSize} onChange={(value) => updateProfile("teamSize", value)} />
                  </div>
                </SettingsPanel>

                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#115745] px-3 text-sm font-extrabold text-white">
                    <Save className="h-4 w-4" />
                    Save Profile
                  </button>
                  <button type="button" onClick={exportProfile} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#c4cbc7] bg-white px-3 text-sm font-extrabold text-[#3d4541]">
                    <Download className="h-4 w-4" />
                    Export Profile
                  </button>
                  <button type="button" onClick={resetProfile} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#e9e4dc] px-3 text-sm font-extrabold text-[#3d4541]">
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>
              </form>

              <aside className="grid content-start gap-6">
                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
                  <div className="grid justify-items-center text-center">
                    <span className="grid h-20 w-20 place-items-center rounded-full border-4 border-[#115745] bg-[#d8c0a4] text-2xl font-extrabold text-[#115745]">
                      {getInitials(profile.ownerName)}
                    </span>
                    <h2 className="mt-4 text-xl font-extrabold text-[#202621]">{profile.businessName}</h2>
                    <p className="text-sm font-semibold text-[#66716b]">{profile.role}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[#66716b]">{profile.location}</p>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                    <div className="rounded-lg bg-[#f8f4ec] p-3">
                      <strong className="block text-xl text-[#202621]">{profile.yearsActive}</strong>
                      <span className="text-xs font-extrabold uppercase text-[#66716b]">Years</span>
                    </div>
                    <div className="rounded-lg bg-[#f8f4ec] p-3">
                      <strong className="block text-xl text-[#202621]">{profile.teamSize}</strong>
                      <span className="text-xs font-extrabold uppercase text-[#66716b]">Team</span>
                    </div>
                  </div>
                </section>

                <SettingsPanel icon={ShieldCheck} title="Profile Controls" detail="Manage visibility and admin verification.">
                  <div className="grid gap-3">
                    <SettingsToggle title="Public profile" detail="Show vendor profile to marketplace customers." checked={profile.publicProfile} onChange={() => toggleProfileSetting("publicProfile", "Public profile")} compact />
                    <SettingsToggle title="Accept custom orders" detail="Allow customers to request bespoke furniture." checked={profile.acceptCustomOrders} onChange={() => toggleProfileSetting("acceptCustomOrders", "Custom orders")} compact />
                    <SettingsToggle title="Show phone number" detail="Display phone on customer-facing profile." checked={profile.showPhone} onChange={() => toggleProfileSetting("showPhone", "Phone visibility")} compact />
                    <SettingsToggle title="Show email" detail="Display email on customer-facing profile." checked={profile.showEmail} onChange={() => toggleProfileSetting("showEmail", "Email visibility")} compact />
                    <button type="button" onClick={requestVerification} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#115745] px-3 text-sm font-extrabold text-white">
                      <CheckCircle2 className="h-4 w-4" />
                      Request Verification
                    </button>
                    <button type="button" onClick={copyPublicLink} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#c4cbc7] bg-white px-3 text-sm font-extrabold text-[#3d4541]">
                      <Globe2 className="h-4 w-4" />
                      Copy Public Link
                    </button>
                  </div>
                </SettingsPanel>

                <SettingsPanel icon={FileText} title="Verification Documents" detail="Upload every document before requesting vendor approval.">
                  <div className="grid gap-3">
                    {verificationDocuments.map((document) => (
                      <label key={document.id} className="grid gap-2 rounded-lg border border-[#d8ddd9] bg-[#f8f4ec] p-3">
                        <span className="flex items-center justify-between gap-3 text-sm font-extrabold text-[#202621]">
                          <span>{document.name}</span>
                          <span className={`rounded-full px-2 py-1 text-[10px] uppercase ${document.fileName ? "bg-[#d9ecd8] text-[#115745]" : "bg-[#fff0cd] text-[#8b5633]"}`}>{document.fileName ? "Submitted" : "Required"}</span>
                        </span>
                        <input type="file" required={!document.fileName} accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => uploadVerificationDocument(document.id, event)} className="min-w-0 rounded-md border border-[#c4cbc7] bg-white p-2 text-xs font-semibold" />
                        {document.fileName && <span className="text-xs font-semibold text-[#66716b]">{document.fileName}</span>}
                      </label>
                    ))}
                  </div>
                </SettingsPanel>

                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
                  <h3 className="text-base font-extrabold text-[#202621]">Account Status</h3>
                  <div className="mt-4 grid gap-3">
                    <ProfileStatus label="Verification" value={profile.verificationStatus} />
                    <ProfileStatus label="Payouts" value={profile.payoutStatus} />
                    <ProfileStatus label="Marketplace" value={profile.publicProfile ? "Visible" : "Hidden"} />
                  </div>
                </section>

                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
                  <h3 className="text-base font-extrabold text-[#202621]">Recent Profile Actions</h3>
                  <div className="mt-4 grid gap-2">
                    {profileActions.length === 0 ? (
                      <p className="rounded-lg bg-[#f8f4ec] px-3 py-2 text-sm font-semibold text-[#66716b]">No profile actions yet.</p>
                    ) : (
                      profileActions.map((action) => (
                        <div key={action.id} className="rounded-lg bg-[#f8f4ec] px-3 py-2">
                          <strong className="block text-sm text-[#202621]">{action.message}</strong>
                          <span className="text-xs font-bold uppercase text-[#68716c]">{action.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

export function ProfileStatus({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-[#f8f4ec] px-3 py-2">
      <span className="text-sm font-bold text-[#66716b]">{label}</span>
      <strong className="rounded-full bg-[#d9ecd8] px-2.5 py-1 text-xs font-extrabold uppercase text-[#115745]">{value}</strong>
    </div>
  );
}
