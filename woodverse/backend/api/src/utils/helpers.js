export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Checkout fees are a server decision. The browser used to send its own total, which
// let a caller set their own price.
export const DELIVERY_FEE = 7500;
export const ASSURANCE_FEE = 3500;
const MAX_QUANTITY_PER_LINE = 100;
const MAX_LINES = 50;

// Accepts only product ids and quantities. Price, vendor, stock and name are all
// looked up in the products table, so none of them can be forged by the caller.
export function parseOrderItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { error: "An order needs at least one item." };
  }
  if (rawItems.length > MAX_LINES) {
    return { error: `An order cannot contain more than ${MAX_LINES} lines.` };
  }

  const items = [];
  for (const raw of rawItems) {
    const id = String(raw?.id ?? raw?.productId ?? "").trim().toLowerCase();
    if (!uuidPattern.test(id)) {
      return { error: "Each item must reference a product id." };
    }
    const quantity = Number(raw?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      return { error: `Quantity for ${id} must be a whole number between 1 and ${MAX_QUANTITY_PER_LINE}.` };
    }
    const existing = items.find((item) => item.id === id);
    if (existing) {
      existing.quantity = Math.min(MAX_QUANTITY_PER_LINE, existing.quantity + quantity);
    } else {
      items.push({ id, quantity });
    }
  }

  return { items };
}

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
  // The AI service may hit Postgres to answer an order status question, so the budget is
  // larger than a plain proxy hop. 2500ms aborted legitimate order lookups.
  const timeoutMs = Number(process.env.AI_SERVICE_TIMEOUT_MS || 8000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
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
