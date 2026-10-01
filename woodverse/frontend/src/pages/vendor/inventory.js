import {
  Send,
  Warehouse,
} from "lucide-react";
import { parseOrderAmount } from "./format.js";
import { initialVendorProducts, supplierMaterialStock } from "./seed.js";

export function getInitialVendorInventory() {
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

export function getInventoryStatus(quantity, reorderPoint) {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= reorderPoint) return "Low Stock";
  return "Ready";
}

export function getMaterialUnitValue(material) {
  if (material === "Mahogany") return 4200;
  if (material === "Walnut") return 5600;
  if (material === "Teak") return 4800;
  if (material === "Oak") return 3900;
  if (material === "Fabric") return 1800;
  return 2600;
}

export function getMaterialReorderPoint(item) {
  if (item.unit === "meters") return 8;
  if (item.unit === "pieces") return 10;
  return 6;
}

export function getMaterialTargetStock(item) {
  if (item.unit === "meters") return 24;
  if (item.unit === "pieces") return 30;
  return 24;
}

export function getMaterialStockDecision(item) {
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

export function getWarehouseUsage(warehouse) {
  return Math.round((warehouse.used / warehouse.capacity) * 100);
}
