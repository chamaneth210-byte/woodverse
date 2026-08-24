import { Router } from "express";
import { databaseConfigured, query } from "../db.js";
import { buildFulfillmentPlan } from "../utils/helpers.js";
import { catalogProducts, orders } from "../data/memory.js";
import { currentTime } from "../utils/helpers.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

export const ordersRouter = Router();

ordersRouter.post("/api/orders/evaluate-stock", authenticateToken, (request, response) => {
  const plan = buildFulfillmentPlan(request.body.items || [], catalogProducts);
  response.json({
    requiresVendorApproval: plan.some((item) => item.vendorApprovalRequired),
    productionTrackingRequired: plan.some((item) => item.decision === "manufacture"),
    fulfillmentPlan: plan,
  });
});

ordersRouter.post("/api/orders", authenticateToken, authorizeRoles("customer", "vendor", "admin"), (request, response) => {
  const plan = buildFulfillmentPlan(request.body.items || [], catalogProducts);
  const requiresVendorApproval = plan.some((item) => item.vendorApprovalRequired);
  const order = {
    id: `ORD-${Date.now()}`,
    customer: request.body.customer || "WoodVerse Customer",
    status: requiresVendorApproval ? "Vendor Approval" : "Processing",
    requiresVendorApproval,
    productionTrackingRequired: requiresVendorApproval,
    fulfillmentPlan: plan,
    createdAt: new Date().toISOString(),
  };

  orders.unshift(order);

  const persistOrder = databaseConfigured && request.body.customerId
    ? query("INSERT INTO orders (customer_id, vendor_id, status, total_amount, requires_manufacturing, fulfillment_plan, shipping_address) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [request.body.customerId, request.body.vendorId || null, requiresVendorApproval ? "vendor_approval" : "processing", request.body.totalAmount || 0, requiresVendorApproval, JSON.stringify(plan), JSON.stringify(request.body.shippingAddress || {})])
    : Promise.resolve(null);

  persistOrder.then((result) => {
    if (request.io) {
      request.io.to("woodverse-notifications").emit("notification:event", {
        id: `notice-${Date.now()}`,
        audience: "Vendor",
        source: "WoodVerse API",
        title: requiresVendorApproval ? "Order needs vendor approval" : "New stock order",
        message: requiresVendorApproval
          ? `${order.id} has items that must be manufactured before delivery.`
          : `${order.id} can be fulfilled from stock.`,
        time: currentTime(),
      });
    }
    response.status(201).json(result?.rows?.[0] || order);
  }).catch((error) => response.status(500).json({ error: error.message }));
});

ordersRouter.get("/api/orders", authenticateToken, authorizeRoles("admin", "vendor", "customer"), async (request, response) => {
  if (!databaseConfigured) return response.json({ orders });
  try {
    let result;
    if (request.user.role === "customer") {
      result = await query("SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC", [request.user.id]);
    } else if (request.user.role === "vendor") {
      const vendorResult = await query("SELECT id FROM vendors WHERE user_id = $1", [request.user.id]);
      const vendorId = vendorResult.rows[0]?.id;
      result = await query("SELECT * FROM orders WHERE vendor_id = $1 ORDER BY created_at DESC", [vendorId]);
    } else {
      result = await query("SELECT * FROM orders ORDER BY created_at DESC");
    }
    response.json({ orders: result.rows });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});
