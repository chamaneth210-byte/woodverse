import { getStoredList, saveStoredList } from "./storage";

export const wishlistStorageKey = "woodverse-wishlist";
export const restockAlertsStorageKey = "woodverse-restock-alerts";

// Saved products are stored as a small reference rather than the whole catalog entry, so
// a price change in the catalog does not leave a stale wishlist row behind.
function toProductRef(product) {
  return {
    id: product.id,
    name: product.name,
    vendor: product.vendor,
    price: product.price,
    image: product.image,
    crop: product.crop,
    generated: product.generated,
  };
}

// Adds the reference when it is missing and removes it when it is present. Returns
// whether the product is in the list after the toggle.
function toggleStoredProduct(storageKey, product) {
  const items = getStoredList(storageKey);
  const exists = items.some((item) => item.id === product.id);
  const next = exists
    ? items.filter((item) => item.id !== product.id)
    : [toProductRef(product), ...items];
  saveStoredList(storageKey, next);
  return !exists;
}

export function getWishlist() {
  return getStoredList(wishlistStorageKey);
}

export function isWishlisted(productId) {
  return getStoredList(wishlistStorageKey).some((item) => item.id === productId);
}

export function toggleWishlist(product) {
  return toggleStoredProduct(wishlistStorageKey, product);
}

export function getRestockAlerts() {
  return getStoredList(restockAlertsStorageKey);
}

export function isRestockAlerted(productId) {
  return getStoredList(restockAlertsStorageKey).some((item) => item.id === productId);
}

export function toggleRestockAlert(product) {
  return toggleStoredProduct(restockAlertsStorageKey, product);
}
