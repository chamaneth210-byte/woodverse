import { Router } from "express";
import { databaseConfigured, query } from "../db.js";
import { catalogProducts } from "../data/memory.js";

export const catalogRouter = Router();

catalogRouter.get("/api/catalog", async (request, response) => {
  if (!databaseConfigured) return response.json({ products: catalogProducts, source: "memory" });

  try {
    const result = await query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.category,
        p.material,
        p.price,
        p.stock_quantity,
        p.status,
        p.image_url,
        p.created_at,
        v.business_name AS vendor
      FROM products p
      JOIN vendors v ON v.id = p.vendor_id
      WHERE p.status = 'published'
      ORDER BY p.created_at DESC, p.name ASC
    `);
    const products = result.rows.map((product) => {
      const quantityAvailable = Number(product.stock_quantity || 0);
      const stockType = quantityAvailable === 0 ? "out" : quantityAvailable <= 4 ? "low" : "in";
      return {
        id: product.id,
        name: product.name,
        vendor: product.vendor,
        description: product.description,
        category: product.category,
        material: product.material,
        price: Number(product.price),
        stock: stockType === "out" ? "Out of Stock" : stockType === "low" ? `Low Stock (${quantityAvailable})` : "In Stock",
        stockType,
        quantityAvailable,
        image: product.image_url,
        imageUrl: product.image_url,
        createdAt: product.created_at,
      };
    });
    response.json({ products, source: "postgresql" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});
