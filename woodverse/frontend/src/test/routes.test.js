import { describe, it, expect } from "vitest";
import { authPages, pageRoles, resolvePage, routeMap, standalonePages } from "../config/routes";
import { footerRoutes } from "../components/LayoutParts";
import { headerLinks } from "../components/Header";
import { workspaceByRole } from "../pages/customer/ProfilePage";
import { adminHeaderSections, adminNavItems } from "../pages/admin/seed";
import { supplierNavItems } from "../pages/supplier/SupplierSidebar";
import { navigationItems } from "../pages/vendor/navigation";

// Every navigation target the four portals expose, gathered from the nav definitions
// themselves so a new menu entry cannot be added without a route behind it.
const storefrontLinks = [
  ...headerLinks.map(([, href]) => href),
  ...Object.values(footerRoutes),
];
const supplierLinks = [
  ...supplierNavItems.map(([, , href]) => href),
  "/supplier/shipments/new",
  "/supplier/apps",
  "/supplier/support",
  "/supplier/settings",
];
const vendorLinks = navigationItems.map(([, , href]) => href);
const adminLinks = [
  ...adminNavItems.map(([, , href]) => href),
  ...adminHeaderSections.map(([, href]) => href),
];
const workspaceLinks = Object.values(workspaceByRole).map(({ href }) => href);

// Pages that render their own shell, so they must never sit behind the storefront header.
const portalPages = [
  ...new Set([...supplierLinks, ...vendorLinks, ...adminLinks].map(resolvePage)),
];

describe("route resolution", () => {
  it.each([...storefrontLinks, ...supplierLinks, ...vendorLinks, ...adminLinks, ...workspaceLinks])(
    "resolves %s to a registered page",
    (href) => {
      // An unregistered path silently falls back to the storefront home page, which is
      // how the supplier sidebar links used to dead end.
      expect(resolvePage(href)).not.toBe("home");
    }
  );

  it("falls back to home for an unknown path", () => {
    expect(resolvePage("/not-a-real-page")).toBe("home");
  });

  it("does not let a lookalike path match a portal section", () => {
    expect(resolvePage("/admin/../shop")).toBe("home");
    expect(resolvePage("/vendor-dashboard-extra")).toBe("home");
    expect(resolvePage("/supplier/shipments/new/extra")).toBe("home");
  });

  it("routes the purchase order URL with and without an id", () => {
    expect(resolvePage("/supplier/purchase-orders")).toBe("supplierPurchaseOrder");
    expect(resolvePage("/supplier/purchase-orders/po-8921")).toBe("supplierPurchaseOrder");
  });
});

describe("route table integrity", () => {
  it("gives every admin section its own address", () => {
    for (const [, label, href] of adminNavItems) {
      expect(routeMap[href], `${label} has no route`).toBeDefined();
    }
    for (const [label, href] of adminHeaderSections) {
      expect(routeMap[href], `${label} has no route`).toBeDefined();
    }
  });

  it("guards every portal page behind a role check", () => {
    for (const page of portalPages) {
      expect(pageRoles[page], `${page} has no role guard`).toBeDefined();
    }
  });

  it("keeps supplier and admin pages out of the storefront shell", () => {
    for (const page of portalPages) {
      expect(standalonePages.has(page), `${page} should be standalone`).toBe(true);
    }
  });

  it("never lists the login pages as portal pages", () => {
    for (const page of portalPages) {
      expect(authPages.has(page)).toBe(false);
    }
  });
});