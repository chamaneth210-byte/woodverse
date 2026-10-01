import { lazy } from "react";

// Each role folder exposes a barrel of page components, so a page is loaded by
// name rather than by a direct file import. The import paths stay literal so
// Vite can still split each portal into its own chunk.
const lazyPage = (loader, exportName) => lazy(() => loader().then((module) => ({ default: module[exportName] })));

const adminPages = () => import("../pages/admin/index");
const supplierPages = () => import("../pages/supplier/index");
const vendorPages = () => import("../pages/vendor/index");

export const AdminDashboardPage = lazyPage(adminPages, "AdminDashboardPage");
export const SupplierAppsPage = lazyPage(supplierPages, "SupplierAppsPage");
export const SupplierDashboardPage = lazyPage(supplierPages, "SupplierDashboardPage");
export const SupplierMaterialsPage = lazyPage(supplierPages, "SupplierMaterialsPage");
export const SupplierNewShipmentPage = lazyPage(supplierPages, "SupplierNewShipmentPage");
export const SupplierNotificationsPage = lazyPage(supplierPages, "SupplierNotificationsPage");
export const SupplierProfilePage = lazyPage(supplierPages, "SupplierProfilePage");
export const SupplierPurchaseOrderPage = lazyPage(supplierPages, "SupplierPurchaseOrderPage");
export const SupplierSettingsPage = lazyPage(supplierPages, "SupplierSettingsPage");
export const SupplierShipmentsPage = lazyPage(supplierPages, "SupplierShipmentsPage");
export const SupplierSupportPage = lazyPage(supplierPages, "SupplierSupportPage");
export const SupplierVendorsPage = lazyPage(supplierPages, "SupplierVendorsPage");
export const VendorCustomerOrdersPage = lazyPage(vendorPages, "VendorCustomerOrdersPage");
export const VendorDashboardPage = lazyPage(vendorPages, "VendorDashboardPage");
export const VendorHelpCenterPage = lazyPage(vendorPages, "VendorHelpCenterPage");
export const VendorInventoryPage = lazyPage(vendorPages, "VendorInventoryPage");
export const VendorProductionTrackingPage = lazyPage(vendorPages, "VendorProductionTrackingPage");
export const VendorProductsPage = lazyPage(vendorPages, "VendorProductsPage");
export const VendorProfilePage = lazyPage(vendorPages, "VendorProfilePage");
export const VendorPurchaseOrdersPage = lazyPage(vendorPages, "VendorPurchaseOrdersPage");
export const VendorQuotationsPage = lazyPage(vendorPages, "VendorQuotationsPage");
export const VendorSettingsPage = lazyPage(vendorPages, "VendorSettingsPage");
export const VendorShipmentsPage = lazyPage(vendorPages, "VendorShipmentsPage");
export const VendorSuppliersPage = lazyPage(vendorPages, "VendorSuppliersPage");
export const VendorWarehousesPage = lazyPage(vendorPages, "VendorWarehousesPage");

// The single source of truth for which page component each URL renders.
export const routeMap = {
  "/": "home",
  "/features": "features",
  "/shop": "shop",
  "/furniture": "furniture",
  "/wooden-gifts": "gifts",
  "/cart": "cart",
  "/delivery": "delivery",
  "/payment": "payment",
  "/chatbot": "chatbot",
  "/seller": "seller",
  "/vendor-dashboard": "vendorDashboard",
  "/vendor/products": "vendorProducts",
  "/vendor/customer-orders": "vendorCustomerOrders",
  "/vendor/quotations": "vendorQuotations",
  "/vendor/production": "vendorProduction",
  "/vendor/suppliers": "vendorSuppliers",
  "/vendor/purchase-orders": "vendorPurchaseOrders",
  "/vendor/inventory": "vendorInventory",
  "/vendor/warehouses": "vendorWarehouses",
  "/vendor/shipments": "vendorShipments",
  "/vendor/profile": "vendorProfile",
  "/vendor/settings": "vendorSettings",
  "/vendor/help": "vendorHelp",
  "/supplier": "supplierDashboard",
  "/supplier/purchase-orders": "supplierPurchaseOrder",
  "/supplier/materials": "supplierMaterials",
  "/supplier/shipments": "supplierShipments",
  "/supplier/shipments/new": "supplierNewShipment",
  "/supplier/vendors": "supplierVendors",
  "/supplier/notifications": "supplierNotifications",
  "/supplier/profile": "supplierProfile",
  "/supplier/apps": "supplierApps",
  "/supplier/support": "supplierSupport",
  "/supplier/settings": "supplierSettings",
  "/login": "login",
  "/forgot-password": "forgotPassword",
  "/profile": "profile",
  "/admin": "adminDashboard",
  "/admin-dashboard": "adminDashboard",
  // Every admin section is its own address. They all render the same console shell,
  // which reads the section off the path, so a section can be linked and bookmarked.
  "/admin/customers": "adminDashboard",
  "/admin/vendors": "adminDashboard",
  "/admin/suppliers": "adminDashboard",
  "/admin/products": "adminDashboard",
  "/admin/orders": "adminDashboard",
  "/admin/categories": "adminDashboard",
  "/admin/payments": "adminDashboard",
  "/admin/settings": "adminDashboard",
  "/admin/profile": "adminDashboard",
};

// Portal pages render their own shell, so they skip the storefront header and
// chat launcher.
export const standalonePages = new Set([
  "vendorDashboard", "vendorProducts", "vendorCustomerOrders", "vendorQuotations",
  "vendorProduction", "vendorSuppliers", "vendorPurchaseOrders", "vendorInventory",
  "vendorWarehouses", "vendorShipments", "vendorProfile", "vendorSettings",
  "vendorHelp",
  "supplierDashboard", "supplierPurchaseOrder", "supplierMaterials", "supplierShipments",
  "supplierNewShipment", "supplierVendors", "supplierNotifications", "supplierProfile",
  "supplierApps", "supplierSupport", "supplierSettings",
  "adminDashboard",
]);

// Which roles may open which page. Anything listed here needs a real session.
export const pageRoles = {
  adminDashboard: ["admin"],
  vendorDashboard: ["vendor", "admin"],
  vendorProducts: ["vendor", "admin"],
  vendorCustomerOrders: ["vendor", "admin"],
  vendorQuotations: ["vendor", "admin"],
  vendorProduction: ["vendor", "admin"],
  vendorSuppliers: ["vendor", "admin"],
  vendorPurchaseOrders: ["vendor", "admin"],
  vendorInventory: ["vendor", "admin"],
  vendorWarehouses: ["vendor", "admin"],
  vendorShipments: ["vendor", "admin"],
  vendorProfile: ["vendor", "admin"],
  vendorSettings: ["vendor", "admin"],
  vendorHelp: ["vendor", "admin"],
  supplierDashboard: ["supplier", "admin"],
  supplierPurchaseOrder: ["supplier", "admin"],
  supplierMaterials: ["supplier", "admin"],
  supplierShipments: ["supplier", "admin"],
  supplierNewShipment: ["supplier", "admin"],
  supplierVendors: ["supplier", "admin"],
  supplierNotifications: ["supplier", "admin"],
  supplierProfile: ["supplier", "admin"],
  supplierApps: ["supplier", "admin"],
  supplierSupport: ["supplier", "admin"],
  supplierSettings: ["supplier", "admin"],
  cart: ["customer", "vendor", "admin"],
  delivery: ["customer", "vendor", "admin"],
  payment: ["customer", "vendor", "admin"],
  profile: ["customer", "vendor", "supplier", "admin"],
};

export const authPages = new Set(["login", "forgotPassword"]);

// A purchase order URL carries the order id, so it cannot be listed as a literal key
// above. Parameterised paths are matched after the exact lookup.
const routePatterns = [
  [/^\/supplier\/purchase-orders\/[^/]+$/, "supplierPurchaseOrder"],
];

// Resolves a URL path to the page name that routeMap stores. Unknown paths fall back
// to the storefront home page.
export function resolvePage(path) {
  if (routeMap[path]) return routeMap[path];
  const pattern = routePatterns.find(([expression]) => expression.test(path));
  return pattern ? pattern[1] : "home";
}