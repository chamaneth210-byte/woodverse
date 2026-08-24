import { Router } from "express";
import { databaseConfigured, initializeDatabase, query } from "../db.js";

export const healthRouter = Router();

healthRouter.get(["/health", "/api/health"], (request, response) => {
  const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
  response.json({
    ok: true,
    service: "woodverse-api",
    framework: "express",
    realtime: "socket.io",
    aiServiceUrl,
    database: databaseConfigured ? "ready" : "not_configured",
  });
});

healthRouter.get("/api/db/health", async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ ok: false, database: "not_configured", message: "Set DATABASE_URL to connect PostgreSQL." });
  try {
    const result = await query("SELECT NOW() AS server_time");
    response.json({ ok: true, database: "postgresql", serverTime: result.rows[0].server_time });
  } catch (error) {
    response.status(503).json({ ok: false, database: "error", message: error.message });
  }
});
