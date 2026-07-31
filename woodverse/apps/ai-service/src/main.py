from __future__ import annotations

import re
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline


class ChatRequest(BaseModel):
    message: str = Field(default="", max_length=1200)
    context: dict[str, Any] = Field(default_factory=dict)


class ChatResponse(BaseModel):
    reply: str
    intent: str
    confidence: float
    suggestions: list[str]
    source: str = "fastapi-scikit-learn"


class StockItem(BaseModel):
    id: str | None = None
    name: str = "Custom product"
    vendor: str = "Vendor review required"
    quantity: int = 1
    stock: str | None = None
    stockType: str | None = None
    quantityAvailable: int | None = None


class StockDecisionRequest(BaseModel):
    items: list[StockItem] = Field(default_factory=list)


class QuoteEstimateRequest(BaseModel):
    productType: str = "custom furniture"
    material: str = "teak"
    basePrice: float = 85000
    quantity: int = 1
    customSize: bool = False


training_examples = {
    "order_tracking": [
        "track my order", "where is my order", "check order status", "has my furniture shipped",
        "show delivery progress", "what is happening with order", "my order has not arrived",
    ],
    "delivery": [
        "how much is delivery", "delivery cost to Colombo", "when will it arrive", "shipping estimate",
        "can you deliver to Kandy", "change my delivery address", "how does product delivery work",
    ],
    "product_search": [
        "find teak furniture", "search wooden gift products", "show me an office desk", "I need a dining table",
        "find a bed frame", "browse living room products", "which products are available",
    ],
    "payment": [
        "how do I pay", "payment failed", "can I pay by bank transfer", "what payment methods are available",
        "my card payment did not work", "when will I be charged", "is cash on delivery available",
    ],
    "stock_manufacture": [
        "is this item in stock", "the product is out of stock", "does the vendor manufacture it",
        "stock available or must manufacture", "can I order an unavailable product", "why does my order need vendor approval",
        "will you make a custom item",
    ],
    "production": [
        "when does production start", "show manufacturing progress", "what is production tracking",
        "is my furniture being made", "how long will manufacturing take", "where is my production work order",
    ],
    "realtime_chat": [
        "contact the vendor", "send a message to vendor", "talk to supplier", "open customer support chat",
        "I need help from a person", "can I chat about my order",
    ],
    "returns": [
        "I want to return my order", "how do refunds work", "return damaged furniture", "request a refund",
        "the product arrived damaged", "cancel my order",
    ],
    "account": [
        "how do I create an account", "I cannot sign in", "reset my password", "update my customer profile",
        "login as a customer", "why do vendors need documents",
    ],
    "vendor_supplier": [
        "who made this product", "tell me about the vendor", "is this supplier verified", "how are vendors approved",
        "can I become a vendor", "can I become a supplier", "is the material source verified",
    ],
}

training_text = [text for examples in training_examples.values() for text in examples]
training_labels = [label for label, examples in training_examples.items() for _ in examples]

intent_model: Pipeline = Pipeline(
    [
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
        ("classifier", MLPClassifier(hidden_layer_sizes=(128, 64), activation="relu", solver="adam", alpha=0.0005, batch_size=16, learning_rate_init=0.002, max_iter=700, early_stopping=True, random_state=42)),
    ]
)
intent_model.fit(training_text, training_labels)

app = FastAPI(title="WoodVerse AI Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def predict_intent(message: str) -> tuple[str, float]:
    if not message.strip():
        return "general_help", 0.0
    probabilities = intent_model.predict_proba([message])[0]
    best_index = probabilities.argmax()
    return str(intent_model.classes_[best_index]), round(float(probabilities[best_index]), 3)


def extract_available_quantity(item: StockItem) -> int:
    if item.quantityAvailable is not None:
        return max(0, item.quantityAvailable)
    match = re.search(r"\d+", item.stock or "")
    if match:
        return int(match.group(0))
    if item.stockType == "in":
        return max(item.quantity, 1)
    return 0


def classify_stock_item(item: StockItem) -> dict[str, Any]:
    quantity = max(1, item.quantity)
    available = extract_available_quantity(item)
    stock_type = item.stockType or ("in" if available >= quantity else "out")
    manufacture_required = stock_type == "out" or available < quantity

    return {
        "id": item.id,
        "name": item.name,
        "vendor": item.vendor,
        "quantity": quantity,
        "available": available,
        "stock": item.stock or ("In Stock" if available >= quantity else "Out of Stock"),
        "decision": "manufacture" if manufacture_required else "stock",
        "vendorApprovalRequired": manufacture_required,
        "productionTrackingRequired": manufacture_required,
        "nextStep": "Send to vendor approval, then create production work order."
        if manufacture_required
        else "Reserve inventory and create delivery shipment.",
        "reason": "Available stock is lower than customer quantity."
        if manufacture_required
        else "Available stock can cover the customer order.",
    }


def build_reply(intent: str) -> tuple[str, list[str]]:
    replies = {
        "order_tracking": (
            "Open the order page to check status, payment, vendor action, and shipment progress.",
            ["Track order", "Open shipment", "Contact vendor"],
        ),
        "delivery": (
            "Shipping is for product delivery after stock reservation or after production is completed.",
            ["Create shipment", "Check delivery cost", "Update address"],
        ),
        "product_search": (
            "Use product search and categories to find furniture, wooden gifts, and materials by vendor, stock, and room.",
            ["Browse products", "Filter category", "Check stock"],
        ),
        "payment": (
            "Payment can be authorized first and settled after the vendor confirms stock or production readiness.",
            ["Check payment", "Request refund", "Confirm order"],
        ),
        "stock_manufacture": (
            "If stock is unavailable, the system should mark manufacture required and wait for vendor approval before production tracking.",
            ["Evaluate stock", "Request vendor approval", "Create work order"],
        ),
        "production": (
            "Production tracking starts only after the vendor approves a manufacture-required customer order.",
            ["Open production board", "Assign work order", "Notify customer"],
        ),
        "realtime_chat": (
            "Socket.IO supports realtime text chat and notifications between vendor, supplier, customer, and admin pages.",
            ["Open chat", "Send notification", "Review thread"],
        ),
        "returns": (
            "Open your order details and contact support to request a cancellation, return, or refund. For damaged furniture, include photos and the order number.",
            ["Open order", "Request refund", "Contact support"],
        ),
        "account": (
            "Use the login page to choose Customer, Vendor, or Supplier. Customer accounts open the marketplace; vendor and supplier accounts require verification before full portal access.",
            ["Open login", "Reset password", "Update profile"],
        ),
        "vendor_supplier": (
            "WoodVerse shows verified vendor and supplier information so customers can understand who makes the product and where materials come from.",
            ["View vendor", "Check verification", "Browse products"],
        ),
    }
    return replies.get(
        intent,
        (
            "I can help with product search, delivery, payment, order tracking, vendor approval, production, and realtime chat.",
            ["Track order", "Search products", "Check stock"],
        ),
    )


def fallback_customer_reply(message: str) -> tuple[str, list[str]]:
    """Give a useful, bounded answer when a question is outside trained intents."""
    text = message.lower()
    if any(word in text for word in ("hello", "hi", "hey", "good morning", "good evening")):
        return "Hello. I can help with WoodVerse products, orders, delivery, payments, production, returns, and account support.", ["Search products", "Track order", "Contact support"]
    if any(word in text for word in ("price", "cost", "cheap", "expensive", "budget")):
        return "Product prices are shown on each product page. Open the marketplace to compare furniture, materials, and available vendors.", ["Browse products", "Find teak furniture", "Request a quote"]
    if any(word in text for word in ("custom", "size", "design", "made to order")):
        return "Custom furniture can be reviewed by a vendor. The vendor confirms the quotation, stock or manufacturing requirement, and delivery estimate before production begins.", ["Request a quote", "Contact vendor", "Check production"]
    if any(word in text for word in ("late", "where", "track", "tracking", "arrived", "shipment")):
        return "Open your order details to see the latest vendor, production, shipment, and delivery status. Contact support if the promised date has passed.", ["Track order", "Open shipment", "Contact support"]
    if any(word in text for word in ("refund", "return", "cancel", "damaged")):
        return "Open the order details and request a return, cancellation, or refund. Include the order number and photos if the item arrived damaged.", ["Open order", "Request refund", "Contact support"]
    if any(word in text for word in ("stock", "available", "manufacture", "make", "production")):
        return "WoodVerse checks available stock first. If the quantity is unavailable, the order waits for vendor approval before production tracking starts.", ["Check stock", "Request vendor approval", "Check production"]
    if any(word in text for word in ("pay", "payment", "card", "bank")):
        return "WoodVerse supports card, bank transfer, and deposit options. Payment readiness is confirmed before the order moves to fulfillment.", ["Check payment", "Confirm order", "Contact support"]
    return "I can help with WoodVerse products, stock, manufacturing, vendor approval, order tracking, delivery, payments, returns, and account support. Please ask about one of these topics or contact the WoodVerse team for a specialist answer.", ["Search products", "Track order", "Check stock", "Contact support"]


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "woodverse-ai-service",
        "framework": "fastapi",
        "model": "scikit-learn neural MLP intent classifier",
        "trainingIntents": len(training_examples),
        "trainingExamples": len(training_text),
    }


@app.post("/ai/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    intent, confidence = predict_intent(request.message)
    reply, suggestions = fallback_customer_reply(request.message) if confidence < 0.18 else build_reply(intent)
    return ChatResponse(reply=reply, intent=intent, confidence=confidence, suggestions=suggestions)


@app.post("/ai/stock-decision")
def stock_decision(request: StockDecisionRequest) -> dict[str, Any]:
    decisions = [classify_stock_item(item) for item in request.items]
    return {
        "requiresVendorApproval": any(item["vendorApprovalRequired"] for item in decisions),
        "productionTrackingRequired": any(item["productionTrackingRequired"] for item in decisions),
        "fulfillmentPlan": decisions,
        "source": "fastapi-scikit-learn",
    }


@app.post("/ai/quote-estimate")
def quote_estimate(request: QuoteEstimateRequest) -> dict[str, Any]:
    material_factor = {
        "teak": 1.25,
        "mahogany": 1.18,
        "walnut": 1.15,
        "bamboo": 0.82,
        "jackwood": 0.9,
    }.get(request.material.lower(), 1.0)
    custom_factor = 1.2 if request.customSize else 1.0
    estimated_total = round(request.basePrice * max(1, request.quantity) * material_factor * custom_factor, 2)
    return {
        "productType": request.productType,
        "material": request.material,
        "quantity": request.quantity,
        "estimatedTotal": estimated_total,
        "confidence": 0.74,
        "notes": "Prototype estimate based on material, quantity, and custom sizing factors.",
    }
