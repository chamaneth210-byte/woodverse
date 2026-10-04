# Live Demonstration Runbook

**Audience:** examiners / panel. **Target length:** 10 minutes demo + questions.
**Everything in this document was executed against the running stack on 2026-10-04 and the outputs quoted are real, not illustrative.**

The single most important thing in this file is §1. Most demo failures are not bugs — they are the five avoidable mistakes in §1.2.

---

## 1. Before you present

### 1.1 Start the stack (do this 10 minutes before, not 2)

Three processes. Run them in three terminals, from `woodverse/`:

```bash
# Terminal 1 — API  (port 4000)
cd backend/api && node --env-file-if-exists=.env src/server.js

# Terminal 2 — AI service  (port 8010)
cd backend/ai-service
AI_SERVICE_API_KEY=evidence-key-123 \
DATABASE_URL="postgresql:///woodverse_test?host=/var/run/postgresql&port=5433" \
.venv/bin/python -m uvicorn src.main:app --host 127.0.0.1 --port 8010

# Terminal 3 — frontend  (port 5173)
cd frontend && npx vite --host 127.0.0.1 --port 5173
```

**Wait for `PostgreSQL database: ready` in terminal 1** before doing anything else. Every route that touches data fails without it.

> **Note the AI port.** `backend/api/.env` sets `AI_SERVICE_URL=http://127.0.0.1:8010`, so locally the AI service must be on **8010**. The AI service's own default and the Railway deploy target are port **8000**. Start it on 8000 and the chatbot fails with a proxy error while the rest of the site looks completely fine — a genuinely confusing failure. Use **8010**.

> **Why the browser never shows CORS errors locally.** `apiRequest()` uses `VITE_API_URL || ""` and the socket uses `VITE_SOCKET_URL || "/"`, so with no `.env` set both are **same-origin** and `vite.config.js` proxies `/api` and `/socket.io` to `localhost:4000`. All CORS happens server-side on the proxy hop. This is why an AI-service outage shows up as one broken chatbot rather than a dead site — and why you should check terminal 2 first.

### 1.2 The five rules

| # | Rule | What goes wrong if you break it |
|---|---|---|
| 1 | **Open `http://localhost:5173` — not `127.0.0.1:5173`.** | They are different origins to the browser, so `localStorage` is separate. A token saved under `localhost` is invisible at `127.0.0.1` and you appear logged out with no error. (The API's CORS allowlist also lists only `localhost:5173`/`5174`, which matters if you call the API directly from the console.) |
| 2 | **Never run `npm test`, `npm run test:api` or `test:ai` while the demo DB is live.** | Those suites `TRUNCATE users, orders, vendors`. You will delete your own demo data minutes before you need it. |
| 3 | **Re-seed only if you must:** `psql -h /var/run/postgresql -p 5433 -d woodverse_test -f database/seed.sql` | Gives you 4 accounts, 2 vendors, 9 published products. Idempotent, safe to re-run. |
| 4 | **Only type the exact chatbot lines in §3.2.** | Measured intent accuracy is **61 %**. Off-script phrasings fail visibly, in front of the panel. |
| 5 | **Do not claim the image features have a UI.** | They have no UI and no proxy route. See §5. |

### 1.3 Preflight (run this 2–3 minutes before you start)

```bash
node scripts/demo-preflight.mjs
```

It is read-only apart from one throwaway order, and it verifies every dependency. Expected output:

```
  PASS  frontend reachable                    HTTP 200
  PASS  API reachable                         HTTP 200
  PASS  AI service reachable                  HTTP 200
  PASS  CORS allows localhost:5173            allow-origin=http://localhost:5173
  PASS  login: customer                       HTTP 200
  PASS  login: vendor                         HTTP 200
  PASS  login: supplier                       HTTP 200
  PASS  login: admin                          HTTP 200
  PASS  catalogue has products                9 published
  ....  customer order history                0 (created live during the demo)
  PASS  chatbot routes the scripted lines     7/7 — do not demo any other phrasing
  PASS  order placement returns server total  HTTP 201 total=17800
  PASS  AI quote estimate                     HTTP 200

12/12 preflight checks passed
```

If any line FAILs, fix it now. Do not start and hope.

**`database/seed.sql` inserts no orders.** A freshly seeded database has an empty order history by design — that is why segment 2 places a real order and segment 3 grounds the chatbot on it. Preflight creating one throwaway order is intentional and harmless.

### 1.3a The rate limit will bite you if you don't know about it

`server.js:83-95` applies two in-memory limiters:

| Scope | Limit | Window |
|---|---|---|
| `/api/auth` | **20 requests** | 15 min |
| `/api` | **100 requests** | 15 min |

Consequences for the demo:

- **Run preflight ONCE.** It costs 4 logins and ~13 API calls. Five runs exhausts the entire login budget and every login returns **HTTP 429** until the window rolls over — including the ones you do on stage.
- **The 100-request API budget is genuinely tight for a 10-minute demo.** Page loads, catalogue reads, chatbot messages and order calls all draw from the same pool, and they share one window with preflight. If a panel member asks you to repeat a step, you are spending real budget.
- **To clear the counters, restart the API process** (terminal 1, `Ctrl-C` then re-run). The store is in-memory, so a restart wipes it instantly — no need to wait 15 minutes. Do this any time in §1, not during the demo.

A 429 during the demo looks like "the app is broken" when nothing is wrong. If it happens, say *"the API rate limiter kicked in, let me restart the service"* — that is a correct and confident answer, and it doubles as a talking point about abuse protection.

### 1.4 Accounts

| Role | Email | Password | Lands on |
|---|---|---|---|
| Customer | `customer@woodverse.lk` | `WoodVerse@123` | `/` |
| Vendor | `vendor@woodverse.lk` | `Vendor@12345` | `/vendor-dashboard` |
| Supplier | `supplier@woodverse.lk` | `Supplier@12345` | `/supplier` |
| Admin | `admin@woodverse.lk` | `Admin@12345` | `/admin` |

On **sign-in** the account-type tabs are irrelevant: the redirect is computed from the role in the token the server issued (`LoginPage.jsx:126-128` — *"Role comes from the token the server issued, not from a localStorage record"*), so each account lands on its own portal automatically. The tabs only matter on the **Register** tab, where they decide which role you are applying for.

Open **two browser windows** side by side before you start: one logged in as customer, one as vendor. The realtime demo in §3.4 depends on both being visible at once.

---

## 2. The 10-minute script

Total ≈ 10 min. Timings are measured, not guessed.

| # | Segment | Time | Screen |
|---|---|---|---|
| 1 | Landing + role portals | 1.5 min | `/` |
| 2 | Customer checkout | 2 min | `/shop` → `/cart` |
| 3 | AI assistant | 2.5 min | `/chatbot` |
| 4 | Realtime notification (two windows) | 2 min | vendor dashboard |
| 5 | Vendor AI quotation | 2 min | `/vendor/quotations` |

### 2.1 Segment 1 — the platform (1.5 min)

Open `http://localhost:5173`. Point at the header, then the feature cards.

> "WoodVerse is a five-role wooden-products marketplace. Customers buy, vendors list and fulfil, suppliers provide raw material, and admins verify and moderate. Four portals, 47 screens, 32 HTTP endpoints, one PostgreSQL schema of 10 tables."

The cards name the roles directly — **Customer marketplace**, **Vendor operations**, **Supplier network** — so the five-role claim is visible on the first screen rather than something you have to assert. Point at those three and move on; do not tour.

**One card needs care.** The landing page advertises **"Real-time communication — keep customers, vendors, and suppliers aligned with live updates."** That is true of the notification transport but **there is no customer↔vendor chat screen** (§5.2). If a panel member reads that card and asks to see live messaging, answer with the §2.4 wording — the transport is real and demonstrated, the chat UI is not built.

**If asked how many pages:** 47 screens across 48 registered URL paths. The admin console is 11 URLs that render one shell, which reads the section from the path.

### 2.2 Segment 2 — checkout and server-side pricing (2 min)

1. `/shop` → add any product to cart → `/cart`.
2. **Before** pressing Place Order, open DevTools → Network, or just say it:

> "The browser sends only which product and how many. It cannot send a price."

3. Place the order. A real row is written to `orders`. Verified on a freshly seeded database — 2 × *Carved Wood Serving Tray*:

```json
{ "subtotal": 30400, "delivery": 7500, "assurance": 3500, "total": 41400 }
```

4. **Write down the order id** — the response and `/profile` → Order History both show it as `#C890DD56` style. You need it in segment 3.

> "The browser sent only which product and how many. The server recomputed 30,400 subtotal, plus 7,500 delivery and 3,500 assurance, from the database. `parseOrderItems()` returns only `{id, quantity}` — the return type is the security control."

**Strong move if the panel is technical:** place a second order for quantity 9 of a low-stock item (*Royal Majesty Sofa Set* has only 3 left). The response flips to `requiresVendorApproval: true` — a stock/manufacture decision computed server-side, which sets up segment 5.

### 2.3 Segment 3 — the AI assistant (2.5 min)

Go to `/chatbot`. **Type these lines exactly.** All 7 were measured to route correctly:

| Type this | It routes to | Measured |
|---|---|---|
| `track my order` | `order_tracking` | 90 ms |
| `payment methods` | `payment` | 60 ms |
| `do you deliver to Kandy` | `delivery` | 66 ms |
| `teak dining table` | `product_search` | 46 ms |
| `return policy` | `returns` | 59 ms |
| `chat with vendor` | `realtime_chat` | 43 ms |
| `my account` | `account` | 43 ms |

(`realtime_chat` returns guidance with suggested next steps — it does **not** open a live vendor thread. See §2.4.)

**Do not type** `installment plan` or `EMI plan` — both route to `account`, not `payment`. This is a real, measured weakness, not a typo.

**Now the grounded answer.** Use the order id you wrote down in segment 2:

```
status of order c890dd56-f91b-438e-885c-9f11f2341486
```

Real response captured from a freshly seeded database:

> Order #C890DD56 is currently processing. Items: Carved Wood Serving Tray x2. Total: LKR 41,400. Vendor: Kasun Fernando Woodcraft. Placed on 2026-10-04. The vendor is preparing your order and confirming availability.

> "Every fact in that answer came from PostgreSQL — including the vendor's business name. The model picks an intent and nothing else; the order id is extracted by regex, so it physically cannot invent one."

**Then the adversarial probe.** Type exactly:

```
status of order ' OR 1=1 --
```

Real response: the malformed reference is discarded and the assistant answers from the caller's **own** orders only — with one order in history it returns that order, with several it lists them.

> "That's a SQL injection attempt. The string never becomes a query — the reference is extracted by regex, then bound as a parameter. It can't reach another customer's order, and it can only ever return orders belonging to the token I'm signed in as."

**Be accurate about what it does:** it does not return an error page, and it does not leak anything. It quietly degrades to a safe, scoped answer. If you placed the second order in §2.2 you'll see the list form, which reads better on stage — do that one first if you have the time.

This is the single strongest 20 seconds in the demo. Do not skip it.

**If asked about accuracy — say this, and only this:**

> "61 % on 41 held-out messages I wrote myself. That's honest, and it's the number I report. It measures the scikit-learn fallback, which is what runs without an LLM key. The LLM path has unit tests with a mocked transport but I never measured it end to end, because I had no key."

### 2.4 Segment 4 — realtime notification (2 min)

**What is genuinely wired in the browser:** the vendor dashboard holds a live Socket.IO connection and receives order notifications. Both ends are real — the customer's Place Order emits, the vendor dashboard listens.

1. **Vendor window first.** Log in as vendor, land on `/vendor-dashboard`, and point at the connection indicator. It reads **Connected**. Say this out loud — it proves the socket is live *before* you place the order, so the notification that follows is unambiguous.
2. **Customer window.** Place an order.
3. **Vendor window.** The notification appears in the notifications panel with no refresh.

> "One Socket.IO room, `woodverse-notifications`. The API emits on order creation, the vendor dashboard is subscribed. No polling, no refresh."

**Then volunteer the bug — it is your best evidence of testing discipline:**

> "This was silently dead in the committed code. `registerRoutes` mounted the orders router *before* the middleware that assigns `request.io`, so the handler's `if (request.io)` guard was always false. Every order saved and no notification ever fired — HTTP 201, full success, nothing delivered. I found it by attaching a real WebSocket client to the server, because the API tests asserted the response body, and a broken notification looks exactly like a working one from the test's side. The regression test fails 3 of its 4 cases against the old code."

**If they ask how notifications are stored — say this:**

> "They aren't. `POST /api/notifications` returns 201 and emits, but `GET /api/notifications` is 404 and there is no notifications table. A vendor who was offline never learns the order existed. That's a known limitation, documented, not hidden."

**If they ask about the customer↔vendor live chat — be precise, do not oversell:**

> "The `/api/messages` endpoints exist, are role-scoped and are tested, but no React page calls them yet — the vendor↔customer thread UI isn't built. The chatbot's `realtime_chat` intent recognises 'I want to talk to a vendor' and returns guidance with suggested next steps; it doesn't bridge into a live thread. The Socket.IO transport underneath is the same one the notification demo just proved works, so wiring the screen is UI work, not new infrastructure."

Only show a terminal demo of `POST /api/messages` if the panel explicitly asks for the API — and label it clearly as API-only.

### 2.5 Segment 5 — vendor AI quotation (2 min)

Switch to the vendor window → `/vendor/quotations` → click **Create Quotation**.

1. In the modal fill **Customer Name**, **Material** (`teak`) and **Quantity** (`4`). Tick a custom size.
2. Click **Estimate Price** (sparkle icon). The button reads **Estimating…** while it runs, then the line **"Estimated total: LKR …"** appears. Real captured response (59 ms):

```json
{ "productType": "custom furniture", "material": "teak", "quantity": 1,
  "estimatedTotal": 106250, "confidence": 0.74,
  "notes": "Prototype estimate based on material, quantity, and custom sizing factors.",
  "source": "fastapi" }
```

> "A 59 ms estimate from the Python service, proxied through the API. Material factors, quantity and custom sizing."

3. Save the quotation. Back on the list you now have the full chain visible in one screen: **Edit · Send · Convert** — and **Convert** turns an approved quotation into an order.

> "The estimate is a suggestion. The vendor can overwrite it, so a failed or silly estimate never blocks saving the quotation."

**If asked about the 0.74 — answer before they ask:**

> "That confidence is hard-coded. It's not computed from the data. I'd rather tell you that than defend it."

---

## 3. If something breaks

| Symptom | Cause | Fix |
|---|---|---|
| Logged out despite correct password | Opened `127.0.0.1:5173`; `localStorage` is a different origin | Use `http://localhost:5173` and sign in again |
| Chatbot errors, rest of site fine | AI service not running, or on port 8000 | Restart on **8010** |
| Chatbot says AI unavailable | `AI_SERVICE_API_KEY` mismatch | API needs `evidence-key-123` |
| "database not configured" | Terminal 1 started without `DATABASE_URL` | Restart API with `.env` loaded |
| Login succeeds then bounces to `/` | Stale token in `localStorage` under `woodverse-auth-token` | Sign out, or clear that key and reload |
| No notification on new order | Vendor window not open / socket disconnected | Reload vendor window, confirm socket connects |
| Catalogue empty | Tests were run against this DB | Re-seed: `psql -h /var/run/postgresql -p 5433 -d woodverse_test -f database/seed.sql` |
| **HTTP 429 / "Too many authentication attempts"** | Rate limit: 20 logins or 100 API calls per 15 min | **Restart the API process** — clears the in-memory counters instantly. See §1.3a |
| Logged out unexpectedly mid-demo | Rate limiter or an expired token | Restart the API, then sign in again |

**The nuclear option, if the whole stack is broken:** stop, say *"Let me restart the services — one moment"*, and run the three commands in §1.1. This is normal and expected; doing it calmly is better than clicking through a broken UI.

---

## 4. Likely questions, with defensible answers

**"How do you know it works?"** — 323 automated tests, all passing: 118 pytest, 156 vitest frontend, 49 vitest API integration. The API tests import the real Express routers and run against a real `pg.Pool`, not mocks.

**"What's your AI accuracy?"** — 61 % on 41 held-out messages. Small sample, self-authored, no train/test split. I report it as a limitation, not a result.

**"Why is accuracy so low?"** — Two confusions dominate: `production` vs `order_tracking`, and `stock_manufacture` vs `delivery`. The fix is a bigger contrastive dataset, roughly 600 examples with 20 hard negatives per boundary.

**"What's your biggest weakness?"** — Answer with the dead notification. It's the best evidence in the project that you test behaviour rather than assume it, and it's a real defect in the committed code that you found and fixed.

**"Is it deployed?"** — Yes: Vercel for the frontend, Railway for API + AI. Note the AI service runs on 8000 in deployment and 8010 locally; the API reads it from the environment.

**"Why Socket.IO and not WebSockets?"** — Rooms per audience, automatic reconnection, and fallback to HTTP long-polling. For vendor↔customer messaging the room abstraction is what I needed.

**"How do you prevent a client forging a price?"** — `parseOrderItems()` returns only `{id, quantity}`. Price, vendor, name and stock are looked up server-side. There's a test that posts `totalAmount: 1` and asserts the server returns its own computed figure.

**"Scalability?"** — Both services are stateless behind Railway's load balancer. Socket.IO is the only stateful channel and holds no durable state — which is exactly why the notification loss in §2.4 is a real product problem, not just a bug.

---

## 5. Do not claim these

Four things are true of the code and will be caught if you oversell them. All are documented in `REPORT.md` §3.8.4.

1. **The image analysis has no UI.** `POST /ai/image/validate`, `/ai/image/analyze` and `/ai/image/compare` are fully implemented, tested (8.42 / 23.63 / 16.56 ms median) and reachable — but only by calling the AI service directly with `x-api-key`. There is no proxy route and no React caller. Six of the eight AI endpoints are not reachable from the interface; only `chat` and `quote-estimate` are. If you want to show them, do it deliberately in a terminal, and say clearly that they're API-only.
2. **There is no customer↔vendor chat screen.** `POST/GET /api/messages` are implemented, role-scoped and tested, but **no React page calls them**. The Socket.IO transport they use is the same one the notification demo proves live. Do not demo a live messaging thread in the browser — there isn't one.
3. **`is_likely_room` misclassifies flat backgrounds.** Pure white, off-white and flat mid grey all classify as "likely room scene" — 3 of 6 flat colours tested. White-background product photography is the most common listing style. Do not present this as accurate.
4. **Quote confidence 0.74 is hard-coded.** See §2.5.
5. **The LLM path was never measured end to end.** No key was available. Only the fallback's 61 % is a measured number.

---

## 6. The seeded vendor — what Kasun Fernando Woodcraft owns

This is the vendor behind `vendor@woodverse.lk`, and **all 9 published products in the catalogue belong to it**. So every product you click in any demo segment is this vendor's, and it is the vendor who receives the order notification.

| Field | Value |
|---|---|
| Business name | **Kasun Fernando Woodcraft** |
| Contact / full name | Kasun Fernando |
| Email | `vendor@woodverse.lk` |
| Password | `Vendor@12345` |
| Vendor id | `b7ba76dd-f58d-4cce-b370-f0a1caddf072` |
| User id | `06f0186b-c269-49ad-a261-059f8e96aaae` |
| Verification status | `approved` (so the portal opens without admin gating) |
| Account status | `active` |

**Its catalogue — note the stock levels, because two rows make the demo better:**

| Product | Price (LKR) | Stock | Material |
|---|---|---|---|
| Bamboo Coaster Set | 6,800 | 60 | Bamboo |
| Walnut Task Table | 124,500 | 12 | Walnut |
| Carved Wood Serving Tray | 15,200 | 25 | Mahogany |
| Carved Jackwood Gift Box | 24,500 | 40 | Jackwood |
| Housewarming Gift Set | 45,000 | 18 | Mixed |
| Modular Shelf Unit | 96,000 | 15 | Satinwood |
| **Teak Dining Table** | 185,000 | **8** | Teak |
| **Royal Majesty Sofa Set** | 640,000 | **3** | Teak |
| Signature Bedframe | 298,000 | **5** | Mahogany |

- **Royal Majesty Sofa Set (3 in stock)** is the one to use for the manufacturing demo in §2.2 — order 9 and the server forces `requiresVendorApproval: true`.
- **Carved Wood Serving Tray** is the cheapest mid-range item, so it is the safest thing to add to cart on stage.
- Nothing else is a second vendor. `vendor@example.com` / "Lanka Teak Estates" exists only as a test fixture created by the API suite — it is **not** in the seed, so ignore it.

There is also a seeded supplier, **Lumbini Timber Co.** (`supplier@woodverse.lk` / `Supplier@12345`), which shares the same `vendors` table but has `role = 'supplier'`.

---

## 7. One-page cheat sheet

```
URLS      localhost:5173   (NOT 127.0.0.1)
PORTS     web 5173 · api 4000 · ai 8010 (deploy: 8000)
PREFLIGHT node scripts/demo-preflight.mjs        → 12/12

CREDENTIALS
  customer@woodverse.lk  WoodVerse@123
  vendor@woodverse.lk    Vendor@12345
  supplier@woodverse.lk  Supplier@12345
  admin@woodverse.lk     Admin@12345

CHAT LINES THAT WORK
  track my order · payment methods · do you deliver to Kandy
  teak dining table · return policy · chat with vendor · my account
  status of order <real-id>          → grounded DB answer
  status of order ' OR 1=1 --        → injection safely rejected

NEVER TYPE IN CHAT
  installment plan · EMI plan        (both misroute to `account`)

NUMBERS TO QUOTE
  323/323 tests · 32 endpoints · 47 screens · 48 URLs · 10 tables
  chatbot 61 % (fallback, 41 messages) · quote estimate 59 ms
  image: validate 8.42 ms · analyse 23.63 ms · compare 16.56 ms

THE VENDOR IN EVERY DEMO
  Kasun Fernando Woodcraft · vendor@woodverse.lk / Vendor@12345
  owns all 9 catalogue products · approved
  Royal Majesty Sofa Set has only 3 left → order 9 to force manufacturing
  Carved Wood Serving Tray = safest item to add to cart on stage

SEED IF DATABASE LOOKS EMPTY
  psql -h /var/run/postgresql -p 5433 -d woodverse_test -f database/seed.sql
```