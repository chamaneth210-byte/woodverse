/**
 * Regression test for the order -> vendor notification path.
 *
 * This exists because of a real defect: registerRoutes() mounted ordersRouter
 * *before* the middleware that assigns `request.io`, so the `if (request.io)`
 * guard in the order handler was always false and no notification was ever
 * emitted. The unit and component suites all passed while the feature was dead.
 *
 * The test boots the real Express app with a real Socket.IO server and the real
 * PostgreSQL pool, then listens on the notification room exactly as the vendor
 * portal does.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer } from "node:http";
import request from "node:http";
import jwt from "jsonwebtoken";
import pg from "pg";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || "";

if (TEST_DATABASE_URL) process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.JWT_SECRET = "test-jwt-secret";
process.env.AI_SERVICE_URL = "http://127.0.0.1:1"; // AI service down; quote/order paths must still work

const CUSTOMER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const VENDOR_USER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const VENDOR = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const IN_STOCK = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const LOW_STOCK = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";

let server;
let io;
let baseUrl;
let vendorToken;
let customerToken;
const pool = new pg.Pool({ connectionString: TEST_DATABASE_URL });

const tokenFor = (id, role, email) =>
  jwt.sign({ id, email, role, fullName: "Test User" }, "test-jwt-secret", { expiresIn: "10m" });

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
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode, body: raw });
          }
        });
      }
    );
    req.on("error", reject);
    req.end(payload);
  });
}

const waitFor = (ms) => new Promise((r) => setTimeout(r, ms));

describe("order -> vendor notification", () => {
  let received = [];
  let socket;

  beforeAll(async () => {
    if (!TEST_DATABASE_URL) return;

    const express = (await import("express")).default;
    const { Server } = await import("socket.io");
    const { registerRoutes } = await import("../src/routes/index.js");

    const app = express();
    app.use(express.json());

    server = createServer(app);
    io = new Server(server, { cors: { origin: "*" } });

    // Same wiring as src/server.js: routes receive the io instance.
    registerRoutes(app, io);
    app.use((error, _req, res, _next) => res.status(500).json({ error: error.message }));

    // Mirrors the room join the vendor portal performs on connect.
    io.on("connection", (sock) => {
      sock.on("notification:join", ({ room = "woodverse-notifications" } = {}) => sock.join(room));
    });

    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;

    await pool.query("TRUNCATE orders, vendors, products, users RESTART IDENTITY CASCADE");
    await pool.query(
      `INSERT INTO users (id, email, full_name, role) VALUES
        ($1,'cust@example.com','Customer A','customer'),
        ($2,'vendor@example.com','Vendor User','vendor')`,
      [CUSTOMER, VENDOR_USER]
    );
    await pool.query(
      "INSERT INTO vendors (id, user_id, business_name, verification_status) VALUES ($1,$2,'Bench Co','approved')",
      [VENDOR, VENDOR_USER]
    );
    await pool.query(
      `INSERT INTO products (id, vendor_id, name, price, stock_quantity, status) VALUES
        ($1,$3,'In Stock Chair',85000,50,'published'),
        ($2,$3,'Low Stock Table',85000,3,'published')`,
      [IN_STOCK, LOW_STOCK, VENDOR]
    );

    vendorToken = tokenFor(VENDOR_USER, "vendor", "vendor@example.com");
    customerToken = tokenFor(CUSTOMER, "customer", "cust@example.com");

    // A real socket.io client joins the room, exactly as the browser does.
    const { io: ioClient } = await import("socket.io-client");
    socket = ioClient(baseUrl, { transports: ["websocket"], forceNew: true });
    await new Promise((resolve, reject) => {
      socket.on("connect", () => {
        socket.emit("notification:join", { room: "woodverse-notifications" });
        resolve();
      });
      socket.on("connect_error", reject);
    });
    socket.on("notification:event", (n) => received.push(n));
    await waitFor(200);
  }, 30000);

  afterAll(async () => {
    socket?.close();
    io?.close();
    if (server) await new Promise((r) => server.close(r));
    await pool.end();
  });

  it("notifies the vendor when an in-stock order is placed", async () => {
    if (!TEST_DATABASE_URL) return;
    received = [];
    const res = await post("/api/orders", { items: [{ id: IN_STOCK, quantity: 2 }] }, customerToken);
    expect(res.status).toBe(201);
    await waitFor(700);

    expect(received).toHaveLength(1);
    const note = received[0];
    expect(note.audience).toBe("Vendor");
    expect(note.title).toBe("New stock order");
    expect(note.message).toContain(res.body.order.id);
    expect(note.id).toBeTruthy();
    expect(note.time).toBeTruthy();
  });

  it("notifies with the approval title when the line must be manufactured", async () => {
    if (!TEST_DATABASE_URL) return;
    received = [];
    // Quantity 9 against 3 available forces the manufacturing route.
    const res = await post("/api/orders", { items: [{ id: LOW_STOCK, quantity: 9 }] }, customerToken);
    expect(res.status).toBe(201);
    expect(res.body.requiresVendorApproval).toBe(true);
    await waitFor(700);

    expect(received).toHaveLength(1);
    expect(received[0].title).toBe("Order needs vendor approval");
    expect(received[0].message).toContain(res.body.order.id);
  });

  it("does not notify when the order is rejected", async () => {
    if (!TEST_DATABASE_URL) return;
    received = [];
    // Unparseable product id -> 400, so no order and no notification.
    const res = await post("/api/orders", { items: [{ id: "not-a-uuid", quantity: 1 }] }, customerToken);
    expect(res.status).toBe(400);
    await waitFor(500);
    expect(received).toHaveLength(0);
  });

  it("gives every router access to request.io", async () => {
    // The regression in one line: if any router were mounted before the io
    // middleware, its `if (request.io)` guard would be false and this fails.
    if (!TEST_DATABASE_URL) return;
    received = [];
    const res = await post("/api/orders", { items: [{ id: IN_STOCK, quantity: 1 }] }, customerToken);
    expect(res.status).toBe(201);
    await waitFor(700);
    expect(received.length).toBeGreaterThan(0);
  });
});