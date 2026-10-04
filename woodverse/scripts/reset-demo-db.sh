#!/usr/bin/env bash
# Restore the demo database to exactly what database/seed.sql produces.
#
# Why this is needed: `npm run test:api` truncates users/orders/vendors and then
# inserts its own fixtures (a@example.com, b@example.com, vendor@example.com and
# a "Lanka Teak Estates" vendor). seed.sql is idempotent but only adds rows, so
# those leftovers survive a re-seed and show up in the admin console on stage.
#
# Usage:  ./scripts/reset-demo-db.sh
set -euo pipefail

PSQL=(psql -h /var/run/postgresql -p 5433 -d woodverse_test -v ON_ERROR_STOP=1)

"${PSQL[@]}" -q -c "DELETE FROM orders"
"${PSQL[@]}" -q -c "DELETE FROM vendors WHERE user_id IN (SELECT id FROM users WHERE email IN ('vendor@example.com'))"
"${PSQL[@]}" -q -c "DELETE FROM users WHERE email IN ('a@example.com','b@example.com','vendor@example.com')"
"${PSQL[@]}" -q -f database/seed.sql >/dev/null

echo "Demo database reset:"
"${PSQL[@]}" -tAc "SELECT '  users    ' || count(*) FROM users
UNION ALL SELECT '  vendors  ' || count(*) FROM vendors
UNION ALL SELECT '  products ' || count(*) FROM products
UNION ALL SELECT '  orders   ' || count(*) FROM orders
UNION ALL SELECT '  vendor   ' || business_name FROM vendors WHERE verification_status = 'approved' ORDER BY 1"
echo
echo "Sign in with vendor@woodverse.lk / Vendor@12345"