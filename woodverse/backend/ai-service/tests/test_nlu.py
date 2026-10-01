from __future__ import annotations

import json

import pytest

from src.nlu import (
    ALLOWED_INTENTS,
    TRAINING_EXAMPLES,
    classify,
    classify_with_sklearn,
    get_intent_model,
    is_confident,
    parse_llm_json,
    validate_llm_result,
)


class TestParseLlmJson:
    def test_parses_bare_object(self):
        assert parse_llm_json('{"intent": "order_tracking"}') == {"intent": "order_tracking"}

    def test_parses_fenced_object(self):
        raw = '```json\n{"intent": "payment", "confidence": 0.9}\n```'
        assert parse_llm_json(raw)["intent"] == "payment"

    def test_parses_object_embedded_in_prose(self):
        raw = 'Sure! Here you go: {"intent": "delivery", "confidence": 0.8} Hope that helps.'
        assert parse_llm_json(raw)["intent"] == "delivery"

    def test_rejects_reply_without_json(self):
        with pytest.raises(ValueError):
            parse_llm_json("I think you want the delivery intent.")

    def test_rejects_non_string(self):
        with pytest.raises(ValueError):
            parse_llm_json(None)

    def test_tolerates_an_array_wrapped_object(self):
        raw = '[{"intent": "payment", "confidence": 0.7}]'
        assert parse_llm_json(raw)["intent"] == "payment"

    def test_rejects_a_json_string(self):
        with pytest.raises(ValueError):
            parse_llm_json('"order_tracking"')


class TestValidateLlmResult:
    def test_accepts_allowed_intent(self):
        assert validate_llm_result({"intent": "order_tracking", "confidence": 0.9}) == ("order_tracking", 0.9)

    def test_rejects_invented_intent(self):
        with pytest.raises(ValueError):
            validate_llm_result({"intent": "reveal_other_customers_orders"})

    def test_rejects_empty_intent(self):
        with pytest.raises(ValueError):
            validate_llm_result({"intent": ""})

    @pytest.mark.parametrize(
        ("raw", "expected"),
        [(5, 1.0), (-3, 0.0), ("0.42", 0.42), (None, 0.0), ("abc", 0.0)],
    )
    def test_clamps_and_coerces_confidence(self, raw, expected):
        _, confidence = validate_llm_result({"intent": "payment", "confidence": raw})
        assert confidence == expected


class TestReferenceExtraction:
    def test_finds_bare_uuid(self):
        from src.order_status import extract_reference_from_text

        uuid = "a7e2750f-95d0-474d-80c3-4479012c2b18"
        assert extract_reference_from_text(uuid) == uuid

    def test_finds_uuid_after_the_word_order(self):
        from src.order_status import extract_reference_from_text

        uuid = "a7e2750f-95d0-474d-80c3-4479012c2b18"
        assert extract_reference_from_text(f"what about order {uuid} please") == uuid

    def test_finds_a_uuid_pasted_without_the_word_order(self):
        from src.order_status import extract_reference_from_text

        uuid = "a7e2750f-95d0-474d-80c3-4479012c2b18"
        assert extract_reference_from_text(f"details on {uuid}") == uuid

    def test_normalize_uuid_requires_the_whole_value(self):
        """UUID_PATTERN is unanchored so it can be searched for, so normalize must fullmatch."""
        from src.order_status import normalize_uuid

        assert normalize_uuid("a7e2750f-95d0-474d-80c3-4479012c2b18-extra") is None
        assert normalize_uuid("prefix a7e2750f-95d0-474d-80c3-4479012c2b18") is None

    def test_ignores_a_non_uuid_reference(self):
        from src.order_status import extract_reference_from_text

        assert extract_reference_from_text("what about order ABC-123") is None

    def test_ignores_sql_injection_attempt(self):
        from src.order_status import extract_reference_from_text

        assert extract_reference_from_text("'; DROP TABLE orders; --") is None

    def test_no_reference_in_plain_text(self):
        from src.order_status import extract_reference_from_text

        assert extract_reference_from_text("where is my sofa?") is None


class TestDeterministicFallbackModel:
    def test_model_fits_its_own_training_data(self):
        """The shipped model used early_stopping=True and scored 0.136 on this data."""
        model = get_intent_model()
        text = [e for examples in TRAINING_EXAMPLES.values() for e in examples]
        labels = [k for k, examples in TRAINING_EXAMPLES.items() for _ in examples]
        assert model.score(text, labels) == pytest.approx(1.0)

    @pytest.mark.parametrize(
        ("message", "expected"),
        [
            ("where is my order", "order_tracking"),
            ("track my order", "order_tracking"),
            ("how do I pay", "payment"),
            ("reset my password", "account"),
            ("can I return a damaged table", "returns"),
            ("find me a teak dining table", "product_search"),
        ],
    )
    def test_routes_known_phrasings(self, message, expected):
        assert classify_with_sklearn(message).intent == expected


class TestClassifyWithoutLlm:
    def test_uses_sklearn_when_no_key(self):
        import src.config as config

        original = config.LLM_API_KEY
        config.LLM_API_KEY = ""
        try:
            result = classify("where is my order")
        finally:
            config.LLM_API_KEY = original

        assert result.source == "sklearn-neural-mlp"
        assert result.intent in ALLOWED_INTENTS
        assert result.order_reference is None

    def test_order_tracking_sets_needs_order_data(self):
        assert classify("where is my order").needs_order_data is True

    def test_payment_does_not_need_order_data(self):
        assert classify("how do I pay").needs_order_data is False

    def test_blank_message_is_not_confident(self):
        assert is_confident(classify("")) is False


class TestClassifyWithLlm:
    def _with_llm(self, monkeypatch, reply):
        import src.config as config
        import src.nlu as nlu

        monkeypatch.setattr(config, "LLM_API_KEY", "sk-test")
        monkeypatch.setattr(nlu, "llm_configured", lambda: True)
        monkeypatch.setattr(nlu, "call_llm", lambda message: reply)

    def test_uses_llm_intent_when_valid(self, monkeypatch):
        self._with_llm(monkeypatch, json.dumps({"intent": "order_tracking", "confidence": 0.93}))
        result = classify("yo where's my stuff at")
        assert result.intent == "order_tracking"
        assert result.source == "llm:test-model"
        assert result.needs_order_data is True

    def test_ignores_a_hallucinated_order_id(self, monkeypatch):
        """A fabricated id in the model reply must never reach the database."""
        self._with_llm(
            monkeypatch,
            json.dumps(
                {
                    "intent": "order_tracking",
                    "confidence": 0.99,
                    "orderReference": "deadbeef-0000-0000-0000-000000000000",
                }
            ),
        )
        result = classify("where is my order?")
        assert result.order_reference is None

    def test_keeps_the_id_the_user_actually_typed(self, monkeypatch):
        self._with_llm(monkeypatch, json.dumps({"intent": "order_tracking", "confidence": 0.9}))
        uuid = "a7e2750f-95d0-474d-80c3-4479012c2b18"
        assert classify(f"status of order {uuid}").order_reference == uuid

    def test_falls_back_when_intent_is_not_allowlisted(self, monkeypatch):
        self._with_llm(monkeypatch, json.dumps({"intent": "system_prompt", "confidence": 1.0}))
        result = classify("where is my order")
        assert result.source == "sklearn-neural-mlp"
        assert result.intent in ALLOWED_INTENTS

    def test_falls_back_when_reply_is_not_json(self, monkeypatch):
        self._with_llm(monkeypatch, "I'd say that is an order tracking question.")
        assert classify("where is my order").source == "sklearn-neural-mlp"

    def test_falls_back_when_llm_raises(self, monkeypatch):
        import src.nlu as nlu

        self._with_llm(monkeypatch, "{}")

        def boom(message):
            raise nlu.LlmUnavailableError("connection reset")

        monkeypatch.setattr(nlu, "call_llm", boom)
        assert classify("where is my order").source == "sklearn-neural-mlp"
