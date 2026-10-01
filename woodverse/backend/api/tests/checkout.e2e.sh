#!/usr/bin/env bash
# Proves the whole path: register -> login -> place a real order -> ask the chatbot
# about it. Fails loudly if the order does not reach PostgreSQL.
set -euo pipefail

# tests/ -> api/ -> backend/ -> woodverse/
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
API_PORT="${API_PORT:-4310}"
AI_PORT="${AI_PORT:-8310}"
VENV="$ROOT/backend/ai-service/.venv"
API_DIR="$ROOT/backend/api"
LOG_API=/tmp/woodverse-checkout-api.log
LOG_AI=/tmp/woodverse-checkout-ai.log

export DATABASE_URL="${DATABASE_URL:?set DATABASE_URL to a database built from database/schema.sql}"
export JWT_SECRET="${JWT_SECRET:-checkout-e2e-secret}"
export AI_SERVICE_API_KEY="${AI_SERVICE_API_KEY:-checkout-e2e-ai-key}"
export AI_SERVICE_URL="http://127.0.0.1:${AI_PORT}"
export AI_SERVICE_TIMEOUT_MS=8000
export PORT="$API_PORT"

CLEANUP_EMAIL="checkout-e2e-$$@example.com"
CLEANUP_PASSWORD="Sup3rSecret!23"

cleanup() {
  # The subshells are backgrounded, so killing $API_PID/$AI_PID would only stop the
  # wrapper and leave node/uvicorn holding the port. Kill the process group instead,
  # then make sure the port is actually free before anyone curls it.
  for pid in "${API_PID:-}" "${AI_PID:-}"; do
    [ -n "$pid" ] && kill -- "-$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  for _ in $(seq 1 20); do
    if ! (exec 3<>"/dev/tcp/127.0.0.1/${API_PORT}") 2>/dev/null && \
       ! (exec 3<>"/dev/tcp/127.0.0.1/${AI_PORT}") 2>/dev/null; then
      return
    fi
    sleep 0.25
  done
}
trap cleanup EXIT

# Refuse to run against a port someone else already owns, otherwise a stale process
# answers with old code and the assertions below test nothing.
for port in "$API_PORT" "$AI_PORT"; do
  if (exec 3<>"/dev/tcp/127.0.0.1/${port}") 2>/dev/null; then
    echo "port ${port} is already in use. Stop that process or set API_PORT/AI_PORT." >&2
    exit 1
  fi
done

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q <<SQL
DELETE FROM orders WHERE customer_id IN (SELECT id FROM users WHERE email = '${CLEANUP_EMAIL}');
DELETE FROM users WHERE email = '${CLEANUP_EMAIL}';
SQL

echo "==> booting API on ${API_PORT}"
(cd "$API_DIR" && exec setsid node src/server.js >"$LOG_API" 2>&1) &
API_PID=$!

echo "==> booting AI service on ${AI_PORT}"
(cd "$ROOT/backend/ai-service" && exec setsid "$VENV/bin/python" -m uvicorn src.main:app --host 127.0.0.1 --port "$AI_PORT" >"$LOG_AI" 2>&1) &
AI_PID=$!

for _ in $(seq 1 60); do
  curl -sf "http://127.0.0.1:${API_PORT}/api/health" >/dev/null 2>&1 && break
  sleep 0.5
done
curl -sf "http://127.0.0.1:${API_PORT}/api/health" >/dev/null || { echo "API never came up"; tail -30 "$LOG_API"; exit 1; }

# Reads a dotted path out of JSON on stdin, e.g. jq-free equivalent of `jq -r .a.b`.
json_get() {
  python3 -c 'import json,sys
path=sys.argv[1].lstrip(".")
cur=json.load(sys.stdin)
for part in path.split("."):
    cur = cur[int(part)] if isinstance(cur, list) else cur[part]
print(cur)' "$1"
}

echo
echo "==> a visitor cannot self-register as admin"
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "http://127.0.0.1:${API_PORT}/api/auth/register" \
  -H 'content-type: application/json' \
  -d '{"email":"attacker@example.com","fullName":"Attacker","role":"admin","password":"password123"}')
echo "status=$code"
[ "$code" = "400" ] || { echo "FAIL: admin self-registration was not refused"; exit 1; }

echo
echo "==> an anonymous visitor cannot create a user"
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "http://127.0.0.1:${API_PORT}/api/users" \
  -H 'content-type: application/json' \
  -d '{"email":"attacker2@example.com","fullName":"Attacker","role":"admin","password":"password123"}')
echo "status=$code"
[ "$code" = "401" ] || { echo "FAIL: unauthenticated user creation was not refused"; exit 1; }

echo
echo "==> registering a customer"
curl -sf -X POST "http://127.0.0.1:${API_PORT}/api/auth/register" \
  -H 'content-type: application/json' \
  -d "{\"email\":\"${CLEANUP_EMAIL}\",\"fullName\":\"Checkout Tester\",\"password\":\"${CLEANUP_PASSWORD}\"}" \
  >/tmp/woodverse-checkout-register.json
python3 -c "import json;d=json.load(open('/tmp/woodverse-checkout-register.json'));print('role:',d['user']['role'],'status:',d['user']['status'])"

echo
echo "==> signing in"
TOKEN=$(curl -sf -X POST "http://127.0.0.1:${API_PORT}/api/auth/login" \
  -H 'content-type: application/json' \
  -d "{\"email\":\"${CLEANUP_EMAIL}\",\"password\":\"${CLEANUP_PASSWORD}\"}" | json_get token)
CUSTOMER_ID=$(psql "$DATABASE_URL" -tAc "SELECT id FROM users WHERE email = '${CLEANUP_EMAIL}'")
echo "signed in, customer_id=${CUSTOMER_ID}"

echo
echo "==> a wrong password is refused"
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "http://127.0.0.1:${API_PORT}/api/auth/login" \
  -H 'content-type: application/json' -d "{\"email\":\"${CLEANUP_EMAIL}\",\"password\":\"wrong\"}")
echo "status=$code"
[ "$code" = "401" ] || { echo "FAIL: wrong password was accepted"; exit 1; }

echo
echo "==> picking a real product from the catalog"
PRODUCT_ID=$(curl -sf "http://127.0.0.1:${API_PORT}/api/catalog" | python3 -c "
import json,sys
products=[p for p in json.load(sys.stdin)['products'] if p['quantityAvailable']>4]
if not products: raise SystemExit('no in-stock product in the catalog')
print(products[0]['id'])")
PRODUCT_NAME=$(curl -sf "http://127.0.0.1:${API_PORT}/api/catalog" | python3 -c "
import json,sys
products=[p for p in json.load(sys.stdin)['products'] if p['quantityAvailable']>4]
print(products[0]['name'])")
echo "product: ${PRODUCT_NAME} (${PRODUCT_ID})"

echo
echo "==> placing an order, trying to dictate the price and the owner"
curl -sf -X POST "http://127.0.0.1:${API_PORT}/api/orders" \
  -H 'content-type: application/json' -H "authorization: Bearer ${TOKEN}" \
  -d "{\"items\":[{\"id\":\"${PRODUCT_ID}\",\"quantity\":1,\"price\":1,\"name\":\"Free\"}],\"totalAmount\":1,\"customerId\":\"00000000-0000-4000-8000-000000009999\"}" \
  >/tmp/woodverse-checkout-order.json
python3 - <<'PY'
import json
d = json.load(open("/tmp/woodverse-checkout-order.json"))
order = d["order"]
print("order id:      ", order["id"])
print("db total:      ", order["total_amount"])
print("server pricing:", d["pricing"])
print("line unitPrice:", d["fulfillmentPlan"][0]["unitPrice"])
print("line name:     ", d["fulfillmentPlan"][0]["name"])
print("status:        ", order["status"])
assert d["pricing"]["total"] != 1, "server accepted the client total"
assert d["fulfillmentPlan"][0]["unitPrice"] != 1, "server accepted the client line price"
assert d["fulfillmentPlan"][0]["name"] != "Free", "server accepted the client line name"
PY

ORDER_ID=$(python3 -c "import json;print(json.load(open('/tmp/woodverse-checkout-order.json'))['order']['id'])")

echo
echo "==> the row really is in PostgreSQL, owned by the caller"
psql "$DATABASE_URL" -c "SELECT id, customer_id, total_amount, status FROM orders WHERE id = '${ORDER_ID}'"
OWNER=$(psql "$DATABASE_URL" -tAc "SELECT customer_id FROM orders WHERE id = '${ORDER_ID}'")
[ "$OWNER" = "$CUSTOMER_ID" ] || { echo "FAIL: order owner is ${OWNER}, expected ${CUSTOMER_ID}"; exit 1; }
echo "order is owned by the signed in customer"

echo
echo "==> asking the chatbot about that exact order"
for _ in $(seq 1 60); do
  curl -sf "http://127.0.0.1:${AI_PORT}/health" >/dev/null 2>&1 && break
  sleep 0.5
done
curl -sf -X POST "http://127.0.0.1:${AI_PORT}/ai/chat" \
  -H 'content-type: application/json' -H "x-api-key: ${AI_SERVICE_API_KEY}" \
  -d "{\"message\":\"what is happening with order ${ORDER_ID}\",\"actorId\":\"${CUSTOMER_ID}\",\"actorRole\":\"customer\"}" \
  | python3 -c "
import json,sys
d=json.load(sys.stdin)
print('intent:', d['intent'], '| source:', d['source'])
print(d['reply'])
data=d.get('orderData') or {}
order=data.get('order') or {}
assert data.get('scope')=='single', f\"expected a single order, got {data.get('scope')}\"
assert order.get('orderId')=='$ORDER_ID', 'chatbot resolved a different order'
name='$PRODUCT_NAME'
assert name in d['reply'], f'chatbot reply did not mention {name}'
print()
print('PASS: the chatbot answered from the order the customer just placed')
"

echo
echo "==> a malformed actor id is answered as signed out, not queried"
curl -sf -X POST "http://127.0.0.1:${AI_PORT}/ai/chat" \
  -H 'content-type: application/json' -H "x-api-key: ${AI_SERVICE_API_KEY}" \
  -d "{\"message\":\"where is my order\",\"actorId\":\"' OR 1=1 --\",\"actorRole\":\"admin\"}" \
  | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(d['reply'])
assert d.get('orderData') is None, 'malformed actor id reached the database'
print('no order data returned')
"

echo
echo "==> anon access is rejected"
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "http://127.0.0.1:${AI_PORT}/ai/chat" \
  -H 'content-type: application/json' \
  -d '{"message":"where is my order","actorId":"00000000-0000-4000-8000-000000009999"}')
echo "ai without service key status=$code"
[ "$code" = "401" ] || [ "$code" = "403" ] || { echo "FAIL: ai service accepted a request with no service key"; exit 1; }

code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "http://127.0.0.1:${API_PORT}/api/orders" \
  -H 'content-type: application/json' -d '{"items":[]}')
echo "api without token status=$code"
[ "$code" = "401" ] || { echo "FAIL: anonymous order creation was not refused"; exit 1; }

code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${API_PORT}/api/orders")
echo "api GET without token status=$code"
[ "$code" = "401" ] || { echo "FAIL: anonymous order list was not refused"; exit 1; }

echo
echo "all checkout checks passed"
