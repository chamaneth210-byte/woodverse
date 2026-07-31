import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { navigate } from "../utils";
import {
  AlertTriangle,
  Archive,
  Bell,
  BookOpen,
  Boxes,
  Building2,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Download,
  Factory,
  FileText,
  Globe2,
  HelpCircle,
  Home,
  KeyRound,
  Languages,
  Lock,
  Mail,
  MessageSquare,
  PackagePlus,
  PhoneCall,
  PlusCircle,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UserCog,
  Warehouse,
  X,
} from "lucide-react";

function publishAdminEvent(source, title, message, priority = "Normal") {
  try {
    const key = "woodverse-admin-notifications";
    const current = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([{ id: `EV-${Date.now()}`, audience: "Admin", type: source, source: `${source} Portal`, title, message, detail: message, priority, time: "Just now", createdAt: new Date().toISOString() }, ...current]));
  } catch {}
}

const navigationItems = [
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

const initialVendorProducts = [
  {
    id: "VP-1001",
    name: "Walnut Task Table",
    category: "Furniture",
    material: "Walnut",
    price: "LKR 145,000",
    stock: 18,
    status: "Published",
    image: "/assets/product-walnut-task-table.png",
  },
  {
    id: "VP-1002",
    name: "Royal Majesty Sofa Set",
    category: "Living Room",
    material: "Teak and Fabric",
    price: "LKR 485,000",
    stock: 7,
    status: "Published",
    image: "/assets/royal-majesty-sofa-set.png",
  },
  {
    id: "VP-1003",
    name: "Signature Bedframe",
    category: "Bedroom",
    material: "Mahogany",
    price: "LKR 265,000",
    stock: 11,
    status: "Draft",
    image: "/assets/signature-bedframe.png",
  },
  {
    id: "VP-1004",
    name: "Carved Gift Box",
    category: "Wooden Gifts",
    material: "Satinwood",
    price: "LKR 14,500",
    stock: 32,
    status: "Published",
    image: "/assets/product-carved-gift-box.png",
  },
];

const supplierMaterialStock = [
  { material: "Teak", available: 28, unit: "planks", keywords: ["teak", "sofa"] },
  { material: "Mahogany", available: 0, unit: "planks", keywords: ["mahogany"] },
  { material: "Walnut", available: 14, unit: "boards", keywords: ["walnut"] },
  { material: "Oak", available: 3, unit: "boards", keywords: ["oak"] },
  { material: "Satinwood", available: 18, unit: "pieces", keywords: ["satinwood", "gift box"] },
  { material: "Fabric", available: 22, unit: "meters", keywords: ["fabric", "chair", "lounge"] },
];

const vendorSupplierDirectory = [
  { id: "SUP-301", name: "Lumbini Timber Co.", material: "Teak and Mahogany", location: "Moratuwa", leadTime: "2 days", rating: "4.9", status: "Preferred", contact: "+94 77 214 9801" },
  { id: "SUP-302", name: "Ceylon Hardwood Mills", material: "Walnut and Oak", location: "Kurunegala", leadTime: "4 days", rating: "4.7", status: "Active", contact: "+94 71 552 1180" },
  { id: "SUP-303", name: "Satinwood Craft Supply", material: "Satinwood and Gift Stock", location: "Galle", leadTime: "3 days", rating: "4.8", status: "Active", contact: "+94 76 440 2281" },
];

const initialMaterialRequests = [
  { id: "MR-1208", supplier: "Lumbini Timber Co.", material: "Mahogany", quantity: "40 planks", linkedWork: "WO-0417", status: "Supplier Confirmed", dueDate: "Aug 03, 2026" },
  { id: "MR-1207", supplier: "Ceylon Hardwood Mills", material: "Walnut", quantity: "18 boards", linkedWork: "WO-0418", status: "Requested", dueDate: "Aug 05, 2026" },
  { id: "MR-1206", supplier: "Satinwood Craft Supply", material: "Satinwood", quantity: "24 pieces", linkedWork: "WO-0416", status: "Received", dueDate: "Jul 29, 2026" },
];

const initialVendorPurchaseOrders = [
  { id: "VPO-2104", supplier: "Lumbini Timber Co.", material: "Mahogany", quantity: 40, unit: "planks", unitPrice: 4200, linkedWork: "WO-0417", status: "Sent", dueDate: "Aug 03, 2026", total: 168000 },
  { id: "VPO-2103", supplier: "Ceylon Hardwood Mills", material: "Walnut", quantity: 18, unit: "boards", unitPrice: 5600, linkedWork: "WO-0418", status: "Draft", dueDate: "Aug 05, 2026", total: 100800 },
];

const initialVendorWarehouses = [
  { id: "WH-A", name: "Warehouse A", location: "Moratuwa Main Yard", manager: "Nuwan Perera", capacity: 500, used: 385, zones: 6, status: "Operational", focus: "Raw materials and cutting stock" },
  { id: "WH-B", name: "Finished Goods Store", location: "Colombo Dispatch Hub", manager: "Aruni Perera", capacity: 240, used: 218, zones: 4, status: "Near Capacity", focus: "Packed customer orders" },
  { id: "WH-C", name: "Showroom Reserve", location: "Nugegoda Showroom", manager: "Dilan Silva", capacity: 120, used: 62, zones: 3, status: "Operational", focus: "Display stock and urgent replacements" },
];

const initialVendorShipments = [
  { id: "SHP-3304", type: "Customer Delivery", reference: "#WV-9481", contact: "Shani De Silva", destination: "Colombo 05", carrier: "Lanka Freight", status: "Ready for Dispatch", date: "2026-08-01", items: "Mahogany coffee table", priority: "Normal" },
  { id: "SHP-3303", type: "Inbound Material", reference: "VPO-2104", contact: "Lumbini Timber Co.", destination: "Warehouse A", carrier: "Supplier Truck", status: "In Transit", date: "2026-08-03", items: "40 planks Mahogany", priority: "High" },
  { id: "SHP-3302", type: "Customer Delivery", reference: "#WV-9478", contact: "Dinesh Bandara", destination: "Kandy", carrier: "Express Move", status: "Delivered", date: "2026-07-30", items: "Oak wardrobe", priority: "Normal" },
];

const stats = [
  { icon: Archive, label: "Total Sales", value: "LKR 1.2M", helper: "+12%", tone: "bg-[#ffc090] text-[#8b5633]" },
  { icon: Boxes, label: "Active Products", value: "156", helper: "428 total", tone: "bg-[#2f6757] text-white" },
  { icon: ShoppingCart, label: "New Orders", value: "24", helper: "9 new", tone: "bg-[#4f6b4e] text-white", badge: true },
  { icon: Factory, label: "Active Works", value: "32", helper: "Live", tone: "bg-[#d5e2ef] text-[#3c72a0]" },
  { icon: FileText, label: "Pending Quotes", value: "18", helper: "Review", tone: "bg-[#ffe4b8] text-[#c47b23]" },
  { icon: AlertTriangle, label: "Low Materials", value: "05", helper: "Order", tone: "bg-[#f8b8b8] text-[#b10015]", danger: true },
];

const initialOrders = [
  { id: "#WV-9482", customer: "Kasun Wijesinghe", initials: "KW", product: "Teak executive desk", date: "Oct 24, 2023", dueDate: "Nov 08, 2023", amount: "LKR 245,000", status: "Processing", tone: "bg-[#ffd0a8] text-[#8b5633]" },
  { id: "#WV-9481", customer: "Shani De Silva", initials: "SD", product: "Mahogany coffee table", date: "Oct 23, 2023", dueDate: "Nov 02, 2023", amount: "LKR 89,000", status: "Completed", tone: "bg-[#d9ecd8] text-[#2f6757]" },
  { id: "#WV-9480", customer: "Ranil Thilak", initials: "RT", product: "Full dining room set", date: "Oct 22, 2023", dueDate: "Nov 18, 2023", amount: "LKR 1,240,000", status: "Awaiting Payment", tone: "bg-[#fff0cd] text-[#d2861d]" },
  { id: "#WV-9479", customer: "Amara Jayawardena", initials: "AJ", product: "Walnut TV console", date: "Oct 20, 2023", dueDate: "Nov 05, 2023", amount: "LKR 168,000", status: "Processing", tone: "bg-[#ffd0a8] text-[#8b5633]" },
  { id: "#WV-9478", customer: "Dinesh Bandara", initials: "DB", product: "Oak wardrobe", date: "Oct 18, 2023", dueDate: "Oct 31, 2023", amount: "LKR 310,000", status: "Completed", tone: "bg-[#d9ecd8] text-[#2f6757]" },
  { id: "#WV-9477", customer: "Malkanthi Silva", initials: "MS", product: "Custom lounge chair", date: "Oct 16, 2023", dueDate: "Nov 10, 2023", amount: "LKR 126,500", status: "Cancelled", tone: "bg-[#ece7df] text-[#66716b]" },
];

const initialQuotations = [
  { id: "QT-7801", customer: "Nimali Fernando", product: "Custom teak console table", date: "Jul 28, 2026", validUntil: "Aug 07, 2026", amount: "LKR 180,000", status: "Draft", notes: "Include satin finish and brass drawer pulls." },
  { id: "QT-7800", customer: "Kasun Wijesinghe", product: "Teak executive desk", date: "Jul 27, 2026", validUntil: "Aug 06, 2026", amount: "LKR 245,000", status: "Sent", notes: "Customer requested delivery to Colombo 05." },
  { id: "QT-7799", customer: "Amara Jayawardena", product: "Walnut TV console", date: "Jul 25, 2026", validUntil: "Aug 04, 2026", amount: "LKR 168,000", status: "Approved", notes: "Ready to convert to customer order." },
  { id: "QT-7798", customer: "Dinesh Bandara", product: "Oak wardrobe", date: "Jul 22, 2026", validUntil: "Aug 01, 2026", amount: "LKR 310,000", status: "Expired", notes: "Price needs review due to material changes." },
];

const productionStages = ["Carpentry", "Polishing", "Upholstery", "Quality Check", "Packing", "Completed"];

const initialProductionWorks = [
  { id: "WO-0417", orderId: "#WV-9482", product: "Teak executive desk", customer: "Kasun Wijesinghe", stage: "Carpentry", priority: "High Priority", quantity: 1, dueDate: "Aug 08, 2026", assignedTo: "Workshop A", notes: "Confirm drawer measurements before polish." },
  { id: "WO-0418", orderId: "#WV-9479", product: "Walnut TV console", customer: "Amara Jayawardena", stage: "Polishing", priority: "Normal Priority", quantity: 2, dueDate: "Aug 05, 2026", assignedTo: "Finishing Team", notes: "Matte finish requested." },
  { id: "WO-0419", orderId: "#WV-9478", product: "Oak wardrobe", customer: "Dinesh Bandara", stage: "Quality Check", priority: "Normal Priority", quantity: 1, dueDate: "Aug 01, 2026", assignedTo: "QC Desk", notes: "Check hinge alignment." },
  { id: "WO-0420", orderId: "#WV-9481", product: "Mahogany coffee table", customer: "Shani De Silva", stage: "Completed", priority: "Low Priority", quantity: 1, dueDate: "Jul 30, 2026", assignedTo: "Dispatch", notes: "Ready for delivery confirmation." },
];

const vendorOrdersStorageKey = "woodverse-vendor-orders";
const vendorOpenNewOrderStorageKey = "woodverse-vendor-open-new-order";
const vendorAdminNotificationsStorageKey = "woodverse-vendor-admin-notifications";
const vendorProductionStorageKey = "woodverse-vendor-production";
const vendorPurchaseOrdersStorageKey = "woodverse-vendor-purchase-orders";
const vendorInventoryStorageKey = "woodverse-vendor-inventory";
const vendorWarehousesStorageKey = "woodverse-vendor-warehouses";
const vendorShipmentsStorageKey = "woodverse-vendor-shipments";
const supplierIncomingRequestsStorageKey = "woodverse-supplier-incoming-requests";
const supplierNotificationsStorageKey = "woodverse-supplier-notifications";

function getStoredVendorOrders() {
  try {
    return JSON.parse(localStorage.getItem(vendorOrdersStorageKey) || "null") || initialOrders;
  } catch {
    return initialOrders;
  }
}

function requestVendorNewOrder() {
  try {
    localStorage.setItem(vendorOpenNewOrderStorageKey, "true");
  } catch {}
  navigate("/vendor/customer-orders");
}

function getStoredVendorAdminNotifications() {
  try {
    return JSON.parse(localStorage.getItem(vendorAdminNotificationsStorageKey) || "null") || [];
  } catch {
    return [];
  }
}

function getStoredProductionWorks() {
  try {
    return JSON.parse(localStorage.getItem(vendorProductionStorageKey) || "null") || initialProductionWorks;
  } catch {
    return initialProductionWorks;
  }
}

function createStoredProductionWorkOrder(form) {
  const existingWorks = getStoredProductionWorks();
  const numericIds = existingWorks.map((work) => Number(String(work.id).replace("WO-", ""))).filter(Boolean);
  const nextId = `WO-${String(Math.max(...numericIds, 416) + 1).padStart(4, "0")}`;
  const workOrder = {
    id: nextId,
    orderId: form.orderId?.trim() || "Internal",
    product: form.product.trim(),
    customer: form.customer?.trim() || "Workshop stock",
    stage: form.stage || "Carpentry",
    priority: form.priority || "Normal Priority",
    quantity: Math.max(1, Number(form.quantity) || 1),
    dueDate: form.dueDate,
    assignedTo: form.assignedTo?.trim() || "Workshop A",
    notes: form.notes?.trim() || "",
  };
  const updatedWorks = [workOrder, ...existingWorks];
  try {
    localStorage.setItem(vendorProductionStorageKey, JSON.stringify(updatedWorks));
  } catch {}
  return { workOrder, updatedWorks };
}

function appendStoredList(storageKey, item) {
  try {
    const existingItems = JSON.parse(localStorage.getItem(storageKey) || "null") || [];
    localStorage.setItem(storageKey, JSON.stringify([item, ...existingItems]));
  } catch {}
}

function getStoredProductionWorkOrderByOrderId(orderId) {
  return getStoredProductionWorks().find((work) => work.orderId === orderId);
}

function createProductionWorkOrderFromCustomerOrder(order, overrides = {}) {
  const existingWorkOrder = getStoredProductionWorkOrderByOrderId(order.id);
  if (existingWorkOrder) {
    return { workOrder: existingWorkOrder, created: false };
  }
  const manufactureItems = getManufactureItemsForOrder(order);
  if (manufactureItems.length === 0) {
    return { workOrder: null, created: false, skipped: true };
  }
  const quantity = manufactureItems.reduce((sum, item) => sum + item.quantity, 0);
  const product = manufactureItems.length === 1
    ? manufactureItems[0].name
    : `${manufactureItems[0].name} + ${manufactureItems.length - 1} manufacture item${manufactureItems.length === 2 ? "" : "s"}`;
  const result = createStoredProductionWorkOrder({
    orderId: order.id,
    product,
    customer: order.customer,
    stage: "Carpentry",
    priority: "High Priority",
    quantity,
    dueDate: order.dueDate,
    assignedTo: "Workshop A",
    notes: `Created after vendor approval for customer order ${order.id}. Manufacture: ${manufactureItems.map((item) => `${item.name} x${item.quantity}`).join(", ")}.`,
    ...overrides,
  });
  return { ...result, created: true };
}

const initialAlerts = [
  {
    id: "material",
    tone: "border-[#d74e5b] bg-[#fff0f0]",
    icon: AlertTriangle,
    title: "Material Critical: Mahogany Log",
    detail: "Stock levels below 10% in Warehouse A. Order required.",
    time: "10 mins ago",
    severity: "Critical",
    owner: "Inventory",
  },
  {
    id: "message",
    tone: "border-[#3d82bd] bg-[#eef6fd]",
    icon: MessageSquare,
    title: "New Message: Designer Chat",
    detail: "Amara sent 2 new technical drawings for Order #WV-9482.",
    time: "2 hours ago",
    severity: "Medium",
    owner: "Design",
  },
  {
    id: "report",
    tone: "border-[#dfd6c6] bg-[#f4efe7]",
    icon: FileText,
    title: "Monthly Report Generated",
    detail: "Your September performance report is ready for download.",
    time: "Yesterday",
    severity: "Low",
    owner: "Reporting",
  },
];

const salesRanges = {
  "Last 3 Months": [
    { month: "Aug", revenue: 820000, orders: 18 },
    { month: "Sep", revenue: 1040000, orders: 22 },
    { month: "Oct", revenue: 1200000, orders: 24 },
  ],
  "Last 6 Months": [
    { month: "May", revenue: 420000, orders: 9 },
    { month: "Jun", revenue: 610000, orders: 13 },
    { month: "Jul", revenue: 560000, orders: 12 },
    { month: "Aug", revenue: 820000, orders: 18 },
    { month: "Sep", revenue: 1040000, orders: 22 },
    { month: "Oct", revenue: 1200000, orders: 24 },
  ],
  "This Year": [
    { month: "Jan", revenue: 360000, orders: 8 },
    { month: "Feb", revenue: 410000, orders: 9 },
    { month: "Mar", revenue: 520000, orders: 11 },
    { month: "Apr", revenue: 470000, orders: 10 },
    { month: "May", revenue: 420000, orders: 9 },
    { month: "Jun", revenue: 610000, orders: 13 },
    { month: "Jul", revenue: 560000, orders: 12 },
    { month: "Aug", revenue: 820000, orders: 18 },
    { month: "Sep", revenue: 1040000, orders: 22 },
    { month: "Oct", revenue: 1200000, orders: 24 },
  ],
};

const initialNotifications = [
  {
    id: "customer-order-update",
    audience: "Customer",
    source: "Kasun Wijesinghe",
    title: "Customer requested delivery update",
    message: "Order #WV-9482 customer asked for the latest production and delivery date.",
    time: "8 mins ago",
  },
  {
    id: "supplier-stock-update",
    audience: "Supplier",
    source: "Lumbini Timber Co.",
    title: "Mahogany stock confirmation",
    message: "Supplier confirmed 40 mahogany planks are available for purchase order creation.",
    time: "24 mins ago",
  },
  {
    id: "customer-payment-update",
    audience: "Customer",
    source: "Ranil Thilak",
    title: "Payment reminder pending",
    message: "Customer order #WV-9480 is still awaiting final payment confirmation.",
    time: "1 hour ago",
  },
];

const helpTopics = [
  { icon: ShoppingCart, title: "Customer Orders", detail: "Order status, payment confirmations, delivery updates, and customer changes." },
  { icon: Factory, title: "Production Tracking", detail: "Work order stages, workshop capacity, due dates, and quality checks." },
  { icon: Building2, title: "Supplier Coordination", detail: "Material requests, supplier confirmations, purchase orders, and low stock alerts." },
  { icon: Bell, title: "Notifications", detail: "Supplier and customer notification routing, unread alerts, and Socket.IO status." },
];

const vendorFaqs = [
  {
    question: "How do I create a customer order?",
    answer: "Open the vendor dashboard and use New Order. Submitted orders are added to Recent Orders and All Customer Orders.",
  },
  {
    question: "How do supplier notifications work?",
    answer: "When a work order is created, the vendor dashboard publishes a supplier notification through the Socket.IO notification channel.",
  },
  {
    question: "What is a support ticket?",
    answer: "A ticket is a support request sent to the admin/support team so they can track and resolve the issue.",
  },
  {
    question: "Where can I change notification preferences?",
    answer: "Open Vendor Settings and use the Notifications section to enable or disable customer, supplier, email, SMS, and production alerts.",
  },
];

function VendorDashboardPage() {
  const [notice, setNotice] = useState("Vendor dashboard loaded.");
  const [range, setRange] = useState("Last 6 Months");
  const [alerts, setAlerts] = useState(initialAlerts);
  const [resolvedAlerts, setResolvedAlerts] = useState([]);
  const [orderItems, setOrderItems] = useState(() => getStoredVendorOrders());
  const [workOrders, setWorkOrders] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [notifications, setNotifications] = useState(() => [...getStoredVendorAdminNotifications(), ...initialNotifications]);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const [notificationSocket, setNotificationSocket] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState("Connecting");

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";
    const socket = io(socketUrl, {
      autoConnect: true,
      reconnectionAttempts: 3,
      transports: ["websocket", "polling"],
    });

    const handleConnect = () => {
      setNotificationStatus("Connected");
      socket.emit("notification:join", { room: "woodverse-notifications", actor: "Vendor Dashboard" });
    };
    const handleDisconnect = () => setNotificationStatus("Offline");
    const handleConnectError = () => setNotificationStatus("Offline");
    const handleNotification = (incoming) => {
      setNotifications((items) => {
        if (items.some((item) => item.id === incoming.id)) return items;
        return [{ ...incoming, time: incoming.time || "Just now" }, ...items];
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("notification:event", handleNotification);
    setNotificationSocket(socket);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("notification:event", handleNotification);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(vendorOrdersStorageKey, JSON.stringify(orderItems));
    } catch {}
  }, [orderItems]);

  const clearAlert = (id) => {
    const alert = alerts.find((item) => item.id === id);
    if (alert) setResolvedAlerts((items) => [{ ...alert, resolvedAt: "Just now" }, ...items]);
    setAlerts((items) => items.filter((item) => item.id !== id));
    setNotice("Alert marked as managed.");
  };

  const resolveAllAlerts = () => {
    if (alerts.length === 0) {
      setNotice("No active alerts to manage.");
      return;
    }
    setResolvedAlerts((items) => [...alerts.map((alert) => ({ ...alert, resolvedAt: "Just now" })), ...items]);
    setAlerts([]);
    setNotice("All active alerts marked as managed.");
  };

  const restoreAlert = (id) => {
    const alert = resolvedAlerts.find((item) => item.id === id);
    if (!alert) return;
    const { resolvedAt, ...restoredAlert } = alert;
    setAlerts((items) => [restoredAlert, ...items]);
    setResolvedAlerts((items) => items.filter((item) => item.id !== id));
    setNotice(`${alert.title} restored to active alerts.`);
  };

  const publishNotification = (notification) => {
    const payload = {
      id: notification.id || `local-notice-${Date.now()}`,
      time: notification.time || "Just now",
      ...notification,
    };
    setNotifications((items) => [payload, ...items]);
    notificationSocket?.emit("notification:send", {
      room: "woodverse-notifications",
      audience: payload.audience,
      source: payload.source,
      title: payload.title,
      message: payload.message,
    });
  };

  const createOrder = (form) => {
    const numericIds = orderItems.map((order) => Number(order.id.replace("#WV-", ""))).filter(Boolean);
    const nextId = `#WV-${Math.max(...numericIds, 9482) + 1}`;
    const amount = form.amount.trim().toUpperCase().startsWith("LKR") ? form.amount.trim() : `LKR ${form.amount.trim()}`;
    setOrderItems((items) => [
      {
        id: nextId,
        customer: form.customer,
        initials: getInitials(form.customer),
        product: form.product,
        date: "Today",
        dueDate: form.dueDate,
        amount,
        status: "Vendor Approval",
        tone: getOrderTone("Vendor Approval"),
        requiresManufacturing: true,
        fulfillmentPlan: [{
          name: form.product,
          quantity: 1,
          decision: "manufacture",
          label: "Manufacture",
          reason: "Manual vendor order needs stock review before production.",
        }],
      },
      ...items,
    ]);
    publishNotification({
      audience: "Customer",
      source: form.customer,
      title: `Customer order ${nextId} created`,
      message: `${form.product} order was created with ${amount} value and due date ${form.dueDate}.`,
    });
    setActiveModal(null);
    setNotice(`New order ${nextId} created for ${form.customer} and waiting for vendor approval.`);
  };

  const createWorkOrder = (form) => {
    const { workOrder } = createStoredProductionWorkOrder(form);
    setWorkOrders((items) => [workOrder, ...items]);
    publishNotification({
      audience: "Supplier",
      source: "Vendor Production",
      title: `Supplier material check for ${workOrder.id}`,
      message: `${workOrder.quantity} units of ${workOrder.product} moved to ${workOrder.stage}. Confirm material availability before ${workOrder.dueDate}.`,
    });
    setActiveModal(null);
    setNotice(`Work order ${workOrder.id} created for ${workOrder.product}. It is now available in Production Tracking.`);
  };

  const markNotificationRead = (id) => {
    setReadNotificationIds((items) => (items.includes(id) ? items : [...items, id]));
    setNotice("Notification marked as read.");
  };

  const markAllNotificationsRead = () => {
    setReadNotificationIds(notifications.map((item) => item.id));
    setNotice("All notifications marked as read.");
  };

  const sendDemoNotification = (audience) => {
    publishNotification({
      audience,
      source: audience === "Supplier" ? "Lumbini Timber Co." : "Customer Portal",
      title: audience === "Supplier" ? "Supplier delivery confirmation" : "Customer order update",
      message: audience === "Supplier" ? "Supplier confirmed raw material dispatch for tomorrow morning." : "Customer confirmed preferred delivery window for the active order.",
    });
    setNotice(`${audience} notification sent through Socket.IO.`);
  };

  const unreadNotifications = notifications.filter((item) => !readNotificationIds.includes(item.id)).length;

  return (
    <main className="min-h-screen bg-[#f8f4ec] text-[#303833]">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Dashboard" onNavigate={setNotice} onNewOrder={() => setActiveModal("newOrder")} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setActiveModal("notifications")} unreadCount={unreadNotifications} status={notificationStatus} />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Overview</p>
                <h1 className="mt-2 text-2xl font-semibold leading-tight text-[#202621] sm:text-3xl">
                  Welcome back. Here is what is happening with WoodVerse today.
                </h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setNotice("Add product form opened.")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#bfc6c1] bg-white px-4 text-sm font-extrabold text-[#115745] shadow-sm transition hover:bg-[#eef4ef]">
                  <PlusCircle className="h-5 w-5" />
                  Add New Product
                </button>
                <button onClick={() => setActiveModal("workOrder")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0d4638]">
                  <PackagePlus className="h-5 w-5" />
                  Create Work Order
                </button>
              </div>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">
              {notice}
            </div>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {stats.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-12">
              <article className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6 xl:col-span-8">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#202621]">Monthly Sales Performance</h2>
                    <p className="mt-1 text-sm text-[#66716b]">Revenue tracking for teak and mahogany collections.</p>
                  </div>
                  <select value={range} onChange={(event) => { setRange(event.target.value); setNotice(`Sales range changed to ${event.target.value}.`); }} className="min-h-10 rounded-md border border-[#c4cbc7] bg-[#f8f4ec] px-3 text-sm font-semibold outline-none">
                    <option>Last 6 Months</option>
                    <option>Last 3 Months</option>
                    <option>This Year</option>
                  </select>
                </div>
                <SalesChart range={range} />
              </article>

              <article className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6 xl:col-span-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#202621]">Production Stages</h2>
                    <p className="mt-1 text-sm leading-relaxed text-[#66716b]">Workload distribution across artisan workshops.</p>
                  </div>
                  <span className="rounded-full bg-[#eef4ef] px-3 py-1 text-xs font-extrabold uppercase text-[#115745]">Live</span>
                </div>
                <div className="mt-7 grid place-items-center">
                  <DonutChart />
                </div>
                <div className="mt-7 grid gap-3">
                  {[
                    ["Carpentry", "45%", "bg-[#115745]"],
                    ["Polishing", "28%", "bg-[#8b5633]"],
                    ["Upholstery", "27%", "bg-[#334f35]"],
                  ].map(([label, value, color]) => (
                    <div key={label} className="flex items-center justify-between gap-4 rounded-lg bg-[#f8f4ec] px-4 py-3 text-sm font-semibold">
                      <span className="flex items-center gap-3"><span className={`h-3 w-3 rounded-full ${color}`} />{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-12">
              <RecentOrders orders={orderItems} onViewAll={() => setActiveModal("allOrders")} />
              <SystemAlerts alerts={alerts} onClear={clearAlert} onManageAll={() => setActiveModal("alerts")} />
            </section>

            {workOrders.length > 0 && <WorkOrderQueue workOrders={workOrders} />}
          </div>
        </section>
      </div>

      {activeModal === "newOrder" && <NewOrderModal onClose={() => setActiveModal(null)} onSubmit={createOrder} />}
      {activeModal === "workOrder" && <WorkOrderModal onClose={() => setActiveModal(null)} onSubmit={createWorkOrder} />}
      {activeModal === "allOrders" && <AllOrdersModal orders={orderItems} onClose={() => setActiveModal(null)} />}
      {activeModal === "alerts" && <AlertManagerModal alerts={alerts} resolvedAlerts={resolvedAlerts} onClose={() => setActiveModal(null)} onResolve={clearAlert} onResolveAll={resolveAllAlerts} onRestore={restoreAlert} />}
      {activeModal === "notifications" && <NotificationCenterModal notifications={notifications} readIds={readNotificationIds} status={notificationStatus} onClose={() => setActiveModal(null)} onRead={markNotificationRead} onReadAll={markAllNotificationsRead} onSendDemo={sendDemoNotification} />}
    </main>
  );
}

function VendorProductsPage() {
  const [notice, setNotice] = useState("Products loaded.");
  const [products, setProducts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-vendor-products") || "null") || initialVendorProducts;
    } catch {
      return initialVendorProducts;
    }
  });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [activeProduct, setActiveProduct] = useState(null);
  const [modalMode, setModalMode] = useState(null);

  const filteredProducts = products.filter((product) => {
    const matchesQuery = `${product.name} ${product.category} ${product.material}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All" || product.status === status;
    return matchesQuery && matchesStatus;
  });
  const publishedCount = products.filter((product) => product.status === "Published").length;
  const lowStockCount = products.filter((product) => product.stock <= 10).length;

  useEffect(() => {
    try {
      localStorage.setItem("woodverse-vendor-products", JSON.stringify(products));
    } catch {}
  }, [products]);

  const openAddProduct = () => {
    setActiveProduct(null);
    setModalMode("product");
  };

  const openEditProduct = (product) => {
    setActiveProduct(product);
    setModalMode("product");
  };

  const saveProduct = (form) => {
    const normalizedProduct = {
      ...form,
      name: form.name.trim(),
      material: form.material.trim(),
      price: normalizeLkrPrice(form.price),
      stock: Math.max(0, Number(form.stock)),
    };
    if (activeProduct) {
      setProducts((items) => items.map((item) => (item.id === activeProduct.id ? { ...item, ...normalizedProduct } : item)));
      setStatus(normalizedProduct.status);
      setQuery("");
      setNotice(`${normalizedProduct.name} updated.`);
    } else {
      const numericIds = products.map((item) => Number(item.id.replace("VP-", ""))).filter(Boolean);
      const nextId = `VP-${Math.max(...numericIds, 1000) + 1}`;
      setProducts((items) => [{ id: nextId, ...normalizedProduct }, ...items]);
      setStatus(normalizedProduct.status);
      setQuery("");
      setNotice(`${normalizedProduct.name} added to vendor products as ${nextId}.`);
    }
    setModalMode(null);
    setActiveProduct(null);
  };

  const updateStatus = (id, nextStatus) => {
    setProducts((items) => items.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)));
    setStatus(nextStatus);
    setQuery("");
    publishAdminEvent("Vendor", `Order ${order.id} ${nextStatus.toLowerCase()}`, `Vendor updated ${order.customer}'s order to ${nextStatus}.${approvalResult?.workOrder ? ` Work order ${approvalResult.workOrder.id} is linked.` : ""}`, nextStatus === "Approved" ? "High" : "Normal");
    setNotice(`Product ${id} marked as ${nextStatus}.`);
  };

  const restockProduct = (product) => {
    setProducts((items) => items.map((item) => (item.id === product.id ? { ...item, stock: item.stock + 10 } : item)));
    setNotice(`${product.name} stock increased by 10 units.`);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] text-[#303833]">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Products" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Notifications are available from the Dashboard page.")} unreadCount={0} status="Products" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#202621]">Products</h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#66716b]">
                  Manage vendor catalog items, stock, pricing, and publish status for customer-facing products.
                </p>
              </div>
              <button onClick={openAddProduct} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0d4638]">
                <PlusCircle className="h-5 w-5" />
                Add Product
              </button>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">
              {notice}
            </div>

            <section className="grid gap-4 md:grid-cols-3">
              <ProductStat icon={Archive} label="Total Products" value={String(products.length).padStart(2, "0")} />
              <ProductStat icon={CheckCircle2} label="Published" value={String(publishedCount).padStart(2, "0")} />
              <ProductStat icon={AlertTriangle} label="Low Stock" value={String(lowStockCount).padStart(2, "0")} warning />
            </section>

            <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <label className="flex min-h-11 items-center rounded-lg border border-[#c4cbc7] bg-white px-3 text-[#747a76]">
                  <Search className="h-4 w-4 shrink-0" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search products, category, material..." />
                </label>
                <div className="flex flex-wrap gap-2">
                  {["All", "Published", "Draft", "Archived"].map((item) => (
                    <button key={item} onClick={() => setStatus(item)} className={`min-h-10 rounded-lg px-4 text-sm font-extrabold ${status === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onEdit={() => openEditProduct(product)} onRestock={() => restockProduct(product)} onStatus={updateStatus} />
                ))}
              </div>
              {filteredProducts.length === 0 && <p className="rounded-lg bg-[#f8f4ec] p-5 text-sm font-semibold text-[#66716b]">No products match this filter.</p>}
            </section>
          </div>
        </section>
      </div>

      {modalMode === "product" && <ProductFormModal product={activeProduct} onClose={() => { setModalMode(null); setActiveProduct(null); }} onSubmit={saveProduct} />}
    </main>
  );
}

function VendorCustomerOrdersPage() {
  const [notice, setNotice] = useState("Customer orders loaded.");
  const [orders, setOrders] = useState(() => {
    try {
      return getStoredVendorOrders();
    } catch {
      return initialOrders;
    }
  });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const vendorProducts = getStoredVendorProducts();

  useEffect(() => {
    try {
      localStorage.setItem(vendorOrdersStorageKey, JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      if (localStorage.getItem(vendorOpenNewOrderStorageKey) === "true") {
        localStorage.removeItem(vendorOpenNewOrderStorageKey);
        setActiveModal("newOrder");
        setNotice("New customer order form opened.");
      }
    } catch {}
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesQuery = `${order.id} ${order.customer} ${order.product}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All" || order.status === status;
    return matchesQuery && matchesStatus;
  });
  const pendingCount = orders.filter((order) => order.status !== "Completed" && order.status !== "Cancelled").length;
  const completedCount = orders.filter((order) => order.status === "Completed").length;
  const totalValue = filteredOrders.reduce((sum, order) => sum + parseOrderAmount(order.amount), 0);
  const supplyWarnings = orders
    .map((order) => ({ order, check: getOrderSupplyCheck(order, vendorProducts) }))
    .filter(({ check }) => check.level !== "available");

  const createOrder = (form) => {
    const numericIds = orders.map((order) => Number(order.id.replace("#WV-", ""))).filter(Boolean);
    const nextId = `#WV-${Math.max(...numericIds, 9482) + 1}`;
    const amount = form.amount.trim().toUpperCase().startsWith("LKR") ? form.amount.trim() : `LKR ${form.amount.trim()}`;
    setOrders((items) => [
      {
        id: nextId,
        customer: form.customer,
        initials: getInitials(form.customer),
        product: form.product,
        date: "Today",
        dueDate: form.dueDate,
        amount,
        status: "Vendor Approval",
        tone: getOrderTone("Vendor Approval"),
        requiresManufacturing: true,
        fulfillmentPlan: [{
          name: form.product,
          quantity: 1,
          decision: "manufacture",
          label: "Manufacture",
          reason: "Manual vendor order needs stock review before production.",
        }],
      },
      ...items,
    ]);
    setStatus("All");
    setQuery("");
    setActiveModal(null);
    setNotice(`Customer order ${nextId} created and waiting for vendor approval.`);
  };

  const updateOrderStatus = (order, nextStatus) => {
    const approvalResult = nextStatus === "Approved" ? createProductionWorkOrderFromCustomerOrder(order) : null;
    setOrders((items) => items.map((item) => (
      item.id === order.id
        ? { ...item, status: nextStatus, tone: getOrderTone(nextStatus), workOrderId: approvalResult?.workOrder?.id || item.workOrderId }
        : item
    )));
    setActiveOrder((current) => (
      current?.id === order.id
        ? { ...current, status: nextStatus, tone: getOrderTone(nextStatus), workOrderId: approvalResult?.workOrder?.id || current.workOrderId }
        : current
    ));
    setStatus(nextStatus);
    setQuery("");
    if (approvalResult) {
      if (approvalResult.skipped) {
        setNotice(`${order.id} approved. All items are in stock, so no production work order was created.`);
        return;
      }
      setNotice(approvalResult.created
        ? `${order.id} approved and sent to Production Tracking as ${approvalResult.workOrder.id}.`
        : `${order.id} approved. ${approvalResult.workOrder.id} is already in Production Tracking.`);
      return;
    }
    setNotice(`${order.id} updated to ${nextStatus}.`);
  };

  const openOrder = (order) => {
    setActiveOrder(order);
    setActiveModal("details");
  };

  const createWorkOrderFromOrder = (order) => {
    const result = createProductionWorkOrderFromCustomerOrder(order, {
      priority: order.status === "Awaiting Payment" ? "Normal Priority" : "High Priority",
      notes: `Created from customer order ${order.id}.`,
    });
    if (result.skipped) {
      setNotice(`${order.id} is in stock. No production work order is needed.`);
      setActiveModal(null);
      return;
    }
    setOrders((items) => items.map((item) => (item.id === order.id ? { ...item, workOrderId: result.workOrder.id } : item)));
    setNotice(result.created
      ? `${result.workOrder.id} created from ${order.id}. Open Production Tracking to manage workshop stages.`
      : `${result.workOrder.id} already exists for ${order.id} in Production Tracking.`);
    setActiveModal(null);
  };

  const messageCustomer = (order) => {
    setNotice(`Message draft opened for ${order.customer} about ${order.id}.`);
    setActiveModal(null);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] text-[#303833]">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Customer Orders" onNavigate={setNotice} onNewOrder={() => setActiveModal("newOrder")} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Notifications are available from the Dashboard page.")} unreadCount={0} status="Orders" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#202621]">Customer Orders</h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#66716b]">
                  Track customer orders, update fulfillment status, message customers, and create production work orders.
                </p>
              </div>
              <button onClick={() => setActiveModal("newOrder")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0d4638]">
                <PlusCircle className="h-5 w-5" />
                New Customer Order
              </button>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">
              {notice}
            </div>

            <section className="grid gap-4 md:grid-cols-3">
              <ProductStat icon={ShoppingCart} label="Total Orders" value={String(orders.length).padStart(2, "0")} />
              <ProductStat icon={Clock3} label="Pending Work" value={String(pendingCount).padStart(2, "0")} warning />
              <ProductStat icon={CheckCircle2} label="Completed" value={String(completedCount).padStart(2, "0")} />
            </section>

            {supplyWarnings.length > 0 && <SupplyWarningPanel warnings={supplyWarnings} onReview={(order) => openOrder(order)} />}

            <section className="overflow-hidden rounded-xl border border-[#c2cac5] bg-white shadow-sm">
              <div className="grid gap-3 border-b border-[#d9d5cd] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center sm:px-6">
                <label className="flex min-h-11 items-center rounded-lg border border-[#c4cbc7] bg-white px-3 text-[#747a76]">
                  <Search className="h-4 w-4 shrink-0" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search order, customer, product..." />
                </label>
                <div className="flex flex-wrap gap-2">
                  {["All", "Vendor Approval", "Approved", "Processing", "Awaiting Payment", "Completed", "Cancelled"].map((item) => (
                    <button key={item} onClick={() => setStatus(item)} className={`min-h-10 rounded-lg px-3 text-sm font-extrabold ${status === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[0.85fr_1.25fr_1.35fr_0.9fr_1fr_1fr_1.15fr_0.8fr] bg-[#f3eee6] px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-[#56605b] max-xl:hidden">
                <span>Order</span><span>Customer</span><span>Product</span><span>Due</span><span>Amount</span><span>Status</span><span>Supply Check</span><span>Actions</span>
              </div>
              <div className="divide-y divide-[#d9d5cd]">
                {filteredOrders.map((order) => {
                  const supplyCheck = getOrderSupplyCheck(order, vendorProducts);
                  return (
                    <article key={order.id} className="grid grid-cols-[0.85fr_1.25fr_1.35fr_0.9fr_1fr_1fr_1.15fr_0.8fr] items-center gap-4 px-5 py-5 text-sm max-xl:grid-cols-1 sm:px-6">
                      <strong className="text-[#202621]">{order.id}</strong>
                      <span className="grid grid-cols-[32px_minmax(0,1fr)] items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2f6757] text-xs font-bold text-white">{order.initials}</span>
                        <span className="min-w-0 font-semibold">{order.customer}</span>
                      </span>
                      <span className="font-semibold text-[#3d4541]">{order.product}</span>
                      <span className="text-[#66716b]">{order.dueDate}</span>
                      <strong>{order.amount}</strong>
                      <select value={order.status} onChange={(event) => updateOrderStatus(order, event.target.value)} className={`min-h-10 w-fit rounded-full border-0 px-3 text-xs font-extrabold uppercase outline-none ${order.tone}`}>
                        <option>Vendor Approval</option>
                        <option>Approved</option>
                        <option>Processing</option>
                        <option>Awaiting Payment</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                      </select>
                      <SupplyCheckBadge check={supplyCheck} />
                      <button onClick={() => openOrder(order)} className="min-h-10 rounded-lg bg-[#eef4ef] px-3 text-sm font-extrabold text-[#115745]">View</button>
                    </article>
                  );
                })}
              </div>
              {filteredOrders.length === 0 && <p className="m-5 rounded-lg bg-[#f8f4ec] p-5 text-sm font-semibold text-[#66716b]">No customer orders match this filter.</p>}
            </section>

            <div className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
              <span className="text-xs font-extrabold uppercase tracking-wide text-[#66716b]">Filtered Order Value</span>
              <strong className="mt-1 block text-2xl text-[#202621]">LKR {totalValue.toLocaleString("en-US")}</strong>
            </div>
          </div>
        </section>
      </div>

      {activeModal === "newOrder" && <NewOrderModal onClose={() => setActiveModal(null)} onSubmit={createOrder} />}
      {activeModal === "details" && activeOrder && <OrderDetailsModal order={activeOrder} supplyCheck={getOrderSupplyCheck(activeOrder, vendorProducts)} onClose={() => setActiveModal(null)} onStatus={updateOrderStatus} onWorkOrder={createWorkOrderFromOrder} onMessage={messageCustomer} />}
    </main>
  );
}

function VendorQuotationsPage() {
  const [notice, setNotice] = useState("Quotations loaded.");
  const [quotations, setQuotations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-vendor-quotations") || "null") || initialQuotations;
    } catch {
      return initialQuotations;
    }
  });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [activeQuote, setActiveQuote] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("woodverse-vendor-quotations", JSON.stringify(quotations));
    } catch {}
  }, [quotations]);

  const filteredQuotes = quotations.filter((quote) => {
    const matchesQuery = `${quote.id} ${quote.customer} ${quote.product}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All" || quote.status === status;
    return matchesQuery && matchesStatus;
  });
  const totalValue = filteredQuotes.reduce((sum, quote) => sum + parseOrderAmount(quote.amount), 0);
  const pendingQuotes = quotations.filter((quote) => ["Draft", "Sent"].includes(quote.status)).length;
  const approvedQuotes = quotations.filter((quote) => quote.status === "Approved").length;

  const openNewQuote = () => {
    setActiveQuote(null);
    setModalOpen(true);
  };

  const openEditQuote = (quote) => {
    setActiveQuote(quote);
    setModalOpen(true);
  };

  const saveQuote = (form) => {
    const normalizedQuote = {
      ...form,
      customer: form.customer.trim(),
      product: form.product.trim(),
      amount: normalizeLkrPrice(form.amount),
    };
    if (activeQuote) {
      setQuotations((items) => items.map((item) => (item.id === activeQuote.id ? { ...item, ...normalizedQuote } : item)));
      setNotice(`${activeQuote.id} updated.`);
    } else {
      const numericIds = quotations.map((quote) => Number(quote.id.replace("QT-", ""))).filter(Boolean);
      const nextId = `QT-${Math.max(...numericIds, 7800) + 1}`;
      setQuotations((items) => [{ id: nextId, date: "Today", ...normalizedQuote }, ...items]);
      setNotice(`${nextId} created for ${normalizedQuote.customer}.`);
    }
    setStatus(normalizedQuote.status);
    setQuery("");
    setActiveQuote(null);
    setModalOpen(false);
  };

  const updateQuoteStatus = (quote, nextStatus) => {
    setQuotations((items) => items.map((item) => (item.id === quote.id ? { ...item, status: nextStatus } : item)));
    setStatus(nextStatus);
    setQuery("");
    setNotice(`${quote.id} marked as ${nextStatus}.`);
  };

  const convertQuoteToOrder = (quote) => {
    const order = {
      id: getNextStoredVendorOrderId(),
      customer: quote.customer,
      initials: getInitials(quote.customer),
      product: quote.product,
      date: "Today",
      dueDate: quote.validUntil,
      amount: quote.amount,
      status: "Processing",
      tone: getOrderTone("Processing"),
      source: quote.id,
    };
    try {
      const existingOrders = JSON.parse(localStorage.getItem("woodverse-vendor-orders") || "null") || initialOrders;
      localStorage.setItem("woodverse-vendor-orders", JSON.stringify([order, ...existingOrders]));
    } catch {}
    setQuotations((items) => items.map((item) => (item.id === quote.id ? { ...item, status: "Converted" } : item)));
    setStatus("Converted");
    setNotice(`${quote.id} converted to customer order ${order.id}.`);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] text-[#303833]">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Quotations" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Notifications are available from the Dashboard page.")} unreadCount={0} status="Quotes" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#202621]">Quotations</h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#66716b]">
                  Prepare custom furniture estimates, send quotes to customers, and convert approved quotes into customer orders.
                </p>
              </div>
              <button onClick={openNewQuote} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0d4638]">
                <PlusCircle className="h-5 w-5" />
                Create Quotation
              </button>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">{notice}</div>

            <section className="grid gap-4 md:grid-cols-3">
              <ProductStat icon={FileText} label="Total Quotes" value={String(quotations.length).padStart(2, "0")} />
              <ProductStat icon={Clock3} label="Pending" value={String(pendingQuotes).padStart(2, "0")} warning />
              <ProductStat icon={CheckCircle2} label="Approved" value={String(approvedQuotes).padStart(2, "0")} />
            </section>

            <section className="overflow-hidden rounded-xl border border-[#c2cac5] bg-white shadow-sm">
              <div className="grid gap-3 border-b border-[#d9d5cd] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center sm:px-6">
                <label className="flex min-h-11 items-center rounded-lg border border-[#c4cbc7] bg-white px-3 text-[#747a76]">
                  <Search className="h-4 w-4 shrink-0" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search quotation, customer, product..." />
                </label>
                <div className="flex flex-wrap gap-2">
                  {["All", "Draft", "Sent", "Approved", "Converted", "Expired"].map((item) => (
                    <button key={item} onClick={() => setStatus(item)} className={`min-h-10 rounded-lg px-3 text-sm font-extrabold ${status === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[0.9fr_1.3fr_1.4fr_1fr_1fr_1fr_1.4fr] bg-[#f3eee6] px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-[#56605b] max-xl:hidden">
                <span>Quote</span><span>Customer</span><span>Product</span><span>Valid Until</span><span>Amount</span><span>Status</span><span>Actions</span>
              </div>
              <div className="divide-y divide-[#d9d5cd]">
                {filteredQuotes.map((quote) => (
                  <article key={quote.id} className="grid grid-cols-[0.9fr_1.3fr_1.4fr_1fr_1fr_1fr_1.4fr] items-center gap-4 px-5 py-5 text-sm max-xl:grid-cols-1 sm:px-6">
                    <strong className="text-[#202621]">{quote.id}</strong>
                    <span className="font-semibold">{quote.customer}</span>
                    <span className="font-semibold text-[#3d4541]">{quote.product}</span>
                    <span className="text-[#66716b]">{quote.validUntil}</span>
                    <strong>{quote.amount}</strong>
                    <span className={`w-fit rounded-full px-3 py-2 text-xs font-extrabold uppercase ${getQuoteTone(quote.status)}`}>{quote.status}</span>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openEditQuote(quote)} className="min-h-9 rounded-lg border border-[#c4cbc7] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Edit</button>
                      <button onClick={() => updateQuoteStatus(quote, "Sent")} className="min-h-9 rounded-lg bg-[#eef4ef] px-3 text-xs font-extrabold text-[#115745]">Send</button>
                      <button onClick={() => convertQuoteToOrder(quote)} disabled={!["Approved", "Sent"].includes(quote.status)} className="min-h-9 rounded-lg bg-[#115745] px-3 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:bg-[#c9c3b8]">Convert</button>
                    </div>
                  </article>
                ))}
              </div>
              {filteredQuotes.length === 0 && <p className="m-5 rounded-lg bg-[#f8f4ec] p-5 text-sm font-semibold text-[#66716b]">No quotations match this filter.</p>}
            </section>

            <div className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
              <span className="text-xs font-extrabold uppercase tracking-wide text-[#66716b]">Filtered Quote Value</span>
              <strong className="mt-1 block text-2xl text-[#202621]">LKR {totalValue.toLocaleString("en-US")}</strong>
            </div>
          </div>
        </section>
      </div>

      {modalOpen && <QuotationFormModal quote={activeQuote} onClose={() => { setModalOpen(false); setActiveQuote(null); }} onSubmit={saveQuote} />}
    </main>
  );
}

function VendorProductionTrackingPage() {
  const [notice, setNotice] = useState("Production tracking loaded.");
  const [works, setWorks] = useState(() => {
    return getStoredProductionWorks();
  });
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("All");
  const [activeWork, setActiveWork] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(vendorProductionStorageKey, JSON.stringify(works));
    } catch {}
  }, [works]);

  const filteredWorks = works.filter((work) => {
    const matchesQuery = `${work.id} ${work.orderId} ${work.product} ${work.customer} ${work.assignedTo}`.toLowerCase().includes(query.toLowerCase());
    const matchesStage = stage === "All" || work.stage === stage;
    return matchesQuery && matchesStage;
  });
  const activeCount = works.filter((work) => work.stage !== "Completed").length;
  const completedCount = works.filter((work) => work.stage === "Completed").length;
  const urgentCount = works.filter((work) => work.priority === "High Priority" && work.stage !== "Completed").length;

  const openNewWork = () => {
    setActiveWork(null);
    setModalOpen(true);
  };

  const openEditWork = (work) => {
    setActiveWork(work);
    setModalOpen(true);
  };

  const saveWork = (form) => {
    const normalizedWork = {
      ...form,
      product: form.product.trim(),
      customer: form.customer.trim(),
      quantity: Math.max(1, Number(form.quantity)),
    };
    if (activeWork) {
      setWorks((items) => items.map((item) => (item.id === activeWork.id ? { ...item, ...normalizedWork } : item)));
      setNotice(`${activeWork.id} updated.`);
    } else {
      const { workOrder, updatedWorks } = createStoredProductionWorkOrder(normalizedWork);
      setWorks(updatedWorks);
      setNotice(`${workOrder.id} created for ${workOrder.product}.`);
    }
    setStage(normalizedWork.stage);
    setQuery("");
    setActiveWork(null);
    setModalOpen(false);
  };

  const updateWorkStage = (work, nextStage) => {
    setWorks((items) => items.map((item) => (item.id === work.id ? { ...item, stage: nextStage } : item)));
    setStage(nextStage);
    setQuery("");
    setNotice(`${work.id} moved to ${nextStage}.`);
  };

  const moveNextStage = (work) => {
    const currentIndex = productionStages.indexOf(work.stage);
    const nextStage = productionStages[Math.min(currentIndex + 1, productionStages.length - 1)];
    updateWorkStage(work, nextStage);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] text-[#303833]">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Production Tracking" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Production alerts are connected from the Dashboard notifications.")} unreadCount={0} status="Production" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#202621]">Production Tracking</h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#66716b]">
                  Track active work orders, move items through workshop stages, and monitor production readiness.
                </p>
              </div>
              <button onClick={openNewWork} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0d4638]">
                <PackagePlus className="h-5 w-5" />
                Create Work Order
              </button>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">{notice}</div>

            <section className="grid gap-4 md:grid-cols-3">
              <ProductStat icon={Factory} label="Active Works" value={String(activeCount).padStart(2, "0")} />
              <ProductStat icon={AlertTriangle} label="High Priority" value={String(urgentCount).padStart(2, "0")} warning />
              <ProductStat icon={CheckCircle2} label="Completed" value={String(completedCount).padStart(2, "0")} />
            </section>

            <section className="grid gap-4 rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <label className="flex min-h-11 items-center rounded-lg border border-[#c4cbc7] bg-white px-3 text-[#747a76]">
                  <Search className="h-4 w-4 shrink-0" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search work order, order, product, customer..." />
                </label>
                <div className="flex flex-wrap gap-2">
                  {["All", ...productionStages].map((item) => (
                    <button key={item} onClick={() => setStage(item)} className={`min-h-10 rounded-lg px-3 text-sm font-extrabold ${stage === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {filteredWorks.map((work) => (
                  <ProductionWorkCard key={work.id} work={work} onEdit={() => openEditWork(work)} onStage={updateWorkStage} onNext={() => moveNextStage(work)} />
                ))}
              </div>
              {filteredWorks.length === 0 && <p className="rounded-lg bg-[#f8f4ec] p-5 text-sm font-semibold text-[#66716b]">No production work orders match this filter.</p>}
            </section>
          </div>
        </section>
      </div>

      {modalOpen && <ProductionWorkModal work={activeWork} onClose={() => { setModalOpen(false); setActiveWork(null); }} onSubmit={saveWork} />}
    </main>
  );
}

function VendorSuppliersPage() {
  const [notice, setNotice] = useState("Supplier coordination loaded.");
  const [requests, setRequests] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-vendor-material-requests") || "null") || initialMaterialRequests;
    } catch {
      return initialMaterialRequests;
    }
  });
  const [material, setMaterial] = useState("Mahogany");
  const [quantity, setQuantity] = useState("40 planks");
  const [supplierId, setSupplierId] = useState(vendorSupplierDirectory[0].id);
  const [linkedWork, setLinkedWork] = useState("WO-0417");
  const requestFormRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem("woodverse-vendor-material-requests", JSON.stringify(requests));
    } catch {}
  }, [requests]);

  const preferredSupplier = vendorSupplierDirectory.find((supplier) => supplier.id === supplierId) || vendorSupplierDirectory[0];
  const lowStockMaterials = supplierMaterialStock.filter((item) => item.available <= 3);
  const activeRequests = requests.filter((request) => request.status !== "Received").length;

  const selectSupplier = (supplier) => {
    setSupplierId(supplier.id);
    setMaterial(getSupplierDefaultMaterial(supplier));
    setNotice(`${supplier.name} selected. The material request form is ready for this supplier.`);
    window.setTimeout(() => {
      requestFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const prepareMaterialRequest = (stockItem) => {
    const supplier = getSupplierForMaterial(stockItem.material) || preferredSupplier;
    const decision = getMaterialStockDecision(stockItem);
    setSupplierId(supplier.id);
    setMaterial(stockItem.material);
    setQuantity(decision.requestQuantity);
    setNotice(`${stockItem.material} request prepared with ${supplier.name}. Review the linked work order, then send the request.`);
    window.setTimeout(() => {
      requestFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const createMaterialRequest = (event) => {
    event.preventDefault();
    if (!preferredSupplier?.name) {
      setNotice("Select a supplier before sending the request.");
      return;
    }
    if (!material.trim() || !quantity.trim() || !linkedWork.trim()) {
      setNotice("Supplier, material, quantity, and linked work order are required.");
      return;
    }
    const numericIds = requests.map((request) => Number(request.id.replace("MR-", ""))).filter(Boolean);
    const nextId = `MR-${Math.max(...numericIds, 1208) + 1}`;
    const request = {
      id: nextId,
      supplier: preferredSupplier.name,
      supplierId: preferredSupplier.id,
      material,
      quantity,
      linkedWork,
      status: "Requested",
      dueDate: getFutureDateLabel(5),
      vendor: "Perera Artisan Works",
      sentAt: "Just now",
    };
    const supplierRequest = {
      ...request,
      id: `SR-${nextId.replace("MR-", "")}`,
      vendorRequestId: nextId,
      type: "Material Request",
      priority: supplierMaterialStock.find((item) => item.material === material)?.available <= 3 ? "High" : "Normal",
    };
    setRequests((items) => [request, ...items]);
    appendStoredList(supplierIncomingRequestsStorageKey, supplierRequest);
    appendStoredList(supplierNotificationsStorageKey, {
      id: `sn-${Date.now()}`,
      type: "Material Request",
      title: `${request.vendor} requested ${quantity} of ${material}`,
      detail: `Linked work order ${linkedWork}. Requested from ${preferredSupplier.name}; due ${request.dueDate}.`,
      time: "Just now",
      priority: supplierRequest.priority,
      sourceRequestId: supplierRequest.id,
    });
    publishAdminEvent("Vendor", `Material request ${nextId} sent`, `${request.vendor} requested ${quantity} of ${material} from ${preferredSupplier.name} for ${linkedWork}.`, supplierRequest.priority);
    setNotice(`${nextId} sent to ${preferredSupplier.name}. It is now visible in the supplier portal notifications.`);
  };

  const updateRequestStatus = (request, status) => {
    setRequests((items) => items.map((item) => (item.id === request.id ? { ...item, status } : item)));
    setNotice(`${request.id} updated to ${status}.`);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] text-[#303833]">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Suppliers" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Supplier notifications are available from the Dashboard page.")} unreadCount={0} status="Suppliers" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#202621]">Suppliers</h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#66716b]">
                  Review supplier stock, create material requests, and connect manufacturing work orders with raw material supply.
                </p>
              </div>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">{notice}</div>

            <section className="grid gap-4 md:grid-cols-3">
              <ProductStat icon={Building2} label="Connected Suppliers" value={String(vendorSupplierDirectory.length).padStart(2, "0")} />
              <ProductStat icon={AlertTriangle} label="Low Materials" value={String(lowStockMaterials.length).padStart(2, "0")} warning />
              <ProductStat icon={ClipboardList} label="Active Requests" value={String(activeRequests).padStart(2, "0")} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="grid gap-6">
                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5">
                    <h2 className="text-xl font-semibold text-[#202621]">Supplier Directory</h2>
                    <p className="mt-1 text-sm text-[#66716b]">Approved material partners available to vendor production teams.</p>
                  </div>
                  <div className="grid gap-4">
                    {vendorSupplierDirectory.map((supplier) => {
                      const selected = supplier.id === supplierId;
                      return (
                      <article key={supplier.id} className={`grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_auto] lg:items-center ${selected ? "border-[#115745] bg-[#f3faf4] shadow-sm" : "border-[#d9d5cd] bg-[#fbfaf6]"}`}>
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <strong className="text-[#202621]">{supplier.name}</strong>
                            <span className="rounded-full bg-[#eef4ef] px-2.5 py-1 text-xs font-extrabold uppercase text-[#115745]">{supplier.status}</span>
                            {selected && <span className="rounded-full bg-[#115745] px-2.5 py-1 text-xs font-extrabold uppercase text-white">Selected</span>}
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-[#66716b]">{supplier.material} - {supplier.location} - lead time {supplier.leadTime}</p>
                          <p className="mt-2 text-xs font-bold uppercase text-[#66716b]">Rating {supplier.rating} / Contact {supplier.contact}</p>
                        </div>
                        <button onClick={() => selectSupplier(supplier)} className={`min-h-10 rounded-lg px-4 text-sm font-extrabold ${selected ? "bg-[#d9ecd8] text-[#115745]" : "bg-[#115745] text-white"}`}>
                          {selected ? "Selected" : "Select"}
                        </button>
                      </article>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5">
                    <h2 className="text-xl font-semibold text-[#202621]">Material Requests</h2>
                    <p className="mt-1 text-sm text-[#66716b]">Track requests sent from vendor manufacturing needs to suppliers.</p>
                  </div>
                  <div className="grid gap-3">
                    {requests.map((request) => (
                      <article key={request.id} className="grid gap-3 rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] p-4 md:grid-cols-[1fr_1fr_auto] md:items-center">
                        <div>
                          <strong className="text-[#202621]">{request.id} - {request.material}</strong>
                          <p className="mt-1 text-sm text-[#66716b]">{request.quantity} from {request.supplier}</p>
                        </div>
                        <div className="text-sm">
                          <span className="block font-bold text-[#202621]">{request.linkedWork}</span>
                          <span className="text-[#66716b]">Due {request.dueDate}</span>
                        </div>
                        <select value={request.status} onChange={(event) => updateRequestStatus(request, event.target.value)} className="min-h-10 rounded-lg border border-[#c4cbc7] bg-white px-3 text-sm font-extrabold outline-none">
                          <option>Requested</option>
                          <option>Supplier Confirmed</option>
                          <option>In Transit</option>
                          <option>Received</option>
                        </select>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="grid content-start gap-6">
                <section ref={requestFormRef} className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-xl font-semibold text-[#202621]">Create Material Request</h2>
                  <p className="mt-1 text-sm text-[#66716b]">Selected supplier: <strong className="text-[#115745]">{preferredSupplier.name}</strong></p>
                  <form onSubmit={createMaterialRequest} className="mt-5 grid gap-4">
                    <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
                      Supplier
                      <select
                        value={supplierId}
                        onChange={(event) => {
                          const supplier = vendorSupplierDirectory.find((item) => item.id === event.target.value);
                          if (supplier) selectSupplier(supplier);
                        }}
                        className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-3 font-semibold outline-none transition focus:border-[#115745]"
                      >
                        {vendorSupplierDirectory.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                        ))}
                      </select>
                    </label>
                    <SettingsSelect label="Material" value={material} options={supplierMaterialStock.map((item) => item.material)} onChange={setMaterial} />
                    <SettingsInput label="Quantity" value={quantity} onChange={setQuantity} />
                    <SettingsInput label="Linked Work Order" value={linkedWork} onChange={setLinkedWork} />
                    <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
                      <Send className="h-4 w-4" />
                      Send Request
                    </button>
                  </form>
                </section>

                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-xl font-semibold text-[#202621]">Material Stock Watch</h2>
                  <p className="mt-1 text-sm leading-relaxed text-[#66716b]">Use this to decide whether production can start or a supplier request is needed.</p>
                  <div className="mt-4 grid gap-3">
                    {supplierMaterialStock.map((item) => {
                      const decision = getMaterialStockDecision(item);
                      return (
                        <article key={item.material} className="rounded-lg border border-[#d9d5cd] bg-[#f8f4ec] p-4 text-sm">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <strong className="block text-base text-[#202621]">{item.material}</strong>
                              <span className="mt-1 block text-[#66716b]">Current stock: {item.available} {item.unit}</span>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold uppercase ${decision.tone}`}>{decision.label}</span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="rounded-md bg-white px-3 py-2">
                              <span className="block text-xs font-extrabold uppercase text-[#66716b]">Reorder Point</span>
                              <strong className="text-[#202621]">{decision.reorderPoint} {item.unit}</strong>
                            </div>
                            <div className="rounded-md bg-white px-3 py-2">
                              <span className="block text-xs font-extrabold uppercase text-[#66716b]">Covers</span>
                              <strong className="text-[#202621]">{decision.coverage}</strong>
                            </div>
                          </div>
                          <p className="mt-3 leading-relaxed text-[#4d5651]">{decision.message}</p>
                          <button
                            onClick={() => prepareMaterialRequest(item)}
                            className={`mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg px-3 text-sm font-extrabold ${decision.actionNeeded ? "bg-[#115745] text-white" : "border border-[#115745] bg-white text-[#115745]"}`}
                          >
                            <Send className="h-4 w-4" />
                            {decision.actionLabel} {decision.requestQuantity}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function VendorPurchaseOrdersPage() {
  const [notice, setNotice] = useState("Vendor purchase orders loaded.");
  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(vendorPurchaseOrdersStorageKey) || "null") || initialVendorPurchaseOrders;
    } catch {
      return initialVendorPurchaseOrders;
    }
  });
  const [supplierId, setSupplierId] = useState(vendorSupplierDirectory[0].id);
  const [material, setMaterial] = useState("Mahogany");
  const [quantity, setQuantity] = useState("40");
  const [unit, setUnit] = useState("planks");
  const [unitPrice, setUnitPrice] = useState("4200");
  const [linkedWork, setLinkedWork] = useState("WO-0417");
  const [dueDate, setDueDate] = useState("2026-08-03");
  const [notes, setNotes] = useState("Required for approved manufacturing work.");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    try {
      localStorage.setItem(vendorPurchaseOrdersStorageKey, JSON.stringify(purchaseOrders));
    } catch {}
  }, [purchaseOrders]);

  const selectedSupplier = vendorSupplierDirectory.find((supplier) => supplier.id === supplierId) || vendorSupplierDirectory[0];
  const numericQuantity = Math.max(0, Number(quantity) || 0);
  const numericUnitPrice = Math.max(0, Number(unitPrice) || 0);
  const draftTotal = numericQuantity * numericUnitPrice;
  const filteredOrders = status === "All" ? purchaseOrders : purchaseOrders.filter((order) => order.status === status);
  const sentCount = purchaseOrders.filter((order) => order.status === "Sent").length;
  const draftCount = purchaseOrders.filter((order) => order.status === "Draft").length;
  const receivedCount = purchaseOrders.filter((order) => order.status === "Received").length;

  const selectSupplier = (id) => {
    const supplier = vendorSupplierDirectory.find((item) => item.id === id);
    setSupplierId(id);
    if (supplier) {
      setMaterial(getSupplierDefaultMaterial(supplier));
      setNotice(`${supplier.name} selected for this purchase order.`);
    }
  };

  const createPurchaseOrder = (event) => {
    event.preventDefault();
    if (!selectedSupplier?.name || !material.trim() || numericQuantity <= 0 || numericUnitPrice <= 0 || !linkedWork.trim() || !dueDate) {
      setNotice("Supplier, material, quantity, unit price, work order, and due date are required.");
      return;
    }
    const numericIds = purchaseOrders.map((order) => Number(order.id.replace("VPO-", ""))).filter(Boolean);
    const nextId = `VPO-${Math.max(...numericIds, 2104) + 1}`;
    const purchaseOrder = {
      id: nextId,
      supplier: selectedSupplier.name,
      supplierId: selectedSupplier.id,
      material,
      quantity: numericQuantity,
      unit,
      unitPrice: numericUnitPrice,
      linkedWork,
      status: "Sent",
      dueDate,
      total: draftTotal,
      notes: notes.trim(),
      createdAt: "Just now",
    };
    setPurchaseOrders((items) => [purchaseOrder, ...items]);
    appendStoredList(supplierNotificationsStorageKey, {
      id: `spo-${Date.now()}`,
      type: "Purchase Order",
      title: `New purchase order ${nextId} from Perera Artisan Works`,
      detail: `${numericQuantity} ${unit} of ${material} for ${linkedWork}. Total LKR ${draftTotal.toLocaleString("en-US")}. Due ${dueDate}.`,
      time: "Just now",
      priority: "High",
      sourcePurchaseOrderId: nextId,
    });
    setStatus("Sent");
    setNotice(`${nextId} sent to ${selectedSupplier.name}. Supplier can see it in notifications.`);
  };

  const updatePurchaseOrderStatus = (order, nextStatus) => {
    setPurchaseOrders((items) => items.map((item) => (item.id === order.id ? { ...item, status: nextStatus } : item)));
    setStatus(nextStatus);
    setNotice(`${order.id} updated to ${nextStatus}.`);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] text-[#303833]">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Purchase Orders" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Supplier purchase order notifications are sent to the supplier portal.")} unreadCount={0} status="Purchase Orders" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-5">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#202621]">Purchase Orders</h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#66716b]">
                  Create supplier purchase orders for materials needed by manufacturing work orders.
                </p>
              </div>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">{notice}</div>

            <section className="grid gap-4 md:grid-cols-3">
              <ProductStat icon={ClipboardList} label="Draft POs" value={String(draftCount).padStart(2, "0")} />
              <ProductStat icon={Send} label="Sent POs" value={String(sentCount).padStart(2, "0")} />
              <ProductStat icon={CheckCircle2} label="Received" value={String(receivedCount).padStart(2, "0")} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
              <form onSubmit={createPurchaseOrder} className="grid content-start gap-4 rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#202621]">Create Vendor Purchase Order</h2>
                  <p className="mt-1 text-sm text-[#66716b]">Send a confirmed material order to the selected supplier.</p>
                </div>
                <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
                  Supplier
                  <select value={supplierId} onChange={(event) => selectSupplier(event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-3 font-semibold outline-none transition focus:border-[#115745]">
                    {vendorSupplierDirectory.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                </label>
                <SettingsSelect label="Material" value={material} options={supplierMaterialStock.map((item) => item.material)} onChange={setMaterial} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <SettingsInput label="Quantity" type="number" value={quantity} onChange={setQuantity} />
                  <SettingsSelect label="Unit" value={unit} options={["planks", "boards", "pieces", "meters"]} onChange={setUnit} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SettingsInput label="Unit Price (LKR)" type="number" value={unitPrice} onChange={setUnitPrice} />
                  <SettingsInput label="Due Date" type="date" value={dueDate} onChange={setDueDate} />
                </div>
                <SettingsInput label="Linked Work Order" value={linkedWork} onChange={setLinkedWork} />
                <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
                  Notes
                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="rounded-lg border border-[#c4cbc7] bg-white px-3 py-2 font-semibold outline-none transition focus:border-[#115745]" />
                </label>
                <div className="rounded-lg bg-[#f8f4ec] px-4 py-3">
                  <span className="text-xs font-extrabold uppercase text-[#66716b]">Estimated Total</span>
                  <strong className="mt-1 block text-2xl text-[#202621]">LKR {draftTotal.toLocaleString("en-US")}</strong>
                </div>
                <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
                  <Send className="h-4 w-4" />
                  Create And Send PO
                </button>
              </form>

              <section className="overflow-hidden rounded-xl border border-[#c2cac5] bg-white shadow-sm">
                <div className="grid gap-3 border-b border-[#d9d5cd] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center sm:px-6">
                  <div>
                    <h2 className="text-xl font-semibold text-[#202621]">Vendor Purchase Orders</h2>
                    <p className="mt-1 text-sm text-[#66716b]">Track supplier POs created by the vendor team.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["All", "Draft", "Sent", "Supplier Confirmed", "In Transit", "Received", "Cancelled"].map((item) => (
                      <button key={item} onClick={() => setStatus(item)} className={`min-h-10 rounded-lg px-3 text-sm font-extrabold ${status === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="divide-y divide-[#d9d5cd]">
                  {filteredOrders.map((order) => (
                    <article key={order.id} className="grid grid-cols-[0.9fr_1.2fr_1fr_1fr_1fr_1fr] items-center gap-4 px-5 py-5 text-sm max-xl:grid-cols-1 sm:px-6">
                      <div>
                        <strong className="text-[#202621]">{order.id}</strong>
                        <p className="mt-1 text-xs font-bold uppercase text-[#66716b]">{order.linkedWork}</p>
                      </div>
                      <span className="font-semibold">{order.supplier}</span>
                      <span>{order.quantity} {order.unit} {order.material}</span>
                      <strong>LKR {Number(order.total || 0).toLocaleString("en-US")}</strong>
                      <span className="text-[#66716b]">Due {order.dueDate}</span>
                      <select value={order.status} onChange={(event) => updatePurchaseOrderStatus(order, event.target.value)} className={`min-h-10 w-fit rounded-lg border border-[#c4cbc7] bg-white px-3 text-xs font-extrabold uppercase outline-none ${getPurchaseOrderTone(order.status)}`}>
                        <option>Draft</option>
                        <option>Sent</option>
                        <option>Supplier Confirmed</option>
                        <option>In Transit</option>
                        <option>Received</option>
                        <option>Cancelled</option>
                      </select>
                    </article>
                  ))}
                </div>
                {filteredOrders.length === 0 && <p className="m-5 rounded-lg bg-[#f8f4ec] p-5 text-sm font-semibold text-[#66716b]">No vendor purchase orders match this filter.</p>}
              </section>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function VendorInventoryPage() {
  const [notice, setNotice] = useState("Inventory loaded.");
  const [inventory, setInventory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(vendorInventoryStorageKey) || "null") || getInitialVendorInventory();
    } catch {
      return getInitialVendorInventory();
    }
  });
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [activeItem, setActiveItem] = useState(null);
  const [adjustment, setAdjustment] = useState("5");
  const [reason, setReason] = useState("Manual stock correction");

  useEffect(() => {
    try {
      localStorage.setItem(vendorInventoryStorageKey, JSON.stringify(inventory));
    } catch {}
  }, [inventory]);

  const filteredInventory = inventory.filter((item) => {
    const matchesQuery = `${item.name} ${item.category} ${item.location}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = type === "All" || item.type === type || item.status === type;
    return matchesQuery && matchesType;
  });
  const productCount = inventory.filter((item) => item.type === "Product").length;
  const materialCount = inventory.filter((item) => item.type === "Material").length;
  const lowCount = inventory.filter((item) => item.status !== "Ready").length;
  const totalValue = inventory.reduce((sum, item) => sum + item.quantity * item.unitValue, 0);

  const openAdjustment = (item) => {
    setActiveItem(item);
    setAdjustment("5");
    setReason("Manual stock correction");
    setNotice(`${item.name} stock adjustment opened.`);
  };

  const saveAdjustment = (event) => {
    event.preventDefault();
    if (!activeItem) return;
    const delta = Number(adjustment);
    if (!Number.isFinite(delta) || delta === 0) {
      setNotice("Enter a positive or negative stock adjustment.");
      return;
    }
    setInventory((items) => items.map((item) => {
      if (item.id !== activeItem.id) return item;
      const nextQuantity = Math.max(0, item.quantity + delta);
      return {
        ...item,
        quantity: nextQuantity,
        status: getInventoryStatus(nextQuantity, item.reorderPoint),
        lastUpdated: "Just now",
        lastReason: reason.trim(),
      };
    }));
    setNotice(`${activeItem.name} adjusted by ${delta > 0 ? "+" : ""}${delta} ${activeItem.unit}.`);
    setActiveItem(null);
  };

  const preparePurchaseOrder = (item) => {
    if (item.type !== "Material") {
      setNotice(`${item.name} is product inventory. Restock finished products from Products.`);
      return;
    }
    navigate("/vendor/purchase-orders");
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] text-[#303833]">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Inventory" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Inventory alerts are shown in dashboard notifications.")} unreadCount={0} status="Inventory" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-3">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
              <h1 className="text-3xl font-semibold leading-tight text-[#202621]">Inventory</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-[#66716b]">
                Track finished product stock and raw materials used by manufacturing work orders.
              </p>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">{notice}</div>

            <section className="grid gap-4 md:grid-cols-4">
              <ProductStat icon={Archive} label="Product SKUs" value={String(productCount).padStart(2, "0")} />
              <ProductStat icon={Boxes} label="Materials" value={String(materialCount).padStart(2, "0")} />
              <ProductStat icon={AlertTriangle} label="Low / Out" value={String(lowCount).padStart(2, "0")} warning />
              <ProductStat icon={Warehouse} label="Stock Value" value={`LKR ${Math.round(totalValue / 1000)}K`} />
            </section>

            <section className="overflow-hidden rounded-xl border border-[#c2cac5] bg-white shadow-sm">
              <div className="grid gap-3 border-b border-[#d9d5cd] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center sm:px-6">
                <label className="flex min-h-11 items-center rounded-lg border border-[#c4cbc7] bg-white px-3 text-[#747a76]">
                  <Search className="h-4 w-4 shrink-0" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search product, material, location..." />
                </label>
                <div className="flex flex-wrap gap-2">
                  {["All", "Product", "Material", "Ready", "Low Stock", "Out of Stock"].map((item) => (
                    <button key={item} onClick={() => setType(item)} className={`min-h-10 rounded-lg px-3 text-sm font-extrabold ${type === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[1.2fr_.75fr_.85fr_.9fr_.9fr_1fr_auto] bg-[#f3eee6] px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-[#56605b] max-xl:hidden">
                <span>Item</span><span>Type</span><span>Stock</span><span>Reorder</span><span>Status</span><span>Location</span><span>Action</span>
              </div>
              <div className="divide-y divide-[#d9d5cd]">
                {filteredInventory.map((item) => (
                  <article key={item.id} className="grid grid-cols-[1.2fr_.75fr_.85fr_.9fr_.9fr_1fr_auto] items-center gap-4 px-5 py-5 text-sm max-xl:grid-cols-1 sm:px-6">
                    <div>
                      <strong className="text-[#202621]">{item.name}</strong>
                      <p className="mt-1 text-xs font-bold uppercase text-[#66716b]">{item.category}</p>
                    </div>
                    <span className="font-semibold">{item.type}</span>
                    <strong>{item.quantity} {item.unit}</strong>
                    <span>{item.reorderPoint} {item.unit}</span>
                    <span className={`w-fit rounded-full px-3 py-2 text-xs font-extrabold uppercase ${getInventoryTone(item.status)}`}>{item.status}</span>
                    <span className="text-[#66716b]">{item.location}</span>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openAdjustment(item)} className="min-h-10 rounded-lg bg-[#eef4ef] px-3 text-sm font-extrabold text-[#115745]">Adjust</button>
                      {item.type === "Material" && item.status !== "Ready" && <button onClick={() => preparePurchaseOrder(item)} className="min-h-10 rounded-lg bg-[#115745] px-3 text-sm font-extrabold text-white">Create PO</button>}
                    </div>
                  </article>
                ))}
              </div>
              {filteredInventory.length === 0 && <p className="m-5 rounded-lg bg-[#f8f4ec] p-5 text-sm font-semibold text-[#66716b]">No inventory rows match this filter.</p>}
            </section>
          </div>
        </section>
      </div>

      {activeItem && (
        <ModalShell title="Adjust Inventory" subtitle={`${activeItem.name} - current stock ${activeItem.quantity} ${activeItem.unit}`} onClose={() => setActiveItem(null)}>
          <form onSubmit={saveAdjustment} className="grid gap-4 px-5 py-5 sm:px-6">
            <SettingsInput label="Adjustment (+ add, - remove)" type="number" value={adjustment} onChange={setAdjustment} />
            <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
              Reason
              <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="rounded-lg border border-[#c4cbc7] bg-white px-3 py-2 font-semibold outline-none transition focus:border-[#115745]" />
            </label>
            <div className="flex flex-wrap justify-end gap-3 border-t border-[#d9d5cd] pt-4">
              <button type="button" onClick={() => setActiveItem(null)} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
              <button type="submit" className="min-h-11 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">Save Adjustment</button>
            </div>
          </form>
        </ModalShell>
      )}
    </main>
  );
}

function VendorWarehousesPage() {
  const [notice, setNotice] = useState("Warehouses loaded.");
  const [warehouses, setWarehouses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(vendorWarehousesStorageKey) || "null") || initialVendorWarehouses;
    } catch {
      return initialVendorWarehouses;
    }
  });
  const [inventory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(vendorInventoryStorageKey) || "null") || getInitialVendorInventory();
    } catch {
      return getInitialVendorInventory();
    }
  });
  const [activeWarehouseId, setActiveWarehouseId] = useState(initialVendorWarehouses[0].id);
  const [transferItemId, setTransferItemId] = useState("");
  const [transferTo, setTransferTo] = useState(initialVendorWarehouses[1].id);
  const [transferQty, setTransferQty] = useState("5");

  useEffect(() => {
    try {
      localStorage.setItem(vendorWarehousesStorageKey, JSON.stringify(warehouses));
    } catch {}
  }, [warehouses]);

  const activeWarehouse = warehouses.find((warehouse) => warehouse.id === activeWarehouseId) || warehouses[0];
  const warehouseItems = inventory.filter((item) => item.location.includes(activeWarehouse.name) || item.location.includes(activeWarehouse.name.replace("Warehouse ", "Warehouse ")));
  const totalCapacity = warehouses.reduce((sum, warehouse) => sum + warehouse.capacity, 0);
  const totalUsed = warehouses.reduce((sum, warehouse) => sum + warehouse.used, 0);
  const nearCapacity = warehouses.filter((warehouse) => getWarehouseUsage(warehouse) >= 85).length;
  const availableSpace = totalCapacity - totalUsed;
  const selectedTransferItem = inventory.find((item) => item.id === transferItemId) || inventory[0];

  useEffect(() => {
    if (!transferItemId && inventory[0]) {
      setTransferItemId(inventory[0].id);
    }
  }, [inventory, transferItemId]);

  const updateWarehouseStatus = (warehouse, status) => {
    setWarehouses((items) => items.map((item) => (item.id === warehouse.id ? { ...item, status } : item)));
    setNotice(`${warehouse.name} updated to ${status}.`);
  };

  const createTransfer = (event) => {
    event.preventDefault();
    const qty = Number(transferQty);
    const destination = warehouses.find((warehouse) => warehouse.id === transferTo);
    if (!selectedTransferItem || !destination || !Number.isFinite(qty) || qty <= 0) {
      setNotice("Select an item, destination warehouse, and valid quantity.");
      return;
    }
    setNotice(`${qty} ${selectedTransferItem.unit} of ${selectedTransferItem.name} transfer scheduled to ${destination.name}.`);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] text-[#303833]">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Warehouses" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Warehouse alerts are shown in dashboard notifications.")} unreadCount={0} status="Warehouses" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-3">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
              <h1 className="text-3xl font-semibold leading-tight text-[#202621]">Warehouses</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-[#66716b]">
                Manage storage locations, capacity pressure, warehouse zones, and movement of product/material stock.
              </p>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">{notice}</div>

            <section className="grid gap-4 md:grid-cols-4">
              <ProductStat icon={Warehouse} label="Warehouses" value={String(warehouses.length).padStart(2, "0")} />
              <ProductStat icon={Boxes} label="Used Capacity" value={`${Math.round((totalUsed / totalCapacity) * 100)}%`} />
              <ProductStat icon={AlertTriangle} label="Near Capacity" value={String(nearCapacity).padStart(2, "0")} warning />
              <ProductStat icon={Archive} label="Free Space" value={`${availableSpace} slots`} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="grid gap-6">
                <section className="grid gap-4 md:grid-cols-3">
                  {warehouses.map((warehouse) => {
                    const usage = getWarehouseUsage(warehouse);
                    const active = warehouse.id === activeWarehouseId;
                    return (
                      <button key={warehouse.id} onClick={() => { setActiveWarehouseId(warehouse.id); setNotice(`${warehouse.name} opened.`); }} className={`rounded-xl border p-5 text-left shadow-sm ${active ? "border-[#115745] bg-[#f3faf4]" : "border-[#c2cac5] bg-white"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#eef4ef] text-[#115745]">
                            <Warehouse className="h-5 w-5" />
                          </span>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold uppercase ${getWarehouseTone(warehouse.status)}`}>{warehouse.status}</span>
                        </div>
                        <h2 className="mt-4 text-lg font-semibold text-[#202621]">{warehouse.name}</h2>
                        <p className="mt-1 text-sm text-[#66716b]">{warehouse.location}</p>
                        <div className="mt-4">
                          <div className="flex justify-between text-xs font-extrabold uppercase text-[#66716b]">
                            <span>Capacity</span>
                            <span>{warehouse.used}/{warehouse.capacity}</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-[#e9e4dc]">
                            <span className={`block h-full rounded-full ${usage >= 90 ? "bg-[#d24b53]" : usage >= 75 ? "bg-[#d58a1b]" : "bg-[#115745]"}`} style={{ width: `${Math.min(100, usage)}%` }} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </section>

                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-[#202621]">{activeWarehouse.name}</h2>
                      <p className="mt-1 text-sm leading-relaxed text-[#66716b]">{activeWarehouse.focus}</p>
                    </div>
                    <select value={activeWarehouse.status} onChange={(event) => updateWarehouseStatus(activeWarehouse, event.target.value)} className={`min-h-10 rounded-lg border border-[#c4cbc7] bg-white px-3 text-xs font-extrabold uppercase outline-none ${getWarehouseTone(activeWarehouse.status)}`}>
                      <option>Operational</option>
                      <option>Near Capacity</option>
                      <option>Maintenance</option>
                      <option>Paused</option>
                    </select>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <WarehouseInfo label="Manager" value={activeWarehouse.manager} />
                    <WarehouseInfo label="Zones" value={`${activeWarehouse.zones} zones`} />
                    <WarehouseInfo label="Usage" value={`${getWarehouseUsage(activeWarehouse)}% full`} />
                  </div>

                  <div className="mt-6 overflow-hidden rounded-lg border border-[#d9d5cd]">
                    <div className="grid grid-cols-[1.2fr_.8fr_.8fr_1fr] bg-[#f3eee6] px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-[#56605b] max-lg:hidden">
                      <span>Stored Item</span><span>Type</span><span>Qty</span><span>Status</span>
                    </div>
                    <div className="divide-y divide-[#d9d5cd]">
                      {(warehouseItems.length ? warehouseItems : inventory.slice(0, 4)).map((item) => (
                        <article key={`${activeWarehouse.id}-${item.id}`} className="grid grid-cols-[1.2fr_.8fr_.8fr_1fr] items-center gap-3 px-4 py-4 text-sm max-lg:grid-cols-1">
                          <strong className="text-[#202621]">{item.name}</strong>
                          <span>{item.type}</span>
                          <span>{item.quantity} {item.unit}</span>
                          <span className={`w-fit rounded-full px-3 py-2 text-xs font-extrabold uppercase ${getInventoryTone(item.status)}`}>{item.status}</span>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              <aside className="grid content-start gap-6">
                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-xl font-semibold text-[#202621]">Schedule Stock Transfer</h2>
                  <p className="mt-1 text-sm text-[#66716b]">Move stock between warehouse locations when capacity or production needs change.</p>
                  <form onSubmit={createTransfer} className="mt-5 grid gap-4">
                    <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
                      Item
                      <select value={transferItemId} onChange={(event) => setTransferItemId(event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-3 font-semibold outline-none transition focus:border-[#115745]">
                        {inventory.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </label>
                    <SettingsSelect label="Destination" value={transferTo} options={warehouses.map((warehouse) => warehouse.id)} onChange={setTransferTo} />
                    <SettingsInput label="Quantity" type="number" value={transferQty} onChange={setTransferQty} />
                    <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
                      <Truck className="h-4 w-4" />
                      Schedule Transfer
                    </button>
                  </form>
                </section>

                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-xl font-semibold text-[#202621]">Capacity Guidance</h2>
                  <div className="mt-4 grid gap-3">
                    {warehouses.map((warehouse) => {
                      const usage = getWarehouseUsage(warehouse);
                      return (
                        <article key={`guide-${warehouse.id}`} className="rounded-lg bg-[#f8f4ec] p-4 text-sm">
                          <div className="flex justify-between gap-3">
                            <strong className="text-[#202621]">{warehouse.name}</strong>
                            <span className="font-extrabold text-[#115745]">{usage}%</span>
                          </div>
                          <p className="mt-2 leading-relaxed text-[#66716b]">{getWarehouseGuidance(warehouse)}</p>
                        </article>
                      );
                    })}
                  </div>
                </section>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function VendorShipmentsPage() {
  const [notice, setNotice] = useState("Shipments loaded.");
  const [shipments, setShipments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(vendorShipmentsStorageKey) || "null") || initialVendorShipments;
    } catch {
      return initialVendorShipments;
    }
  });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [draft, setDraft] = useState({
    type: "Customer Delivery",
    reference: "#WV-9482",
    contact: "Kasun Wijesinghe",
    destination: "Colombo 07",
    carrier: "Lanka Freight",
    date: "2026-08-04",
    items: "Teak executive desk",
    priority: "High",
  });

  useEffect(() => {
    try {
      localStorage.setItem(vendorShipmentsStorageKey, JSON.stringify(shipments));
    } catch {}
  }, [shipments]);

  const filteredShipments = shipments.filter((shipment) => {
    const matchesQuery = `${shipment.id} ${shipment.reference} ${shipment.contact} ${shipment.destination} ${shipment.items}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All" || shipment.status === status || shipment.type === status;
    return matchesQuery && matchesStatus;
  });
  const outboundCount = shipments.filter((shipment) => shipment.type === "Customer Delivery").length;
  const inboundCount = shipments.filter((shipment) => shipment.type === "Inbound Material").length;
  const activeCount = shipments.filter((shipment) => !["Delivered", "Cancelled"].includes(shipment.status)).length;
  const delayedCount = shipments.filter((shipment) => shipment.status === "Delayed").length;

  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  const createShipment = (event) => {
    event.preventDefault();
    if (!draft.reference.trim() || !draft.contact.trim() || !draft.destination.trim() || !draft.items.trim() || !draft.date) {
      setNotice("Reference, contact, destination, items, and date are required.");
      return;
    }
    const numericIds = shipments.map((shipment) => Number(shipment.id.replace("SHP-", ""))).filter(Boolean);
    const nextId = `SHP-${Math.max(...numericIds, 3304) + 1}`;
    const shipment = {
      id: nextId,
      ...draft,
      status: "Scheduled",
    };
    setShipments((items) => [shipment, ...items]);
    setStatus("Scheduled");
    setNotice(`${nextId} scheduled for ${draft.type.toLowerCase()} to ${draft.destination}.`);
  };

  const updateShipmentStatus = (shipment, nextStatus) => {
    setShipments((items) => items.map((item) => (item.id === shipment.id ? { ...item, status: nextStatus } : item)));
    setStatus(nextStatus);
    setNotice(`${shipment.id} updated to ${nextStatus}.`);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] text-[#303833]">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Shipments" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Shipment notifications are connected to customer and supplier updates.")} unreadCount={0} status="Shipments" />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-3">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
              <h1 className="text-3xl font-semibold leading-tight text-[#202621]">Shipments</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-[#66716b]">
                Schedule customer deliveries, track inbound supplier material shipments, and update delivery status.
              </p>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">{notice}</div>

            <section className="grid gap-4 md:grid-cols-4">
              <ProductStat icon={Truck} label="Active" value={String(activeCount).padStart(2, "0")} />
              <ProductStat icon={ShoppingCart} label="Customer Delivery" value={String(outboundCount).padStart(2, "0")} />
              <ProductStat icon={Boxes} label="Inbound Material" value={String(inboundCount).padStart(2, "0")} />
              <ProductStat icon={AlertTriangle} label="Delayed" value={String(delayedCount).padStart(2, "0")} warning />
            </section>

            <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
              <form onSubmit={createShipment} className="grid content-start gap-4 rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#202621]">Create Shipment</h2>
                  <p className="mt-1 text-sm text-[#66716b]">Use outbound for customers and inbound for supplier materials.</p>
                </div>
                <SettingsSelect label="Shipment Type" value={draft.type} options={["Customer Delivery", "Inbound Material"]} onChange={(value) => updateDraft("type", value)} />
                <SettingsInput label="Reference Order / PO" value={draft.reference} onChange={(value) => updateDraft("reference", value)} />
                <SettingsInput label="Customer / Supplier" value={draft.contact} onChange={(value) => updateDraft("contact", value)} />
                <SettingsInput label="Destination" value={draft.destination} onChange={(value) => updateDraft("destination", value)} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <SettingsSelect label="Carrier" value={draft.carrier} options={["Lanka Freight", "Express Move", "Supplier Truck", "In-house Van"]} onChange={(value) => updateDraft("carrier", value)} />
                  <SettingsInput label="Ship Date" type="date" value={draft.date} onChange={(value) => updateDraft("date", value)} />
                </div>
                <SettingsInput label="Items" value={draft.items} onChange={(value) => updateDraft("items", value)} />
                <SettingsSelect label="Priority" value={draft.priority} options={["High", "Normal", "Low"]} onChange={(value) => updateDraft("priority", value)} />
                <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
                  <Truck className="h-4 w-4" />
                  Schedule Shipment
                </button>
              </form>

              <section className="overflow-hidden rounded-xl border border-[#c2cac5] bg-white shadow-sm">
                <div className="grid gap-3 border-b border-[#d9d5cd] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center sm:px-6">
                  <label className="flex min-h-11 items-center rounded-lg border border-[#c4cbc7] bg-white px-3 text-[#747a76]">
                    <Search className="h-4 w-4 shrink-0" />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search shipment, reference, contact, destination..." />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["All", "Customer Delivery", "Inbound Material", "Scheduled", "Ready for Dispatch", "In Transit", "Delivered", "Delayed", "Cancelled"].map((item) => (
                      <button key={item} onClick={() => setStatus(item)} className={`min-h-10 rounded-lg px-3 text-sm font-extrabold ${status === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-[.9fr_1fr_1.1fr_1fr_1fr_.9fr_auto] bg-[#f3eee6] px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-[#56605b] max-xl:hidden">
                  <span>Shipment</span><span>Type</span><span>Reference</span><span>Contact</span><span>Destination</span><span>Date</span><span>Status</span>
                </div>
                <div className="divide-y divide-[#d9d5cd]">
                  {filteredShipments.map((shipment) => (
                    <article key={shipment.id} className="grid grid-cols-[.9fr_1fr_1.1fr_1fr_1fr_.9fr_auto] items-center gap-4 px-5 py-5 text-sm max-xl:grid-cols-1 sm:px-6">
                      <div>
                        <strong className="text-[#202621]">{shipment.id}</strong>
                        <p className="mt-1 text-xs font-bold uppercase text-[#66716b]">{shipment.carrier}</p>
                      </div>
                      <span className="font-semibold">{shipment.type}</span>
                      <span>{shipment.reference}</span>
                      <span>{shipment.contact}</span>
                      <span>{shipment.destination}</span>
                      <span className="text-[#66716b]">{shipment.date}</span>
                      <select value={shipment.status} onChange={(event) => updateShipmentStatus(shipment, event.target.value)} className={`min-h-10 w-fit rounded-lg border border-[#c4cbc7] bg-white px-3 text-xs font-extrabold uppercase outline-none ${getShipmentTone(shipment.status)}`}>
                        <option>Scheduled</option>
                        <option>Ready for Dispatch</option>
                        <option>In Transit</option>
                        <option>Delivered</option>
                        <option>Delayed</option>
                        <option>Cancelled</option>
                      </select>
                    </article>
                  ))}
                </div>
                {filteredShipments.length === 0 && <p className="m-5 rounded-lg bg-[#f8f4ec] p-5 text-sm font-semibold text-[#66716b]">No shipments match this filter.</p>}
              </section>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function VendorSettingsPage() {
  const defaultSettings = {
    businessName: "Perera Artisan Works",
    contactName: "Aruni Perera",
    email: "aruni@pereraartisan.lk",
    phone: "+94 77 412 8890",
    language: "English",
    timezone: "Asia/Colombo",
    currency: "LKR",
    defaultView: "Dashboard",
    customerNotifications: true,
    supplierNotifications: true,
    productionAlerts: true,
    emailDigest: true,
    smsAlerts: false,
    twoFactor: true,
    loginAlerts: true,
    autoPurchaseRequests: true,
    lowMaterialThreshold: "10",
  };
  const [settings, setSettings] = useState(() => {
    try {
      return { ...defaultSettings, ...JSON.parse(localStorage.getItem("woodverse-vendor-settings") || "{}") };
    } catch {
      return defaultSettings;
    }
  });
  const [notice, setNotice] = useState("Vendor settings loaded.");
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Connected");
  const [settingsActions, setSettingsActions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-vendor-settings-actions") || "[]");
    } catch {
      return [];
    }
  });

  const updateSetting = (field, value) => setSettings((current) => ({ ...current, [field]: value }));

  const recordSettingsAction = (message) => {
    const action = {
      id: `VSA-${Date.now()}`,
      message,
      time: new Date().toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" }),
    };
    setSettingsActions((current) => {
      const next = [action, ...current].slice(0, 5);
      try {
        localStorage.setItem("woodverse-vendor-settings-actions", JSON.stringify(next));
      } catch {}
      return next;
    });
    setNotice(message);
  };

  const toggleSetting = (field, label) => {
    const nextValue = !settings[field];
    updateSetting(field, nextValue);
    recordSettingsAction(`${label} ${nextValue ? "enabled" : "disabled"}.`);
  };

  const saveSettings = (event) => {
    event.preventDefault();
    try {
      localStorage.setItem("woodverse-vendor-settings", JSON.stringify(settings));
    } catch {}
    recordSettingsAction("Vendor settings saved.");
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    try {
      localStorage.setItem("woodverse-vendor-settings", JSON.stringify(defaultSettings));
    } catch {}
    recordSettingsAction("Vendor settings reset to defaults.");
  };

  const exportSettings = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), settings }, null, 2);
    try {
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "woodverse-vendor-settings.json";
      link.click();
      URL.revokeObjectURL(url);
      recordSettingsAction("Vendor settings export downloaded.");
    } catch {
      setNotice(payload);
    }
  };

  const copyApiKey = async () => {
    const apiKey = "wv_vendor_live_9x42_hidden_demo_key";
    try {
      await navigator.clipboard.writeText(apiKey);
      recordSettingsAction("Vendor API key copied.");
    } catch {
      setNotice(apiKey);
    }
  };

  const toggleApiKeyVisibility = () => {
    setApiKeyVisible((visible) => {
      const next = !visible;
      recordSettingsAction(next ? "Vendor API key shown." : "Vendor API key hidden.");
      return next;
    });
  };

  const requestPasswordReset = () => {
    const resetRequest = {
      id: `VPR-${Date.now()}`,
      email: settings.email,
      requestedAt: new Date().toISOString(),
      status: "Sent",
    };
    try {
      const existing = JSON.parse(localStorage.getItem("woodverse-vendor-password-resets") || "[]");
      localStorage.setItem("woodverse-vendor-password-resets", JSON.stringify([resetRequest, ...existing]));
    } catch {}
    recordSettingsAction(`Password reset email sent to ${settings.email}.`);
  };

  const reconnectIntegrations = () => {
    setSyncStatus("Reconnecting");
    recordSettingsAction("Testing supplier, customer, and notification integrations.");
    window.setTimeout(() => {
      setSyncStatus("Connected");
      recordSettingsAction("Supplier, customer, and notification integrations reconnected.");
    }, 600);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] text-[#303833]">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Settings" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Notifications are available from the Dashboard page.")} unreadCount={0} status={syncStatus} />

          <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-3">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
              <h1 className="text-3xl font-semibold leading-tight text-[#202621]">Settings</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-[#66716b]">
                Manage business profile, portal preferences, notification routing, security, and supplier/customer integrations.
              </p>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">
              {notice}
            </div>

            <form onSubmit={saveSettings} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="grid gap-6">
                <SettingsPanel icon={UserCog} title="Business Profile" detail="Visible identity for customers, suppliers, and administrators.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SettingsInput label="Business Name" value={settings.businessName} onChange={(value) => updateSetting("businessName", value)} />
                    <SettingsInput label="Contact Name" value={settings.contactName} onChange={(value) => updateSetting("contactName", value)} />
                    <SettingsInput label="Email" type="email" value={settings.email} onChange={(value) => updateSetting("email", value)} />
                    <SettingsInput label="Phone" value={settings.phone} onChange={(value) => updateSetting("phone", value)} />
                  </div>
                </SettingsPanel>

                <SettingsPanel icon={Globe2} title="Portal Preferences" detail="Control how the vendor dashboard behaves for daily work.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SettingsSelect label="Language" value={settings.language} options={["English", "Sinhala", "Tamil"]} onChange={(value) => updateSetting("language", value)} icon={Languages} />
                    <SettingsSelect label="Timezone" value={settings.timezone} options={["Asia/Colombo", "UTC", "Asia/Dubai"]} onChange={(value) => updateSetting("timezone", value)} />
                    <SettingsSelect label="Currency" value={settings.currency} options={["LKR", "USD", "EUR"]} onChange={(value) => updateSetting("currency", value)} />
                    <SettingsSelect label="Default Page" value={settings.defaultView} options={["Dashboard", "Customer Orders", "Production Tracking", "Inventory"]} onChange={(value) => updateSetting("defaultView", value)} />
                  </div>
                </SettingsPanel>

                <SettingsPanel icon={Bell} title="Notifications" detail="Connect vendor updates with supplier and customer activity.">
                  <div className="grid gap-3">
                    <SettingsToggle title="Customer notifications" detail="Receive customer order, payment, and delivery messages." checked={settings.customerNotifications} onChange={() => toggleSetting("customerNotifications", "Customer notifications")} />
                    <SettingsToggle title="Supplier notifications" detail="Receive supplier stock confirmations and purchase order updates." checked={settings.supplierNotifications} onChange={() => toggleSetting("supplierNotifications", "Supplier notifications")} />
                    <SettingsToggle title="Production alerts" detail="Notify the team when work orders move between stages." checked={settings.productionAlerts} onChange={() => toggleSetting("productionAlerts", "Production alerts")} />
                    <SettingsToggle title="Email digest" detail="Send daily vendor summaries to the business email." checked={settings.emailDigest} onChange={() => toggleSetting("emailDigest", "Email digest")} />
                    <SettingsToggle title="SMS alerts" detail="Send urgent order and shipment updates by SMS." checked={settings.smsAlerts} onChange={() => toggleSetting("smsAlerts", "SMS alerts")} />
                  </div>
                </SettingsPanel>
              </section>

              <aside className="grid content-start gap-6">
                <SettingsPanel icon={ShieldCheck} title="Security" detail="Protect vendor profile, payouts, and integrations.">
                  <div className="grid gap-3">
                    <SettingsToggle title="Two-factor auth" detail="Require verification for account and payout changes." checked={settings.twoFactor} onChange={() => toggleSetting("twoFactor", "Two-factor auth")} compact />
                    <SettingsToggle title="Login alerts" detail="Notify the owner about new device logins." checked={settings.loginAlerts} onChange={() => toggleSetting("loginAlerts", "Login alerts")} compact />
                    <button type="button" onClick={requestPasswordReset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
                      <Lock className="h-4 w-4" />
                      Reset Password
                    </button>
                  </div>
                </SettingsPanel>

                <SettingsPanel icon={KeyRound} title="Integrations" detail="Supplier, customer, and notification service access.">
                  <div className="grid gap-4">
                    <div className="rounded-lg bg-[#f8f4ec] px-4 py-3">
                      <span className="text-xs font-extrabold uppercase text-[#66716b]">Socket.IO Status</span>
                      <strong className="mt-1 block text-[#115745]">{syncStatus}</strong>
                    </div>
                    <SettingsToggle title="Auto purchase requests" detail="Create supplier requests when materials run low." checked={settings.autoPurchaseRequests} onChange={() => toggleSetting("autoPurchaseRequests", "Auto purchase requests")} compact />
                    <SettingsInput label="Low Material Threshold (%)" type="number" value={settings.lowMaterialThreshold} onChange={(value) => updateSetting("lowMaterialThreshold", value)} />
                    <div className="rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] p-4">
                      <span className="text-xs font-extrabold uppercase text-[#66716b]">Vendor API Key</span>
                      <code className="mt-2 block break-all rounded bg-white px-3 py-2 text-xs font-bold text-[#3d4541]">
                        {apiKeyVisible ? "wv_vendor_live_9x42_hidden_demo_key" : "wv_vendor_live_••••••••••••••••"}
                      </code>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={toggleApiKeyVisibility} className="rounded-lg bg-[#e9e4dc] px-3 py-2 text-xs font-extrabold text-[#3d4541]">{apiKeyVisible ? "Hide" : "Show"}</button>
                        <button type="button" onClick={copyApiKey} className="rounded-lg bg-[#e9e4dc] px-3 py-2 text-xs font-extrabold text-[#3d4541]">Copy</button>
                      </div>
                    </div>
                    <button type="button" onClick={reconnectIntegrations} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
                      <CheckCircle2 className="h-4 w-4" />
                      Test Connection
                    </button>
                  </div>
                </SettingsPanel>

                <div className="grid gap-3 rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
                  <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
                    <Save className="h-4 w-4" />
                    Save Settings
                  </button>
                  <button type="button" onClick={exportSettings} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
                    <Download className="h-4 w-4" />
                    Export Settings
                  </button>
                  <button type="button" onClick={resetSettings} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#e9e4dc] px-4 text-sm font-extrabold text-[#3d4541]">
                    <RotateCcw className="h-4 w-4" />
                    Reset Defaults
                  </button>
                </div>

                <div className="grid gap-3 rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#eef4ef] text-[#115745]">
                      <Clock3 className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold text-[#202621]">Recent Setting Actions</h3>
                      <p className="text-sm leading-relaxed text-[#66716b]">Button clicks and setting changes are recorded here for vendor follow-up.</p>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    {settingsActions.length === 0 ? (
                      <p className="rounded-lg bg-[#f8f4ec] px-3 py-2 text-sm font-semibold text-[#66716b]">No setting actions yet.</p>
                    ) : (
                      settingsActions.map((action) => (
                        <div key={action.id} className="rounded-lg bg-[#f8f4ec] px-3 py-2">
                          <strong className="block text-sm text-[#202621]">{action.message}</strong>
                          <span className="text-xs font-bold uppercase text-[#68716c]">{action.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </aside>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function VendorHelpCenterPage() {
  const defaultTickets = [
    { id: "VH-1024", subject: "Supplier notification delay", type: "Technical", status: "Open", time: "Today", priority: "High", message: "Supplier notification events need admin review." },
    { id: "VH-1023", subject: "Customer payment status mismatch", type: "Orders", status: "In Review", time: "Yesterday", priority: "Medium", message: "Customer payment status is not matching the order record." },
  ];
  const [notice, setNotice] = useState("Help center loaded.");
  const [query, setQuery] = useState("");
  const [activeContact, setActiveContact] = useState(null);
  const [tickets, setTickets] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("woodverse-vendor-support-tickets") || "[]");
      return stored.length ? stored : defaultTickets;
    } catch {
      return defaultTickets;
    }
  });
  const [ticketForm, setTicketForm] = useState({
    subject: "Need help with vendor notifications",
    type: "Technical",
    priority: "Medium",
    message: "Supplier and customer notifications need admin review.",
  });

  const filteredFaqs = vendorFaqs.filter((item) => {
    const content = `${item.question} ${item.answer}`.toLowerCase();
    return content.includes(query.toLowerCase());
  });

  const updateTicket = (field, value) => setTicketForm((current) => ({ ...current, [field]: value }));

  const saveTickets = (items) => {
    try {
      localStorage.setItem("woodverse-vendor-support-tickets", JSON.stringify(items));
    } catch {}
  };

  const addSupportRecord = ({ subject, type, priority = "Medium", message = "", status = "Open" }) => {
    const nextId = `VH-${Date.now().toString().slice(-6)}`;
    const ticket = { id: nextId, subject, type, priority, message, status, time: "Just now" };
    setTickets((items) => {
      const next = [ticket, ...items];
      saveTickets(next);
      return next;
    });
    return nextId;
  };

  const submitTicket = (event) => {
    event.preventDefault();
    if (!ticketForm.subject.trim()) {
      setNotice("Support ticket subject is required.");
      return;
    }
    if (!ticketForm.message.trim()) {
      setNotice("Support ticket message is required.");
      return;
    }
    const nextId = addSupportRecord(ticketForm);
    setNotice(`Support ticket ${nextId} sent to admin.`);
  };

  const submitEmailAdmin = (form) => {
    const subject = form.subject || "Vendor portal support request";
    const body = `${form.message}\n\nVendor: Perera Artisan Works\nContact: Aruni Perera\nCategory: ${form.category}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent("admin@woodverse.lk")}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
    const nextId = addSupportRecord({ subject, type: form.category, priority: "Medium", message: form.message, status: "Gmail Draft" });
    setActiveContact(null);
    setNotice(`Gmail opened for admin email. Support record ${nextId} created.`);
  };

  const submitCallbackRequest = (form) => {
    const nextId = addSupportRecord({
      subject: `Callback requested for ${form.topic}`,
      type: "Phone",
      priority: "Medium",
      message: `Call ${form.phone} at ${form.preferredTime}.`,
      status: "Scheduled",
    });
    setActiveContact(null);
    setNotice(`Callback request ${nextId} scheduled for ${form.preferredTime}.`);
  };

  const selectHelpTopic = (topic) => {
    const typeByTopic = {
      "Customer Orders": "Orders",
      "Production Tracking": "Technical",
      "Supplier Coordination": "Suppliers",
      Notifications: "Technical",
    };
    setTicketForm({
      subject: `Help needed: ${topic.title}`,
      type: typeByTopic[topic.title] || "Technical",
      priority: topic.title === "Supplier Coordination" ? "High" : "Medium",
      message: topic.detail,
    });
    setQuery(topic.title);
    setNotice(`${topic.title} selected. Support ticket form is ready.`);
  };

  const updateTicketStatus = (ticketId, status) => {
    setTickets((items) => {
      const next = items.map((ticket) => ticket.id === ticketId ? { ...ticket, status, time: "Updated now" } : ticket);
      saveTickets(next);
      return next;
    });
    setNotice(`Ticket ${ticketId} marked ${status}.`);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] text-[#303833]">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Help Center" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Notifications are available from the Dashboard page.")} unreadCount={0} status="Support" />

          <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-3">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
              <h1 className="text-3xl font-semibold leading-tight text-[#202621]">Help Center</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-[#66716b]">
                Find vendor guidance, contact support, and send support tickets to the WoodVerse admin team.
              </p>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">
              {notice}
            </div>

            <section className="grid gap-4 md:grid-cols-3">
              <HelpContactCard icon={MessageSquare} title="Live Chat" detail="Ask admin support about urgent vendor portal issues." action="Start Chat" onClick={() => setActiveContact("chat")} />
              <HelpContactCard icon={Mail} title="Email Support" detail="Send order, supplier, or payment issues to support." action="Email Admin" onClick={() => setActiveContact("email")} />
              <HelpContactCard icon={PhoneCall} title="Phone Support" detail="Call vendor support during Colombo business hours." action="Request Call" onClick={() => setActiveContact("call")} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="grid gap-6">
                <SettingsPanel icon={BookOpen} title="Help Topics" detail="Common areas where vendors usually need support.">
                  <div className="grid gap-4 md:grid-cols-2">
                    {helpTopics.map((topic) => (
                      <article key={topic.title} className="rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] p-4">
                        <topic.icon className="h-5 w-5 text-[#115745]" />
                        <h3 className="mt-3 font-semibold text-[#202621]">{topic.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#66716b]">{topic.detail}</p>
                        <button type="button" onClick={() => selectHelpTopic(topic)} className="mt-4 min-h-10 rounded-lg bg-[#eef4ef] px-4 text-sm font-extrabold text-[#115745]">
                          Select Topic
                        </button>
                      </article>
                    ))}
                  </div>
                </SettingsPanel>

                <SettingsPanel icon={HelpCircle} title="FAQ" detail="Search quick answers before creating a support ticket.">
                  <label className="mb-4 flex min-h-11 items-center rounded-lg border border-[#c4cbc7] bg-white px-3 text-[#747a76]">
                    <Search className="h-4 w-4 shrink-0" />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search help..." />
                  </label>
                  <div className="grid gap-3">
                    {filteredFaqs.map((faq) => (
                      <article key={faq.question} className="rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] p-4">
                        <h3 className="font-semibold text-[#202621]">{faq.question}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#66716b]">{faq.answer}</p>
                      </article>
                    ))}
                    {filteredFaqs.length === 0 && <p className="rounded-lg bg-[#f8f4ec] p-4 text-sm font-semibold text-[#66716b]">No FAQ results found.</p>}
                  </div>
                </SettingsPanel>
              </div>

              <aside className="grid content-start gap-6">
                <SettingsPanel icon={Send} title="Create Support Ticket" detail="Send a support request directly to admin.">
                  <form onSubmit={submitTicket} className="grid gap-4">
                    <SettingsInput label="Subject" value={ticketForm.subject} onChange={(value) => updateTicket("subject", value)} />
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                      <SettingsSelect label="Type" value={ticketForm.type} options={["Technical", "Orders", "Suppliers", "Payments", "Account"]} onChange={(value) => updateTicket("type", value)} />
                      <SettingsSelect label="Priority" value={ticketForm.priority} options={["Low", "Medium", "High", "Urgent"]} onChange={(value) => updateTicket("priority", value)} />
                    </div>
                    <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
                      Message
                      <textarea value={ticketForm.message} onChange={(event) => updateTicket("message", event.target.value)} rows={5} className="rounded-lg border border-[#c4cbc7] bg-white px-3 py-2 font-semibold outline-none transition focus:border-[#115745]" />
                    </label>
                    <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
                      <Send className="h-4 w-4" />
                      Send To Admin
                    </button>
                  </form>
                </SettingsPanel>

                <SettingsPanel icon={Clock3} title="Recent Tickets" detail="Track support requests sent by the vendor account.">
                  <div className="grid gap-3">
                    {tickets.map((ticket) => (
                      <article key={ticket.id} className="rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <strong className="text-[#202621]">{ticket.id}</strong>
                          <span className="rounded-full bg-[#eef4ef] px-2.5 py-1 text-xs font-extrabold uppercase text-[#115745]">{ticket.status}</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-[#3d4541]">{ticket.subject}</p>
                        <p className="mt-2 text-xs font-bold uppercase text-[#66716b]">{ticket.type} - {ticket.priority || "Medium"} - {ticket.time}</p>
                        {ticket.message && <p className="mt-2 text-sm leading-relaxed text-[#66716b]">{ticket.message}</p>}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button type="button" onClick={() => updateTicketStatus(ticket.id, "In Review")} className="min-h-9 rounded-lg border border-[#c4cbc7] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Review</button>
                          <button type="button" onClick={() => updateTicketStatus(ticket.id, "Resolved")} className="min-h-9 rounded-lg bg-[#d9ecd8] px-3 text-xs font-extrabold text-[#115745]">Resolve</button>
                          <button type="button" onClick={() => updateTicketStatus(ticket.id, "Open")} className="min-h-9 rounded-lg bg-[#e9e4dc] px-3 text-xs font-extrabold text-[#3d4541]">Reopen</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </SettingsPanel>
              </aside>
            </section>
          </div>
        </section>
      </div>

      {activeContact === "chat" && <SupportChatModal onClose={() => setActiveContact(null)} onCreateTicket={(subject) => { const nextId = addSupportRecord({ subject, type: "Chat", status: "Open", priority: "High", message: "Live chat transcript saved for admin review." }); setActiveContact(null); setNotice(`Chat transcript saved as ticket ${nextId}.`); }} />}
      {activeContact === "email" && <EmailAdminModal onClose={() => setActiveContact(null)} onSubmit={submitEmailAdmin} />}
      {activeContact === "call" && <RequestCallModal onClose={() => setActiveContact(null)} onSubmit={submitCallbackRequest} />}
    </main>
  );
}

function VendorProfilePage() {
  const defaultProfile = {
    businessName: "Perera Artisan Works",
    ownerName: "Aruni Perera",
    role: "Master Artisan",
    email: "aruni@pereraartisan.lk",
    phone: "+94 77 412 8890",
    location: "Moratuwa, Sri Lanka",
    workshopAddress: "42 Timber Craft Lane, Moratuwa",
    businessType: "Furniture Manufacturer",
    taxId: "VAT-LK-104882",
    publicSlug: "perera-artisan-works",
    yearsActive: "12",
    teamSize: "24",
    specialty: "Custom teak, walnut, and mahogany furniture",
    bio: "Verified Sri Lankan woodcraft vendor specializing in bespoke home and office furniture.",
    publicProfile: true,
    acceptCustomOrders: true,
    showPhone: true,
    showEmail: true,
    verificationStatus: "Verified",
    payoutStatus: "Active",
  };
  const [profile, setProfile] = useState(() => {
    try {
      return { ...defaultProfile, ...JSON.parse(localStorage.getItem("woodverse-vendor-profile") || "{}") };
    } catch {
      return defaultProfile;
    }
  });
  const [notice, setNotice] = useState("Vendor profile loaded.");
  const [profileActions, setProfileActions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-vendor-profile-actions") || "[]");
    } catch {
      return [];
    }
  });
  const [verificationDocuments, setVerificationDocuments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-vendor-verification-documents") || "null") || [
        { id: "businessRegistration", name: "Business Registration Certificate", status: "Required", fileName: "" },
        { id: "identityDocument", name: "Owner / Director Identity Document", status: "Required", fileName: "" },
        { id: "addressProof", name: "Business Address Proof", status: "Required", fileName: "" },
        { id: "bankProof", name: "Bank Account Confirmation", status: "Required", fileName: "" },
      ];
    } catch {
      return [];
    }
  });

  const updateProfile = (field, value) => setProfile((current) => ({ ...current, [field]: value }));

  const recordProfileAction = (message) => {
    const action = {
      id: `VPA-${Date.now()}`,
      message,
      time: new Date().toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" }),
    };
    setProfileActions((items) => {
      const next = [action, ...items].slice(0, 5);
      try {
        localStorage.setItem("woodverse-vendor-profile-actions", JSON.stringify(next));
      } catch {}
      return next;
    });
    setNotice(message);
  };

  const saveProfile = (event) => {
    event.preventDefault();
    try {
      localStorage.setItem("woodverse-vendor-profile", JSON.stringify(profile));
      localStorage.setItem("woodverse-vendor-settings", JSON.stringify({
        businessName: profile.businessName,
        contactName: profile.ownerName,
        email: profile.email,
        phone: profile.phone,
      }));
    } catch {}
    recordProfileAction("Vendor profile saved.");
  };

  const resetProfile = () => {
    setProfile(defaultProfile);
    try {
      localStorage.setItem("woodverse-vendor-profile", JSON.stringify(defaultProfile));
    } catch {}
    recordProfileAction("Vendor profile reset to default business details.");
  };

  const exportProfile = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), profile }, null, 2);
    try {
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "woodverse-vendor-profile.json";
      link.click();
      URL.revokeObjectURL(url);
      recordProfileAction("Vendor profile export downloaded.");
    } catch {
      setNotice(payload);
    }
  };

  const copyPublicLink = async () => {
    const link = `${window.location.origin}/seller?vendor=${profile.publicSlug}`;
    try {
      await navigator.clipboard.writeText(link);
      recordProfileAction("Public vendor profile link copied.");
    } catch {
      setNotice(link);
    }
  };

  const requestVerification = () => {
    if (verificationDocuments.some((document) => !document.fileName)) {
      recordProfileAction("Upload all required verification documents before requesting approval.");
      return;
    }
    const request = {
      id: `VVR-${Date.now()}`,
      businessName: profile.businessName,
      ownerName: profile.ownerName,
      requestedAt: new Date().toISOString(),
      status: "Submitted",
      documents: verificationDocuments,
    };
    try {
      const existing = JSON.parse(localStorage.getItem("woodverse-vendor-verification-requests") || "[]");
      localStorage.setItem("woodverse-vendor-verification-requests", JSON.stringify([request, ...existing]));
      const applications = JSON.parse(localStorage.getItem("woodverse-registration-applications") || "[]");
      localStorage.setItem("woodverse-registration-applications", JSON.stringify([{
        id: request.id,
        type: "Vendor",
        name: profile.businessName,
        email: profile.email,
        status: "Pending",
        submittedAt: request.requestedAt,
        documents: verificationDocuments,
      }, ...applications]));
    } catch {}
    updateProfile("verificationStatus", "Review Requested");
    recordProfileAction(`Verification request ${request.id} submitted to admin.`);
  };

  const uploadVerificationDocument = (documentId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setVerificationDocuments((items) => {
      const next = items.map((document) => document.id === documentId ? { ...document, fileName: file.name, status: "Submitted" } : document);
      try { localStorage.setItem("woodverse-vendor-verification-documents", JSON.stringify(next)); } catch {}
      return next;
    });
    setProfile((current) => ({ ...current, verificationStatus: "Review Requested" }));
    setNotice(`${file.name} uploaded for admin verification.`);
  };

  const toggleProfileSetting = (field, label) => {
    const nextValue = !profile[field];
    updateProfile(field, nextValue);
    recordProfileAction(`${label} ${nextValue ? "enabled" : "disabled"}.`);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] text-[#303833]">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Profile" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Profile notifications are available from the Dashboard page.")} unreadCount={0} status="Profile" />

          <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#202621]">Vendor Profile</h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#66716b]">
                  Manage the business identity shown to customers, admin, suppliers, and internal vendor tools.
                </p>
              </div>
              <button onClick={() => navigate("/vendor/settings")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
                <Settings className="h-4 w-4" />
                Open Settings
              </button>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">
              {notice}
            </div>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <form onSubmit={saveProfile} className="grid gap-6">
                <SettingsPanel icon={UserCog} title="Public Business Profile" detail="Details customers see when they review the vendor.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SettingsInput label="Business Name" value={profile.businessName} onChange={(value) => updateProfile("businessName", value)} />
                    <SettingsInput label="Owner Name" value={profile.ownerName} onChange={(value) => updateProfile("ownerName", value)} />
                    <SettingsInput label="Role" value={profile.role} onChange={(value) => updateProfile("role", value)} />
                    <SettingsSelect label="Business Type" value={profile.businessType} options={["Furniture Manufacturer", "Wooden Gifts Seller", "Timber Vendor", "Interior Workshop"]} onChange={(value) => updateProfile("businessType", value)} />
                    <SettingsInput label="Public Slug" value={profile.publicSlug} onChange={(value) => updateProfile("publicSlug", value.toLowerCase().replace(/\s+/g, "-"))} />
                    <SettingsInput label="Specialty" value={profile.specialty} onChange={(value) => updateProfile("specialty", value)} />
                  </div>
                  <label className="mt-4 grid gap-2 text-sm font-bold text-[#3d4541]">
                    Business Bio
                    <textarea value={profile.bio} onChange={(event) => updateProfile("bio", event.target.value)} rows={4} className="rounded-lg border border-[#c4cbc7] bg-white px-3 py-2 font-semibold outline-none transition focus:border-[#115745]" />
                  </label>
                </SettingsPanel>

                <SettingsPanel icon={Building2} title="Contact And Workshop" detail="Operational contacts for delivery, production, and admin verification.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SettingsInput label="Email" type="email" value={profile.email} onChange={(value) => updateProfile("email", value)} />
                    <SettingsInput label="Phone" value={profile.phone} onChange={(value) => updateProfile("phone", value)} />
                    <SettingsInput label="Location" value={profile.location} onChange={(value) => updateProfile("location", value)} />
                    <SettingsInput label="Workshop Address" value={profile.workshopAddress} onChange={(value) => updateProfile("workshopAddress", value)} />
                    <SettingsInput label="Tax / VAT ID" value={profile.taxId} onChange={(value) => updateProfile("taxId", value)} />
                    <SettingsInput label="Years Active" type="number" value={profile.yearsActive} onChange={(value) => updateProfile("yearsActive", value)} />
                    <SettingsInput label="Team Size" type="number" value={profile.teamSize} onChange={(value) => updateProfile("teamSize", value)} />
                  </div>
                </SettingsPanel>

                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
                    <Save className="h-4 w-4" />
                    Save Profile
                  </button>
                  <button type="button" onClick={exportProfile} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
                    <Download className="h-4 w-4" />
                    Export Profile
                  </button>
                  <button type="button" onClick={resetProfile} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#e9e4dc] px-4 text-sm font-extrabold text-[#3d4541]">
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>
              </form>

              <aside className="grid content-start gap-6">
                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
                  <div className="grid justify-items-center text-center">
                    <span className="grid h-20 w-20 place-items-center rounded-full border-4 border-[#115745] bg-[#d8c0a4] text-2xl font-extrabold text-[#115745]">
                      {getInitials(profile.ownerName)}
                    </span>
                    <h2 className="mt-4 text-xl font-extrabold text-[#202621]">{profile.businessName}</h2>
                    <p className="text-sm font-semibold text-[#66716b]">{profile.role}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[#66716b]">{profile.location}</p>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                    <div className="rounded-lg bg-[#f8f4ec] p-3">
                      <strong className="block text-xl text-[#202621]">{profile.yearsActive}</strong>
                      <span className="text-xs font-extrabold uppercase text-[#66716b]">Years</span>
                    </div>
                    <div className="rounded-lg bg-[#f8f4ec] p-3">
                      <strong className="block text-xl text-[#202621]">{profile.teamSize}</strong>
                      <span className="text-xs font-extrabold uppercase text-[#66716b]">Team</span>
                    </div>
                  </div>
                </section>

                <SettingsPanel icon={ShieldCheck} title="Profile Controls" detail="Manage visibility and admin verification.">
                  <div className="grid gap-3">
                    <SettingsToggle title="Public profile" detail="Show vendor profile to marketplace customers." checked={profile.publicProfile} onChange={() => toggleProfileSetting("publicProfile", "Public profile")} compact />
                    <SettingsToggle title="Accept custom orders" detail="Allow customers to request bespoke furniture." checked={profile.acceptCustomOrders} onChange={() => toggleProfileSetting("acceptCustomOrders", "Custom orders")} compact />
                    <SettingsToggle title="Show phone number" detail="Display phone on customer-facing profile." checked={profile.showPhone} onChange={() => toggleProfileSetting("showPhone", "Phone visibility")} compact />
                    <SettingsToggle title="Show email" detail="Display email on customer-facing profile." checked={profile.showEmail} onChange={() => toggleProfileSetting("showEmail", "Email visibility")} compact />
                    <button type="button" onClick={requestVerification} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
                      <CheckCircle2 className="h-4 w-4" />
                      Request Verification
                    </button>
                    <button type="button" onClick={copyPublicLink} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
                      <Globe2 className="h-4 w-4" />
                      Copy Public Link
                    </button>
                  </div>
                </SettingsPanel>

                <SettingsPanel icon={FileText} title="Verification Documents" detail="Upload every document before requesting vendor approval.">
                  <div className="grid gap-3">
                    {verificationDocuments.map((document) => (
                      <label key={document.id} className="grid gap-2 rounded-lg border border-[#d8ddd9] bg-[#f8f4ec] p-3">
                        <span className="flex items-center justify-between gap-3 text-sm font-extrabold text-[#202621]">
                          <span>{document.name}</span>
                          <span className={`rounded-full px-2 py-1 text-[10px] uppercase ${document.fileName ? "bg-[#d9ecd8] text-[#115745]" : "bg-[#fff0cd] text-[#8b5633]"}`}>{document.fileName ? "Submitted" : "Required"}</span>
                        </span>
                        <input type="file" required={!document.fileName} accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => uploadVerificationDocument(document.id, event)} className="min-w-0 rounded-md border border-[#c4cbc7] bg-white p-2 text-xs font-semibold" />
                        {document.fileName && <span className="text-xs font-semibold text-[#66716b]">{document.fileName}</span>}
                      </label>
                    ))}
                  </div>
                </SettingsPanel>

                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
                  <h3 className="text-base font-extrabold text-[#202621]">Account Status</h3>
                  <div className="mt-4 grid gap-3">
                    <ProfileStatus label="Verification" value={profile.verificationStatus} />
                    <ProfileStatus label="Payouts" value={profile.payoutStatus} />
                    <ProfileStatus label="Marketplace" value={profile.publicProfile ? "Visible" : "Hidden"} />
                  </div>
                </section>

                <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
                  <h3 className="text-base font-extrabold text-[#202621]">Recent Profile Actions</h3>
                  <div className="mt-4 grid gap-2">
                    {profileActions.length === 0 ? (
                      <p className="rounded-lg bg-[#f8f4ec] px-3 py-2 text-sm font-semibold text-[#66716b]">No profile actions yet.</p>
                    ) : (
                      profileActions.map((action) => (
                        <div key={action.id} className="rounded-lg bg-[#f8f4ec] px-3 py-2">
                          <strong className="block text-sm text-[#202621]">{action.message}</strong>
                          <span className="text-xs font-bold uppercase text-[#68716c]">{action.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function ProfileStatus({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-[#f8f4ec] px-3 py-2">
      <span className="text-sm font-bold text-[#66716b]">{label}</span>
      <strong className="rounded-full bg-[#d9ecd8] px-2.5 py-1 text-xs font-extrabold uppercase text-[#115745]">{value}</strong>
    </div>
  );
}

function VendorSidebar({ active = "Dashboard", onNavigate, onNewOrder }) {
  return (
    <aside className="border-r border-[#d8d2c7] bg-[#f3eee6] px-4 py-6 lg:sticky lg:top-0 lg:h-screen">
      <button onClick={() => onNavigate("Vendor dashboard opened.")} className="mb-7 flex items-center gap-3 px-3 text-left">
        <span className="h-10 w-10 shrink-0 rounded-lg bg-[#102f27] bg-no-repeat" style={{ backgroundImage: "url('/assets/admin-vendor-logo.png')", backgroundSize: "500% auto", backgroundPosition: "25% 35%" }} aria-hidden="true" />
        <span><strong className="block text-xl font-extrabold text-[#115745]">WoodVerse</strong>
        <span className="text-sm font-semibold text-[#777b76]">Vendor Portal</span>
        </span>
      </button>

      <nav className="grid gap-1.5 text-sm font-bold">
        {navigationItems.map(([Icon, label, path]) => (
          <button
            key={label}
            onClick={() => (path ? navigate(path) : onNavigate(`${label} section opened.`))}
            className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-left transition ${active === label ? "bg-[#e1ddd4] text-[#115745] shadow-inner" : "text-[#46504b] hover:bg-[#e9e4dc] hover:text-[#115745]"}`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="min-w-0">{label}</span>
          </button>
        ))}
      </nav>

      <button onClick={onNewOrder} className="mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0d4638]">
        <PlusCircle className="h-5 w-5" />
        New Order
      </button>
    </aside>
  );
}

function VendorHeader({ onAction, onNotifications, unreadCount, status }) {
  return (
    <header className="sticky top-0 z-10 flex min-h-16 flex-wrap items-center justify-between gap-4 border-b border-[#d4d1ca] bg-[#fbf8f1]/95 px-5 py-3 backdrop-blur sm:px-8 lg:px-10">
      <label className="flex h-10 w-full max-w-[520px] items-center rounded-full bg-[#eeeae4] px-4 text-[#747a76]">
        <Search className="h-5 w-5 shrink-0" />
        <input className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" placeholder="Search orders, products..." />
      </label>

      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button onClick={onNotifications} className="relative grid h-10 w-10 place-items-center rounded-full text-[#3d4541] transition hover:bg-[#eeeae4]" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#d24b53] px-1 text-[10px] font-extrabold text-white">{unreadCount}</span>}
        </button>
        <span className={`hidden rounded-full px-2.5 py-1 text-xs font-extrabold uppercase sm:inline-flex ${status === "Connected" ? "bg-[#d9ecd8] text-[#115745]" : "bg-[#fff0cd] text-[#8b5633]"}`}>
          {status}
        </span>
        <button onClick={() => navigate("/vendor/settings")} className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-[#eeeae4]" aria-label="Settings"><Settings className="h-5 w-5" /></button>
        <button onClick={() => navigate("/vendor/help")} className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-[#eeeae4]" aria-label="Help"><HelpCircle className="h-5 w-5" /></button>
        <span className="hidden h-8 w-px bg-[#d4d1ca] sm:block" />
        <div className="hidden text-right sm:block">
          <strong className="block leading-tight text-[#202621]">Aruni Perera</strong>
          <span className="text-xs font-bold uppercase tracking-wide text-[#68716c]">Master Artisan</span>
        </div>
        <button onClick={() => navigate("/vendor/profile")} className="grid h-11 w-11 place-items-center rounded-full border-2 border-[#115745] bg-[#d8c0a4] font-extrabold text-[#115745]" aria-label="Vendor profile">AP</button>
      </div>
    </header>
  );
}

function StatCard({ stat }) {
  return (
    <article className={`grid min-h-[142px] content-between rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm ${stat.danger ? "border-[#e8a4a4] bg-[#fff1f0] text-[#a80012]" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${stat.tone}`}><stat.icon className="h-5 w-5" /></span>
        {stat.helper && <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold uppercase ${stat.badge || stat.danger ? "bg-[#d84d54] text-white" : "bg-[#eef4ef] text-[#2f8b55]"}`}>{stat.helper}</span>}
      </div>
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-[#66716b]">{stat.label}</h2>
        <p className="mt-1 text-2xl font-semibold text-[#202621]">{stat.value}</p>
      </div>
    </article>
  );
}

function SettingsPanel({ icon: Icon, title, detail, children }) {
  return (
    <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 grid grid-cols-[40px_minmax(0,1fr)] gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#eef4ef] text-[#115745]">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-[#202621]">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#66716b]">{detail}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ProductStat({ icon: Icon, label, value, warning = false }) {
  return (
    <article className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <span className={`grid h-11 w-11 place-items-center rounded-lg ${warning ? "bg-[#fff0f0] text-[#d24b53]" : "bg-[#eef4ef] text-[#115745]"}`}>
          <Icon className="h-5 w-5" />
        </span>
        <strong className="text-2xl text-[#202621]">{value}</strong>
      </div>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-[#66716b]">{label}</p>
    </article>
  );
}

function SupplyWarningPanel({ warnings, onReview }) {
  return (
    <section className="rounded-xl border border-[#efb1b1] bg-[#fff0f0] p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[#d24b53]" />
            <h2 className="text-lg font-semibold text-[#202621]">Vendor Supply Warning</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[#6c3a3a]">
            {warnings.length} customer order{warnings.length === 1 ? "" : "s"} need supplier or stock review before production can continue.
          </p>
        </div>
        <div className="grid gap-2">
          {warnings.slice(0, 3).map(({ order, check }) => (
            <button key={order.id} onClick={() => onReview(order)} className="rounded-lg bg-white px-4 py-3 text-left text-sm shadow-sm">
              <strong className="block text-[#202621]">{order.id} - {order.product}</strong>
              <span className="mt-1 block text-[#6c3a3a]">{check.message}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function SupplyCheckBadge({ check }) {
  const tone = check.level === "available"
    ? "bg-[#d9ecd8] text-[#115745]"
    : check.level === "low"
      ? "bg-[#fff0cd] text-[#8b5633]"
      : "bg-[#fff0f0] text-[#b10015]";
  return (
    <span className={`w-fit rounded-full px-3 py-2 text-xs font-extrabold uppercase ${tone}`} title={check.message}>
      {check.label}
    </span>
  );
}

function FulfillmentPlanPanel({ plan }) {
  return (
    <section className="rounded-xl border border-[#d9d5cd] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[#202621]">Stock Or Manufacture Decision</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#66716b]">The system checks ordered items before sending anything to production.</p>
        </div>
        <span className="rounded-full bg-[#eef4ef] px-3 py-1 text-xs font-extrabold uppercase text-[#115745]">
          {plan.filter((item) => item.decision === "manufacture").length} manufacture
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {plan.map((item) => {
          const manufacture = item.decision === "manufacture";
          const Icon = manufacture ? Factory : CheckCircle2;
          return (
            <article key={`${item.name}-${item.quantity}`} className="grid gap-3 rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
              <span className={`grid h-10 w-10 place-items-center rounded-lg ${manufacture ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#d9ecd8] text-[#115745]"}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <strong className="block text-[#202621]">{item.name} x{item.quantity}</strong>
                <span className="mt-1 block text-sm leading-relaxed text-[#66716b]">{item.reason}</span>
              </div>
              <span className={`w-fit rounded-full px-3 py-2 text-xs font-extrabold uppercase ${manufacture ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#d9ecd8] text-[#115745]"}`}>
                {item.label}
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProductCard({ product, onEdit, onRestock, onStatus }) {
  const isArchived = product.status === "Archived";
  return (
    <article className="overflow-hidden rounded-xl border border-[#c2cac5] bg-white shadow-sm">
      <div className="aspect-[4/3] overflow-hidden bg-[#f3eee6]">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
      </div>
      <div className="grid gap-4 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold leading-tight text-[#202621]">{product.name}</h2>
              <p className="mt-1 text-sm text-[#66716b]">{product.category} - {product.material}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold uppercase ${product.status === "Published" ? "bg-[#d9ecd8] text-[#115745]" : product.status === "Draft" ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#e9e4dc] text-[#66716b]"}`}>
              {product.status}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-[#f8f4ec] px-3 py-2">
              <span className="block text-xs font-extrabold uppercase text-[#66716b]">Price</span>
              <strong>{product.price}</strong>
            </div>
            <div className="rounded-lg bg-[#f8f4ec] px-3 py-2">
              <span className="block text-xs font-extrabold uppercase text-[#66716b]">Stock</span>
              <strong className={product.stock <= 10 ? "text-[#d24b53]" : "text-[#202621]"}>{product.stock} units</strong>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onEdit} className="min-h-10 rounded-lg border border-[#c4cbc7] bg-white px-3 text-sm font-extrabold text-[#3d4541]">Edit</button>
            <button onClick={onRestock} className="min-h-10 rounded-lg bg-[#eef4ef] px-3 text-sm font-extrabold text-[#115745]">Restock</button>
          </div>
          <button onClick={() => onStatus(product.id, isArchived ? "Published" : "Archived")} className="min-h-10 rounded-lg bg-[#e9e4dc] px-3 text-sm font-extrabold text-[#3d4541]">
            {isArchived ? "Publish Product" : "Archive Product"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductFormModal({ product, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "Furniture",
    material: product?.material || "",
    price: product?.price || "",
    stock: product?.stock ?? 1,
    status: product?.status || "Draft",
    image: product?.image || "/assets/workspace-desk-neutral.png",
  });
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const submitProduct = (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!form.material.trim()) {
      setError("Material is required.");
      return;
    }
    if (parseOrderAmount(form.price) <= 0) {
      setError("Enter a valid product price.");
      return;
    }
    if (!Number.isFinite(Number(form.stock)) || Number(form.stock) < 0) {
      setError("Stock must be zero or more.");
      return;
    }
    onSubmit(form);
  };

  return (
    <ModalShell title={product ? "Edit Product" : "Add Product"} subtitle="Manage product details shown in the vendor catalog." onClose={onClose}>
      <form onSubmit={submitProduct} className="grid max-h-[calc(90vh-86px)] overflow-y-auto">
        <div className="grid gap-4 px-5 py-5 sm:px-6">
          <div className="overflow-hidden rounded-lg border border-[#d9d5cd] bg-[#f3eee6]">
            <img src={form.image} alt={form.name || "Product preview"} className="h-44 w-full object-cover" />
          </div>
          {error && <p className="rounded-lg border border-[#f0b4b4] bg-[#fff0f0] px-3 py-2 text-sm font-bold text-[#b10015]">{error}</p>}
          <SettingsInput label="Product Name" value={form.name} onChange={(value) => updateField("name", value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsSelect label="Category" value={form.category} options={["Furniture", "Living Room", "Bedroom", "Wooden Gifts", "Office"]} onChange={(value) => updateField("category", value)} />
            <SettingsInput label="Material" value={form.material} onChange={(value) => updateField("material", value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsInput label="Price" value={form.price} onChange={(value) => updateField("price", value)} />
            <SettingsInput label="Stock" type="number" value={form.stock} onChange={(value) => updateField("stock", value)} />
          </div>
          <SettingsSelect label="Image" value={form.image} options={["/assets/workspace-desk-neutral.png", "/assets/product-walnut-task-table.png", "/assets/royal-majesty-sofa-set.png", "/assets/signature-bedframe.png", "/assets/product-carved-gift-box.png", "/assets/product-modular-shelf-unit.png"]} onChange={(value) => updateField("image", value)} />
          <SettingsSelect label="Status" value={form.status} options={["Draft", "Published", "Archived"]} onChange={(value) => updateField("status", value)} />
        </div>
        <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-[#d9d5cd] bg-white px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
            <Save className="h-4 w-4" />
            {product ? "Save Product" : "Add Product"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function QuotationFormModal({ quote, onClose, onSubmit }) {
  const [form, setForm] = useState({
    customer: quote?.customer || "",
    product: quote?.product || "",
    validUntil: quote?.validUntil || getFutureDateLabel(10),
    amount: quote?.amount || "",
    status: quote?.status || "Draft",
    notes: quote?.notes || "",
  });
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const submitQuote = (event) => {
    event.preventDefault();
    if (!form.customer.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (!form.product.trim()) {
      setError("Product or custom request is required.");
      return;
    }
    if (parseOrderAmount(form.amount) <= 0) {
      setError("Enter a valid quotation amount.");
      return;
    }
    onSubmit(form);
  };

  return (
    <ModalShell title={quote ? "Edit Quotation" : "Create Quotation"} subtitle="Prepare a customer quotation with price, validity, and notes." onClose={onClose}>
      <form onSubmit={submitQuote} className="grid max-h-[calc(90vh-86px)] overflow-y-auto">
        <div className="grid gap-4 px-5 py-5 sm:px-6">
          {error && <p className="rounded-lg border border-[#f0b4b4] bg-[#fff0f0] px-3 py-2 text-sm font-bold text-[#b10015]">{error}</p>}
          <SettingsInput label="Customer Name" value={form.customer} onChange={(value) => updateField("customer", value)} />
          <SettingsInput label="Product / Custom Request" value={form.product} onChange={(value) => updateField("product", value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsInput label="Amount" value={form.amount} onChange={(value) => updateField("amount", value)} />
            <SettingsInput label="Valid Until" value={form.validUntil} onChange={(value) => updateField("validUntil", value)} />
          </div>
          <SettingsSelect label="Status" value={form.status} options={["Draft", "Sent", "Approved", "Converted", "Expired"]} onChange={(value) => updateField("status", value)} />
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Notes
            <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} rows={4} className="rounded-lg border border-[#c4cbc7] bg-white px-3 py-2 font-semibold outline-none transition focus:border-[#115745]" />
          </label>
        </div>
        <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-[#d9d5cd] bg-white px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
            <Save className="h-4 w-4" />
            {quote ? "Save Quotation" : "Create Quotation"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ProductionWorkCard({ work, onEdit, onStage, onNext }) {
  const progress = getProductionProgress(work.stage);
  const completed = work.stage === "Completed";
  return (
    <article className="rounded-xl border border-[#d9d5cd] bg-[#fbfaf6] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-lg text-[#202621]">{work.id}</strong>
            <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold uppercase ${work.priority === "High Priority" ? "bg-[#fff0f0] text-[#b10015]" : work.priority === "Low Priority" ? "bg-[#e9e4dc] text-[#66716b]" : "bg-[#fff0cd] text-[#8b5633]"}`}>{work.priority}</span>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-[#202621]">{work.product}</h2>
          <p className="mt-1 text-sm text-[#66716b]">{work.orderId} - {work.customer}</p>
        </div>
        <span className={`rounded-full px-3 py-2 text-xs font-extrabold uppercase ${getProductionTone(work.stage)}`}>{work.stage}</span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs font-extrabold uppercase text-[#66716b]">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[#e9e4dc]">
          <div className="h-full rounded-full bg-[#115745]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <OrderInfo label="Quantity" value={`${work.quantity} units`} />
        <OrderInfo label="Due Date" value={work.dueDate} />
        <OrderInfo label="Assigned" value={work.assignedTo} />
      </div>
      {work.notes && <p className="mt-4 rounded-lg bg-white p-3 text-sm leading-relaxed text-[#545c58]">{work.notes}</p>}

      <div className="mt-5 flex flex-wrap gap-2">
        <select value={work.stage} onChange={(event) => onStage(work, event.target.value)} className="min-h-10 rounded-lg border border-[#c4cbc7] bg-white px-3 text-sm font-extrabold outline-none">
          {productionStages.map((item) => <option key={item}>{item}</option>)}
        </select>
        <button onClick={onNext} disabled={completed} className="min-h-10 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-[#c9c3b8]">Next Stage</button>
        <button onClick={onEdit} className="min-h-10 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Edit</button>
      </div>
    </article>
  );
}

function ProductionWorkModal({ work, onClose, onSubmit }) {
  const [form, setForm] = useState({
    orderId: work?.orderId || "#WV-9482",
    product: work?.product || "",
    customer: work?.customer || "",
    stage: work?.stage || "Carpentry",
    priority: work?.priority || "Normal Priority",
    quantity: work?.quantity || 1,
    dueDate: work?.dueDate || getFutureDateLabel(10),
    assignedTo: work?.assignedTo || "Workshop A",
    notes: work?.notes || "",
  });
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const submitWork = (event) => {
    event.preventDefault();
    if (!form.product.trim()) {
      setError("Product is required.");
      return;
    }
    if (!form.customer.trim()) {
      setError("Customer is required.");
      return;
    }
    if (!Number.isFinite(Number(form.quantity)) || Number(form.quantity) < 1) {
      setError("Quantity must be at least 1.");
      return;
    }
    onSubmit(form);
  };

  return (
    <ModalShell title={work ? "Edit Work Order" : "Create Work Order"} subtitle="Schedule and assign production work for the workshop." onClose={onClose}>
      <form onSubmit={submitWork} className="grid max-h-[calc(90vh-86px)] overflow-y-auto">
        <div className="grid gap-4 px-5 py-5 sm:px-6">
          {error && <p className="rounded-lg border border-[#f0b4b4] bg-[#fff0f0] px-3 py-2 text-sm font-bold text-[#b10015]">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsInput label="Order ID" value={form.orderId} onChange={(value) => updateField("orderId", value)} />
            <SettingsInput label="Customer" value={form.customer} onChange={(value) => updateField("customer", value)} />
          </div>
          <SettingsInput label="Product" value={form.product} onChange={(value) => updateField("product", value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsSelect label="Stage" value={form.stage} options={productionStages} onChange={(value) => updateField("stage", value)} />
            <SettingsSelect label="Priority" value={form.priority} options={["High Priority", "Normal Priority", "Low Priority"]} onChange={(value) => updateField("priority", value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsInput label="Quantity" type="number" value={form.quantity} onChange={(value) => updateField("quantity", value)} />
            <SettingsInput label="Due Date" value={form.dueDate} onChange={(value) => updateField("dueDate", value)} />
          </div>
          <SettingsInput label="Assigned To" value={form.assignedTo} onChange={(value) => updateField("assignedTo", value)} />
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Notes
            <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} rows={4} className="rounded-lg border border-[#c4cbc7] bg-white px-3 py-2 font-semibold outline-none transition focus:border-[#115745]" />
          </label>
        </div>
        <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-[#d9d5cd] bg-white px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
            <Save className="h-4 w-4" />
            {work ? "Save Work Order" : "Create Work Order"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function HelpContactCard({ icon: Icon, title, detail, action, onClick }) {
  return (
    <article className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
      <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#eef4ef] text-[#115745]">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-[#202621]">{title}</h2>
      <p className="mt-2 min-h-[44px] text-sm leading-relaxed text-[#66716b]">{detail}</p>
      <button onClick={onClick} className="mt-4 min-h-10 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
        {action}
      </button>
    </article>
  );
}

function SupportChatModal({ onClose, onCreateTicket }) {
  const [message, setMessage] = useState("I need help connecting supplier and customer notifications.");
  const [messages, setMessages] = useState([
    { sender: "Admin Support", text: "You are connected to WoodVerse admin support. How can we help?" },
  ]);

  const sendMessage = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    const text = message.trim();
    setMessages((items) => [
      ...items,
      { sender: "You", text },
      { sender: "Admin Support", text: "Thanks. We received your message and attached it to the vendor support queue." },
    ]);
    setMessage("");
  };

  return (
    <ModalShell title="Admin Live Chat" subtitle="Connected support chat for vendor portal issues." onClose={onClose}>
      <div className="grid max-h-[calc(90vh-86px)] gap-4 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="grid gap-3 rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] p-4">
          {messages.map((item, index) => (
            <div key={`${item.sender}-${index}`} className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${item.sender === "You" ? "ml-auto bg-[#115745] text-white" : "bg-white text-[#3d4541]"}`}>
              <strong className="block text-xs uppercase opacity-75">{item.sender}</strong>
              <span className="mt-1 block leading-relaxed">{item.text}</span>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="grid gap-3">
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} className="rounded-lg border border-[#c4cbc7] bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-[#115745]" />
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={() => onCreateTicket("Live chat transcript with admin support")} className="min-h-10 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
              Save As Ticket
            </button>
            <button type="submit" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
              <Send className="h-4 w-4" />
              Send Message
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}

function EmailAdminModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    subject: "Vendor portal support request",
    category: "Technical",
    message: "Please review supplier/customer notification connection for my vendor account.",
  });
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submitEmail = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <ModalShell title="Email Admin" subtitle="Send a structured support email to the WoodVerse admin team." onClose={onClose}>
      <form onSubmit={submitEmail} className="grid gap-4 px-5 py-5 sm:px-6">
        <SettingsInput label="Subject" value={form.subject} onChange={(value) => updateField("subject", value)} />
        <SettingsSelect label="Category" value={form.category} options={["Technical", "Orders", "Suppliers", "Payments", "Account"]} onChange={(value) => updateField("category", value)} />
        <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
          Message
          <textarea value={form.message} onChange={(event) => updateField("message", event.target.value)} rows={5} className="rounded-lg border border-[#c4cbc7] bg-white px-3 py-2 font-semibold outline-none transition focus:border-[#115745]" />
        </label>
        <div className="flex flex-wrap justify-end gap-3 border-t border-[#d9d5cd] pt-4">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
            <Mail className="h-4 w-4" />
            Send Email
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function RequestCallModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    phone: "+94 77 412 8890",
    topic: "Notification setup",
    preferredTime: "Today 3:00 PM - 5:00 PM",
  });
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submitCall = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <ModalShell title="Request Call" subtitle="Ask WoodVerse admin support to call the vendor contact." onClose={onClose}>
      <form onSubmit={submitCall} className="grid gap-4 px-5 py-5 sm:px-6">
        <SettingsInput label="Phone Number" value={form.phone} onChange={(value) => updateField("phone", value)} />
        <SettingsSelect label="Topic" value={form.topic} options={["Notification setup", "Order support", "Supplier issue", "Payment issue", "Account access"]} onChange={(value) => updateField("topic", value)} />
        <SettingsSelect label="Preferred Time" value={form.preferredTime} options={["Today 3:00 PM - 5:00 PM", "Tomorrow 9:00 AM - 11:00 AM", "Tomorrow 2:00 PM - 4:00 PM"]} onChange={(value) => updateField("preferredTime", value)} />
        <div className="flex flex-wrap justify-end gap-3 border-t border-[#d9d5cd] pt-4">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
            <PhoneCall className="h-4 w-4" />
            Schedule Call
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function SettingsInput({ label, value, onChange, type = "text" }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-3 font-semibold outline-none transition focus:border-[#115745]"
      />
    </label>
  );
}

function SettingsSelect({ label, value, options, onChange, icon: Icon }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
      {label}
      <span className="flex min-h-11 items-center rounded-lg border border-[#c4cbc7] bg-white px-3 focus-within:border-[#115745]">
        {Icon && <Icon className="mr-2 h-4 w-4 text-[#66716b]" />}
        <select value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent font-semibold outline-none">
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </span>
    </label>
  );
}

function SettingsToggle({ title, detail, checked, onChange, compact = false }) {
  return (
    <button type="button" onClick={onChange} className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] text-left transition hover:border-[#115745] ${compact ? "p-3" : "p-4"}`}>
      <span>
        <strong className="block text-sm text-[#202621]">{title}</strong>
        <span className="mt-1 block text-sm leading-relaxed text-[#66716b]">{detail}</span>
      </span>
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-[#115745]" : "bg-[#c9c3b8]"}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}

function RecentOrders({ orders, onViewAll }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#c2cac5] bg-white shadow-sm xl:col-span-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9d5cd] px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-xl font-semibold text-[#202621]">Recent Orders</h2>
          <p className="mt-1 text-sm text-[#66716b]">Latest customer order activity.</p>
        </div>
        <button onClick={onViewAll} className="rounded-lg bg-[#eef4ef] px-3 py-2 text-sm font-extrabold text-[#115745] transition hover:bg-[#dfeae1]">View All Orders</button>
      </div>
      <div className="grid grid-cols-[1fr_1.6fr_1fr_1.2fr_1.2fr] bg-[#f3eee6] px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-[#56605b] max-lg:hidden">
        <span>Order ID</span><span>Customer</span><span>Date</span><span>Amount</span><span>Status</span>
      </div>
      <div className="divide-y divide-[#d9d5cd]">
        {orders.slice(0, 3).map((order) => (
          <article key={order.id} className="grid grid-cols-[1fr_1.6fr_1fr_1.2fr_1.2fr] items-center gap-4 px-5 py-5 text-sm max-lg:grid-cols-1 sm:px-6">
            <strong className="text-base text-[#202621]">{order.id}</strong>
            <span className="grid grid-cols-[32px_minmax(0,1fr)] items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2f6757] text-xs font-bold text-white">{order.initials}</span>
              <span className="min-w-0 font-semibold">{order.customer}</span>
            </span>
            <span className="text-[#66716b]">{order.date}</span>
            <strong>{order.amount}</strong>
            <span className={`w-fit rounded-full px-3 py-2 text-xs font-extrabold uppercase ${order.tone}`}>{order.status}</span>
          </article>
        ))}
      </div>
    </article>
  );
}

function SystemAlerts({ alerts, onClear, onManageAll }) {
  return (
    <article className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6 xl:col-span-4">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#202621]">System Alerts</h2>
          <p className="mt-1 text-sm text-[#66716b]">Operational items requiring action.</p>
        </div>
        <span className="rounded-full bg-[#d24b53] px-2.5 py-1 text-xs font-extrabold uppercase text-white">Live</span>
      </div>

      <div className="grid gap-3">
        {alerts.length === 0 && (
          <div className="rounded-lg border border-[#d9d5cd] bg-[#f8f4ec] px-4 py-5 text-sm font-semibold text-[#66716b]">
            No active alerts.
          </div>
        )}
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <article key={alert.id} className={`rounded-lg border-l-4 p-4 ${alert.tone}`}>
              <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-3">
                <Icon className="h-5 w-5 text-[#d24b53]" />
                <div>
                  <strong className="block text-sm leading-tight text-[#202621]">{alert.title}</strong>
                  <p className="mt-2 text-sm leading-relaxed text-[#545c58]">{alert.detail}</p>
                  <button onClick={() => onClear(alert.id)} className="mt-3 text-xs font-extrabold uppercase text-[#68716c] hover:text-[#115745]">{alert.time}</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <button onClick={onManageAll} className="mt-5 min-h-11 w-full rounded-lg bg-[#e9e4dc] text-sm font-extrabold text-[#3d4541] transition hover:bg-[#ded7ca]">Manage All Alerts</button>
    </article>
  );
}

function AlertManagerModal({ alerts, resolvedAlerts, onClose, onResolve, onResolveAll, onRestore }) {
  const [tab, setTab] = useState("active");
  const visibleAlerts = tab === "active" ? alerts : resolvedAlerts;

  return (
    <ModalShell title="Manage System Alerts" subtitle="Review active alerts, mark them managed, or restore resolved items." onClose={onClose} size="large">
      <div className="grid max-h-[calc(90vh-86px)] gap-5 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setTab("active")} className={`min-h-10 rounded-lg px-4 text-sm font-extrabold ${tab === "active" ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
              Active Alerts ({alerts.length})
            </button>
            <button onClick={() => setTab("resolved")} className={`min-h-10 rounded-lg px-4 text-sm font-extrabold ${tab === "resolved" ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}>
              Managed Alerts ({resolvedAlerts.length})
            </button>
          </div>
          <button onClick={onResolveAll} disabled={alerts.length === 0} className="min-h-10 rounded-lg bg-[#d24b53] px-4 text-sm font-extrabold text-white transition hover:bg-[#b83f47] disabled:cursor-not-allowed disabled:bg-[#d9d5cd] disabled:text-[#777b76]">
            Mark All Managed
          </button>
        </div>

        <div className="grid gap-3">
          {visibleAlerts.length === 0 && (
            <div className="rounded-lg border border-[#d9d5cd] bg-[#f8f4ec] px-4 py-8 text-center text-sm font-semibold text-[#66716b]">
              {tab === "active" ? "No active alerts." : "No managed alerts yet."}
            </div>
          )}

          {visibleAlerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <article key={`${tab}-${alert.id}`} className={`rounded-xl border border-[#d9d5cd] border-l-4 p-4 ${alert.tone}`}>
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white">
                      <Icon className="h-5 w-5 text-[#d24b53]" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-base text-[#202621]">{alert.title}</strong>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-extrabold uppercase text-[#3d4541]">{alert.severity}</span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-extrabold uppercase text-[#66716b]">{alert.owner}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[#545c58]">{alert.detail}</p>
                      <p className="mt-3 text-xs font-bold uppercase text-[#66716b]">
                        {tab === "active" ? alert.time : `Managed ${alert.resolvedAt}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => (tab === "active" ? onResolve(alert.id) : onRestore(alert.id))}
                    className="min-h-10 rounded-lg bg-white px-4 text-sm font-extrabold text-[#115745] shadow-sm transition hover:bg-[#eef4ef]"
                  >
                    {tab === "active" ? "Mark Managed" : "Restore Alert"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </ModalShell>
  );
}

function NotificationCenterModal({ notifications, readIds, status, onClose, onRead, onReadAll, onSendDemo }) {
  const [filter, setFilter] = useState("All");
  const filteredNotifications = notifications.filter((item) => {
    if (filter === "Unread") return !readIds.includes(item.id);
    if (filter === "All") return true;
    return item.audience === filter;
  });
  const unreadCount = notifications.filter((item) => !readIds.includes(item.id)).length;
  const supplierCount = notifications.filter((item) => item.audience === "Supplier").length;
  const customerCount = notifications.filter((item) => item.audience === "Customer").length;

  return (
    <ModalShell title="Notification Center" subtitle="Supplier and customer updates connected through Socket.IO." onClose={onClose} size="large">
      <div className="grid max-h-[calc(90vh-86px)] gap-5 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-3 sm:grid-cols-4">
            <NotificationSummary label="Socket" value={status} connected={status === "Connected"} />
            <NotificationSummary label="Unread" value={String(unreadCount)} />
            <NotificationSummary label="Supplier" value={String(supplierCount)} />
            <NotificationSummary label="Customer" value={String(customerCount)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onSendDemo("Supplier")} className="min-h-10 rounded-lg bg-[#eef4ef] px-3 text-sm font-extrabold text-[#115745]">Send Supplier Notice</button>
            <button onClick={() => onSendDemo("Customer")} className="min-h-10 rounded-lg bg-[#fff0cd] px-3 text-sm font-extrabold text-[#8b5633]">Send Customer Notice</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {["All", "Unread", "Supplier", "Customer", "System"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`min-h-10 rounded-lg px-4 text-sm font-extrabold ${filter === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541]"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <button onClick={onReadAll} className="min-h-10 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
            Mark All Read
          </button>
        </div>

        <div className="grid gap-3">
          {filteredNotifications.length === 0 && (
            <div className="rounded-lg border border-[#d9d5cd] bg-[#f8f4ec] px-4 py-8 text-center text-sm font-semibold text-[#66716b]">
              No notifications for this filter.
            </div>
          )}

          {filteredNotifications.map((notification) => {
            const isUnread = !readIds.includes(notification.id);
            return (
              <article key={notification.id} className={`rounded-xl border p-4 ${isUnread ? "border-[#115745] bg-[#f3faf4]" : "border-[#d9d5cd] bg-[#fbfaf6]"}`}>
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold uppercase ${notification.audience === "Supplier" ? "bg-[#d9ecd8] text-[#115745]" : notification.audience === "Customer" ? "bg-[#fff0cd] text-[#8b5633]" : "bg-[#e9e4dc] text-[#3d4541]"}`}>
                        {notification.audience}
                      </span>
                      {isUnread && <span className="rounded-full bg-[#d24b53] px-2.5 py-1 text-xs font-extrabold uppercase text-white">Unread</span>}
                      <span className="text-xs font-bold uppercase text-[#66716b]">{notification.time}</span>
                    </div>
                    <strong className="mt-3 block text-base text-[#202621]">{notification.title}</strong>
                    <p className="mt-2 text-sm leading-relaxed text-[#545c58]">{notification.message}</p>
                    <p className="mt-3 text-xs font-bold uppercase text-[#66716b]">From {notification.source}</p>
                  </div>
                  <button
                    onClick={() => onRead(notification.id)}
                    disabled={!isUnread}
                    className="min-h-10 rounded-lg bg-white px-4 text-sm font-extrabold text-[#115745] shadow-sm transition hover:bg-[#eef4ef] disabled:cursor-not-allowed disabled:text-[#9aa29d]"
                  >
                    {isUnread ? "Mark Read" : "Read"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </ModalShell>
  );
}

function NotificationSummary({ label, value, connected = false }) {
  return (
    <div className="rounded-lg border border-[#d9d5cd] bg-[#f8f4ec] px-4 py-3">
      <span className="text-xs font-extrabold uppercase tracking-wide text-[#66716b]">{label}</span>
      <strong className={`mt-1 block text-lg ${connected ? "text-[#115745]" : "text-[#202621]"}`}>{value}</strong>
    </div>
  );
}

function WorkOrderQueue({ workOrders }) {
  return (
    <section className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#202621]">Created Work Orders</h2>
          <p className="mt-1 text-sm text-[#66716b]">New production tasks created from the vendor dashboard.</p>
        </div>
        <span className="rounded-full bg-[#eef4ef] px-3 py-1 text-xs font-extrabold uppercase text-[#115745]">{workOrders.length} Active</span>
      </div>
      <div className="grid gap-3">
        {workOrders.map((workOrder) => (
          <article key={workOrder.id} className="grid gap-3 rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
            <div>
              <strong className="block text-[#202621]">{workOrder.id}</strong>
              <span className="text-sm text-[#66716b]">{workOrder.product}</span>
            </div>
            <div className="text-sm">
              <span className="block font-bold text-[#202621]">{workOrder.stage}</span>
              <span className="text-[#66716b]">Stage</span>
            </div>
            <div className="text-sm">
              <span className="block font-bold text-[#202621]">{workOrder.quantity} units</span>
              <span className="text-[#66716b]">Due {workOrder.dueDate}</span>
            </div>
            <span className="w-fit rounded-full bg-[#ffe4b8] px-3 py-2 text-xs font-extrabold uppercase text-[#8b5633]">{workOrder.priority}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function ModalShell({ title, subtitle, children, onClose, size = "normal" }) {
  const sizeClass = size === "large" ? "max-w-5xl" : "max-w-xl";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#202621]/45 px-4 py-8">
      <section className={`max-h-[90vh] w-full overflow-hidden rounded-xl bg-white shadow-2xl ${sizeClass}`}>
        <div className="flex items-start justify-between gap-4 border-b border-[#d9d5cd] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-semibold text-[#202621]">{title}</h2>
            <p className="mt-1 text-sm text-[#66716b]">{subtitle}</p>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f3eee6] text-[#3d4541] transition hover:bg-[#e3ddd2]" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function AllOrdersModal({ orders, onClose }) {
  const [status, setStatus] = useState("All");
  const statuses = ["All", ...Array.from(new Set(orders.map((order) => order.status)))];
  const filteredOrders = status === "All" ? orders : orders.filter((order) => order.status === status);
  const totalValue = filteredOrders.reduce((sum, order) => sum + parseOrderAmount(order.amount), 0);

  return (
    <ModalShell title="All Customer Orders" subtitle="View every customer order currently tracked in the vendor portal." onClose={onClose} size="large">
      <div className="grid max-h-[calc(90vh-86px)] gap-4 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-wrap gap-2">
            {statuses.map((item) => (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`min-h-10 rounded-lg px-3 text-sm font-extrabold transition ${status === item ? "bg-[#115745] text-white" : "bg-[#f3eee6] text-[#3d4541] hover:bg-[#e3ddd2]"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-[#f8f4ec] px-4 py-3">
              <span className="block text-xs font-extrabold uppercase text-[#66716b]">Orders</span>
              <strong className="text-lg text-[#202621]">{filteredOrders.length}</strong>
            </div>
            <div className="rounded-lg bg-[#f8f4ec] px-4 py-3">
              <span className="block text-xs font-extrabold uppercase text-[#66716b]">Value</span>
              <strong className="text-lg text-[#202621]">LKR {totalValue.toLocaleString("en-US")}</strong>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#d9d5cd]">
          <div className="grid grid-cols-[0.9fr_1.4fr_1.4fr_1fr_1fr_1.1fr] bg-[#f3eee6] px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-[#56605b] max-lg:hidden">
            <span>Order</span><span>Customer</span><span>Product</span><span>Due</span><span>Amount</span><span>Status</span>
          </div>
          <div className="divide-y divide-[#d9d5cd]">
            {filteredOrders.map((order) => (
              <article key={order.id} className="grid grid-cols-[0.9fr_1.4fr_1.4fr_1fr_1fr_1.1fr] items-center gap-4 px-5 py-4 text-sm max-lg:grid-cols-1">
                <strong className="text-[#202621]">{order.id}</strong>
                <span className="grid grid-cols-[32px_minmax(0,1fr)] items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2f6757] text-xs font-bold text-white">{order.initials}</span>
                  <span className="min-w-0 font-semibold">{order.customer}</span>
                </span>
                <span className="font-semibold text-[#3d4541]">{order.product}</span>
                <span className="text-[#66716b]">{order.dueDate}</span>
                <strong>{order.amount}</strong>
                <span className={`w-fit rounded-full px-3 py-2 text-xs font-extrabold uppercase ${order.tone}`}>{order.status}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function OrderDetailsModal({ order, supplyCheck, onClose, onStatus, onWorkOrder, onMessage }) {
  const fulfillmentPlan = getOrderFulfillmentPlan(order, getStoredVendorProducts());
  return (
    <ModalShell title={`${order.id} Details`} subtitle="Customer order details and fulfillment actions." onClose={onClose} size="large">
      <div className="grid max-h-[calc(90vh-86px)] gap-5 overflow-y-auto px-5 py-5 sm:px-6">
        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border border-[#d9d5cd] bg-[#fbfaf6] p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <OrderInfo label="Customer" value={order.customer} />
              <OrderInfo label="Order Date" value={order.date} />
              <OrderInfo label="Product" value={order.product} />
              <OrderInfo label="Due Date" value={order.dueDate} />
              <OrderInfo label="Amount" value={order.amount} />
              <OrderInfo label="Current Status" value={order.status} />
              <OrderInfo label="Production Work Order" value={order.workOrderId || "Not created yet"} />
            </div>
          </div>
          <div className="grid content-start gap-3 rounded-xl border border-[#d9d5cd] bg-white p-5">
            <span className={`w-fit rounded-full px-3 py-2 text-xs font-extrabold uppercase ${order.tone}`}>{order.status}</span>
            <button onClick={() => onStatus(order, "Approved")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
              <CheckCircle2 className="h-4 w-4" />
              Approve And Send To Production
            </button>
            <button onClick={() => onStatus(order, "Processing")} className="min-h-10 rounded-lg bg-[#ffd0a8] px-4 text-sm font-extrabold text-[#8b5633]">Mark Processing</button>
            <button onClick={() => onStatus(order, "Completed")} className="min-h-10 rounded-lg bg-[#d9ecd8] px-4 text-sm font-extrabold text-[#115745]">Mark Completed</button>
            <button onClick={() => onWorkOrder(order)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
              <PackagePlus className="h-4 w-4" />
              Create Work Order
            </button>
            <button onClick={() => onMessage(order)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
              <MessageSquare className="h-4 w-4" />
              Message Customer
            </button>
          </div>
        </section>

        <FulfillmentPlanPanel plan={fulfillmentPlan} />

        <section className={`rounded-xl border p-5 ${supplyCheck.level === "available" ? "border-[#b9d8c8] bg-[#f3faf4]" : "border-[#efb1b1] bg-[#fff0f0]"}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-[#202621]">Supplier And Stock Check</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#545c58]">{supplyCheck.message}</p>
            </div>
            <SupplyCheckBadge check={supplyCheck} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <OrderInfo label="Checked Item" value={supplyCheck.item} />
            <OrderInfo label="Required" value={supplyCheck.required} />
            <OrderInfo label="Available" value={supplyCheck.available} />
          </div>
        </section>

        <section className="rounded-xl border border-[#d9d5cd] bg-[#fbfaf6] p-5">
          <h3 className="font-semibold text-[#202621]">Fulfillment Timeline</h3>
          <div className="mt-4 grid gap-3">
            {["Order received", "Material check", "Production scheduled", "Quality review", "Ready for delivery"].map((step, index) => (
              <div key={step} className="grid grid-cols-[28px_minmax(0,1fr)] items-center gap-3 text-sm">
                <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-extrabold ${index < 2 ? "bg-[#115745] text-white" : "bg-[#e9e4dc] text-[#66716b]"}`}>{index + 1}</span>
                <span className="font-semibold text-[#3d4541]">{step}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ModalShell>
  );
}

function OrderInfo({ label, value }) {
  return (
    <div>
      <span className="text-xs font-extrabold uppercase tracking-wide text-[#66716b]">{label}</span>
      <strong className="mt-1 block text-[#202621]">{value}</strong>
    </div>
  );
}

function WarehouseInfo({ label, value }) {
  return (
    <div className="rounded-lg bg-[#f8f4ec] px-4 py-3">
      <span className="block text-xs font-extrabold uppercase text-[#66716b]">{label}</span>
      <strong className="mt-1 block text-[#202621]">{value}</strong>
    </div>
  );
}

function NewOrderModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    customer: "Nimali Fernando",
    product: "Custom teak dining table",
    amount: "LKR 180,000",
    dueDate: "2026-08-15",
    notes: "Confirm preferred finish before production starts.",
  });

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <ModalShell title="New Order" subtitle="Create a customer order and add it to recent orders." onClose={onClose}>
      <form onSubmit={handleSubmit} className="grid gap-4 px-5 py-5 sm:px-6">
        <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
          Customer Name
          <input required value={form.customer} onChange={(event) => updateField("customer", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
          Product
          <input required value={form.product} onChange={(event) => updateField("product", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Amount
            <input required value={form.amount} onChange={(event) => updateField("amount", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Due Date
            <input required type="date" value={form.dueDate} onChange={(event) => updateField("dueDate", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
          Notes
          <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} rows={3} className="rounded-lg border border-[#c4cbc7] px-3 py-2 font-semibold outline-none focus:border-[#115745]" />
        </label>
        <div className="flex flex-wrap justify-end gap-3 border-t border-[#d9d5cd] pt-4">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
          <button type="submit" className="min-h-11 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">Create Order</button>
        </div>
      </form>
    </ModalShell>
  );
}

function WorkOrderModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    orderId: "#WV-9482",
    customer: "Kasun Wijesinghe",
    product: "Royal teak lounge chair",
    stage: "Carpentry",
    priority: "High Priority",
    quantity: "12",
    dueDate: "2026-08-20",
    assignedTo: "Workshop A",
    notes: "Confirm material availability before cutting.",
  });
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.product.trim()) {
      setError("Product is required.");
      return;
    }
    if (!form.customer.trim()) {
      setError("Customer is required.");
      return;
    }
    if (!Number.isFinite(Number(form.quantity)) || Number(form.quantity) < 1) {
      setError("Quantity must be at least 1.");
      return;
    }
    onSubmit(form);
  };

  return (
    <ModalShell title="Create Work Order" subtitle="Schedule production work for the artisan team." onClose={onClose}>
      <form onSubmit={handleSubmit} className="grid gap-4 px-5 py-5 sm:px-6">
        {error && <p className="rounded-lg border border-[#f0b4b4] bg-[#fff0f0] px-3 py-2 text-sm font-bold text-[#b10015]">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Order ID
            <input required value={form.orderId} onChange={(event) => updateField("orderId", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Customer
            <input required value={form.customer} onChange={(event) => updateField("customer", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
          Product
          <input required value={form.product} onChange={(event) => updateField("product", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Production Stage
            <select value={form.stage} onChange={(event) => updateField("stage", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]">
              <option>Carpentry</option>
              <option>Polishing</option>
              <option>Upholstery</option>
              <option>Quality Check</option>
              <option>Packing</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Priority
            <select value={form.priority} onChange={(event) => updateField("priority", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]">
              <option>High Priority</option>
              <option>Normal Priority</option>
              <option>Low Priority</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Quantity
            <input required min="1" type="number" value={form.quantity} onChange={(event) => updateField("quantity", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
            Due Date
            <input required type="date" value={form.dueDate} onChange={(event) => updateField("dueDate", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
          Assigned To
          <input required value={form.assignedTo} onChange={(event) => updateField("assignedTo", event.target.value)} className="min-h-11 rounded-lg border border-[#c4cbc7] px-3 font-semibold outline-none focus:border-[#115745]" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
          Notes
          <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} rows={3} className="rounded-lg border border-[#c4cbc7] px-3 py-2 font-semibold outline-none focus:border-[#115745]" />
        </label>
        <div className="flex flex-wrap justify-end gap-3 border-t border-[#d9d5cd] pt-4">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
          <button type="submit" className="min-h-11 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">Create Work Order</button>
        </div>
      </form>
    </ModalShell>
  );
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function parseOrderAmount(amount) {
  const numeric = Number(String(amount).replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function getOrderTone(status) {
  if (status === "Approved") return "bg-[#d9ecd8] text-[#2f6757]";
  if (status === "Vendor Approval") return "bg-[#eef6fd] text-[#3d82bd]";
  if (status === "Completed") return "bg-[#d9ecd8] text-[#2f6757]";
  if (status === "Awaiting Payment") return "bg-[#fff0cd] text-[#d2861d]";
  if (status === "Cancelled") return "bg-[#ece7df] text-[#66716b]";
  return "bg-[#ffd0a8] text-[#8b5633]";
}

function getQuoteTone(status) {
  if (status === "Approved") return "bg-[#d9ecd8] text-[#2f6757]";
  if (status === "Sent") return "bg-[#eef6fd] text-[#3d82bd]";
  if (status === "Converted") return "bg-[#e6f4ea] text-[#115745]";
  if (status === "Expired") return "bg-[#ece7df] text-[#66716b]";
  return "bg-[#fff0cd] text-[#8b5633]";
}

function getPurchaseOrderTone(status) {
  if (status === "Received") return "text-[#115745]";
  if (status === "Supplier Confirmed") return "text-[#2f6757]";
  if (status === "In Transit") return "text-[#3d82bd]";
  if (status === "Cancelled") return "text-[#b10015]";
  if (status === "Sent") return "text-[#8b5633]";
  return "text-[#66716b]";
}

function getInitialVendorInventory() {
  const productRows = initialVendorProducts.map((product) => ({
    id: `INV-${product.id}`,
    name: product.name,
    category: product.category,
    type: "Product",
    quantity: Number(product.stock) || 0,
    unit: "units",
    reorderPoint: 8,
    unitValue: parseOrderAmount(product.price),
    status: getInventoryStatus(Number(product.stock) || 0, 8),
    location: product.stock <= 10 ? "Showroom Reserve" : "Finished Goods",
    lastUpdated: "Seed data",
  }));
  const materialRows = supplierMaterialStock.map((item) => ({
    id: `INV-MAT-${item.material}`,
    name: item.material,
    category: "Raw Material",
    type: "Material",
    quantity: item.available,
    unit: item.unit,
    reorderPoint: getMaterialReorderPoint(item),
    unitValue: getMaterialUnitValue(item.material),
    status: getInventoryStatus(item.available, getMaterialReorderPoint(item)),
    location: item.available <= 3 ? "Warehouse A - Reorder" : "Warehouse A",
    lastUpdated: "Supplier sync",
  }));
  return [...productRows, ...materialRows];
}

function getInventoryStatus(quantity, reorderPoint) {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= reorderPoint) return "Low Stock";
  return "Ready";
}

function getInventoryTone(status) {
  if (status === "Ready") return "bg-[#d9ecd8] text-[#115745]";
  if (status === "Low Stock") return "bg-[#fff0cd] text-[#8b5633]";
  return "bg-[#fff0f0] text-[#b10015]";
}

function getWarehouseUsage(warehouse) {
  return Math.round((warehouse.used / warehouse.capacity) * 100);
}

function getWarehouseTone(status) {
  if (status === "Operational") return "bg-[#d9ecd8] text-[#115745]";
  if (status === "Near Capacity") return "bg-[#fff0cd] text-[#8b5633]";
  if (status === "Maintenance") return "bg-[#eef6fd] text-[#3d82bd]";
  return "bg-[#fff0f0] text-[#b10015]";
}

function getWarehouseGuidance(warehouse) {
  const usage = getWarehouseUsage(warehouse);
  if (warehouse.status === "Maintenance") return "Avoid new transfers until maintenance is completed.";
  if (usage >= 90) return "Stop inbound transfers and move overflow to a lower-use warehouse.";
  if (usage >= 75) return "Use for priority stock only and schedule outbound transfers.";
  return "Capacity is healthy for normal inbound and outbound stock movement.";
}

function getShipmentTone(status) {
  if (status === "Delivered") return "text-[#115745]";
  if (status === "In Transit") return "text-[#3d82bd]";
  if (status === "Ready for Dispatch") return "text-[#2f6757]";
  if (status === "Delayed") return "text-[#b10015]";
  if (status === "Cancelled") return "text-[#66716b]";
  return "text-[#8b5633]";
}

function getMaterialUnitValue(material) {
  if (material === "Mahogany") return 4200;
  if (material === "Walnut") return 5600;
  if (material === "Teak") return 4800;
  if (material === "Oak") return 3900;
  if (material === "Fabric") return 1800;
  return 2600;
}

function getProductionProgress(stage) {
  const index = productionStages.indexOf(stage);
  if (index < 0) return 0;
  return Math.round(((index + 1) / productionStages.length) * 100);
}

function getProductionTone(stage) {
  if (stage === "Completed") return "bg-[#d9ecd8] text-[#115745]";
  if (stage === "Quality Check") return "bg-[#eef6fd] text-[#3d82bd]";
  if (stage === "Packing") return "bg-[#e6f4ea] text-[#115745]";
  if (stage === "Carpentry") return "bg-[#ffd0a8] text-[#8b5633]";
  return "bg-[#fff0cd] text-[#8b5633]";
}

function getNextStoredVendorOrderId() {
  try {
    const existingOrders = JSON.parse(localStorage.getItem("woodverse-vendor-orders") || "null") || initialOrders;
    const numericIds = existingOrders.map((order) => Number(String(order.id).replace("#WV-", ""))).filter(Boolean);
    return `#WV-${Math.max(...numericIds, 9482) + 1}`;
  } catch {
    return `#WV-${Date.now().toString().slice(-4)}`;
  }
}

function getStoredVendorProducts() {
  try {
    return JSON.parse(localStorage.getItem("woodverse-vendor-products") || "null") || initialVendorProducts;
  } catch {
    return initialVendorProducts;
  }
}

function getOrderItems(order) {
  if (Array.isArray(order.items) && order.items.length > 0) {
    return order.items.map((item) => ({
      name: item.name || order.product,
      vendor: item.vendor,
      quantity: Math.max(1, Number(item.quantity) || 1),
      stock: item.stock,
      stockType: item.stockType,
    }));
  }
  return [{ name: order.product, quantity: getOrderRequiredUnits(order), stockType: order.stockType }];
}

function getOrderFulfillmentPlan(order, vendorProducts = initialVendorProducts) {
  const storedPlan = Array.isArray(order.fulfillmentPlan) ? order.fulfillmentPlan : [];
  return getOrderItems(order).map((item) => {
    const requiredUnits = Math.max(1, Number(item.quantity) || 1);
    const storedDecision = storedPlan.find((planItem) => normalizeMatchText(planItem.name) === normalizeMatchText(item.name));
    const productMatch = findMatchingVendorProduct(item.name, vendorProducts);

    if (productMatch) {
      const available = Number(productMatch.stock) || 0;
      if (available >= requiredUnits) {
        return {
          ...item,
          stockItem: productMatch.name,
          available,
          decision: "stock",
          label: "In Stock",
          reason: `${productMatch.name} has ${available} units available.`,
        };
      }
      return {
        ...item,
        stockItem: productMatch.name,
        available,
        decision: "manufacture",
        label: "Manufacture",
        reason: `${productMatch.name} has ${available} units, but ${requiredUnits} are required.`,
      };
    }

    if (item.stockType === "out" || storedDecision?.decision === "manufacture" || item.name.toLowerCase().includes("custom")) {
      return {
        ...item,
        stockItem: "No available stock",
        available: 0,
        decision: "manufacture",
        label: "Manufacture",
        reason: storedDecision?.reason || "No available vendor stock was found for this item.",
      };
    }

    return {
      ...item,
      stockItem: item.stock || "Catalog stock",
      available: item.stockType === "low" ? requiredUnits : requiredUnits,
      decision: "stock",
      label: item.stockType === "low" ? "Low Stock" : "In Stock",
      reason: storedDecision?.reason || "Catalog stock is available for this customer order.",
    };
  });
}

function getManufactureItemsForOrder(order, vendorProducts = getStoredVendorProducts()) {
  return getOrderFulfillmentPlan(order, vendorProducts).filter((item) => item.decision === "manufacture");
}

function findMatchingVendorProduct(itemName, vendorProducts) {
  const normalizedItem = normalizeMatchText(itemName);
  return vendorProducts.find((product) => {
    const normalizedProduct = normalizeMatchText(product.name);
    if (normalizedItem.includes(normalizedProduct) || normalizedProduct.includes(normalizedItem)) return true;
    const itemTokens = new Set(normalizedItem.split(" ").filter((token) => token.length > 2));
    const productTokens = normalizedProduct.split(" ").filter((token) => token.length > 2);
    const matches = productTokens.filter((token) => itemTokens.has(token)).length;
    return matches >= Math.min(2, productTokens.length);
  });
}

function normalizeMatchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSupplierDefaultMaterial(supplier) {
  const supplierText = normalizeMatchText(supplier.material);
  const matchingMaterial = supplierMaterialStock.find((item) => supplierText.includes(normalizeMatchText(item.material)));
  return matchingMaterial?.material || supplierMaterialStock[0].material;
}

function getSupplierForMaterial(material) {
  const materialText = normalizeMatchText(material);
  return vendorSupplierDirectory.find((supplier) => normalizeMatchText(supplier.material).includes(materialText));
}

function getMaterialStockDecision(item) {
  const reorderPoint = getMaterialReorderPoint(item);
  const targetStock = getMaterialTargetStock(item);
  const requestAmount = Math.max(targetStock - item.available, reorderPoint);
  const requestQuantity = `${requestAmount} ${item.unit}`;

  if (item.available <= 0) {
    return {
      label: "Out of Stock",
      tone: "bg-[#fff0f0] text-[#b10015]",
      reorderPoint,
      coverage: "0 jobs",
      requestQuantity,
      actionLabel: "Request",
      actionNeeded: true,
      message: "Production cannot start with this material. Send a supplier request before approving manufacturing.",
    };
  }

  if (item.available <= reorderPoint) {
    return {
      label: "Low Stock",
      tone: "bg-[#fff0cd] text-[#8b5633]",
      reorderPoint,
      coverage: `${Math.floor(item.available / 2)} small jobs`,
      requestQuantity,
      actionLabel: "Request",
      actionNeeded: true,
      message: "Stock can cover limited work, but new manufacturing should be backed by a supplier request.",
    };
  }

  const topUpQuantity = `${reorderPoint} ${item.unit}`;
  return {
    label: "Ready",
    tone: "bg-[#d9ecd8] text-[#115745]",
    reorderPoint,
    coverage: `${Math.floor(item.available / 2)} small jobs`,
    requestQuantity: topUpQuantity,
    actionLabel: "Request More",
    actionNeeded: false,
    message: "Stock is above the reorder point. Vendor can start normal production for this material.",
  };
}

function getMaterialReorderPoint(item) {
  if (item.unit === "meters") return 8;
  if (item.unit === "pieces") return 10;
  return 6;
}

function getMaterialTargetStock(item) {
  if (item.unit === "meters") return 24;
  if (item.unit === "pieces") return 30;
  return 24;
}

function getOrderSupplyCheck(order, vendorProducts = initialVendorProducts) {
  const plan = getOrderFulfillmentPlan(order, vendorProducts);
  const manufactureItems = plan.filter((item) => item.decision === "manufacture");

  if (manufactureItems.length === 0) {
    const itemLabel = plan.length === 1 ? plan[0].name : `${plan.length} items`;
    const availableLabel = plan.map((item) => `${item.name}: ${item.available} units`).join(", ");
    return {
      level: "available",
      label: "In Stock",
      item: itemLabel,
      required: `${getOrderRequiredUnits(order)} units`,
      available: availableLabel || "Available",
      message: "All ordered items can be fulfilled from stock. No manufacturing approval is required.",
    };
  }

  const orderText = manufactureItems.map((item) => item.name).join(" ").toLowerCase();
  const materialMatch = supplierMaterialStock.find((material) => material.keywords.some((keyword) => orderText.includes(keyword)));
  if (materialMatch) {
    const required = Math.max(2, manufactureItems.reduce((sum, item) => sum + item.quantity, 0) * 2);
    if (materialMatch.available >= required) {
      return {
        level: "low",
        label: "Manufacture",
        item: materialMatch.material,
        required: `${required} ${materialMatch.unit}`,
        available: `${materialMatch.available} ${materialMatch.unit}`,
        message: `${manufactureItems.length} item${manufactureItems.length === 1 ? "" : "s"} need manufacturing. ${materialMatch.material} supplier stock is available after vendor approval.`,
      };
    }
    return {
      level: materialMatch.available > 0 ? "low" : "blocked",
      label: materialMatch.available > 0 ? "Low Supply" : "Supply Warning",
      item: materialMatch.material,
      required: `${required} ${materialMatch.unit}`,
      available: `${materialMatch.available} ${materialMatch.unit}`,
      message: `${manufactureItems.length} item${manufactureItems.length === 1 ? "" : "s"} need manufacturing, but ${materialMatch.material} supplier stock is not enough.`,
    };
  }

  return {
    level: "low",
    label: "Manufacture",
    item: manufactureItems.map((item) => item.name).join(", "),
    required: `${manufactureItems.reduce((sum, item) => sum + item.quantity, 0)} order units`,
    available: "Needs approval",
    message: "One or more ordered items are not available in stock. Vendor approval is required before production tracking.",
  };
}

function getOrderRequiredUnits(order) {
  const itemTotal = (order.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  return Math.max(1, itemTotal || 1);
}

function normalizeLkrPrice(value) {
  const numeric = parseOrderAmount(value);
  return `LKR ${numeric.toLocaleString("en-US")}`;
}

function SalesChart({ range }) {
  const data = salesRanges[range] || salesRanges["Last 6 Months"];
  const maxRevenue = 1200000;
  const chartWidth = 720;
  const chartHeight = 260;
  const padding = { top: 20, right: 26, bottom: 42, left: 82 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const yTicks = [1200000, 1000000, 800000, 600000, 400000, 200000, 0];
  const points = data.map((item, index) => {
    const x = padding.left + (data.length === 1 ? plotWidth / 2 : (plotWidth / (data.length - 1)) * index);
    const y = padding.top + plotHeight - (item.revenue / maxRevenue) * plotHeight;
    return { ...item, x, y };
  });
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `${padding.left},${padding.top + plotHeight} ${linePoints} ${padding.left + plotWidth},${padding.top + plotHeight}`;
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const bestMonth = data.reduce((best, item) => (item.revenue > best.revenue ? item : best), data[0]);
  const previous = data[data.length - 2]?.revenue || data[0].revenue;
  const growth = Math.round(((data[data.length - 1].revenue - previous) / previous) * 100);

  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-lg border border-[#e1ddd4] bg-[#fbfaf6]">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[320px] w-full" role="img" aria-label={`${range} monthly sales performance chart`}>
          <defs>
            <linearGradient id="vendor-sales-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#115745" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#115745" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const y = padding.top + plotHeight - (tick / maxRevenue) * plotHeight;
            return (
              <g key={tick}>
                <line x1={padding.left} x2={padding.left + plotWidth} y1={y} y2={y} stroke="#ded8ce" strokeWidth="1" />
                <text x={padding.left - 12} y={y + 4} textAnchor="end" className="fill-[#747a76] text-[11px] font-semibold">
                  {formatLkrShort(tick)}
                </text>
              </g>
            );
          })}

          <line x1={padding.left} x2={padding.left} y1={padding.top} y2={padding.top + plotHeight} stroke="#bfc6c1" strokeWidth="1.4" />
          <line x1={padding.left} x2={padding.left + plotWidth} y1={padding.top + plotHeight} y2={padding.top + plotHeight} stroke="#bfc6c1" strokeWidth="1.4" />
          <polygon points={areaPoints} fill="url(#vendor-sales-area)" />
          <polyline points={linePoints} fill="none" stroke="#115745" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((point) => (
            <g key={point.month}>
              <line x1={point.x} x2={point.x} y1={point.y + 12} y2={padding.top + plotHeight} stroke="#d9d5cd" strokeDasharray="4 6" />
              <circle cx={point.x} cy={point.y} r="8" fill="white" stroke="#115745" strokeWidth="4" />
              <circle cx={point.x} cy={point.y} r="3" fill="#115745" />
              <text x={point.x} y={point.y - 14} textAnchor="middle" className="fill-[#115745] text-[11px] font-bold">
                {formatLkrShort(point.revenue)}
              </text>
              <text x={point.x} y={padding.top + plotHeight + 28} textAnchor="middle" className="fill-[#5f6964] text-[12px] font-bold">
                {point.month}
              </text>
            </g>
          ))}

          <text x={padding.left} y={chartHeight - 6} className="fill-[#747a76] text-[10px] font-bold uppercase">
            Revenue in LKR
          </text>
        </svg>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ChartMetric label="Total Revenue" value={formatLkrShort(totalRevenue)} />
        <ChartMetric label="Customer Orders" value={String(totalOrders)} />
        <ChartMetric label="Best Month" value={`${bestMonth.month} ${formatLkrShort(bestMonth.revenue)}`} helper={`${growth >= 0 ? "+" : ""}${growth}% vs previous`} />
      </div>
    </div>
  );
}

function ChartMetric({ label, value, helper }) {
  return (
    <div className="rounded-lg border border-[#e1ddd4] bg-[#fbfaf6] px-4 py-3">
      <span className="text-xs font-extrabold uppercase tracking-wide text-[#66716b]">{label}</span>
      <strong className="mt-1 block text-lg text-[#202621]">{value}</strong>
      {helper && <span className="text-xs font-bold text-[#2f8b55]">{helper}</span>}
    </div>
  );
}

function formatLkrShort(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
}

function DonutChart() {
  return (
    <svg viewBox="0 0 180 180" className="h-52 w-52" aria-label="Production stages donut chart">
      <circle cx="90" cy="90" r="62" fill="none" stroke="#115745" strokeWidth="26" strokeDasharray="175 389" strokeDashoffset="0" />
      <circle cx="90" cy="90" r="62" fill="none" stroke="#8b5633" strokeWidth="26" strokeDasharray="109 389" strokeDashoffset="-175" />
      <circle cx="90" cy="90" r="62" fill="none" stroke="#334f35" strokeWidth="26" strokeDasharray="105 389" strokeDashoffset="-284" />
      <circle cx="90" cy="90" r="44" fill="white" />
      <text x="90" y="86" textAnchor="middle" className="fill-[#202621] text-[18px] font-bold">32</text>
      <text x="90" y="106" textAnchor="middle" className="fill-[#66716b] text-[10px] font-bold uppercase">Active Works</text>
    </svg>
  );
}

export { VendorCustomerOrdersPage, VendorDashboardPage, VendorHelpCenterPage, VendorInventoryPage, VendorProductionTrackingPage, VendorProductsPage, VendorProfilePage, VendorPurchaseOrdersPage, VendorQuotationsPage, VendorSettingsPage, VendorShipmentsPage, VendorSuppliersPage, VendorWarehousesPage };
