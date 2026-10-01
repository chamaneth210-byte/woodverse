import { Router } from "express";
import { databaseConfigured, query } from "../db.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

export const productsRouter = Router();

productsRouter.post("/api/products", authenticateToken, authorizeRoles("vendor", "admin"), async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ error: "PostgreSQL is not configured." });
  const { vendorId, name, description, category, material, price = 0, stockQuantity = 0, imageUrl } = request.body;
  if (!vendorId || !name) return response.status(400).json({ error: "vendorId and name are required." });

  if (request.user.role !== "admin") {
    const vendorResult = await query("SELECT id, user_id FROM vendors WHERE id = $1", [vendorId]);
    const vendor = vendorResult.rows[0];
    if (!vendor || vendor.user_id !== request.user.id) {
      return response.status(403).json({ error: "You can only create products for your own vendor account." });
    }
  }

  const result = await query("INSERT INTO products (vendor_id, name, description, category, material, price, stock_quantity, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", [vendorId, name, description || null, category || null, material || null, price, stockQuantity, imageUrl || null]);
  response.status(201).json({ product: result.rows[0] });
});

productsRouter.get("/api/products", async (request, response) => {
  if (!databaseConfigured) return response.status(503).json({ error: "PostgreSQL is not configured." });
  const result = await query("SELECT p.*, v.business_name AS vendor_name FROM products p JOIN vendors v ON v.id = p.vendor_id ORDER BY p.created_at DESC");
  response.json({ products: result.rows });
});
