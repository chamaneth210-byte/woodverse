// Shared localStorage list helpers. Every portal seeded a list on first read and
// kept it under one key, so this read/write/prepend logic was repeated per role.
export function getStoredList(storageKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "null") || [];
  } catch {
    return [];
  }
}

export function saveStoredList(storageKey, items) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {}
}

export function appendStoredList(storageKey, item) {
  const current = getStoredList(storageKey);
  saveStoredList(storageKey, [item, ...current]);
}

export function getStoredListOrSeed(storageKey, seed) {
  const stored = getStoredList(storageKey);
  return stored.length ? stored : seed;
}