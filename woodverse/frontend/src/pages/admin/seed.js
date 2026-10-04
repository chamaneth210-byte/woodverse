import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Grid2X2,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  Users,
  WalletCards,
} from "lucide-react";

// The third entry is the URL slug for the section, so every admin page is a real
// address that can be linked to, bookmarked, and reached with the back button.
export const adminNavItems = [
  [LayoutDashboard, "Dashboard", "/admin"],
  [Users, "Customers", "/admin/customers"],
  [Store, "Vendors", "/admin/vendors"],
  [Truck, "Suppliers", "/admin/suppliers"],
  [Package, "Products", "/admin/products"],
  [ShoppingCart, "Orders", "/admin/orders"],
  [Grid2X2, "Categories", "/admin/categories"],
  [WalletCards, "Payments", "/admin/payments"],
  [Settings, "System Settings", "/admin/settings"],
];

// Sections reachable from the console header rather than the sidebar. These are
// [label, href] pairs because they are opened by dedicated header controls.
export const adminHeaderSections = [
  ["System Settings", "/admin/settings"],
  ["Admin Profile", "/admin/profile"],
];

export const metricCards = [
  { icon: Users, label: "Total Customers", value: "2,450", trend: "+12%", color: "border-l-[#104d3f] bg-[#e9f2ed] text-[#104d3f]" },
  { icon: Store, label: "Total Vendors", value: "184", trend: "+5%", color: "border-l-[#9b653d] bg-[#f3e8dc] text-[#8b5633]" },
  { icon: Truck, label: "Total Suppliers", value: "42", trend: "Steady", color: "border-l-[#51644d] bg-[#e8ede4] text-[#51644d]" },
  { icon: Boxes, label: "Total Products", value: "1,240", trend: "+42", color: "border-l-[#3c72a0] bg-[#e8f0f8] text-[#3c72a0]" },
  { icon: ShoppingCart, label: "Total Orders", value: "5,670", trend: "-2%", color: "border-l-[#f0a12f] bg-[#fff0d6] text-[#d07613]" },
  { icon: WalletCards, label: "Total Sales", value: "LKR 12.4M", trend: "+18%", color: "border-l-[#2f7d56] bg-[#e5f2e8] text-[#2f7d56]" },
];

export const approvalSeed = [
  { id: "APR-1048", initials: "AW", name: "Arpico Woodworks", email: "arpico.wood@example.com", type: "Vendor", requested: "Oct 24, 10:45 AM", status: "Pending" },
  { id: "APR-1047", initials: "SL", name: "Saman Loggers Ltd", email: "contact@samanlogs.lk", type: "Supplier", requested: "Oct 23, 04:20 PM", status: "Review" },
  { id: "APR-1046", initials: "HF", name: "Heritage Furnishings", email: "legal@heritage.lk", type: "Vendor", requested: "Oct 23, 11:10 AM", status: "Pending" },
];

export const customerSeed = [
  { id: "CUS-2450", name: "Kasun Wijesinghe", email: "kasun@example.com", location: "Colombo", status: "Active", orders: 8, value: "LKR 645,000", joined: "Jul 12, 2026" },
  { id: "CUS-2449", name: "Shani De Silva", email: "shani@example.com", location: "Galle", status: "Active", orders: 5, value: "LKR 312,000", joined: "Jul 10, 2026" },
  { id: "CUS-2448", name: "Ranil Thilak", email: "ranil@example.com", location: "Kandy", status: "Watch", orders: 3, value: "LKR 185,000", joined: "Jul 08, 2026" },
];

export const vendorSeed = [
  { id: "VEN-0184", name: "Kasun Fernando Woodcraft", email: "vendor@woodverse.lk", location: "Moratuwa", status: "Verified", orders: 42, value: "LKR 2.8M", joined: "Jun 02, 2026" },
  { id: "VEN-0183", name: "Heritage Furnishings", email: "legal@heritage.lk", location: "Nugegoda", status: "Pending", orders: 12, value: "LKR 740,000", joined: "Jul 21, 2026" },
  { id: "VEN-0182", name: "Arpico Woodworks", email: "arpico.wood@example.com", location: "Ratmalana", status: "Review", orders: 0, value: "LKR 0", joined: "Jul 24, 2026" },
];

export const supplierSeed = [
  { id: "SUP-0042", name: "Lumbini Timber Co.", email: "sales@lumbinitimber.lk", location: "Kegalle", status: "Verified", orders: 18, value: "LKR 1.4M", joined: "May 18, 2026" },
  { id: "SUP-0041", name: "Saman Loggers Ltd", email: "contact@samanlogs.lk", location: "Matara", status: "Review", orders: 9, value: "LKR 820,000", joined: "Jul 19, 2026" },
  { id: "SUP-0040", name: "Ceylon Hardwood Mills", email: "supply@ceylonhardwood.lk", location: "Kurunegala", status: "Verified", orders: 15, value: "LKR 1.1M", joined: "Apr 27, 2026" },
];

export const productSeed = [
  { id: "PRD-1240", name: "Walnut Task Table", vendor: "Kasun Fernando Woodcraft", category: "Office Furniture", price: "LKR 145,000", stock: 18, status: "Published", featured: true, sales: 32, submitted: "Jul 22, 2026" },
  { id: "PRD-1239", name: "Teak Dining Table", vendor: "Heritage Furnishings", category: "Dining Room", price: "LKR 285,000", stock: 6, status: "Pending Review", featured: false, sales: 0, submitted: "Jul 25, 2026" },
  { id: "PRD-1238", name: "Mahogany Coffee Table", vendor: "Arpico Woodworks", category: "Living Room", price: "LKR 89,000", stock: 0, status: "Stock Hold", featured: false, sales: 14, submitted: "Jul 18, 2026" },
  { id: "PRD-1237", name: "Carved Gift Box", vendor: "Kasun Fernando Woodcraft", category: "Wooden Gifts", price: "LKR 18,500", stock: 42, status: "Published", featured: true, sales: 58, submitted: "Jul 12, 2026" },
];

export const orderSeed = [
  { id: "ORD-5524", customer: "Kasun Wijesinghe", vendor: "Kasun Fernando Woodcraft", product: "Walnut Task Table", amount: "LKR 145,000", payment: "Paid", fulfillment: "Customer Delivery", status: "Completed", date: "Jul 30, 2026", priority: "Normal" },
  { id: "ORD-5523", customer: "Shani De Silva", vendor: "Heritage Furnishings", product: "Teak Dining Table", amount: "LKR 285,000", payment: "Authorized", fulfillment: "Production", status: "Processing", date: "Jul 29, 2026", priority: "High" },
  { id: "ORD-5522", customer: "Ranil Thilak", vendor: "Arpico Woodworks", product: "Mahogany Coffee Table", amount: "LKR 89,000", payment: "Pending", fulfillment: "Vendor Approval", status: "Vendor Approval", date: "Jul 28, 2026", priority: "High" },
  { id: "ORD-5521", customer: "Amara Jayawardena", vendor: "Kasun Fernando Woodcraft", product: "Carved Gift Box", amount: "LKR 18,500", payment: "Refund Requested", fulfillment: "Customer Delivery", status: "Refund Review", date: "Jul 27, 2026", priority: "Urgent" },
];

export const categorySeed = [
  { id: "CAT-001", name: "Office Furniture", parent: "Furniture", status: "Visible", featured: true, order: 1, products: 128, vendors: 24, commission: "8%" },
  { id: "CAT-002", name: "Dining Room", parent: "Furniture", status: "Visible", featured: true, order: 2, products: 96, vendors: 18, commission: "8%" },
  { id: "CAT-003", name: "Living Room", parent: "Furniture", status: "Visible", featured: false, order: 3, products: 142, vendors: 31, commission: "9%" },
  { id: "CAT-004", name: "Wooden Gifts", parent: "Marketplace", status: "Visible", featured: true, order: 4, products: 84, vendors: 16, commission: "7%" },
  { id: "CAT-005", name: "Raw Timber", parent: "Materials", status: "Hidden", featured: false, order: 5, products: 42, vendors: 9, commission: "5%" },
];

export const paymentSeed = [
  { id: "PAY-8824", orderId: "ORD-5524", customer: "Kasun Wijesinghe", vendor: "Kasun Fernando Woodcraft", amount: "LKR 145,000", method: "Card", status: "Settled", payout: "Released", date: "Jul 30, 2026", risk: "Low" },
  { id: "PAY-8823", orderId: "ORD-5523", customer: "Shani De Silva", vendor: "Heritage Furnishings", amount: "LKR 285,000", method: "Bank Transfer", status: "Authorized", payout: "Hold", date: "Jul 29, 2026", risk: "Medium" },
  { id: "PAY-8822", orderId: "ORD-5522", customer: "Ranil Thilak", vendor: "Arpico Woodworks", amount: "LKR 89,000", method: "Card", status: "Pending", payout: "Not Ready", date: "Jul 28, 2026", risk: "Low" },
  { id: "PAY-8821", orderId: "ORD-5521", customer: "Amara Jayawardena", vendor: "Kasun Fernando Woodcraft", amount: "LKR 18,500", method: "Card", status: "Refund Requested", payout: "Blocked", date: "Jul 27, 2026", risk: "High" },
];

export const systemSettingsSeed = {
  platformName: "WoodVerse ERP",
  supportEmail: "admin@woodverse.lk",
  defaultCurrency: "LKR",
  timezone: "Asia/Colombo",
  maintenanceMode: false,
  customerRegistration: true,
  vendorRegistration: true,
  supplierRegistration: true,
  autoApproveProducts: false,
  requireVendorVerification: true,
  requireSupplierVerification: true,
  paymentGateway: "Active",
  inventorySync: "Optimal",
  logisticsApi: "Delay",
  refundReviewThreshold: "50000",
  sessionTimeout: "30",
};

export const adminProfileSeed = {
  name: "WoodVerse Admin",
  role: "Platform Administrator",
  email: "admin@woodverse.lk",
  phone: "+94 77 100 2000",
  department: "Enterprise Operations",
  location: "Colombo, Sri Lanka",
  accessLevel: "Super Admin",
  timezone: "Asia/Colombo",
  language: "English",
  twoFactor: true,
  loginAlerts: true,
  approvalNotifications: true,
  payoutNotifications: true,
  weeklyDigest: true,
  lastLogin: "Today, 1:30 PM",
};

export const activitySeed = [
  { icon: Users, title: "New Vendor Registration: Arpico Woodworks", detail: "Verification pending documents.", time: "12 mins ago", tone: "text-[#104d3f]" },
  { icon: CheckCircle2, title: "Product Approved: Teak Dining Table", detail: "Published to Marketplace by Vendor #1092.", time: "45 mins ago", tone: "text-[#2f7d56]" },
  { icon: ShoppingCart, title: "Order #ORD-5524 Completed", detail: "LKR 45,000 processed for delivery.", time: "2 hours ago", tone: "text-[#8b5633]" },
  { icon: AlertTriangle, title: "High Refund Request", detail: "Vendor 'Luxury Lofts' flagged for quality issues.", time: "5 hours ago", tone: "text-[#d24b53]" },
];

export const provinceSales = [
  ["Western", 72],
  ["Central", 48],
  ["Southern", 88],
  ["Northern", 18],
  ["Eastern", 54],
];
