from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

from .config import ORDER_SUMMARY_LIMIT
from .db import DATABASE_CONFIGURED, DatabaseUnavailableError, query


UUID_PATTERN = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", re.I)
LATEST_HINTS = (
    "latest",
    "last order",
    "most recent",
    "my order",
    "my recent",
    "current order",
    "recent order",
    "the order",
)

LISTING_HINTS = (
    "my orders",
    "my order list",
    "list my order",
    "list of my order",
    "all my order",
    "all of my order",
    "show my order",
    "show all my order",
    "all orders",
    "every order",
    "order history",
    "order list",
    "past orders",
    "previous orders",
    "orders placed",
    "what orders",
    "which orders",
)


STATUS_METADATA: dict[str, dict[str, Any]] = {
    "vendor_approval": {
        "label": "Awaiting vendor approval",
        "progress": 10,
        "nextStep": "The vendor still has to approve this order before production or delivery is scheduled.",
    },
    "processing": {
        "label": "Processing",
        "progress": 30,
        "nextStep": "The vendor is preparing your order and confirming availability.",
    },
    "manufacturing": {
        "label": "In manufacturing",
        "progress": 55,
        "nextStep": "Your piece is being built. Production tracking updates as work completes.",
    },
    "ready_for_delivery": {
        "label": "Ready for delivery",
        "progress": 80,
        "nextStep": "The order is finished and waiting to be handed over for delivery.",
    },
    "shipped": {
        "label": "Shipped",
        "progress": 92,
        "nextStep": "The order is on its way to the address on the order.",
    },
    "completed": {
        "label": "Completed",
        "progress": 100,
        "nextStep": "This order is closed. Nothing further is required.",
    },
    "cancelled": {
        "label": "Cancelled",
        "progress": 0,
        "nextStep": "This order was cancelled. Contact support if you did not request this.",
    },
}


ORDER_SELECT = (
    "SELECT o.id, o.status, o.total_amount, o.requires_manufacturing, o.fulfillment_plan, "
    "o.shipping_address, o.created_at, o.updated_at, v.business_name AS vendor_name "
    "FROM orders o "
    "LEFT JOIN vendors v ON v.id = o.vendor_id "
)


def normalize_uuid(value: Any) -> str | None:
    """Accept a value only if the whole thing is a UUID, not just a prefix of one."""
    candidate = str(value or "").strip().strip(".,!?")
    return candidate.lower() if UUID_PATTERN.fullmatch(candidate) else None


def extract_reference_from_text(message: str) -> str | None:
    """Pull an order id out of free text.

    Looks for a UUID anywhere in the message, so "order <id>", a bare pasted id and
    "<id> please" all resolve. The value is validated before it leaves this function,
    so only well formed UUIDs ever reach the database layer.
    """
    match = UUID_PATTERN.search(message or "")
    return match.group(0).lower() if match else None


def wants_latest(message: str) -> bool:
    lowered = f" {(message or '').lower()} "
    return any(hint in lowered for hint in LATEST_HINTS)


def wants_listing(message: str) -> bool:
    """True when the customer asked to see their orders rather than one of them."""
    lowered = f" {(message or '').lower()} "
    return any(hint in lowered for hint in LISTING_HINTS)


def short_reference(order_id: str) -> str:
    return f"#{str(order_id)[:8].upper()}"


def _format_lkr(value: Any) -> str:
    try:
        return f"LKR {int(round(float(value))):,}"
    except (TypeError, ValueError):
        return "LKR 0"


def _iso(value: Any) -> str | None:
    if isinstance(value, datetime):
        moment = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
        return moment.isoformat()
    return None


def _plan_items(fulfillment_plan: Any) -> list[dict[str, Any]]:
    if not isinstance(fulfillment_plan, list):
        return []
    items: list[dict[str, Any]] = []
    for entry in fulfillment_plan:
        if not isinstance(entry, dict):
            continue
        quantity = entry.get("quantity")
        items.append(
            {
                "name": str(entry.get("name") or "Custom product"),
                "quantity": int(quantity) if isinstance(quantity, (int, float)) else 1,
                "vendorApprovalRequired": bool(entry.get("vendorApprovalRequired")),
            }
        )
    return items


def shape_order(row: dict[str, Any]) -> dict[str, Any]:
    status = str(row.get("status") or "processing")
    metadata = STATUS_METADATA.get(status, STATUS_METADATA["processing"])
    items = _plan_items(row.get("fulfillment_plan"))
    return {
        "orderId": str(row.get("id")),
        "reference": short_reference(str(row.get("id"))),
        "status": status,
        "statusLabel": metadata["label"],
        "progress": metadata["progress"],
        "nextStep": metadata["nextStep"],
        "totalAmount": _format_lkr(row.get("total_amount")),
        "requiresManufacturing": bool(row.get("requires_manufacturing")),
        "vendorName": row.get("vendor_name"),
        "items": items,
        "itemSummary": ", ".join(f"{item['name']} x{item['quantity']}" for item in items)
        or "No line items recorded yet.",
        "placedAt": _iso(row.get("created_at")),
        "lastUpdatedAt": _iso(row.get("updated_at")),
    }


def _unavailable(reason: str, detail: str | None = None) -> dict[str, Any]:
    payload: dict[str, Any] = {"scope": "unavailable", "reason": reason, "order": None, "orders": []}
    if detail:
        payload["detail"] = detail
    return payload


def load_order_status(
    customer_id: str,
    order_reference: str | None = None,
    message: str = "",
) -> dict[str, Any]:
    """Read order status for one customer.

    `customer_id` is always bound as a parameter. `order_reference` is validated as
    a UUID before it is bound and is never interpolated into SQL, so a reference can
    only ever narrow a result set the caller already owns.
    """
    if not DATABASE_CONFIGURED:
        return _unavailable("database_not_configured")

    reference = normalize_uuid(order_reference)
    if order_reference and not reference:
        return _unavailable("invalid_reference")

    try:
        if reference:
            rows = query(
                ORDER_SELECT + "WHERE o.customer_id = %s AND o.id = %s",
                (customer_id, reference),
            )
            if not rows:
                return {
                    "scope": "not_found",
                    "reason": "reference_not_found",
                    "reference": short_reference(reference),
                    "order": None,
                    "orders": [],
                }
            return {
                "scope": "single",
                "resolvedFrom": "explicit_reference",
                "order": shape_order(rows[0]),
                "orders": [],
            }

        rows = query(
            ORDER_SELECT + "WHERE o.customer_id = %s ORDER BY o.created_at DESC",
            (customer_id,),
        )
        if not rows:
            return {"scope": "empty", "reason": "no_orders", "order": None, "orders": []}

        # A plural request wins over "my latest order", because "list my orders" also
        # contains the substring "my order".
        listing = wants_listing(message)
        return {
            "scope": "summary",
            "resolvedFrom": "customer_orders" if listing else ("latest_order" if wants_latest(message) else "customer_orders"),
            "order": shape_order(rows[0]),
            "orders": [shape_order(row) for row in rows[:ORDER_SUMMARY_LIMIT]],
            "totalCount": len(rows),
        }
    except DatabaseUnavailableError as error:
        return _unavailable("database_unreachable", str(error))
