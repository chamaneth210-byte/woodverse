from __future__ import annotations

import json as jsonlib

import httpx
import pytest

from src import nlu


def stub_completion(monkeypatch, reply, *, status=200):
    """Replace httpx.post with a fake OpenAI-compatible /chat/completions endpoint."""

    def fake_post(url, json=None, headers=None, timeout=None):
        body = {"choices": [{"message": {"content": reply}}]}
        return httpx.Response(status, json=body, request=httpx.Request("POST", url))

    monkeypatch.setattr(nlu.httpx, "post", fake_post)


def enable_llm(monkeypatch):
    monkeypatch.setattr(nlu, "LLM_API_KEY", "sk-test")
    monkeypatch.setattr(nlu, "llm_configured", lambda: True)


class TestLlmTransport:
    def test_posts_an_openai_compatible_request(self, monkeypatch):
        enable_llm(monkeypatch)
        captured = {}

        def fake_post(url, json=None, headers=None, timeout=None):
            captured["url"] = url
            captured["payload"] = json
            captured["headers"] = headers
            captured["timeout"] = timeout
            body = {"choices": [{"message": {"content": '{"intent":"payment","confidence":0.8}'}}]}
            return httpx.Response(200, json=body, request=httpx.Request("POST", url))

        monkeypatch.setattr(nlu.httpx, "post", fake_post)

        assert nlu.call_llm("how do I pay") == '{"intent":"payment","confidence":0.8}'
        assert captured["url"].endswith("/chat/completions")
        assert captured["payload"]["temperature"] == 0
        assert captured["payload"]["response_format"] == {"type": "json_object"}
        assert captured["payload"]["model"] == "test-model"
        assert captured["headers"]["Authorization"] == "Bearer sk-test"
        assert captured["timeout"] == 8.0

    def test_prompt_forbids_answering_and_lists_allowed_intents(self, monkeypatch):
        enable_llm(monkeypatch)
        captured = {}

        def fake_post(url, json=None, headers=None, timeout=None):
            captured["messages"] = json["messages"]
            body = {"choices": [{"message": {"content": '{"intent":"payment","confidence":0.8}'}}]}
            return httpx.Response(200, json=body, request=httpx.Request("POST", url))

        monkeypatch.setattr(nlu.httpx, "post", fake_post)
        nlu.call_llm("how do I pay")

        system = captured["messages"][0]["content"]
        assert "never answer questions" in system
        assert "never state order data" in system
        assert "orderReference" not in system
        for intent in nlu.ALLOWED_INTENTS:
            assert intent in system
        assert captured["messages"][1]["content"] == "how do I pay"

    def test_raises_on_http_error(self, monkeypatch):
        enable_llm(monkeypatch)

        def fake_post(url, json=None, headers=None, timeout=None):
            return httpx.Response(401, json={"error": "bad key"}, request=httpx.Request("POST", url))

        monkeypatch.setattr(nlu.httpx, "post", fake_post)
        with pytest.raises(nlu.LlmUnavailableError):
            nlu.call_llm("hello")

    def test_raises_on_malformed_body(self, monkeypatch):
        enable_llm(monkeypatch)

        def fake_post(url, json=None, headers=None, timeout=None):
            return httpx.Response(200, json={"nope": True}, request=httpx.Request("POST", url))

        monkeypatch.setattr(nlu.httpx, "post", fake_post)
        with pytest.raises(nlu.LlmUnavailableError):
            nlu.call_llm("hello")

    def test_raises_when_no_key_configured(self, monkeypatch):
        monkeypatch.setattr(nlu, "llm_configured", lambda: False)
        with pytest.raises(nlu.LlmUnavailableError):
            nlu.call_llm("hello")


class TestEndToEndThroughLlm:
    """Drives /ai/chat against a stubbed OpenAI-compatible endpoint."""

    def test_llm_routes_unseen_phrasing_to_order_tracking(self, client, auth_headers, seeded, monkeypatch):
        enable_llm(monkeypatch)
        stub_completion(monkeypatch, jsonlib.dumps({"intent": "order_tracking", "confidence": 0.95}))

        response = client.post(
            "/ai/chat",
            json={"message": "yo whats the vibe on my order rn", "actorId": seeded["customerA"]},
            headers=auth_headers,
        )
        body = response.json()
        assert body["intent"] == "order_tracking"
        assert body["source"] == "llm:test-model"
        assert body["orderData"]["totalCount"] == 2
        assert "Teak Dining Table" in body["reply"]

    def test_llm_routes_delivery_and_skips_the_database(self, client, auth_headers, seeded, monkeypatch):
        enable_llm(monkeypatch)
        stub_completion(monkeypatch, jsonlib.dumps({"intent": "delivery", "confidence": 0.9}))

        response = client.post(
            "/ai/chat",
            json={"message": "can you drop it off in kandy", "actorId": seeded["customerA"]},
            headers=auth_headers,
        )
        body = response.json()
        assert body["intent"] == "delivery"
        assert body["orderData"] is None
        assert "delivery" in body["reply"].lower() or "shipping" in body["reply"].lower()

    def test_llm_cannot_make_the_bot_read_another_customer(self, client, auth_headers, seeded, monkeypatch):
        enable_llm(monkeypatch)
        stub_completion(
            monkeypatch,
            jsonlib.dumps({"intent": "order_tracking", "confidence": 1.0, "orderReference": seeded["belongsToB"]}),
        )

        # The user typed an id that belongs to customer B. Ownership still blocks it,
        # and the model cannot widen the scope.
        response = client.post(
            "/ai/chat",
            json={"message": f"details on {seeded['belongsToB']}", "actorId": seeded["customerA"]},
            headers=auth_headers,
        )
        body = response.json()
        assert body["orderData"]["scope"] == "not_found"
        assert "Secret Order" not in body["reply"]

    def test_llm_reply_that_is_not_json_degrades_to_the_offline_model(self, client, auth_headers, seeded, monkeypatch):
        enable_llm(monkeypatch)
        stub_completion(monkeypatch, "Sure, that sounds like an order question!")

        response = client.post(
            "/ai/chat",
            json={"message": "where is my order", "actorId": seeded["customerA"]},
            headers=auth_headers,
        )
        body = response.json()
        assert body["source"] == "sklearn-neural-mlp"
        assert body["intent"] in nlu.ALLOWED_INTENTS

    def test_llm_outage_still_answers_order_status(self, client, auth_headers, seeded, monkeypatch):
        enable_llm(monkeypatch)

        def boom(url, json=None, headers=None, timeout=None):
            raise httpx.ConnectError("connection refused")

        monkeypatch.setattr(nlu.httpx, "post", boom)

        response = client.post(
            "/ai/chat",
            json={"message": "where is my order", "actorId": seeded["customerA"]},
            headers=auth_headers,
        )
        body = response.json()
        assert response.status_code == 200
        assert body["source"] == "sklearn-neural-mlp"
        assert body["orderData"]["totalCount"] == 2
        assert "Teak Dining Table" in body["reply"]
