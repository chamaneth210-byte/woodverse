from __future__ import annotations

import json
import re
import threading
from dataclasses import dataclass
from typing import Any

import httpx

from .config import LLM_API_KEY, LLM_BASE_URL, LLM_MAX_TOKENS, LLM_MODEL, LLM_TIMEOUT_SECONDS, llm_configured
from .order_status import extract_reference_from_text


ALLOWED_INTENTS: tuple[str, ...] = (
    "order_tracking",
    "delivery",
    "product_search",
    "payment",
    "stock_manufacture",
    "production",
    "realtime_chat",
    "returns",
    "account",
    "vendor_supplier",
    "general_help",
)

INTENT_DESCRIPTIONS: dict[str, str] = {
    "order_tracking": "status, progress or whereabouts of an existing order",
    "delivery": "shipping cost, delivery estimate, address, or arrival timing",
    "product_search": "finding or browsing products and categories",
    "payment": "paying, payment failure, methods, refunds of payment",
    "stock_manufacture": "whether something is in stock or must be manufactured",
    "production": "manufacturing and production tracking progress",
    "realtime_chat": "contacting a person, vendor, supplier or support",
    "returns": "returning, cancelling, refunds, damaged items",
    "account": "sign in, sign up, password, profile, verification documents",
    "vendor_supplier": "who made a product, vendor or supplier verification",
    "general_help": "anything else or unclear requests",
}

TRAINING_EXAMPLES: dict[str, list[str]] = {
    "order_tracking": [
        "track my order",
        "where is my order",
        "check order status",
        "has my furniture shipped",
        "show delivery progress",
        "what is happening with order",
        "my order has not arrived",
        "status of order a7e2750f-95d0-474d-80c3-4479012c2b18",
        "whats happening with my table",
        "is my sofa still being made",
        "did my order leave the workshop",
    ],
    "delivery": [
        "how much is delivery",
        "delivery cost to Colombo",
        "when will it arrive",
        "shipping estimate",
        "can you deliver to Kandy",
        "change my delivery address",
        "how does product delivery work",
        "do you ship to galle",
        "how long is delivery",
    ],
    "product_search": [
        "find teak furniture",
        "search wooden gift products",
        "show me an office desk",
        "I need a dining table",
        "find a bed frame",
        "browse living room products",
        "which products are available",
        "do you have any coffee tables in stock",
    ],
    "payment": [
        "how do I pay",
        "payment failed",
        "can I pay by bank transfer",
        "what payment methods are available",
        "my card payment did not work",
        "when will I be charged",
        "is cash on delivery available",
    ],
    "stock_manufacture": [
        "is this item in stock",
        "the product is out of stock",
        "does the vendor manufacture it",
        "stock available or must manufacture",
        "can I order an unavailable product",
        "why does my order need vendor approval",
        "will you make a custom item",
    ],
    "production": [
        "when does production start",
        "show manufacturing progress",
        "what is production tracking",
        "is my furniture being made",
        "how long will manufacturing take",
        "where is my production work order",
    ],
    "realtime_chat": [
        "contact the vendor",
        "send a message to vendor",
        "talk to supplier",
        "open customer support chat",
        "I need help from a person",
        "can I chat about my order",
    ],
    "returns": [
        "I want to return my order",
        "how do refunds work",
        "return damaged furniture",
        "request a refund",
        "the product arrived damaged",
        "cancel my order",
    ],
    "account": [
        "how do I create an account",
        "I cannot sign in",
        "reset my password",
        "update my customer profile",
        "login as a customer",
        "why do vendors need documents",
    ],
    "vendor_supplier": [
        "who made this product",
        "tell me about the vendor",
        "is this supplier verified",
        "how are vendors approved",
        "can I become a vendor",
        "can I become a supplier",
        "is the material source verified",
    ],
}

_JSON_OBJECT = re.compile(r"\{.*\}", re.S)
_MIN_CONFIDENCE = 0.18


@dataclass(frozen=True)
class NluResult:
    intent: str
    order_reference: str | None
    confidence: float
    source: str
    needs_order_data: bool


class LlmUnavailableError(RuntimeError):
    pass


# ---------------------------------------------------------------- LLM transport


def _build_messages(message: str) -> list[dict[str, str]]:
    catalogue = "\n".join(f"- {intent}: {detail}" for intent, detail in INTENT_DESCRIPTIONS.items())
    system = (
        "You are an intent classifier for a woodcraft e-commerce support assistant. "
        "You never answer questions and you never state order data. "
        "You only label the message so the correct tool can read the real database.\n"
        f"Allowed intents:\n{catalogue}\n"
        'Reply with one JSON object and nothing else, shaped exactly like: '
        '{"intent": "<one allowed intent>", "confidence": <number 0-1>}\n'
        "Rules:\n"
        "- intent must be one of the allowed values, verbatim.\n"
        "- confidence is how clearly the message matches that intent, between 0 and 1."
    )
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": message[:1200]},
    ]


def call_llm(message: str) -> dict[str, Any]:
    if not llm_configured():
        raise LlmUnavailableError("AI_LLM_API_KEY is not configured.")

    payload = {
        "model": LLM_MODEL,
        "temperature": 0,
        "max_tokens": LLM_MAX_TOKENS,
        "response_format": {"type": "json_object"},
        "messages": _build_messages(message),
    }

    try:
        response = httpx.post(
            f"{LLM_BASE_URL}/chat/completions",
            json=payload,
            headers={"Authorization": f"Bearer {LLM_API_KEY}", "content-type": "application/json"},
            timeout=LLM_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        body = response.json()
        return body["choices"][0]["message"]["content"]
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as error:
        raise LlmUnavailableError(str(error)) from error


# ------------------------------------------------------------------ validation


def parse_llm_json(raw: str) -> dict[str, Any]:
    """Pull a JSON object out of a model reply, tolerating fences and prose."""
    if not isinstance(raw, str):
        raise ValueError("model reply is not text")
    match = _JSON_OBJECT.search(raw.strip().removeprefix("```json").removeprefix("```"))
    if not match:
        raise ValueError("no JSON object in model reply")
    parsed = json.loads(match.group(0))
    if not isinstance(parsed, dict):
        raise ValueError("model reply is not a JSON object")
    return parsed


def validate_llm_result(parsed: dict[str, Any]) -> tuple[str, float]:
    intent = str(parsed.get("intent", "")).strip()
    if intent not in ALLOWED_INTENTS:
        raise ValueError(f"intent {intent!r} is not allowed")

    try:
        confidence = float(parsed.get("confidence", 0.0))
    except (TypeError, ValueError):
        confidence = 0.0
    return intent, max(0.0, min(1.0, confidence))


# ------------------------------------------------------- sklearn fallback model

_model_lock = threading.Lock()
_intent_model: Any = None


def _build_intent_model() -> Any:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.neural_network import MLPClassifier
    from sklearn.pipeline import Pipeline

    text = [example for examples in TRAINING_EXAMPLES.values() for example in examples]
    labels = [label for label, examples in TRAINING_EXAMPLES.items() for _ in examples]

    pipeline = Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
            (
                "classifier",
                MLPClassifier(
                    hidden_layer_sizes=(128, 64),
                    activation="relu",
                    solver="adam",
                    alpha=0.0005,
                    batch_size=16,
                    learning_rate_init=0.002,
                    max_iter=700,
                    # early_stopping is what broke this model: on 78 samples it
                    # stopped at iteration 12 and scored 0.136 accuracy.
                    early_stopping=False,
                    random_state=42,
                ),
            ),
        ]
    )
    pipeline.fit(text, labels)
    return pipeline


def get_intent_model() -> Any:
    global _intent_model
    if _intent_model is None:
        with _model_lock:
            if _intent_model is None:
                _intent_model = _build_intent_model()
    return _intent_model


def classify_with_sklearn(message: str) -> NluResult:
    if not message.strip():
        return NluResult("general_help", None, 0.0, "sklearn-neural-mlp", False)

    probabilities = get_intent_model().predict_proba([message])[0]
    best_index = int(probabilities.argmax())
    model = get_intent_model()
    intent = str(model.classes_[best_index])
    confidence = round(float(probabilities[best_index]), 3)
    return NluResult(intent, extract_reference_from_text(message), confidence, "sklearn-neural-mlp", intent == "order_tracking")


# ------------------------------------------------------------------- entrypoint


def classify(message: str) -> NluResult:
    """Route a message to an intent, preferring the LLM and degrading safely.

    The order reference always comes from a deterministic regex over the raw message,
    never from the model. A classifier cannot introduce an order id that the user did
    not type, so the only input the database ever sees is user-supplied text.
    """
    deterministic_reference = extract_reference_from_text(message)

    if llm_configured():
        try:
            parsed = parse_llm_json(call_llm(message))
            intent, confidence = validate_llm_result(parsed)
            return NluResult(
                intent=intent,
                order_reference=deterministic_reference,
                confidence=confidence,
                source=f"llm:{LLM_MODEL}",
                needs_order_data=intent == "order_tracking",
            )
        except (LlmUnavailableError, ValueError, json.JSONDecodeError):
            pass

    result = classify_with_sklearn(message)
    return NluResult(
        intent=result.intent,
        order_reference=deterministic_reference,
        confidence=result.confidence,
        source=result.source,
        needs_order_data=result.intent == "order_tracking",
    )


def is_confident(result: NluResult) -> bool:
    return result.confidence >= _MIN_CONFIDENCE
