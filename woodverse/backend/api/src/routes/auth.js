import { Router } from "express";
import { databaseConfigured, query } from "../db.js";
import bcrypt from "bcryptjs";
import { signToken } from "../utils/auth.js";

export const authRouter = Router();
authRouter.post("/api/auth/register", async (request, response) => {
  if (!databaseConfigured) {
    return response.status(503).json({
      error: "PostgreSQL is not configured.",
    });
  }

  const { email, fullName, password } = request.body;

  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedName = String(fullName || "").trim();
  const rawPassword = String(password || "");

  if (!normalizedEmail || !normalizedName || !rawPassword) {
    return response.status(400).json({
      error: "Email, full name, and password are required.",
    });
  }

  if (rawPassword.length < 8) {
    return response.status(400).json({
      error: "Password must be at least 8 characters.",
    });
  }

  try {
    const existingUser = await query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return response.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(rawPassword, 12);

    const result = await query(
      `INSERT INTO users
        (email, full_name, role, password_hash, status)
       VALUES ($1, $2, 'customer', $3, 'active')
       RETURNING id, email, full_name, role, status, created_at`,
      [normalizedEmail, normalizedName, passwordHash]
    );

    const user = result.rows[0];

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    });

    return response.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    if (error.code === "23505") {
      return response.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    return response.status(500).json({
      error: error.message,
    });
  }
});


authRouter.post("/api/auth/login", async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ error: "PostgreSQL is not configured." });
  const { email, password } = request.body;
  if (!email || !password) return response.status(400).json({ error: "Email and password are required." });

  try {
    const result = await query("SELECT id, email, full_name, role, password_hash, status FROM users WHERE email = $1", [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user || !user.password_hash) {
      return response.status(401).json({ error: "Invalid email or password." });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return response.status(401).json({ error: "Invalid email or password." });
    }
    if (user.status === "suspended") {
      return response.status(403).json({ error: "Account is suspended." });
    }
    const token = signToken({ id: user.id, email: user.email, role: user.role, fullName: user.full_name });
    response.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role, status: user.status } });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});
