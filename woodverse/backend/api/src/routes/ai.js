import { Router } from "express";
import { callAiService, fallbackChatResponse } from "../utils/helpers.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";
import { databaseConfigured, query } from "../db.js";

export const aiRouter = Router();

/**
 * Build the payload sent to the AI service.
 *
 * The acting identity comes from the verified JWT on `request.user`, never from the
 * browser. Any `actorId` / `actorRole` the client tried to supply is overwritten, so
 * the chatbot can only ever read orders belonging to the caller.
 */
function buildAiPayload(request) {
  const { actorId, actorRole, ...clientBody } = request.body || {};
  return {
    ...clientBody,
    actorId: request.user?.id ?? null,
    actorRole: request.user?.role ?? null,
  };
}

aiRouter.post("/api/ai/chat", authenticateToken, async (request, response) => {
  const payload = buildAiPayload(request);
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const result = await callAiService(aiServiceUrl, "/ai/chat", payload);
    response.json({ ...result, source: result.source || "fastapi" });
  } catch {
    response.json(fallbackChatResponse(request.body.message));
  }
});

aiRouter.post("/api/ai/stock-decision", authenticateToken, async (request, response) => {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const result = await callAiService(aiServiceUrl, "/ai/stock-decision", request.body);
    response.json({ ...result, source: result.source || "fastapi" });
  } catch {
    const { buildFulfillmentPlan } = await import("../utils/helpers.js");
    const { catalogProducts } = await import("../data/memory.js");
    const fulfillmentPlan = buildFulfillmentPlan(request.body.items || [], catalogProducts);
    response.json({
      requiresVendorApproval: fulfillmentPlan.some((item) => item.vendorApprovalRequired),
      productionTrackingRequired: fulfillmentPlan.some((item) => item.decision === "manufacture"),
      fulfillmentPlan,
      source: "api-fallback",
    });
  }
});

aiRouter.get("/api/ai/orders", authenticateToken, authorizeRoles("admin", "vendor", "customer"), async (request, response) => {
  if (!databaseConfigured) return response.json({ orders: [], source: "memory" });
  try {
    const isAdmin = request.user.role === "admin";
    const result = isAdmin
      ? await query("SELECT id, customer_id, vendor_id, status, total_amount, requires_manufacturing, created_at, updated_at FROM orders ORDER BY created_at DESC")
      : await query(
          "SELECT id, customer_id, vendor_id, status, total_amount, requires_manufacturing, created_at, updated_at FROM orders WHERE customer_id = $1 ORDER BY created_at DESC",
          [request.user.id]
        );
    response.json({ orders: result.rows });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});
