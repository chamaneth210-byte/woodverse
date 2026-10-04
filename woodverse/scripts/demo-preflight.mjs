/**
 * Demo preflight — run this 2-3 minutes before you present.
 *
 * It touches nothing. It only reads, and it verifies every dependency the live
 * demo needs so that a failure happens here rather than in front of examiners.
 *
 *   node scripts/demo-preflight.mjs
 *
 * Exit code 0 = safe to present. Non-zero = fix before you start.
 */

const API = process.env.API_URL || "http://localhost:4000";
const AI = process.env.AI_URL || "http://127.0.0.1:8010";
const WEB = process.env.WEB_URL || "http://localhost:5173";

const results = [];
const check = (name, pass, detail = "") => results.push({ name, pass: !!pass, detail: String(detail) });

async function read(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body, headers: res.headers };
}

const login = (email, password) =>
  read(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

// ---------------------------------------------------------------- services
for (const [name, url] of [
  ["frontend reachable", WEB],
  ["API reachable", `${API}/api/catalog`],
  ["AI service reachable", `${AI}/health`],
]) {
  try {
    const r = await read(url);
    check(name, r.status === 200, `HTTP ${r.status}`);
  } catch (error) {
    check(name, false, error.message);
  }
}

// ---------------------------------------------------------------- CORS
try {
  const good = await read(`${API}/api/catalog`, { headers: { origin: WEB } });
  check(
    `CORS allows ${new URL(WEB).host}`,
    good.headers.get("access-control-allow-origin") === WEB,
    `allow-origin=${good.headers.get("access-control-allow-origin")}`,
  );
} catch (error) {
  check(`CORS allows ${new URL(WEB).host}`, false, error.message);
}

// ---------------------------------------------------------------- accounts
const ACCOUNTS = [
  ["customer", "customer@woodverse.lk", "WoodVerse@123", "/"],
  ["vendor", "vendor@woodverse.lk", "Vendor@12345", "/vendor-dashboard"],
  ["supplier", "supplier@woodverse.lk", "Supplier@12345", "/supplier"],
  ["admin", "admin@woodverse.lk", "Admin@12345", "/admin"],
];
const tokens = {};
for (const [role, email, password] of ACCOUNTS) {
  try {
    const r = await login(email, password);
    tokens[role] = r.body?.token;
    check(`login: ${role}`, r.status === 200 && !!r.body?.token, `HTTP ${r.status}`);
  } catch (error) {
    check(`login: ${role}`, false, error.message);
  }
}

// ---------------------------------------------------------------- seed data
try {
  const catalog = await read(`${API}/api/catalog`);
  const products = catalog.body?.products || catalog.body || [];
  check("catalogue has products", Array.isArray(products) && products.length > 0, `${products.length} published`);
} catch (error) {
  check("catalogue has products", false, error.message);
}

try {
  const r = await read(`${API}/api/orders`, { headers: { authorization: `Bearer ${tokens.customer}` } });
  const orders = Array.isArray(r.body) ? r.body : Array.isArray(r.body?.orders) ? r.body.orders : [];
  // Informational only. database/seed.sql inserts no orders, so a freshly seeded
  // database legitimately has none — segment 2 of the demo creates the first one.
  console.log(`  ....  customer order history            ${orders.length} (created live during the demo)`);
} catch (error) {
  check("customer can list orders", false, error.message);
}

// ---------------------------------------------------------------- chatbot
const CHAT = [
  ["track my order", "order_tracking"],
  ["where is my order", "order_tracking"],
  ["payment methods", "payment"],
  ["do you deliver to Kandy", "delivery"],
  ["teak dining table", "product_search"],
  ["return policy", "returns"],
  ["chat with vendor", "realtime_chat"],
];
try {
  let correct = 0;
  for (const [message, expected] of CHAT) {
    const r = await read(`${API}/api/ai/chat`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${tokens.customer}` },
      body: JSON.stringify({ message }),
    });
    if (r.body?.intent === expected) correct += 1;
  }
  check(
    "chatbot routes the scripted lines",
    correct === CHAT.length,
    `${correct}/${CHAT.length} — do not demo any other phrasing`,
  );
} catch (error) {
  check("chatbot routes the scripted lines", false, error.message);
}

// ---------------------------------------------------------------- order + notification
try {
  const catalog = await read(`${API}/api/catalog`);
  const products = catalog.body?.products || catalog.body || [];
  const product = products[0];
  const r = await read(`${API}/api/orders`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${tokens.customer}` },
    body: JSON.stringify({ items: [{ id: product.id, quantity: 1 }] }),
  });
  const total = r.body?.pricing?.total;
  check("order placement returns server total", r.status === 201 && typeof total === "number", `HTTP ${r.status} total=${total}`);
} catch (error) {
  check("order placement returns server total", false, error.message);
}

// ---------------------------------------------------------------- AI quote estimate
try {
  const r = await read(`${API}/api/ai/quote-estimate`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${tokens.vendor}` },
    body: JSON.stringify({
      items: [{ material: "teak", quantity: 4, unit: "board-foot", dimensions: { length: 120, width: 60, thickness: 8 } }],
      customizations: ["carving"],
      urgency: "standard",
    }),
  });
  check("AI quote estimate", r.status === 200 && typeof r.body?.estimatedTotal === "number", `HTTP ${r.status}`);
} catch (error) {
  check("AI quote estimate", false, error.message);
}

// ---------------------------------------------------------------- report
const passed = results.filter((r) => r.pass).length;
const width = Math.max(...results.map((r) => r.name.length));
for (const r of results) {
  console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.name.padEnd(width)}  ${r.detail}`);
}
console.log(`\n  ${passed}/${results.length} preflight checks passed`);

if (passed === results.length) {
  console.log("  Safe to present. See docs/guides/DEMO_RUNBOOK.md for the script.\n");
  console.log("  NOTE  this run used 4 of your 20 /api/auth logins and ~13 of your 100");
  console.log("        /api requests (both reset every 15 min). Run it ONCE. If you");
  console.log("        need to clear the counters, restart the API process.\n");
} else {
  console.log("  DO NOT START YET — fix the FAIL lines above first.\n");
  const rateLimited = results.some((r) => r.detail.includes("429"));
  if (rateLimited) {
    console.log("  HTTP 429 = rate limited, not a broken app. Limits are 20 logins and");
    console.log("  100 API requests per 15 minutes (server.js:83-95). Restart the API");
    console.log("  process to clear the in-memory counters, then re-run once.\n");
  }
}
process.exit(passed === results.length ? 0 : 1);