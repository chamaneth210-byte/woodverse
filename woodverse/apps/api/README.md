# WoodVerse API

Node.js API for WoodVerse commerce, operations, AI proxying, and realtime events.

## Stack

- Node.js
- Express.js
- Socket.IO
- PostgreSQL via `pg`

## Local Setup

```bash
cd apps/api
npm install
npm run dev
```

The API listens on `http://localhost:4000`.

## Environment

- `PORT`: API port. Default: `4000`.
- `WEB_ORIGIN`: Comma-separated frontend origins. Default: `http://localhost:5173,http://localhost:5174`.
- `AI_SERVICE_URL`: FastAPI AI service URL. Default: `http://localhost:8000`.
- `DATABASE_URL`: PostgreSQL connection string, for example `postgresql://woodverse:woodverse@localhost:5432/woodverse`.
- `DB_SSL`: Set to `true` for managed PostgreSQL providers that require SSL.
- `DB_POOL_SIZE`: PostgreSQL connection pool size. Default: `10`.

## PostgreSQL Setup

Create the database and run the schema:

```bash
createdb woodverse
psql "$DATABASE_URL" -f src/db/schema.sql
```

When `DATABASE_URL` is set, the API also initializes the schema automatically at startup. Without it, the API keeps using its in-memory demo data so the frontend can still run.

## HTTP Endpoints

- `GET /health`
- `GET /api/health`
- `GET /api/catalog`
- `GET /api/orders`
- `POST /api/orders`
- `POST /api/orders/evaluate-stock`
- `GET /api/db/health`
- `GET /api/users`, `POST /api/users`
- `GET /api/vendors`, `POST /api/vendors`
- `GET /api/products`, `POST /api/products`
- `GET /api/quotations`, `POST /api/quotations`
- `GET /api/messages`, `POST /api/messages`
- `POST /api/ai/chat`
- `POST /api/ai/stock-decision`
- `POST /api/notifications`

## Socket.IO Events

- `vendor:join`
- `vendor:thread:open`
- `vendor:message`
- `vendor:message:send`
- `notification:join`
- `notification:event`
- `notification:send`

## Practical Flow

Customer order items are evaluated by stock. In-stock items are reserved for delivery. Out-of-stock or over-quantity items are marked as manufacture required, vendor approval required, and production tracking required.

AI requests are proxied to the FastAPI service. If that service is offline, the Express API returns deterministic fallback answers so the React UI keeps working.
