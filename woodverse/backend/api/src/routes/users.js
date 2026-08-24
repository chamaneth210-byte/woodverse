import { Router } from "express";
import bcrypt from "bcryptjs";
import { databaseConfigured, query } from "../db.js";
import { authenticateToken, isAdmin } from "../middleware/auth.js";

export const usersRouter = Router();

usersRouter.post("/api/users", async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ error: "PostgreSQL is not configured." });
  const { email, fullName, role = "customer", password } = request.body;
  if (!email || !fullName || !["customer", "vendor", "supplier", "admin"].includes(role)) return response.status(400).json({ error: "email, fullName, and a valid role are required." });
  const passwordHash = password ? await bcrypt.hash(password, 12) : null;
  try {
    const result = await query("INSERT INTO users (email, full_name, role, password_hash, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role, status, created_at", [email.toLowerCase(), fullName, role, passwordHash, role === "customer" || role === "admin" ? "active" : "pending_approval"]);
    const user = result.rows[0];
    delete user.password_hash;
    response.status(201).json({ user });
  } catch (error) {
    response.status(error.code === "23505" ? 409 : 500).json({ error: error.message });
  }
});

usersRouter.get("/api/users", authenticateToken, isAdmin, async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ error: "PostgreSQL is not configured." });
  const result = await query("SELECT id, email, full_name, role, status, created_at FROM users ORDER BY created_at DESC");
  response.json({ users: result.rows });
});
