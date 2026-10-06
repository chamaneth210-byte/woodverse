import { Router } from "express";
import { callAiService, fallbackChatResponse } from "../utils/helpers.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.js";
import { databaseConfigured, query } from "../db.js";

export const aiRouter = Router();

/* =========================================================
   HELPER
   ========================================================= */

function buildAiPayload(request) {
  const { actorId, actorRole, ...clientBody } = request.body || {};

  return {
    ...clientBody,
    actorId: request.user?.id ?? null,
    actorRole: request.user?.role ?? null,
  };
}

/* =========================================================
   AI CHAT
   ========================================================= */

aiRouter.post(
  "/api/ai/chat",
  authenticateToken,
  async (request, response) => {
    const payload = buildAiPayload(request);

    try {
      const aiServiceUrl =
        process.env.AI_SERVICE_URL || "http://localhost:8000";

      const result = await callAiService(
        aiServiceUrl,
        "/ai/chat",
        payload
      );

      response.json({
        ...result,
        source: result.source || "fastapi",
      });
    } catch (error) {
      console.error("AI chat service unavailable:", error);

      response.json(
        fallbackChatResponse(request.body?.message || "")
      );
    }
  }
);

/* =========================================================
   AI STOCK / MANUFACTURE DECISION
   ========================================================= */

aiRouter.post(
  "/api/ai/stock-decision",
  authenticateToken,
  async (request, response) => {
    try {
      const aiServiceUrl =
        process.env.AI_SERVICE_URL || "http://localhost:8000";

      const result = await callAiService(
        aiServiceUrl,
        "/ai/stock-decision",
        request.body
      );

      response.json({
        ...result,
        source: result.source || "fastapi",
      });
    } catch (error) {
      console.error(
        "AI stock decision service unavailable:",
        error
      );

      try {
        const { buildFulfillmentPlan } = await import(
          "../utils/helpers.js"
        );

        const { catalogProducts } = await import(
          "../data/memory.js"
        );

        const fulfillmentPlan = buildFulfillmentPlan(
          request.body?.items || [],
          catalogProducts
        );

        response.json({
          requiresVendorApproval: fulfillmentPlan.some(
            (item) => item.vendorApprovalRequired
          ),
          productionTrackingRequired: fulfillmentPlan.some(
            (item) => item.decision === "manufacture"
          ),
          fulfillmentPlan,
          source: "api-fallback",
        });
      } catch (fallbackError) {
        console.error(
          "Stock decision fallback failed:",
          fallbackError
        );

        response.status(500).json({
          error: "Unable to determine stock decision",
          message: fallbackError.message,
        });
      }
    }
  }
);

/* =========================================================
   AI QUOTATION
   =========================================================

   Formula:

   Estimated Total =
   Base Price × Quantity × Material Factor × Custom Size Factor

   Example:

   50,000 × 2 × 1.25 × 1.20
   = Rs. 150,000
   ========================================================= */

const QUOTE_MATERIAL_FACTORS = {
  teak: 1.25,
  mahogany: 1.18,
  walnut: 1.15,
  jackwood: 0.90,
  bamboo: 0.82,
};

const QUOTE_CUSTOM_SIZE_FACTOR = 1.20;

// The AI service applies the same factors, so this reproduces its arithmetic exactly. A
// vendor must not be quoted a different price depending on whether the AI service happened
// to be reachable, so both paths are asserted against the same expected totals in
// tests/ai.identity.test.js.
function localQuoteEstimate(body = {}) {
  const productType = body.productType || "Custom Furniture";

  const material = String(body.material || "teak")
    .trim()
    .toLowerCase();

  const basePrice = Number(body.basePrice) || 0;

  const quantity = Math.max(1, Number(body.quantity) || 1);

  const customSize =
    body.customSize === true || body.customSize === "true";

  const materialFactor = QUOTE_MATERIAL_FACTORS[material] || 1;

  const customSizeFactor = customSize ? QUOTE_CUSTOM_SIZE_FACTOR : 1;

  const estimatedTotal = Number(
    (basePrice * quantity * materialFactor * customSizeFactor).toFixed(2)
  );

  return {
    productType,
    material,
    quantity,
    basePrice,
    materialFactor,
    customSize,
    customSizeFactor,
    estimatedTotal,
    confidence: 0.74,
    notes:
      "Quotation calculated using base price, quantity, material, and custom-size factors.",
    source: "api-fallback",
  };
}

aiRouter.post(
  "/api/ai/quote-estimate",
  authenticateToken,
  async (request, response) => {
    const body = request.body || {};

    // The local estimate is computed first so it can answer when the AI service is down,
    // and so a malformed AI response cannot leave the vendor without a number.
    const fallback = localQuoteEstimate(body);

    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";

      const result = await callAiService(
        aiServiceUrl,
        "/ai/quote-estimate",
        body
      );

      // The AI service omits the factor breakdown, so it is filled in from the same table
      // the fallback uses. That keeps one response shape for the UI regardless of source.
      const estimatedTotal = Number(result?.estimatedTotal);

      if (!Number.isFinite(estimatedTotal)) {
        throw new Error("AI service returned a non-numeric estimatedTotal");
      }

      return response.json({
        ...fallback,
        ...result,
        estimatedTotal,
        source: result?.source || "fastapi",
      });
    } catch (error) {
      console.error("AI quote estimate service unavailable:", error);

      return response.json(fallback);
    }
  }
);

/* =========================================================
   AI ORDERS
   ========================================================= */

aiRouter.get(
  "/api/ai/orders",
  authenticateToken,
  authorizeRoles("admin", "vendor", "customer"),
  async (request, response) => {
    if (!databaseConfigured) {
      return response.json({
        orders: [],
        source: "memory",
      });
    }

    try {
      const isAdmin =
        request.user.role === "admin";

      let result;

      if (isAdmin) {
        result = await query(
          "SELECT id, customer_id, vendor_id, status, total_amount, requires_manufacturing, created_at, updated_at FROM orders ORDER BY created_at DESC"
        );
      } else {
        result = await query(
          "SELECT id, customer_id, vendor_id, status, total_amount, requires_manufacturing, created_at, updated_at FROM orders WHERE customer_id = $1 ORDER BY created_at DESC",
          [request.user.id]
        );
      }

      response.json({
        orders: result.rows,
      });
    } catch (error) {
      console.error(
        "AI orders query failed:",
        error
      );

      response.status(500).json({
        error: error.message,
      });
    }
  }
);
