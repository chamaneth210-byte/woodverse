from __future__ import annotations

from typing import Any


TRACKING_SUGGESTIONS = [
    "Where is my order now?",
    "When will it be delivered?",
    "How do I contact the vendor?",
]


def _line(order: dict[str, Any]) -> str:
    parts = [f"{order['reference']} - {order['statusLabel']}"]
    if order.get("itemSummary") and order["itemSummary"] != "No line items recorded yet.":
        parts.append(order["itemSummary"])
    parts.append(f"total {order['totalAmount']}")
    if order.get("vendorName"):
        parts.append(f"vendor {order['vendorName']}")
    return " | ".join(parts)


def _detail(order: dict[str, Any]) -> list[str]:
    lines = [
        f"Order {order['reference']} is currently {order['statusLabel'].lower()}.",
        f"Items: {order['itemSummary']}.",
        f"Total: {order['totalAmount']}.",
    ]
    if order.get("vendorName"):
        lines.append(f"Vendor: {order['vendorName']}.")
    if order.get("placedAt"):
        lines.append(f"Placed on {order['placedAt'][:10]}.")
    lines.append(order["nextStep"])
    return lines


def render_order_reply(result: dict[str, Any]) -> tuple[str, list[str]]:
    """Render a reply using only values read from the orders table."""
    scope = result.get("scope")

    if scope == "unavailable":
        reason = result.get("reason")
        if reason == "database_not_configured":
            reply = (
                "I can look up order status once the database connection is available. "
                "The order service is not configured right now, so please open your order page directly "
                "or contact support for an immediate answer."
            )
        elif reason == "invalid_reference":
            reply = (
                "That does not look like a valid order reference. Order references look like "
                "\"order a7e2750f-95d0-474d-80c3-4479012c2b18\". Send the reference again and I will check it."
            )
        else:
            reply = (
                "I could not reach the order database just now. Please try again in a moment, "
                "or contact support if you need a status immediately."
            )
        return reply, ["Try again", "Contact support"]

    if scope == "empty":
        return (
            "I do not find any orders on your account yet. Once you place an order I can track its status, "
            "vendor approval, manufacturing progress and delivery here.",
            ["Browse products", "Contact support"],
        )

    if scope == "not_found":
        return (
            f"I could not find order {result.get('reference')} on your account. It may belong to a different "
            "account, or the reference may be mistyped. Only orders placed with this account can be looked up.",
            ["Show my recent orders", "Contact support"],
        )

    order = result.get("order") or {}
    if not order:
        return (
            "I could not read that order just now. Please try again in a moment.",
            ["Try again", "Contact support"],
        )

    if scope == "single" or result.get("resolvedFrom") == "latest_order":
        reply = "\n".join(_detail(order))
        if result.get("totalCount", 1) > 1:
            reply += f"\nYou have {result['totalCount']} orders on this account."
        return reply, TRACKING_SUGGESTIONS

    orders = result.get("orders") or []
    if len(orders) == 1:
        reply = "\n".join(_detail(orders[0]))
        return reply, TRACKING_SUGGESTIONS

    listing = "\n".join(f"- {_line(item)}" for item in orders)
    remaining = result.get("totalCount", len(orders)) - len(orders)
    footer = f"\nShowing your {len(orders)} most recent orders." + (
        f" {remaining} older order(s) are not listed." if remaining > 0 else ""
    )
    reply = f"Here are your recent orders:\n{listing}{footer}\nAsk about a specific order reference for full detail."
    return reply, TRACKING_SUGGESTIONS + ["Where is my order now?"]
