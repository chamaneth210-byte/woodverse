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

export function registerRoutes(app, io) {
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

  app.use((request, response, next) => {
    request.io = io;
    next();
  });
  app.use(notificationsRouter);

  app.get("/", (request, response) => {
    response.json({
      ok: true,
      service: "woodverse-api",
      message: "WoodVerse API is running. Use the listed endpoints to read data.",
      endpoints: [
        "/api/health",
        "/api/db/health",
        "/api/auth/login",
        "/api/catalog",
        "/api/users",
        "/api/vendors",
        "/api/products",
        "/api/orders",
        "/api/quotations",
        "/api/messages",
      ],
    });
  });
}
