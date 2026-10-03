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

// Bumped whenever the bundled seed data changes shape in a way a cached copy cannot
// satisfy. Cached portal lists hold absolute asset paths, so when an asset is
// re-encoded the stale copy wins over the new seed and the page renders broken images
// for everyone who visited before the change. Clearing the key falls back to the seed.
export const storageSchemaVersion = 2;

const schemaVersionKey = "woodverse-storage-schema-version";

function assetPathsMigrated() {
  try {
    return Number(localStorage.getItem(schemaVersionKey)) >= storageSchemaVersion;
  } catch {
    return false;
  }
}

function markAssetPathsMigrated() {
  try {
    localStorage.setItem(schemaVersionKey, String(storageSchemaVersion));
  } catch {}
}

// Drops any stored list that still points at an asset path the build no longer emits.
// Safe to call on every read: once the version matches it is a single cheap getItem.
export function dropStaleAssetCaches(storageKeys) {
  if (assetPathsMigrated()) return;
  for (const storageKey of storageKeys) {
    try {
      const value = localStorage.getItem(storageKey);
      if (value && /\.png"/.test(value)) localStorage.removeItem(storageKey);
    } catch {}
  }
  markAssetPathsMigrated();
}