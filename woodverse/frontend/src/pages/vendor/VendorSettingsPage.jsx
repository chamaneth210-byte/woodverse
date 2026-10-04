import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Download,
  Globe2,
  KeyRound,
  Languages,
  Lock,
  RotateCcw,
  Save,
  Send,
  Settings,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { VendorHeader } from "./VendorHeader";
import { VendorSidebar } from "./VendorSidebar";
import { getVendorIdentity } from "./identity.js";
import { requestVendorNewOrder } from "./orders.js";
import { SettingsInput, SettingsSelect } from "./shared";

export function VendorSettingsPage() {
  const identity = getVendorIdentity();
  const defaultSettings = {
    businessName: identity.businessName,
    contactName: identity.ownerName,
    email: identity.email,
    phone: "+94 77 412 8890",
    language: "English",
    timezone: "Asia/Colombo",
    currency: "LKR",
    defaultView: "Dashboard",
    customerNotifications: true,
    supplierNotifications: true,
    productionAlerts: true,
    emailDigest: true,
    smsAlerts: false,
    twoFactor: true,
    loginAlerts: true,
    autoPurchaseRequests: true,
    lowMaterialThreshold: "10",
  };
  const [settings, setSettings] = useState(() => {
    try {
      return { ...defaultSettings, ...JSON.parse(localStorage.getItem("woodverse-vendor-settings") || "{}") };
    } catch {
      return defaultSettings;
    }
  });
  const [notice, setNotice] = useState("Vendor settings loaded.");
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Connected");
  const [settingsActions, setSettingsActions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-vendor-settings-actions") || "[]");
    } catch {
      return [];
    }
  });

  const updateSetting = (field, value) => setSettings((current) => ({ ...current, [field]: value }));

  const recordSettingsAction = (message) => {
    const action = {
      id: `VSA-${Date.now()}`,
      message,
      time: new Date().toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" }),
    };
    setSettingsActions((current) => {
      const next = [action, ...current].slice(0, 5);
      try {
        localStorage.setItem("woodverse-vendor-settings-actions", JSON.stringify(next));
      } catch {}
      return next;
    });
    setNotice(message);
  };

  const toggleSetting = (field, label) => {
    const nextValue = !settings[field];
    updateSetting(field, nextValue);
    recordSettingsAction(`${label} ${nextValue ? "enabled" : "disabled"}.`);
  };

  const saveSettings = (event) => {
    event.preventDefault();
    try {
      localStorage.setItem("woodverse-vendor-settings", JSON.stringify(settings));
    } catch {}
    recordSettingsAction("Vendor settings saved.");
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    try {
      localStorage.setItem("woodverse-vendor-settings", JSON.stringify(defaultSettings));
    } catch {}
    recordSettingsAction("Vendor settings reset to defaults.");
  };

  const exportSettings = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), settings }, null, 2);
    try {
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "woodverse-vendor-settings.json";
      link.click();
      URL.revokeObjectURL(url);
      recordSettingsAction("Vendor settings export downloaded.");
    } catch {
      setNotice(payload);
    }
  };

  const copyApiKey = async () => {
    const apiKey = "wv_vendor_live_9x42_hidden_demo_key";
    try {
      await navigator.clipboard.writeText(apiKey);
      recordSettingsAction("Vendor API key copied.");
    } catch {
      setNotice(apiKey);
    }
  };

  const toggleApiKeyVisibility = () => {
    setApiKeyVisible((visible) => {
      const next = !visible;
      recordSettingsAction(next ? "Vendor API key shown." : "Vendor API key hidden.");
      return next;
    });
  };

  const requestPasswordReset = () => {
    const resetRequest = {
      id: `VPR-${Date.now()}`,
      email: settings.email,
      requestedAt: new Date().toISOString(),
      status: "Sent",
    };
    try {
      const existing = JSON.parse(localStorage.getItem("woodverse-vendor-password-resets") || "[]");
      localStorage.setItem("woodverse-vendor-password-resets", JSON.stringify([resetRequest, ...existing]));
    } catch {}
    recordSettingsAction(`Password reset email sent to ${settings.email}.`);
  };

  const reconnectIntegrations = () => {
    setSyncStatus("Reconnecting");
    recordSettingsAction("Testing supplier, customer, and notification integrations.");
    window.setTimeout(() => {
      setSyncStatus("Connected");
      recordSettingsAction("Supplier, customer, and notification integrations reconnected.");
    }, 600);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] pb-24 text-[#303833] lg:pb-0">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Settings" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Notifications are available from the Dashboard page.")} unreadCount={0} status={syncStatus} />

          <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-3">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
              <h1 className="text-3xl font-semibold leading-tight text-[#202621]">Settings</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-[#66716b]">
                Manage business profile, portal preferences, notification routing, security, and supplier/customer integrations.
              </p>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">
              {notice}
            </div>

            <form onSubmit={saveSettings} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="grid gap-6">
                <SettingsPanel icon={UserCog} title="Business Profile" detail="Visible identity for customers, suppliers, and administrators.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SettingsInput label="Business Name" value={settings.businessName} onChange={(value) => updateSetting("businessName", value)} />
                    <SettingsInput label="Contact Name" value={settings.contactName} onChange={(value) => updateSetting("contactName", value)} />
                    <SettingsInput label="Email" type="email" value={settings.email} onChange={(value) => updateSetting("email", value)} />
                    <SettingsInput label="Phone" value={settings.phone} onChange={(value) => updateSetting("phone", value)} />
                  </div>
                </SettingsPanel>

                <SettingsPanel icon={Globe2} title="Portal Preferences" detail="Control how the vendor dashboard behaves for daily work.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SettingsSelect label="Language" value={settings.language} options={["English", "Sinhala", "Tamil"]} onChange={(value) => updateSetting("language", value)} icon={Languages} />
                    <SettingsSelect label="Timezone" value={settings.timezone} options={["Asia/Colombo", "UTC", "Asia/Dubai"]} onChange={(value) => updateSetting("timezone", value)} />
                    <SettingsSelect label="Currency" value={settings.currency} options={["LKR", "USD", "EUR"]} onChange={(value) => updateSetting("currency", value)} />
                    <SettingsSelect label="Default Page" value={settings.defaultView} options={["Dashboard", "Customer Orders", "Production Tracking", "Inventory"]} onChange={(value) => updateSetting("defaultView", value)} />
                  </div>
                </SettingsPanel>

                <SettingsPanel icon={Bell} title="Notifications" detail="Connect vendor updates with supplier and customer activity.">
                  <div className="grid gap-3">
                    <SettingsToggle title="Customer notifications" detail="Receive customer order, payment, and delivery messages." checked={settings.customerNotifications} onChange={() => toggleSetting("customerNotifications", "Customer notifications")} />
                    <SettingsToggle title="Supplier notifications" detail="Receive supplier stock confirmations and purchase order updates." checked={settings.supplierNotifications} onChange={() => toggleSetting("supplierNotifications", "Supplier notifications")} />
                    <SettingsToggle title="Production alerts" detail="Notify the team when work orders move between stages." checked={settings.productionAlerts} onChange={() => toggleSetting("productionAlerts", "Production alerts")} />
                    <SettingsToggle title="Email digest" detail="Send daily vendor summaries to the business email." checked={settings.emailDigest} onChange={() => toggleSetting("emailDigest", "Email digest")} />
                    <SettingsToggle title="SMS alerts" detail="Send urgent order and shipment updates by SMS." checked={settings.smsAlerts} onChange={() => toggleSetting("smsAlerts", "SMS alerts")} />
                  </div>
                </SettingsPanel>
              </section>

              <aside className="grid content-start gap-6">
                <SettingsPanel icon={ShieldCheck} title="Security" detail="Protect vendor profile, payouts, and integrations.">
                  <div className="grid gap-3">
                    <SettingsToggle title="Two-factor auth" detail="Require verification for account and payout changes." checked={settings.twoFactor} onChange={() => toggleSetting("twoFactor", "Two-factor auth")} compact />
                    <SettingsToggle title="Login alerts" detail="Notify the owner about new device logins." checked={settings.loginAlerts} onChange={() => toggleSetting("loginAlerts", "Login alerts")} compact />
                    <button type="button" onClick={requestPasswordReset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
                      <Lock className="h-4 w-4" />
                      Reset Password
                    </button>
                  </div>
                </SettingsPanel>

                <SettingsPanel icon={KeyRound} title="Integrations" detail="Supplier, customer, and notification service access.">
                  <div className="grid gap-4">
                    <div className="rounded-lg bg-[#f8f4ec] px-4 py-3">
                      <span className="text-xs font-extrabold uppercase text-[#66716b]">Socket.IO Status</span>
                      <strong className="mt-1 block text-[#115745]">{syncStatus}</strong>
                    </div>
                    <SettingsToggle title="Auto purchase requests" detail="Create supplier requests when materials run low." checked={settings.autoPurchaseRequests} onChange={() => toggleSetting("autoPurchaseRequests", "Auto purchase requests")} compact />
                    <SettingsInput label="Low Material Threshold (%)" type="number" value={settings.lowMaterialThreshold} onChange={(value) => updateSetting("lowMaterialThreshold", value)} />
                    <div className="rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] p-4">
                      <span className="text-xs font-extrabold uppercase text-[#66716b]">Vendor API Key</span>
                      <code className="mt-2 block break-all rounded bg-white px-3 py-2 text-xs font-bold text-[#3d4541]">
                        {apiKeyVisible ? "wv_vendor_live_9x42_hidden_demo_key" : "wv_vendor_live_••••••••••••••••"}
                      </code>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={toggleApiKeyVisibility} className="rounded-lg bg-[#e9e4dc] px-3 py-2 text-xs font-extrabold text-[#3d4541]">{apiKeyVisible ? "Hide" : "Show"}</button>
                        <button type="button" onClick={copyApiKey} className="rounded-lg bg-[#e9e4dc] px-3 py-2 text-xs font-extrabold text-[#3d4541]">Copy</button>
                      </div>
                    </div>
                    <button type="button" onClick={reconnectIntegrations} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
                      <CheckCircle2 className="h-4 w-4" />
                      Test Connection
                    </button>
                  </div>
                </SettingsPanel>

                <div className="grid gap-3 rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
                  <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
                    <Save className="h-4 w-4" />
                    Save Settings
                  </button>
                  <button type="button" onClick={exportSettings} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
                    <Download className="h-4 w-4" />
                    Export Settings
                  </button>
                  <button type="button" onClick={resetSettings} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#e9e4dc] px-4 text-sm font-extrabold text-[#3d4541]">
                    <RotateCcw className="h-4 w-4" />
                    Reset Defaults
                  </button>
                </div>

                <div className="grid gap-3 rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#eef4ef] text-[#115745]">
                      <Clock3 className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold text-[#202621]">Recent Setting Actions</h3>
                      <p className="text-sm leading-relaxed text-[#66716b]">Button clicks and setting changes are recorded here for vendor follow-up.</p>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    {settingsActions.length === 0 ? (
                      <p className="rounded-lg bg-[#f8f4ec] px-3 py-2 text-sm font-semibold text-[#66716b]">No setting actions yet.</p>
                    ) : (
                      settingsActions.map((action) => (
                        <div key={action.id} className="rounded-lg bg-[#f8f4ec] px-3 py-2">
                          <strong className="block text-sm text-[#202621]">{action.message}</strong>
                          <span className="text-xs font-bold uppercase text-[#68716c]">{action.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </aside>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export function SettingsPanel({ icon: Icon, title, detail, children }) {
  return (
    <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 grid grid-cols-[40px_minmax(0,1fr)] gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#eef4ef] text-[#115745]">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-[#202621]">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#66716b]">{detail}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function SettingsToggle({ title, detail, checked, onChange, compact = false }) {
  return (
    <button type="button" onClick={onChange} className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] text-left transition hover:border-[#115745] ${compact ? "p-3" : "p-4"}`}>
      <span>
        <strong className="block text-sm text-[#202621]">{title}</strong>
        <span className="mt-1 block text-sm leading-relaxed text-[#66716b]">{detail}</span>
      </span>
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-[#115745]" : "bg-[#c9c3b8]"}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}
