from __future__ import annotations

from src.order_status import STATUS_METADATA, shape_order
from src.replies import render_order_reply


def make_order(**overrides):
    row = {
        "id": "a7e2750f-95d0-474d-80c3-4479012c2b18",
        "status": "shipped",
        "total_amount": 250000,
        "requires_manufacturing": False,
        "fulfillment_plan": [{"name": "Maharaja Bed Frame", "quantity": 1}],
        "vendor_name": "Lanka Teak Estates",
        "created_at": "2026-09-01",
    }
    row.update(overrides)
    return shape_order(row)


def summary(orders, total_count=None):
    return {
        "scope": "summary",
        "resolvedFrom": "customer_orders",
        "order": orders[0],
        "orders": orders,
        "totalCount": total_count if total_count is not None else len(orders),
    }


class TestSingleOrderReply:
    def test_includes_status_total_items_and_next_step(self):
        reply, suggestions = render_order_reply(
            {"scope": "single", "resolvedFrom": "explicit_reference", "order": make_order(), "orders": []}
        )
        assert "#A7E2750F" in reply
        assert "shipped" in reply.lower()
        assert "LKR 250,000" in reply
        assert "Maharaja Bed Frame" in reply
        assert "Lanka Teak Estates" in reply
        assert STATUS_METADATA["shipped"]["nextStep"] in reply
        assert suggestions

    def test_manufacturing_status_uses_its_own_next_step(self):
        order = make_order(status="manufacturing")
        reply, _ = render_order_reply({"scope": "single", "order": order, "orders": []})
        assert "manufacturing" in reply.lower()
        assert STATUS_METADATA["manufacturing"]["nextStep"] in reply

    def test_cancelled_order_is_reported_as_cancelled(self):
        order = make_order(status="cancelled")
        reply, _ = render_order_reply({"scope": "single", "order": order, "orders": []})
        assert "cancelled" in reply.lower()


class TestSummaryReply:
    def test_lists_each_recent_order(self):
        orders = [make_order(), make_order(id="b1111111-1111-4111-8111-111111111111", status="processing")]
        reply, _ = render_order_reply(
            {"scope": "summary", "resolvedFrom": "customer_orders", "order": orders[0], "orders": orders, "totalCount": 2}
        )
        assert "#A7E2750F" in reply
        assert "#B1111111" in reply
        assert "LKR 250,000" in reply

    def test_single_order_summary_is_detailed(self):
        order = make_order()
        reply, _ = render_order_reply({"scope": "summary", "resolvedFrom": "customer_orders", "order": order, "orders": [order], "totalCount": 1})
        assert "Maharaja Bed Frame" in reply

    def test_latest_order_resolution_is_detailed(self):
        order = make_order()
        reply, _ = render_order_reply({"scope": "summary", "resolvedFrom": "latest_order", "order": order, "orders": [order]})
        assert "Maharaja Bed Frame" in reply
        assert "You have" not in reply

    def test_reports_order_count_beyond_the_listed_window(self):
        orders = [make_order(), make_order(id="b1111111-1111-4111-8111-111111111111")]
        reply, _ = render_order_reply(summary(orders, total_count=9))
        assert "Here are your recent orders" in reply
        assert "7 older order(s) are not listed" in reply

    def test_does_not_mention_older_orders_when_all_are_shown(self):
        orders = [make_order(), make_order(id="b1111111-1111-4111-8111-111111111111")]
        reply, _ = render_order_reply(summary(orders))
        assert "older order" not in reply


class TestEdgeCaseReplies:
    def test_empty_account(self):
        reply, suggestions = render_order_reply({"scope": "empty", "order": None, "orders": []})
        assert "do not find any orders" in reply
        assert suggestions

    def test_not_found_does_not_leak_the_reference(self):
        reply, _ = render_order_reply(
            {"scope": "not_found", "reason": "reference_not_found", "reference": "#A7E2750F", "order": None, "orders": []}
        )
        assert "could not find order" in reply
        assert "different" in reply

    def test_missing_database_is_honest_not_invented(self):
        reply, _ = render_order_reply({"scope": "unavailable", "reason": "database_not_configured", "order": None, "orders": []})
        assert "not configured" in reply
        assert "LKR" not in reply

    def test_invalid_reference_prompts_a_retry(self):
        reply, _ = render_order_reply({"scope": "unavailable", "reason": "invalid_reference", "order": None, "orders": []})
        assert "valid order reference" in reply

    def test_unreachable_database_asks_the_user_to_retry(self):
        reply, _ = render_order_reply({"scope": "unavailable", "reason": "database_unreachable", "order": None, "orders": []})
        assert "try again" in reply.lower()

    def test_missing_order_payload(self):
        reply, _ = render_order_reply({"scope": "single", "order": None, "orders": []})
        assert "could not read that order" in reply
