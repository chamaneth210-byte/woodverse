import { apiRequest, navigate } from "../../utils";
import { formatOrderDate, getInitialsFromName, normalizeMatchText } from "./format.js";
import { initialOrders, initialProductionWorks, initialVendorProducts, supplierMaterialStock, vendorSupplierDirectory } from "./seed.js";
import { vendorAdminNotificationsStorageKey, vendorOpenNewOrderStorageKey, vendorOrdersStorageKey, vendorProductionStorageKey } from "./storageKeys.js";

export function getStoredVendorOrders() {
  try {
    return JSON.parse(localStorage.getItem(vendorOrdersStorageKey) || "null") || initialOrders;
  } catch {
    return initialOrders;
  }
}

export function getStoredVendorAdminNotifications() {
  try {
    return JSON.parse(localStorage.getItem(vendorAdminNotificationsStorageKey) || "null") || [];
  } catch {
    return [];
  }
}

export function requestVendorNewOrder() {
  try {
    localStorage.setItem(vendorOpenNewOrderStorageKey, "true");
  } catch {}
  navigate("/vendor/customer-orders");
}

export function getNextStoredVendorOrderId() {
  try {
    const existingOrders = JSON.parse(localStorage.getItem("woodverse-vendor-orders") || "null") || initialOrders;
    const numericIds = existingOrders.map((order) => Number(String(order.id).replace("#WV-", ""))).filter(Boolean);
    return `#WV-${Math.max(...numericIds, 9482) + 1}`;
  } catch {
    return `#WV-${Date.now().toString().slice(-4)}`;
  }
}

export function getStoredVendorProducts() {
  try {
    return JSON.parse(localStorage.getItem("woodverse-vendor-products") || "null") || initialVendorProducts;
  } catch {
    return initialVendorProducts;
  }
}

export function getStoredProductionWorks() {
  try {
    return JSON.parse(localStorage.getItem(vendorProductionStorageKey) || "null") || initialProductionWorks;
  } catch {
    return initialProductionWorks;
  }
}

export function createStoredProductionWorkOrder(form) {
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

export function getStoredProductionWorkOrderByOrderId(orderId) {
  return getStoredProductionWorks().find((work) => work.orderId === orderId);
}

export function createProductionWorkOrderFromCustomerOrder(order, overrides = {}) {
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

export const vendorStatusPresentation = {
  vendor_approval: ["Awaiting Approval", "bg-[#fff0cd] text-[#d2861d]"],
  processing: ["Processing", "bg-[#ffd0a8] text-[#8b5633]"],
  manufacturing: ["In Manufacturing", "bg-[#eef6fd] text-[#3d82bd]"],
  ready_for_delivery: ["Ready for Delivery", "bg-[#e6f4ea] text-[#115745]"],
  shipped: ["Shipped", "bg-[#e6f4ea] text-[#115745]"],
  completed: ["Completed", "bg-[#d9ecd8] text-[#2f6757]"],
  cancelled: ["Cancelled", "bg-[#ece7df] text-[#66716b]"],
};

// Turns an orders row from /api/orders into the shape the vendor table renders.
export function apiOrderToVendorOrder(row, customerName) {
  const plan = Array.isArray(row.fulfillment_plan) ? row.fulfillment_plan : [];
  const [status, tone] = vendorStatusPresentation[row.status] || ["Processing", "bg-[#ffd0a8] text-[#8b5633]"];
  const name = customerName || "Customer";
  return {
    id: `#${String(row.id).slice(0, 8).toUpperCase()}`,
    databaseId: row.id,
    customer: name,
    initials: getInitialsFromName(name),
    product: plan.length === 1 ? plan[0].name : plan.length > 1 ? `${plan[0].name} + ${plan.length - 1} more` : "Order",
    date: formatOrderDate(row.created_at),
    dueDate: "-",
    amount: `LKR ${new Intl.NumberFormat("en-LK").format(Number(row.total_amount || 0))}`,
    status,
    tone,
    requiresManufacturing: Boolean(row.requires_manufacturing),
    fulfillmentPlan: plan.map((item) => ({
      ...item,
      vendorApprovalRequired: item.vendorApprovalRequired ?? item.vendor_approval_required,
    })),
    items: plan.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      vendor: item.vendor,
      stock: item.stock,
      stockType: item.decision === "manufacture" ? "out" : "in",
    })),
  };
}

// GET /api/orders is already scoped by role on the server, so a vendor only ever
// receives their own rows.
export async function loadVendorOrders() {
  const result = await apiRequest("/api/orders");
  const rows = Array.isArray(result?.orders) ? result.orders : [];
  return rows.map((row) => apiOrderToVendorOrder(row, row.customer_name));
}

export function getOrderItems(order) {
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

export function getOrderRequiredUnits(order) {
  const itemTotal = (order.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  return Math.max(1, itemTotal || 1);
}

export function getOrderFulfillmentPlan(order, vendorProducts = initialVendorProducts) {
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

export function getManufactureItemsForOrder(order, vendorProducts = getStoredVendorProducts()) {
  return getOrderFulfillmentPlan(order, vendorProducts).filter((item) => item.decision === "manufacture");
}

export function findMatchingVendorProduct(itemName, vendorProducts) {
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

export function getOrderSupplyCheck(order, vendorProducts = initialVendorProducts) {
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

export function getSupplierDefaultMaterial(supplier) {
  const supplierText = normalizeMatchText(supplier.material);
  const matchingMaterial = supplierMaterialStock.find((item) => supplierText.includes(normalizeMatchText(item.material)));
  return matchingMaterial?.material || supplierMaterialStock[0].material;
}

export function getSupplierForMaterial(material) {
  const materialText = normalizeMatchText(material);
  return vendorSupplierDirectory.find((supplier) => normalizeMatchText(supplier.material).includes(materialText));
}
