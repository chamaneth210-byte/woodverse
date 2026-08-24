export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function currentTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function normalizeFabricOption(option = {}) {
  const pricePerUnit = Number(option.pricePerUnit ?? option.price_per_unit ?? 0);
  const stockQuantity = Number(option.stockQuantity ?? option.stock_quantity ?? 0);
  return {
    ...option,
    pricePerUnit,
    price_per_unit: pricePerUnit,
    stockQuantity,
    stock_quantity: stockQuantity,
    imageUrl: option.imageUrl || option.image_url,
    image_url: option.image_url || option.imageUrl,
  };
}

export function normalizePaintOption(option = {}) {
  const pricePerUnit = Number(option.pricePerUnit ?? option.price_per_unit ?? 0);
  const stockQuantity = Number(option.stockQuantity ?? option.stock_quantity ?? 0);
  return {
    ...option,
    colorHex: option.colorHex || option.color_hex,
    color_hex: option.color_hex || option.colorHex,
    finishType: option.finishType || option.finish_type,
    finish_type: option.finish_type || option.finishType,
    pricePerUnit,
    price_per_unit: pricePerUnit,
    stockQuantity,
    stock_quantity: stockQuantity,
    imageUrl: option.imageUrl || option.image_url,
    image_url: option.image_url || option.imageUrl,
  };
}

export function normalizeRecommendationResponse(result = {}) {
  return {
    ...result,
    fabricRecommendations: (result.fabricRecommendations || []).map(normalizeFabricOption),
    paintRecommendations: (result.paintRecommendations || []).map(normalizePaintOption),
  };
}

export function parseAvailableQuantity(item) {
  if (Number.isFinite(Number(item.quantityAvailable))) return Number(item.quantityAvailable);
  const match = String(item.stock || "").match(/\d+/);
  if (match) return Number(match[0]);
  if (item.stockType === "in") return Number.POSITIVE_INFINITY;
  return 0;
}

export function buildFulfillmentPlan(items = [], catalogProducts) {
  return items.map((item) => {
    const product = catalogProducts.find((row) => row.id === item.id || row.name === item.name);
    const merged = { ...product, ...item };
    const quantity = Math.max(1, Number(merged.quantity) || 1);
    const available = parseAvailableQuantity(merged);
    const stockType = merged.stockType || (available > 0 ? "in" : "out");
    const manufactureRequired = stockType === "out" || quantity > available;

    return {
      id: merged.id || `item-${Date.now()}`,
      name: merged.name || "Custom product",
      vendor: merged.vendor || "Vendor review required",
      quantity,
      available: Number.isFinite(available) ? available : quantity,
      stock: merged.stock || (manufactureRequired ? "Out of Stock" : "In Stock"),
      decision: manufactureRequired ? "manufacture" : "stock",
      vendorApprovalRequired: manufactureRequired,
      nextStep: manufactureRequired ? "Vendor must approve before production tracking starts." : "Reserve stock and prepare delivery.",
      reason: manufactureRequired
        ? "Requested quantity is not available in stock."
        : "Requested quantity is available in stock.",
    };
  });
}

export async function callAiService(aiServiceUrl, path, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(`${aiServiceUrl}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.AI_SERVICE_API_KEY || "",
        ...(payload.headers || {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`AI service returned ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export function fallbackChatResponse(message = "") {
  const text = message.toLowerCase();
  if (text.includes("stock") || text.includes("manufacture") || text.includes("production")) {
    return {
      reply: "If the product is not in stock, WoodVerse marks it as manufacture required and sends it for vendor approval before production tracking.",
      intent: "stock_manufacture",
      confidence: 0.72,
      source: "api-fallback",
    };
  }
  if (text.includes("delivery") || text.includes("shipping")) {
    return {
      reply: "Shipping is used for product delivery after stock reservation or production completion. The vendor can create shipment tracking from the shipment page.",
      intent: "delivery",
      confidence: 0.68,
      source: "api-fallback",
    };
  }
  return {
    reply: "I can help with product search, delivery estimates, payment options, vendor contact, order tracking, and stock/manufacturing decisions.",
    intent: "general_help",
    confidence: 0.6,
    source: "api-fallback",
  };
}
