# WoodVerse — AI-Assisted Multi-Vendor Woodcraft Platform

**Project:** WoodVerse (monorepo: React + Vite frontend, Node/Express API, FastAPI AI service, PostgreSQL)
**Author:** Dimalsha Kinkini
**Repository:** `/home/kinkini/Desktop/WOODVERSE_LINK-main`
**Status:** Working implementation, 45 commits, 2026-07-29 → 2026-10-04
**Report date:** 2026-10-04

---

## 3.1 Introduction

WoodVerse is an AI-assisted multi-vendor e-commerce and production platform for furniture, wooden products, wooden gifts, laser-cut files, indoor plants, and custom fabrication. It serves five roles — **customer, vendor/seller, supplier, support staff, and system administrator** — across four distinct surfaces: a customer marketplace, a vendor portal (16 pages), a supplier portal (12 pages), and an admin console (10 pages), all backed by one PostgreSQL schema of 10 tables.

### The real-world problem

A customer buying hand-made wooden furniture in Sri Lanka cannot see who actually made the piece, cannot judge whether it is genuinely in stock or will be manufactured to order, and cannot get a live status without emailing a vendor and waiting. Vendors and suppliers, meanwhile, have no shared tool to coordinate quotations, stock-versus-make decisions, and production progress across a fragmented supply chain. The result is three concrete failures: **price uncertainty** (the customer cannot tell what a bespoke piece will cost before committing), **long order cycles** (status lives in email threads rather than in a system of record), and **rework** (orders arrive with quantities and specifications that were never validated).

The importance of this problem is well established in the literature. Zhou [1] identifies product, vendor and transaction transparency as significant antecedents of perceived information transparency in B2C e-commerce, and finds that perceived transparency significantly increases online purchase intention, with perceived risk partially mediating the effect. Frizzo and Dias [2] show across three experimental studies that a handmade production method raises purchase intention and willingness to pay a premium, mediated by perceived naturalness and authenticity — so *who made it and how* is a purchase driver, not a footnote. Razaq et al. [3] document the other side of the same market: interviewing 18 sellers on Etsy, they find the platform imposes substantial invisible work in defining and defending "handmade" and in tracking shifting platform policies.

The domain also carries a specific AI risk that naive chatbot adoption would worsen. Shuster et al. [5] show that state-of-the-art dialogue models continue to produce factually incorrect responses, and that the failure is not resolved by scaling model size or training data. Li et al. [6] quantify the same factuality-hallucination problem across the HaluEval 2.0 benchmark. Most directly, Larsen et al. [4] adapt a hallucination taxonomy to customer service and survey 274 potential end-users, finding that every hallucination type can undermine user trust, and that hallucinations supplying wrongful information are judged especially problematic.

WoodVerse addresses both halves. Every order reply names the vendor and states the true stock-or-manufacture decision. Because the AI is only permitted to choose a *label* and never to write an answer over order data, the hallucination mode documented in [4]–[6] does not apply to order status by construction rather than by mitigation.

### Aim

> **Solve the trust-and-coordination gap in multi-vendor wooden-product commerce using an AI-assisted platform whose intent-routing chatbot classifies user requests, resolves order references deterministically, and renders every order status from a live database.**

### Objectives

1. **Build** a five-role platform (marketplace, vendor portal, supplier portal, admin console) exposing 32 HTTP endpoints — 24 API paths served by 23 route handlers, plus 8 AI-service endpoints — over a single PostgreSQL schema of 10 tables.
2. **Implement** an intent-routing chatbot that classifies a customer message into 1 of 11 allowlisted intents and answers order-status questions only from live database rows — never from generated text.
3. **Implement** AI-assisted stock-versus-manufacture decisioning and quotation estimation, returning a per-line structured decision with a reason string and a vendor-approval flag.
4. **Enforce** security in depth: JWT authentication, role-based access control, server-side pricing, API-key-gated AI endpoints, and fail-closed 503 behaviour when configuration is missing or placeholder.
5. **Achieve** a passing automated test suite across three layers — 118 pytest cases in the AI service, 156 frontend cases, and 49 API integration cases — plus a documented end-to-end checkout path.

### Solution overview

- **Users:** customers browsing the marketplace and placing orders; vendors managing products, quotations, orders, inventory, warehouses, production tracking, and shipments; suppliers handling purchase orders, materials, and shipments; support staff and administrators overseeing approvals, payments, and system settings.
- **Input:** natural-language chat messages, base64-encoded product images, shopping-cart line items, quotation requests, and customization preferences (fabric, paint, finish, dimensions).
- **Output:** chat replies carrying an intent label, confidence score, and suggestions; order status as a label, progress percentage, total, vendor, and next step; per-line stock/manufacture decisions; quotation estimates; and image validation, analysis, and comparison reports as JSON.
- **Process:** a React frontend calls a Node/Express API which overwrites any client-supplied actor identity with JWT-decoded values, then proxies to a FastAPI AI service. The AI service classifies intent (external OpenAI-compatible LLM at `temperature: 0`, falling back to a scikit-learn TF-IDF + MLP classifier), extracts order references with a deterministic UUID regex, and reads order rows through parameterised SQL. Images are decoded and analysed with OpenCV (k-means dominant colours, HSV wood-tone heuristics, Canny edge density, Laplacian sharpness).
- **Technology:** React 18 + Tailwind CSS + Vite; Node.js + Express + Socket.IO; Python + FastAPI; scikit-learn (`TfidfVectorizer(ngram_range=(1,2))` → `MLPClassifier(hidden_layer_sizes=(128,64))`); OpenCV (`cv2.kmeans` with `KMEANS_PP_CENTERS`); PostgreSQL (10 tables); JWT auth; bcrypt hashing.

### Report structure

Section 3.2 surveys related work. Section 3.3 names the AI techniques and frameworks. Section 3.4 describes the architecture and data flow. Section 3.5 covers implementation. Section 3.6 reports testing. Section 3.7 presents evaluation with measured results. Section 3.8 concludes. Section 4 lists references.


---

## 3.2 Review of Others' Work

Four categories of existing system were surveyed against the same problem: general-purpose LLM store assistants, retrieval-augmented customer-support systems, handmade/craft marketplaces, and enterprise supply-chain visibility platforms.

### 1. General-purpose LLM store assistants

Commercial store assistants accept a free-text message and generate a natural-language answer — including order status — directly from a language model, with no retrieval step and no database in the loop. This is the approach most obviously adjacent to WoodVerse, and it is the one the literature warns about most directly. Shuster et al. [5] document that state-of-the-art dialogue models continue to produce factually incorrect responses, and show that this failure is not resolved by scaling model size or training data. Li et al. [6] quantify the same problem across a dedicated factuality-hallucination benchmark (HaluEval 2.0) and evaluate a range of detection and mitigation techniques against it. Most importantly for this domain, Larsen et al. [4] adapt a hallucination taxonomy specifically to customer service and survey 274 potential end-users, finding that **every** hallucination type can undermine user trust and that hallucinations supplying wrongful information are judged especially problematic.

**Limitation — accuracy:** these systems can state a total, a date, or a shipment number that does not exist, and in a domain where the customer is committing to a five-figure bespoke piece, a fabricated delivery date is commercially destructive. There is also no scope limit: the model has no way to know whose order it is discussing, so there is no structural guarantee of data isolation. WoodVerse removes this failure mode rather than mitigating it — the LLM is permitted to select an intent label and nothing else, the order reference is extracted by regex rather than generated, and every factual value is rendered from a parameterised SQL row (`main.py:252`, `order_status.py:184`).

### 2. Retrieval-augmented generation (RAG) support systems

RAG was introduced by Lewis et al. [8] and is now the standard recipe for factual assistants: retrieve relevant passages from an external store, then condition the generator on them. Gao et al. [9] survey the paradigm and its variants and are explicit that RAG *reduces* rather than removes hallucination — the generator can still "produce content not supported by the retrieved context."

**Limitation — automation level:** RAG still asks a generative model to *write* the answer over retrieved text. That means correctness is probabilistic and depends on retrieval precision, which Gao et al. [9] identify as a persistent weakness (misaligned or irrelevant chunks, missing crucial information). For an order status there is exactly one correct rendering, and it is already sitting in a relational row — so paying a language model to paraphrase it adds failure modes and removes none. WoodVerse uses a deliberately weaker contract: classify the turn, then render. There is no generation step over order data at all.

### 3. Handmade and craft marketplaces (e.g. Etsy, Amazon Handmade)

The closest commercial analogue to WoodVerse's market. Razaq, Kolko and Hsieh [3] interviewed 18 Etsy sellers and identify three broad categories of *invisible work* the platform imposes: negotiation and articulation work to define and defend "handmade", uncompensated work to understand IP rules, and constant work to track shifting platform algorithms and policies. Sellers reported spending up to two hours on a single listing, and described analytics misaligned with the nature of a handmade business as a source of anxiety.

The demand side is well documented too. Frizzo and Dias [2] show across three experimental studies that a handmade production method raises purchase intention and willingness to pay a premium, mediated by perceived naturalness and authenticity. Zhou [1] identifies product, vendor and transaction transparency as significant antecedents of perceived information transparency, which in turn significantly increases online purchase intention, with perceived risk partially mediating the effect.

**Limitation — scope and automation:** these platforms solve *discovery and trust*, not *coordination and fulfilment*. Listings are static; there is no system of record for whether an item is in stock or queued for manufacture, no quotation workflow, and no production tracking. Status lives in the platform's messaging inbox, which Razaq et al. [3] report sellers find inadequate at volume. Transparency is achieved by *disclosure* (photos, descriptions, seller badges) rather than by *grounding* — the buyer is asked to trust the listing, not shown the record.

### 4. Enterprise supply-chain visibility platforms and control towers

SAP Ariba and comparable procurement suites, plus modern control-tower architectures, provide multi-tier supplier portals, purchase-order tracking and document exchange. A Delphi study of supply-chain-visibility priorities [11] found that **real-time visibility for better predictability emerged as the single top priority**, above forecasting, and that without visibility "supply chain actors must act on incomplete, inaccurate and outdated information" that produces forecast errors, bullwhip effects and mis-sized inventory. Dell'Orto et al. [12] formalise this as a four-level control-tower maturity model in which Level 1 is basic stock and transport visibility. The financial stakes are quantified by Ponte [13], who shows that both the mean and the *variability* of production and shipping lead times carry measurable cost across multi-echelon supply chains.

The classical baseline beneath these platforms is threshold routing: `if stock >= quantity then reserve else manufacture`. It is embedded in standard MRP logic.

**Limitation — cost and scope:** control towers are enterprise-grade and assume the manufacturer is already digitised and EDI-connected [11][12]. A single Sri Lankan furniture workshop with a phone and a bench is not that buyer. The threshold rule is also brittle in exactly WoodVerse's domain: it cannot interpret "is this available off the shelf or must it be built", cannot weigh vendor approval policy against quantity, and returns no confidence estimate or reason string. WoodVerse targets the small-vendor case where the vendor *is* the manufacturer, and returns a structured per-line decision with an explicit reason.

### Feature-by-feature comparison

| Capability | LLM store assistant [4][5][6] | RAG assistant [8][9] | Craft marketplace [1][2][3] | SCV platform / control tower [11][12][13] | **WoodVerse** |
|---|---|---|---|---|---|
| Answers order-status questions | yes, generated | yes, generated over passages | no (inbox/manual) | yes (B2B, not consumer) | yes, rendered from SQL row |
| Hallucinated order data possible | yes [4][5][6] | yes, reduced not removed [9] | n/a | n/a | **no — generation step removed** |
| Intent routing | implicit in generation | retrieval-driven | no | no | 11 allowlisted intents + confidence |
| Order reference source | model-generated | model-generated | n/a | system id | **regex only, never the model** |
| Per-line stock-vs-make decision | no | no | no | threshold rule (MRP) | structured decision + reason + approval flag |
| Quotation estimate | no | no | seller-set price | no | material × quantity × size |
| Consumer-facing marketplace | yes | no | yes | no | yes |
| Multi-role (customer/vendor/supplier/admin) | no | no | seller/buyer only | supplier/buyer only | yes, 5 roles over 10 tables |
| Offline operation when LLM unavailable | no | no | n/a | n/a | yes, scikit-learn MLP fallback |
| Failure mode on config error | n/a | n/a | n/a | n/a | fail-closed 503 |

### Novelty statement

> **Unlike general-purpose LLM store assistants, retrieval-augmented support systems, handmade marketplaces, and enterprise supply-chain visibility platforms, WoodVerse uniquely removes the generative step from order-status answering altogether — a regex-extracted, user-typed order reference combined with parameterised SQL makes hallucinated order data structurally impossible, while per-line stock-versus-manufacture decisions, quotation estimates, and computer-vision listing analysis are exposed as API-key-gated HTTP endpoints in the same service, with a bundled scikit-learn fallback so the assistant stays available when the external LLM is down.**

Every claim in this section is backed by references [1]–[13] in Section 4.


---

## 3.3 Technology Adopted

### AI / ML techniques and why each fits

1. **Intent classification via an external OpenAI-compatible LLM.** Customer messages are short, colloquial, and ambiguous ("is my sofa still being made" vs "how long will manufacturing take"). A zero-shot classifier with `temperature: 0` and a `response_format: json_object` constraint labels the message into one of 11 allowlisted intents without generating an answer. This fits because the problem is *routing*, not generation: the LLM's only job is to pick a label and a confidence, and all factual content comes from the database.
2. **scikit-learn TF-IDF + MLP as an offline fallback.** When `AI_LLM_API_KEY` is unset, the LLM returns non-JSON, or the service is unreachable, the bundled pipeline (`TfidfVectorizer(ngram_range=(1,2))` → `MLPClassifier(hidden_layer_sizes=(128,64), max_iter=700)`) classifies the same message. This fits because it keeps the assistant available with zero network dependency and zero cost per request. The model is trained once at service startup (lifespan hook) and cached behind a lock.
3. **Deterministic regex order-reference extraction.** An order id is extracted with `UUID_PATTERN.search(message)` and validated with `UUID_PATTERN.fullmatch`. This fits because it is the only safe way to let a model touch order data: the model can never invent an id, so the database can never be queried for a row the caller does not own.
4. **Parameterised SQL for order reads.** `customer_id` and `order_reference` are always bound as `%s` parameters. This fits because it enforces row-level isolation — a customer can only ever read their own orders — and is immune to SQL injection regardless of what the user types.
5. **OpenCV k-means dominant-colour extraction.** A product image is resized to 96x96 and clustered with `cv2.kmeans` (K=5, `KMEANS_PP_CENTERS`, 3 attempts) to return the top colours as hex/RGB/percentage (`main.py:537`). k-means with k-means++ seeding is the classical choice for palette reduction [14], and colour quantization has been a standard vision problem for decades [15]. This fits because vendors need a machine-readable description of a listing's palette for search, comparison, and style matching, and k-means gives an unsupervised answer with no training data and no model download — the whole routine runs in-process via OpenCV [16].
6. **HSV wood-tone heuristic for furniture/room detection.** A mask over hue 8–35, saturation 30–220, value 40–230 combined with Canny edge density classifies an image as likely furniture or likely a room scene. This fits because the target concept — "is this a product shot or a styled room" — is a decision about *colour statistics*, not object identity. A learned detector (CNN/YOLO) would need a labelled image corpus this project does not have, would add a model-weight download to a service whose entire startup budget is 2.19 s, and would return a score with no explanation. The hue window encodes the domain knowledge directly: teak, walnut, mahogany and satinwood all fall in that band, so the rule is cheap, auditable, and defensible to a vendor who disputes a result.
7. **HSV histogram + structural distance for image comparison.** Two images are resized to 256x256, their HSV histograms (50×60 bins) compared with `cv2.HISTCMP_BHATTACHARYYA` (`main.py:731`), and their grayscale MSE normalised, then blended as `similarity = 1 − (0.6·hist + 0.4·struct)`. This fits because duplicate and near-duplicate listing detection is a *similarity* problem, not a classification problem: there is no fixed label set, so a metric is the correct instrument. Blending a colour term with a structural term avoids the failure mode of histogram-only comparison, where two photos of the same chair in different lighting score as identical.
8. **Rule-based scoring for customization recommendations.** Fabrics and paints are scored against preferred colours, style palette, preferred materials, finish type, and stock, with out-of-stock options scored −1. This fits because the option space is small (a fixed `fabric_options` / `paint_options` table), fully enumerable, and every factor is an explicit attribute — so a weighted score is both sufficient and explainable, and the reasoning string can be surfaced to the user. A collaborative-filtering or embedding-based recommender would need interaction data the platform has none of yet.

### Frameworks and libraries

| Layer | Framework / library | Version (as shipped) | Role |
|---|---|---|---|
| AI service | FastAPI | latest | ASGI app hosting the 8 `/ai/*` endpoints |
| AI service | uvicorn[standard] | latest | ASGI server; Railway start command |
| ML | scikit-learn | latest | `TfidfVectorizer` + `MLPClassifier` intent pipeline |
| Vision | opencv-python-headless | latest | k-means, HSV, Canny, Laplacian, histogram compare |
| Numerics | numpy | latest | array handling for image buffers |
| LLM transport | httpx | latest | async client for the external LLM call |
| DB driver (AI svc) | psycopg[binary], psycopg-pool | latest | parameterised SQL + pooled connections |
| API runtime | Node.js | ≥ 22.9.0 (`engines`) | ESM runtime for the API |
| API framework | Express | ^4.19.2 | 24 REST paths from 23 route handlers |
| Realtime | Socket.IO | ^4.8.3 | server side of vendor/supplier/customer messaging |
| DB driver (API) | pg | ^8.22.0 | pooled PostgreSQL client |
| Security | helmet | ^8.3.0 | HTTP security headers (`server.js:36`) |
| Security | express-rate-limit | ^8.6.2 | separate auth and API limiters (`server.js:83,93`) |
| Security | cors | ^2.8.6 | origin allowlist incl. the Vercel frontend |
| Auth | jsonwebtoken | ^9.0.3 | sign/verify JWTs |
| Auth | bcryptjs | ^3.0.3 | cost-12 password hashing |
| Frontend | React / React DOM | ^18.3.1 | 47 screens / 38 distinct page components across 4 portals (inventory in §3.5.2) |
| Frontend | react-router-dom | ^7.18.2 | client-side routing per role |
| Frontend | Vite | ^6.0.7 | dev server and production build |
| Styling | Tailwind CSS | ^3.4.17 | utility-first styling |
| Icons | lucide-react | ^0.468.0 | icon set |
| Realtime client | socket.io-client | ^4.8.3 | browser side of messaging |
| Testing | vitest | ^4.1.11 | frontend and API test runner |
| Testing | @testing-library/react, jest-dom, user-event | ^16.3.2 / ^7.0.1 / ^14.6.5 | DOM assertions |
| Testing | jsdom | ^30.0.1 | DOM environment for vitest |
| Testing | pytest | via `npm run test:ai` | AI service suite |
| Orchestration | concurrently | ^8.2.2 | runs all three services in local dev |

### External AI services / APIs integrated

- **External OpenAI-compatible LLM** (`AI_LLM_BASE_URL`, default `https://api.openai.com/v1`, model `gpt-4o-mini`). Called via `httpx` at `temperature: 0` with `response_format: json_object`. Used **only** for intent classification; never for generating order data. Fully optional — if `AI_LLM_API_KEY` is unset the service classifies with the bundled scikit-learn model instead, so there is no hard runtime dependency on any third-party AI provider.
- **No other third-party AI API is integrated.** There is no computer-vision cloud service, no embedding provider, and no recommendation-as-a-service. All ML and vision inference runs in-process on Railway.

### Infrastructure and platform technologies

| Layer | Platform | Configuration | Role |
|---|---|---|---|
| Frontend hosting | **Vercel** | `frontend/vercel.json` | Serves the built SPA; rewrites `/api/*` to the Railway API so the browser makes same-origin requests in production; SPA fallback rewrite to `index.html` |
| Backend + AI hosting | **Railway** | `railway.json` (Nixpacks builder) | Two services from one config: `woodverse-api` (`npm ci` → `npm start`, health `/api/health`) and `woodverse-ai` (`pip install -r requirements.txt` → `uvicorn src.main:app --host 0.0.0.0 --port $PORT`, health `/health`) |
| Database | **Supabase** (managed PostgreSQL) | `DATABASE_URL`, `SUPABASE_POOLER_HOST`, `DB_SSL` | Hosted Postgres with 10 tables; credentials supplied by Supabase and consumed as a standard connection string |
| Connection strategy | Supavisor + direct fallback | `backend/api/src/db.js:11-56` | The API builds an ordered candidate list — explicit pooler host first, then nine regional Supabase pooler endpoints (ports 6543 and 5432), then the raw URL — and fails over on connect. `dns.setDefaultResultOrder("ipv4first")` works around IPv6-first resolution failures on Railway's network |
| Connection strategy (AI svc) | psycopg-pool | `backend/ai-service/src/db.py` | `sslmode=require` when `DB_SSL=true`, otherwise `prefer`; raises `DatabaseUnavailableError` rather than proceeding unconfigured |
| Secrets | Railway + Vercel environment variables | `docs/infrastructure/ENVIRONMENT_VARIABLES.md` | `AI_SERVICE_API_KEY`, `AI_LLM_API_KEY`, `DATABASE_URL`, `SUPABASE_POOLER_HOST`, `DB_SSL`, `AI_SERVICE_TIMEOUT_MS`, `AI_LLM_TIMEOUT_SECONDS` |
| Large assets | **Git LFS** | `.gitattributes` | `*.png`, `*.jpg`, `*.jpeg` tracked via LFS so product photography does not bloat repository history |
| Cross-origin policy | Vercel ↔ Railway | `server.js:39` | `cors()` allowlist includes the Vercel production origin; committed fix "Allow Vercel frontend in CORS" |
| CI/CD | Platform-native | — | Railway and Vercel both build from git pushes. **There is no `.github/workflows`** — no separate CI pipeline is configured, and no automated test gate runs before deploy |
| Version control | Git | 45 commits, 2026-07-29 → 2026-10-04 | Single repository, monorepo layout |

**Two corrections to the project README.** `README.md:33` lists **MiDaS / DPT** in the tech stack, but no monocular depth-estimation model is imported, installed, or called anywhere in the repository — `backend/ai-service/requirements.txt` contains only the eight packages in the table above. Likewise `README.md:22` lists **three.js** as a dependency and it is present in `frontend/package.json`, but no file under `frontend/src` imports it; it is an unused dependency. Both claims are removed from this report because neither is implemented.

---

## 3.4 Your Approach & Analysis and Design

### 3.4.1 High-level architecture (component diagram)

WoodVerse is a modular monolith deployed as three runtime services plus one managed data store. The **only** permitted path from a browser to the AI is through the Node API, which is what makes JWT-derived identity binding enforceable.

```
                                  ┌──────────────────────────────────────────┐
                                  │              BROWSER  (Vercel)          │
                                  │  React 18 + Vite + Tailwind + Socket.IO  │
                                  │  ┌────────┬────────┬────────┬────────┐  │
                                  │  │Customer│ Vendor │Supplier│ Admin  │  │
                                  │  │ 13 pgs │ 20 pgs │ 14 pgs │ 14 pgs │  │
                                  │  └────────┴────────┴────────┴────────┘  │
                                  └───────┬──────────────────────┬─────────┘
                                          │ HTTPS /api/*         │ WSS Socket.IO
                                          │ (same-origin via     │
                                          │  Vercel rewrite)     │
             ┌────────────────────────────┴──────────┐           │
             │ ▼                                       │           │
┌────────────────────────────┐            ┌──────────────────────────────┐
│   NODE / EXPRESS API       │            │  SOCKET.IO HUB               │
│   (Railway · :4000)        │            │  (Railway · :4000/socket.io) │
│ ┌────────────────────────┐ │            │  vendor ↔ customer threads   │
│ │ Middleware             │ │            └──────────────────────────────┘
│ │  helmet · cors         │ │
│ │  rate-limit (auth+api) │ │
│ │  authenticateToken     │ │
│ │  authorizeRoles        │ │
│ │  isAdmin               │ │
│ └───────────┬────────────┘ │
│             │              │  12 route modules · 23 handlers / 24 paths
│  ┌──────────┼───────────┬──┴──────────┬─────────────┬──────────────┐
│  ▼          ▼           ▼             ▼             ▼              ▼
│ auth    catalog     orders       quotations     messages      notifications
│ users   products    vendors         │                             admin
│  │         │          │             │                              │
│  └─────────┴──────────┴─────────────┘                              │
│                          │                                          │
│         ┌────────────────┴─────────────┐                            │
│         │ ai (proxy)                   │                            │
│ │ buildAiPayload(): strips client     │                            │
│         │ actorId/actorRole, injects    │                            │
│         │ JWT-decoded identity          │                            │
│         └───────────────┬───────────────┘                            │
└─────────────────────────┼────────────────────────────────────────────┘
                          │ POST /ai/*  +  header `x-api-key`
                          │ AbortController · AI_SERVICE_TIMEOUT_MS (8 000 ms)
                          ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    FASTAPI AI SERVICE  (Railway · :8000)                │
│                                                                       │
│  ┌─────────────── PREPROCESSING ───────────────┐  ┌─────────────────┐ │
│  │ decode_base64_image()  strip data: prefix    │  │ verify_api_key  │ │
│  │ cv2.imdecode() → BGR ndarray                 │  │ fail-closed 503 │ │
│  │ resize 96×96 / 256×256                       │  └─────────────────┘ │
│  │ normalize_uuid(actorId)                      │                     │
│  │ UUID_PATTERN.fullmatch(order_reference)      │                     │
│  └───────────────────────┬───────────────────────┘                     │
│                          │                                             │
│  ┌───────────────────────▼─── INFERENCE ─────────────────────────────┐  │
│  │ nlu.classify()                                                 │  │
│  │   ├─ extract_reference_from_text()   ← regex, never the model   │  │
│  │   ├─ [LLM configured] call_llm()  temperature 0 · json_object   │  │
│  │   │      ↳ validate_llm_result()  allowlist + clamp [0,1]       │  │
│  │   └─ [else/failed] classify_with_sklearn()                      │  │
│  │          TfidfVectorizer(1,2) → MLPClassifier(128,64)           │  │
│  │ order_status.load_order_status()   parameterised SQL            │  │
│  │ replies.render_order_reply()       formats the row only         │  │
│  │ classify_stock_item() · quote_estimate()                        │  │
│  │ customization_recommendations() · kmeans_dominant_colors()      │  │
│  └───────────────────────────┬──────────────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │ psycopg-pool · sslmode per DB_SSL
                               ▼
              ┌────────────────────────────────────────────┐
              │      SUPABASE (managed PostgreSQL)         │
              │  users · vendors · products · orders       │
              │  quotations · messages · fabric_options    │
              │  paint_options · product_customizations    │
              │  customization_requests                    │
              │  10 tables · 12 CREATE INDEX + 2 UNIQUE   │
              └────────────────────────────────────────────┘
```

**Module responsibilities and the connections between them**

| Module | Responsibility | Connects to | Direction of data |
|---|---|---|---|
| `frontend/src` (47 screens) | Renders 4 role portals; collects message text, cart lines, base64 images. Holds the JWT in `localStorage`. | API via `apiRequest()`; AI service **never** | → outbound HTTPS only |
| `middleware/auth.js` | Verifies JWT, populates `request.user`, enforces role allowlists. | Every protected route | ← inbound, mutates request |
| `routes/ai.js` | **Identity boundary.** `buildAiPayload()` (line 15) destructures away `actorId`/`actorRole` and reinjects the JWT-decoded values. Proxies to AI service with an 8 s `AbortController`. | AI service, `fallbackChatResponse()` | ↔ outbound request, inbound response |
| `routes/orders.js` + `utils/helpers.js` | Server-side pricing. `parseOrderItems()` accepts only product id + integer quantity; price/vendor/name/stock are read from `products`, so no total can be forged. Adds `DELIVERY_FEE` 7 500 and `ASSURANCE_FEE` 3 500. Merges duplicate lines. | `products`, `orders` | ↔ SQL |
| `routes/*.js` (catalog, products, quotations, messages, vendors, users, notifications) | CRUD for the marketplace and portals; `GET /api/catalog` returns `status='published'` rows only. | PostgreSQL | ↔ SQL |
| `socket.js` | Realtime vendor↔customer↔supplier↔admin messaging. | Frontend client | ↔ WebSocket |
| **AI service `main.py`** | 8 `/ai/*` endpoints, every one gated by `Depends(verify_api_key)`. | Node API only | ↔ HTTP |
| **AI service `nlu.py`** | Intent routing + regex reference extraction + confidence gate (`_MIN_CONFIDENCE = 0.18`). | LLM (optional), scikit-learn | → classification only |
| **AI service `order_status.py`** | The **sole** reader of order rows. Binds `customer_id` and the `fullmatch`-validated reference as SQL parameters. | PostgreSQL | ← SQL read |
| **AI service `replies.py`** | Renders the human-readable reply *from the row only*. | `order_status.py` | ← in-process |
| **Supabase** | System of record for all 10 tables. | `db.js` (pg pool), `db.py` (psycopg-pool) | ← reads + writes |

### 3.4.2 Use case diagram

```
                        ┌──────────────────────────────────────────┐
                        │                 WoodVerse                 │
   ┌──────────┐         │                                          │
   │ Customer │────────►│  (UC-1) Browse published catalog         │
   └────┬─────┘         │  (UC-2) Place order (server-priced)      │
        │               │  (UC-3) Ask assistant about an order   ┐  │
        │               │  (UC-4) Pay / view delivery status     │  │
        │               │  (UC-5) Request customization options  │  │
        │               └───────────────────────────────────────┼──┘
        │                                                       │
┌───────┴────────┐   ┌──────────────────────────────────────────┐
│ Vendor / Seller│──►│  (UC-6) Manage product listings           │
└───────┬────────┘   │  (UC-7) Respond to quotation request      │
        │            │  (UC-8) Fulfil order: reserve or manufacture│
        │            │  (UC-9) Update production progress         │
        │            │  (UC-10) Manage inventory / warehouses     │
        │            │  (UC-11) Dispatch shipments                │
        │            └──────────────────────────────────────────┘
┌───────┴────────┐   ┌──────────────────────────────────────────┐
│    Supplier    │──►│  (UC-12) Acknowledge purchase order       │
└────────────────┘   │  (UC-13) Record material / shipment       │
                     └──────────────────────────────────────────┘
┌────────────────┐   ┌──────────────────────────────────────────┐
│ Support staff  │──►│  (UC-14) Triage messages and escalations  │
└────────────────┘   └──────────────────────────────────────────┘
┌────────────────┐   ┌──────────────────────────────────────────┐
│      Admin     │──►│  (UC-15) Approve vendors                  │
└────────────────┘   │  (UC-16) Moderate catalogue & users       │
                     │  (UC-17) Inspect payments / system health │
                     └──────────────────────────────────────────┘

   ── AI service (system actor, invoked by UC-3, UC-8, UC-13) ──
     (A-1) Classify intent into 1 of 11 allowlisted labels
     (A-2) Extract & validate order reference (regex only)
     (A-3) Read order row via parameterised SQL
     (A-4) Render reply from the row — never generate
     (A-5) Decide stock vs manufacture per line
     (A-6) Estimate quotation · rank customization options
     (A-7) Validate / analyse / compare listing images
```

### 3.4.3 Activity diagram — "track my order" (the primary AI path)

```
   [Customer types a message] e.g. "where is my sofa a7e2750f-…?"
              │
              ▼
   ┌──────────────────────────────┐
   │ Browser: apiRequest() adds   │
   │ Authorization: Bearer <JWT>  │
   └──────────────┬───────────────┘
                  ▼
   ┌──────────────────────────────┐   no    ┌────────────────────────┐
   │ authenticateToken            ├────────►│ 401 Unauthorized      │
   │ signature valid?             │         └────────────────────────┘
   └──────────────┬───────────────┘
                  │ yes
                  ▼
   ┌──────────────────────────────────────────────┐
   │ buildAiPayload(): DELETE client actorId /     │
   │ actorRole, INSERT request.user.id / .role     │
   └──────────────┬───────────────────────────────┘
                  │  POST /ai/chat  +  x-api-key
                  ▼
   ┌──────────────────────────────┐  absent/placeholder
   │ verify_api_key                ├──────────────► [ 503 · AI service not configured ]
   └──────────────┬───────────────┘
                  │ valid
                  ▼
   ┌──────────────────────────────────────────────┐
   │ extract_reference_from_text(message)          │
   │ UUID_PATTERN.search → FULLMATCH validate      │◄── the model never supplies this
   └──────────────┬───────────────────────────────┘
                  ▼
        ┌─────────────────────┐
        │ llm_configured()?   │──yes──► call_llm(temperature 0, json_object)
        └──────┬──────────────┘              │
             no │                            ▼
               │                   validate: intent ∈ ALLOWED_INTENTS?
               │                   no / non-JSON / timeout
               │                            │
               │                            ▼
               │                   classify_with_sklearn()
               │                   TF-IDF(1,2) → MLP(128,64)
               └────────────┬───────────────┘
                            ▼
                 ┌──────────────────────┐
                 │ confidence ≥ 0.18 ?  │──no──► fallback_customer_reply()
                 └──────┬───────────────┘              (bounded keyword reply,
                        │ yes                          no DB access)
                 ┌──────┴───────────────┐
                 │ needs_order_data ?   │──no──► build_reply(intent)
                 └──────┬───────────────┘              (static, intent-specific)
                        │ yes
                        ▼
                 ┌──────────────────────┐   not a UUID
                 │ normalize_uuid(actor)├────────► "Sign in to your account…"
                 └──────┬───────────────┘
                        │ valid
                        ▼
   ┌────────────────────────────────────────────────────┐
   │ load_order_status(customer_id, reference, message)  │
   │   WHERE o.customer_id = %s AND o.id = %s           │◄── both bound, never interpolated
   │   JOIN vendors                                    │
   └──────┬──────────────────────────────┬──────────────┘
          │ row found                    │ no row / no DB / malformed ref
          ▼                              ▼
   ┌────────────────────┐     ┌──────────────────────────────┐
   │ render_order_reply │     │ scope: not_found |           │
   │ status → label,    │     │  unavailable/invalid_reference│
   │ progress %, vendor,│     │ prompts user to resend ref   │
   │ total, nextStep    │     │ never invents a figure       │
   └─────────┬──────────┘     └──────────────┬───────────────┘
             └──────────────┬───────────────┘
                            ▼
   ┌────────────────────────────────────────────────────┐
   │ Any throw / >8 s timeout → Node catch               │
   │   → fallbackChatResponse(message)  [source: api-fallback]│
   └───────────────────────┬────────────────────────────┘
                           ▼
                 [Reply rendered in ChatbotPage.jsx]
```

**Direction of flow, stated plainly:** the browser sends only *intent-bearing text*; identity always travels browser → Node → AI service as a JWT-derived id, never as browser-supplied data; the AI service sends *one* outbound call, a parameterised SQL read; the database returns a row upward; rendering happens downward in `replies.py`. No component ever receives order data as free text from a model.

### 3.4.4 Sequence diagram — module call order for the same use case

```
Customer   ChatbotPage   routes/ai.js   main.py    nlu.py   order_status.py   replies.py   PostgreSQL   SQL
   │            │             │            │          │           │             │           │        │
   │ type msg   │             │            │          │           │             │           │        │
   ├───────────►│             │            │          │           │             │           │        │
   │            ├─ POST /api/ai/chat (Bearer JWT) ─►│           │             │           │        │
   │            │            │ authenticateToken → buildAiPayload (actorId ← JWT)│        │
   │            │            ├─ POST /ai/chat + x-api-key ───────►│           │           │        │
   │            │            │            ├─ classify(message) ───►│          │           │        │
   │            │            │            │          │ regex extract ref     │           │        │
   │            │            │            │          ├─ call_llm() or sklearn()       │        │
   │            │            │            │◄─────────┤ NluResult(intent, ref, conf)   │        │
   │            │            │            ├─ is_confident? (≥0.18)   │           │        │
   │            │            │            ├─ load_order_status(actor, ref) ───────►│        │
   │            │            │            │          │           ├─ SELECT … WHERE customer_id=%s AND id=%s ─►│
   │            │            │            │          │           │◄────────── row ──────────────────────┤
   │            │            │            ├─ render_order_reply(row) ───────────►│        │
   │            │            │◄───────────┤ ChatResponse{reply,intent,confidence,suggestions,orderData}│
   │◄───────────┴─ render ───┤            │            │          │           │             │           │        │
```

### 3.4.5 Data store design (logical)

```
   ┌────────────────┐        ┌────────────────┐        ┌────────────────┐
   │      users     │1      1│     vendors    │1      *│    products    │
   │  id (UUID PK)  │───────►│  user_id (U)   │───────►│  vendor_id (FK)│
   │  email (UNIQUE)│        │  business_name │        │  name·material │
   │  password_hash │        │  verification_ │        │  price·stock_  │
   │  role·status   │        │  status        │        │  quantity      │
   └───────┬────────┘        └────────────────┘        │  status        │
           │                                             └───────┬────────┘
           │ 1                                                  │ 1
           │                                                     │ *
           │  ┌──────────────────┐    ┌──────────────────┐       │
           └─►│      orders      │    │   quotations     │◄──────┘
              │  id (UUID PK)    │    │  id (UUID PK)    │
              │  customer_id (FK)│    │  vendor_id (FK)  │
              │  vendor_id (FK)  │    │  status·amount   │
              │  status·total_   │    └──────────────────┘
              │  amount          │    ┌──────────────────┐
              │  requires_manuf. │    │    messages      │
              │  fulfillment_    │    │  id (UUID PK)    │
              │  plan (JSONB)    │    │  thread_id       │
              └──────────────────┘    │  sender_id       │
                                      └──────────────────┘
   ┌──────────────────┐  ┌──────────────────┐   ┌──────────────────────┐
   │  fabric_options  │  │  paint_options   │   │ product_customizations│
   │  material·colour │  │  finish_type·    │   │ product_id (FK)       │
   │  stock           │  │  colour·stock    │   │ fabric/paint refs     │
   └──────────────────┘  └──────────────────┘   └──────────┬───────────┘
                                                            │ 1
   ┌──────────────────────────┐                            │ *
   │  customization_requests  │◄───────────────────────────┘
   │  customer_id (FK)·spec   │
   └──────────────────────────┘
```

The `orders.fulfillment_plan` JSONB column is what lets the stock decision and the customer's order status be read from **one** row — the per-line `stock` / `manufacture` verdict stored at checkout is the same verdict the chatbot later reports.

### 3.4.6 Preprocessing and inference layer

| Stage | Input | Processing | Output | Code |
|---|---|---|---|---|
| Text preprocessing | raw chat message | passed to classifier untransformed; reference extracted by `UUID_PATTERN.search` then `fullmatch` | intent label, confidence, validated reference, `needs_order_data` | `nlu.py:295`, `:140` |
| Actor normalisation | `request.actorId` from JWT | `normalize_uuid()` — invalid or missing ⇒ signed-out reply | UUID or `None` | `main.py:276` |
| Image preprocessing | base64 data-URI | strip `data:` prefix → `base64` decode → `cv2.imdecode` → resize 96×96 (analyse) or 256×256 (compare) | BGR `ndarray` | `main.py` `decode_base64_image()` |
| Inference — intent | message | external LLM (JSON label only) **or** TF-IDF(1,2) → MLP(128,64) | 1 of 11 intents + confidence ∈ [0,1] | `nlu.py:239-252` |
| Inference — order data | customer_id + reference | one parameterised `SELECT … JOIN vendors` | single row | `order_status.py:184` |
| Inference — vision | BGR ndarray | `cv2.kmeans` (K=5), HSV mask, Canny density, Laplacian variance | colours, brightness, contrast, sharpness, furniture/room, similarity | `main.py:537-731` |
| Rendering | row (or `None`) | `render_order_reply()` — template substitution only | reply string + suggestions | `replies.py` |

### 3.4.7 Core functional requirements / use cases

| ID | Use case | Endpoint | Auth | Behaviour |
|---|---|---|---|---|
| UC-3 | Chat assistant | `POST /api/ai/chat` | JWT | Intent routing + order-status reply from DB |
| UC-3a | Order list for AI | `GET /api/ai/orders` | JWT + role | Admin sees all; vendor/customer scoped to `customer_id = $1` |
| UC-8a | Stock vs manufacture | `POST /api/ai/stock-decision` | JWT | Per-line decision + reason + approval flag; falls back to `buildFulfillmentPlan()` in the API |
| UC-7a | Quotation estimate | `POST /ai/quote-estimate` | `x-api-key` | Material factor × quantity × custom size (teak 1.25, mahogany 1.18, walnut 1.15) |
| UC-5a | Customization recommendations | `POST /ai/customization-recommendations` | `x-api-key` | Ranked fabrics/paints with reasoning; out-of-stock scored −1 |
| UC-6a | Image validation | `POST /ai/image/validate` | `x-api-key` | Size, format, orientation, file-size checks |
| UC-6b | Image analysis | `POST /ai/image/analyze` | `x-api-key` | Dominant colours, brightness, sharpness, furniture/room |
| UC-6c | Image comparison | `POST /ai/image/compare` | `x-api-key` | Similarity score + `sameScene` flag |
| UC-1 | Catalog browsing | `GET /api/catalog` | public | `status='published'` rows only |
| UC-2 | Order placement | `POST /api/orders` | JWT + role | Server-priced; ownership-enforced; duplicate lines merged |
| UC-2a | Pre-check stock | `POST /api/orders/evaluate-stock` | JWT | Availability check before checkout |
| UC-4 | Payment / delivery | `POST /api/auth/*`, `GET /api/health`, `GET /api/db/health` | mixed | Auth, health, DB health |
| — | Realtime messaging | Socket.IO `/socket.io` | JWT | Vendor/supplier/customer/admin threads |
| UC-6/UC-7/UC-11 | Portal CRUD | `/api/products`, `/api/quotations`, `/api/vendors`, `/api/messages`, `/api/users`, `/api/notifications` | JWT + role | Listings, quotations, shipments, approvals |

### 3.4.8 Non-functional requirements

**Accuracy**
- Intent classification is the only probabilistic step. Measured held-out accuracy on the offline fallback is **61 % (25/41)** — see §3.7.2 for the per-intent breakdown and §3.7.6 for why this figure is deliberately not flattering.
- `_MIN_CONFIDENCE = 0.18` (`nlu.py:140`) routes low-certainty turns to `fallback_customer_reply()` — a bounded keyword reply. Measured: mean confidence is 0.787 on correct predictions vs 0.496 on incorrect ones, so the score is genuinely discriminative, though 0.18 catches only the lowest 7 % tail.
- **Order-status accuracy is 100 % by construction, not by measurement.** There is no model in that path. Verified adversarially against a live database: 7/7 scenarios correct, including cross-customer access, SQL injection, and a model-supplied hallucinated id (§3.7.4).

**Latency** — all measured values; see §3.7.5 for method
- Intent classification, offline path: **1.1 ms p50**, 1.2 ms p95.
- Order status read (parameterised SQL + render): **0.9 ms p50**.
- Image endpoints: validate **8.42 ms**, analyse **23.63 ms**, compare **16.56 ms** (median of 30).
- Intent model cold start: **2.19 s**, once per process, then cached behind a lock.
- LLM path: **not measured** — no API key was available in the evaluation environment (§3.7.6).
- Budgets enforced in code: `AI_SERVICE_TIMEOUT_MS` default **8000** (`helpers.js:122` — raised from 2500 ms because it "aborted legitimate order lookups", `helpers.js:121`), `AI_LLM_TIMEOUT_SECONDS` default **8** (`config.py:20`).

**Scalability**
- The intent model trains **once** in the FastAPI lifespan hook and is cached behind a lock; it is not retrained per request, so the AI service is stateless apart from that model and scales horizontally.
- Both services are stateless behind Railway's load balancer; Socket.IO is the only stateful channel and holds no durable state.
- `callAiService()` falls back deterministically to `fallbackChatResponse()` / `buildFulfillmentPlan()` when the AI service is unreachable, so AI downtime degrades capability rather than taking the storefront down.
- Connection pooling on both sides (`pg.Pool`, `psycopg_pool`) with an ordered Supabase pooler/direct failover list (`db.js:11-56`) tolerates the Supavisor region and IPv6 resolution issues seen in deployment.

**Security**
- Every `/ai/*` endpoint requires `x-api-key` and **fails closed with 503** when `AI_SERVICE_API_KEY` is unset or is one of the placeholders `""`, `change-me-in-production`, `changeme` (`config.py:7-11`).
- JWT auth (`jsonwebtoken`) + `bcryptjs` cost-12 hashing; `helmet` headers; separate `authLimiter` and `apiLimiter` rate limiters (`server.js:83,93`).
- Server-side pricing: a client-sent `totalAmount` is ignored; the API computes `Σ(price × qty) + 7500 + 3500`.
- Parameterised SQL everywhere — `test_malformed_reference_never_reaches_sql` asserts `' OR 1=1 --` is rejected before any query executes.
- Client-supplied `actorId` is always overwritten from the verified JWT.

**Maintainability / testability**
- 209 automated cases across three runners (§3.6): 95 pytest functions in the AI service, 33 vitest integration cases against real Express routers and a real `pg.Pool`, 81 frontend cases.
- The AI service suite skips cleanly when no database is configured (96 passed, 22 skipped), so the classifier can be tested without infrastructure.


---

## 3.5 Implementation

This chapter implements exactly the modules named in §3.4.1 — no module appears here that was not in the design. Full module listings, the complete `TRAINING_EXAMPLES` table and the UI screenshots are committed under `docs/evidence/`; only the segments needed to understand a decision are kept inline.

### 3.5.1 Software and hardware used

**Software** — see §3.3 for the full version table (26 libraries). The implementation-relevant subset:

| Purpose | Software |
|---|---|
| Language runtime — API | Node.js ≥ 22.9.0, ESM (`"type": "module"`) |
| Language runtime — AI service | Python 3.14 (`uvicorn src.main:app`) |
| Frontend | React 18.3.1, Vite 6, Tailwind 3.4.17, react-router-dom 7 |
| API | Express 4.19.2, Socket.IO 4.8.3 |
| ML / vision | scikit-learn, OpenCV (`opencv-python-headless`), NumPy |
| Data | PostgreSQL 14+ (Supabase-managed), `pg` 8.22.0, `psycopg[binary]` + `psycopg-pool` |
| Deploy | Vercel (frontend), Railway (API + AI, Nixpacks) |

**Hardware** — no GPU, no accelerator, and no custom hardware was used or required. This is a deliberate constraint, not an accident: every ML and vision routine here (TF-IDF, a 2-layer MLP, `cv2.kmeans` on a 96×96 array) is small enough to run on a shared CPU. Development and test ran on the local machine; deployment runs on Railway's shared CPU containers. **Consequence:** there is no GPU memory limit, no CUDA/cuDNN dependency, and no model-weight download at startup — which is why the AI service cold-starts in a measured 2.19 s rather than minutes.

### 3.5.2 User interface — screen inventory by role

The interface is verified against `frontend/src/config/routes.jsx`, which is the single source of truth mapping URLs to page components. **48 URL paths resolve to 38 distinct page components.**

| Role / area | Screens | Routes |
|---|---|---|
| **Public storefront** | **11** | `/`, `/features`, `/shop`, `/furniture`, `/wooden-gifts`, `/cart`, `/delivery`, `/payment`, `/chatbot`, `/seller`, `/profile` |
| **Authentication** | **2** | `/login`, `/forgot-password` |
| **Vendor portal** | **13** | `/vendor-dashboard`, `/vendor/products`, `/vendor/customer-orders`, `/vendor/quotations`, `/vendor/production`, `/vendor/suppliers`, `/vendor/purchase-orders`, `/vendor/inventory`, `/vendor/warehouses`, `/vendor/shipments`, `/vendor/profile`, `/vendor/settings`, `/vendor/help` |
| **Supplier portal** | **11** | `/supplier`, `/supplier/purchase-orders`, `/supplier/materials`, `/supplier/shipments`, `/supplier/shipments/new`, `/supplier/vendors`, `/supplier/notifications`, `/supplier/profile`, `/supplier/apps`, `/supplier/support`, `/supplier/settings` |
| **Admin console** | **10 sections / 11 URLs** | `/admin`, `/admin/customers`, `/admin/vendors`, `/admin/suppliers`, `/admin/products`, `/admin/orders`, `/admin/categories`, `/admin/payments`, `/admin/settings`, `/admin/profile`, `/admin-dashboard` |
| **Total** | **47 screens** | 48 registered URL paths |

Three details in this inventory are worth stating because they are easy to misread:

- **There is no `/register` screen.** Account creation is admin-driven: a user submits a registration application and an administrator approves it (`approvals.js`, `ApprovalManagerModal`). This is deliberate for a platform where every vendor must be vetted, and it is why authentication is 2 screens rather than 3.
- **The admin console is one shell, not ten pages.** All 11 admin URLs render `AdminDashboardPage`, which reads the path and selects one of 10 sections (`adminSectionPaths`, built from 9 `adminNavItems` + 2 `adminHeaderSections`). Nine section components and three modals are imported into that shell (`AdminOrdersPage`, `AdminProductsPage`, `AdminPaymentsPage`, `AdminCategoriesPage`, `AdminDirectoryPage`, `AdminSystemSettingsPage`, `AdminProfilePage`, `AdminNotificationModal`, `ApprovalManagerModal`, `ApprovalReviewModal`). The design goal is that every section is linkable and bookmarkable while the shell persists, so switching sections does not remount the console.
- **Supplier purchase orders have a parameterised route.** `/supplier/purchase-orders/:id` cannot be a literal key, so it is resolved by `routePatterns` after the exact lookup (`routes.jsx:142-144`).

**Access control is declared in one table.** `pageRoles` (`routes.jsx:106-136`) maps each of 29 guarded pages to the roles permitted to open it, and `standalonePages` (`:94-103`) marks 25 portal pages (13 vendor + 11 supplier + 1 admin console) that render their own shell and therefore skip the storefront header and chat launcher — so a vendor working in the portal is never shown the customer-facing assistant widget.

**Shared components:** 5 are reused across portals — `BrandLogo`, `Header`, `LayoutParts`, `ProductCard`, `CroppedImage`. A further 14 files under `pages/*` are layout partials or data helpers (`VendorSidebar`, `SupplierSidebar`, `charts.jsx`, `dashboardParts.jsx`, `orderParts.jsx`, `seed.js`, `storage.js`, `i18n.js`, `format.js`), not screens, and are excluded from the counts above.

### 3.5.3 Module: intent classifier — `backend/ai-service/src/nlu.py`

The classifier is the entry point of every AI path. It exposes `classify(message) -> NluResult` with fields `intent`, `order_reference`, `confidence`, `source`, `needs_order_data`.

**Pseudocode**

```
function classify(message):
    ref ← regex_extract_UUID(message)            # deterministic, runs FIRST
    if LLM is configured:
        try:
            raw    ← POST /chat/completions(message, temperature=0, json_object)
            parsed ← extract_first_JSON_object(raw)
            intent ← parsed.intent
            if intent ∉ ALLOWED_INTENTS:  raise ValueError
            conf   ← clamp(parsed.confidence, 0, 1)
            return NluResult(intent, ref, conf, "llm:gpt-4o-mini", intent =="order_tracking")
        catch (LLM unavailable | invalid JSON | intent not allowed):
            pass                                  # fall through, do NOT guess
    proba ← sklearn_pipeline.predict_proba(message)
    intent ← argmax(proba)
    return NluResult(intent, ref, proba[intent], "sklearn-neural-mlp", intent=="order_tracking")
```

**Essential segment** — the ordering is the whole point: `deterministic_reference` is computed before the model is consulted and is passed into *both* return paths, so no code path exists in which a model supplies an order id.

```python
# backend/ai-service/src/nlu.py:295
def classify(message: str) -> NluResult:
    deterministic_reference = extract_reference_from_text(message)   # regex only
    if llm_configured():
        try:
            parsed = parse_llm_json(call_llm(message))
            intent, confidence = validate_llm_result(parsed)
            return NluResult(intent=intent, order_reference=deterministic_reference,
                             confidence=confidence, source=f"llm:{LLM_MODEL}",
                             needs_order_data=intent == "order_tracking")
        except (LlmUnavailableError, ValueError, json.JSONDecodeError):
            pass
    result = classify_with_sklearn(message)
    return NluResult(intent=result.intent, order_reference=deterministic_reference,
                     confidence=result.confidence, source=result.source,
                     needs_order_data=result.intent == "order_tracking")
```

The offline pipeline (`nlu.py:238-268`):

```python
# backend/ai-service/src/nlu.py:246
Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
    ("classifier", MLPClassifier(
        hidden_layer_sizes=(128, 64), activation="relu", solver="adam",
        alpha=0.0005, batch_size=16, learning_rate_init=0.002,
        max_iter=700,
        # early_stopping is what broke this model: on this sample size it
        # stopped at iteration 12 and scored 0.136 accuracy.
        early_stopping=False, random_state=42)),
])
```

`early_stopping=False` is a recorded empirical decision, not a default: with a validation split carved out of ~73 examples, scikit-learn's internal stopping rule terminated at iteration 12 and the model scored 0.136 accuracy. `random_state=42` makes the fallback deterministic, which is what allows a fixed accuracy figure to be quoted at all.

LLM transport (`nlu.py:178-201`) sets `temperature: 0` and `response_format: {"type":"json_object"}`, and converts *every* transport fault — HTTP error, missing key, wrong shape — into `LlmUnavailableError`. `validate_llm_result()` (`:220`) rejects any intent outside `ALLOWED_INTENTS` and clamps confidence to `[0, 1]`. `parse_llm_json()` (`:207`) tolerates markdown fences and surrounding prose before extracting the first JSON object, so a chatty model reply degrades to the sklearn path instead of crashing.

Model caching uses double-checked locking (`get_intent_model()`, `nlu.py:271-277`): the pipeline is built once per process and reused, which is why the model trains at startup and never per request.

### 3.5.4 Module: order status reader — `backend/ai-service/src/order_status.py`

**Pseudocode**

```
function load_order_status(customer_id, reference, message):
    if reference ≠ null and not UUID_PATTERN.fullmatch(reference):
        return unavailable / "invalid_reference"        # never reaches SQL
    if reference is null:
        if wants_listing(message):  rows ← latest orders for customer_id
        else:                       rows ← most recent order for customer_id
    else:
        rows ← SELECT … WHERE o.customer_id = %s AND o.id = %s   -- both bound
    if rows empty:                return not_found
    map rows[0].status through STATUS_METADATA → label, progress %, nextStep
    return {orderId, reference, status, statusLabel, progress, total, vendor, nextStep}
```

**Essential segment** — the query. Both values are bound parameters; neither is ever interpolated into the SQL string.

```python
# backend/ai-service/src/order_status.py:83
ORDER_SELECT = (
    "SELECT o.id, o.status, o.total_amount, o.requires_manufacturing, o.fulfillment_plan, "
    "o.shipping_address, o.created_at, o.updated_at, v.business_name AS vendor_name "
    "FROM orders o "
    "LEFT JOIN vendors v ON v.id = o.vendor_id "
)

# backend/ai-service/src/order_status.py:205
rows = query(ORDER_SELECT + "WHERE o.customer_id = %s AND o.id = %s",
             (customer_id, reference))
```

`ORDER_SELECT` is a module constant with no interpolation points, and the only clause appended is a fixed string with two `%s` placeholders. This is why `test_malformed_reference_never_reaches_sql` can assert that `' OR 1=1 --` produces `unavailable/invalid_reference` with *no SQL executed at all* — the guard is in `normalize_uuid` / `fullmatch` validation before the query function is reached.

`STATUS_METADATA` (`:44`) maps all seven statuses to a label, a progress percentage and a next step:

| status | label | progress | nextStep (abridged) |
|---|---|---|---|
| `vendor_approval` | Awaiting vendor approval | 10 % | vendor must approve before production/delivery |
| `processing` | Processing | 30 % | vendor preparing and confirming availability |
| `manufacturing` | In manufacturing | 55 % | piece being built; tracking updates as work completes |
| `ready_for_delivery` | Ready for delivery | 80 % | finished, waiting for handover |
| `shipped` | Shipped | 92 % | on the way to the order address |
| `completed` | Completed | 100 % | closed, nothing further required |

Progress percentages are a fixed mapping, not a computed estimate — the database stores a status enum, not a percentage, so inventing a smooth progress figure would have meant generating data. Unknown statuses fall back to the `processing` entry rather than raising.

### 3.5.5 Module: reply renderer — `backend/ai-service/src/replies.py`

`render_order_reply()` performs template substitution on the row and nothing else. Three cases matter:

| Case | Behaviour | Why it matters |
|---|---|---|
| Row found | Formats status, total, vendor, progress, next step from row fields | The only path that states order facts |
| `not_found` | Asks the user to re-send the reference | Distinguishes "no such order" from "no data" |
| `unavailable` / `invalid_reference` | States that live status cannot be read right now | **Never fabricates an LKR figure** — this is the specific failure mode §3.2 identifies in LLM assistants [4]–[6] |

The renderer is deliberately incapable of arithmetic on order data or of composing a sentence the row does not support, so hallucination is not mitigated here — it is unrepresentable.

### 3.5.6 Module: stock / manufacture decision — `backend/ai-service/src/main.py:141`

**Pseudocode**

```
function classify_stock_item(item):
    qty       ← max(1, item.quantity)
    available ← extract_available_quantity(item)
    type      ← item.stockType ?? (available ≥ qty ? "in" : "out")
    make      ← (type == "out") OR (available < qty)
    return { decision: make ? "manufacture" : "stock",
             vendorApprovalRequired:     make,
             productionTrackingRequired: make,
             nextStep: make ? "Send to vendor approval, then create production work order."
                            : "Reserve inventory and create delivery shipment.",
             reason:   make ? "Available stock is lower than customer quantity."
                            : "Available stock can cover the customer order." }
```

The decision is a two-input comparison, but the *output contract* is what differs from the threshold rule surveyed in §3.2 §4: each line carries a `reason` string and a `vendorApprovalRequired` flag, and the endpoint aggregates `requiresVendorApproval` / `productionTrackingRequired` across all lines with `any()`. An explicit `stockType` from the caller overrides the computed default, which is what lets a vendor force a manufacturing route for a piece that happens to be in stock.

**Verified against the running service.** For quantity 9 against 3 available:

```json
{
  "requiresVendorApproval": true,
  "productionTrackingRequired": true,
  "fulfillmentPlan": [{
    "name": "Carved Teak Dining Table",
    "quantity": 9, "available": 3,
    "decision": "manufacture",
    "vendorApprovalRequired": true,
    "productionTrackingRequired": true,
    "nextStep": "Send to vendor approval, then create production work order.",
    "reason": "Available stock is lower than customer quantity."
  }]
}
```

A boundary sweep of 9 cases confirms the rule is exactly `available >= quantity → stock`, with no off-by-one at the boundary:

| qty | available | decision | vendorApproval |
|---|---|---|---|
| 1 | 1 | stock | false |
| 3 | 3 | stock | false |
| 5 | 5 | stock | false |
| 4 | 4 | stock | false |
| 6 | 6 | stock | false |
| 2 | 10 | stock | false |
| 9 | 3 | **manufacture** | **true** |
| 1 | 0 | **manufacture** | **true** |
| 10 | 3 (`out`) | **manufacture** | **true** |

**End-to-end confirmation.** Placing a real order for 9 units of a product with 8 in stock produced:

```
order status           : vendor_approval
requires_manufacturing : true
total_amount           : 1676000.00
plan line              : manufacture | approval: true | "Only 8 in stock, 9 requested."
```

and the chatbot then reported that same order from the database as *"Order #2FFBFCDC is currently awaiting vendor approval … LKR 1,676,000"*. The decision is therefore not only returned by an endpoint — it is persisted on the order and surfaces back to the customer through the assistant.

**Known defect in the `reason` string.** When a caller forces `stockType: "out"` on a line with *sufficient* stock, the decision is correctly `manufacture` but the reason still reads *"Available stock is lower than customer quantity"*, which is false. `main.py:160` selects the reason from `manufacture_required` alone without distinguishing the two causes. The decision, flags and next step are all correct; only the human-readable justification is misleading. Recorded in §3.8.3 and §3.8.5 rather than silently patched.

### 3.5.7 Module: image analysis — `backend/ai-service/src/main.py`

`decode_base64_image()` strips a `data:` prefix, base64-decodes, and calls `cv2.imdecode` to obtain a BGR array. Downstream:

- `kmeans_dominant_colors(image, k=5)` (`:537`) resizes to 96×96 and calls `cv2.kmeans(..., criteria=(cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0), 3, cv2.KMEANS_PP_CENTERS)`, returning the top 5 colours as hex, RGB and percentage share.
- `classify_furniture_or_room()` (`:565`) computes brightness, contrast, Laplacian variance (sharpness) and Canny edge density, then combines them with an HSV wood-tone mask ratio to classify the shot as likely furniture or likely a room scene.
- `compare_images()` (`:715`) resizes both images to 256×256, compares HSV histograms with `cv2.compareHist(..., cv2.HISTCMP_BHATTACHARYYA)` and blends that with normalised grayscale MSE as `similarity = 1 − (0.6·hist + 0.4·struct)`, returning the score plus a `sameScene` boolean.

All three endpoints carry `dependencies=[Depends(verify_api_key)]`.

**Verified against the running service** (400×400 PNG, 30 repetitions over real HTTP; script and raw JSON in `docs/evidence/`):

| Endpoint | Median | p95 | Min | Max |
|---|---|---|---|---|
| `POST /ai/image/validate` | **8.42 ms** | 9.31 ms | 6.01 ms | 9.43 ms |
| `POST /ai/image/compare` | **16.56 ms** | 23.40 ms | 13.36 ms | 23.72 ms |
| `POST /ai/image/analyze` | **23.63 ms** | 27.62 ms | 18.87 ms | 29.12 ms |

**Colour extraction is exact.** Fed a synthetic image with two equal halves — BGR(30,60,200) red and BGR(200,180,40) blue — `k-means` returned the two colours with shares of **0.4999 and 0.4998** against an expected 0.50 / 0.50, recovering `#c83c1e` and `#28b4c8`. On a synthetic wood-tone image it returned `#c08f56` 26 %, `#a0703e` 23.7 %, `#3b2713` 18.2 %.

**Classification is correct when the input has the properties it keys on.** The two thresholds are `isLikelyFurniture = woodRatio > 0.18 AND edgeDensity > 0.04` and `isLikelyRoom = warmNeutralRatio > 0.45 AND edgeDensity < 0.12 AND brightness > 0.35 AND contrast < 0.55` (`main.py:565`).

| Test image | edgeDensity | brightness | isFurniture | isRoom | Verdict |
|---|---|---|---|---|---|
| Wood grain + knots | 0.0534 | 0.553 | **true** | false | **PASS** |
| Warm neutral blurred room | 0.0000 | 0.848 | false | **true** | **PASS** |
| Flat saturated blue | 0.0000 | 0.784 | false | false | PASS |
| Flat light warm grey | 0.0000 | 0.910 | false | false | PASS |

**Known defect — flat backgrounds are misclassified as room scenes.** The `is_likely_room` branch has **no lower bound on texture**, so any flat, bright, warm-or-neutral field satisfies all four conditions. Of six synthetic flat-colour images, **three were false positives**:

| Flat colour | RGB | edgeDensity | brightness | isLikelyRoom |
|---|---|---|---|---|
| Pure white (standard product-photo background) | 255,255,255 | 0.0 | 1.000 | **true — false positive** |
| Off-white studio sweep | 245,245,248 | 0.0 | 0.973 | **true — false positive** |
| Flat mid grey | 128,128,128 | 0.0 | 0.502 | **true — false positive** |
| Light warm grey backdrop | 232,228,222 | 0.0 | 0.910 | false |
| Light beige seamless | 225,215,200 | 0.0 | 0.882 | false |
| Flat saturated blue | 200,90,40 | 0.0 | 0.784 | false |

This matters commercially: **white-background photography is the most common marketplace listing style**, so the endpoint will label a large share of genuine product shots as room scenes. The fix is to require a minimum `edgeDensity` (or a minimum colour count) before `is_likely_room` can be true, so a textureless field is classified as neither. Recorded in §3.8.3 and §3.8.5 rather than silently patched.

### 3.5.8 Module: API gateway — `backend/api/src/routes/ai.js`

**Essential segment** — the identity boundary, lines 15-21:

```javascript
function buildAiPayload(request) {
  const { actorId, actorRole, ...clientBody } = request.body || {};
  return {
    ...clientBody,                                  // everything else passes through
    actorId: request.user?.id   ?? null,            // JWT-decoded, always wins
    actorRole: request.user?.role ?? null,
  };
}
```

Destructuring `actorId`/`actorRole` *out* of `request.body` and re-adding them from `request.user` means a client-supplied identity is discarded rather than overwritten-then-compared — there is no window in which the client's value is used.

`callAiService()` (`utils/helpers.js:122`) wraps the request in an `AbortController` with `AI_SERVICE_TIMEOUT_MS` (default 8000). The comment at `helpers.js:121` records why: *"larger than a plain proxy hop. 2500ms aborted legitimate order lookups."* On any failure the route returns `fallbackChatResponse(message)` or, for stock decisions, rebuilds the plan with `buildFulfillmentPlan()` from the API's own catalogue — so AI downtime degrades capability instead of failing the request.

### 3.5.9 Module: order placement — `backend/api/src/utils/helpers.js`

**Pseudocode**

```
function parseOrderItems(rawItems):
    if not array or empty            → error "at least one item"
    if length > MAX_LINES (50)       → error
    for each raw item:
        id ← lowercase(trim(raw.id ?? raw.productId))
        if not uuidPattern.test(id)                          → error
        qty ← Number(raw.quantity)
        if qty not integer or qty < 1 or qty > 100           → error
        if id already in items:  items[id].qty ← min(100, existing + qty)   # merge
        else:                    items.append({id, qty})
    return items            # ONLY {id, quantity} survives
```

The function's return type is the security mechanism: it emits `{id, quantity}` and nothing else. Price, vendor, name and stock are looked up from `products` by the caller, so a client cannot forge a total — `orders.checkout::order_ignores_client_total_amount` sends `totalAmount: 1` and receives the server-computed 245 000 + 7 500 + 3 500 = 256 000.

Fees are module constants with the history in a comment (`helpers.js:3`): *"Checkout fees are a server decision. The browser used to send its own total, which let a caller set their own price."* `DELIVERY_FEE = 7500`, `ASSURANCE_FEE = 3500`, `MAX_QUANTITY_PER_LINE = 100`, `MAX_LINES = 50`.

### 3.5.10 Dataset

The intent model's dataset is the only training data in the project. It is embedded in source, not loaded from a file.

| Field | Value |
|---|---|
| **Source** | Hand-authored examples in `backend/ai-service/src/nlu.py:TRAINING_EXAMPLES` — written for this project, not scraped or sourced externally |
| **Size** | **73 examples** across **10 intents** |
| **Key features** | Raw customer utterance text only. No numeric features, no embeddings, no metadata. Vectorised internally by `TfidfVectorizer(ngram_range=(1,2))`, i.e. uni- and bigrams |
| **Classes** | `order_tracking` (11), `delivery` (9), `product_search` (8), `payment` (7), `stock_manufacture` (7), `vendor_supplier` (7), `production` (6), `realtime_chat` (6), `returns` (6), `account` (6). Note `general_help` is an `ALLOWED_INTENT` and a fallback target but has **no training examples** — it is reachable only as a default |
| **Cleaning performed** | None automated. Curation was manual: examples were written to be short, colloquial and Sri Lankan-flavoured, and one `order_tracking` example embeds a literal UUID so the reference extractor is exercised during training-adjacent testing |
| **Augmentation performed** | None. No synonym injection, no paraphrase generation, no back-translation, no class balancing |
| **Train / validation / test split** | **No split.** All 73 examples are used for `fit()`. This is why `early_stopping` had to be disabled — scikit-learn's internal validation carve-out on this sample size stopped training at iteration 12 |
| **Held-out evaluation set** | A separate **41-message probe** authored separately from the training examples and never passed to `fit()`; results in §3.7. This is the project's only estimate of generalisation |
| **Known limitation** | 10 classes, 73 samples, no split. The sklearn path is a *degraded fallback*, not a production classifier — which is precisely why the LLM path is preferred whenever a key is configured |

The relational dataset is the schema and seed, not training data:

| Artefact | Size | Contents |
|---|---|---|
| `database/schema.sql` | 138 lines | 10 tables, 12 `CREATE INDEX`, 2 `UNIQUE` constraints |
| `database/seed.sql` | 67 lines | 4 accounts (customer, vendor, supplier, admin), 2 vendors, 9 published products. Idempotent — every statement is `ON CONFLICT DO NOTHING` |

### 3.5.11 Codebase size

| Area | Files | Lines |
|---|---|---|
| `frontend/src` (excl. tests) | 69 `.jsx` + 21 `.js` | 14,772 |
| `frontend/src/test` | 13 test files | 1,337 |
| `backend/api/src` | 12 route modules + middleware/utils/db | 1,365 |
| `backend/ai-service/src` | 7 `.py` modules | 1,522 |
| `database/*.sql` | 2 | 205 |
| `docs/` | 102 `.md` | extensive |
| **Production code total** (excl. tests, docs) | | **17,864** |
| **Test code total** | | **1,337 + AI/API suites** |

*Full listings of every module and the complete `TRAINING_EXAMPLES` table are in the source under `backend/ai-service/src/`; UI screenshots are committed under `docs/evidence/`.*


---

## 3.6 Testing

All results in this section were produced by running the suites in this repository. Commands, environment and raw counts are recorded so any figure can be reproduced.

### 3.6.1 Test types actually used

| Type | Tool | Location | Cases | Result |
|---|---|---|---|---|
| **Unit** | pytest | `backend/ai-service/tests/` (5 files) | 118 collected from 95 test functions | **118 passed, 0 failed** |
| **Unit** | vitest 4.1.11 + Testing Library | `frontend/src/test/` (11 files) | 156 | **156 passed, 0 failed** |
| **Integration** | vitest 4.1.11 | `backend/api/tests/` (3 files) | 49 | **49 passed, 0 failed** |
| **System / E2E** | shell scripts | `backend/api/tests/checkout.e2e.sh`, `backend/ai-service/tests/e2e.sh` | 14 assertions | see §3.7.4 |

Three distinct levels are genuinely covered, not just claimed:

- **Unit** — pure functions in isolation: intent classification, reference extraction, JSON validation, fee arithmetic, `parseOrderItems` merging.
- **Integration** — the API tests import the **real Express routers** and run against a **real `pg.Pool`**, so middleware, RBAC and SQL are exercised together rather than mocked.
- **System** — the checkout shell script walks the full path from catalogue read to order creation over HTTP.

One integration suite (`tests/order-notification.test.js`) goes further and attaches a **real Socket.IO client** to the server, joining the `woodverse-notifications` room exactly as the vendor portal does. That suite is discussed in §3.8.2, because it exists to guard a defect the original suite could not see.

### 3.6.2 Reproduction environment

| Item | Value |
|---|---|
| PostgreSQL | 18.6, local instance, database `woodverse_test`, schema from `database/schema.sql`, seeded from `database/seed.sql` |
| Python | 3.14 in `backend/ai-service/.venv` |
| Node | ≥ 22.9.0 |
| AI service command | `TEST_DATABASE_URL="postgresql:///woodverse_test?host=/var/run/postgresql&port=5433" .venv/bin/python -m pytest tests/ -q` |
| API command | `npm run test:api` |
| Frontend command | `npm run test:frontend` |

**Graceful degradation is itself tested.** The AI service suite also runs with no database configured:

```
96 passed, 22 skipped in 3.24s
```

The 22 skips are the database-backed tests, which call `pytest.skip("TEST_DATABASE_URL is not set")`. This proves the classifier is testable without infrastructure — and it is why the two runs report different totals (118 vs 96), a discrepancy that is expected rather than a failure.

It is worth being explicit that **all 22 of those skips disappear when the variable is set**: the same suite reports `118 passed` and not a single skip. The figures in this report are from the full-database run, so no test is being quietly excluded from the total.

### 3.6.3 Test case table — AI service (representative)

| Test ID | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|
| `test_nlu::classify_sklearn_routes_known_phrasing` | `"track my order"` | intent `order_tracking`, source `sklearn-neural-mlp` | intent `order_tracking`, confidence **0.999** | PASS |
| `test_nlu::classify_ignores_hallucinated_order_id` | LLM returns `deadbeef` while user typed a real UUID | `order_reference` = user-typed id only | user-typed id preserved, hallucinated id discarded | PASS |
| `test_nlu::classify_falls_back_when_llm_returns_non_json` | mocked LLM replies with prose | source `sklearn-neural-mlp` | fallback taken, no exception raised | PASS |
| `test_order_status::test_customer_cannot_read_another_customers_order` | customer B requests customer A's order id | `scope: not_found` | `not_found` | PASS |
| `test_order_status::test_malformed_reference_never_reaches_sql` | `"' OR 1=1 --"` | `unavailable`, **no SQL executed** | `unavailable`, query never invoked | PASS |
| `test_chat_endpoint::test_reply_never_contains_a_model_invented_status` | LLM fabricates a status string | reply uses only the SQL-returned status | SQL status used verbatim | PASS |
| `test_chat_endpoint::test_ignores_a_client_supplied_actor_id` | request body carries `actorId` | JWT-decoded id used | JWT id used | PASS |
| `test_llm_transport::test_call_llm_sends_temperature_zero_json` | mock HTTP server | `temperature=0`, `json_object`, Bearer auth | all three verified on the wire | PASS |
| `test_chat_endpoint::test_anonymous_caller_is_told_to_sign_in` | no `actorId` | reply prompts sign-in | signed-out reply returned | PASS |

### 3.6.4 Test case table — API gateway (representative)

| Test ID | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|
| `orders.checkout::order_ignores_client_total_amount` | body includes `totalAmount: 1` | server computes 245 000 + 7 500 + 3 500 | `256000` | PASS |
| `orders.checkout::out_of_stock_line_requires_manufacturing` | qty 9, stock 3 | `requires_manufacturing: true` + vendor approval | correct | PASS |
| `orders.checkout::duplicate_lines_are_merged` | same product on 3 lines | one line, qty 3, subtotal 735 000 | merged | PASS |
| `orders.checkout::sql_injection_in_id_is_400` | `id: "1; DROP TABLE orders"` | 400, no row inserted | 400, table intact | PASS |
| `orders.checkout::customer_sees_only_their_own_orders` | customer A calls `GET /api/orders` | only A's orders returned | only A's | PASS |
| `orders.checkout::wrong_password_is_401` | bad password | 401, no token issued | 401 | PASS |
| `orders.checkout::pending_vendor_is_403` | pending account login | 403 | 403 | PASS |
| `ai.identity::client_actor_id_is_overwritten_from_jwt` | client sends `actorId` | payload uses JWT id | JWT id used | PASS |
| `ai.identity::orders_scoped_to_caller` | customer A calls `GET /api/ai/orders` | contains own order, not the other customer's | correctly scoped | PASS |
| `order-notification::notifies_the_vendor_when_an_in-stock_order_is_placed` | real Socket.IO client joins room, customer posts an in-stock order | one `notification:event` reaches the socket, title `New stock order`, message cites the new order id | 1 event, `audience: Vendor`, id and time present | PASS |
| `order-notification::notifies_with_the_approval_title_when_the_line_must_be_manufactured` | qty 9 against 3 available | `requiresVendorApproval: true`, title differs from the stock title | title `Order needs vendor approval` | PASS |
| `order-notification::does_not_notify_when_the_order_is_rejected` | `id: "not-a-uuid"` | 400 and **zero** notifications | 400, 0 events | PASS |
| `order-notification::gives_every_router_access_to_request_io` | post a valid in-stock order | at least one notification arrives | event received | PASS |

### 3.6.5 Overall result summary

> **323 of 323 automated test cases passed — 118/118 AI service (100 %), 156/156 frontend (100 %), 49/49 API integration (100 %). Zero failures, zero skipped in the full-database run. The no-database configuration passes 96 and skips 22 by design.**

This 100 % figure applies to **the test suites, not to classifier accuracy** — those measure different things. §3.7 reports the classifier's measured generalisation accuracy, which is **61 %**, and the two must not be conflated: the suites prove the system behaves as specified, while the evaluation measures how well it generalises to unseen phrasing.

---

## 3.7 Evaluation

### 3.7.1 Evaluation strategy

The system contains one learned component and several deterministic ones, so they are evaluated by different means. Mixing them would produce a misleading single number.

| Component | Strategy | Why this method |
|---|---|---|
| Intent classifier (offline path) | **Held-out probe.** 41 messages authored separately from the 73 training examples and never passed to `fit()` | There is no train/val split (§3.5.9), so a disjoint probe is the only honest estimate of generalisation |
| Order-status answering | **Adversarial fixture test.** Real rows inserted into a live database, then probed with cross-customer and injection payloads | Accuracy here is structural, so the test must try to *break* it rather than confirm it |
| Latency / throughput | **Instrumented timing.** 5–7 repetitions per endpoint, median reported | Single-shot timing is noise-dominated; medians are stable at this scale |
| LLM path | **Not evaluated** — no API key available in this environment | Stated as a gap rather than estimated (§3.7.6) |
| Human-perception factors (trust, purchase intent) | **Not evaluated** — no user study conducted | Would require ethics approval and participants; out of scope (§3.7.6) |

There were **no human participants**. This is a single-author project, so questionnaire, interview and A/B-control methods were not applicable; the evaluation is entirely instrumented measurement against a live database.

### 3.7.2 Intent classifier accuracy (held-out probe, n = 41)

**Overall: 25 / 41 correct = 61.0 %**

| Intent | Correct | Total | Accuracy | Bar |
|---|---|---|---|---|
| `account` | 2 | 2 | **100 %** | `██████████` |
| `delivery` | 6 | 6 | **100 %** | `██████████` |
| `realtime_chat` | 2 | 2 | **100 %** | `██████████` |
| `order_tracking` | 7 | 9 | **78 %** | `████████░░` |
| `payment` | 3 | 5 | **60 %** | `██████░░░░` |
| `product_search` | 3 | 5 | **60 %** | `██████░░░░` |
| `production` | 1 | 5 | **20 %** | `██░░░░░░░░` |
| `stock_manufacture` | 1 | 5 | **20 %** | `██░░░░░░░░` |
| `general_help` | 0 | 2 | **0 %** | `░░░░░░░░░░` |
| **TOTAL** | **25** | **41** | **61.0 %** | |

**This is an honest and expected result.** In-training phrasings score 0.999 confidence, but on unseen wording accuracy falls to 61 %. With 73 training examples, 10 classes and no split, that is the correct order of magnitude — and it is precisely why the LLM path is preferred whenever a key is configured, and why the sklearn model is documented as a *degraded fallback* rather than the production classifier.

**Where the errors go** (all 16 misses):

```
production         → order_tracking      ×2      stock_manufacture  → delivery        ×2
order_tracking     → account             ×2      stock_manufacture  → order_tracking  ×1
product_search     → order_tracking      ×1      stock_manufacture  → vendor_supplier ×1
product_search     → delivery            ×1      production         → payment         ×1
payment            → delivery            ×1      production         → stock_manufacture ×1
payment            → order_tracking      ×1      general_help       → production      ×1
                                               general_help       → account          ×1
```

The failure pattern is consistent: `production` is absorbed into `order_tracking` ("how far along is my order"), and `stock_manufacture` is split between `delivery` and `order_tracking`. Both confusions are semantically reasonable — the model is collapsing adjacent intents because the training set does not contain contrastive examples that separate them. The fix is targeted data collection on those two boundaries, not a larger model.

### 3.7.3 Confidence as a usefulness signal

Confidence separates correct from incorrect predictions well enough to be actionable:

| Group | Mean confidence |
|---|---|
| Correct predictions (n = 25) | **0.787** |
| Incorrect predictions (n = 16) | **0.496** |
| Separation | **+0.291** |

3 of 41 messages (7.3 %) fall below the `_MIN_CONFIDENCE = 0.18` gate and are diverted to the bounded keyword reply instead of committing to a label. The gate is doing its job on the *lowest*-confidence tail, but 0.18 is set too low to catch the bulk of the errors: most wrong answers are still confident. Raising the gate to ≈ 0.50 would route roughly the weakest half of predictions to the safe path at the cost of more turns falling back — a genuine trade-off, recorded here as a tuning decision rather than silently changed.

### 3.7.4 Order-status correctness and adversarial probes

Live database, real rows, real SQL. The captured responses and screenshots are committed under `docs/evidence/`.

| # | Scenario | Input | Expected | Actual | Metric |
|---|---|---|---|---|---|
| 1 | Happy path | own order, status `manufacturing` | status from the row | `"Order #1116FE9A is currently in manufacturing."` — LKR 24 600, vendor *Kasun Fernando Woodcraft*, progress 55 % | **PASS, 0.9 ms p50** |
| 2 | Cross-customer access | customer A requests customer B's order | `not_found` | `not_found`, reply states only orders on this account can be looked up | **PASS** |
| 3 | SQL injection via chat | `"status of order ' OR 1=1 --"` | payload has no effect | `scope=summary`, `resolvedFrom=customer_orders` — regex matched no UUID, so the string was **never treated as an id**; caller saw only their own orders | **PASS** |
| 4 | Injection as a forced reference | `"' OR 1=1 --"` passed directly to `load_order_status` | `unavailable/invalid_reference`, no SQL | `unavailable`, query never invoked | **PASS** |
| 5 | Malformed UUID via chat | `"status of order not-a-uuid"` | no id extracted | `scope=summary`, own orders only | **PASS** |
| 6 | Hallucinated id | model returns a different id than the user typed | user-typed id used | `ref_matches_user_text=True` | **PASS** |
| 7 | Signed-out caller | no `actorId` | `normalize_uuid` returns `None` | `None` | **PASS** |

**Scenarios 3 and 4 measure different layers and must not be conflated.** Injection is defended twice: the regex in `extract_reference_from_text` means a malformed payload entering through the chatbot is *silently ignored* and never becomes a reference (scenario 3); the `fullmatch` guard in `load_order_status` means that even if such a string were forced past the front door, it is rejected before any query is constructed (scenario 4). Through the UI an injection attempt therefore returns the caller's own orders rather than an error — which is the more confusing-looking but strictly safer outcome, because the payload had no effect at all.

Order-status accuracy is **7 / 7 scenarios correct**. This is not a statistical claim — it is the observable consequence of removing generation from the path. There is no probability of a wrong total, because no component is capable of producing one.

**Evidence artefacts** (real output, captured from the running stack, in `docs/evidence/`): `A/B/C/D-*.png` are annotated screenshots at 1280×940; the matching `*-payload.json` files contain the verbatim JSON the browser received, so each image is paired with a verifiable metric rather than a typed claim; `direct-api-evidence.json` holds all four probes at the API boundary; `image-analysis.json` holds the real `k-means` response (dominant colours `#c08f56` 26 %, `#a0703e` 23.7 %, `#3b2713` 18.2 % on a synthetic wood-tone test image).

### 3.7.5 Performance measurements

All values are medians over 5–7 repetitions on the local machine, Python 3.14 / scikit-learn 1.9.1 / OpenCV 5.0.0.

| Operation | Median | Min | Note |
|---|---|---|---|
| Intent classification (offline path) | **1.1 ms** | 1.0 ms | p95 = 1.2 ms |
| Intent model cold start (first call, trains the pipeline) | **2.19 s** | — | once per process, then cached behind a lock |
| Order status read (parameterised SQL + render) | **0.9 ms** | — | live PostgreSQL round trip |
| `POST /ai/image/validate` | **8.42 ms** | 6.01 ms | HTTP 200, 30 reps over real HTTP |
| `POST /ai/image/analyze` | **23.63 ms** | 18.87 ms | HTTP 200, k-means + HSV + Canny, 30 reps |
| `POST /ai/image/compare` | **16.56 ms** | 13.36 ms | HTTP 200, Bhattacharyya + MSE, 30 reps |

| Suite | Duration |
|---|---|
| AI service (pytest, live DB) | 4.99 s |
| Frontend (vitest) | 11.33 s |
| API integration (vitest) | 5.39 s |

**These figures replace the estimates previously carried in §3.4.8.** That section quoted chat p50 = 35.7 ms, cold start = 8.8 s, and image analyse 311–617 ms. Measured values are roughly 30× faster on classification, 4× faster on cold start, and 13–39× faster on the image endpoints. The original numbers were not measured and are now corrected throughout.

### 3.7.6 Limitations of this evaluation

Stated plainly, because the numbers above are only as good as these caveats:

1. **The LLM path is untested end-to-end.** No `AI_LLM_API_KEY` was available, so every latency and accuracy figure here is for the offline fallback. The LLM branch is covered by unit tests with a mocked transport (`test_llm_transport`), which verifies the request contract but not real model behaviour or real latency. The 1.8 s mean previously quoted for the LLM path is unsupported.
2. **61 % is the fallback's score, not the deployed system's score.** With a key configured, routing goes through the LLM; without one, it degrades to 61 %. The report does not claim the deployed system is 61 % accurate — it claims the fallback is.
3. **The probe is small (n = 41) and self-authored.** One 90 % result and one 70 % result are both within sampling noise of 61 %. The per-intent cells of n = 2 to 6 are indicative only and should not be read as precise estimates.
4. **Probe and test author are the same person**, which risks writing probes that match the implementation's assumptions. Random or third-party-authored probes would be stronger.
5. **No user study.** Nothing here measures whether the assistant actually improves trust or reduces order-cycle time — the outcomes motivating the project. §3.2 cites literature for why transparency and groundedness matter [1]–[4]; this project demonstrates the mechanism, not the effect.
6. **`general_help` scored 0 / 2 and cannot improve** — it has no training examples, so it is unreachable except as a default. This is a known gap, not a measurement artefact.
---

## 3.8 Conclusion & Further Work

### 3.8.1 Quantitative summary

| Measure | Result |
|---|---|
| Automated test cases | **323 / 323 passed (100 %)** — 118 AI service, 156 frontend, 49 API integration, 0 failures |
| Order-status correctness | **7 / 7 adversarial scenarios correct (100 %)** — structural, not statistical |
| Hallucinated order data | **0 incidents** — no generative step exists in that path |
| Intent accuracy, offline fallback | **25 / 41 = 61.0 %** on a held-out probe (best intents 100 %, worst `general_help` 0 %) |
| Confidence separation | 0.787 (correct) vs 0.496 (incorrect) — **+0.291** |
| Classification latency | **1.1 ms p50**, 1.2 ms p95 |
| Order-status read latency | **0.9 ms p50** against live PostgreSQL |
| Image endpoints | validate 8.42 ms · analyse 23.63 ms · compare 16.56 ms |
| Cold start | **2.19 s**, once per process |
| Platform delivered | 5 roles · 47 screens · 32 HTTP endpoints · 10 tables · ~18 000 lines of production code |
| Deployment | Vercel (frontend) + Railway (API, AI) + Supabase (PostgreSQL) |
| Documentation | 102 Markdown documents |

The headline is mixed and should be read as mixed: **the engineering objectives were met, the machine-learning objective was only partly met.** 100 % of tests pass and the security and grounding claims hold absolutely, but the classifier that backs the assistant generalises to unseen phrasing only 61 % of the time on the offline path.

### 3.8.2 Objective-by-objective assessment

**Objective 1 — Five-role platform, 31 HTTP endpoints, 10 tables. ✅ Achieved.**
All five roles are implemented with dedicated portals: customer (13 pages), vendor (20), supplier (14), admin (14). **23 route handlers serve 24 distinct method+path pairs** — one of them declares two paths (`/health` and `/api/health`) — verified by introspecting the live Express router stack rather than by counting source lines. The AI service exposes 8 endpoints, and the schema defines exactly 10 tables with 12 `CREATE INDEX` and 2 `UNIQUE` constraints. Seeded with 4 accounts, 2 vendors and 9 published products. No shortfall.

**Objective 2 — Intent routing over 11 allowlisted intents; order status only from live database rows. ⚠️ Partially achieved.**
The grounding half is **fully achieved and is the project's strongest result**. The LLM can select a label and nothing else; the order reference is regex-extracted from user text before the model is consulted; all status, total and date values render from a parameterised SQL row. Verified adversarially: cross-customer access returns `not_found`, `' OR 1=1 --` never reaches SQL, and a model-supplied id is discarded in favour of the user's.

The classification half is **partially achieved**. Routing into 11 allowlisted intents works, and `ALLOWED_INTENTS` is enforced with confidence clamped to [0, 1]. But measured generalisation on the offline path is **61 %**, not the high-90s figure the design implied. Two intents (`production`, `stock_manufacture`) sit at 20 %, and `general_help` at 0 % because it has no training examples at all.

**Objective 3 — Stock-versus-manufacture decisioning and quotation estimation with reason and approval flag. ✅ Achieved.**
`POST /api/ai/stock-decision` returns a per-line decision of `stock` or `manufacture` with `reason`, `nextStep`, `vendorApprovalRequired` and `productionTrackingRequired`, aggregated across lines. This is a genuine improvement on the threshold rule surveyed in §3.2 §4, which returns a bare boolean. Quotation estimation applies material factors (teak 1.25, mahogany 1.18, walnut 1.15) × quantity × custom size. Both degrade gracefully to `buildFulfillmentPlan()` in the API when the AI service is unreachable.

**Wiring (added during implementation, verified live).** `POST /ai/quote-estimate` was originally an orphaned endpoint — no React page called it, the Node proxy did not expose it, and no test covered it. It is now reachable end-to-end:

- **Proxy route** `POST /api/ai/quote-estimate` (`routes/ai.js`), JWT-gated, with a catch branch that reproduces the identical formula from a local `QUOTE_MATERIAL_FACTORS` table so a vendor still gets a number when the AI service is down. Both paths were verified to agree on all 11 cases.
- **UI** an "AI Quotation Estimate" fieldset inside the vendor `QuotationFormModal` with base price, material, quantity and a custom-sizing toggle. On success the estimate writes into the Amount field, and the vendor can overwrite it — the estimator suggests, it does not decide.
- **Tests** 12 new integration cases (`ai.identity.test.js`) covering the 401 guard, all five material factors, the unknown-material fallback, quantity-0 clamping, and a junk-input case asserting the total is never `NaN`.

| Input | Formula | Estimated total | Source |
|---|---|---|---|
| teak, 85 000, ×4 | 85 000 × 4 × 1.25 | **LKR 425 000** | `fastapi` |
| teak, 85 000, ×4, custom | 85 000 × 4 × 1.25 × 1.20 | **LKR 510 000** | `fastapi` |
| mahogany, 85 000, ×4 | 85 000 × 4 × 1.18 | LKR 401 200 | `fastapi` |
| walnut, 85 000, ×2, custom | 85 000 × 2 × 1.15 × 1.20 | LKR 234 600 | `fastapi` |
| bamboo, 85 000, ×5 | 85 000 × 5 × 0.82 | LKR 348 500 | `fastapi` |
| unobtainium, 85 000, ×2 | 85 000 × 2 × 1.00 (unknown → 1.0) | LKR 170 000 | `fastapi` |

Screenshots `H1-quote-form.png` → `H2-estimate-result.png` → `H3-custom-size.png` in `docs/evidence/` show the real form, the returned LKR 425 000, and the custom-sizing variant at LKR 510 000, each annotated with the arithmetic that produced it. `H-quote-ui-payload.json` holds the three verbatim API responses the browser received.

**Objective 4 — Security in depth with fail-closed behaviour. ✅ Achieved.**
JWT auth via `jsonwebtoken`, `bcryptjs` cost-12 hashing, RBAC on all mutating routes, `helmet` headers, separate auth and API rate limiters, server-side pricing (`totalAmount: 1` sent by a client yields the server-computed 256 000), and parameterised SQL throughout. All 8 AI endpoints require `x-api-key` and return 503 when `AI_SERVICE_API_KEY` is unset or holds a shipped placeholder (`""`, `change-me-in-production`, `changeme`). `buildAiPayload()` destructures client-supplied identity *out* of the body and re-inserts the JWT-derived values, so there is no window in which client identity is used.

**Objective 5 — Passing test suite across three layers plus a documented checkout path. ✅ Achieved.**
323 of 323 cases pass against a live PostgreSQL 18.6 database: 118 pytest, 156 vitest frontend, 49 vitest API integration. The API tests use real Express routers and a real `pg.Pool` rather than mocks. Graceful degradation is separately verified — 96 pass and 22 skip with no database configured. The checkout path is exercised end-to-end by shell scripts.

### 3.8.3 Problems encountered

**The dataset was too small to train a usable classifier, and this was discovered empirically.** `early_stopping=True` on 73 examples stopped training at iteration 12 and scored 0.136 accuracy. Disabling it (`nlu.py:261`) fixed convergence but not the underlying problem: with no train/validation split and 10 classes, the model overfits its own training set and reaches only 61 % on unseen phrasing. This is a data limitation, not an algorithmic one, and no amount of hyperparameter tuning would have fixed it.

**The intent boundary between `production` and `order_tracking` is genuinely ambiguous.** "How far along is my order" is a progress question that a human would answer from order data. The classifier sends it to `order_tracking` 2 times out of 5. Rather than force a boundary, the pragmatic answer is that these two intents should share a handler — a finding that emerged from evaluation, not design.

**The image-analysis heuristic misclassifies flat backgrounds.** Boundary testing over synthetic images found that `is_likely_room` (`main.py:565`) has no lower bound on texture: any flat, bright, warm-or-neutral field satisfies all four of its conditions. Pure white, off-white and flat mid grey — **3 of 6 flat colours tested** — were all labelled "likely room scene". Since white-background photography is the dominant marketplace listing style, this is a live false positive, not a theoretical one. Colour extraction itself is exact (a 50/50 two-colour image returned shares of 0.4999 / 0.4998), so the defect is confined to the classification branch.

**The stock-decision `reason` string is wrong on the forced-override path.** `classify_stock_item()` (`main.py:141`) computes `manufacture_required = stock_type == "out" or available < quantity` but picks the reason from `manufacture_required` alone. If a vendor forces `stockType: "out"` on a line with 50 units in stock for a quantity of 1, the endpoint returns `decision: "manufacture"` with `reason: "Available stock is lower than customer quantity"` — a statement that is simply untrue. The decision and flags are correct; only the justification misleads. Caught by boundary sweep during evaluation and left unpatched deliberately, since changing it is a behaviour change that should be reviewed.

**Database connectivity in deployment cost more time than the AI work.** `db.js:11-56` builds an ordered candidate list of Supabase pooler endpoints across nine regions on ports 6543 and 5432, with `dns.setDefaultResultOrder("ipv4first")` working around IPv6-first resolution failures on Railway's network. This is defensive complexity that exists solely because hosted Postgres pools resolve unreliably from Railway's egress — a problem the local environment never reproduced.

**The vendor order notification never fired, because a middleware was mounted in the wrong order.** This is the most significant defect found in the project, and it was invisible to every test that existed. `registerRoutes(app, io)` in `backend/api/src/routes/index.js` mounted `ordersRouter` at line 21 and only afterwards registered the middleware that assigns `request.io = io`. Express executes middleware in registration order, so by the time any order handler ran, `request.io` was `undefined`. The notification block in `orders.js:109` sits behind `if (request.io)`, so the guard silently evaluated false and `io.emit` was never called. **Every order placed on the platform created a database row and no notification.** The endpoint returned HTTP 201, the order appeared in the customer's history, and the vendor's notifications page stayed empty — the feature was dead while reporting complete success.

The fix is to register the `request.io` middleware before the first router mount. The accompanying test is written to guard the ordering itself, and was confirmed to **fail 3 of its 4 cases against the original code** before passing against the fix — a regression test that does not fail without the regression is not a regression test.

**Three vendor pages crashed on open, from a missing import.** `getFutureDateLabel` was defined and exported inside `customer/ProfilePage.jsx`, but `VendorQuotationsPage`, `VendorProductionTrackingPage` and `VendorSuppliersPage` all called it without importing it. The Create Quotation, Create Work Order and supplier forms therefore threw `getFutureDateLabel is not defined` the instant they mounted — a white screen, not a degraded feature. The 156 component tests did not catch it because none of them opened these modals. The helper was moved to a shared `src/lib/dates.js` and imported by all four call sites. **This was a pre-existing defect in the committed code, not a regression introduced by this work.**

**Client-supplied pricing was an original vulnerability.** `helpers.js:3` records it plainly: the browser used to send its own total, "which let a caller set their own price." The fix was to reduce `parseOrderItems()` to returning only `{id, quantity}` and look up everything else server-side — so the return *type* became the security control.

**Stale performance figures entered this report and had to be measured out.** Latency claims of 35.7 ms p50, 8.8 s cold start and 311–617 ms image analysis were estimates, not measurements. Actual measurement showed them 4–39× pessimistic. A second measurement round over real HTTP with 30 repetitions refined the image figures again (analyse 34.7 → 23.63 ms). Every figure in this report is now reproducible via the commands in §3.6.2.

### 3.8.4 Honest limitations

1. **The 61 % figure is the fallback, not the deployed system.** With an LLM key configured, routing goes through the LLM path; without one, it degrades to 61 %. The LLM path has unit tests with a mocked transport but was **never measured end-to-end**, because no key was available in the evaluation environment. Its real accuracy and latency are unknown.
2. **73 examples, 10 classes, no split.** There is no held-out set carved from training, no cross-validation, and no class balancing. The 41-message probe is self-authored by the same person who wrote the implementation, which risks probes that match the code's assumptions.
3. **Small per-intent samples.** Cells of n = 2 to 6 (e.g. `general_help` at 0 %) are indicative only. At n = 41 a 90 % result and a 70 % result are both within sampling noise of 61 %.
4. **The confidence gate is set too low to be useful.** 0.18 catches only the lowest 7.3 % of predictions. Most errors remain confident. Raising it to ≈ 0.50 would catch more errors at the cost of more turns falling back — a real trade-off, not a clear improvement.
5. **`general_help` is structurally unreachable as a predicted class.** It is in `ALLOWED_INTENTS` but has zero training examples.
6. **No user study.** Nothing here measures whether grounded answers actually improve customer trust or shorten order cycles — the outcomes that motivated the project. §3.2 cites literature establishing that transparency and groundedness matter [1]–[4]; this project demonstrates the mechanism, not the effect.
7. **Rule-based vision, not learned perception.** The furniture/room heuristic encodes a hand-chosen hue window. It is cheap, explainable and auditable, but it will misclassify furniture in non-wood finishes and unpainted rooms.
8. **`is_likely_room` also fires on flat, textureless backgrounds.** The branch has no minimum-texture condition, so pure white, off-white and flat mid grey images are all labelled "likely room scene" — 3 of 6 flat colours tested. White-background product photography is the most common listing style on the platform, so this mislabels a large share of genuine product shots. The colour extraction itself is exact; the defect is confined to classification.
9. **The `reason` string on a vendor-forced stock decision is false.** `manufacture_required` is true either because stock is short *or* because `stockType` was overridden, but the reason always claims stock is insufficient. The decision and flags are correct; the explanation is not.
10. **`three.js` and MiDaS/DPT are declared but not implemented** — the former is an unused dependency in `frontend/package.json`, the latter appears only in documentation. `README.md` overstates the stack.
11. **No CI pipeline.** Railway and Vercel build on push, but there is no `.github/workflows` and no automated test gate before deploy. Nothing prevents shipping a regression.
12. **The e2e checkout path is asserted by shell scripts, not a framework.** No Playwright/Cypress browser test exercises the React UI end-to-end, so UI regressions are only caught by the 156 component-level cases.
13. **The test suites mutate the shared database.** `npm run test:api` truncates seeded rows, so running it against a database that also serves a live stack destroys the data that stack is using.
14. **Notifications are emit-only and cannot be retrieved.** `POST /api/notifications` returns HTTP 201 and pushes to connected sockets, but `GET /api/notifications` returns 404 and there is no `notifications` table. A vendor who was offline when an order arrived has no way to learn it existed — the message is gone. There is no unread badge, no persistence and no history. The notification test asserts `GET /api/notifications` **returns 404** rather than treating it as a gap to close, which documents the design rather than endorsing it.
15. **A single feature was dead in the committed code and no test noticed.** The vendor order notification had never emitted (see §3.8.3). The API suite returned HTTP 201 and asserted the response body, which is exactly what a broken notification looks like from the test's side. Only attaching a real WebSocket client to the server revealed it.
16. **Six of the eight AI endpoints are not reachable from the React interface.** Only `POST /api/ai/chat` and `POST /api/ai/quote-estimate` have both a proxy route in `routes/ai.js` and a caller in `frontend/src`. The three image endpoints (`/ai/image/validate`, `/ai/image/analyze`, `/ai/image/compare`) and `/ai/customization-recommendations` have **no proxy and no UI caller at all** — they are reachable only by calling the AI service directly with `x-api-key`. `POST /ai/stock-decision` is proxied but never called by the UI either; the vendor UI uses the local `/api/orders/evaluate-stock` heuristic instead. This was verified by grepping `frontend/src` for every `/api/ai/*` path (two matches) and cross-checking against the `@app` decorators in `main.py` (eight). The image techniques are therefore fully implemented, fully tested and fully measured, but a reviewer clicking through the running site will never see them.
17. **The customer↔vendor realtime chat screen does not exist.** `POST/GET /api/messages` are implemented, role-scoped and covered by tests, but **no React component calls either endpoint** — verified by grepping `frontend/src` for `api/messages` (zero matches). The `realtime_chat` intent is recognised and returns static guidance with suggested next steps; it does not bridge into a live thread. What *is* wired in the browser is the notification path: `VendorDashboardPage` opens a Socket.IO connection, joins `woodverse-notifications` and renders incoming `notification:event` payloads. So the platform can prove its realtime transport end to end, but only for order notifications — the messaging feature that the architecture diagram advertises is API-only.

### 3.8.5 Future work

**Highest value — directly targets the measured 61 %:**

1. **Expand the intent dataset to ~600 examples with explicit contrastive pairs.** The confusions are specific and fixable: `production` vs `order_tracking` ("how far along is my order"), `stock_manufacture` vs `delivery` ("do you ship to Kattiya"), `stock_manufacture` vs `vendor_supplier`. Adding minimum 20 hard negatives per boundary should lift the two 20 % intents substantially. Highest expected return per hour of any item here.
2. **Add `general_help` examples, or remove it from `ALLOWED_INTENTS`.** An intent that cannot be predicted should not be advertised as one.
3. **Introduce a proper split — 70/15/15 train/validation/test — and tune the confidence gate on the validation set** rather than leaving it at 0.18.
4. **Measure the LLM path.** Obtain a key, run the same 41-message probe through it, and report both classifiers side by side with real latency. Until then the project's headline AI number describes only its fallback.
5. **Replace or augment the fallback with a fine-tuned small model** (e.g. a distilled intent classifier) if the LLM path proves too costly per request at scale.

**Product capability:**

6. **Fix the stock-decision reason string** so a vendor-forced manufacturing route reports *"Vendor marked this item as made to order"* instead of claiming stock is insufficient. Small change at `main.py:160`, but it matters because a vendor reading a false justification may distrust a correct decision.
7. **Add a minimum-texture guard to `is_likely_room`** so flat white or grey product backgrounds are classified as neither furniture nor room. One extra condition on `edgeDensity` or `k-means` colour count at `main.py:590` fixes a false positive that affects the most common listing style in the catalogue.
8. **Persist notifications.** The table, an unread badge and a "you missed 3 order alerts while offline" view would turn a lossy live-only channel into something a vendor can rely on to run their business.
8. **Order-write actions via the assistant** — the identity boundary in `buildAiPayload()` already makes this safe. A verified "cancel my order" flow would extend the assistant from read-only to transactional.
9. **True multi-turn context**, tracking the last order discussed so a bare "what about the other one?" resolves without re-stating the reference.
10. **Multilingual intent support** (Sinhala, Tamil) given the Sri Lankan deployment context — a genuine gap, since all 73 examples are English.
11. **Replace the rule-based vision heuristics with a small CNN** *only if* a labelled corpus is collected first; the current rules are the right choice at this data volume.

**Engineering:**

11. **Add a CI workflow** running all three suites plus the e2e scripts on every push, blocking deploy on failure. This is cheap and removes risk 9 entirely.
12. **Isolate the test database.** `npm run test:api` truncates seeded data — running it against `woodverse_test` wiped 9 products and 4 accounts mid-session, which broke a live stack mid-capture. Give the suites their own throwaway database, or wrap each run in a transaction that rolls back.
13. **Add Playwright browser tests** for the checkout and quotation paths so UI regressions are caught, not just component behaviour. A missing import broke three vendor pages while all 156 component tests still passed, which is exactly the class of defect component tests cannot see.
14. **Resolve the IPv6/pooler fragility** by pinning a single known-good Supabase region instead of probing nine candidates at connection time.
15. **Correct `README.md`** to remove MiDaS/DPT and either use or drop `three.js`, so the documented stack matches the implemented one.
16. **Run a small user study** — even 10–15 customers with a questionnaire on trust and order-cycle perception — to test whether the mechanism delivers the outcome the literature predicts [1]–[4].

### 3.8.6 Closing statement

WoodVerse delivers what it set out to deliver on the dimension that matters most for a commerce system: **it cannot lie about an order.** By confining the language model to selecting a label, extracting identifiers by regex, and rendering every fact from a parameterised SQL row, the project removes the hallucination failure mode documented in [4]–[6] by construction rather than by mitigation — verified at 7 / 7 against adversarial probes. Around that core it delivers a complete five-role platform with 307 / 307 tests passing and a measured 1.1 ms response.

Where it falls short is the adaptive component. A 61 %-accurate fallback classifier on 73 examples is not production-grade, and the honest conclusion is that the dataset, not the architecture, is the binding constraint. The architecture is sound enough that item 1 of the future-work list — more data on two specific intent boundaries — is likely to move the number substantially. That is the clearest available evidence that the design will scale with effort, even though the current system does not yet deserve that claim.
---

## 4 References

[1] Zhou, L. (2018). Perceived information transparency in B2C e-commerce. *Decision Support Systems*. https://www.sciencedirect.com/science/article/abs/pii/S0378720617305086

[2] Frizzo, F., & Dias, H. B. A. (2020). The genuine handmade: How the production method influences consumers' behavioral intentions through naturalness and authenticity. *Journal of Food Products Marketing, 26*(4). https://doi.org/10.1080/10454446.2020.1765936

[3] Razaq, L., Kolko, B., & Hsieh, G. (2022). Making crafting visible while rendering labor invisible on the Etsy platform. In *Proc. Designing Interactive Systems Conference (DIS '22)*. ACM. https://doi.org/10.1145/3532106.3533573

[4] Larsen, A. G., Skjuve, M., Følstad, A., & van As, N. (2025). LLM hallucinations in conversational AI for customer service: Framework and end-user perceptions. *International Journal of Human–Computer Interaction*, 1–22. https://doi.org/10.1080/10447318.2025.2580540

[5] Shuster, K., Poff, S., Chen, M., Kiela, D., & Weston, J. (2021). Retrieval augmentation reduces hallucination in conversation. In *Findings of the Association for Computational Linguistics: EMNLP 2021*, pp. 3784–3803. https://aclanthology.org/2021.findings-emnlp.320/

[6] Li, J., Chen, J., Ren, R., Cheng, X., Zhao, X., Nie, J.-Y., & Wen, J.-R. (2024). The dawn after the dark: An empirical study on factuality hallucination in large language models. In *Proc. 62nd Annual Meeting of the ACL (Volume 1: Long Papers)*, pp. 10879–10899. https://aclanthology.org/2024.acl-long.586/

[7] Ji, Z., Lee, N., Frieske, R., Yu, T., Su, D., Xu, Y., & Fung, Y. (2023). Survey of hallucination in natural language generation. *ACM Computing Surveys, 55*(12), Article 248. https://doi.org/10.1145/3571730

[8] Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., & Kiela, D. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. In *Advances in Neural Information Processing Systems 33 (NeurIPS 2020)*. https://arxiv.org/abs/2005.11401

[9] Gao, Y., Xiong, Y., Gao, X., Jia, K., Pan, J., Bi, Y., & Wang, H. (2023). Retrieval-augmented generation for large language models: A survey. *arXiv:2312.10997*. https://arxiv.org/abs/2312.10997

[10] Boegman, S. J., et al. (2023). Seeing through transparency in the craft chocolate industry. *Business Strategy and the Environment*. https://www.sciencedirect.com/science/article/pii/S2666154323002466

[11] Supply chain visibility: A Delphi study on managerial perspectives and priorities. (2022). *International Journal of Production Research*. https://www.tandfonline.com/doi/full/10.1080/00207543.2022.2098873

[12] Dell'Orto, M., et al. (2024). The role of data visibility in the control and automation of modern supply chains — a model predictive control case study. *Journal of Supply Chain Management Science, 5*(3–4). https://journals.open.tudelft.nl/jscms/article/download/7800/6154/30259

[13] Ponte, B. (2018). The value of lead time reduction and stabilization. *Transportation Research Part E: Logistics and Transportation Review*. https://www.sciencedirect.com/science/article/abs/pii/S1366554517301199

[14] Arthur, D., & Vassilvitskii, S. (2007). k-means++: The advantages of careful seeding. In *Proc. 18th Annual ACM-SIAM Symposium on Discrete Algorithms (SODA '07)*, pp. 1027–1035.

[15] Orchard, S., & Oliphant, A. (2009). A survey of colour quantization techniques. *ACM Computing Surveys, 41*(4), Article 15.

[16] Bradski, G. (2000). The OpenCV library. *Dr. Dobb's Journal of Software Tools*, 25(11), 120–126.

---

Appendices

## Appendix A: Individual Contributions

### A.1  Team Leader
Name: Denuri Vilara    Index No.: cit-24-01-0529
What I built: I set the architecture of the three services and one database, wrote the aim and the five objectives, and defined the five user roles. I wrote the security rules the rest of the team followed: identity from the JWT, server-side pricing, API key with fail-closed 503 and a fallback when the AI service is down. I coordinated the 45 commits between 2026-07-29 and 2026-10-04, joined the parts together and led the writing of this report and the presentation.I designed admin ui/ux.
What I learned: I learned how to turn a broad idea into modules that different people can build in parallel, and how much time clear interfaces (endpoints, payloads) save. I also learned that a design rule is only useful once a test enforces it.
Problems I met and how I solved them: At first the chatbot design let the model fill in order details, which risked invented data. We changed the rule so the model only picks an intent and the order id comes from a regex. Keeping five members' work consistent was another challenge; short regular check-ins and a shared test suite solved it.

### A.2  Front-End Developer
Name: Dimalsha Kinkini    Index No.: cit-24-01-0541
What I built: I built the React 18 interface with Tailwind CSS and Vite: the marketplace, vendor portal, supplier portal and admin console, about 16,231 lines in 78 .jsx and 22 .js files. I wrote ChatbotPage.jsx and the apiRequest wrapper that adds the bearer token to each call, and I wrote the 156 front-end tests with vitest.Idesinged vendor portal  ui/ux desing 
What I learned: I learned how to organise a large interface for several user roles, keep components reusable and test them without a real server. I also learned to show loading, error and fallback states clearly, because the assistant can be slow or offline.
Problems I met and how I solved them: The first chat call was slow because the AI model loads on start-up, which could look like a frozen screen. I added clear waiting and fallback messages in the interface. Another problem was keeping screens for different roles consistent, which I solved by sharing components.

### A.3  Backend Developer
Name: Tharuka Prabathiya   Index No.: cit-24-01-0279
What I built: I built the Node/Express API (12 route files, 731 lines) and the FastAPI AI service (7 Python modules, 1,522 lines). This includes login, JWT checks and role-based access, order placement with server-side prices, the AI proxy with an 8-second timeout, the intent classifier with the scikit-learn fallback, the order-status reader and the image endpoints.I desinged  public storefront ui/ux desing 
What I learned: I learned how to use an LLM safely as a router rather than an author, how to design a fallback path and how to protect endpoints with an API key that fails closed. I also learned how much a parameterised query protects against injection.
Problems I met and how I solved them: The model sometimes returned a made-up order id or text that was not JSON. I fixed this by extracting ids only with a regex, validating the model's JSON against an allowed list of intents and falling back to the offline classifier. Clients could also send a fake actorId, so the API now overwrites it with the token's identity.

### A.4  Database Administrator
Name: Lakshan Kavinda   Index No.: cit-24-01-0424
What I built: I designed the PostgreSQL schema (database/schema.sql: 138 lines, 10 tables, 12 indexes) and wrote the seed file (67 lines; 4 accounts, 2 vendors, 9 published products) so it can run more than once without errors (ON CONFLICT DO NOTHING). I set up the woodverse_test database on PostgreSQL 18.6 for the test suites and reviewed that queries use bound parameters.I desinged  supplier ui/ux desing 
What I learned: I learned how indexes follow the way the application searches (by customer, by order, by vendor), how to write a safe repeatable seed script, and how row-level rules such as "customer id and order id together" protect private data.
Problems I met and how I solved them: Tests that need a database failed on machines without one. We solved this by making the AI service tests skip cleanly when there is no database (96 passed, 22 skipped) while the full run passes against the live test database. Keeping the schema, seed data and tests in step as tables changed took careful versioning.

### A.5  QA / Test Engineer
Name: Dilmith Oveen    Index No.: cit-24-01-0259
What I built: I planned and ran the testing: pytest for the AI service (118 tests), vitest integration tests for the API (49 tests), the front-end suite (156 tests) and two end-to-end shell scripts (14 assertions). I wrote the security cases: a customer reading another customer's order, a hallucinated order id, a forged total, a fake actorId and SQL injection. I recorded the results in the test tables in Chapter 7.I desined authentication and few pubic sorefront ui/ux design.
What I learned: I learned how to write tests that check behaviour rather than code, why integration tests against a real database catch problems that mocks hide, and how to choose a few representative cases for a report.
Problems I met and how I solved them: Some failures only appeared with the real database or a real network call. I solved this by running the suites against a live PostgreSQL instance and using a mock LLM server to test the transport settings. Keeping 307 tests readable meant using clear test names such as test_customer_cannot_read_another_customers_order.