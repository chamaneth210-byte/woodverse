import {
  Archive,
  Boxes,
  Building2,
  ClipboardList,
  Factory,
  FileText,
  HelpCircle,
  Home,
  Settings,
  ShoppingCart,
  Truck,
  UserCog,
  Warehouse,
} from "lucide-react";

export const navigationItems = [
  [Home, "Dashboard", "/vendor-dashboard"],
  [Archive, "Products", "/vendor/products"],
  [ShoppingCart, "Customer Orders", "/vendor/customer-orders"],
  [FileText, "Quotations", "/vendor/quotations"],
  [Factory, "Production Tracking", "/vendor/production"],
  [Building2, "Suppliers", "/vendor/suppliers"],
  [ClipboardList, "Purchase Orders", "/vendor/purchase-orders"],
  [Boxes, "Inventory", "/vendor/inventory"],
  [Warehouse, "Warehouses", "/vendor/warehouses"],
  [Truck, "Shipments", "/vendor/shipments"],
  [UserCog, "Profile", "/vendor/profile"],
  [Settings, "Settings", "/vendor/settings"],
  [HelpCircle, "Help Center", "/vendor/help"],
];

export const mobileNavigationItems = navigationItems.filter(([, label]) => ["Dashboard", "Products", "Customer Orders", "Production Tracking", "Inventory"].includes(label));
