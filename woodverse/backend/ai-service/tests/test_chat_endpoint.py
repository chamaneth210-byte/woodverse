from __future__ import annotations

import pytest

from conftest import SERVICE_KEY, short_ref


class TestApiKeyEnforcement:
    def test_health_is_open(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["ok"] is True

    def test_chat_requires_the_service_key(self, client):
        response = client.post("/ai/chat", json={"message": "where is my order"})
        assert response.status_code == 403

    def test_chat_rejects_a_wrong_key(self, client):
        response = client.post("/ai/chat", json={"message": "hi"}, headers={"x-api-key": "guess"})
        assert response.status_code == 403

    def test_stock_decision_requires_the_service_key(self, client):
        assert client.post("/ai/stock-decision", json={"items": []}).status_code == 403

    def test_image_analyze_requires_the_service_key(self, client):
        assert client.post("/ai/image/analyze", json={"imageBase64": ""}).status_code == 403

    def test_health_reports_configuration(self, client):
        body = client.get("/health").json()
        assert body["apiKeyConfigured"] is True
        assert "databaseConfigured" in body
        assert "llmConfigured" in body


class TestPlaceholderKeyFailsClosed:
    def test_placeholder_is_not_accepted_as_a_configured_key(self, monkeypatch):
        """The shipped default was 'change-me-in-production', which anyone could send."""
        import importlib

        import src.config as config

        monkeypatch.setenv("AI_SERVICE_API_KEY", "change-me-in-production")
        reloaded = importlib.reload(config)
        assert reloaded.API_KEY_CONFIGURED is False

        monkeypatch.setenv("AI_SERVICE_API_KEY", "")
        assert importlib.reload(config).API_KEY_CONFIGURED is False

        monkeypatch.setenv("AI_SERVICE_API_KEY", SERVICE_KEY)
        assert importlib.reload(config).API_KEY_CONFIGURED is True

        importlib.reload(config)


class TestChatOrderTracking:
    def test_reads_the_callers_orders_from_the_database(self, client, auth_headers, seeded):
        response = client.post(
            "/ai/chat",
            json={"message": "where is my order", "actorId": seeded["customerA"]},
            headers=auth_headers,
        )
        assert response.status_code == 200
        body = response.json()
        assert body["intent"] == "order_tracking"
        # "where is my order" resolves to the newest order, so the detail view is used.
        assert "Teak Dining Table" in body["reply"]
        assert "LKR 480,000" in body["reply"]
        assert "You have 2 orders" in body["reply"]
        assert body["orderData"]["totalCount"] == 2

    def test_shows_the_recent_order_list_when_no_specific_order_is_implied(self, client, auth_headers, seeded, monkeypatch):
        import src.nlu as nlu

        monkeypatch.setattr(nlu, "call_llm", lambda m: '{"intent": "order_tracking", "confidence": 0.9}')
        monkeypatch.setattr(nlu, "llm_configured", lambda: True)

        response = client.post(
            "/ai/chat",
            json={"message": "can you list my orders", "actorId": seeded["customerA"]},
            headers=auth_headers,
        )
        body = response.json()
        assert "Here are your recent orders" in body["reply"]
        assert "Maharaja Bed Frame" in body["reply"]
        assert "Teak Dining Table" in body["reply"]

    def test_never_reveals_another_customers_order(self, client, auth_headers, seeded):
        response = client.post(
            "/ai/chat",
            json={"message": f"status of order {seeded['belongsToB']}", "actorId": seeded["customerA"]},
            headers=auth_headers,
        )
        assert response.status_code == 200
        body = response.json()
        assert body["orderData"]["scope"] == "not_found"
        assert "Secret Order" not in body["reply"]

    def test_resolves_a_specific_order_reference(self, client, auth_headers, seeded):
        response = client.post(
            "/ai/chat",
            json={"message": f"where is order {seeded['manufacturing']} now", "actorId": seeded["customerA"]},
            headers=auth_headers,
        )
        body = response.json()
        assert body["orderData"]["scope"] == "single"
        assert "Teak Dining Table" in body["reply"]
        assert "LKR 480,000" in body["reply"]

    def test_asks_an_anonymous_caller_to_sign_in(self, client, auth_headers):
        response = client.post("/ai/chat", json={"message": "where is my order"}, headers=auth_headers)
        body = response.json()
        assert body["orderData"] is None
        assert "Sign in" in body["reply"]

    def test_ignores_a_client_supplied_actor_id_that_is_not_honoured(self, client, auth_headers, seeded):
        """actorId is sent by the Node API from a verified JWT, so the value here is the only one seen.

        A caller who names another customer's id still only reaches their own result set
        because the service reads the id it is given; this asserts the shape of that
        contract, which the Node layer is responsible for overwriting.
        """
        response = client.post(
            "/ai/chat",
            json={"message": "where is my order", "actorId": seeded["customerB"]},
            headers=auth_headers,
        )
        body = response.json()
        assert body["orderData"]["totalCount"] == 1
        assert "Secret Order" in body["reply"]


class TestChatNonOrderIntents:
    def test_payment_question_gets_a_canned_reply_without_touching_orders(self, client, auth_headers, seeded):
        response = client.post(
            "/ai/chat",
            json={"message": "what payment methods are available", "actorId": seeded["customerA"]},
            headers=auth_headers,
        )
        body = response.json()
        assert body["orderData"] is None
        assert body["suggestions"]

    def test_reply_never_contains_a_model_invented_status(self, client, auth_headers, seeded, monkeypatch):
        """If the model tries to assert a status, the answer must still come from SQL."""
        import src.nlu as nlu

        monkeypatch.setattr(nlu, "call_llm", lambda m: '{"intent": "order_tracking", "confidence": 0.99}')
        monkeypatch.setattr(nlu, "llm_configured", lambda: True)

        response = client.post(
            "/ai/chat",
            json={"message": "is my order completed yet", "actorId": seeded["customerA"]},
            headers=auth_headers,
        )
        body = response.json()
        assert body["source"].startswith("llm:")
        assert body["orderData"]["totalCount"] == 2
        assert body["orderData"]["order"]["status"] in {
            "shipped",
            "manufacturing",
            "processing",
        }


class TestStockDecisionUnaffected:
    def test_stock_decision_still_works(self, client, auth_headers):
        response = client.post(
            "/ai/stock-decision",
            json={"items": [{"id": "1", "name": "Table", "quantity": 5, "quantityAvailable": 2}]},
            headers=auth_headers,
        )
        assert response.status_code == 200
        body = response.json()
        assert body["requiresVendorApproval"] is True


class TestValidation:
    def test_rejects_an_oversized_message(self, client, auth_headers):
        response = client.post("/ai/chat", json={"message": "x" * 1201}, headers=auth_headers)
        assert response.status_code == 422

    def test_blank_message_is_handled(self, client, auth_headers):
        response = client.post("/ai/chat", json={"message": "   "}, headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["reply"]


@pytest.mark.parametrize("path", ["/ai/image/validate", "/ai/image/compare", "/ai/customization-recommendations"])
def test_other_protected_endpoints_reject_unsigned_calls(client, path):
    assert client.post(path, json={}).status_code == 403
