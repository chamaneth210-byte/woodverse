# WoodVerse AI Service

FastAPI service for WoodVerse AI assistance and operational decisions.

## Stack

- FastAPI for HTTP APIs
- An external OpenAI-compatible LLM for intent classification
- Scikit-learn as the offline intent fallback
- Psycopg for order status lookups
- Uvicorn for local development

## How A Chat Message Is Answered

The chatbot does not generate order answers. Every order status, total, and date in a
reply comes from a row this service read out of Postgres.

1. **Route.** The message is classified into one of 11 allowlisted intents by the LLM
   (`temperature: 0`, JSON only). The model is told it may not answer questions and may
   not state order data. If `AI_LLM_API_KEY` is unset, or the reply is not valid JSON, or
   the intent is not on the allowlist, the service falls back to the bundled
   scikit-learn TF-IDF + MLP classifier.
2. **Resolve the reference.** An order id is only ever extracted by a deterministic regex
   over the raw message. The model never supplies an id, so it cannot introduce an order
   that the user did not name.
3. **Read.** `order_status.load_order_status` queries `orders` with the caller's id always
   bound as a parameter, so a customer can only ever see their own rows.
4. **Render.** `replies.render_order_reply` formats the reply from the returned row. There
   is no free-text generation over order data.

The acting user id is injected by the Node API from its verified JWT
(`routes/ai.js: buildAiPayload`) and overwrites anything the browser sent.

### Deliberate limits

- `GET /health` is open. Every other endpoint requires `x-api-key`, and the service fails
  closed with a 503 when `AI_SERVICE_API_KEY` is unset or still the shipped placeholder.
- The model is never asked to write an order status. If it tries to, the value shown is
  whatever SQL returned.
- When Postgres is unreachable the chatbot says so rather than guessing.

## Local Setup

```bash
cd backend/ai-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

Set `DATABASE_URL` to the same database the Node API uses, otherwise the chatbot reads
stale rows.

## Tests

```bash
# unit + integration, order tests need a database
TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/woodverse_test \
  .venv/bin/python -m pytest tests/ -q

# boots the real API and the real AI service against a live database
DATABASE_URL=postgresql://user:pass@localhost:5432/woodverse_test ./tests/e2e.sh
```

## Endpoints

- `GET /health`
- `POST /ai/chat`
- `POST /ai/stock-decision`
- `POST /ai/quote-estimate`
- `POST /ai/customization-recommendations`
- `POST /ai/image/validate` — base64 image → size/format/orientation check
- `POST /ai/image/analyze` — base64 image → dominant colors, brightness, sharpness, furniture/room heuristic
- `POST /ai/image/compare` — two base64 images → similarity score

All `/ai/*` endpoints require the `x-api-key` header matching `AI_SERVICE_API_KEY`.

## Role In The App

The Node/Express API calls this service through `AI_SERVICE_URL` and falls back to deterministic API responses if the AI service is offline. This lets React pages continue working during frontend-only development.
