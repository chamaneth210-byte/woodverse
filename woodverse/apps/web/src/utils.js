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

export async function apiRequest(path, options = {}) {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers || {}) },
  });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json();
}
