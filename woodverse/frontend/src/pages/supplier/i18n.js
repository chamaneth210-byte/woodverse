import { useEffect, useState } from "react";
import {
  Search,
  Send,
  Settings,
} from "lucide-react";

export const SUPPLIER_TRANSLATIONS = {
  Sinhala: {
    "Supplier Portal": "සැපයුම්කරු ද්වාරය",
    Dashboard: "පාලන පුවරුව",
    "Purchase Orders": "මිලදී ගැනීම් ඇණවුම්",
    Materials: "ද්‍රව්‍ය",
    Shipments: "නැව්ගත කිරීම්",
    Vendors: "වෙළෙන්දන්",
    Notifications: "දැනුම්දීම්",
    Profile: "පැතිකඩ",
    Support: "සහාය",
    Settings: "සැකසුම්",
    "New Shipment": "නව නැව්ගත කිරීම",
    "Search settings...": "සැකසුම් සොයන්න...",
    "Language selector opened.": "භාෂා තේරීම විවෘත කරන ලදී.",
    Apps: "යෙදුම්",
    "Switch to light mode": "ආලෝක ප්‍රකාරයට මාරු වන්න",
    "Switch to dark mode": "අඳුරු ප්‍රකාරයට මාරු වන්න",
    "Settings loaded.": "සැකසුම් පූරණය විය.",
    "Supplier settings saved.": "සැපයුම්කරු සැකසුම් සුරකින ලදී.",
    "Settings reset to defaults.": "සැකසුම් පෙරනිමියට නැවත සකසන ලදී.",
    "Settings export downloaded.": "සැකසුම් අපනයනය බාගත කරන ලදී.",
    "Preference updated.": "කැමතිකම යාවත්කාලීන කරන ලදී.",
    "API key copied.": "API යතුර පිටපත් කරන ලදී.",
    "API key copy unavailable.": "API යතුර පිටපත් කළ නොහැක.",
    "Password reset": "මුරපද නැවත සැකසීම",
    "Sent": "යවන ලදී",
    "Not sent": "යවා නැත",
    "Active sessions": "සක්‍රිය සැසි",
    "Copy API Key": "API යතුර පිටපත් කරන්න",
    "Sinhala language enabled.": "සිංහල භාෂාව සක්‍රිය කරන ලදී.",
    "English language enabled.": "ඉංග්‍රීසි භාෂාව සක්‍රිය කරන ලදී.",
    "Tamil language enabled.": "දෙමළ භාෂාව සක්‍රිය කරන ලදී.",
    "Configure supplier portal preferences, notifications, automation, security, and connected API access.": "සැපයුම්කරු ද්වාර කැමතිකම්, දැනුම්දීම්, ස්වයංක්‍රීයකරණය, ආරක්ෂාව සහ API ප්‍රවේශය සකසන්න.",
    "Security Status": "ආරක්ෂක තත්ත්වය",
    Strong: "ශක්තිමත්",
    Basic: "මූලික",
    "2FA enabled": "2FA සක්‍රියයි",
    "Enable 2FA recommended": "2FA සක්‍රිය කිරීම නිර්දේශිතයි",
    "Portal Preferences": "ද්වාර කැමතිකම්",
    Language: "භාෂාව",
    Timezone: "කාල කලාපය",
    "Default page": "පෙරනිමි පිටුව",
    English: "ඉංග්‍රීසි",
    Sinhala: "සිංහල",
    Tamil: "දෙමළ",
    "Asia/Colombo": "ආසියා/කොළඹ",
    UTC: "UTC",
    "Asia/Dubai": "ආසියා/ඩුබායි",
    Reset: "නැවත සකසන්න",
    "Save Settings": "සැකසුම් සුරකින්න",
    "Auto-assign shipments": "නැව්ගත කිරීම් ස්වයංක්‍රීයව පවරන්න",
    "Create shipment drafts when purchase orders are accepted.": "මිලදී ගැනීම් ඇණවුම් පිළිගත් විට නැව්ගත කිරීමේ කෙටුම්පත් සාදන්න.",
    "Low stock alerts": "අඩු තොග අනතුරු ඇඟවීම්",
    "Notify operations before inventory reaches reorder threshold.": "තොගය නැවත ඇණවුම් සීමාවට ළඟාවීමට පෙර මෙහෙයුම් කණ්ඩායමට දැනුම් දෙන්න.",
    "Email digest": "ඊමේල් සාරාංශය",
    "Send a daily summary for orders, materials, payouts, and compliance.": "ඇණවුම්, ද්‍රව්‍ය, ගෙවීම් සහ අනුකූලතාව සඳහා දෛනික සාරාංශයක් යවන්න.",
    "Shipment SMS alerts": "නැව්ගත කිරීමේ SMS දැනුම්දීම්",
    "Send SMS when shipments are delayed or rerouted.": "නැව්ගත කිරීම් ප්‍රමාද වූ විට හෝ මාර්ගය වෙනස් වූ විට SMS යවන්න.",
    Security: "ආරක්ෂාව",
    "Two-factor auth": "දෙපියවර සත්‍යාපනය",
    "Require verification for payout and profile changes.": "ගෙවීම් සහ පැතිකඩ වෙනස්කම් සඳහා සත්‍යාපනය අවශ්‍ය කරන්න.",
    "Send Password Reset": "මුරපද නැවත සැකසීම යවන්න",
    "Sign Out Other Sessions": "අනෙකුත් සැසිවලින් ඉවත් කරන්න",
    "Password reset link sent to operations@lumbinitimber.lk.": "මුරපද නැවත සැකසුම් සබැඳිය operations@lumbinitimber.lk වෙත යවන ලදී.",
    "All other supplier sessions signed out.": "අනෙකුත් සියලු සැපයුම්කරු සැසි ඉවත් කරන ලදී.",
    "API Access": "API ප්‍රවේශය",
    "Socket URL": "Socket URL",
    "API key": "API යතුර",
    "Hide API Key": "API යතුර සඟවන්න",
    "Show API Key": "API යතුර පෙන්වන්න",
    "Export Settings": "සැකසුම් අපනයනය කරන්න",
  },
};

export function supplierText(language, text) {
  return SUPPLIER_TRANSLATIONS[language]?.[text] || text;
}

export function getStoredSupplierLanguage() {
  try {
    return JSON.parse(localStorage.getItem("woodverse-supplier-settings"))?.language || "English";
  } catch {
    return "English";
  }
}

export function notifySupplierLanguageChange(language) {
  window.dispatchEvent(new CustomEvent("woodverse-supplier-language-change", { detail: language }));
}

export function useSupplierLanguage() {
  const [language, setLanguage] = useState(getStoredSupplierLanguage);

  useEffect(() => {
    const updateLanguage = (event) => setLanguage(event.detail || getStoredSupplierLanguage());
    const updateFromStorage = () => setLanguage(getStoredSupplierLanguage());
    window.addEventListener("woodverse-supplier-language-change", updateLanguage);
    window.addEventListener("storage", updateFromStorage);
    return () => {
      window.removeEventListener("woodverse-supplier-language-change", updateLanguage);
      window.removeEventListener("storage", updateFromStorage);
    };
  }, []);

  return language;
}
