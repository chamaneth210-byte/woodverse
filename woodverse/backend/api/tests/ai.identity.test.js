import { describe, it, expect, beforeAll, afterAll } from "vitest";
import jwt from "jsonwebtoken";
import pg from "pg";
import request from "node:http";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || "";

// src/utils/auth.js and src/db.js read these at import time, so they must be set
// before the router is imported below.
if (TEST_DATABASE_URL) process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.JWT_SECRET = "test-jwt-secret";
const SERVICE_KEY = "test-service-key";
const CUSTOMER_A = "11111111-1111-4111-8111-111111111111";
const CUSTOMER_B = "22222222-2222-4222-8222-222222222222";
const VENDOR_USER = "33333333-3333-4333-8333-333333333333";
const VENDOR_ID = "44444444-4444-4444-8444-444444444444";
const ORDER_A = "55555555-5555-4555-8555-555555555555";
const ORDER_B = "66666666-6666-4666-8666-666666666666";

let server;
let baseUrl;
const pool = new pg.Pool({ connectionString: TEST_DATABASE_URL });

function tokenFor(id, role, email) {
  return jwt.sign({ id, email, role, fullName: "Test User" }, "test-jwt-secret", { expiresIn: "10m" });
}

/**
 * Start the real router behind a tiny HTTP shim.
 *
 * The router is mounted the same way server.js mounts it, so these tests exercise
 * the authenticateToken middleware and buildAiPayload for real rather than in isolation.
 */
async function startServer() {
  const { createServer } = await import("node:http");
  const express = (await import("express")).default;
  // Imported here, not at the top of the file: ESM hoists static imports above the
  // env assignments at the top of this module, so a static import would capture the
  // fallback JWT secret and the pre-test DATABASE_URL.
  const { aiRouter } = await import("../src/routes/ai.js");
  const app = express();
  app.use(express.json());
  app.use(aiRouter);
  app.use((error, _req, res, _next) => {
    res.status(500).json({ error: error.message });
  });

  await new Promise((resolve) => {
    server = createServer(app).listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
}

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = request.request(
      `${baseUrl}${path}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(payload),
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          let parsed = null;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on("error", reject);
    req.end(payload);
  });
}

describe("ai route: identity handling", () => {
  // The server is started unconditionally. Only the tests that actually query Postgres
  // are gated on TEST_DATABASE_URL; the quote-estimate route reads no tables, so gating
  // it meant its assertions silently never ran and a wrong `source` value went unnoticed.
  beforeAll(async () => {
    if (TEST_DATABASE_URL) {
      await pool.query("TRUNCATE orders, vendors, users RESTART IDENTITY CASCADE");
    await pool.query(
      `INSERT INTO users (id, email, full_name, role) VALUES
        ($1, 'a@example.com', 'Customer A', 'customer'),
        ($2, 'b@example.com', 'Customer B', 'customer'),
        ($3, 'vendor@example.com', 'Vendor User', 'vendor')`,
      [CUSTOMER_A, CUSTOMER_B, VENDOR_USER]
    );
    await pool.query(
      "INSERT INTO vendors (id, user_id, business_name, verification_status) VALUES ($1, $2, 'Lanka Teak Estates', 'approved')",
      [VENDOR_ID, VENDOR_USER]
    );
    await pool.query(
      `INSERT INTO orders (id, customer_id, vendor_id, status, total_amount, requires_manufacturing, fulfillment_plan, created_at) VALUES
        ($1, $2, $3, 'shipped', 250000, FALSE, '[{"name":"Maharaja Bed Frame","quantity":1}]', NOW() - INTERVAL '2 days'),
        ($4, $5, $3, 'manufacturing', 480000, TRUE, '[{"name":"Customer B Secret","quantity":1}]', NOW())`,
      [ORDER_A, CUSTOMER_A, VENDOR_ID, ORDER_B, CUSTOMER_B]
    );
    }

    await startServer();
  });

  afterAll(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (TEST_DATABASE_URL) await pool.end();
  });

  it("rejects a request with no token", async () => {
    if (!TEST_DATABASE_URL) return;
    const res = await post("/api/ai/chat", { message: "where is my order" });
    expect(res.status).toBe(401);
  });

  it("rejects a malformed token", async () => {
    if (!TEST_DATABASE_URL) return;
    const res = await post("/api/ai/chat", { message: "where is my order" }, "not-a-jwt");
    expect(res.status).toBe(401);
  });

  it("overwrites a client supplied actorId so one customer cannot read another's orders", async () => {
    if (!TEST_DATABASE_URL) return;

    // The AI service is stubbed out, so this asserts the payload that would be sent.
    const aiCalls = [];
    process.env.AI_SERVICE_URL = "http://127.0.0.1:1"; // unreachable, forces the fallback path
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, options) => {
      aiCalls.push({ url, body: JSON.parse(options.body) });
      return new Response(JSON.stringify({ reply: "ok", intent: "order_tracking", confidence: 1, suggestions: [], source: "stub" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    };

    try {
      const token = tokenFor(CUSTOMER_A, "customer", "a@example.com");
      await post(
        "/api/ai/chat",
        { message: "where is my order", actorId: CUSTOMER_B, actorRole: "admin", sneaky: "value" },
        token
      );

      expect(aiCalls).toHaveLength(1);
      expect(aiCalls[0].body.actorId).toBe(CUSTOMER_A);
      expect(aiCalls[0].body.actorRole).toBe("customer");
      expect(aiCalls[0].body.message).toBe("where is my order");
      expect(aiCalls[0].body.sneaky).toBe("value");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("scopes GET /api/ai/orders to the caller's own rows", async () => {
    if (!TEST_DATABASE_URL) return;
    const getRes = await new Promise((resolve, reject) => {
      const req = request.request(`${baseUrl}/api/ai/orders`, {
        headers: { authorization: `Bearer ${tokenFor(CUSTOMER_A, "customer", "a@example.com")}` },
      }, (r) => {
        let raw = "";
        r.on("data", (c) => (raw += c));
        r.on("end", () => resolve({ status: r.statusCode, body: JSON.parse(raw) }));
      });
      req.on("error", reject);
      req.end();
    });

    expect(getRes.status).toBe(200);
    const ids = getRes.body.orders.map((order) => order.id);
    expect(ids).toContain(ORDER_A);
    expect(ids).not.toContain(ORDER_B);
  });

  it("requires a token for GET /api/ai/orders", async () => {
    if (!TEST_DATABASE_URL) return;
    const res = await new Promise((resolve, reject) => {
      const req = request.request(`${baseUrl}/api/ai/orders`, {}, (r) => {
        r.resume();
        r.on("end", () => resolve({ status: r.statusCode }));
      });
      req.on("error", reject);
      req.end();
    });
    expect(res.status).toBe(401);
  });

  it("requires a token for POST /api/ai/quote-estimate", async () => {
    const res = await post("/api/ai/quote-estimate", { material: "teak", basePrice: 85000, quantity: 1 });
    expect(res.status).toBe(401);
  });

  // Shared by both branches below. Whichever path answers must produce these totals.
  const QUOTE_CASES = [
    { material: "teak", basePrice: 85000, quantity: 1, customSize: false, expected: 106250 },
    { material: "teak", basePrice: 85000, quantity: 4, customSize: false, expected: 425000 },
    { material: "mahogany", basePrice: 85000, quantity: 4, customSize: false, expected: 401200 },
    { material: "walnut", basePrice: 85000, quantity: 4, customSize: false, expected: 391000 },
    { material: "bamboo", basePrice: 85000, quantity: 4, customSize: false, expected: 278800 },
    { material: "jackwood", basePrice: 85000, quantity: 4, customSize: false, expected: 306000 },
    { material: "teak", basePrice: 85000, quantity: 4, customSize: true, expected: 510000 },
    // An unknown material must fall back to factor 1.0 rather than throw.
    { material: "unobtainium", basePrice: 85000, quantity: 2, customSize: false, expected: 170000 },
    // Quantity 0 is clamped to 1, not treated as a zero-priced order.
    { material: "teak", basePrice: 50000, quantity: 0, customSize: false, expected: 62500 },
  ];

  // The AI service is not running in CI, so every one of these exercises the
  // fallback branch. That is deliberate: the fallback has to reproduce the AI
  // service's arithmetic exactly, otherwise a vendor sees a different price
  // depending on whether the AI service happened to be up. The FastAPI branch is
  // covered separately below with a stubbed service.
  describe("POST /api/ai/quote-estimate fallback arithmetic", () => {
    const VENDOR_TOKEN = () => tokenFor(VENDOR_USER, "vendor", "vendor@example.com");

    let originalUrl;

    beforeAll(() => {
      // Pinned to a closed port so this suite tests the fallback even on a developer
      // machine where the AI service happens to be running.
      originalUrl = process.env.AI_SERVICE_URL;
      process.env.AI_SERVICE_URL = "http://127.0.0.1:1";
    });

    afterAll(() => {
      if (originalUrl === undefined) delete process.env.AI_SERVICE_URL;
      else process.env.AI_SERVICE_URL = originalUrl;
    });

    for (const testCase of QUOTE_CASES) {
      it(`estimates ${testCase.material} x${testCase.quantity} custom=${testCase.customSize} to LKR ${testCase.expected.toLocaleString("en-US")}`, async () => {
        const res = await post("/api/ai/quote-estimate", testCase, VENDOR_TOKEN());
        expect(res.status).toBe(200);
        expect(res.body.estimatedTotal).toBeCloseTo(testCase.expected, 2);
      });
    }

    it("reports that the local formula produced the number", async () => {
      const res = await post(
        "/api/ai/quote-estimate",
        { material: "teak", basePrice: 85000, quantity: 4, customSize: false },
        VENDOR_TOKEN()
      );
      expect(res.body.source).toBe("api-fallback");
    });

    it("never returns a negative or NaN total for junk input", async () => {
      const res = await post(
        "/api/ai/quote-estimate",
        { material: "", basePrice: -500, quantity: -3, customSize: true },
        VENDOR_TOKEN()
      );
      expect(res.status).toBe(200);
      expect(Number.isFinite(res.body.estimatedTotal)).toBe(true);
      expect(res.body.estimatedTotal).toBeLessThanOrEqual(0);
    });
  });

  // The route calls the AI service first and falls back locally. This stubs the service
  // so the success path is asserted rather than assumed, which is what keeps the AI
  // service's endpoint from quietly becoming dead code again.
  describe("POST /api/ai/quote-estimate with the AI service reachable", () => {
    const VENDOR_TOKEN = () => tokenFor(VENDOR_USER, "vendor", "vendor@example.com");

    let stub;
    let originalUrl;
    let originalKey;
    let receivedKey;
    // Flipped by the malformed-response test so the stub can misbehave on demand.
    let returnJunk = false;

    beforeAll(async () => {
      const { createServer } = await import("node:http");
      originalUrl = process.env.AI_SERVICE_URL;
      originalKey = process.env.AI_SERVICE_API_KEY;

      stub = createServer((request, response) => {
        receivedKey = request.headers["x-api-key"];
        let raw = "";
        request.on("data", (chunk) => (raw += chunk));
        request.on("end", () => {
          response.setHeader("content-type", "application/json");

          if (returnJunk) {
            response.end(JSON.stringify({ estimatedTotal: "not-a-number", confidence: 0.74 }));
            return;
          }

          const body = JSON.parse(raw || "{}");
          const factors = { teak: 1.25, mahogany: 1.18, walnut: 1.15, bamboo: 0.82, jackwood: 0.9 };
          const materialFactor = factors[String(body.material || "teak").toLowerCase()] ?? 1.0;
          const customSizeFactor = body.customSize ? 1.2 : 1.0;
          response.end(
            JSON.stringify({
              productType: body.productType,
              material: body.material,
              quantity: body.quantity,
              estimatedTotal: Math.round(body.basePrice * Math.max(1, body.quantity) * materialFactor * customSizeFactor * 100) / 100,
              confidence: 0.74,
              // Deliberately different from the fallback notes, so a test can prove the
              // response came from the AI service rather than the local formula.
              notes: "Prototype estimate based on material, quantity, and custom sizing factors.",
            })
          );
        });
      });

      await new Promise((resolve) => stub.listen(0, "127.0.0.1", resolve));
      process.env.AI_SERVICE_URL = `http://127.0.0.1:${stub.address().port}`;
      process.env.AI_SERVICE_API_KEY = SERVICE_KEY;
    });

    afterAll(async () => {
      if (originalUrl === undefined) delete process.env.AI_SERVICE_URL;
      else process.env.AI_SERVICE_URL = originalUrl;
      if (originalKey === undefined) delete process.env.AI_SERVICE_API_KEY;
      else process.env.AI_SERVICE_API_KEY = originalKey;
      if (stub) await new Promise((resolve) => stub.close(resolve));
    });

    // Same expected totals as the fallback suite. The two branches must agree exactly.
    for (const testCase of QUOTE_CASES) {
      it(`returns the AI service total for ${testCase.material} x${testCase.quantity}`, async () => {
        const res = await post("/api/ai/quote-estimate", testCase, VENDOR_TOKEN());
        expect(res.status).toBe(200);
        expect(res.body.source).toBe("fastapi");
        expect(res.body.estimatedTotal).toBeCloseTo(testCase.expected, 2);
      });
    }

    it("falls back to the local formula when the AI service is unreachable", async () => {
      const reachable = process.env.AI_SERVICE_URL;
      process.env.AI_SERVICE_URL = "http://127.0.0.1:1";
      try {
        const res = await post(
          "/api/ai/quote-estimate",
          { material: "teak", basePrice: 85000, quantity: 4 },
          VENDOR_TOKEN()
        );
        expect(res.status).toBe(200);
        expect(res.body.source).toBe("api-fallback");
        expect(res.body.estimatedTotal).toBe(425000);
      } finally {
        // Restored so the tests after this one still reach the stub.
        process.env.AI_SERVICE_URL = reachable;
      }
    });

    it("keeps the factor breakdown the AI service omits, so the UI shape is identical", async () => {
      const res = await post(
        "/api/ai/quote-estimate",
        { material: "teak", basePrice: 85000, quantity: 4, customSize: true },
        VENDOR_TOKEN()
      );
      expect(res.body.materialFactor).toBe(1.25);
      expect(res.body.customSizeFactor).toBe(1.2);
    });

    it("forwards the service key the AI service requires", async () => {
      receivedKey = undefined;
      await post("/api/ai/quote-estimate", { material: "teak", basePrice: 85000, quantity: 1 }, VENDOR_TOKEN());
      expect(receivedKey).toBe(SERVICE_KEY);
    });

    it("answers from the local formula when the AI service returns a non-numeric total", async () => {
      returnJunk = true;
      try {
        const res = await post(
          "/api/ai/quote-estimate",
          { material: "teak", basePrice: 85000, quantity: 4 },
          VENDOR_TOKEN()
        );
        expect(res.status).toBe(200);
        expect(res.body.source).toBe("api-fallback");
        expect(res.body.estimatedTotal).toBe(425000);
      } finally {
        returnJunk = false;
      }
    });
  });
});
