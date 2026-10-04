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

// A quotation estimate is pure arithmetic, so the API can reproduce it exactly
// when the AI service is unreachable. The material table below must stay in step
// with MATERIAL_FACTORS in the AI service (main.py).
const QUOTE_MATERIAL_FACTORS = {
  teak: 1.25,
  mahogany: 1.18,
  walnut: 1.15,
  jackwood: 0.9,
  bamboo: 0.82,
};
const QUOTE_CUSTOM_SIZE_FACTOR = 1.2;

aiRouter.post("/api/ai/quote-estimate", authenticateToken, async (request, response) => {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const result = await callAiService(aiServiceUrl, "/ai/quote-estimate", request.body);
    response.json({ ...result, source: result.source || "fastapi" });
  } catch {
    // Same formula as the AI service, so a vendor still gets a number rather
    // than an error when the AI service is down.
    const basePrice = Number(request.body?.basePrice) || 0;
    const quantity = Math.max(1, Number(request.body?.quantity) || 1);
    const materialFactor =
      QUOTE_MATERIAL_FACTORS[String(request.body?.material || "").toLowerCase()] || 1;
    const customFactor = request.body?.customSize ? QUOTE_CUSTOM_SIZE_FACTOR : 1;
    const estimatedTotal = Number((basePrice * quantity * materialFactor * customFactor).toFixed(2));
    response.json({
      productType: request.body?.productType || "custom furniture",
      material: request.body?.material || "teak",
      quantity,
      estimatedTotal,
      confidence: 0.74,
      notes: "Prototype estimate based on material, quantity, and custom sizing factors.",
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
