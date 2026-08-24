import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Boxes,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Grid2X2,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { apiRequest } from "../../utils";

const adminNavItems = [
  [LayoutDashboard, "Dashboard"],
  [Users, "Customers"],
  [Store, "Vendors"],
  [Truck, "Suppliers"],
  [Package, "Products"],
  [ShoppingCart, "Orders"],
  [Grid2X2, "Categories"],
  [WalletCards, "Payments"],
  [Settings, "System Settings"],
];

const metricCards = [
  { icon: Users, label: "Total Customers", value: "2,450", trend: "+12%", color: "border-l-[#104d3f] bg-[#e9f2ed] text-[#104d3f]" },
  { icon: Store, label: "Total Vendors", value: "184", trend: "+5%", color: "border-l-[#9b653d] bg-[#f3e8dc] text-[#8b5633]" },
  { icon: Truck, label: "Total Suppliers", value: "42", trend: "Steady", color: "border-l-[#51644d] bg-[#e8ede4] text-[#51644d]" },
  { icon: Boxes, label: "Total Products", value: "1,240", trend: "+42", color: "border-l-[#3c72a0] bg-[#e8f0f8] text-[#3c72a0]" },
  { icon: ShoppingCart, label: "Total Orders", value: "5,670", trend: "-2%", color: "border-l-[#f0a12f] bg-[#fff0d6] text-[#d07613]" },
  { icon: WalletCards, label: "Total Sales", value: "LKR 12.4M", trend: "+18%", color: "border-l-[#2f7d56] bg-[#e5f2e8] text-[#2f7d56]" },
];

const approvalSeed = [
  { id: "APR-1048", initials: "AW", name: "Arpico Woodworks", email: "arpico.wood@example.com", type: "Vendor", requested: "Oct 24, 10:45 AM", status: "Pending" },
  { id: "APR-1047", initials: "SL", name: "Saman Loggers Ltd", email: "contact@samanlogs.lk", type: "Supplier", requested: "Oct 23, 04:20 PM", status: "Review" },
  { id: "APR-1046", initials: "HF", name: "Heritage Furnishings", email: "legal@heritage.lk", type: "Vendor", requested: "Oct 23, 11:10 AM", status: "Pending" },
];

const customerSeed = [
  { id: "CUS-2450", name: "Kasun Wijesinghe", email: "kasun@example.com", location: "Colombo", status: "Active", orders: 8, value: "LKR 645,000", joined: "Jul 12, 2026" },
  { id: "CUS-2449", name: "Shani De Silva", email: "shani@example.com", location: "Galle", status: "Active", orders: 5, value: "LKR 312,000", joined: "Jul 10, 2026" },
  { id: "CUS-2448", name: "Ranil Thilak", email: "ranil@example.com", location: "Kandy", status: "Watch", orders: 3, value: "LKR 185,000", joined: "Jul 08, 2026" },
];

const vendorSeed = [
  { id: "VEN-0184", name: "Perera Artisan Works", email: "aruni@pereraartisan.lk", location: "Moratuwa", status: "Verified", orders: 42, value: "LKR 2.8M", joined: "Jun 02, 2026" },
  { id: "VEN-0183", name: "Heritage Furnishings", email: "legal@heritage.lk", location: "Nugegoda", status: "Pending", orders: 12, value: "LKR 740,000", joined: "Jul 21, 2026" },
  { id: "VEN-0182", name: "Arpico Woodworks", email: "arpico.wood@example.com", location: "Ratmalana", status: "Review", orders: 0, value: "LKR 0", joined: "Jul 24, 2026" },
];

const supplierSeed = [
  { id: "SUP-0042", name: "Lumbini Timber Co.", email: "sales@lumbinitimber.lk", location: "Kegalle", status: "Verified", orders: 18, value: "LKR 1.4M", joined: "May 18, 2026" },
  { id: "SUP-0041", name: "Saman Loggers Ltd", email: "contact@samanlogs.lk", location: "Matara", status: "Review", orders: 9, value: "LKR 820,000", joined: "Jul 19, 2026" },
  { id: "SUP-0040", name: "Ceylon Hardwood Mills", email: "supply@ceylonhardwood.lk", location: "Kurunegala", status: "Verified", orders: 15, value: "LKR 1.1M", joined: "Apr 27, 2026" },
];

const productSeed = [
  { id: "PRD-1240", name: "Walnut Task Table", vendor: "Perera Artisan Works", category: "Office Furniture", price: "LKR 145,000", stock: 18, status: "Published", featured: true, sales: 32, submitted: "Jul 22, 2026" },
  { id: "PRD-1239", name: "Teak Dining Table", vendor: "Heritage Furnishings", category: "Dining Room", price: "LKR 285,000", stock: 6, status: "Pending Review", featured: false, sales: 0, submitted: "Jul 25, 2026" },
  { id: "PRD-1238", name: "Mahogany Coffee Table", vendor: "Arpico Woodworks", category: "Living Room", price: "LKR 89,000", stock: 0, status: "Stock Hold", featured: false, sales: 14, submitted: "Jul 18, 2026" },
  { id: "PRD-1237", name: "Carved Gift Box", vendor: "Perera Artisan Works", category: "Wooden Gifts", price: "LKR 18,500", stock: 42, status: "Published", featured: true, sales: 58, submitted: "Jul 12, 2026" },
];

const orderSeed = [
  { id: "ORD-5524", customer: "Kasun Wijesinghe", vendor: "Perera Artisan Works", product: "Walnut Task Table", amount: "LKR 145,000", payment: "Paid", fulfillment: "Customer Delivery", status: "Completed", date: "Jul 30, 2026", priority: "Normal" },
  { id: "ORD-5523", customer: "Shani De Silva", vendor: "Heritage Furnishings", product: "Teak Dining Table", amount: "LKR 285,000", payment: "Authorized", fulfillment: "Production", status: "Processing", date: "Jul 29, 2026", priority: "High" },
  { id: "ORD-5522", customer: "Ranil Thilak", vendor: "Arpico Woodworks", product: "Mahogany Coffee Table", amount: "LKR 89,000", payment: "Pending", fulfillment: "Vendor Approval", status: "Vendor Approval", date: "Jul 28, 2026", priority: "High" },
  { id: "ORD-5521", customer: "Amara Jayawardena", vendor: "Perera Artisan Works", product: "Carved Gift Box", amount: "LKR 18,500", payment: "Refund Requested", fulfillment: "Customer Delivery", status: "Refund Review", date: "Jul 27, 2026", priority: "Urgent" },
];

const categorySeed = [
  { id: "CAT-001", name: "Office Furniture", parent: "Furniture", status: "Visible", featured: true, order: 1, products: 128, vendors: 24, commission: "8%" },
  { id: "CAT-002", name: "Dining Room", parent: "Furniture", status: "Visible", featured: true, order: 2, products: 96, vendors: 18, commission: "8%" },
  { id: "CAT-003", name: "Living Room", parent: "Furniture", status: "Visible", featured: false, order: 3, products: 142, vendors: 31, commission: "9%" },
  { id: "CAT-004", name: "Wooden Gifts", parent: "Marketplace", status: "Visible", featured: true, order: 4, products: 84, vendors: 16, commission: "7%" },
  { id: "CAT-005", name: "Raw Timber", parent: "Materials", status: "Hidden", featured: false, order: 5, products: 42, vendors: 9, commission: "5%" },
];

const paymentSeed = [
  { id: "PAY-8824", orderId: "ORD-5524", customer: "Kasun Wijesinghe", vendor: "Perera Artisan Works", amount: "LKR 145,000", method: "Card", status: "Settled", payout: "Released", date: "Jul 30, 2026", risk: "Low" },
  { id: "PAY-8823", orderId: "ORD-5523", customer: "Shani De Silva", vendor: "Heritage Furnishings", amount: "LKR 285,000", method: "Bank Transfer", status: "Authorized", payout: "Hold", date: "Jul 29, 2026", risk: "Medium" },
  { id: "PAY-8822", orderId: "ORD-5522", customer: "Ranil Thilak", vendor: "Arpico Woodworks", amount: "LKR 89,000", method: "Card", status: "Pending", payout: "Not Ready", date: "Jul 28, 2026", risk: "Low" },
  { id: "PAY-8821", orderId: "ORD-5521", customer: "Amara Jayawardena", vendor: "Perera Artisan Works", amount: "LKR 18,500", method: "Card", status: "Refund Requested", payout: "Blocked", date: "Jul 27, 2026", risk: "High" },
];

const systemSettingsSeed = {
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

const adminProfileSeed = {
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

const activitySeed = [
  { icon: Users, title: "New Vendor Registration: Arpico Woodworks", detail: "Verification pending documents.", time: "12 mins ago", tone: "text-[#104d3f]" },
  { icon: CheckCircle2, title: "Product Approved: Teak Dining Table", detail: "Published to Marketplace by Vendor #1092.", time: "45 mins ago", tone: "text-[#2f7d56]" },
  { icon: ShoppingCart, title: "Order #ORD-5524 Completed", detail: "LKR 45,000 processed for delivery.", time: "2 hours ago", tone: "text-[#8b5633]" },
  { icon: AlertTriangle, title: "High Refund Request", detail: "Vendor 'Luxury Lofts' flagged for quality issues.", time: "5 hours ago", tone: "text-[#d24b53]" },
];

const provinceSales = [
  ["Western", 72],
  ["Central", 48],
  ["Southern", 88],
  ["Northern", 18],
  ["Eastern", 54],
];

const adminNotificationStorageKey = "woodverse-admin-notifications";
const customerNotificationStorageKey = "woodverse-customer-notifications";
const vendorNotificationStorageKey = "woodverse-vendor-admin-notifications";
const supplierNotificationStorageKey = "woodverse-supplier-notifications";
const approvedEntitiesStorageKey = "woodverse-admin-approved-entities";
const approvalReviewsStorageKey = "woodverse-admin-approval-reviews";
const adminCustomersStorageKey = "woodverse-admin-customers";
const adminVendorsStorageKey = "woodverse-admin-vendors";
const adminSuppliersStorageKey = "woodverse-admin-suppliers";
const adminProductsStorageKey = "woodverse-admin-products";
const adminOrdersStorageKey = "woodverse-admin-orders";
const adminCategoriesStorageKey = "woodverse-admin-categories";
const adminPaymentsStorageKey = "woodverse-admin-payments";
const adminSystemSettingsStorageKey = "woodverse-admin-system-settings";
const adminAuditLogStorageKey = "woodverse-admin-audit-log";
const adminProfileStorageKey = "woodverse-admin-profile";
const registrationApplicationsStorageKey = "woodverse-registration-applications";

function getStoredList(storageKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "null") || [];
  } catch {
    return [];
  }
}

function saveStoredList(storageKey, items) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {}
}

function appendStoredNotification(storageKey, item) {
  const current = getStoredList(storageKey);
  saveStoredList(storageKey, [item, ...current]);
}

function getStoredListOrSeed(storageKey, seed) {
  const stored = getStoredList(storageKey);
  return stored.length ? stored : seed;
}

function getRegistrationApprovals() {
  const applications = getStoredList(registrationApplicationsStorageKey);
  return applications.map((application) => ({
    id: application.id,
    initials: application.type === "Vendor" ? "VN" : "SP",
    name: application.name || `New ${application.type} Application`,
    email: application.email || "Registration details submitted",
    type: application.type,
    requested: application.submittedAt ? new Date(application.submittedAt).toLocaleString() : "Just now",
    status: application.status || "Pending",
    documents: application.documents || [],
  }));
}

function AdminDashboardPage() {
  const [notice, setNotice] = useState("Admin dashboard loaded.");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [query, setQuery] = useState("");
  const [approvals, setApprovals] = useState(() => [...getRegistrationApprovals(), ...approvalSeed]);
  const [activities, setActivities] = useState(activitySeed);
  const [customers, setCustomers] = useState(() => getStoredListOrSeed(adminCustomersStorageKey, customerSeed));
  const [vendors, setVendors] = useState(() => getStoredListOrSeed(adminVendorsStorageKey, vendorSeed));
  const [suppliers, setSuppliers] = useState(() => getStoredListOrSeed(adminSuppliersStorageKey, supplierSeed));
  const [products, setProducts] = useState(() => getStoredListOrSeed(adminProductsStorageKey, productSeed));
  const [orders, setOrders] = useState(() => getStoredListOrSeed(adminOrdersStorageKey, orderSeed));
  const [categories, setCategories] = useState(() => getStoredListOrSeed(adminCategoriesStorageKey, categorySeed));
  const [payments, setPayments] = useState(() => getStoredListOrSeed(adminPaymentsStorageKey, paymentSeed));
  const [systemSettings, setSystemSettings] = useState(() => {
    try {
      return { ...systemSettingsSeed, ...JSON.parse(localStorage.getItem(adminSystemSettingsStorageKey) || "{}") };
    } catch {
      return systemSettingsSeed;
    }
  });
  const [adminProfile, setAdminProfile] = useState(() => {
    try {
      return { ...adminProfileSeed, ...JSON.parse(localStorage.getItem(adminProfileStorageKey) || "{}") };
    } catch {
      return adminProfileSeed;
    }
  });
  const [auditLog, setAuditLog] = useState(() => getStoredList(adminAuditLogStorageKey));
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [dateLabel, setDateLabel] = useState("Oct 24, 2023 - Today");
  const [supportOpen, setSupportOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [approvalManagerOpen, setApprovalManagerOpen] = useState(false);
  const [activeReview, setActiveReview] = useState(null);
  const [reviewNote, setReviewNote] = useState("Please upload the missing verification documents and confirm business contact details.");
  const [adminNotifications, setAdminNotifications] = useState(() => getStoredList(adminNotificationStorageKey));
  useEffect(() => {
    apiRequest("/api/orders").then(({ orders: apiOrders = [] }) => {
      if (!apiOrders.length) return;
      setOrders((current) => {
        const known = new Set(current.map((item) => item.id));
        return [...apiOrders.filter((item) => !known.has(item.id)), ...current];
      });
    }).catch(() => {});
  }, []);
  const [notificationForm, setNotificationForm] = useState({
    audience: "Vendor",
    priority: "Normal",
    title: "Platform notice from WoodVerse Admin",
    message: "Please review your WoodVerse portal for the latest operational update.",
  });

  const filteredApprovals = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return approvals;
    return approvals.filter((item) => `${item.name} ${item.email} ${item.type} ${item.status}`.toLowerCase().includes(text));
  }, [approvals, query]);

  const visibleApprovals = filteredApprovals.slice(0, 3);
  const visibleActivities = showAllActivities ? activities : activities.slice(0, 4);

  const openSection = (label) => {
    setActiveNav(label);
    setNotice(`${label} section selected in admin console.`);
  };

  const openApprovalManager = () => {
    setApprovalManagerOpen(true);
    setNotice("All pending approvals opened.");
  };

  const getDirectoryConfig = (section) => {
    if (section === "Customers") return { items: customers, setItems: setCustomers, storageKey: adminCustomersStorageKey, audience: "Customer", icon: Users };
    if (section === "Vendors") return { items: vendors, setItems: setVendors, storageKey: adminVendorsStorageKey, audience: "Vendor", icon: Store };
    if (section === "Suppliers") return { items: suppliers, setItems: setSuppliers, storageKey: adminSuppliersStorageKey, audience: "Supplier", icon: Truck };
    return null;
  };

  const sendDirectoryNotification = (audience, entity, title, message, priority = "Normal") => {
    const notification = {
      id: `AN-${Date.now()}-${entity.id}`,
      audience,
      type: "Admin",
      source: "WoodVerse Admin",
      title,
      message,
      detail: message,
      priority,
      time: "Just now",
      createdAt: new Date().toISOString(),
    };
    if (audience === "Customer") appendStoredNotification(customerNotificationStorageKey, notification);
    if (audience === "Vendor") appendStoredNotification(vendorNotificationStorageKey, { ...notification, audience: "Admin" });
    if (audience === "Supplier") appendStoredNotification(supplierNotificationStorageKey, notification);
  };

  const updateDirectoryStatus = (section, entity, status) => {
    const config = getDirectoryConfig(section);
    if (!config) return;
    config.setItems((items) => {
      const next = items.map((item) => (item.id === entity.id ? { ...item, status } : item));
      saveStoredList(config.storageKey, next);
      return next;
    });
    sendDirectoryNotification(config.audience, entity, `${section.slice(0, -1)} account status updated`, `${entity.name} is now marked ${status} by WoodVerse Admin.`, status === "Suspended" ? "High" : "Normal");
    setActivities((items) => [{
      icon: config.icon,
      title: `${section.slice(0, -1)} Status Updated: ${entity.name}`,
      detail: `${entity.email} marked ${status}.`,
      time: "Just now",
      tone: status === "Suspended" ? "text-[#d24b53]" : "text-[#2f7d56]",
    }, ...items]);
    setNotice(`${entity.name} marked ${status} and notified.`);
  };

  const messageDirectoryEntity = (section, entity) => {
    const config = getDirectoryConfig(section);
    if (!config) return;
    sendDirectoryNotification(config.audience, entity, `Message from WoodVerse Admin`, `Admin reviewed your ${section.slice(0, -1).toLowerCase()} profile. Please check your portal for updates.`, "Normal");
    setNotice(`Admin message sent to ${entity.name}.`);
  };

  const notifyProductVendor = (product, title, message, priority = "Normal") => {
    appendStoredNotification(vendorNotificationStorageKey, {
      id: `AN-${Date.now()}-${product.id}`,
      audience: "Admin",
      type: "Admin",
      source: "WoodVerse Admin",
      title,
      message,
      detail: message,
      priority,
      time: "Just now",
      createdAt: new Date().toISOString(),
    });
  };

  const updateProductStatus = (product, status) => {
    setProducts((items) => {
      const next = items.map((item) => (item.id === product.id ? { ...item, status } : item));
      saveStoredList(adminProductsStorageKey, next);
      return next;
    });
    notifyProductVendor(product, `Product status updated: ${product.name}`, `${product.name} is now marked ${status} by WoodVerse Admin.`, status === "Rejected" ? "High" : "Normal");
    setActivities((items) => [{
      icon: Package,
      title: `Product ${status}: ${product.name}`,
      detail: `${product.vendor} was notified by admin.`,
      time: "Just now",
      tone: status === "Published" ? "text-[#2f7d56]" : "text-[#d2861d]",
    }, ...items]);
    setNotice(`${product.name} marked ${status}.`);
  };

  const toggleProductFeatured = (product) => {
    const nextFeatured = !product.featured;
    setProducts((items) => {
      const next = items.map((item) => (item.id === product.id ? { ...item, featured: nextFeatured } : item));
      saveStoredList(adminProductsStorageKey, next);
      return next;
    });
    notifyProductVendor(product, `Product feature status changed`, `${product.name} was ${nextFeatured ? "featured on" : "removed from"} marketplace highlights.`, "Normal");
    setNotice(`${product.name} ${nextFeatured ? "featured" : "unfeatured"}.`);
  };

  const restockProduct = (product) => {
    const nextStock = Number(product.stock) + 10;
    setProducts((items) => {
      const next = items.map((item) => (item.id === product.id ? { ...item, stock: nextStock, status: item.status === "Stock Hold" ? "Published" : item.status } : item));
      saveStoredList(adminProductsStorageKey, next);
      return next;
    });
    notifyProductVendor(product, `Product stock adjusted`, `${product.name} stock was increased to ${nextStock} by admin.`, "Normal");
    setNotice(`${product.name} stock increased to ${nextStock}.`);
  };

  const messageProductVendor = (product) => {
    notifyProductVendor(product, `Admin message about ${product.name}`, `Please review catalog details, stock level, pricing, and marketplace readiness for ${product.name}.`, "Normal");
    setNotice(`Message sent to ${product.vendor} about ${product.name}.`);
  };

  const createProduct = () => {
    const product = {
      id: `PRD-${Date.now().toString().slice(-4)}`,
      name: "New WoodVerse Product",
      vendor: "Perera Artisan Works",
      category: "Furniture",
      price: "LKR 0",
      stock: 0,
      status: "Draft",
      featured: false,
      sales: 0,
      submitted: "Today",
    };
    setProducts((items) => {
      const next = [product, ...items];
      saveStoredList(adminProductsStorageKey, next);
      return next;
    });
    setNotice(`${product.name} created as draft.`);
  };

  const notifyOrderParties = (order, title, message, priority = "Normal") => {
    appendStoredNotification(customerNotificationStorageKey, {
      id: `AN-${Date.now()}-${order.id}-customer`,
      audience: "Customer",
      type: "Admin",
      source: "WoodVerse Admin",
      title,
      message,
      detail: message,
      priority,
      time: "Just now",
      createdAt: new Date().toISOString(),
    });
    appendStoredNotification(vendorNotificationStorageKey, {
      id: `AN-${Date.now()}-${order.id}-vendor`,
      audience: "Admin",
      type: "Admin",
      source: "WoodVerse Admin",
      title,
      message: `${message} Order vendor: ${order.vendor}.`,
      detail: `${message} Order vendor: ${order.vendor}.`,
      priority,
      time: "Just now",
      createdAt: new Date().toISOString(),
    });
  };

  const updateOrderField = (order, field, value) => {
    const nextOrder = { ...order, [field]: value };
    setOrders((items) => {
      const next = items.map((item) => (item.id === order.id ? nextOrder : item));
      saveStoredList(adminOrdersStorageKey, next);
      return next;
    });
    notifyOrderParties(order, `Order ${order.id} updated`, `${field === "status" ? "Order status" : field === "payment" ? "Payment status" : "Fulfillment"} changed to ${value}.`, value === "Cancelled" || value === "Refund Review" ? "High" : "Normal");
    setActivities((items) => [{
      icon: ShoppingCart,
      title: `Order Updated: ${order.id}`,
      detail: `${field} changed to ${value}.`,
      time: "Just now",
      tone: value === "Completed" ? "text-[#2f7d56]" : "text-[#d2861d]",
    }, ...items]);
    setNotice(`${order.id} ${field} updated to ${value}.`);
  };

  const messageOrderParties = (order) => {
    notifyOrderParties(order, `Admin message for ${order.id}`, `Admin reviewed ${order.product}. Please check order progress and next action.`, "Normal");
    setNotice(`Customer and vendor notified for ${order.id}.`);
  };

  const createOrder = () => {
    const order = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      customer: "New Customer",
      vendor: "Perera Artisan Works",
      product: "New Product Order",
      amount: "LKR 0",
      payment: "Pending",
      fulfillment: "Vendor Approval",
      status: "Vendor Approval",
      date: "Today",
      priority: "Normal",
    };
    setOrders((items) => {
      const next = [order, ...items];
      saveStoredList(adminOrdersStorageKey, next);
      return next;
    });
    setNotice(`${order.id} created for admin review.`);
  };

  const updateCategoryField = (category, field, value) => {
    const nextCategory = { ...category, [field]: value };
    setCategories((items) => {
      const next = items.map((item) => (item.id === category.id ? nextCategory : item)).sort((a, b) => Number(a.order) - Number(b.order));
      saveStoredList(adminCategoriesStorageKey, next);
      return next;
    });
    setActivities((items) => [{
      icon: Grid2X2,
      title: `Category Updated: ${category.name}`,
      detail: `${field} changed to ${value}.`,
      time: "Just now",
      tone: value === "Hidden" ? "text-[#d2861d]" : "text-[#2f7d56]",
    }, ...items]);
    setNotice(`${category.name} ${field} updated to ${value}.`);
  };

  const moveCategory = (category, direction) => {
    const nextOrder = Math.max(1, Number(category.order) + direction);
    updateCategoryField(category, "order", nextOrder);
  };

  const createCategory = () => {
    const category = {
      id: `CAT-${Date.now().toString().slice(-4)}`,
      name: "New Category",
      parent: "Marketplace",
      status: "Hidden",
      featured: false,
      order: categories.length + 1,
      products: 0,
      vendors: 0,
      commission: "8%",
    };
    setCategories((items) => {
      const next = [...items, category];
      saveStoredList(adminCategoriesStorageKey, next);
      return next;
    });
    setNotice(`${category.name} created as hidden category.`);
  };

  const notifyPaymentParties = (payment, title, message, priority = "Normal") => {
    appendStoredNotification(customerNotificationStorageKey, {
      id: `AN-${Date.now()}-${payment.id}-customer`,
      audience: "Customer",
      type: "Admin",
      source: "WoodVerse Admin",
      title,
      message,
      detail: message,
      priority,
      time: "Just now",
      createdAt: new Date().toISOString(),
    });
    appendStoredNotification(vendorNotificationStorageKey, {
      id: `AN-${Date.now()}-${payment.id}-vendor`,
      audience: "Admin",
      type: "Admin",
      source: "WoodVerse Admin",
      title,
      message: `${message} Vendor payout account: ${payment.vendor}.`,
      detail: `${message} Vendor payout account: ${payment.vendor}.`,
      priority,
      time: "Just now",
      createdAt: new Date().toISOString(),
    });
  };

  const updatePaymentField = (payment, field, value) => {
    setPayments((items) => {
      const next = items.map((item) => (item.id === payment.id ? { ...item, [field]: value } : item));
      saveStoredList(adminPaymentsStorageKey, next);
      return next;
    });
    notifyPaymentParties(payment, `Payment ${payment.id} updated`, `${field === "status" ? "Payment status" : "Payout status"} changed to ${value} for ${payment.orderId}.`, value === "Refunded" || value === "Blocked" ? "High" : "Normal");
    setActivities((items) => [{
      icon: WalletCards,
      title: `Payment Updated: ${payment.id}`,
      detail: `${field} changed to ${value}.`,
      time: "Just now",
      tone: value === "Settled" || value === "Released" ? "text-[#2f7d56]" : "text-[#d2861d]",
    }, ...items]);
    setNotice(`${payment.id} ${field} updated to ${value}.`);
  };

  const messagePaymentParties = (payment) => {
    notifyPaymentParties(payment, `Admin message for ${payment.id}`, `Admin reviewed payment ${payment.id} for ${payment.orderId}. Please check payment and payout details.`, "Normal");
    setNotice(`Customer and vendor notified for ${payment.id}.`);
  };

  const createPayment = () => {
    const payment = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      orderId: "ORD-New",
      customer: "New Customer",
      vendor: "Perera Artisan Works",
      amount: "LKR 0",
      method: "Card",
      status: "Pending",
      payout: "Not Ready",
      date: "Today",
      risk: "Low",
    };
    setPayments((items) => {
      const next = [payment, ...items];
      saveStoredList(adminPaymentsStorageKey, next);
      return next;
    });
    setNotice(`${payment.id} created as pending payment.`);
  };

  const recordAudit = (message) => {
    const entry = {
      id: `AUD-${Date.now()}`,
      message,
      actor: "Admin",
      time: new Date().toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" }),
    };
    setAuditLog((items) => {
      const next = [entry, ...items].slice(0, 12);
      saveStoredList(adminAuditLogStorageKey, next);
      return next;
    });
    setActivities((items) => [{
      icon: Settings,
      title: "System Setting Updated",
      detail: message,
      time: "Just now",
      tone: "text-[#104d3f]",
    }, ...items]);
    setNotice(message);
  };

  const updateSystemSetting = (field, value) => {
    setSystemSettings((current) => ({ ...current, [field]: value }));
  };

  const toggleSystemSetting = (field, label) => {
    const nextValue = !systemSettings[field];
    setSystemSettings((current) => ({ ...current, [field]: nextValue }));
    recordAudit(`${label} ${nextValue ? "enabled" : "disabled"}.`);
  };

  const saveSystemSettings = (event) => {
    event.preventDefault();
    try {
      localStorage.setItem(adminSystemSettingsStorageKey, JSON.stringify(systemSettings));
    } catch {}
    recordAudit("System settings saved.");
  };

  const resetSystemSettings = () => {
    setSystemSettings(systemSettingsSeed);
    try {
      localStorage.setItem(adminSystemSettingsStorageKey, JSON.stringify(systemSettingsSeed));
    } catch {}
    recordAudit("System settings reset to defaults.");
  };

  const exportSystemSettings = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), settings: systemSettings, auditLog }, null, 2);
    try {
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "woodverse-admin-system-settings.json";
      link.click();
      URL.revokeObjectURL(url);
      recordAudit("System settings export downloaded.");
    } catch {
      setNotice("System settings export is not available in this browser.");
    }
  };

  const testIntegration = (field, label) => {
    const nextStatus = field === "logisticsApi" ? "Active" : "Optimal";
    setSystemSettings((current) => ({ ...current, [field]: nextStatus }));
    recordAudit(`${label} connection tested and marked ${nextStatus}.`);
  };

  const updateAdminProfile = (field, value) => {
    setAdminProfile((current) => ({ ...current, [field]: value }));
  };

  const toggleAdminProfile = (field, label) => {
    const nextValue = !adminProfile[field];
    setAdminProfile((current) => ({ ...current, [field]: nextValue }));
    recordAudit(`${label} ${nextValue ? "enabled" : "disabled"} for admin profile.`);
  };

  const saveAdminProfile = (event) => {
    event.preventDefault();
    try {
      localStorage.setItem(adminProfileStorageKey, JSON.stringify(adminProfile));
    } catch {}
    recordAudit("Admin profile saved.");
  };

  const resetAdminProfile = () => {
    setAdminProfile(adminProfileSeed);
    try {
      localStorage.setItem(adminProfileStorageKey, JSON.stringify(adminProfileSeed));
    } catch {}
    recordAudit("Admin profile reset to defaults.");
  };

  const exportAdminProfile = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), profile: adminProfile }, null, 2);
    try {
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "woodverse-admin-profile.json";
      link.click();
      URL.revokeObjectURL(url);
      recordAudit("Admin profile export downloaded.");
    } catch {
      setNotice("Admin profile export is not available in this browser.");
    }
  };

  const requestAdminPasswordReset = () => {
    const request = {
      id: `APR-${Date.now()}`,
      email: adminProfile.email,
      requestedAt: new Date().toISOString(),
      status: "Sent",
    };
    appendStoredNotification("woodverse-admin-password-resets", request);
    recordAudit(`Password reset sent to ${adminProfile.email}.`);
  };

  const createDirectoryEntity = (section) => {
    const config = getDirectoryConfig(section);
    if (!config) return;
    const singular = section.slice(0, -1);
    const prefix = section === "Customers" ? "CUS" : section === "Vendors" ? "VEN" : "SUP";
    const entity = {
      id: `${prefix}-${Date.now().toString().slice(-4)}`,
      name: `New ${singular}`,
      email: `new.${singular.toLowerCase()}@woodverse.lk`,
      location: "Colombo",
      status: section === "Customers" ? "Active" : "Pending",
      orders: 0,
      value: "LKR 0",
      joined: "Today",
    };
    config.setItems((items) => {
      const next = [entity, ...items];
      saveStoredList(config.storageKey, next);
      return next;
    });
    setNotice(`${entity.name} created in ${section}.`);
  };

  const notifyEntity = (entity, title, message, priority = "High") => {
    const notification = {
      id: `AN-${Date.now()}-${entity.id}`,
      audience: entity.type,
      type: "Admin",
      source: "WoodVerse Admin",
      title,
      message,
      detail: message,
      priority,
      time: "Just now",
      createdAt: new Date().toISOString(),
    };
    if (entity.type === "Vendor") appendStoredNotification(vendorNotificationStorageKey, { ...notification, audience: "Admin" });
    if (entity.type === "Supplier") appendStoredNotification(supplierNotificationStorageKey, notification);
  };

  const approveEntity = (entity) => {
    const approvedEntity = { ...entity, status: "Approved", approvedAt: new Date().toISOString() };
    setApprovals((items) => items.map((item) => (item.id === entity.id ? approvedEntity : item)));
    if (entity.id.startsWith("APP-")) {
      saveStoredList(registrationApplicationsStorageKey, getStoredList(registrationApplicationsStorageKey).map((item) => item.id === entity.id ? { ...item, status: "Approved", approvedAt: approvedEntity.approvedAt } : item));
    }
    appendStoredNotification(approvedEntitiesStorageKey, approvedEntity);
    notifyEntity(entity, `${entity.type} account approved`, `${entity.name} has been approved by WoodVerse Admin. You can now continue portal operations.`, "High");
    setActivities((items) => [{
      icon: CheckCircle2,
      title: `${entity.type} Approved: ${entity.name}`,
      detail: `${entity.email} is now verified on WoodVerse.`,
      time: "Just now",
      tone: "text-[#2f7d56]",
    }, ...items]);
    setNotice(`${entity.name} approved and notification sent to ${entity.type}.`);
  };

  const openReviewEntity = (entity) => {
    setActiveReview(entity);
    setReviewNote("Please upload the missing verification documents and confirm business contact details.");
    setNotice(`Review panel opened for ${entity.name}.`);
  };

  const submitReviewEntity = (event) => {
    event.preventDefault();
    if (!reviewNote.trim()) {
      setNotice("Review note is required before sending review.");
      return;
    }
    const review = {
      id: `REV-${Date.now()}`,
      entityId: activeReview.id,
      entityName: activeReview.name,
      entityType: activeReview.type,
      note: reviewNote.trim(),
      status: "Review Requested",
      createdAt: new Date().toISOString(),
    };
    setApprovals((items) => items.map((item) => (item.id === activeReview.id ? { ...item, status: "Review Requested", reviewNote: review.note } : item)));
    if (activeReview.id.startsWith("APP-")) {
      saveStoredList(registrationApplicationsStorageKey, getStoredList(registrationApplicationsStorageKey).map((item) => item.id === activeReview.id ? { ...item, status: "Review Requested", reviewNote: review.note } : item));
    }
    appendStoredNotification(approvalReviewsStorageKey, review);
    notifyEntity(activeReview, `${activeReview.type} approval needs review`, review.note, "High");
    setActivities((items) => [{
      icon: AlertTriangle,
      title: `Review Requested: ${activeReview.name}`,
      detail: review.note,
      time: "Just now",
      tone: "text-[#d2861d]",
    }, ...items]);
    setNotice(`Review request sent to ${activeReview.name}.`);
    setActiveReview(null);
  };

  const refreshActivity = () => {
    const sharedEvents = getStoredList(adminNotificationStorageKey);
    setAdminNotifications(sharedEvents);
    const nextActivity = {
      icon: RefreshCw,
      title: "Admin activity refreshed",
      detail: `${sharedEvents.length} customer, vendor, and supplier events are now visible.`,
      time: "Just now",
      tone: "text-[#3c72a0]",
    };
    setActivities((items) => [nextActivity, ...items]);
    setNotice("Recent activity refreshed.");
  };

  const exportReport = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), dateRange: dateLabel, metrics: metricCards, approvals, activities }, null, 2);
    try {
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "woodverse-admin-platform-report.json";
      link.click();
      URL.revokeObjectURL(url);
      setNotice("Admin platform report exported.");
    } catch {
      setNotice("Admin report export is not available in this browser.");
    }
  };

  const changeDateRange = () => {
    setDateLabel((current) => (current === "Oct 24, 2023 - Today" ? "Last 30 Days" : "Oct 24, 2023 - Today"));
    setNotice("Dashboard date range changed.");
  };

  const createSupportTicket = () => {
    const ticket = { id: `AST-${Date.now()}`, subject: "Admin dashboard support request", status: "Open", createdAt: new Date().toISOString() };
    try {
      const existing = JSON.parse(localStorage.getItem("woodverse-admin-support-tickets") || "[]");
      localStorage.setItem("woodverse-admin-support-tickets", JSON.stringify([ticket, ...existing]));
    } catch {}
    setSupportOpen(false);
    setNotice(`Support ticket ${ticket.id} created.`);
  };

  const updateNotificationForm = (field, value) => {
    setNotificationForm((current) => ({ ...current, [field]: value }));
  };

  const sendAdminNotification = (event) => {
    event.preventDefault();
    if (!notificationForm.title.trim()) {
      setNotice("Notification title is required.");
      return;
    }
    if (!notificationForm.message.trim()) {
      setNotice("Notification message is required.");
      return;
    }

    const audiences = notificationForm.audience === "All" ? ["Customer", "Vendor", "Supplier"] : [notificationForm.audience];
    const sentAt = new Date().toISOString();
    const adminRecord = {
      id: `AN-${Date.now()}`,
      audiences,
      title: notificationForm.title.trim(),
      message: notificationForm.message.trim(),
      priority: notificationForm.priority,
      time: "Just now",
      createdAt: sentAt,
      status: "Sent",
    };

    audiences.forEach((audience) => {
      const notification = {
        id: `${adminRecord.id}-${audience.toLowerCase()}`,
        audience,
        type: "Admin",
        source: "WoodVerse Admin",
        title: adminRecord.title,
        message: adminRecord.message,
        detail: adminRecord.message,
        priority: adminRecord.priority,
        time: "Just now",
        createdAt: sentAt,
      };
      if (audience === "Customer") appendStoredNotification(customerNotificationStorageKey, notification);
      if (audience === "Vendor") appendStoredNotification(vendorNotificationStorageKey, { ...notification, audience: "Admin" });
      if (audience === "Supplier") appendStoredNotification(supplierNotificationStorageKey, notification);
    });

    const nextHistory = [adminRecord, ...adminNotifications];
    setAdminNotifications(nextHistory);
    saveStoredList(adminNotificationStorageKey, nextHistory);
    setActivities((items) => [{
      icon: Bell,
      title: `Admin notification sent to ${audiences.join(", ")}`,
      detail: adminRecord.title,
      time: "Just now",
      tone: "text-[#104d3f]",
    }, ...items]);
    setNotice(`Notification sent to ${audiences.join(", ")}.`);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] text-[#202621]">
      <header className="sticky top-0 z-20 grid min-h-20 gap-3 border-b border-[#d8d4cc] bg-white/95 px-5 py-3 backdrop-blur lg:grid-cols-[260px_minmax(0,1fr)_auto] lg:items-center">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 shrink-0 rounded-lg bg-[#102f27] bg-no-repeat" style={{ backgroundImage: "url('/assets/admin-vendor-logo.png')", backgroundSize: "500% auto", backgroundPosition: "25% 35%" }} aria-hidden="true" />
          <strong className="text-lg text-[#104d3f]">WoodVerse Admin</strong>
        </div>
        <label className="flex min-h-11 max-w-[520px] items-center rounded-full bg-[#f0ebe3] px-4 text-[#66716b]">
          <Search className="h-5 w-5 shrink-0" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search operations..." />
        </label>
        <div className="flex items-center gap-3">
          <button onClick={() => setNotificationOpen(true)} className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-[#f0ebe3]" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#d24b53] px-1 text-[10px] font-extrabold text-white">{adminNotifications.length}</span>
          </button>
          <button onClick={() => { setActiveNav("System Settings"); setNotice("System settings opened from header."); }} className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#f0ebe3]" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </button>
          <button onClick={() => { setActiveNav("Admin Profile"); setNotice("Admin profile opened."); }} className="flex min-h-12 items-center gap-3 rounded-full border border-[#c6cdc8] bg-white px-4 text-sm font-semibold">
            Admin
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#104d3f] text-white"><Users className="h-5 w-5" /></span>
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="grid content-between border-r border-[#d8d4cc] bg-[#f0ebe3] px-4 py-8 lg:min-h-[calc(100vh-80px)]">
          <div>
            <div className="mb-8 px-2">
              <h1 className="text-2xl font-extrabold text-[#104d3f]">WoodVerse ERP</h1>
              <p className="text-sm font-semibold text-[#4f5853]">Enterprise Console</p>
            </div>
            <nav className="grid gap-2">
              {adminNavItems.map(([Icon, label]) => (
                <button key={label} onClick={() => openSection(label)} className={`flex min-h-11 items-center gap-3 rounded-lg px-4 text-left text-sm font-extrabold transition ${activeNav === label ? "bg-[#104d3f] text-white" : "text-[#3d4541] hover:bg-white"}`}>
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <div className="grid gap-2 border-t border-[#d8d4cc] pt-5">
            <button onClick={() => setSupportOpen(true)} className="flex min-h-11 items-center gap-3 rounded-lg px-4 text-sm font-extrabold text-[#3d4541] hover:bg-white"><HelpCircle className="h-5 w-5" />Help Center</button>
            <button onClick={() => setNotice("Admin logged out from console.")} className="flex min-h-11 items-center gap-3 rounded-lg px-4 text-sm font-extrabold text-[#d24b53] hover:bg-white"><LogOut className="h-5 w-5" />Logout</button>
          </div>
        </aside>

        <section className="min-w-0 px-5 py-6 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-[1280px] gap-7">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div>
                <h2 className="text-3xl font-extrabold tracking-normal text-[#104d3f]">Overview Dashboard</h2>
                <p className="mt-1 text-base text-[#4f5853]">Real-time enterprise intelligence and operational status.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={changeDateRange} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#c6cdc8] bg-[#edf0ed] px-4 text-sm font-bold text-[#3d4541]">
                  <Calendar className="h-4 w-4" />
                  {dateLabel}
                </button>
                <button onClick={exportReport} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
                  <Download className="h-4 w-4" />
                  Export Report
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[#c6cdc8] bg-white px-4 py-3 text-sm font-semibold text-[#104d3f] shadow-sm">{notice}</div>

            {activeNav === "Dashboard" ? (
              <>
                <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-6">
                  {metricCards.map((card) => <AdminMetricCard key={card.label} {...card} />)}
                </section>

                <section className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_290px]">
                  <div className="grid content-start gap-7">
                    <AdminPanel title="Pending Approvals" detail="New entities awaiting verification" action="View All" onAction={openApprovalManager}>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[680px] text-left text-sm">
                          <thead className="bg-[#f3eee6] text-xs font-extrabold uppercase text-[#56605b]">
                            <tr><th className="px-6 py-4">Entity Name</th><th className="px-4 py-4">Type</th><th className="px-4 py-4">Requested On</th><th className="px-4 py-4">Status</th><th className="px-6 py-4">Actions</th></tr>
                          </thead>
                          <tbody className="divide-y divide-[#e2ded7]">
                            {visibleApprovals.map((item) => (
                              <tr key={item.id}>
                                <td className="px-6 py-4">
                                  <span className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3">
                                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#ffd7bd] font-extrabold text-[#202621]">{item.initials}</span>
                                    <span><strong className="block">{item.name}</strong><span className="text-xs font-semibold text-[#4f5853]">{item.email}</span></span>
                                  </span>
                                </td>
                                <td className="px-4 py-4"><span className="rounded px-2 py-1 text-xs font-extrabold uppercase text-[#104d3f] bg-[#bfe6d7]">{item.type}</span></td>
                                <td className="px-4 py-4 text-[#4f5853]">{item.requested}</td>
                                <td className="px-4 py-4"><span className="font-bold text-[#d2861d]">• {item.status}</span></td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2">
                                    <button onClick={() => approveEntity(item)} disabled={item.status === "Approved"} className="min-h-9 rounded-lg bg-[#104d3f] px-3 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:bg-[#c6cdc8]">Approve</button>
                                    <button onClick={() => openReviewEntity(item)} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Review</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {visibleApprovals.length === 0 && <p className="p-5 text-sm font-semibold text-[#66716b]">No approvals match your search.</p>}
                      </div>
                    </AdminPanel>

                    <AdminPanel title="Regional Sales Performance" detail="Volume comparison across Sri Lankan provinces">
                      <div className="grid h-56 grid-cols-5 items-end gap-4 px-6 pt-8">
                        {provinceSales.map(([province, value]) => (
                          <div key={province} className="grid h-full content-end gap-2">
                            <div className="flex h-40 items-end rounded-t-lg bg-[#e7ecea]">
                              <div className="w-full rounded-t-lg bg-[#104d3f]" style={{ height: `${value}%` }} />
                            </div>
                            <span className="text-center text-xs font-extrabold text-[#4f5853]">{province}</span>
                          </div>
                        ))}
                      </div>
                    </AdminPanel>
                  </div>

                  <aside className="grid content-start gap-7">
                    <section className="rounded-xl bg-[#104d3f] p-6 text-white shadow-xl shadow-[#104d3f]/20">
                      <div className="mb-6 flex items-center gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-lg bg-white/15"><Boxes className="h-5 w-5" /></span>
                        <h3 className="text-xl font-extrabold">System Health</h3>
                      </div>
                      <HealthLine label="Inventory Sync" status="Optimal" value={94} tone="bg-[#cbead6]" />
                      <HealthLine label="Payment Gateway" status="Active" value={100} tone="bg-white" />
                      <HealthLine label="Logistics API" status="Delay" value={66} tone="bg-[#f0a12f]" />
                      <p className="mt-6 rounded-lg border border-white/15 bg-white/10 p-4 text-sm font-semibold italic leading-relaxed text-white/80">Next scheduled maintenance in 14 hours. No downtime expected.</p>
                    </section>

                    <section className="rounded-xl border border-[#c6cdc8] bg-white p-6 shadow-sm">
                      <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-xl font-extrabold text-[#104d3f]">Recent Activity</h3>
                        <button onClick={refreshActivity} className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#f0ebe3]" aria-label="Refresh activity"><RefreshCw className="h-5 w-5" /></button>
                      </div>
                      <div className="grid gap-5">
                        {visibleActivities.map((item, index) => <ActivityItem key={`${item.title}-${index}`} item={item} />)}
                      </div>
                      <button onClick={() => { setShowAllActivities((value) => !value); setNotice(showAllActivities ? "Showing latest activity." : "Showing all activity."); }} className="mt-7 min-h-11 w-full rounded-lg border border-[#c6cdc8] bg-white text-sm font-extrabold text-[#3d4541]">
                        {showAllActivities ? "Show Latest Activity" : "View All Activity"}
                      </button>
                    </section>

                    <section className="rounded-xl border border-[#d8d4cc] bg-[#ede7dd] p-6">
                      <h3 className="text-xl font-extrabold text-[#8b5633]">Need Assistance?</h3>
                      <p className="mt-3 text-sm leading-relaxed text-[#4f5853]">Our dedicated ERP support team is available for enterprise-level troubleshooting.</p>
                      <button onClick={() => setSupportOpen(true)} className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#104d3f]">Open Support Ticket <ChevronRight className="h-4 w-4" /></button>
                    </section>
                  </aside>
                </section>
              </>
            ) : getDirectoryConfig(activeNav) ? (
              <AdminDirectoryPage
                section={activeNav}
                config={getDirectoryConfig(activeNav)}
                onStatus={updateDirectoryStatus}
                onMessage={messageDirectoryEntity}
                onCreate={createDirectoryEntity}
              />
            ) : activeNav === "Products" ? (
              <AdminProductsPage
                products={products}
                onCreate={createProduct}
                onStatus={updateProductStatus}
                onFeature={toggleProductFeatured}
                onRestock={restockProduct}
                onMessage={messageProductVendor}
              />
            ) : activeNav === "Orders" ? (
              <AdminOrdersPage
                orders={orders}
                onCreate={createOrder}
                onUpdate={updateOrderField}
                onMessage={messageOrderParties}
              />
            ) : activeNav === "Categories" ? (
              <AdminCategoriesPage
                categories={categories}
                onCreate={createCategory}
                onUpdate={updateCategoryField}
                onMove={moveCategory}
              />
            ) : activeNav === "Payments" ? (
              <AdminPaymentsPage
                payments={payments}
                onCreate={createPayment}
                onUpdate={updatePaymentField}
                onMessage={messagePaymentParties}
              />
            ) : activeNav === "System Settings" ? (
              <AdminSystemSettingsPage
                settings={systemSettings}
                auditLog={auditLog}
                onChange={updateSystemSetting}
                onToggle={toggleSystemSetting}
                onSave={saveSystemSettings}
                onReset={resetSystemSettings}
                onExport={exportSystemSettings}
                onTest={testIntegration}
              />
            ) : activeNav === "Admin Profile" ? (
              <AdminProfilePage
                profile={adminProfile}
                auditLog={auditLog}
                onChange={updateAdminProfile}
                onToggle={toggleAdminProfile}
                onSave={saveAdminProfile}
                onReset={resetAdminProfile}
                onExport={exportAdminProfile}
                onPasswordReset={requestAdminPasswordReset}
              />
            ) : (
              <AdminComingSoonPage section={activeNav} onCreate={() => setNotice(`${activeNav} setup task created for admin.`)} />
            )}
          </div>
        </section>
      </div>

      <button onClick={() => setSupportOpen(true)} className="fixed bottom-8 right-8 grid h-16 w-16 place-items-center rounded-full bg-[#104d3f] text-white shadow-xl" aria-label="Create admin item">
        <Plus className="h-8 w-8" />
      </button>

      {supportOpen && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/35 px-4">
          <section className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#104d3f]">Admin Support Ticket</h3>
                <p className="mt-1 text-sm text-[#66716b]">Create a platform support request for the ERP team.</p>
              </div>
              <button onClick={() => setSupportOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-[#f3eee6]" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 grid gap-3">
              <label className="grid gap-2 text-sm font-bold text-[#3d4541]">Subject<input value="Admin dashboard support request" readOnly className="min-h-11 rounded-lg border border-[#c6cdc8] bg-[#f8f4ec] px-3" /></label>
              <button onClick={createSupportTicket} className="min-h-11 rounded-lg bg-[#104d3f] text-sm font-extrabold text-white">Create Ticket</button>
            </div>
          </section>
        </div>
      )}

      {notificationOpen && (
        <AdminNotificationModal
          form={notificationForm}
          notifications={adminNotifications}
          onChange={updateNotificationForm}
          onClose={() => setNotificationOpen(false)}
          onSend={sendAdminNotification}
        />
      )}

      {approvalManagerOpen && (
        <ApprovalManagerModal
          approvals={approvals}
          onApprove={approveEntity}
          onReview={openReviewEntity}
          onClose={() => setApprovalManagerOpen(false)}
        />
      )}

      {activeReview && (
        <ApprovalReviewModal
          entity={activeReview}
          note={reviewNote}
          onChange={setReviewNote}
          onClose={() => setActiveReview(null)}
          onSubmit={submitReviewEntity}
        />
      )}
    </main>
  );
}

function AdminDirectoryPage({ section, config, onStatus, onMessage, onCreate }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const Icon = config.icon;
  const statuses = section === "Customers" ? ["Active", "Watch", "Suspended"] : ["Verified", "Pending", "Review", "Suspended"];
  const filteredItems = config.items.filter((item) => {
    const matchesQuery = `${item.id} ${item.name} ${item.email} ${item.location} ${item.status}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesQuery && matchesStatus;
  });
  const activeCount = config.items.filter((item) => ["Active", "Verified"].includes(item.status)).length;
  const reviewCount = config.items.filter((item) => ["Watch", "Review", "Pending"].includes(item.status)).length;
  const totalValue = config.items.reduce((sum, item) => sum + parseDirectoryValue(item.value), 0);

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-[#104d3f]">{section}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#66716b]">
            Manage {section.toLowerCase()} records, account state, admin messages, and operational value.
          </p>
        </div>
        <button onClick={() => onCreate(section)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
          <Plus className="h-4 w-4" />
          Create {section.slice(0, -1)}
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <DirectoryStat icon={Icon} label={`Total ${section}`} value={String(config.items.length)} />
        <DirectoryStat icon={CheckCircle2} label="Active / Verified" value={String(activeCount)} />
        <DirectoryStat icon={AlertTriangle} label="Needs Review" value={String(reviewCount)} warning />
        <DirectoryStat icon={WalletCards} label="Total Value" value={`LKR ${totalValue.toLocaleString("en-US")}`} />
      </section>

      <section className="overflow-hidden rounded-xl border border-[#c6cdc8] bg-white shadow-sm">
        <div className="grid gap-3 border-b border-[#d8d4cc] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
          <label className="flex min-h-11 items-center rounded-lg border border-[#c6cdc8] bg-white px-3 text-[#66716b]">
            <Search className="h-4 w-4 shrink-0" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder={`Search ${section.toLowerCase()}...`} />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            <option>All</option>
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-[#f3eee6] text-xs font-extrabold uppercase text-[#56605b]">
              <tr><th className="px-5 py-4">Name</th><th className="px-4 py-4">Location</th><th className="px-4 py-4">Orders</th><th className="px-4 py-4">Value</th><th className="px-4 py-4">Status</th><th className="px-5 py-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-[#e2ded7]">
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4">
                    <span className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#d9ecd8] font-extrabold text-[#104d3f]">{getDirectoryInitials(item.name)}</span>
                      <span>
                        <strong className="block text-[#202621]">{item.name}</strong>
                        <span className="text-xs font-semibold text-[#66716b]">{item.id} - {item.email}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#4f5853]">{item.location}</td>
                  <td className="px-4 py-4 font-extrabold">{item.orders}</td>
                  <td className="px-4 py-4 font-extrabold">{item.value}</td>
                  <td className="px-4 py-4"><ApprovalStatusBadge status={item.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {statuses.map((status) => (
                        <button key={status} onClick={() => onStatus(section, item, status)} disabled={item.status === status} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541] disabled:cursor-not-allowed disabled:bg-[#e9e4dc]">
                          {status}
                        </button>
                      ))}
                      <button onClick={() => onMessage(section, item)} className="min-h-9 rounded-lg bg-[#104d3f] px-3 text-xs font-extrabold text-white">Message</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && <p className="p-5 text-sm font-semibold text-[#66716b]">No {section.toLowerCase()} match this filter.</p>}
        </div>
      </section>
    </section>
  );
}

function AdminProductsPage({ products, onCreate, onStatus, onFeature, onRestock, onMessage }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const statuses = ["Draft", "Pending Review", "Published", "Stock Hold", "Archived", "Rejected"];
  const categories = ["All", ...Array.from(new Set(products.map((product) => product.category)))];
  const filteredProducts = products.filter((product) => {
    const text = `${product.id} ${product.name} ${product.vendor} ${product.category} ${product.status}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || product.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    return matchesQuery && matchesStatus && matchesCategory;
  });
  const publishedCount = products.filter((product) => product.status === "Published").length;
  const reviewCount = products.filter((product) => product.status === "Pending Review").length;
  const stockHoldCount = products.filter((product) => Number(product.stock) <= 0 || product.status === "Stock Hold").length;
  const totalSales = products.reduce((sum, product) => sum + Number(product.sales || 0), 0);

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-[#104d3f]">Products</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#66716b]">
            Manage marketplace catalog listings, vendor product approvals, stock holds, featured products, and product notifications.
          </p>
        </div>
        <button onClick={onCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
          <Plus className="h-4 w-4" />
          Create Product
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <DirectoryStat icon={Package} label="Total Products" value={String(products.length)} />
        <DirectoryStat icon={CheckCircle2} label="Published" value={String(publishedCount)} />
        <DirectoryStat icon={AlertTriangle} label="Needs Review" value={String(reviewCount)} warning />
        <DirectoryStat icon={ShoppingCart} label="Total Sales" value={String(totalSales)} />
      </section>

      {stockHoldCount > 0 && (
        <div className="rounded-lg border border-[#f0c46f] bg-[#fff8e8] px-4 py-3 text-sm font-bold text-[#8b5633]">
          {stockHoldCount} product{stockHoldCount === 1 ? "" : "s"} need stock attention before reliable marketplace selling.
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-[#c6cdc8] bg-white shadow-sm">
        <div className="grid gap-3 border-b border-[#d8d4cc] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_200px_200px] lg:items-center">
          <label className="flex min-h-11 items-center rounded-lg border border-[#c6cdc8] bg-white px-3 text-[#66716b]">
            <Search className="h-4 w-4 shrink-0" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search products, vendors, categories..." />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            <option>All</option>
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-[#f3eee6] text-xs font-extrabold uppercase text-[#56605b]">
              <tr><th className="px-5 py-4">Product</th><th className="px-4 py-4">Vendor</th><th className="px-4 py-4">Price</th><th className="px-4 py-4">Stock</th><th className="px-4 py-4">Status</th><th className="px-5 py-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-[#e2ded7]">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-4">
                    <span className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#e9f2ed] text-[#104d3f]"><Package className="h-5 w-5" /></span>
                      <span>
                        <strong className="block text-[#202621]">{product.name}</strong>
                        <span className="text-xs font-semibold text-[#66716b]">{product.id} - {product.category} - Submitted {product.submitted}</span>
                        {product.featured && <span className="mt-1 inline-flex rounded-full bg-[#fff0cd] px-2 py-1 text-[10px] font-extrabold uppercase text-[#8b5633]">Featured</span>}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#4f5853]">{product.vendor}</td>
                  <td className="px-4 py-4 font-extrabold">{product.price}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${Number(product.stock) <= 0 ? "bg-[#ffe1df] text-[#b83f47]" : Number(product.stock) < 10 ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#d9ecd8] text-[#104d3f]"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-4"><ApprovalStatusBadge status={product.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => onStatus(product, "Published")} disabled={product.status === "Published"} className="min-h-9 rounded-lg bg-[#104d3f] px-3 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:bg-[#c6cdc8]">Approve</button>
                      <button onClick={() => onStatus(product, "Pending Review")} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Review</button>
                      <button onClick={() => onFeature(product)} className="min-h-9 rounded-lg bg-[#fff0cd] px-3 text-xs font-extrabold text-[#8b5633]">{product.featured ? "Unfeature" : "Feature"}</button>
                      <button onClick={() => onRestock(product)} className="min-h-9 rounded-lg bg-[#d9ecd8] px-3 text-xs font-extrabold text-[#104d3f]">Restock</button>
                      <button onClick={() => onStatus(product, "Archived")} className="min-h-9 rounded-lg bg-[#e9e4dc] px-3 text-xs font-extrabold text-[#3d4541]">Archive</button>
                      <button onClick={() => onMessage(product)} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Message Vendor</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && <p className="p-5 text-sm font-semibold text-[#66716b]">No products match this filter.</p>}
        </div>
      </section>
    </section>
  );
}

function AdminOrdersPage({ orders, onCreate, onUpdate, onMessage }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const statuses = ["Vendor Approval", "Processing", "Ready for Delivery", "Completed", "Refund Review", "Cancelled"];
  const payments = ["Pending", "Authorized", "Paid", "Refund Requested", "Refunded"];
  const filteredOrders = orders.filter((order) => {
    const text = `${order.id} ${order.customer} ${order.vendor} ${order.product} ${order.status} ${order.payment}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    const matchesPayment = paymentFilter === "All" || order.payment === paymentFilter;
    return matchesQuery && matchesStatus && matchesPayment;
  });
  const totalValue = orders.reduce((sum, order) => sum + parseDirectoryValue(order.amount), 0);
  const activeCount = orders.filter((order) => !["Completed", "Cancelled"].includes(order.status)).length;
  const refundCount = orders.filter((order) => order.status === "Refund Review" || order.payment === "Refund Requested").length;
  const completedCount = orders.filter((order) => order.status === "Completed").length;

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-[#104d3f]">Orders</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#66716b]">
            Manage customer orders across vendor approval, production, payment, delivery, completion, cancellation, and refund review.
          </p>
        </div>
        <button onClick={onCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
          <Plus className="h-4 w-4" />
          Create Order
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <DirectoryStat icon={ShoppingCart} label="Total Orders" value={String(orders.length)} />
        <DirectoryStat icon={Clock3} label="Active Orders" value={String(activeCount)} />
        <DirectoryStat icon={AlertTriangle} label="Refund Review" value={String(refundCount)} warning />
        <DirectoryStat icon={WalletCards} label="Order Value" value={`LKR ${totalValue.toLocaleString("en-US")}`} />
      </section>

      <section className="overflow-hidden rounded-xl border border-[#c6cdc8] bg-white shadow-sm">
        <div className="grid gap-3 border-b border-[#d8d4cc] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_210px_210px] lg:items-center">
          <label className="flex min-h-11 items-center rounded-lg border border-[#c6cdc8] bg-white px-3 text-[#66716b]">
            <Search className="h-4 w-4 shrink-0" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search orders, customers, vendors..." />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            <option>All</option>
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
          <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            <option>All</option>
            {payments.map((payment) => <option key={payment}>{payment}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-[#f3eee6] text-xs font-extrabold uppercase text-[#56605b]">
              <tr><th className="px-5 py-4">Order</th><th className="px-4 py-4">Customer</th><th className="px-4 py-4">Vendor</th><th className="px-4 py-4">Amount</th><th className="px-4 py-4">Payment</th><th className="px-4 py-4">Status</th><th className="px-5 py-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-[#e2ded7]">
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-5 py-4">
                    <strong className="block text-[#202621]">{order.id}</strong>
                    <span className="text-xs font-semibold text-[#66716b]">{order.product} - {order.date}</span>
                    <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-extrabold uppercase ${order.priority === "Urgent" ? "bg-[#ffe1df] text-[#b83f47]" : order.priority === "High" ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#e9f2ed] text-[#104d3f]"}`}>{order.priority}</span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#4f5853]">{order.customer}</td>
                  <td className="px-4 py-4 font-semibold text-[#4f5853]">{order.vendor}</td>
                  <td className="px-4 py-4 font-extrabold">{order.amount}</td>
                  <td className="px-4 py-4"><ApprovalStatusBadge status={order.payment} /></td>
                  <td className="px-4 py-4"><ApprovalStatusBadge status={order.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => onUpdate(order, "status", "Processing")} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Process</button>
                      <button onClick={() => onUpdate(order, "status", "Ready for Delivery")} className="min-h-9 rounded-lg bg-[#d9ecd8] px-3 text-xs font-extrabold text-[#104d3f]">Ready</button>
                      <button onClick={() => onUpdate(order, "status", "Completed")} className="min-h-9 rounded-lg bg-[#104d3f] px-3 text-xs font-extrabold text-white">Complete</button>
                      <button onClick={() => onUpdate(order, "payment", "Paid")} className="min-h-9 rounded-lg bg-[#fff0cd] px-3 text-xs font-extrabold text-[#8b5633]">Mark Paid</button>
                      <button onClick={() => onUpdate(order, "status", "Refund Review")} className="min-h-9 rounded-lg border border-[#f0c46f] bg-white px-3 text-xs font-extrabold text-[#8b5633]">Refund</button>
                      <button onClick={() => onUpdate(order, "status", "Cancelled")} className="min-h-9 rounded-lg bg-[#ffe1df] px-3 text-xs font-extrabold text-[#b83f47]">Cancel</button>
                      <button onClick={() => onMessage(order)} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Notify</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && <p className="p-5 text-sm font-semibold text-[#66716b]">No orders match this filter.</p>}
        </div>
      </section>

      <div className="rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] px-4 py-3 text-sm font-semibold text-[#66716b]">
        Completed orders: {completedCount}. Admin updates notify both the customer and vendor.
      </div>
    </section>
  );
}

function AdminCategoriesPage({ categories, onCreate, onUpdate, onMove }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [parentFilter, setParentFilter] = useState("All");
  const parents = ["All", ...Array.from(new Set(categories.map((category) => category.parent)))];
  const filteredCategories = categories
    .slice()
    .sort((a, b) => Number(a.order) - Number(b.order))
    .filter((category) => {
      const text = `${category.id} ${category.name} ${category.parent} ${category.status}`.toLowerCase();
      const matchesQuery = text.includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || category.status === statusFilter;
      const matchesParent = parentFilter === "All" || category.parent === parentFilter;
      return matchesQuery && matchesStatus && matchesParent;
    });
  const visibleCount = categories.filter((category) => category.status === "Visible").length;
  const hiddenCount = categories.filter((category) => category.status === "Hidden").length;
  const featuredCount = categories.filter((category) => category.featured).length;
  const totalProducts = categories.reduce((sum, category) => sum + Number(category.products || 0), 0);

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-[#104d3f]">Categories</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#66716b]">
            Manage marketplace category visibility, parent grouping, display order, commission, and featured sections.
          </p>
        </div>
        <button onClick={onCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
          <Plus className="h-4 w-4" />
          Create Category
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <DirectoryStat icon={Grid2X2} label="Total Categories" value={String(categories.length)} />
        <DirectoryStat icon={CheckCircle2} label="Visible" value={String(visibleCount)} />
        <DirectoryStat icon={AlertTriangle} label="Hidden" value={String(hiddenCount)} warning />
        <DirectoryStat icon={Package} label="Linked Products" value={String(totalProducts)} />
      </section>

      <section className="overflow-hidden rounded-xl border border-[#c6cdc8] bg-white shadow-sm">
        <div className="grid gap-3 border-b border-[#d8d4cc] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_180px_180px] lg:items-center">
          <label className="flex min-h-11 items-center rounded-lg border border-[#c6cdc8] bg-white px-3 text-[#66716b]">
            <Search className="h-4 w-4 shrink-0" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search categories..." />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            <option>All</option>
            <option>Visible</option>
            <option>Hidden</option>
          </select>
          <select value={parentFilter} onChange={(event) => setParentFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            {parents.map((parent) => <option key={parent}>{parent}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead className="bg-[#f3eee6] text-xs font-extrabold uppercase text-[#56605b]">
              <tr><th className="px-5 py-4">Category</th><th className="px-4 py-4">Parent</th><th className="px-4 py-4">Products</th><th className="px-4 py-4">Vendors</th><th className="px-4 py-4">Commission</th><th className="px-4 py-4">Status</th><th className="px-5 py-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-[#e2ded7]">
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td className="px-5 py-4">
                    <span className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#e9f2ed] text-[#104d3f]"><Grid2X2 className="h-5 w-5" /></span>
                      <span>
                        <strong className="block text-[#202621]">{category.name}</strong>
                        <span className="text-xs font-semibold text-[#66716b]">{category.id} - Display order {category.order}</span>
                        {category.featured && <span className="mt-1 inline-flex rounded-full bg-[#fff0cd] px-2 py-1 text-[10px] font-extrabold uppercase text-[#8b5633]">Featured</span>}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#4f5853]">{category.parent}</td>
                  <td className="px-4 py-4 font-extrabold">{category.products}</td>
                  <td className="px-4 py-4 font-extrabold">{category.vendors}</td>
                  <td className="px-4 py-4 font-extrabold">{category.commission}</td>
                  <td className="px-4 py-4"><ApprovalStatusBadge status={category.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => onUpdate(category, "status", "Visible")} disabled={category.status === "Visible"} className="min-h-9 rounded-lg bg-[#104d3f] px-3 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:bg-[#c6cdc8]">Show</button>
                      <button onClick={() => onUpdate(category, "status", "Hidden")} disabled={category.status === "Hidden"} className="min-h-9 rounded-lg bg-[#e9e4dc] px-3 text-xs font-extrabold text-[#3d4541] disabled:cursor-not-allowed disabled:bg-[#c6cdc8]">Hide</button>
                      <button onClick={() => onUpdate(category, "featured", !category.featured)} className="min-h-9 rounded-lg bg-[#fff0cd] px-3 text-xs font-extrabold text-[#8b5633]">{category.featured ? "Unfeature" : "Feature"}</button>
                      <button onClick={() => onMove(category, -1)} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Move Up</button>
                      <button onClick={() => onMove(category, 1)} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Move Down</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCategories.length === 0 && <p className="p-5 text-sm font-semibold text-[#66716b]">No categories match this filter.</p>}
        </div>
      </section>

      <div className="rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] px-4 py-3 text-sm font-semibold text-[#66716b]">
        Featured categories: {featuredCount}. Visible categories are shown in customer marketplace navigation.
      </div>
    </section>
  );
}

function AdminPaymentsPage({ payments, onCreate, onUpdate, onMessage }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [payoutFilter, setPayoutFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const statuses = ["Pending", "Authorized", "Settled", "Refund Requested", "Refunded", "Failed"];
  const payouts = ["Not Ready", "Hold", "Released", "Blocked"];
  const risks = ["Low", "Medium", "High"];
  const filteredPayments = payments.filter((payment) => {
    const text = `${payment.id} ${payment.orderId} ${payment.customer} ${payment.vendor} ${payment.status} ${payment.payout}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || payment.status === statusFilter;
    const matchesPayout = payoutFilter === "All" || payment.payout === payoutFilter;
    const matchesRisk = riskFilter === "All" || payment.risk === riskFilter;
    return matchesQuery && matchesStatus && matchesPayout && matchesRisk;
  });
  const totalValue = payments.reduce((sum, payment) => sum + parseDirectoryValue(payment.amount), 0);
  const settledValue = payments.filter((payment) => payment.status === "Settled").reduce((sum, payment) => sum + parseDirectoryValue(payment.amount), 0);
  const refundCount = payments.filter((payment) => payment.status === "Refund Requested" || payment.status === "Refunded").length;
  const payoutHoldCount = payments.filter((payment) => payment.payout === "Hold" || payment.payout === "Blocked").length;

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-[#104d3f]">Payments</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#66716b]">
            Manage customer payments, vendor payouts, refunds, payment risk, and settlement status across the marketplace.
          </p>
        </div>
        <button onClick={onCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
          <Plus className="h-4 w-4" />
          Create Payment
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <DirectoryStat icon={WalletCards} label="Total Volume" value={`LKR ${totalValue.toLocaleString("en-US")}`} />
        <DirectoryStat icon={CheckCircle2} label="Settled Volume" value={`LKR ${settledValue.toLocaleString("en-US")}`} />
        <DirectoryStat icon={AlertTriangle} label="Refunds" value={String(refundCount)} warning />
        <DirectoryStat icon={Clock3} label="Payout Holds" value={String(payoutHoldCount)} warning={payoutHoldCount > 0} />
      </section>

      <section className="overflow-hidden rounded-xl border border-[#c6cdc8] bg-white shadow-sm">
        <div className="grid gap-3 border-b border-[#d8d4cc] px-5 py-5 xl:grid-cols-[minmax(0,1fr)_190px_170px_150px] xl:items-center">
          <label className="flex min-h-11 items-center rounded-lg border border-[#c6cdc8] bg-white px-3 text-[#66716b]">
            <Search className="h-4 w-4 shrink-0" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search payment, order, customer, vendor..." />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            <option>All</option>
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
          <select value={payoutFilter} onChange={(event) => setPayoutFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            <option>All</option>
            {payouts.map((payout) => <option key={payout}>{payout}</option>)}
          </select>
          <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
            <option>All</option>
            {risks.map((risk) => <option key={risk}>{risk}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-[#f3eee6] text-xs font-extrabold uppercase text-[#56605b]">
              <tr><th className="px-5 py-4">Payment</th><th className="px-4 py-4">Customer</th><th className="px-4 py-4">Vendor</th><th className="px-4 py-4">Amount</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Payout</th><th className="px-5 py-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-[#e2ded7]">
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-5 py-4">
                    <strong className="block text-[#202621]">{payment.id}</strong>
                    <span className="text-xs font-semibold text-[#66716b]">{payment.orderId} - {payment.method} - {payment.date}</span>
                    <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-extrabold uppercase ${payment.risk === "High" ? "bg-[#ffe1df] text-[#b83f47]" : payment.risk === "Medium" ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#e9f2ed] text-[#104d3f]"}`}>{payment.risk} risk</span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#4f5853]">{payment.customer}</td>
                  <td className="px-4 py-4 font-semibold text-[#4f5853]">{payment.vendor}</td>
                  <td className="px-4 py-4 font-extrabold">{payment.amount}</td>
                  <td className="px-4 py-4"><ApprovalStatusBadge status={payment.status} /></td>
                  <td className="px-4 py-4"><ApprovalStatusBadge status={payment.payout} /></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => onUpdate(payment, "status", "Authorized")} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Authorize</button>
                      <button onClick={() => onUpdate(payment, "status", "Settled")} className="min-h-9 rounded-lg bg-[#104d3f] px-3 text-xs font-extrabold text-white">Settle</button>
                      <button onClick={() => onUpdate(payment, "payout", "Released")} className="min-h-9 rounded-lg bg-[#d9ecd8] px-3 text-xs font-extrabold text-[#104d3f]">Release Payout</button>
                      <button onClick={() => onUpdate(payment, "payout", "Hold")} className="min-h-9 rounded-lg bg-[#fff0cd] px-3 text-xs font-extrabold text-[#8b5633]">Hold</button>
                      <button onClick={() => onUpdate(payment, "status", "Refunded")} className="min-h-9 rounded-lg bg-[#ffe1df] px-3 text-xs font-extrabold text-[#b83f47]">Refund</button>
                      <button onClick={() => onMessage(payment)} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Notify</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && <p className="p-5 text-sm font-semibold text-[#66716b]">No payments match this filter.</p>}
        </div>
      </section>

      <div className="rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] px-4 py-3 text-sm font-semibold text-[#66716b]">
        Payment updates notify the customer and the related vendor payout queue.
      </div>
    </section>
  );
}

function AdminSystemSettingsPage({ settings, auditLog, onChange, onToggle, onSave, onReset, onExport, onTest }) {
  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-[#104d3f]">System Settings</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#66716b]">
            Configure platform identity, security rules, registration access, payment controls, integrations, and audit tracking.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={onExport} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c6cdc8] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button onClick={onReset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#e9e4dc] px-4 text-sm font-extrabold text-[#3d4541]">
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <DirectoryStat icon={Settings} label="Payment Gateway" value={settings.paymentGateway} />
        <DirectoryStat icon={Boxes} label="Inventory Sync" value={settings.inventorySync} />
        <DirectoryStat icon={Truck} label="Logistics API" value={settings.logisticsApi} warning={settings.logisticsApi !== "Active"} />
        <DirectoryStat icon={AlertTriangle} label="Maintenance" value={settings.maintenanceMode ? "On" : "Off"} warning={settings.maintenanceMode} />
      </section>

      <form onSubmit={onSave} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <SettingsSection title="Platform Profile" detail="Core identity and operating defaults.">
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminSettingInput label="Platform Name" value={settings.platformName} onChange={(value) => onChange("platformName", value)} />
              <AdminSettingInput label="Support Email" value={settings.supportEmail} onChange={(value) => onChange("supportEmail", value)} />
              <AdminSettingSelect label="Default Currency" value={settings.defaultCurrency} options={["LKR", "USD", "EUR"]} onChange={(value) => onChange("defaultCurrency", value)} />
              <AdminSettingSelect label="Timezone" value={settings.timezone} options={["Asia/Colombo", "UTC", "Asia/Dubai"]} onChange={(value) => onChange("timezone", value)} />
              <AdminSettingInput label="Refund Review Threshold" type="number" value={settings.refundReviewThreshold} onChange={(value) => onChange("refundReviewThreshold", value)} />
              <AdminSettingInput label="Session Timeout Minutes" type="number" value={settings.sessionTimeout} onChange={(value) => onChange("sessionTimeout", value)} />
            </div>
          </SettingsSection>

          <SettingsSection title="Access And Verification" detail="Control who can enter the platform and what must be reviewed.">
            <div className="grid gap-3">
              <AdminSettingToggle title="Maintenance mode" detail="Temporarily block marketplace operations for maintenance." checked={settings.maintenanceMode} onChange={() => onToggle("maintenanceMode", "Maintenance mode")} />
              <AdminSettingToggle title="Customer registration" detail="Allow new customers to create accounts." checked={settings.customerRegistration} onChange={() => onToggle("customerRegistration", "Customer registration")} />
              <AdminSettingToggle title="Vendor registration" detail="Allow new vendors to apply for marketplace access." checked={settings.vendorRegistration} onChange={() => onToggle("vendorRegistration", "Vendor registration")} />
              <AdminSettingToggle title="Supplier registration" detail="Allow new suppliers to apply for procurement access." checked={settings.supplierRegistration} onChange={() => onToggle("supplierRegistration", "Supplier registration")} />
              <AdminSettingToggle title="Auto approve products" detail="Publish submitted products without manual admin review." checked={settings.autoApproveProducts} onChange={() => onToggle("autoApproveProducts", "Auto approve products")} />
              <AdminSettingToggle title="Require vendor verification" detail="Vendors must be verified before full access." checked={settings.requireVendorVerification} onChange={() => onToggle("requireVendorVerification", "Vendor verification")} />
              <AdminSettingToggle title="Require supplier verification" detail="Suppliers must be verified before full access." checked={settings.requireSupplierVerification} onChange={() => onToggle("requireSupplierVerification", "Supplier verification")} />
            </div>
          </SettingsSection>
        </div>

        <aside className="grid content-start gap-6">
          <SettingsSection title="Integrations" detail="Test connected operational services.">
            <div className="grid gap-3">
              <IntegrationRow label="Payment Gateway" value={settings.paymentGateway} onTest={() => onTest("paymentGateway", "Payment Gateway")} />
              <IntegrationRow label="Inventory Sync" value={settings.inventorySync} onTest={() => onTest("inventorySync", "Inventory Sync")} />
              <IntegrationRow label="Logistics API" value={settings.logisticsApi} onTest={() => onTest("logisticsApi", "Logistics API")} />
            </div>
          </SettingsSection>

          <div className="grid gap-3 rounded-xl border border-[#c6cdc8] bg-white p-5 shadow-sm">
            <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
              <CheckCircle2 className="h-4 w-4" />
              Save Settings
            </button>
            <button type="button" onClick={onExport} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c6cdc8] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
              <Download className="h-4 w-4" />
              Export Settings
            </button>
            <button type="button" onClick={onReset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#e9e4dc] px-4 text-sm font-extrabold text-[#3d4541]">
              <RefreshCw className="h-4 w-4" />
              Reset Defaults
            </button>
          </div>

          <SettingsSection title="Audit Log" detail="Recent system setting changes.">
            <div className="grid gap-2">
              {auditLog.length === 0 ? (
                <p className="rounded-lg bg-[#f8f4ec] px-3 py-2 text-sm font-semibold text-[#66716b]">No system audit entries yet.</p>
              ) : (
                auditLog.map((entry) => (
                  <article key={entry.id} className="rounded-lg bg-[#f8f4ec] px-3 py-2">
                    <strong className="block text-sm text-[#202621]">{entry.message}</strong>
                    <span className="text-xs font-extrabold uppercase text-[#66716b]">{entry.actor} - {entry.time}</span>
                  </article>
                ))
              )}
            </div>
          </SettingsSection>
        </aside>
      </form>
    </section>
  );
}

function AdminProfilePage({ profile, auditLog, onChange, onToggle, onSave, onReset, onExport, onPasswordReset }) {
  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-[#104d3f]">Admin Profile</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#66716b]">
            Manage administrator identity, access level, security alerts, and platform notification preferences.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={onExport} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c6cdc8] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button onClick={onReset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#e9e4dc] px-4 text-sm font-extrabold text-[#3d4541]">
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={onSave} className="grid gap-6">
          <SettingsSection title="Profile Details" detail="Admin identity shown in audit logs, support tickets, and operational actions.">
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminSettingInput label="Full Name" value={profile.name} onChange={(value) => onChange("name", value)} />
              <AdminSettingInput label="Role" value={profile.role} onChange={(value) => onChange("role", value)} />
              <AdminSettingInput label="Email" type="email" value={profile.email} onChange={(value) => onChange("email", value)} />
              <AdminSettingInput label="Phone" value={profile.phone} onChange={(value) => onChange("phone", value)} />
              <AdminSettingInput label="Department" value={profile.department} onChange={(value) => onChange("department", value)} />
              <AdminSettingInput label="Location" value={profile.location} onChange={(value) => onChange("location", value)} />
              <AdminSettingSelect label="Access Level" value={profile.accessLevel} options={["Super Admin", "Operations Admin", "Finance Admin", "Support Admin"]} onChange={(value) => onChange("accessLevel", value)} />
              <AdminSettingSelect label="Language" value={profile.language} options={["English", "Sinhala", "Tamil"]} onChange={(value) => onChange("language", value)} />
              <AdminSettingSelect label="Timezone" value={profile.timezone} options={["Asia/Colombo", "UTC", "Asia/Dubai"]} onChange={(value) => onChange("timezone", value)} />
            </div>
          </SettingsSection>

          <SettingsSection title="Security And Notifications" detail="Control admin login protection and operational alerts.">
            <div className="grid gap-3">
              <AdminSettingToggle title="Two-factor authentication" detail="Require second-step verification for admin login." checked={profile.twoFactor} onChange={() => onToggle("twoFactor", "Two-factor authentication")} />
              <AdminSettingToggle title="Login alerts" detail="Send alerts when admin signs in from a new device." checked={profile.loginAlerts} onChange={() => onToggle("loginAlerts", "Login alerts")} />
              <AdminSettingToggle title="Approval notifications" detail="Notify admin about vendor and supplier approvals." checked={profile.approvalNotifications} onChange={() => onToggle("approvalNotifications", "Approval notifications")} />
              <AdminSettingToggle title="Payout notifications" detail="Notify admin about payout holds, releases, and refunds." checked={profile.payoutNotifications} onChange={() => onToggle("payoutNotifications", "Payout notifications")} />
              <AdminSettingToggle title="Weekly digest" detail="Send weekly platform performance digest to admin email." checked={profile.weeklyDigest} onChange={() => onToggle("weeklyDigest", "Weekly digest")} />
            </div>
          </SettingsSection>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
              <CheckCircle2 className="h-4 w-4" />
              Save Profile
            </button>
            <button type="button" onClick={onPasswordReset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c6cdc8] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
              <Settings className="h-4 w-4" />
              Reset Password
            </button>
            <button type="button" onClick={onExport} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c6cdc8] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
              <Download className="h-4 w-4" />
              Export Profile
            </button>
          </div>
        </form>

        <aside className="grid content-start gap-6">
          <section className="rounded-xl border border-[#c6cdc8] bg-white p-5 text-center shadow-sm">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#104d3f] text-2xl font-extrabold text-white">
              {getDirectoryInitials(profile.name)}
            </span>
            <h3 className="mt-4 text-xl font-extrabold text-[#202621]">{profile.name}</h3>
            <p className="mt-1 text-sm font-semibold text-[#66716b]">{profile.role}</p>
            <div className="mt-5 grid gap-3 text-left">
              <ProfileDetail label="Access" value={profile.accessLevel} />
              <ProfileDetail label="Department" value={profile.department} />
              <ProfileDetail label="Last Login" value={profile.lastLogin} />
              <ProfileDetail label="Security" value={profile.twoFactor ? "2FA Enabled" : "2FA Off"} />
            </div>
          </section>

          <SettingsSection title="Recent Admin Audit" detail="Profile and system actions performed by admin.">
            <div className="grid gap-2">
              {auditLog.length === 0 ? (
                <p className="rounded-lg bg-[#f8f4ec] px-3 py-2 text-sm font-semibold text-[#66716b]">No audit entries yet.</p>
              ) : (
                auditLog.slice(0, 6).map((entry) => (
                  <article key={entry.id} className="rounded-lg bg-[#f8f4ec] px-3 py-2">
                    <strong className="block text-sm text-[#202621]">{entry.message}</strong>
                    <span className="text-xs font-extrabold uppercase text-[#66716b]">{entry.actor} - {entry.time}</span>
                  </article>
                ))
              )}
            </div>
          </SettingsSection>
        </aside>
      </section>
    </section>
  );
}

function ProfileDetail({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-[#f8f4ec] px-3 py-2">
      <span className="text-sm font-bold text-[#66716b]">{label}</span>
      <strong className="text-sm text-[#202621]">{value}</strong>
    </div>
  );
}

function SettingsSection({ title, detail, children }) {
  return (
    <section className="rounded-xl border border-[#c6cdc8] bg-white p-5 shadow-sm">
      <h3 className="text-lg font-extrabold text-[#104d3f]">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-[#66716b]">{detail}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function AdminSettingInput({ label, value, onChange, type = "text" }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 font-semibold outline-none focus:border-[#104d3f]" />
    </label>
  );
}

function AdminSettingSelect({ label, value, options, onChange }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 font-semibold outline-none focus:border-[#104d3f]">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function AdminSettingToggle({ title, detail, checked, onChange }) {
  return (
    <button type="button" onClick={onChange} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] p-4 text-left transition hover:border-[#104d3f]">
      <span>
        <strong className="block text-sm text-[#202621]">{title}</strong>
        <span className="mt-1 block text-sm leading-relaxed text-[#66716b]">{detail}</span>
      </span>
      <span className={`h-6 w-11 rounded-full p-1 transition ${checked ? "bg-[#104d3f]" : "bg-[#c6cdc8]"}`}>
        <span className={`block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

function IntegrationRow({ label, value, onTest }) {
  return (
    <div className="grid gap-3 rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] p-4">
      <div className="flex items-center justify-between gap-3">
        <strong className="text-sm text-[#202621]">{label}</strong>
        <ApprovalStatusBadge status={value} />
      </div>
      <button type="button" onClick={onTest} className="min-h-10 rounded-lg bg-[#104d3f] px-3 text-sm font-extrabold text-white">
        Test Connection
      </button>
    </div>
  );
}

function DirectoryStat({ icon: Icon, label, value, warning = false }) {
  return (
    <article className="rounded-xl border border-[#c6cdc8] bg-white p-5 shadow-sm">
      <span className={`grid h-10 w-10 place-items-center rounded-lg ${warning ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#e9f2ed] text-[#104d3f]"}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-semibold text-[#66716b]">{label}</p>
      <strong className="mt-1 block text-2xl text-[#202621]">{value}</strong>
    </article>
  );
}

function getDirectoryInitials(name) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function parseDirectoryValue(value) {
  const text = String(value).toUpperCase();
  const amount = Number.parseFloat(text.replace(/[^0-9.]/g, "")) || 0;
  if (text.includes("M")) return amount * 1000000;
  if (text.includes("K")) return amount * 1000;
  return amount;
}

function AdminComingSoonPage({ section, onCreate }) {
  return (
    <section className="rounded-xl border border-[#c6cdc8] bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-extrabold text-[#104d3f]">{section}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#66716b]">This admin section is ready for its detailed workflow.</p>
      <button onClick={onCreate} className="mt-5 min-h-11 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">Create Setup Task</button>
    </section>
  );
}

function AdminNotificationModal({ form, notifications, onChange, onClose, onSend }) {
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/35 px-4 py-6">
      <section className="grid max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#d8d4cc] px-6 py-5">
          <div>
            <h3 className="text-xl font-extrabold text-[#104d3f]">Admin Notifications</h3>
            <p className="mt-1 text-sm text-[#66716b]">Send operational notices to customers, vendors, suppliers, or all portal users.</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#f3eee6]" aria-label="Close notifications">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 overflow-y-auto px-6 py-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form onSubmit={onSend} className="grid content-start gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
                Send To
                <select value={form.audience} onChange={(event) => onChange("audience", event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 font-semibold outline-none focus:border-[#104d3f]">
                  <option>Customer</option>
                  <option>Vendor</option>
                  <option>Supplier</option>
                  <option>All</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
                Priority
                <select value={form.priority} onChange={(event) => onChange("priority", event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 font-semibold outline-none focus:border-[#104d3f]">
                  <option>Normal</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </label>
            </div>
            <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
              Title
              <input value={form.title} onChange={(event) => onChange("title", event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 font-semibold outline-none focus:border-[#104d3f]" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
              Message
              <textarea value={form.message} onChange={(event) => onChange("message", event.target.value)} rows={6} className="rounded-lg border border-[#c6cdc8] bg-white px-3 py-2 font-semibold outline-none focus:border-[#104d3f]" />
            </label>
            <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
              <Send className="h-4 w-4" />
              Send Notification
            </button>
          </form>

          <aside className="grid content-start gap-3">
            <div className="rounded-lg bg-[#f3eee6] p-4">
              <span className="text-xs font-extrabold uppercase text-[#66716b]">Connection</span>
              <strong className="mt-1 block text-[#104d3f]">Customer + Vendor + Supplier</strong>
              <p className="mt-2 text-sm leading-relaxed text-[#66716b]">Admin messages are saved into each audience notification queue.</p>
            </div>
            <h4 className="text-sm font-extrabold uppercase text-[#66716b]">Sent History</h4>
            <div className="grid gap-3">
              {notifications.length === 0 ? (
                <p className="rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] p-4 text-sm font-semibold text-[#66716b]">No admin notifications sent yet.</p>
              ) : (
                notifications.slice(0, 6).map((item) => (
                  <article key={item.id} className="rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.audiences.map((audience) => (
                        <span key={`${item.id}-${audience}`} className="rounded-full bg-[#d9ecd8] px-2 py-1 text-[10px] font-extrabold uppercase text-[#104d3f]">{audience}</span>
                      ))}
                      <span className="rounded-full bg-[#fff0cd] px-2 py-1 text-[10px] font-extrabold uppercase text-[#8b5633]">{item.priority}</span>
                    </div>
                    <strong className="mt-3 block text-sm text-[#202621]">{item.title}</strong>
                    <p className="mt-2 text-sm leading-relaxed text-[#66716b]">{item.message}</p>
                    <span className="mt-2 block text-xs font-extrabold uppercase text-[#9aa09c]">{item.time}</span>
                  </article>
                ))
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function ApprovalReviewModal({ entity, note, onChange, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/35 px-4 py-6">
      <section className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#d8d4cc] px-6 py-5">
          <div>
            <h3 className="text-xl font-extrabold text-[#104d3f]">Review Approval</h3>
            <p className="mt-1 text-sm text-[#66716b]">Send a review request before approving this {entity.type.toLowerCase()}.</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#f3eee6]" aria-label="Close review">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 px-6 py-5">
          <div className="rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] p-4">
            <span className="text-xs font-extrabold uppercase text-[#66716b]">{entity.type}</span>
            <strong className="mt-1 block text-[#202621]">{entity.name}</strong>
            <p className="mt-1 text-sm font-semibold text-[#66716b]">{entity.email}</p>
            <p className="mt-2 text-xs font-extrabold uppercase text-[#9aa09c]">Requested {entity.requested}</p>
          </div>

          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Review Note
            <textarea value={note} onChange={(event) => onChange(event.target.value)} rows={5} className="rounded-lg border border-[#c6cdc8] bg-white px-3 py-2 font-semibold outline-none focus:border-[#104d3f]" />
          </label>

          <div className="flex flex-wrap justify-end gap-3 border-t border-[#d8d4cc] pt-4">
            <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
            <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#104d3f] px-4 text-sm font-extrabold text-white">
              <Send className="h-4 w-4" />
              Send Review
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ApprovalManagerModal({ approvals, onApprove, onReview, onClose }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredApprovals = approvals.filter((item) => {
    const matchesQuery = `${item.name} ${item.email} ${item.type} ${item.status}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === "All" || item.type === typeFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesQuery && matchesType && matchesStatus;
  });

  const approvalCounts = approvals.reduce((counts, item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }, {});

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/35 px-4 py-6">
      <section className="grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#d8d4cc] px-6 py-5">
          <div>
            <h3 className="text-xl font-extrabold text-[#104d3f]">All Pending Approvals</h3>
            <p className="mt-1 text-sm text-[#66716b]">Review vendor and supplier verification requests in one place.</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#f3eee6]" aria-label="Close approvals">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 overflow-y-auto px-6 py-5">
          <section className="grid gap-3 sm:grid-cols-4">
            <ApprovalStat label="Total" value={approvals.length} />
            <ApprovalStat label="Pending" value={approvalCounts.Pending || 0} />
            <ApprovalStat label="Review" value={(approvalCounts.Review || 0) + (approvalCounts["Review Requested"] || 0)} />
            <ApprovalStat label="Approved" value={approvalCounts.Approved || 0} />
          </section>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            <label className="flex min-h-11 items-center rounded-lg border border-[#c6cdc8] bg-white px-3 text-[#66716b]">
              <Search className="h-4 w-4 shrink-0" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search approvals..." />
            </label>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
              <option>All</option>
              <option>Vendor</option>
              <option>Supplier</option>
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#c6cdc8] bg-white px-3 text-sm font-bold text-[#3d4541] outline-none">
              <option>All</option>
              <option>Pending</option>
              <option>Review</option>
              <option>Review Requested</option>
              <option>Approved</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#d8d4cc]">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-[#f3eee6] text-xs font-extrabold uppercase text-[#56605b]">
                <tr><th className="px-5 py-4">Entity</th><th className="px-4 py-4">Type</th><th className="px-4 py-4">Requested</th><th className="px-4 py-4">Status</th><th className="px-5 py-4">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-[#e2ded7] bg-white">
                {filteredApprovals.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4">
                      <span className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#ffd7bd] font-extrabold text-[#202621]">{item.initials}</span>
                        <span>
                          <strong className="block text-[#202621]">{item.name}</strong>
                          <span className="text-xs font-semibold text-[#66716b]">{item.email}</span>
                          {item.reviewNote && <span className="mt-1 block text-xs font-bold text-[#8b5633]">{item.reviewNote}</span>}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-4"><span className="rounded bg-[#bfe6d7] px-2 py-1 text-xs font-extrabold uppercase text-[#104d3f]">{item.type}</span></td>
                    <td className="px-4 py-4 text-[#4f5853]">{item.requested}</td>
                    <td className="px-4 py-4"><ApprovalStatusBadge status={item.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => onApprove(item)} disabled={item.status === "Approved"} className="min-h-9 rounded-lg bg-[#104d3f] px-3 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:bg-[#c6cdc8]">Approve</button>
                        <button onClick={() => onReview(item)} className="min-h-9 rounded-lg border border-[#c6cdc8] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Review</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredApprovals.length === 0 && <p className="p-5 text-sm font-semibold text-[#66716b]">No approvals match this filter.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

function ApprovalStat({ label, value }) {
  return (
    <div className="rounded-lg border border-[#d8d4cc] bg-[#fbfaf6] p-4">
      <span className="text-xs font-extrabold uppercase text-[#66716b]">{label}</span>
      <strong className="mt-1 block text-2xl text-[#104d3f]">{value}</strong>
    </div>
  );
}

function ApprovalStatusBadge({ status }) {
  const approved = status === "Approved";
  const review = status === "Review" || status === "Review Requested";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold uppercase ${approved ? "bg-[#d9ecd8] text-[#104d3f]" : review ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#f3eee6] text-[#d2861d]"}`}>
      {status}
    </span>
  );
}

function AdminMetricCard({ icon: Icon, label, value, trend, color }) {
  return (
    <article className={`min-h-[190px] rounded-xl border border-[#d8d4cc] border-l-4 bg-white p-6 shadow-sm ${color}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-current/10"><Icon className="h-5 w-5" /></span>
        <span className="text-xs font-extrabold">{trend}</span>
      </div>
      <p className="mt-7 text-sm font-semibold text-[#3d4541]">{label}</p>
      <strong className="mt-2 block text-2xl font-extrabold text-[#202621]">{value}</strong>
    </article>
  );
}

function AdminPanel({ title, detail, action, onAction, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#c6cdc8] bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 px-6 py-5">
        <div>
          <h3 className="text-xl font-extrabold text-[#104d3f]">{title}</h3>
          <p className="text-sm text-[#4f5853]">{detail}</p>
        </div>
        {action && <button onClick={onAction} className="text-sm font-extrabold text-[#104d3f]">{action}</button>}
      </div>
      {children}
    </section>
  );
}

function HealthLine({ label, status, value, tone }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold">
        <span>{label}</span>
        <span className="rounded bg-white/20 px-2 py-1 text-xs font-extrabold uppercase">{status}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/15"><div className={`h-full rounded-full ${tone}`} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function ActivityItem({ item }) {
  const Icon = item.icon;
  return (
    <article className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
      <span className={`grid h-7 w-7 place-items-center rounded-full bg-[#f0ebe3] ${item.tone}`}><Icon className="h-4 w-4" /></span>
      <div>
        <h4 className="text-sm font-extrabold leading-snug text-[#202621]">{item.title}</h4>
        <p className="mt-1 text-sm leading-snug text-[#4f5853]">{item.detail}</p>
        <span className="mt-1 block text-xs font-extrabold uppercase text-[#a0a7a3]">{item.time}</span>
      </div>
    </article>
  );
}

export { AdminDashboardPage };
