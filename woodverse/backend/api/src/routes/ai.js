import { Router } from "express";
import { callAiService, fallbackChatResponse } from "../utils/helpers.js";
import { authenticateToken } from "../middleware/auth.js";

export const aiRouter = Router();

aiRouter.post("/api/ai/chat", authenticateToken, async (request, response) => {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const result = await callAiService(aiServiceUrl, "/ai/chat", request.body);
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
