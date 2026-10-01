// Cross-portal helpers that were copy-pasted into each role folder.
export function publishAdminEvent(source, title, message, priority = "Normal") {
  try {
    const key = "woodverse-admin-notifications";
    const current = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([{ id: `EV-${Date.now()}`, audience: "Admin", type: source, source: `${source} Portal`, title, message, detail: message, priority, time: "Just now", createdAt: new Date().toISOString() }, ...current]));
  } catch {}
}