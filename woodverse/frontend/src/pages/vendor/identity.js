import { apiRequest, getSession } from "../../utils";
import { getInitialsFromName } from "./format.js";
import { vendorIdentityStorageKey } from "./storageKeys.js";

// The vendor's business name and owner name live in the `vendors` table, not in
// the page components. These pages used to hard-code a name that had no
// relationship to the signed-in account, so logging in as vendor@woodverse.lk
// showed a different business than the one the API and the chatbot report.
//
// This module is the single place that resolves the identity, so a portal screen
// and the API can never disagree about who is logged in.

const neutralIdentity = {
  businessName: "Vendor Portal",
  ownerName: "",
  email: "",
  vendorId: null,
  registrationNumber: null,
  verificationStatus: "pending",
  description: "",
};

// Built from the signed-in session rather than a fixed string, so the first
// paint can never show one vendor's business name to another vendor. The real
// business name arrives from GET /api/vendors a moment later.
function sessionFallback() {
  const session = getSession();
  if (!session) return neutralIdentity;
  return {
    ...neutralIdentity,
    businessName: session.fullName || "Vendor Portal",
    ownerName: session.fullName || "",
    email: session.email || "",
  };
}

function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(vendorIdentityStorageKey) || "null");
    if (cached && cached.ownerUserId && getSession()?.id === cached.ownerUserId) return cached;
  } catch {}
  return null;
}

function writeCache(identity) {
  try {
    localStorage.setItem(vendorIdentityStorageKey, JSON.stringify(identity));
  } catch {}
}

/**
 * Synchronous read for first paint. Returns the cached identity when it belongs
 * to the current session, otherwise a session-derived placeholder, so no screen
 * ever renders an empty or another vendor's business name.
 */
export function getVendorIdentity() {
  return readCache() || sessionFallback();
}

export function getVendorInitials() {
  const { businessName, ownerName } = getVendorIdentity();
  return getInitialsFromName(ownerName || businessName);
}

/**
 * Fetches the signed-in vendor's row and caches it. Safe to call from every
 * portal screen: it resolves once and later callers hit the cache.
 */
export async function loadVendorIdentity() {
  const session = getSession();
  if (!session) return sessionFallback();

  const cached = readCache();
  if (cached) return cached;

  try {
    const response = await apiRequest("/api/vendors");
    const vendors = Array.isArray(response) ? response : response?.vendors || [];
    // Match on the owner id the JWT carries, never on a name, so this cannot
    // latch onto the wrong row if two vendors ever share a business name.
    const match = vendors.find((vendor) => vendor.user_id === session.id || vendor.email === session.email);
    if (!match) return sessionFallback();

    const identity = {
      businessName: match.business_name || session.fullName || "Vendor Portal",
      ownerName: match.full_name || session.fullName || "",
      email: match.email || session.email || "",
      vendorId: match.id,
      registrationNumber: match.registration_number || null,
      verificationStatus: match.verification_status || "pending",
      description: match.description || "",
      ownerUserId: match.user_id || session.id,
    };
    writeCache(identity);
    return identity;
  } catch {
    // A vendor with no reachable API still gets a coherent portal rather than a
    // blank header, which is the whole point of the fallback.
    return sessionFallback();
  }
}

export function clearVendorIdentityCache() {
  try {
    localStorage.removeItem(vendorIdentityStorageKey);
  } catch {}
}