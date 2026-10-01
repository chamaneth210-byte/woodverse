import { Router } from "express";
import { databaseConfigured, query } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

export const messagesRouter = Router();

messagesRouter.post("/api/messages", authenticateToken, async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ error: "PostgreSQL is not configured." });
  const { senderId, recipientId, threadId, body } = request.body;
  if (!senderId || !recipientId || !body) return response.status(400).json({ error: "senderId, recipientId, and body are required." });
  if (senderId !== request.user.id) {
    return response.status(403).json({ error: "senderId must match the authenticated user." });
  }
  const result = await query("INSERT INTO messages (sender_id, recipient_id, thread_id, body) VALUES ($1, $2, COALESCE($3, gen_random_uuid()), $4) RETURNING *", [senderId, recipientId, threadId || null, body]);
  response.status(201).json({ message: result.rows[0] });
});

messagesRouter.get("/api/messages", authenticateToken, async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ error: "PostgreSQL is not configured." });
  const values = [];
  const whereClauses = [];
  let paramIndex = 1;

  if (request.query.threadId) {
    whereClauses.push(`thread_id = $${paramIndex++}`);
    values.push(request.query.threadId);
  }

  whereClauses.push(`(sender_id = $${paramIndex++} OR recipient_id = $${paramIndex++})`);
  values.push(request.user.id, request.user.id);

  const where = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const result = await query(`SELECT * FROM messages ${where} ORDER BY created_at ASC`, values);
  response.json({ messages: result.rows });
});
