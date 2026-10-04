import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { clearAuth, storeAuth } from "../utils";
import { getVendorIdentity, getVendorInitials, loadVendorIdentity, clearVendorIdentityCache } from "../pages/vendor/identity";

// The vendor portal used to hard-code "Perera Artisan Works" while the API and
// the chatbot reported "Kasun Fernando Woodcraft" for the same account, so the
// portal and the backend disagreed about who was signed in.

const VENDOR_USER_ID = "06f0186b-c269-49ad-a261-059f8e96aaae";

const VENDORS = [
  {
    id: "34215ddd-a58c-4f2f-9957-63a88814b7a8",
    user_id: "9e519816-1181-4f47-b2a1-357cdd637161",
    business_name: "Lumbini Timber Co.",
    email: "supplier@woodverse.lk",
    full_name: "Lumbini Timber",
    verification_status: "approved",
  },
  {
    id: "b7ba76dd-f58d-4cce-b370-f0a1caddf072",
    user_id: VENDOR_USER_ID,
    business_name: "Kasun Fernando Woodcraft",
    email: "vendor@woodverse.lk",
    full_name: "Kasun Fernando",
    verification_status: "approved",
    description: "Bespoke teak, walnut and mahogany furniture made in Moratuwa.",
  },
];

function signInAsVendor() {
  const encode = (value) => btoa(JSON.stringify(value)).replace(/=+$/, "");
  const token = [
    encode({ alg: "HS256", typ: "JWT" }),
    encode({ id: VENDOR_USER_ID, role: "vendor", email: "vendor@woodverse.lk", fullName: "Kasun Fernando", exp: Math.floor(Date.now() / 1000) + 3600 }),
    "signature",
  ].join(".");
  storeAuth({ token, user: { id: VENDOR_USER_ID, role: "vendor", email: "vendor@woodverse.lk" } });
}

const mockFetch = (payload) =>
  vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
    new Response(JSON.stringify(payload), { status: 200, headers: { "content-type": "application/json" } })
  );

describe("vendor identity", () => {
  beforeEach(() => {
    clearAuth();
    clearVendorIdentityCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearVendorIdentityCache();
    clearAuth();
  });

  it("resolves the business name for the signed-in vendor", async () => {
    signInAsVendor();
    mockFetch({ vendors: VENDORS });

    const identity = await loadVendorIdentity();

    expect(identity.businessName).toBe("Kasun Fernando Woodcraft");
    expect(identity.ownerName).toBe("Kasun Fernando");
    expect(identity.email).toBe("vendor@woodverse.lk");
    expect(identity.vendorId).toBe("b7ba76dd-f58d-4cce-b370-f0a1caddf072");
  });

  it("picks the vendor matching the session, not the first row returned", async () => {
    // Lumbini Timber is deliberately first in the response. Matching by position
    // would show the wrong business, which is the class of bug being guarded.
    signInAsVendor();
    mockFetch({ vendors: VENDORS });

    const identity = await loadVendorIdentity();

    expect(identity.businessName).not.toBe("Lumbini Timber Co.");
  });

  it("caches the resolved identity for later screens", async () => {
    signInAsVendor();
    const fetchSpy = mockFetch({ vendors: VENDORS });

    await loadVendorIdentity();
    const second = await loadVendorIdentity();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(second.businessName).toBe("Kasun Fernando Woodcraft");
    expect(getVendorIdentity().businessName).toBe("Kasun Fernando Woodcraft");
  });

  it("falls back to the signed-in user's own name when the API is unreachable", async () => {
    signInAsVendor();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));

    const identity = await loadVendorIdentity();

    // Derived from the session, so it is never another vendor's business.
    expect(identity.businessName).toBe("Kasun Fernando");
    expect(identity.businessName).not.toBe("Perera Artisan Works");
  });

  it("falls back when no vendor row matches the session", async () => {
    signInAsVendor();
    mockFetch({ vendors: [VENDORS[0]] });

    const identity = await loadVendorIdentity();

    expect(identity.businessName).toBe("Kasun Fernando");
    expect(identity.businessName).not.toBe("Lumbini Timber Co.");
  });

  it("does not reuse another session's cached identity", async () => {
    signInAsVendor();
    mockFetch({ vendors: VENDORS });
    await loadVendorIdentity();

    // A different user signs in on the same browser. The cache belongs to the
    // previous session, so it must be discarded rather than shown to them.
    const encode = (value) => btoa(JSON.stringify(value)).replace(/=+$/, "");
    const otherToken = [
      encode({ alg: "HS256", typ: "JWT" }),
      encode({ id: "9e519816-1181-4f47-b2a1-357cdd637161", role: "supplier", email: "supplier@woodverse.lk", fullName: "Lumbini Timber", exp: Math.floor(Date.now() / 1000) + 3600 }),
      "signature",
    ].join(".");
    storeAuth({ token: otherToken, user: { id: "9e519816-1181-4f47-b2a1-357cdd637161", role: "supplier" } });

    expect(getVendorIdentity().businessName).toBe("Lumbini Timber");
  });

  it("derives initials from the resolved owner name", async () => {
    signInAsVendor();
    mockFetch({ vendors: VENDORS });
    await loadVendorIdentity();

    expect(getVendorInitials()).toBe("KF");
  });
});