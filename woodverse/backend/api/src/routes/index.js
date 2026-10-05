import { Router } from "express";
import { healthRouter } from "./health.js";
import { authRouter } from "./auth.js";
import { catalogRouter } from "./catalog.js";
import { usersRouter } from "./users.js";
import { vendorsRouter } from "./vendors.js";
import { productsRouter } from "./products.js";
import { ordersRouter } from "./orders.js";
import { quotationsRouter } from "./quotations.js";
import { messagesRouter } from "./messages.js";
import { aiRouter } from "./ai.js";
import { notificationsRouter } from "./notifications.js";
import { purchaseOrdersRouter } from "./purchaseOrders.js";

export function registerRoutes(app, io) {
  /*
  |--------------------------------------------------------------------------
  | Attach Socket.IO to every request
  |--------------------------------------------------------------------------
  |
  | This allows routes such as orders and purchase-orders to use:
  |
  |     request.io
  |
  | for real-time notifications.
  |
  */

  app.use((request, response, next) => {
    request.io = io;
    next();
  });


  /*
  |--------------------------------------------------------------------------
  | Existing WoodVerse routes
  |--------------------------------------------------------------------------
  */

  app.use(healthRouter);

  app.use(authRouter);

  app.use(catalogRouter);

  app.use(usersRouter);

  app.use(vendorsRouter);

  app.use(productsRouter);

  app.use(ordersRouter);

  app.use(quotationsRouter);

  app.use(messagesRouter);

  app.use(aiRouter);

  app.use(notificationsRouter);


  /*
  |--------------------------------------------------------------------------
  | Vendor → Supplier Purchase Orders
  |--------------------------------------------------------------------------
  |
  | Vendor:
  |     POST /api/purchase-orders
  |
  | Vendor/Supplier/Admin:
  |     GET /api/purchase-orders
  |
  | Supplier/Vendor/Admin:
  |     PATCH /api/purchase-orders/:id/status
  |
  */

  app.use(purchaseOrdersRouter);


  /*
  |--------------------------------------------------------------------------
  | Root API endpoint
  |--------------------------------------------------------------------------
  */

  app.get("/", (request, response) => {
    response.json({
      ok: true,

      service: "woodverse-api",

      message:
        "WoodVerse API is running. Use the listed endpoints to read data.",

      endpoints: [
        "/api/health",

        "/api/db/health",

        "/api/auth/login",

        "/api/catalog",

        "/api/users",

        "/api/vendors",

        "/api/products",

        "/api/orders",

        "/api/purchase-orders",

        "/api/quotations",

        "/api/messages",

        "/api/ai/chat",

        "/api/ai/stock-decision",

        "/api/ai/quote-estimate",

        "/api/notifications",
      ],
    });
  });
}
