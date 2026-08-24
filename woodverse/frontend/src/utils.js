export function formatPrice(value) {
  return `LKR ${new Intl.NumberFormat("en-LK").format(value)}`;
}

export function sortProducts(items, sort) {
  return [...items].sort((a, b) => {
    if (sort === "newest") return new Date(b.newest) - new Date(a.newest);
    if (sort === "price") return a.price - b.price;
    return a.featured - b.featured;
  });
}

export function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function getAuthToken() {
  try {
    return localStorage.getItem("woodverse-auth-token");
  } catch {
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const baseUrl = import.meta.env.VITE_API_URL || "/api";
  const token = getAuthToken();
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    let message = `API request failed: ${response.status}`;
    try {
      const data = JSON.parse(text);
      message = data.error || message;
    } catch {
      message = text || message;
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}
