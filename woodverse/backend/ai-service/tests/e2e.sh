#!/usr/bin/env bash
# End-to-end check: real Node API -> real FastAPI AI service -> real PostgreSQL.
#
# Requires both services to start with a shared DATABASE_URL, so this script boots them,
# drives a signed-in customer through /api/ai/chat, and prints what came back.
set -uo pipefail

API_PORT=${API_PORT:-4200}
AI_PORT=${AI_PORT:-8200}
export DATABASE_URL=${DATABASE_URL:?set DATABASE_URL to a test database}
export JWT_SECRET=${JWT_SECRET:-e2e-test-secret}
export AI_SERVICE_URL="http://127.0.0.1:${AI_PORT}"
export PORT="${API_PORT}"
export WEB_ORIGIN="http://localhost:5173"
export AI_SERVICE_API_KEY=${AI_SERVICE_API_KEY:-e2e-service-key}

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENV="${AI_VENV:-${ROOT}/.venv}"

E2E_EMAIL=${E2E_EMAIL:-e2e@example.com}
E2E_PASSWORD=${E2E_PASSWORD:-e2epass123}
E2E_USER_ID="99999999-9999-4999-8999-999999999999"
E2E_VENDOR_USER="33333333-3333-4333-8333-333333333333"
E2E_VENDOR_ID="44444444-4444-4444-8444-444444444444"
E2E_ORDER_ID=${E2E_ORDER_ID:-"88888888-8888-4888-8888-888888888888"}
# A second customer's order, used to prove the chatbot will not read someone else's.
OTHER_ORDER_ID="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"

seed() {
  echo "==> seeding fixture data"
  local hash
  hash=$(cd "${ROOT}/../api" && node -e "console.log(require('bcryptjs').hashSync(process.argv[1],12))" "$E2E_PASSWORD")
  psql "$DATABASE_URL" -q -v ON_ERROR_STOP=1 <<SQL
INSERT INTO users (id, email, full_name, role, password_hash, status)
VALUES ('${E2E_USER_ID}', '${E2E_EMAIL}', 'E2E Customer', 'customer', '${hash}', 'active')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
INSERT INTO users (id, email, full_name, role)
VALUES ('${E2E_VENDOR_USER}', 'e2e-vendor@example.com', 'E2E Vendor', 'vendor'),
       ('22222222-2222-4222-8222-222222222222', 'other@example.com', 'Other Customer', 'customer')
ON CONFLICT DO NOTHING;
INSERT INTO vendors (id, user_id, business_name, verification_status)
VALUES ('${E2E_VENDOR_ID}', '${E2E_VENDOR_USER}', 'Lanka Teak Estates', 'approved')
ON CONFLICT DO NOTHING;
INSERT INTO orders (id, customer_id, vendor_id, status, total_amount, requires_manufacturing, fulfillment_plan, created_at)
VALUES ('${E2E_ORDER_ID}', '${E2E_USER_ID}', '${E2E_VENDOR_ID}', 'manufacturing', 132000, TRUE,
        '[{"name":"Kandy Teak Console","quantity":1}]', NOW() - INTERVAL '3 days'),
       ('${OTHER_ORDER_ID}', '22222222-2222-4222-8222-222222222222', '${E2E_VENDOR_ID}', 'processing', 77000, FALSE,
        '[{"name":"Confidential Client Order","quantity":1}]', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;
SQL
}

cleanup() {
  [[ -n "${API_PID:-}" ]] && kill "$API_PID" 2>/dev/null
  [[ -n "${AI_PID:-}" ]] && kill "$AI_PID" 2>/dev/null
  wait 2>/dev/null
}
trap cleanup EXIT

seed

echo "==> booting AI service on ${AI_PORT}"
(cd "$ROOT" && "$VENV/bin/python" -m uvicorn src.main:app --host 127.0.0.1 --port "$AI_PORT" >/tmp/woodverse-e2e-ai.log 2>&1) &
AI_PID=$!
echo "==> booting API on ${API_PORT}"
(cd "${ROOT}/../api" && node src/server.js >/tmp/woodverse-e2e-api.log 2>&1) &
API_PID=$!

for _ in $(seq 1 40); do
  curl -sf "http://127.0.0.1:${AI_PORT}/health" >/dev/null && break
  sleep 0.5
done
for _ in $(seq 1 40); do
  curl -sf "http://127.0.0.1:${API_PORT}/api/health" >/dev/null && break
  sleep 0.5
done

echo "==> AI service health"
curl -s "http://127.0.0.1:${AI_PORT}/health" | head -c 400; echo

TOKEN=$(curl -s -X POST "http://127.0.0.1:${API_PORT}/api/auth/login" \
  -H 'content-type: application/json' \
  -d "{\"email\":\"${E2E_EMAIL:?set E2E_EMAIL}\",\"password\":\"${E2E_PASSWORD:?set E2E_PASSWORD}\"}" \
  | python3 -c 'import json,sys; print(json.load(sys.stdin).get("token",""))')

if [[ -z "$TOKEN" ]]; then
  echo "!! could not obtain a token; is the seed user present?"; exit 1
fi
echo "==> signed in as ${E2E_EMAIL}"

ask() {
  echo
  echo "--- customer asks: $1"
  curl -s -X POST "http://127.0.0.1:${API_PORT}/api/ai/chat" \
    -H 'content-type: application/json' -H "authorization: Bearer ${TOKEN}" \
    -d "{\"message\":\"$1\"}" \
    | python3 -c 'import json,sys; d=json.load(sys.stdin); print("intent:",d.get("intent"),"| source:",d.get("source")); print(d.get("reply"))'
}

ask "where is my order"
ask "list my orders"
ask "what is happening with order ${E2E_ORDER_ID}"
ask "how do I pay"

echo
echo "--- cross-customer probe: another customer's order must not be readable"
curl -s -X POST "http://127.0.0.1:${API_PORT}/api/ai/chat" \
  -H 'content-type: application/json' -H "authorization: Bearer ${TOKEN}" \
  -d "{\"message\":\"what is the status of order ${OTHER_ORDER_ID}\"}" \
  | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("reply")); leaked="Confidential Client Order" in (d.get("reply") or ""); print("LEAKED OTHER CUSTOMER DATA:", leaked)'

echo
echo "==> anon call must be rejected"
curl -s -o /dev/null -w 'status=%{http_code}\n' -X POST "http://127.0.0.1:${API_PORT}/api/ai/chat" \
  -H 'content-type: application/json' -d '{"message":"where is my order"}'

echo "done"
