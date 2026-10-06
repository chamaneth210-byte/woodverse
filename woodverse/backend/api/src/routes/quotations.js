import { Router } from "express";
import { databaseConfigured, query } from "../db.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

export const quotationsRouter = Router();

/*
 * POST /api/quotations
 * Create a quotation
 */
quotationsRouter.post(
  "/quotations",
  authenticateToken,
  authorizeRoles("vendor", "admin"),
  async (request, response) => {
    try {
      if (!databaseConfigured) {
        return response
          .status(503)
          .json({ error: "PostgreSQL is not configured." });
      }

      const {
        orderId,
        customerId,
        vendorId,
        amount = 0,
        notes,
        validUntil,
      } = request.body;

      if (!customerId || !vendorId) {
        return response.status(400).json({
          error: "customerId and vendorId are required.",
        });
      }

      const result = await query(
        `
        INSERT INTO quotations
        (
          order_id,
          customer_id,
          vendor_id,
          amount,
          notes,
          valid_until,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'sent')
        RETURNING *
        `,
        [
          orderId || null,
          customerId,
          vendorId,
          amount,
          notes || null,
          validUntil || null,
        ]
      );

      return response.status(201).json({
        quotation: result.rows[0],
      });
    } catch (error) {
      console.error("Create quotation error:", error);

      return response.status(500).json({
        error: "Failed to create quotation.",
      });
    }
  }
);

/*
 * GET /api/quotations
 * Get quotations according to user role
 */
quotationsRouter.get(
  "/quotations",
  authenticateToken,
  authorizeRoles("admin", "vendor", "customer"),
  async (request, response) => {
    try {
      if (!databaseConfigured) {
        return response
          .status(503)
          .json({ error: "PostgreSQL is not configured." });
      }

      let result;

      if (request.user.role === "customer") {
        result = await query(
          `
          SELECT *
          FROM quotations
          WHERE customer_id = $1
          ORDER BY created_at DESC
          `,
          [request.user.id]
        );
      } else if (request.user.role === "vendor") {
        const vendorResult = await query(
          `
          SELECT id
          FROM vendors
          WHERE user_id = $1
          `,
          [request.user.id]
        );

        const vendorId = vendorResult.rows[0]?.id;

        if (!vendorId) {
          return response.status(404).json({
            error: "Vendor profile not found.",
          });
        }

        result = await query(
          `
          SELECT *
          FROM quotations
          WHERE vendor_id = $1
          ORDER BY created_at DESC
          `,
          [vendorId]
        );
      } else {
        result = await query(
          `
          SELECT *
          FROM quotations
          ORDER BY created_at DESC
          `
        );
      }

      return response.json({
        quotations: result.rows,
      });
    } catch (error) {
      console.error("Get quotations error:", error);

      return response.status(500).json({
        error: "Failed to retrieve quotations.",
      });
    }
  }
);