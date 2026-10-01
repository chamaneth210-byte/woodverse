import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Download,
  RefreshCw,
  Settings,
  Truck,
} from "lucide-react";
import { ApprovalStatusBadge, DirectoryStat } from "./AdminDirectoryPage";

export function AdminSystemSettingsPage({ settings, auditLog, onChange, onToggle, onSave, onReset, onExport, onTest }) {
  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-[#104d3f]">System Settings</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#66716b]">
            Configure platform identity, security rules, registration access, payment controls, integrations, and audit tracking.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={onExport} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c6cdc8] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button onClick={onReset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#e9e4dc] px-4 text-sm font-extrabold text-[#3d4541]">
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <DirectoryStat icon={Settings} label="Payment Gateway" value={settings.paymentGateway} />
        <DirectoryStat icon={Boxes} label="Inventory Sync" value={settings.inventorySync} />
        <DirectoryStat icon={Truck} label="Logistics API" value={settings.logisticsApi} warning={settings.logisticsApi !== "Active"} />
        <DirectoryStat icon={AlertTriangle} label="Maintenance" value={settings.maintenanceMode ? "On" : "Off"} warning={settings.maintenanceMode} />
      </section>

      <form onSubmit={onSave} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <SettingsSection title="Platform Profile" detail="Core identity and operating defaults.">
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminSettingInput label="Platform Name" value={settings.platformName} onChange={(value) => onChange("platformName", value)} />
              <AdminSettingInput label="Support Email" value={settings.supportEmail} onChange={(value) => onChange("supportEmail", value)} />
              <AdminSettingSelect label="Default Currency" value={settings.defaultCurrency} options={["LKR", "USD", "EUR"]} onChange={(value) => onChange("defaultCurrency", value)} />
              <AdminSettingSelect label="Timezone" value={settings.timezone} options={["Asia/Colombo", "UTC", "Asia/Dubai"]} onChange={(value) => onChange("timezone", value)} />
              <AdminSettingInput label="Refund Review Threshold" type="number" value={settings.refundReviewThreshold} onChange={(value) => onChange("refundReviewThreshold", value)} />
              <AdminSettingInput label="Session Timeout Minutes" type="number" value={settings.sessionTimeout} onChange={(value) => onChange("sessionTimeout", value)} />
            </div>
          </SettingsSection>

          <SettingsSection title="Access And Verification" detail="Control who can enter the platform and what must be reviewed.">
            <div className="grid gap-3">
              <AdminSettingToggle title="Maintenance mode" detail="Temporarily block marketplace operations for maintenance." checked={settings.maintenanceMode} onChange={() => onToggle("maintenanceMode", "Maintenance mode")} />
              <AdminSettingToggle title="Customer registration" detail="Allow new customers to create accounts." checked={settings.customerRegistration} onChange={() => onToggle("customerRegistration", "Customer registration")} />
              <AdminSettingToggle title="Vendor registration" detail="Allow new vendors to apply for marketplace access." checked={settings.vendorRegistration} onChange={() => onToggle("vendorRegistration", "Vendor registration")} />
              <AdminSettingToggle title="Supplier registration" detail="Allow new suppliers to apply for procurement access." checked={settings.supplierRegistration} onChange={() => onToggle("supplierRegistration", "Supplier registration")} />
              <AdminSettingToggle title="Auto approve products" detail="Publish submitted products without manual admin review." checked={settings.autoApproveProducts} onChange={() => onToggle("autoApproveProducts", "Auto approve products")} />
              <AdminSettingToggle title="Require vendor verification" detail="Vendors must be verified before full access." checked={settings.requireVendorVerification} onChange={() => onToggle("requireVendorVerification", "Vendor verification")} />
              <AdminSettingToggle title="Require supplier verification" detail="Suppliers must be verified before full access." checked={settings.requireSupplierVerification} onChange={() => onToggle("requireSupplierVerification", "Supplier verification")} />
            </div>
          </SettingsSection>
        </div>

        <aside className="grid content-start gap-6">
          <SettingsSection title="Integrations" detail="Test connected operational services.">
            <div className="grid gap-3">
              <IntegrationRow label="Payment Gateway" value={settings.paymentGateway} onTest={() => onTest("paymentGateway", "Payment Gateway")} />
              <IntegrationRow label="Inventory Sync" value={settings.inventorySync} onTest={() => onTest("inventorySync", "Inventory Sync")} />
              <IntegrationRow label="Logistics API" value={settings.logisticsApi} onTest={() => onTest("logisticsApi", "Logistics API")} />
            </div>
          </SettingsSection>

          <div className="grid gap-3 rounded-xl border border-[#c6cdc8] bg-white p-5 shadow-sm">
            <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
              <CheckCircle2 className="h-4 w-4" />
              Save Settings
            </button>
            <button type="button" onClick={onExport} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c6cdc8] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
              <Download className="h-4 w-4" />
              Export Settings
            </button>
            <button type="button" onClick={onReset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#e9e4dc] px-4 text-sm font-extrabold text-[#3d4541]">
              <RefreshCw className="h-4 w-4" />
              Reset Defaults
            </button>
          </div>

          <SettingsSection title="Audit Log" detail="Recent system setting changes.">
            <div className="grid gap-2">
              {auditLog.length === 0 ? (
                <p className="rounded-lg bg-[#f8f4ec] px-3 py-2 text-sm font-semibold text-[#66716b]">No system audit entries yet.</p>
              ) : (
                auditLog.map((entry) => (
                  <article key={entry.id} className="rounded-lg bg-[#f8f4ec] px-3 py-2">
                    <strong className="block text-sm text-[#202621]">{entry.message}</strong>
                    <span className="text-xs font-extrabold uppercase text-[#66716b]">{entry.actor} - {entry.time}</span>
                  </article>
                ))
              )}
            </div>
          </SettingsSection>
        </aside>
      </form>
    </section>
  );
}

export function SettingsSection({ title, detail, children }) {
  return (
    <section className="rounded-xl border border-[#c6cdc8] bg-white p-5 shadow-sm">
      <h3 className="text-lg font-extrabold text-[#104d3f]">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-[#66716b]">{detail}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function AdminSettingInput({ label, value, onChange, type = "text" }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 font-semibold outline-none focus:border-[#104d3f]" />
    </label>
  );
}

export function AdminSettingSelect({ label, value, options, onChange }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 font-semibold outline-none focus:border-[#104d3f]">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

export function AdminSettingToggle({ title, detail, checked, onChange }) {
  return (
    <button type="button" onClick={onChange} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] p-4 text-left transition hover:border-[#104d3f]">
      <span>
        <strong className="block text-sm text-[#202621]">{title}</strong>
        <span className="mt-1 block text-sm leading-relaxed text-[#66716b]">{detail}</span>
      </span>
      <span className={`h-6 w-11 rounded-full p-1 transition ${checked ? "bg-[#104d3f]" : "bg-[#c6cdc8]"}`}>
        <span className={`block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

export function IntegrationRow({ label, value, onTest }) {
  return (
    <div className="grid gap-3 rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] p-4">
      <div className="flex items-center justify-between gap-3">
        <strong className="text-sm text-[#202621]">{label}</strong>
        <ApprovalStatusBadge status={value} />
      </div>
      <button type="button" onClick={onTest} className="min-h-10 rounded-lg bg-[#104d3f] px-3 text-sm font-extrabold text-white">
        Test Connection
      </button>
    </div>
  );
}
