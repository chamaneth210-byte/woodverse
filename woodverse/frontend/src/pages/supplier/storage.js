

export function getStoredSupplierNotifications() {
  try {
    return JSON.parse(localStorage.getItem("woodverse-supplier-notifications") || "null") || [];
  } catch {
    return [];
  }
}

export function getStoredSupplierIncomingRequests() {
  try {
    return JSON.parse(localStorage.getItem("woodverse-supplier-incoming-requests") || "null") || [];
  } catch {
    return [];
  }
}
