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
   Endpoint:
   POST /api/ai/chat
   ========================================================= */

aiRouter.post(
  "/chat",
  authenticateToken,
  async (request, response) => {
    const payload = buildAiPayload(request);

    try {
      const aiServiceUrl =
        process.env.AI_SERVICE_URL || "http://127.0.0.1:8010";

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
   Endpoint:
   POST /api/ai/stock-decision
   ========================================================= */

aiRouter.post(
  "/stock-decision",
  authenticateToken,
  async (request, response) => {
    try {
      const aiServiceUrl =
        process.env.AI_SERVICE_URL || "http://127.0.0.1:8010";

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
   Endpoint:
   POST /api/ai/quote-estimate

   Formula:

   Estimated Total =
   Base Price × Quantity × Material Factor × Custom Size Factor
   ========================================================= */

const QUOTE_MATERIAL_FACTORS = {
  teak: 1.25,
  mahogany: 1.18,
  walnut: 1.15,
  jackwood: 0.9,
  bamboo: 0.82,
};

const QUOTE_CUSTOM_SIZE_FACTOR = 1.2;

/* =========================================================
   LOCAL QUOTATION FALLBACK
   ========================================================= */

function localQuoteEstimate(body = {}) {
  const productType =
    body.productType || "Custom Furniture";

  const material = String(
    body.material || "teak"
  )
    .trim()
    .toLowerCase();

  const basePrice =
    Number(body.basePrice) || 0;

  const quantity = Math.max(
    1,
    Number(body.quantity) || 1
  );

  const customSize =
    body.customSize === true ||
    body.customSize === "true";

  const materialFactor =
    QUOTE_MATERIAL_FACTORS[material] || 1;

  const customSizeFactor =
    customSize
      ? QUOTE_CUSTOM_SIZE_FACTOR
      : 1;

  const estimatedTotal = Number(
    (
      basePrice *
      quantity *
      materialFactor *
      customSizeFactor
    ).toFixed(2)
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

/* =========================================================
   AI QUOTATION ROUTE
   ========================================================= */

aiRouter.post(
  "/quote-estimate",
  authenticateToken,
  async (request, response) => {
    const body = request.body || {};

    /*
     * Calculate local fallback first.
     * This means the system can still return a quotation
     * if the FastAPI AI service is unavailable.
     */

    const fallback =
      localQuoteEstimate(body);

    try {
      const aiServiceUrl =
        process.env.AI_SERVICE_URL ||
        "http://127.0.0.1:8010";

      console.log(
        "Calling AI service:",
        aiServiceUrl
      );

      const result = await callAiService(
        aiServiceUrl,
        "/ai/quote-estimate",
        body
      );

      /*
       * Validate AI response.
       */

      const estimatedTotal =
        Number(result?.estimatedTotal);

      if (!Number.isFinite(estimatedTotal)) {
        throw new Error(
          "AI service returned a non-numeric estimatedTotal"
        );
      }

      /*
       * Return AI result while keeping
       * the same response structure as fallback.
       */

      return response.json({
        ...fallback,
        ...result,

        estimatedTotal,

        source:
          result?.source || "fastapi",
      });
    } catch (error) {
      console.error(
        "AI quote estimate service unavailable:",
        error
      );

      /*
       * AI service failed.
       * Return local quotation instead.
       */

      return response.json(
        fallback
      );
    }
  }
);

/* =========================================================
   AI ORDERS
   Endpoint:
   GET /api/ai/orders
   ========================================================= */

aiRouter.get(
  "/orders",
  authenticateToken,
  authorizeRoles(
    "admin",
    "vendor",
    "customer"
  ),
  async (request, response) => {
    /*
     * If PostgreSQL is not configured,
     * return an empty order list.
     */

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

      /* ===============================
         ADMIN
         =============================== */

      if (isAdmin) {
        result = await query(
          `
          SELECT
            id,
            customer_id,
            vendor_id,
            status,
            total_amount,
            requires_manufacturing,
            created_at,
            updated_at
          FROM orders
          ORDER BY created_at DESC
          `
        );
      }

      /* ===============================
         CUSTOMER / VENDOR
         =============================== */

      else {
        result = await query(
          `
          SELECT
            id,
            customer_id,
            vendor_id,
            status,
            total_amount,
            requires_manufacturing,
            created_at,
            updated_at
          FROM orders
          WHERE customer_id = $1
          ORDER BY created_at DESC
          `,
          [request.user.id]
        );
      }

      return response.json({
        orders: result.rows,
      });
    } catch (error) {
      console.error(
        "AI orders query failed:",
        error
      );

      return response.status(500).json({
        error: error.message,
      });
    }
  }
);