import {
  AlertTriangle,
  Archive,
  Bell,
  Boxes,
  Building2,
  Factory,
  FileText,
  MessageSquare,
  Settings,
  ShoppingCart,
  Truck,
  Warehouse,
} from "lucide-react";

export const initialVendorProducts = [
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

export const supplierMaterialStock = [
  { material: "Teak", available: 28, unit: "planks", keywords: ["teak", "sofa"] },
  { material: "Mahogany", available: 0, unit: "planks", keywords: ["mahogany"] },
  { material: "Walnut", available: 14, unit: "boards", keywords: ["walnut"] },
  { material: "Oak", available: 3, unit: "boards", keywords: ["oak"] },
  { material: "Satinwood", available: 18, unit: "pieces", keywords: ["satinwood", "gift box"] },
  { material: "Fabric", available: 22, unit: "meters", keywords: ["fabric", "chair", "lounge"] },
];

export const vendorSupplierDirectory = [
  { id: "SUP-301", name: "Lumbini Timber Co.", material: "Teak and Mahogany", location: "Moratuwa", leadTime: "2 days", rating: "4.9", status: "Preferred", contact: "+94 77 214 9801" },
  { id: "SUP-302", name: "Ceylon Hardwood Mills", material: "Walnut and Oak", location: "Kurunegala", leadTime: "4 days", rating: "4.7", status: "Active", contact: "+94 71 552 1180" },
  { id: "SUP-303", name: "Satinwood Craft Supply", material: "Satinwood and Gift Stock", location: "Galle", leadTime: "3 days", rating: "4.8", status: "Active", contact: "+94 76 440 2281" },
];

export const initialMaterialRequests = [
  { id: "MR-1208", supplier: "Lumbini Timber Co.", material: "Mahogany", quantity: "40 planks", linkedWork: "WO-0417", status: "Supplier Confirmed", dueDate: "Aug 03, 2026" },
  { id: "MR-1207", supplier: "Ceylon Hardwood Mills", material: "Walnut", quantity: "18 boards", linkedWork: "WO-0418", status: "Requested", dueDate: "Aug 05, 2026" },
  { id: "MR-1206", supplier: "Satinwood Craft Supply", material: "Satinwood", quantity: "24 pieces", linkedWork: "WO-0416", status: "Received", dueDate: "Jul 29, 2026" },
];

export const initialVendorPurchaseOrders = [
  { id: "VPO-2104", supplier: "Lumbini Timber Co.", material: "Mahogany", quantity: 40, unit: "planks", unitPrice: 4200, linkedWork: "WO-0417", status: "Sent", dueDate: "Aug 03, 2026", total: 168000 },
  { id: "VPO-2103", supplier: "Ceylon Hardwood Mills", material: "Walnut", quantity: 18, unit: "boards", unitPrice: 5600, linkedWork: "WO-0418", status: "Draft", dueDate: "Aug 05, 2026", total: 100800 },
];

export const initialVendorWarehouses = [
  { id: "WH-A", name: "Warehouse A", location: "Moratuwa Main Yard", manager: "Nuwan Perera", capacity: 500, used: 385, zones: 6, status: "Operational", focus: "Raw materials and cutting stock" },
  { id: "WH-B", name: "Finished Goods Store", location: "Colombo Dispatch Hub", manager: "Aruni Perera", capacity: 240, used: 218, zones: 4, status: "Near Capacity", focus: "Packed customer orders" },
  { id: "WH-C", name: "Showroom Reserve", location: "Nugegoda Showroom", manager: "Dilan Silva", capacity: 120, used: 62, zones: 3, status: "Operational", focus: "Display stock and urgent replacements" },
];

export const initialVendorShipments = [
  { id: "SHP-3304", type: "Customer Delivery", reference: "#WV-9481", contact: "Shani De Silva", destination: "Colombo 05", carrier: "Lanka Freight", status: "Ready for Dispatch", date: "2026-08-01", items: "Mahogany coffee table", priority: "Normal" },
  { id: "SHP-3303", type: "Inbound Material", reference: "VPO-2104", contact: "Lumbini Timber Co.", destination: "Warehouse A", carrier: "Supplier Truck", status: "In Transit", date: "2026-08-03", items: "40 planks Mahogany", priority: "High" },
  { id: "SHP-3302", type: "Customer Delivery", reference: "#WV-9478", contact: "Dinesh Bandara", destination: "Kandy", carrier: "Express Move", status: "Delivered", date: "2026-07-30", items: "Oak wardrobe", priority: "Normal" },
];

export const stats = [
  { icon: Archive, label: "Total Sales", value: "LKR 1.2M", helper: "+12%", tone: "bg-[#ffc090] text-[#8b5633]" },
  { icon: Boxes, label: "Active Products", value: "156", helper: "428 total", tone: "bg-[#2f6757] text-white" },
  { icon: ShoppingCart, label: "New Orders", value: "24", helper: "9 new", tone: "bg-[#4f6b4e] text-white", badge: true },
  { icon: Factory, label: "Active Works", value: "32", helper: "Live", tone: "bg-[#d5e2ef] text-[#3c72a0]" },
  { icon: FileText, label: "Pending Quotes", value: "18", helper: "Review", tone: "bg-[#ffe4b8] text-[#c47b23]" },
  { icon: AlertTriangle, label: "Low Materials", value: "05", helper: "Order", tone: "bg-[#f8b8b8] text-[#b10015]", danger: true },
];

export const initialOrders = [
  { id: "#WV-9482", customer: "Kasun Wijesinghe", initials: "KW", product: "Teak executive desk", date: "Oct 24, 2023", dueDate: "Nov 08, 2023", amount: "LKR 245,000", status: "Processing", tone: "bg-[#ffd0a8] text-[#8b5633]" },
  { id: "#WV-9481", customer: "Shani De Silva", initials: "SD", product: "Mahogany coffee table", date: "Oct 23, 2023", dueDate: "Nov 02, 2023", amount: "LKR 89,000", status: "Completed", tone: "bg-[#d9ecd8] text-[#2f6757]" },
  { id: "#WV-9480", customer: "Ranil Thilak", initials: "RT", product: "Full dining room set", date: "Oct 22, 2023", dueDate: "Nov 18, 2023", amount: "LKR 1,240,000", status: "Awaiting Payment", tone: "bg-[#fff0cd] text-[#d2861d]" },
  { id: "#WV-9479", customer: "Amara Jayawardena", initials: "AJ", product: "Walnut TV console", date: "Oct 20, 2023", dueDate: "Nov 05, 2023", amount: "LKR 168,000", status: "Processing", tone: "bg-[#ffd0a8] text-[#8b5633]" },
  { id: "#WV-9478", customer: "Dinesh Bandara", initials: "DB", product: "Oak wardrobe", date: "Oct 18, 2023", dueDate: "Oct 31, 2023", amount: "LKR 310,000", status: "Completed", tone: "bg-[#d9ecd8] text-[#2f6757]" },
  { id: "#WV-9477", customer: "Malkanthi Silva", initials: "MS", product: "Custom lounge chair", date: "Oct 16, 2023", dueDate: "Nov 10, 2023", amount: "LKR 126,500", status: "Cancelled", tone: "bg-[#ece7df] text-[#66716b]" },
];

export const initialQuotations = [
  { id: "QT-7801", customer: "Nimali Fernando", product: "Custom teak console table", date: "Jul 28, 2026", validUntil: "Aug 07, 2026", amount: "LKR 180,000", status: "Draft", notes: "Include satin finish and brass drawer pulls." },
  { id: "QT-7800", customer: "Kasun Wijesinghe", product: "Teak executive desk", date: "Jul 27, 2026", validUntil: "Aug 06, 2026", amount: "LKR 245,000", status: "Sent", notes: "Customer requested delivery to Colombo 05." },
  { id: "QT-7799", customer: "Amara Jayawardena", product: "Walnut TV console", date: "Jul 25, 2026", validUntil: "Aug 04, 2026", amount: "LKR 168,000", status: "Approved", notes: "Ready to convert to customer order." },
  { id: "QT-7798", customer: "Dinesh Bandara", product: "Oak wardrobe", date: "Jul 22, 2026", validUntil: "Aug 01, 2026", amount: "LKR 310,000", status: "Expired", notes: "Price needs review due to material changes." },
];

export const productionStages = ["Carpentry", "Polishing", "Upholstery", "Quality Check", "Packing", "Completed"];

export const initialProductionWorks = [
  { id: "WO-0417", orderId: "#WV-9482", product: "Teak executive desk", customer: "Kasun Wijesinghe", stage: "Carpentry", priority: "High Priority", quantity: 1, dueDate: "Aug 08, 2026", assignedTo: "Workshop A", notes: "Confirm drawer measurements before polish." },
  { id: "WO-0418", orderId: "#WV-9479", product: "Walnut TV console", customer: "Amara Jayawardena", stage: "Polishing", priority: "Normal Priority", quantity: 2, dueDate: "Aug 05, 2026", assignedTo: "Finishing Team", notes: "Matte finish requested." },
  { id: "WO-0419", orderId: "#WV-9478", product: "Oak wardrobe", customer: "Dinesh Bandara", stage: "Quality Check", priority: "Normal Priority", quantity: 1, dueDate: "Aug 01, 2026", assignedTo: "QC Desk", notes: "Check hinge alignment." },
  { id: "WO-0420", orderId: "#WV-9481", product: "Mahogany coffee table", customer: "Shani De Silva", stage: "Completed", priority: "Low Priority", quantity: 1, dueDate: "Jul 30, 2026", assignedTo: "Dispatch", notes: "Ready for delivery confirmation." },
];

export const initialAlerts = [
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

export const salesRanges = {
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

export const initialNotifications = [
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

export const helpTopics = [
  { icon: ShoppingCart, title: "Customer Orders", detail: "Order status, payment confirmations, delivery updates, and customer changes." },
  { icon: Factory, title: "Production Tracking", detail: "Work order stages, workshop capacity, due dates, and quality checks." },
  { icon: Building2, title: "Supplier Coordination", detail: "Material requests, supplier confirmations, purchase orders, and low stock alerts." },
  { icon: Bell, title: "Notifications", detail: "Supplier and customer notification routing, unread alerts, and Socket.IO status." },
];

export const vendorFaqs = [
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
