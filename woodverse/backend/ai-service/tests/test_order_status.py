from __future__ import annotations

import pytest

from src.order_status import (
    STATUS_METADATA,
    extract_reference_from_text,
    load_order_status,
    normalize_uuid,
    shape_order,
    short_reference,
    wants_latest,
    wants_listing,
)


class TestHelpers:
    def test_normalize_uuid_accepts_uppercase(self):
        assert normalize_uuid("A7E2750F-95D0-474D-80C3-4479012C2B18") == "a7e2750f-95d0-474d-80c3-4479012c2b18"

    @pytest.mark.parametrize("value", ["", None, "abc", "12345", "'; DROP TABLE orders; --"])
    def test_normalize_uuid_rejects_junk(self, value):
        assert normalize_uuid(value) is None

    def test_short_reference(self):
        assert short_reference("a7e2750f-95d0-474d-80c3-4479012c2b18") == "#A7E2750F"

    @pytest.mark.parametrize(
        "message",
        ["what is my latest order", "where is my order", "status of my most recent order"],
    )
    def test_wants_latest(self, message):
        assert wants_latest(message) is True

    @pytest.mark.parametrize("message", ["how do I pay", "find a teak table"])
    def test_does_not_want_latest(self, message):
        assert wants_latest(message) is False

    @pytest.mark.parametrize(
        "message",
        [
            "list my orders",
            "show all my orders",
            "can you list my orders",
            "what is my order history",
            "show every order I placed",
        ],
    )
    def test_wants_listing(self, message):
        assert wants_listing(message) is True

    @pytest.mark.parametrize("message", ["where is my order", "status of my latest order"])
    def test_does_not_want_listing(self, message):
        assert wants_listing(message) is False

    def test_shape_order_formats_money_and_items(self):
        shaped = shape_order(
            {
                "id": "a7e2750f-95d0-474d-80c3-4479012c2b18",
                "status": "shipped",
                "total_amount": 250000,
                "requires_manufacturing": False,
                "fulfillment_plan": [{"name": "Maharaja Bed Frame", "quantity": 2}],
                "vendor_name": "Lanka Teak Estates",
            }
        )
        assert shaped["totalAmount"] == "LKR 250,000"
        assert shaped["statusLabel"] == "Shipped"
        assert shaped["itemSummary"] == "Maharaja Bed Frame x2"
        assert shaped["progress"] == STATUS_METADATA["shipped"]["progress"]

    def test_shape_order_survives_missing_fulfillment_plan(self):
        assert shape_order({"id": "x", "status": "processing"})["itemSummary"] == "No line items recorded yet."

    def test_unknown_status_falls_back_without_crashing(self):
        assert shape_order({"id": "x", "status": "teleported"})["statusLabel"] == "Processing"

    def test_every_schema_status_has_metadata(self):
        schema = {
            "vendor_approval",
            "processing",
            "manufacturing",
            "ready_for_delivery",
            "shipped",
            "completed",
            "cancelled",
        }
        assert schema == set(STATUS_METADATA)


class TestLoadOrderStatusRequiresDatabase:
    def test_reports_unavailable_when_no_database(self, monkeypatch):
        """order_status binds DATABASE_CONFIGURED at import, so patch it there."""
        import src.order_status as order_status

        monkeypatch.setattr(order_status, "DATABASE_CONFIGURED", False)
        result = order_status.load_order_status("11111111-1111-4111-8111-111111111111")
        assert result["scope"] == "unavailable"
        assert result["reason"] == "database_not_configured"


class TestLoadOrderStatus:
    def test_summary_returns_own_orders_only(self, seeded):
        result = load_order_status(seeded["customerA"])
        assert result["scope"] == "summary"
        assert result["totalCount"] == 2
        references = {order["reference"] for order in result["orders"]}
        assert short_reference(seeded["belongsToB"]) not in references

    def test_latest_order_resolves_to_newest(self, seeded):
        """The fixture backdates created_at, so the manufacturing order is newest."""
        result = load_order_status(seeded["customerA"], message="where is my latest order")
        assert result["resolvedFrom"] == "latest_order"
        assert result["order"]["status"] == "manufacturing"
        assert result["order"]["orderId"] == seeded["manufacturing"]

    def test_summary_orders_newest_first(self, seeded):
        result = load_order_status(seeded["customerA"])
        assert [order["orderId"] for order in result["orders"]] == [
            seeded["manufacturing"],
            seeded["shipped"],
        ]

    def test_plural_request_resolves_to_the_listing(self, seeded):
        """"list my orders" contains "my order", so listing must take precedence."""
        result = load_order_status(seeded["customerA"], message="can you list my orders")
        assert result["resolvedFrom"] == "customer_orders"

    def test_explicit_reference_resolves_that_order(self, seeded):
        result = load_order_status(seeded["customerA"], order_reference=seeded["manufacturing"])
        assert result["scope"] == "single"
        assert result["order"]["statusLabel"] == "In manufacturing"
        assert result["order"]["reference"] == short_reference(seeded["manufacturing"])

    def test_customer_cannot_read_another_customers_order(self, seeded):
        """The core authorization property: ownership is enforced in the WHERE clause."""
        result = load_order_status(seeded["customerA"], order_reference=seeded["belongsToB"])
        assert result["scope"] == "not_found"
        assert result["order"] is None

    def test_unknown_reference_reports_not_found(self, seeded):
        result = load_order_status(seeded["customerA"], order_reference="99999999-9999-4999-8999-999999999999")
        assert result["scope"] == "not_found"

    def test_malformed_reference_never_reaches_sql(self, seeded):
        result = load_order_status(seeded["customerA"], order_reference="'; DROP TABLE orders; --")
        assert result["scope"] == "unavailable"
        assert result["reason"] == "invalid_reference"

    def test_customer_with_no_orders(self, seeded):
        result = load_order_status("88888888-8888-4888-8888-888888888888")
        assert result["scope"] == "empty"

    def test_returns_real_database_values(self, seeded):
        result = load_order_status(seeded["customerA"], order_reference=seeded["manufacturing"])
        order = result["order"]
        assert order["totalAmount"] == "LKR 480,000"
        assert order["requiresManufacturing"] is True
        assert order["itemSummary"] == "Teak Dining Table x2"
        assert order["vendorName"] == "Lanka Teak Estates"
        assert order["orderId"] == seeded["manufacturing"]
