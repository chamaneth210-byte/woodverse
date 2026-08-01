import http from "node:http";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import { databaseConfigured, initializeDatabase, query } from "./db.js";

const port = Number(process.env.PORT || 4000);
const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
const configuredOrigins = (process.env.WEB_ORIGIN || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();
let databaseStatus = databaseConfigured ? "connecting" : "not_configured";
app.use(cors({ origin: configuredOrigins }));
app.use(express.json({ limit: "1mb" }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: configuredOrigins,
    methods: ["GET", "POST"],
  },
});

const orders = [];
const catalogProducts = [
  { id: "royal-majesty-set", name: "Royal Majesty Set", vendor: "Moratuwa Crafts", stock: "In Stock", stockType: "in", quantityAvailable: 6 },
  { id: "heritage-sideboard", name: "Heritage Sideboard", vendor: "Ceylon Woods", stock: "Low Stock (2)", stockType: "low", quantityAvailable: 2 },
  { id: "linear-teak-desk", name: "Linear Teak Desk", vendor: "Urban Log", stock: "In Stock", stockType: "in", quantityAvailable: 12 },
  { id: "signature-bedframe", name: "Signature Bedframe", vendor: "Grand Timber", stock: "Out of Stock", stockType: "out", quantityAvailable: 0 },
  { id: "walnut-task-table", name: "Walnut Task Table", vendor: "Urban Log", stock: "In Stock", stockType: "in", quantityAvailable: 18 },
  { id: "modular-shelf-unit", name: "Modular Shelf Unit", vendor: "Grand Timber", stock: "In Stock", stockType: "in", quantityAvailable: 10 },
  { id: "carved-gift-box", name: "Carved Gift Box", vendor: "Moratuwa Crafts", stock: "In Stock", stockType: "in", quantityAvailable: 32 },
  { id: "bamboo-coaster-set", name: "Bamboo Coaster Set", vendor: "Ceylon Woods", stock: "In Stock", stockType: "in", quantityAvailable: 45 },
  { id: "teak-desk-tray", name: "Teak Desk Tray", vendor: "Urban Log", stock: "In Stock", stockType: "in", quantityAvailable: 24 },
  { id: "housewarming-gift-set", name: "Housewarming Gift Set", vendor: "Moratuwa Crafts", stock: "In Stock", stockType: "in", quantityAvailable: 15 },
  { id: "teak-dining-bench", name: "Teak Dining Bench", vendor: "Moratuwa Crafts", stock: "In Stock", stockType: "in", quantityAvailable: 9 },
  { id: "mahogany-coffee-table", name: "Mahogany Coffee Table", vendor: "Ceylon Woods", stock: "Low Stock (3)", stockType: "low", quantityAvailable: 3 },
  { id: "oak-wardrobe", name: "Oak Wardrobe", vendor: "Grand Timber", stock: "In Stock", stockType: "in", quantityAvailable: 5 },
  { id: "cane-lounge-chair", name: "Cane Lounge Chair", vendor: "Urban Log", stock: "In Stock", stockType: "in", quantityAvailable: 8 },
  { id: "teak-executive-desk", name: "Teak Executive Desk", vendor: "Moratuwa Crafts", stock: "Out of Stock", stockType: "out", quantityAvailable: 0 },
  { id: "walnut-tv-console", name: "Walnut TV Console", vendor: "Urban Log", stock: "Low Stock (4)", stockType: "low", quantityAvailable: 4 },
  { id: "rosewood-console-table", name: "Rosewood Console Table", vendor: "Grand Timber", stock: "In Stock", stockType: "in", quantityAvailable: 6 },
  { id: "jackwood-serving-board", name: "Jackwood Serving Board", vendor: "Moratuwa Crafts", stock: "In Stock", stockType: "in", quantityAvailable: 28 },
  { id: "satinwood-jewelry-stand", name: "Satinwood Jewelry Stand", vendor: "Ceylon Woods", stock: "In Stock", stockType: "in", quantityAvailable: 22 },
  { id: "planter-stand-set", name: "Planter Stand Set", vendor: "Urban Log", stock: "In Stock", stockType: "in", quantityAvailable: 16 },
];

const currentTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function parseAvailableQuantity(item) {
  if (Number.isFinite(Number(item.quantityAvailable))) return Number(item.quantityAvailable);
  const match = String(item.stock || "").match(/\d+/);
  if (match) return Number(match[0]);
  if (item.stockType === "in") return Number.POSITIVE_INFINITY;
  return 0;
}

function buildFulfillmentPlan(items = []) {
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

async function callAiService(path, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(`${aiServiceUrl}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`AI service returned ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function fallbackChatResponse(message = "") {
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

app.get(["/health", "/api/health"], (request, response) => {
  response.json({
    ok: true,
    service: "woodverse-api",
    framework: "express",
    realtime: "socket.io",
    aiServiceUrl,
    database: databaseStatus,
  });
});

app.get("/api/catalog", async (request, response) => {
  if (!databaseConfigured) return response.json({ products: catalogProducts, source: "memory" });

  try {
    const result = await query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.category,
        p.material,
        p.price,
        p.stock_quantity,
        p.status,
        p.image_url,
        p.created_at,
        v.business_name AS vendor
      FROM products p
      JOIN vendors v ON v.id = p.vendor_id
      WHERE p.status = 'published'
      ORDER BY p.created_at DESC, p.name ASC
    `);
    const products = result.rows.map((product) => {
      const quantityAvailable = Number(product.stock_quantity || 0);
      const stockType = quantityAvailable === 0 ? "out" : quantityAvailable <= 4 ? "low" : "in";
      return {
        id: product.id,
        name: product.name,
        vendor: product.vendor,
        description: product.description,
        category: product.category,
        material: product.material,
        price: Number(product.price),
        stock: stockType === "out" ? "Out of Stock" : stockType === "low" ? `Low Stock (${quantityAvailable})` : "In Stock",
        stockType,
        quantityAvailable,
        image: product.image_url,
        imageUrl: product.image_url,
        createdAt: product.created_at,
      };
    });
    response.json({ products, source: "postgresql" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get("/api/db/health", async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ ok: false, database: "not_configured", message: "Set DATABASE_URL to connect PostgreSQL." });
  try {
    const result = await query("SELECT NOW() AS server_time");
    response.json({ ok: true, database: "postgresql", serverTime: result.rows[0].server_time });
  } catch (error) {
    response.status(503).json({ ok: false, database: "error", message: error.message });
  }
});

app.post("/api/users", async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ error: "PostgreSQL is not configured." });
  const { email, fullName, role = "customer", passwordHash = null } = request.body;
  if (!email || !fullName || !["customer", "vendor", "supplier", "admin"].includes(role)) return response.status(400).json({ error: "email, fullName, and a valid role are required." });
  try {
    const result = await query("INSERT INTO users (email, full_name, role, password_hash, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role, status, created_at", [email.toLowerCase(), fullName, role, passwordHash, role === "customer" || role === "admin" ? "active" : "pending_approval"]);
    response.status(201).json({ user: result.rows[0] });
  } catch (error) {
    response.status(error.code === "23505" ? 409 : 500).json({ error: error.message });
  }
});

app.get("/api/users", async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ error: "PostgreSQL is not configured." });
  const result = await query("SELECT id, email, full_name, role, status, created_at FROM users ORDER BY created_at DESC");
  response.json({ users: result.rows });
});

app.post("/api/vendors", async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ error: "PostgreSQL is not configured." });
  const { userId, businessName, registrationNumber, description, documents = [] } = request.body;
  if (!userId || !businessName) return response.status(400).json({ error: "userId and businessName are required." });
  const result = await query("INSERT INTO vendors (user_id, business_name, registration_number, description, documents) VALUES ($1, $2, $3, $4, $5) RETURNING *", [userId, businessName, registrationNumber || null, description || null, JSON.stringify(documents)]);
  response.status(201).json({ vendor: result.rows[0] });
});

app.get("/api/vendors", async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ error: "PostgreSQL is not configured." });
  const result = await query("SELECT v.*, u.email, u.full_name FROM vendors v JOIN users u ON u.id = v.user_id ORDER BY v.created_at DESC");
  response.json({ vendors: result.rows });
});

app.post("/api/products", async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ error: "PostgreSQL is not configured." });
  const { vendorId, name, description, category, material, price = 0, stockQuantity = 0, imageUrl } = request.body;
  if (!vendorId || !name) return response.status(400).json({ error: "vendorId and name are required." });
  const result = await query("INSERT INTO products (vendor_id, name, description, category, material, price, stock_quantity, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", [vendorId, name, description || null, category || null, material || null, price, stockQuantity, imageUrl || null]);
  response.status(201).json({ product: result.rows[0] });
});

app.get("/api/products", async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ error: "PostgreSQL is not configured." });
  const result = await query("SELECT p.*, v.business_name AS vendor_name FROM products p JOIN vendors v ON v.id = p.vendor_id ORDER BY p.created_at DESC");
  response.json({ products: result.rows });
});

app.post("/api/quotations", async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ error: "PostgreSQL is not configured." });
  const { orderId, customerId, vendorId, amount = 0, notes, validUntil } = request.body;
  if (!customerId || !vendorId) return response.status(400).json({ error: "customerId and vendorId are required." });
  const result = await query("INSERT INTO quotations (order_id, customer_id, vendor_id, amount, notes, valid_until, status) VALUES ($1, $2, $3, $4, $5, $6, 'sent') RETURNING *", [orderId || null, customerId, vendorId, amount, notes || null, validUntil || null]);
  response.status(201).json({ quotation: result.rows[0] });
});

app.get("/api/quotations", async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ error: "PostgreSQL is not configured." });
  const result = await query("SELECT * FROM quotations ORDER BY created_at DESC");
  response.json({ quotations: result.rows });
});

app.post("/api/messages", async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ error: "PostgreSQL is not configured." });
  const { senderId, recipientId, threadId, body } = request.body;
  if (!senderId || !recipientId || !body) return response.status(400).json({ error: "senderId, recipientId, and body are required." });
  const result = await query("INSERT INTO messages (sender_id, recipient_id, thread_id, body) VALUES ($1, $2, COALESCE($3, gen_random_uuid()), $4) RETURNING *", [senderId, recipientId, threadId || null, body]);
  response.status(201).json({ message: result.rows[0] });
});

app.get("/api/messages", async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ error: "PostgreSQL is not configured." });
  const values = [];
  const where = request.query.threadId ? "WHERE thread_id = $1" : "";
  if (request.query.threadId) values.push(request.query.threadId);
  const result = await query(`SELECT * FROM messages ${where} ORDER BY created_at ASC`, values);
  response.json({ messages: result.rows });
});

app.post("/api/orders/evaluate-stock", (request, response) => {
  const plan = buildFulfillmentPlan(request.body.items || []);
  response.json({
    requiresVendorApproval: plan.some((item) => item.vendorApprovalRequired),
    productionTrackingRequired: plan.some((item) => item.decision === "manufacture"),
    fulfillmentPlan: plan,
  });
});

app.post("/api/orders", (request, response) => {
  const plan = buildFulfillmentPlan(request.body.items || []);
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
    io.to("woodverse-notifications").emit("notification:event", {
    id: `notice-${Date.now()}`,
    audience: "Vendor",
    source: "WoodVerse API",
    title: requiresVendorApproval ? "Order needs vendor approval" : "New stock order",
    message: requiresVendorApproval
      ? `${order.id} has items that must be manufactured before delivery.`
      : `${order.id} can be fulfilled from stock.`,
    time: currentTime(),
    });
    response.status(201).json(result?.rows?.[0] || order);
  }).catch((error) => response.status(500).json({ error: error.message }));
});

app.get("/api/orders", async (request, response) => {
  if (!databaseConfigured) return response.json({ orders });
  try {
    const result = await query("SELECT * FROM orders ORDER BY created_at DESC");
    response.json({ orders: result.rows });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/chat", async (request, response) => {
  try {
    const result = await callAiService("/ai/chat", request.body);
    response.json({ ...result, source: result.source || "fastapi" });
  } catch {
    response.json(fallbackChatResponse(request.body.message));
  }
});

app.post("/api/ai/stock-decision", async (request, response) => {
  try {
    const result = await callAiService("/ai/stock-decision", request.body);
    response.json({ ...result, source: result.source || "fastapi" });
  } catch {
    const fulfillmentPlan = buildFulfillmentPlan(request.body.items || []);
    response.json({
      requiresVendorApproval: fulfillmentPlan.some((item) => item.vendorApprovalRequired),
      productionTrackingRequired: fulfillmentPlan.some((item) => item.decision === "manufacture"),
      fulfillmentPlan,
      source: "api-fallback",
    });
  }
});

app.post("/api/notifications", (request, response) => {
  const notification = {
    id: `notice-${Date.now()}`,
    audience: request.body.audience || "Vendor",
    source: request.body.source || "WoodVerse API",
    title: request.body.title || "WoodVerse notification",
    message: request.body.message || "A WoodVerse event was created.",
    time: currentTime(),
  };
  io.to(request.body.room || "woodverse-notifications").emit("notification:event", notification);
  response.status(201).json(notification);
});

io.on("connection", (socket) => {
  socket.on("vendor:join", ({ room = "supplier-vendor-messages", supplier } = {}) => {
    socket.join(room);
    socket.emit("vendor:message", {
      id: `welcome-${Date.now()}`,
      vendor: "Lanka Teak Estates",
      sender: "vendor",
      text: `${supplier || "Supplier"} is connected to vendor messaging.`,
      time: currentTime(),
    });
  });

  socket.on("vendor:thread:open", ({ vendor }) => {
    socket.emit("vendor:message", {
      id: `thread-${Date.now()}`,
      vendor,
      sender: "vendor",
      text: `Realtime thread opened with ${vendor}.`,
      time: currentTime(),
    });
  });

  socket.on("vendor:message:send", ({ room = "supplier-vendor-messages", supplier, vendor, text }) => {
    const sentMessage = {
      id: `socket-${Date.now()}`,
      vendor,
      sender: "supplier",
      text,
      time: currentTime(),
    };
    socket.to(room).emit("vendor:message", sentMessage);

    socket.emit("vendor:message", {
      id: `ack-${Date.now()}`,
      vendor,
      sender: "vendor",
      text: `${vendor} received your message from ${supplier || "supplier"}.`,
      time: currentTime(),
    });
  });

  socket.on("notification:join", ({ room = "woodverse-notifications", actor = "vendor" } = {}) => {
    socket.join(room);
    socket.emit("notification:event", {
      id: `notice-welcome-${Date.now()}`,
      audience: "System",
      source: "WoodVerse API",
      title: "Notification channel connected",
      message: `${actor} is receiving supplier and customer updates in real time.`,
      time: currentTime(),
    });
  });

  socket.on("notification:send", ({ room = "woodverse-notifications", audience = "Vendor", source = "WoodVerse", title, message }) => {
    const notification = {
      id: `notice-${Date.now()}`,
      audience,
      source,
      title: title || `${audience} notification`,
      message: message || "A new WoodVerse notification was created.",
      time: currentTime(),
    };
    io.to(room).emit("notification:event", notification);
  });
});

app.get("/", (request, response) => {
  response.json({
    ok: true,
    service: "woodverse-api",
    message: "WoodVerse API is running. Use the listed endpoints to read data.",
    endpoints: [
      "/api/health",
      "/api/db/health",
      "/api/catalog",
      "/api/users",
      "/api/vendors",
      "/api/products",
      "/api/orders",
      "/api/quotations",
      "/api/messages",
    ],
  });
});

initializeDatabase()
  .then((result) => {
    databaseStatus = result.initialized ? "ready" : "not_configured";
    server.listen(port, () => {
      console.log(`WoodVerse Express API and Socket.IO server running on http://localhost:${port}`);
      console.log(`PostgreSQL database: ${databaseStatus}`);
    });
  })
  .catch((error) => {
    databaseStatus = "error";
    console.error(`PostgreSQL initialization failed: ${error.message}`);
    server.listen(port, () => console.log(`WoodVerse Express API and Socket.IO server running on http://localhost:${port} without database`));
  });
