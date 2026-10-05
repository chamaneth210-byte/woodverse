import express from "express";
import { query } from "../db.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.js";

const purchaseOrdersRouter = express.Router();

/*
|--------------------------------------------------------------------------
| POST /api/purchase-orders
| Vendor creates a purchase order for a supplier
|--------------------------------------------------------------------------
*/

purchaseOrdersRouter.post(
  "/api/purchase-orders",
  authenticateToken,
  authorizeRoles("vendor"),
  async (request, response) => {
    try {
      const {
        supplierId,
        productId,
        productName,
        quantity,
        notes,
      } = request.body;

      if (!supplierId) {
        return response.status(400).json({
          error: "supplierId is required",
        });
      }

      if (!quantity || Number(quantity) <= 0) {
        return response.status(400).json({
          error: "quantity must be greater than 0",
        });
      }

      // Find vendor profile
      const vendorResult = await query(
        `
        SELECT id, business_name, user_id
        FROM vendors
        WHERE user_id = $1
        LIMIT 1
        `,
        [request.user.id]
      );

      const vendor = vendorResult.rows[0];

      if (!vendor) {
        return response.status(404).json({
          error: "Vendor profile not found",
        });
      }

      // Check supplier
      const supplierResult = await query(
        `
        SELECT id, full_name, email, role
        FROM users
        WHERE id = $1
          AND role = 'supplier'
        LIMIT 1
        `,
        [supplierId]
      );

      const supplier = supplierResult.rows[0];

      if (!supplier) {
        return response.status(404).json({
          error: "Supplier not found",
        });
      }

      // Create purchase order
      const result = await query(
        `
        INSERT INTO purchase_orders
        (
          vendor_id,
          supplier_id,
          product_id,
          product_name,
          quantity,
          notes,
          status
        )
        VALUES
        ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING *
        `,
        [
          vendor.id,
          supplier.id,
          productId || null,
          productName || null,
          Number(quantity),
          notes || null,
        ]
      );

      const purchaseOrder = result.rows[0];

      console.log("🛒 PURCHASE ORDER CREATED:", {
        id: purchaseOrder.id,
        vendorId: vendor.id,
        supplierId: supplier.id,
        productName,
        quantity,
      });

      // Send real-time notification to supplier
      if (request.io) {
        request.io
          .to(`supplier-${supplier.id}`)
          .emit("supplier:purchase-order", {
            id: purchaseOrder.id,
            title: "New Purchase Order",
            message: `${
              vendor.business_name || "A vendor"
            } sent you a new purchase order.`,
            purchaseOrder,
          });

        console.log(
          `🔔 Notification sent to supplier-${supplier.id}`
        );
      }

      return response.status(201).json({
        message: "Purchase order created successfully",
        purchaseOrder,
      });
    } catch (error) {
      console.error(
        "POST /api/purchase-orders error:",
        error
      );

      return response.status(500).json({
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET /api/purchase-orders
|--------------------------------------------------------------------------
*/

purchaseOrdersRouter.get(
  "/api/purchase-orders",
  authenticateToken,
  authorizeRoles("vendor", "supplier", "admin"),
  async (request, response) => {
    try {
      let result;

      // Vendor sees only their own purchase orders
      if (request.user.role === "vendor") {
        const vendorResult = await query(
          `
          SELECT id
          FROM vendors
          WHERE user_id = $1
          LIMIT 1
          `,
          [request.user.id]
        );

        const vendorId = vendorResult.rows[0]?.id;

        if (!vendorId) {
          return response.status(404).json({
            error: "Vendor profile not found",
          });
        }

        result = await query(
          `
          SELECT
            po.*,
            v.business_name AS vendor_name,
            u.full_name AS supplier_name,
            u.email AS supplier_email
          FROM purchase_orders po
          LEFT JOIN vendors v
            ON v.id = po.vendor_id
          LEFT JOIN users u
            ON u.id = po.supplier_id
          WHERE po.vendor_id = $1
          ORDER BY po.created_at DESC
          `,
          [vendorId]
        );

      // Supplier sees only purchase orders sent to them
      } else if (request.user.role === "supplier") {
        result = await query(
          `
          SELECT
            po.*,
            v.business_name AS vendor_name,
            u.full_name AS supplier_name,
            u.email AS supplier_email
          FROM purchase_orders po
          LEFT JOIN vendors v
            ON v.id = po.vendor_id
          LEFT JOIN users u
            ON u.id = po.supplier_id
          WHERE po.supplier_id = $1
          ORDER BY po.created_at DESC
          `,
          [request.user.id]
        );

      // Admin sees all purchase orders
      } else {
        result = await query(
          `
          SELECT
            po.*,
            v.business_name AS vendor_name,
            u.full_name AS supplier_name,
            u.email AS supplier_email
          FROM purchase_orders po
          LEFT JOIN vendors v
            ON v.id = po.vendor_id
          LEFT JOIN users u
            ON u.id = po.supplier_id
          ORDER BY po.created_at DESC
          `
        );
      }

      console.log(
        `📦 ${request.user.role.toUpperCase()} PURCHASE ORDERS:`,
        result.rows.length
      );

      return response.json({
        purchaseOrders: result.rows,
      });
    } catch (error) {
      console.error(
        "GET /api/purchase-orders error:",
        error
      );

      return response.status(500).json({
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| PATCH /api/purchase-orders/:id/status
| Supplier/vendor/admin updates purchase order status
|--------------------------------------------------------------------------
*/

purchaseOrdersRouter.patch(
  "/api/purchase-orders/:id/status",
  authenticateToken,
  authorizeRoles("supplier", "vendor", "admin"),
  async (request, response) => {
    try {
      const { id } = request.params;
      const { status } = request.body;

      const allowedStatuses = [
        "pending",
        "accepted",
        "rejected",
        "processing",
        "completed",
        "cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return response.status(400).json({
          error: "Invalid purchase order status",
        });
      }

      let result;

      // Admin can update any purchase order
      if (request.user.role === "admin") {
        result = await query(
          `
          UPDATE purchase_orders
          SET
            status = $1,
            updated_at = NOW()
          WHERE id = $2
          RETURNING *
          `,
          [status, id]
        );

      // Supplier can update only purchase orders assigned to them
      } else if (request.user.role === "supplier") {
        result = await query(
          `
          UPDATE purchase_orders
          SET
            status = $1,
            updated_at = NOW()
          WHERE id = $2
            AND supplier_id = $3
          RETURNING *
          `,
          [status, id, request.user.id]
        );

      // Vendor can update only their own purchase orders
      } else {
        const vendorResult = await query(
          `
          SELECT id
          FROM vendors
          WHERE user_id = $1
          LIMIT 1
          `,
          [request.user.id]
        );

        const vendorId = vendorResult.rows[0]?.id;

        if (!vendorId) {
          return response.status(404).json({
            error: "Vendor profile not found",
          });
        }

        result = await query(
          `
          UPDATE purchase_orders
          SET
            status = $1,
            updated_at = NOW()
          WHERE id = $2
            AND vendor_id = $3
          RETURNING *
          `,
          [status, id, vendorId]
        );
      }

      if (result.rows.length === 0) {
        return response.status(404).json({
          error:
            "Purchase order not found or you are not authorized to update it",
        });
      }

      const purchaseOrder = result.rows[0];

      console.log(
        "🔄 PURCHASE ORDER STATUS UPDATED:",
        {
          id: purchaseOrder.id,
          status: purchaseOrder.status,
          updatedBy: request.user.role,
          userId: request.user.id,
        }
      );

      // Notify vendor
      if (request.io) {
        const vendorResult = await query(
          `
          SELECT user_id
          FROM vendors
          WHERE id = $1
          LIMIT 1
          `,
          [purchaseOrder.vendor_id]
        );

        const vendorUserId =
          vendorResult.rows[0]?.user_id;

        if (vendorUserId) {
          request.io
            .to(`vendor-${vendorUserId}`)
            .emit(
              "vendor:purchase-order-status",
              {
                id: purchaseOrder.id,
                status: purchaseOrder.status,
                title: "Purchase Order Updated",
                message:
                  `Purchase order status changed to ${purchaseOrder.status}.`,
                purchaseOrder,
              }
            );

          console.log(
            `🔔 Notification sent to vendor-${vendorUserId}`
          );
        }
      }

      return response.json({
        message: "Purchase order status updated",
        purchaseOrder,
      });
    } catch (error) {
      console.error(
        "PATCH purchase order status error:",
        error
      );

      return response.status(500).json({
        error: error.message,
      });
    }
  }
);

export { purchaseOrdersRouter };
