import {
  CheckCircle2,
  Download,
  RefreshCw,
  Send,
  Settings,
} from "lucide-react";
import { getDirectoryInitials } from "./AdminDirectoryPage";
import { AdminSettingInput, AdminSettingSelect, AdminSettingToggle, SettingsSection } from "./AdminSystemSettingsPage";

export function AdminProfilePage({ profile, auditLog, onChange, onToggle, onSave, onReset, onExport, onPasswordReset }) {
  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-[#104d3f]">Admin Profile</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#66716b]">
            Manage administrator identity, access level, security alerts, and platform notification preferences.
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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={onSave} className="grid gap-6">
          <SettingsSection title="Profile Details" detail="Admin identity shown in audit logs, support tickets, and operational actions.">
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminSettingInput label="Full Name" value={profile.name} onChange={(value) => onChange("name", value)} />
              <AdminSettingInput label="Role" value={profile.role} onChange={(value) => onChange("role", value)} />
              <AdminSettingInput label="Email" type="email" value={profile.email} onChange={(value) => onChange("email", value)} />
              <AdminSettingInput label="Phone" value={profile.phone} onChange={(value) => onChange("phone", value)} />
              <AdminSettingInput label="Department" value={profile.department} onChange={(value) => onChange("department", value)} />
              <AdminSettingInput label="Location" value={profile.location} onChange={(value) => onChange("location", value)} />
              <AdminSettingSelect label="Access Level" value={profile.accessLevel} options={["Super Admin", "Operations Admin", "Finance Admin", "Support Admin"]} onChange={(value) => onChange("accessLevel", value)} />
              <AdminSettingSelect label="Language" value={profile.language} options={["English", "Sinhala", "Tamil"]} onChange={(value) => onChange("language", value)} />
              <AdminSettingSelect label="Timezone" value={profile.timezone} options={["Asia/Colombo", "UTC", "Asia/Dubai"]} onChange={(value) => onChange("timezone", value)} />
            </div>
          </SettingsSection>

          <SettingsSection title="Security And Notifications" detail="Control admin login protection and operational alerts.">
            <div className="grid gap-3">
              <AdminSettingToggle title="Two-factor authentication" detail="Require second-step verification for admin login." checked={profile.twoFactor} onChange={() => onToggle("twoFactor", "Two-factor authentication")} />
              <AdminSettingToggle title="Login alerts" detail="Send alerts when admin signs in from a new device." checked={profile.loginAlerts} onChange={() => onToggle("loginAlerts", "Login alerts")} />
              <AdminSettingToggle title="Approval notifications" detail="Notify admin about vendor and supplier approvals." checked={profile.approvalNotifications} onChange={() => onToggle("approvalNotifications", "Approval notifications")} />
              <AdminSettingToggle title="Payout notifications" detail="Notify admin about payout holds, releases, and refunds." checked={profile.payoutNotifications} onChange={() => onToggle("payoutNotifications", "Payout notifications")} />
              <AdminSettingToggle title="Weekly digest" detail="Send weekly platform performance digest to admin email." checked={profile.weeklyDigest} onChange={() => onToggle("weeklyDigest", "Weekly digest")} />
            </div>
          </SettingsSection>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
              <CheckCircle2 className="h-4 w-4" />
              Save Profile
            </button>
            <button type="button" onClick={onPasswordReset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c6cdc8] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
              <Settings className="h-4 w-4" />
              Reset Password
            </button>
            <button type="button" onClick={onExport} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c6cdc8] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
              <Download className="h-4 w-4" />
              Export Profile
            </button>
          </div>
        </form>

        <aside className="grid content-start gap-6">
          <section className="rounded-xl border border-[#c6cdc8] bg-white p-5 text-center shadow-sm">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#104d3f] text-2xl font-extrabold text-white">
              {getDirectoryInitials(profile.name)}
            </span>
            <h3 className="mt-4 text-xl font-extrabold text-[#202621]">{profile.name}</h3>
            <p className="mt-1 text-sm font-semibold text-[#66716b]">{profile.role}</p>
            <div className="mt-5 grid gap-3 text-left">
              <ProfileDetail label="Access" value={profile.accessLevel} />
              <ProfileDetail label="Department" value={profile.department} />
              <ProfileDetail label="Last Login" value={profile.lastLogin} />
              <ProfileDetail label="Security" value={profile.twoFactor ? "2FA Enabled" : "2FA Off"} />
            </div>
          </section>

          <SettingsSection title="Recent Admin Audit" detail="Profile and system actions performed by admin.">
            <div className="grid gap-2">
              {auditLog.length === 0 ? (
                <p className="rounded-lg bg-[#f8f4ec] px-3 py-2 text-sm font-semibold text-[#66716b]">No audit entries yet.</p>
              ) : (
                auditLog.slice(0, 6).map((entry) => (
                  <article key={entry.id} className="rounded-lg bg-[#f8f4ec] px-3 py-2">
                    <strong className="block text-sm text-[#202621]">{entry.message}</strong>
                    <span className="text-xs font-extrabold uppercase text-[#66716b]">{entry.actor} - {entry.time}</span>
                  </article>
                ))
              )}
            </div>
          </SettingsSection>
        </aside>
      </section>
    </section>
  );
}

export function ProfileDetail({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-[#f8f4ec] px-3 py-2">
      <span className="text-sm font-bold text-[#66716b]">{label}</span>
      <strong className="text-sm text-[#202621]">{value}</strong>
    </div>
  );
}
