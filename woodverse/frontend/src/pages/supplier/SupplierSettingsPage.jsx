import { useRef, useState } from "react";
import {
  Download,
  Globe2,
  Grid3X3,
  Moon,
  Search,
  Send,
  Settings,
  Sun,
} from "lucide-react";
import { navigate } from "../../utils";
import { SupplierSidebar } from "./SupplierSidebar";
import { getStoredSupplierLanguage, notifySupplierLanguageChange, supplierText } from "./i18n.js";
import { ProfileInfoRow } from "./shared";

export function SupplierSettingsPage({ theme, onToggleTheme }) {
  const [notice, setNotice] = useState(() => supplierText(getStoredSupplierLanguage(), "Settings loaded."));
  const [preferences, setPreferences] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-supplier-settings")) || {
        language: "English",
        timezone: "Asia/Colombo",
        defaultView: "Dashboard",
        autoAssignShipments: true,
        lowStockAlerts: true,
        emailDigest: true,
        smsAlerts: false,
        twoFactor: true,
      };
    } catch {
      return {
        language: "English",
        timezone: "Asia/Colombo",
        defaultView: "Dashboard",
        autoAssignShipments: true,
        lowStockAlerts: true,
        emailDigest: true,
        smsAlerts: false,
        twoFactor: true,
      };
    }
  });
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [activeSessions, setActiveSessions] = useState(3);
  const apiKey = "wv_live_supplier_4f8c_91a2_7740";
  const maskedKey = apiKeyVisible ? apiKey : "wv_live_supplier_••••_••••_7740";
  const languageSelectRef = useRef(null);
  const t = (text) => supplierText(preferences.language, text);

  const updatePreference = (key, value) => {
    setPreferences((current) => {
      const next = { ...current, [key]: value };
      try {
        localStorage.setItem("woodverse-supplier-settings", JSON.stringify(next));
      } catch {}
      if (key === "language") {
        notifySupplierLanguageChange(value);
        setNotice(supplierText(value, `${value} language enabled.`));
      } else {
        setNotice(supplierText(next.language, "Preference updated."));
      }
      return next;
    });
  };

  const focusLanguageSelect = () => {
    languageSelectRef.current?.focus();
    setNotice(t("Language selector opened."));
  };

  const sendPasswordReset = () => {
    setPasswordResetSent(true);
    setNotice(t("Password reset link sent to operations@lumbinitimber.lk."));
  };

  const signOutOtherSessions = () => {
    setActiveSessions(1);
    setNotice(t("All other supplier sessions signed out."));
  };

  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setNotice(t("API key copied."));
    } catch {
      setNotice(t("API key copy unavailable."));
    }
  };

  const saveSettings = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const next = {
      ...preferences,
      language: formData.get("language"),
      timezone: formData.get("timezone"),
      defaultView: formData.get("defaultView"),
    };
    setPreferences(next);
    try {
      localStorage.setItem("woodverse-supplier-settings", JSON.stringify(next));
    } catch {}
    notifySupplierLanguageChange(next.language);
    setNotice(supplierText(next.language, "Supplier settings saved."));
  };

  const resetSettings = () => {
    const defaults = {
      language: "English",
      timezone: "Asia/Colombo",
      defaultView: "Dashboard",
      autoAssignShipments: true,
      lowStockAlerts: true,
      emailDigest: true,
      smsAlerts: false,
      twoFactor: true,
    };
    setPreferences(defaults);
    try {
      localStorage.setItem("woodverse-supplier-settings", JSON.stringify(defaults));
    } catch {}
    notifySupplierLanguageChange(defaults.language);
    setNotice("Settings reset to defaults.");
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(preferences, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "woodverse-supplier-settings.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice(t("Settings export downloaded."));
  };

  return (
    <main lang={preferences.language === "Sinhala" ? "si" : "en"} className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Settings" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/90 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/90 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder={t("Search settings...")} />
            </label>
            <div className="flex shrink-0 items-center gap-3">
              <button onClick={focusLanguageSelect} className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label={t("Language")}>
                <Globe2 className="h-5 w-5" />
              </button>
              <button
                onClick={onToggleTheme}
                className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]"
                aria-label={theme === "dark" ? t("Switch to light mode") : t("Switch to dark mode")}
                title={theme === "dark" ? t("Switch to light mode") : t("Switch to dark mode")}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button onClick={() => navigate("/supplier/apps")} className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label={t("Apps")}>
                <Grid3X3 className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-7 px-6 py-9 xl:px-10">
            <section className="grid grid-cols-[minmax(0,1fr)_260px] gap-6 max-lg:grid-cols-1">
              <div className="min-w-0">
                <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">{t("Settings")}</h1>
                <p className="mt-2 max-w-3xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">{t("Configure supplier portal preferences, notifications, automation, security, and connected API access.")}</p>
              </div>
              <article className="rounded-lg bg-[#2f6757] p-6 text-white shadow-soft">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/60">{t("Security Status")}</p>
                <strong className="mt-4 block text-3xl">{preferences.twoFactor ? t("Strong") : t("Basic")}</strong>
                <p className="mt-5 text-sm text-white/75">{preferences.twoFactor ? t("2FA enabled") : t("Enable 2FA recommended")}</p>
              </article>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="grid grid-cols-[minmax(0,1fr)_320px] gap-6 max-xl:grid-cols-1">
              <div className="grid gap-6">
                <form onSubmit={saveSettings} className="grid gap-5 rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">{t("Portal Preferences")}</h2>
                  <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
                    <SettingsSelect inputRef={languageSelectRef} label={t("Language")} name="language" value={preferences.language} options={["English", "Sinhala", "Tamil"]} language={preferences.language} onChange={(value) => updatePreference("language", value)} />
                    <SettingsSelect label={t("Timezone")} name="timezone" value={preferences.timezone} options={["Asia/Colombo", "UTC", "Asia/Dubai"]} language={preferences.language} onChange={(value) => updatePreference("timezone", value)} />
                    <SettingsSelect label={t("Default page")} name="defaultView" value={preferences.defaultView} options={["Dashboard", "Materials", "Shipments", "Vendors"]} language={preferences.language} onChange={(value) => updatePreference("defaultView", value)} />
                  </div>
                  <div className="flex justify-end gap-3 max-sm:flex-col">
                    <button type="button" onClick={resetSettings} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28]">{t("Reset")}</button>
                    <button type="submit" className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white">{t("Save Settings")}</button>
                  </div>
                </form>

                <section className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
                  <SettingsToggle title={t("Auto-assign shipments")} detail={t("Create shipment drafts when purchase orders are accepted.")} checked={preferences.autoAssignShipments} onChange={() => updatePreference("autoAssignShipments", !preferences.autoAssignShipments)} />
                  <SettingsToggle title={t("Low stock alerts")} detail={t("Notify operations before inventory reaches reorder threshold.")} checked={preferences.lowStockAlerts} onChange={() => updatePreference("lowStockAlerts", !preferences.lowStockAlerts)} />
                  <SettingsToggle title={t("Email digest")} detail={t("Send a daily summary for orders, materials, payouts, and compliance.")} checked={preferences.emailDigest} onChange={() => updatePreference("emailDigest", !preferences.emailDigest)} />
                  <SettingsToggle title={t("Shipment SMS alerts")} detail={t("Send SMS when shipments are delayed or rerouted.")} checked={preferences.smsAlerts} onChange={() => updatePreference("smsAlerts", !preferences.smsAlerts)} />
                </section>
              </div>

              <aside className="grid h-fit gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="text-xl font-extrabold text-[#115745] dark:text-emerald-200">{t("Security")}</h2>
                  <div className="mt-5 grid gap-3">
                    <SettingsToggle title={t("Two-factor auth")} detail={t("Require verification for payout and profile changes.")} checked={preferences.twoFactor} onChange={() => updatePreference("twoFactor", !preferences.twoFactor)} compact />
                    <ProfileInfoRow label={t("Password reset")} value={passwordResetSent ? t("Sent") : t("Not sent")} />
                    <ProfileInfoRow label={t("Active sessions")} value={String(activeSessions)} />
                    <button onClick={sendPasswordReset} className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 font-bold text-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-emerald-200">{t("Send Password Reset")}</button>
                    <button onClick={signOutOtherSessions} className="min-h-11 rounded-md bg-[#8b5633] px-4 font-bold text-white">{t("Sign Out Other Sessions")}</button>
                  </div>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-[#e9e5dc] p-6 shadow-sm dark:border-white/10 dark:bg-[#202b28]">
                  <h2 className="text-xl font-extrabold text-[#202621] dark:text-stone-100">{t("API Access")}</h2>
                  <div className="mt-5 grid gap-3 text-sm">
                    <ProfileInfoRow label={t("Socket URL")} value={typeof window !== "undefined" ? window.location.origin : "/"} />
                    <ProfileInfoRow label={t("API key")} value={maskedKey} />
                  </div>
                  <div className="mt-5 grid gap-3">
                    <button onClick={() => setApiKeyVisible((visible) => !visible)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-4 font-bold text-[#115745] dark:border-white/10 dark:bg-[#18211f] dark:text-emerald-200">{apiKeyVisible ? t("Hide API Key") : t("Show API Key")}</button>
                    <button onClick={copyApiKey} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-4 font-bold text-[#115745] dark:border-white/10 dark:bg-[#18211f] dark:text-emerald-200">{t("Copy API Key")}</button>
                    <button onClick={exportSettings} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#115745] px-4 font-bold text-white">
                      <Download className="h-4 w-4" />
                      {t("Export Settings")}
                    </button>
                  </div>
                </article>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

export function SettingsSelect({ label, name, value, options, language, onChange, inputRef }) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">{label}</span>
      <select ref={inputRef} name={name} value={value} onChange={(event) => onChange?.(event.target.value)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
        {options.map((option) => (
          <option key={option} value={option}>{supplierText(language, option)}</option>
        ))}
      </select>
    </label>
  );
}

export function SettingsToggle({ title, detail, checked, onChange, compact = false }) {
  return (
    <article className={`rounded-lg border border-[#cbd2cd] bg-white shadow-sm dark:border-white/10 dark:bg-[#18211f] ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="min-w-0">
          <strong className="block break-words text-[#202621] dark:text-stone-100">{title}</strong>
          <span className="mt-1 block break-words text-sm leading-relaxed text-[#68716c] dark:text-stone-400">{detail}</span>
        </span>
        <button
          type="button"
          onClick={onChange}
          aria-pressed={checked}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-[#115745]" : "bg-[#aeb8b1] dark:bg-[#39433f]"}`}
        >
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
        </button>
      </div>
    </article>
  );
}
