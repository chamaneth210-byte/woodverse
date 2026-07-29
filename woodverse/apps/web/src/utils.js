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
