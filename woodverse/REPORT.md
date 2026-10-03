# WoodVerse — AI-Assisted Multi-Vendor Woodcraft Platform

**Project:** WoodVerse (monorepo: React + Vite frontend, Node/Express API, FastAPI AI service, PostgreSQL)
**Author:** Dimalsha Kinkini
**Repository:** `/home/kinkini/Desktop/WOODVERSE_LINK-main`
**Status:** Working implementation, 42 commits, 2026-07-29 → 2026-10-03
**Report date:** 2026-10-03

---

## 3.1 Introduction

WoodVerse is an AI-assisted multi-vendor e-commerce and production platform for furniture, wooden products, wooden gifts, laser-cut files, indoor plants, and custom fabrication. It serves five roles — **customer, vendor/seller, supplier, support staff, and system administrator** — across a marketplace, vendor portal, supplier portal, and admin console.

### The real-world problem

Customers buying hand-made wooden furniture cannot see who makes their product, cannot judge whether a piece is genuinely in stock or will be manufactured to order, and cannot get a live status without emailing a vendor. Vendors and suppliers, meanwhile, have no shared tool to coordinate quotations, stock decisions, and production progress across a supply chain. The result is fragmented communication, price uncertainty, and long order cycles.

The importance of this problem is well established. In a study of e-commerce trust in artisanal markets, **"transparency about the maker and the production process"** is identified as the single strongest predictor of purchase intent, outperforming price and delivery time [1]. In the manufacturing domain, **real-time visibility of work orders** has been shown to reduce lead-time variance and machine idle time by measurable margins [2]. WoodVerse addresses both: every order reply names the vendor, states the true stock-or-manufacture decision, and reports production progress drawn from the database rather than from a model's imagination.

### Aim

> **Solve the trust-and-coordination gap in multi-vendor wooden-product commerce using an AI-assisted platform whose chatbot routes user intent, resolves order references deterministically, and renders every order status from a live database.**

### Objectives

1. Build a five-role e-commerce platform (marketplace, vendor portal, supplier portal, admin console) backed by a single PostgreSQL schema with 10 tables.
2. Implement an intent-routing chatbot that classifies a customer message into one of 11 allowed intents and answers order-status questions from live database rows, never from generated text.
3. Implement AI-assisted stock/manufacturer decisioning and quotation estimation so a vendor can decide, per line item, whether to reserve inventory or route the order to production.
4. Enforce security in depth: JWT authentication, role-based access control, server-side pricing, API-key-gated AI service, and fail-closed behaviour when configuration is missing.
5. Achieve a test suite that passes against a live database and a documented end-to-end checkout path.

### Solution overview

- **Users:** customers browsing the marketplace; vendors managing products, quotations, orders, inventory, and production; suppliers handling purchase orders, materials, and shipments; support staff and administrators overseeing the whole system.
- **Input:** natural-language chat messages, base64-encoded product images, shopping-cart line items, quotation requests, customization preferences.
- **Output:** chat replies with intent label, confidence, and suggestions; order status (label, progress percentage, total, vendor, next step); stock/manufacturer decisions per line item; quotation estimates; image validation, analysis, and comparison reports.
- **Process:** a React frontend talks to a Node/Express API that proxies to a FastAPI AI service. The AI service classifies intent (external LLM with a scikit-learn TF-IDF + MLP fallback), extracts order references with a deterministic regex, and reads order rows through parameterised SQL. Images are decoded and analysed with OpenCV (k-means dominant colours, HSV wood-tone heuristics, Canny edge density, Laplacian sharpness).
- **Technology:** React 18 + Tailwind CSS + Vite; Node.js + Express + Socket.IO; Python 3.14 + FastAPI; scikit-learn; OpenCV; PostgreSQL; JWT auth; bcrypt password hashing.

### Report structure

Section 3.2 surveys related work. Section 3.3 names the AI techniques and frameworks. Section 3.4 describes the architecture and data flow. Section 3.5 covers implementation. Section 3.6 reports testing. Section 3.7 presents evaluation with measured results. Section 3.8 concludes. Section 4 lists references.


---

## 3.2 Review of Others' Work

Four existing approaches to the same problem were surveyed: general-purpose e-commerce chatbots, supply-chain visibility platforms, rule-based stock/manufacturer routers, and computer-vision product-quality tools.

### 1. Generic e-commerce chatbots (e.g. GPT-based store assistants)

These accept a free-text message and generate a natural-language answer, including order status and product information, directly from a language model. **Limitation:** they fabricate order data. A 2024 study of LLM-generated customer-service replies found that **up to 34% of order-status answers contained invented totals, dates, or shipment numbers** when the model was not grounded in a retrieved record [3]. WoodVerse explicitly forbids this: the model may only choose an intent and copy an order id the user typed; every status, total, and date is rendered from a PostgreSQL row.

### 2. Supply-chain visibility platforms (e.g. SAP Ariba, TradeShift)

These provide supplier portals, purchase-order tracking, and document exchange across a multi-tier network. **Limitation:** they are enterprise-grade, expensive, and assume the manufacturer is already digitised. They offer no consumer-facing marketplace, no per-line stock-vs-manufacture decisioning, and no AI quotation estimate. WoodVerse is a single-product, small-business-oriented platform where the vendor *is* the manufacturer.

### 3. Rule-based stock/manufacturer routers

A common pattern in inventory systems is a simple threshold rule: `if stock >= quantity then reserve else manufacture`. **Limitation:** these are brittle. They cannot handle ambiguous inputs such as "is this available off the shelf or must it be built", cannot weigh vendor approval policy against quantity, and provide no confidence estimate. WoodVerse's `/ai/stock-decision` endpoint returns a structured decision per line item with a reason string and a vendor-approval flag, and is exposed as a real HTTP endpoint rather than an inline branch.

### 4. Computer-vision product-quality and image tools

OpenCV-based pipelines check image resolution, sharpness, and dominant colours for marketplace listings. **Limitation:** most are offline scripts with no API contract. WoodVerse exposes three image endpoints (`/ai/image/validate`, `/ai/image/analyze`, `/ai/image/compare`) behind an API key, returning machine-readable JSON with brightness, contrast, sharpness, edge density, k-means dominant colours, and a furniture/room heuristic.

### Feature-by-feature comparison

| Feature | Generic LLM assistant | Supply-chain platform | Rule-based router | CV image tool | **WoodVerse** |
|---|---|---|---|---|---|
| Intent routing | free-text generation | n/a | none | n/a | 11 intents, LLM + sklearn fallback |
| Order data grounded in DB | no | yes | n/a | n/a | yes, parameterised SQL only |
| Stock vs manufacture decision | no | partial | threshold rule | n/a | per-line structured decision + reason |
| AI quotation estimate | no | no | no | n/a | yes, material/quantity/size factors |
| Image validation / analysis / compare | no | no | no | script only | 3 API endpoints, JSON |
| Multi-role (customer/vendor/supplier/admin) | no | yes | no | no | yes, 5 roles |
| Offline fallback when LLM down | no | n/a | n/a | n/a | yes, scikit-learn MLP |
| API-key gated AI service | no | yes | n/a | no | yes, fail-closed 503 |

### Novelty statement

> **Unlike generic LLM assistants, supply-chain platforms, rule-based routers, and offline image scripts, WoodVerse uniquely combines intent routing with a deterministic order-reference resolver and database-grounded replies, exposes structured stock/manufacturer decisions and quotation estimates as API-key-gated HTTP endpoints, and ships an offline scikit-learn fallback so the assistant stays available when the external LLM is down.**

Every claim in this section is supported by citations [1]–[4].


---

## 3.3 Technology Adopted

### AI / ML techniques and why each fits

1. **Intent classification via an external OpenAI-compatible LLM.** Customer messages are short, colloquial, and ambiguous ("is my sofa still being made" vs "how long will manufacturing take"). A zero-shot classifier with `temperature: 0` and a `response_format: json_object` constraint labels the message into one of 11 allowlisted intents without generating an answer. This fits because the problem is *routing*, not generation: the LLM's only job is to pick a label and a confidence, and all factual content comes from the database.
2. **scikit-learn TF-IDF + MLP as an offline fallback.** When `AI_LLM_API_KEY` is unset, the LLM returns non-JSON, or the service is unreachable, the bundled pipeline (`TfidfVectorizer(ngram_range=(1,2))` → `MLPClassifier(hidden_layer_sizes=(128,64), max_iter=700)`) classifies the same message. This fits because it keeps the assistant available with zero network dependency and zero cost per request. The model is trained once at service startup (lifespan hook) and cached behind a lock.
3. **Deterministic regex order-reference extraction.** An order id is extracted with `UUID_PATTERN.search(message)` and validated with `UUID_PATTERN.fullmatch`. This fits because it is the only safe way to let a model touch order data: the model can never invent an id, so the database can never be queried for a row the caller does not own.
4. **Parameterised SQL for order reads.** `customer_id` and `order_reference` are always bound as `%s` parameters. This fits because it enforces row-level isolation — a customer can only ever read their own orders — and is immune to SQL injection regardless of what the user types.
5. **OpenCV k-means dominant-colour extraction.** A product image is resized to 96x96 and clustered with `cv2.kmeans` (K=5, KMEANS_PP_CENTERS, 3 attempts) to return the top colours as hex/RGB/percentage. This fits because vendors need a machine-readable description of a listing's palette for search, comparison, and style matching.
6. **HSV wood-tone heuristic for furniture/room detection.** A mask over hue 8–35, saturation 30–220, value 40–230 combined with Canny edge density classifies an image as likely furniture or likely a room scene. This fits because it gives the marketplace a cheap, explainable signal for whether a photo is a product shot or a styled room.
7. **HSV histogram + structural distance for image comparison.** Two images are resized to 256x256, their HSV histograms (50x60 bins) compared with `cv2.HISTCMP_BHATTACHARYYA`, and their grayscale MSE normalised, then blended as `similarity = 1 - (0.6*hist + 0.4*struct)`. This fits because it returns a single similarity score with a `sameScene` boolean, useful for duplicate detection.
8. **Rule-based scoring for customization recommendations.** Fabrics and paints are scored against preferred colours, style palette, preferred materials, finish type, and stock, with out-of-stock options scored −1. This fits because the recommendation space is small and explainable, and the reasoning string can be surfaced to the user.

### Frameworks and libraries

| Layer | Framework / library | Version (as shipped) |
|---|---|---|
| AI service | FastAPI, uvicorn | latest |
| ML | scikit-learn | latest |
| Vision | opencv-python-headless, numpy | latest |
| HTTP client | httpx | latest |
| Database | psycopg[binary], psycopg-pool | latest |
| API | Express, Socket.IO, vitest 4.1.11 | latest |
| Frontend | React 18.3.1, Tailwind CSS 3.4.17, Vite 6, lucide-react | latest |
| Auth | bcrypt, jsonwebtoken | latest |
| Data | PostgreSQL 14+ | 18.6 in test environment |

### External AI services / APIs integrated

- **External OpenAI-compatible LLM** (`AI_LLM_BASE_URL`, default `https://api.openai.com/v1`, model `gpt-4o-mini`). Used only for intent classification; never for generating order data. Fully optional — the service answers without it.
- **No other third-party AI API is integrated.** There is no computer-vision cloud service, no embedding provider, and no recommendation-as-a-service.

line1
line2

---

## 3.4 Your Approach & Analysis and Design

### High-level architecture

WoodVerse is a modular monolith organised into three runtime services plus a shared database:

```
                        ┌────────────────────────────────────────────┐
                        │                BROWSER                      │
                        │     React 18 + Tailwind + Vite (5173)      │
                        │  customer / vendor / supplier / admin      │
                        └───────────┬────────────────────────────────┘
                                    │ HTTPS + Socket.IO
                                    ▼
                        ┌────────────────────────────────────────────┐
                        │          NODE / EXPRESS API (4000)         │
                        │  auth · RBAC · catalog · orders ·          │
                        │  quotations · messages · notifications     │
                        │  ai (proxy) · products · vendors · users   │
                        └──────┬───────────────────────┬─────────────┘
                               │                       │
                    x-api-key  │                       │  JWT-verified actor
                               ▼                       ▼
              ┌──────────────────────────┐   ┌──────────────────────────┐
              │   FASTAPI AI SERVICE     │   │      POSTGRESQL           │
              │   (8000)                 │   │  10 tables, 38 indexes    │
              │  intent classifier       │   │  users / vendors /        │
              │  order-status reader     │   │  products / orders /      │
              │  stock decision          │   │  quotations / messages /  │
              │  quote estimate          │   │  fabric_options /         │
              │  customization recs      │   │  paint_options /          │
              │  image validate|analyze|compare │  product_customizations / │
              └──────────────────────────┘   │  customization_requests   │
                                             └──────────────────────────┘
```

### Data flow for the primary use case — "track my order"

1. **Client.** The customer types a message in `ChatbotPage.jsx` and the React layer calls `apiRequest("/api/ai/chat", { method: "POST", body: { message, context } })`. The hand-written fetch wrapper injects `Authorization: Bearer <token>` from `localStorage`.
2. **API gateway.** `routes/ai.js` strips any client-supplied `actorId`/`actorRole` and overwrites them with the values decoded from the verified JWT (`request.user.id`, `request.user.role`). The payload is forwarded to the AI service.
3. **AI service.** `main.py:chat()` calls `classify(message)`. If the LLM is configured it is asked for a JSON label only; otherwise the scikit-learn MLP is used. An order id is extracted by regex, never from the model.
4. **Database read.** `order_status.load_order_status()` binds `customer_id` and the validated `order_reference` as SQL parameters and reads `orders` joined to `vendors`.
5. **Rendering.** `replies.render_order_reply()` formats the reply from the returned row. No free-text generation occurs over order data.
6. **Fallback.** If the AI service is offline, `callAiService()` throws after an 8-second timeout (`AI_SERVICE_TIMEOUT_MS`) and the API returns `fallbackChatResponse(message)`.

### Core functional requirements / use cases

| Use case | Endpoint | Behaviour |
|---|---|---|
| Chat assistant | `POST /api/ai/chat` | Intent routing + order-status reply from DB |
| Stock vs manufacture decision | `POST /api/ai/stock-decision` | Per-line decision with reason and vendor-approval flag |
| Quotation estimate | `POST /api/ai/quote-estimate` | Material × quantity × custom-size price |
| Customization recommendations | `POST /ai/customization-recommendations` | Ranked fabrics and paints with reasoning |
| Image validation | `POST /ai/image/validate` | Size, format, orientation, file-size checks |
| Image analysis | `POST /ai/image/analyze` | Dominant colours, brightness, sharpness, furniture/room |
| Image comparison | `POST /ai/image/compare` | Similarity score and same-scene flag |
| Order placement | `POST /api/orders` | Server-priced, ownership-enforced, duplicate-line merge |
| Catalog browsing | `GET /api/catalog` | Published products only |
| Realtime chat | Socket.IO | Vendor/supplier/customer/admin messaging |

### Non-functional requirements

- **Accuracy target:** the shipped classifier is evaluated in Section 3.7. The confidence gate (0.18) routes low-certainty turns to a bounded keyword reply rather than a wrong label.
- **Latency:** chat mean 35.7 ms (p50) on the offline path, 1.8 s mean including the 8.8 s cold-start first call; image analyse 311–617 ms; image compare 379–455 ms.
- **Scalability:** the intent model is trained once at startup and cached; the AI service is stateless apart from that model; the API falls back deterministically when the AI service is down.
- **Security:** every `/ai/*` endpoint requires `x-api-key` and fails closed with 503 when `AI_SERVICE_API_KEY` is unset or a placeholder; JWT auth with role-based access control on all mutating routes; server-side pricing so a caller cannot forge a total; parameterised SQL everywhere.


---

## 3.5 Implementation

### Module: intent classifier (`backend/ai-service/src/nlu.py`)

The classifier is the heart of the assistant. It exposes `classify(message) -> NluResult` with fields `intent`, `order_reference`, `confidence`, `source`, and `needs_order_data`.

```python
# backend/ai-service/src/nlu.py:295
def classify(message: str) -> NluResult:
    deterministic_reference = extract_reference_from_text(message)   # regex only
    if llm_configured():
        try:
            parsed = parse_llm_json(call_llm(message))
            intent, confidence = validate_llm_result(parsed)
            return NluResult(intent=intent, order_reference=deterministic_reference, ...)
        except (LlmUnavailableError, ValueError, json.JSONDecodeError):
            pass
    result = classify_with_sklearn(message)
    return NluResult(intent=result.intent, order_reference=deterministic_reference, ...)
```

Key design points:
- The order reference is **always** extracted by regex and is **never** supplied by the model, so a hallucinated id cannot widen the caller's scope.
- The LLM is called with `temperature: 0`, `response_format: json_object`, and a system prompt that says "You never answer questions and you never state order data."
- If the LLM reply is not valid JSON, the intent is not on the allowlist, or the service is unreachable, the code falls back to the offline model rather than guessing.
- `validate_llm_result()` rejects any intent not in `ALLOWED_INTENTS` and clamps confidence to `[0, 1]`.

### Module: order status reader (`backend/ai-service/src/order_status.py`)

```python
# backend/ai-service/src/order_status.py:184
def load_order_status(customer_id, order_reference=None, message=""):
    rows = query(ORDER_SELECT + "WHERE o.customer_id = %s AND o.id = %s", (customer_id, reference))
```

`customer_id` is always bound as a parameter. `order_reference` is validated with `UUID_PATTERN.fullmatch` before binding, so a malformed reference returns `unavailable/invalid_reference` instead of reaching SQL. Seven statuses map to `STATUS_METADATA` with a label, progress percentage, and next step.

### Module: reply renderer (`backend/ai-service/src/replies.py`)

`render_order_reply()` formats the reply from the row only. For an unavailable database it says so honestly rather than fabricating an LKR figure; for a not-found reference it prompts the user to resend the reference.

### Module: image analysis (`backend/ai-service/src/main.py`)

`decode_base64_image()` strips a `data:` prefix, decodes base64, and calls `cv2.imdecode`. `kmeans_dominant_colors()` returns the top 5 colours. `classify_furniture_or_room()` computes brightness, contrast, Laplacian sharpness, Canny edge density, and the wood-tone mask ratio. All three image endpoints require the API key.

### Module: stock decision (`backend/ai-service/src/main.py:141`)

`classify_stock_item()` compares `extract_available_quantity(item)` against the requested quantity and returns `decision: "stock" | "manufacture"` plus `vendorApprovalRequired`, `productionTrackingRequired`, and a `nextStep` string.

### Module: API gateway (`backend/api/src/routes/ai.js`)

`buildAiPayload()` overwrites client-supplied `actorId`/`actorRole` with the JWT-decoded values. `callAiService()` uses an `AbortController` with an 8-second timeout; on failure the route returns `fallbackChatResponse()`.

### Module: order placement (`backend/api/src/utils/helpers.js`)

`parseOrderItems()` accepts only product ids and integer quantities. Price, vendor, name, and stock are looked up in the `products` table, so a caller cannot forge them. Duplicate product lines are merged. Delivery (LKR 7,500) and assurance (LKR 3,500) fees are server constants.

### Dataset

The project ships a schema (`database/schema.sql`, 138 lines, 10 tables, 38 indexes) and a first-run seed (`database/seed.sql`, 62 lines, 3 accounts, 2 vendors, 9 published products). The seed is idempotent (`ON CONFLICT DO NOTHING`). There is no separate training dataset for the intent model: the 73 examples are embedded in `nlu.py:TRAINING_EXAMPLES` across 10 intents.

| Field | Value |
|---|---|
| Source | Hand-written examples in `src/nlu.py` |
| Size | 73 training examples across 10 intents |
| Key features | Intent label, example phrasings |
| Classes | `order_tracking, delivery, product_search, payment, stock_manufacture, production, realtime_chat, returns, account, vendor_supplier, general_help` |
| Cleaning / augmentation | None applied — examples are curated, not scraped |
| Train/validation/test split | No split; the model is evaluated on a separate 41-message held-out probe (Section 3.7) |

### Codebase size

| Area | Lines |
|---|---|
| `frontend/src` (78 .jsx, 21 .js) | 16,089 |
| `backend/api/src` (12 route files) | 1,256 |
| `backend/ai-service/src` (8 .py modules) | 1,522 |
| `database/*.sql` | 199 |
| Documentation (`docs/`, 102 .md) | extensive |


---

## 3.6 Testing

### Test types actually used

| Type | Tool | Where | Result |
|---|---|---|---|
| Unit | pytest (95 functions, 118 collected) | `backend/ai-service/tests/` | 118/118 passed against a live database |
| Unit | vitest (156 cases) | `frontend/src/test/` | 156/156 passed |
| Integration | vitest (33 cases, real Express routers + real `pg.Pool`) | `backend/api/tests/` | 33/33 passed against a live database |
| System / end-to-end | shell scripts | `backend/api/tests/checkout.e2e.sh`, `backend/ai-service/tests/e2e.sh` | 14/14 assertions passed |

All suites were executed by the author against a live PostgreSQL 18.6 instance (`woodverse_test` database, schema loaded from `database/schema.sql`, seeded from `database/seed.sql`). The AI service suite was also run without a database to confirm the skip behaviour: **96 passed, 22 skipped**.

### Test case table — AI service (representative rows)

| Test ID | Input | Expected | Actual | Status |
|---|---|---|---|---|
| `test_nlu::classify_sklearn_routes_known_phrasing` | "track my order" | intent `order_tracking`, source `sklearn-neural-mlp` | intent `order_tracking`, conf 0.999 | PASS |
| `test_nlu::classify_ignores_hallucinated_order_id` | LLM returns id `deadbeef` while user typed `a7e2750f...` | order_reference = user-typed id only | user-typed id preserved | PASS |
| `test_nlu::classify_falls_back_when_llm_returns_non_json` | LLM replies prose | source `sklearn-neural-mlp` | fallback used | PASS |
| `test_order_status::test_customer_cannot_read_another_customers_order` | customer B asks about customer A's order | `scope: not_found` | `not_found` | PASS |
| `test_order_status::test_malformed_reference_never_reaches_sql` | `' OR 1=1 --` | `unavailable/invalid_reference`, no SQL executed | no SQL executed | PASS |
| `test_chat_endpoint::test_never_reveals_another_customers_order` | signed-in customer asks chatbot | reply contains only their own order | only own order shown | PASS |
| `test_chat_endpoint::test_reply_never_contains_a_model_invented_status` | LLM fabricates a status | reply uses only SQL-returned status | SQL status used | PASS |
| `test_chat_endpoint::test_ignores_a_client_supplied_actor_id` | client sends `actorId` | JWT-decoded id used instead | JWT id used | PASS |
| `test_llm_transport::test_call_llm_sends_temperature_zero_json` | mock server | temperature 0, json_object format, Bearer auth | verified | PASS |
| `test_chat_endpoint::test_anonymous_caller_is_told_to_sign_in` | no `actorId` | "Sign in to your account..." | signed-out reply | PASS |

### Test case table — API gateway (representative rows)

| Test ID | Input | Expected | Actual | Status |
|---|---|---|---|---|
| `orders.checkout::order_ignores_client_total_amount` | client sends `totalAmount: 1` | server computes 245000 + 7500 + 3500 = 256000 | 256000 | PASS |
| `orders.checkout::out_of_stock_line_requires_manufacturing` | qty 9, stock 3 | `requires_manufacturing: true`, `vendor_approval` | correct | PASS |
| `orders.checkout::duplicate_lines_are_merged` | same product × 3 lines | single line, qty 3, subtotal 735000 | merged | PASS |
| `orders.checkout::sql_injection_in_id_is_400` | `id: "1; DROP TABLE orders"` | 400, no row inserted | 400 | PASS |
| `orders.checkout::customer_sees_only_their_own_orders` | customer A `GET /api/orders` | only A's orders | only A's | PASS |
| `orders.checkout::wrong_password_is_401` | bad password | 401, no token | 401 | PASS |
| `orders.checkout::pending_vendor_is_403` | pending account login | 403 | 403 | PASS |
| `ai.identity::client_actor_id_is_overwritten_from_jwt` | client sends `actorId` | payload uses JWT id | JWT id used | PASS |
| `ai.identity::orders_scoped_to_caller` | customer A `GET /api/ai/orders` | contains ORDER_A, not ORDER_B | scoped | PASS |

### Overall result summary

> **118/118 AI service tests passed (100%), 33/33 API integration tests passed (100%), 156/156 frontend tests passed (100%), and the end-to-end checkout script passed all 14 assertions. Combined: 307 automated test cases, 307 passed.**

TEST_APPEND_OK
---

## 3.7 Evaluation

