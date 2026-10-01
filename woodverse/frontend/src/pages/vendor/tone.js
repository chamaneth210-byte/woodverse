import { getWarehouseUsage } from "./inventory.js";
import { productionStages } from "./seed.js";

export function getOrderTone(status) {
  if (status === "Approved") return "bg-[#d9ecd8] text-[#2f6757]";
  if (status === "Vendor Approval") return "bg-[#eef6fd] text-[#3d82bd]";
  if (status === "Completed") return "bg-[#d9ecd8] text-[#2f6757]";
  if (status === "Awaiting Payment") return "bg-[#fff0cd] text-[#d2861d]";
  if (status === "Cancelled") return "bg-[#ece7df] text-[#66716b]";
  return "bg-[#ffd0a8] text-[#8b5633]";
}

export function getQuoteTone(status) {
  if (status === "Approved") return "bg-[#d9ecd8] text-[#2f6757]";
  if (status === "Sent") return "bg-[#eef6fd] text-[#3d82bd]";
  if (status === "Converted") return "bg-[#e6f4ea] text-[#115745]";
  if (status === "Expired") return "bg-[#ece7df] text-[#66716b]";
  return "bg-[#fff0cd] text-[#8b5633]";
}

export function getPurchaseOrderTone(status) {
  if (status === "Received") return "text-[#115745]";
  if (status === "Supplier Confirmed") return "text-[#2f6757]";
  if (status === "In Transit") return "text-[#3d82bd]";
  if (status === "Cancelled") return "text-[#b10015]";
  if (status === "Sent") return "text-[#8b5633]";
  return "text-[#66716b]";
}

export function getShipmentTone(status) {
  if (status === "Delivered") return "text-[#115745]";
  if (status === "In Transit") return "text-[#3d82bd]";
  if (status === "Ready for Dispatch") return "text-[#2f6757]";
  if (status === "Delayed") return "text-[#b10015]";
  if (status === "Cancelled") return "text-[#66716b]";
  return "text-[#8b5633]";
}

export function getProductionTone(stage) {
  if (stage === "Completed") return "bg-[#d9ecd8] text-[#115745]";
  if (stage === "Quality Check") return "bg-[#eef6fd] text-[#3d82bd]";
  if (stage === "Packing") return "bg-[#e6f4ea] text-[#115745]";
  if (stage === "Carpentry") return "bg-[#ffd0a8] text-[#8b5633]";
  return "bg-[#fff0cd] text-[#8b5633]";
}

export function getProductionProgress(stage) {
  const index = productionStages.indexOf(stage);
  if (index < 0) return 0;
  return Math.round(((index + 1) / productionStages.length) * 100);
}

export function getInventoryTone(status) {
  if (status === "Ready") return "bg-[#d9ecd8] text-[#115745]";
  if (status === "Low Stock") return "bg-[#fff0cd] text-[#8b5633]";
  return "bg-[#fff0f0] text-[#b10015]";
}

export function getWarehouseTone(status) {
  if (status === "Operational") return "bg-[#d9ecd8] text-[#115745]";
  if (status === "Near Capacity") return "bg-[#fff0cd] text-[#8b5633]";
  if (status === "Maintenance") return "bg-[#eef6fd] text-[#3d82bd]";
  return "bg-[#fff0f0] text-[#b10015]";
}

export function getWarehouseGuidance(warehouse) {
  const usage = getWarehouseUsage(warehouse);
  if (warehouse.status === "Maintenance") return "Avoid new transfers until maintenance is completed.";
  if (usage >= 90) return "Stop inbound transfers and move overflow to a lower-use warehouse.";
  if (usage >= 75) return "Use for priority stock only and schedule outbound transfers.";
  return "Capacity is healthy for normal inbound and outbound stock movement.";
}
