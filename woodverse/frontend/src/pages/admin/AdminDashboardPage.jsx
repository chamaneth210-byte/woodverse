import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Boxes,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  Grid2X2,
  HelpCircle,
  LogOut,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { apiRequest, navigate, signOut } from "../../utils";
import {
  appendStoredList,
  getStoredList,
  getStoredListOrSeed,
  saveStoredList,
} from "../../lib/storage";
import { AdminCategoriesPage } from "./AdminCategoriesPage";
import { AdminComingSoonPage } from "./AdminComingSoonPage";
import { AdminDirectoryPage } from "./AdminDirectoryPage";
import { AdminNotificationModal } from "./AdminNotificationModal";
import { AdminOrdersPage } from "./AdminOrdersPage";
import { AdminPaymentsPage } from "./AdminPaymentsPage";
import { AdminProductsPage } from "./AdminProductsPage";
import { AdminProfilePage } from "./AdminProfilePage";
import { AdminSystemSettingsPage } from "./AdminSystemSettingsPage";
import { ApprovalManagerModal } from "./ApprovalManagerModal";
import { ApprovalReviewModal } from "./ApprovalReviewModal";
import { getRegistrationApprovals } from "./approvals.js";
import { ActivityItem, AdminMetricCard, AdminPanel, HealthLine } from "./dashboardParts";
import { activitySeed, adminHeaderSections, adminNavItems, adminProfileSeed, approvalSeed, categorySeed, customerSeed, metricCards, orderSeed, paymentSeed, productSeed, provinceSales, supplierSeed, systemSettingsSeed, vendorSeed } from "./seed.js";
import { adminAuditLogStorageKey, adminCategoriesStorageKey, adminCustomersStorageKey, adminNotificationStorageKey, adminOrdersStorageKey, adminPaymentsStorageKey, adminProductsStorageKey, adminProfileStorageKey, adminSuppliersStorageKey, adminSystemSettingsStorageKey, adminVendorsStorageKey, approvalReviewsStorageKey, approvedEntitiesStorageKey, customerNotificationStorageKey, registrationApplicationsStorageKey, supplierNotificationStorageKey, vendorNotificationStorageKey } from "./storageKeys.js";

// Every console section and the URL that opens it. The console keeps all sections in
// one shell, so the path is what decides which section is on screen: that is what makes
// a section linkable and keeps the back button working.
const adminSectionPaths = [
  ...adminNavItems.map(([, label, href]) => [label, href]),
  ...adminHeaderSections.map(([label, href]) => [label, href]),
];

function adminSectionForPath(pathname) {
  return adminSectionPaths.find(([, href]) => href === pathname)?.[0] || "Dashboard";
}

// Short descriptions for the console header. Without these every section was titled
// "Overview Dashboard", so a deep link looked like it had loaded the wrong page.
const adminSectionBlurbs = {
  Customers: "Review customer accounts, verification state, and messaging.",
  Vendors: "Approve, suspend, and message vendor storefronts.",
  Suppliers: "Approve, suspend, and message timber suppliers.",
  Products: "Moderate catalog listings across every vendor.",
  Orders: "Track order status, fulfilment, and exceptions.",
  Categories: "Organise the storefront catalog tree.",
  Payments: "Review settlement, refunds, and payout status.",
  "System Settings": "Platform configuration and integration health.",
  "Admin Profile": "Your admin identity, security, and preferences.",
};

export function AdminDashboardPage() {
  const [notice, setNotice] = useState("Admin dashboard loaded.");
  const [activeNav, setActiveNav] = useState(() => adminSectionForPath(window.location.pathname));
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
  // The shell outlives a navigation between sections, so the section has to be re-read
  // from the path whenever the history changes.
  useEffect(() => {
    const syncSection = () => setActiveNav(adminSectionForPath(window.location.pathname));
    window.addEventListener("popstate", syncSection);
    return () => window.removeEventListener("popstate", syncSection);
  }, []);
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
    const href = adminSectionPaths.find(([name]) => name === label)?.[1] || "/admin";
    navigate(href);
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
    if (audience === "Customer") appendStoredList(customerNotificationStorageKey, notification);
    if (audience === "Vendor") appendStoredList(vendorNotificationStorageKey, { ...notification, audience: "Admin" });
    if (audience === "Supplier") appendStoredList(supplierNotificationStorageKey, notification);
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
    appendStoredList(vendorNotificationStorageKey, {
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
      vendor: "Kasun Fernando Woodcraft",
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
    appendStoredList(customerNotificationStorageKey, {
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
    appendStoredList(vendorNotificationStorageKey, {
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
      vendor: "Kasun Fernando Woodcraft",
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
    appendStoredList(customerNotificationStorageKey, {
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
    appendStoredList(vendorNotificationStorageKey, {
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
      vendor: "Kasun Fernando Woodcraft",
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
    appendStoredList("woodverse-admin-password-resets", request);
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
    if (entity.type === "Vendor") appendStoredList(vendorNotificationStorageKey, { ...notification, audience: "Admin" });
    if (entity.type === "Supplier") appendStoredList(supplierNotificationStorageKey, notification);
  };

  const approveEntity = (entity) => {
    const approvedEntity = { ...entity, status: "Approved", approvedAt: new Date().toISOString() };
    setApprovals((items) => items.map((item) => (item.id === entity.id ? approvedEntity : item)));
    if (entity.id.startsWith("APP-")) {
      saveStoredList(registrationApplicationsStorageKey, getStoredList(registrationApplicationsStorageKey).map((item) => item.id === entity.id ? { ...item, status: "Approved", approvedAt: approvedEntity.approvedAt } : item));
    }
    appendStoredList(approvedEntitiesStorageKey, approvedEntity);
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
    appendStoredList(approvalReviewsStorageKey, review);
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
      if (audience === "Customer") appendStoredList(customerNotificationStorageKey, notification);
      if (audience === "Vendor") appendStoredList(vendorNotificationStorageKey, { ...notification, audience: "Admin" });
      if (audience === "Supplier") appendStoredList(supplierNotificationStorageKey, notification);
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
          <span className="h-10 w-10 shrink-0 rounded-lg bg-[#102f27] bg-no-repeat" style={{ backgroundImage: "url('/assets/admin-vendor-logo.webp')", backgroundSize: "500% auto", backgroundPosition: "25% 35%" }} aria-hidden="true" />
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
          <button onClick={() => openSection("System Settings")} className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#f0ebe3]" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </button>
          <button onClick={() => openSection("Admin Profile")} className="flex min-h-12 items-center gap-3 rounded-full border border-[#c6cdc8] bg-white px-4 text-sm font-semibold">
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
            <button onClick={signOut} className="flex min-h-11 items-center gap-3 rounded-lg px-4 text-sm font-extrabold text-[#d24b53] hover:bg-white"><LogOut className="h-5 w-5" />Logout</button>
          </div>
        </aside>

        <section className="min-w-0 px-5 py-6 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-[1280px] gap-7">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div>
                <h2 className="text-3xl font-extrabold tracking-normal text-[#104d3f]">{activeNav === "Dashboard" ? "Overview Dashboard" : activeNav}</h2>
                <p className="mt-1 text-base text-[#4f5853]">{activeNav === "Dashboard" ? "Real-time enterprise intelligence and operational status." : adminSectionBlurbs[activeNav] || "Manage this area of the WoodVerse platform."}</p>
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
