from __future__ import annotations

import base64
import os
import re
from io import BytesIO
from typing import Any

import cv2
import numpy as np
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline


API_KEY = os.getenv("AI_SERVICE_API_KEY", "change-me-in-production")
API_KEY_NAME = "x-api-key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)


def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid or missing API key.")
    return api_key


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


class CustomizationRecommendationRequest(BaseModel):
    productType: str = "sofa"
    preferredColors: list[str] = Field(default_factory=list)
    preferredMaterials: list[str] = Field(default_factory=list)
    style: str = "modern"
    availableFabrics: list[dict[str, Any]] = Field(default_factory=list)
    availablePaints: list[dict[str, Any]] = Field(default_factory=list)
    room: str = "living"


class CustomizationRecommendationResponse(BaseModel):
    productType: str
    style: str
    fabricRecommendations: list[dict[str, Any]]
    paintRecommendations: list[dict[str, Any]]
    confidence: float
    reasoning: str
    source: str = "fastapi-scikit-learn"


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
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:4000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins if origin.strip()],
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


@app.post("/ai/chat", response_model=ChatResponse, dependencies=[Depends(verify_api_key)])
def chat(request: ChatRequest) -> ChatResponse:
    intent, confidence = predict_intent(request.message)
    reply, suggestions = fallback_customer_reply(request.message) if confidence < 0.18 else build_reply(intent)
    return ChatResponse(reply=reply, intent=intent, confidence=confidence, suggestions=suggestions)


@app.post("/ai/stock-decision", dependencies=[Depends(verify_api_key)])
def stock_decision(request: StockDecisionRequest) -> dict[str, Any]:
    decisions = [classify_stock_item(item) for item in request.items]
    return {
        "requiresVendorApproval": any(item["vendorApprovalRequired"] for item in decisions),
        "productionTrackingRequired": any(item["productionTrackingRequired"] for item in decisions),
        "fulfillmentPlan": decisions,
        "source": "fastapi-scikit-learn",
    }


@app.post("/ai/quote-estimate", dependencies=[Depends(verify_api_key)])
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


STYLE_COLOR_MAP = {
    "modern": ["grey", "white", "black", "navy"],
    "classic": ["cream", "walnut", "ivory", "navy"],
    "minimalist": ["white", "grey", "beige", "oak"],
    "industrial": ["black", "grey", "walnut", "charcoal"],
    "coastal": ["white", "beige", "ivory", "oak"],
    "bohemian": ["navy", "charcoal", "beige", "walnut"],
}


def option_stock(option: dict[str, Any]) -> int:
    return int(option.get("stock_quantity", option.get("stockQuantity", 0)) or 0)


def option_text(option: dict[str, Any], *keys: str) -> str:
    return " ".join(str(option.get(key, "")) for key in keys).lower()


def score_fabric(fabric: dict[str, Any], request: CustomizationRecommendationRequest) -> float:
    score = 0.0
    searchable = option_text(fabric, "name", "color", "material")
    material = str(fabric.get("material", "")).lower()
    stock = option_stock(fabric)

    if stock <= 0:
        return -1.0

    preferred_colors = [c.lower() for c in request.preferredColors]
    preferred_materials = [m.lower() for m in request.preferredMaterials]
    style_palette = [c.lower() for c in STYLE_COLOR_MAP.get(request.style.lower(), [])]

    if any(color_name in searchable for color_name in preferred_colors):
        score += 0.5
    if any(color_name in searchable for color_name in style_palette):
        score += 0.3
    if any(mat in material for mat in preferred_materials):
        score += 0.2

    score += min(0.15, stock / 1000.0)

    return min(1.0, score)


def score_paint(paint: dict[str, Any], request: CustomizationRecommendationRequest) -> float:
    score = 0.0
    searchable = option_text(paint, "name", "color_hex", "colorHex", "finish_type", "finishType")
    finish = str(paint.get("finish_type", paint.get("finishType", ""))).lower()
    stock = option_stock(paint)

    if stock <= 0:
        return -1.0

    preferred_colors = [c.lower() for c in request.preferredColors]
    style_palette = [c.lower() for c in STYLE_COLOR_MAP.get(request.style.lower(), [])]

    if any(color_name in searchable for color_name in preferred_colors):
        score += 0.5
    if any(color_name in searchable for color_name in style_palette):
        score += 0.3

    if request.style.lower() in ("modern", "minimalist") and finish in ("matte", "satin"):
        score += 0.15
    if request.style.lower() in ("classic", "industrial") and finish in ("gloss", "satin"):
        score += 0.15

    score += min(0.15, stock / 1000.0)

    return min(1.0, score)


def build_recommendation_reasoning(top_fabrics: list[dict], top_paints: list[dict], request: CustomizationRecommendationRequest) -> str:
    reasons = []
    if top_fabrics:
        reasons.append(f"Top fabric: {top_fabrics[0].get('name', 'option')} with {top_fabrics[0].get('material', 'material')} for {request.style} style.")
    if top_paints:
        finish = top_paints[0].get("finish_type", top_paints[0].get("finishType", "finish"))
        reasons.append(f"Top paint: {top_paints[0].get('name', 'option')} in {finish} finish.")
    if not top_fabrics and not top_paints:
        return "No matching options are currently in stock. Please try different preferences or check back later."
    return " ".join(reasons)


def with_confidence(option: dict[str, Any], confidence: float) -> dict[str, Any]:
    return {**option, "confidence": round(max(0.0, min(1.0, confidence)), 3)}


@app.post("/ai/customization-recommendations", response_model=CustomizationRecommendationResponse, dependencies=[Depends(verify_api_key)])
def customization_recommendations(request: CustomizationRecommendationRequest) -> CustomizationRecommendationResponse:
    fabrics = sorted(request.availableFabrics, key=lambda f: score_fabric(f, request), reverse=True)
    paints = sorted(request.availablePaints, key=lambda p: score_paint(p, request), reverse=True)

    available_fabrics = [f for f in fabrics if score_fabric(f, request) >= 0]
    available_paints = [p for p in paints if score_paint(p, request) >= 0]

    top_fabrics = [with_confidence(fabric, score_fabric(fabric, request)) for fabric in available_fabrics[:3]]
    top_paints = [with_confidence(paint, score_paint(paint, request)) for paint in available_paints[:3]]

    confidence = 0.0
    if top_fabrics or top_paints:
        scores = [score_fabric(f, request) for f in top_fabrics] + [score_paint(p, request) for p in top_paints]
        confidence = round(sum(scores) / len(scores), 3) if scores else 0.0

    reasoning = build_recommendation_reasoning(top_fabrics, top_paints, request)

    return CustomizationRecommendationResponse(
        productType=request.productType,
        style=request.style,
        fabricRecommendations=top_fabrics,
        paintRecommendations=top_paints,
        confidence=confidence,
        reasoning=reasoning,
    )


class ImageBase64Request(BaseModel):
    imageBase64: str = Field(..., description="Base64-encoded image (with or without data: URL prefix)")
    filename: str | None = None
    contentType: str | None = None


class ImageValidateResponse(BaseModel):
    width: int
    height: int
    channels: int
    format: str
    aspectRatio: float
    orientation: str
    isValid: bool
    fileSizeBytes: int
    issues: list[str] = Field(default_factory=list)
    source: str = "fastapi-opencv"


class ImageAnalyzeResponse(BaseModel):
    width: int
    height: int
    dominantColors: list[dict[str, Any]]
    brightness: float
    contrast: float
    sharpness: float
    edgeDensity: float
    isLikelyFurniture: bool
    isLikelyRoom: bool
    recommendations: list[str] = Field(default_factory=list)
    source: str = "fastapi-opencv"


class ImageCompareRequest(BaseModel):
    imageBase64A: str
    imageBase64B: str


class ImageCompareResponse(BaseModel):
    similarity: float
    histogramDistance: float
    structuralDistance: float
    sameScene: bool
    source: str = "fastapi-opencv"


def decode_base64_image(payload: str) -> tuple[np.ndarray, int]:
    """Decode a base64 image string into an OpenCV BGR ndarray.

    Returns (image, decoded_byte_size).
    """
    if not payload:
        raise HTTPException(status_code=400, detail="imageBase64 is required.")

    raw = payload.strip()
    if "," in raw and raw.lower().startswith("data:"):
        raw = raw.split(",", 1)[1]

    try:
        binary = base64.b64decode(raw, validate=False)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Invalid base64 payload: {exc}") from exc

    if not binary:
        raise HTTPException(status_code=400, detail="Empty image payload after base64 decode.")

    np_buffer = np.frombuffer(binary, dtype=np.uint8)
    image = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(
            status_code=400,
            detail="Could not decode image. Supported formats: JPEG, PNG, WEBP, BMP.",
        )
    return image, len(binary)


def kmeans_dominant_colors(image_bgr: np.ndarray, k: int = 5) -> list[dict[str, Any]]:
    """Return top dominant colors as hex + RGB + percentage using k-means."""
    small = cv2.resize(image_bgr, (96, 96), interpolation=cv2.INTER_AREA)
    pixels = small.reshape(-1, 3).astype(np.float32)

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
    _, labels, centers = cv2.kmeans(
        pixels,
        k,
        None,
        criteria,
        attempts=3,
        flags=cv2.KMEANS_PP_CENTERS,
    )

    counts = np.bincount(labels.flatten(), minlength=k).astype(np.float32)
    total = float(counts.sum()) or 1.0
    order = np.argsort(-counts)

    result: list[dict[str, Any]] = []
    for idx in order:
        b, g, r = (int(round(float(v))) for v in centers[idx])
        percent = round(float(counts[idx]) / total, 4)
        hex_code = f"#{r:02x}{g:02x}{b:02x}"
        result.append({"hex": hex_code, "rgb": [r, g, b], "percentage": percent})
    return result


def classify_furniture_or_room(image_bgr: np.ndarray) -> tuple[bool, bool, float, float, float, float]:
    """Heuristic: detect wood-tone dominant colors + room characteristics.

    Returns (isLikelyFurniture, isLikelyRoom, brightness, contrast, sharpness, edgeDensity).
    """
    hsv = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)

    brightness = round(float(np.mean(v)) / 255.0, 4)
    contrast = round(float(np.std(v)) / 128.0, 4)

    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    sharpness = round(min(1.0, laplacian_var / 500.0), 4)

    edges = cv2.Canny(gray, 80, 180)
    edge_density = round(float(np.count_nonzero(edges)) / float(edges.size or 1), 4)

    h_channel = h.astype(np.float32)
    wood_mask = ((h_channel >= 8) & (h_channel <= 35) & (s > 30) & (s < 220) & (v > 40) & (v < 230))
    wood_ratio = float(np.count_nonzero(wood_mask)) / float(wood_mask.size or 1)
    is_likely_furniture = wood_ratio > 0.18 and edge_density > 0.04

    warm_neutral_mask = ((h_channel <= 35) | (h_channel >= 160)) & (s < 90) & (v > 90)
    warm_neutral_ratio = float(np.count_nonzero(warm_neutral_mask)) / float(warm_neutral_mask.size or 1)
    is_likely_room = (
        warm_neutral_ratio > 0.45
        and edge_density < 0.12
        and brightness > 0.35
        and contrast < 0.55
    )

    return is_likely_furniture, is_likely_room, brightness, contrast, sharpness, edge_density


def build_recommendations(
    *,
    width: int,
    height: int,
    brightness: float,
    contrast: float,
    sharpness: float,
    edge_density: float,
    is_likely_furniture: bool,
    is_likely_room: bool,
) -> list[str]:
    tips: list[str] = []
    min_dim = min(width, height)
    if min_dim < 600:
        tips.append("Image resolution is low. Use at least 800x800 for marketplace product photos.")
    if sharpness < 0.25:
        tips.append("Image looks blurry. Re-capture with better lighting and a steady camera.")
    if brightness < 0.25:
        tips.append("Image is too dark. Increase lighting or exposure before uploading.")
    if brightness > 0.85:
        tips.append("Image is overexposed. Reduce direct light or camera exposure.")
    if contrast < 0.08:
        tips.append("Low contrast. Use a plain background to highlight the product.")
    if is_likely_room and edge_density > 0.18:
        tips.append("Room scene is busy. Try a cleaner angle so the furniture is the focus.")
    if is_likely_furniture and not is_likely_room:
        tips.append("Looks like a product shot. Use a white or neutral backdrop for best marketplace presentation.")
    if not tips:
        tips.append("Image quality looks good for marketplace and room preview use.")
    return tips


def orientation_label(width: int, height: int) -> str:
    if width == height:
        return "square"
    return "landscape" if width > height else "portrait"


@app.post("/ai/image/validate", response_model=ImageValidateResponse, dependencies=[Depends(verify_api_key)])
def image_validate(request: ImageBase64Request) -> ImageValidateResponse:
    image, byte_size = decode_base64_image(request.imageBase64)
    height, width = image.shape[:2]
    channels = image.shape[2] if image.ndim == 3 else 1
    aspect = round(width / float(height or 1), 4)

    issues: list[str] = []
    is_valid = True
    if byte_size > 10 * 1024 * 1024:
        issues.append("Image exceeds 10 MB. Compress before upload.")
        is_valid = False
    if min(width, height) < 200:
        issues.append("Image is too small. Minimum 200x200 pixels required.")
        is_valid = False
    if channels < 3:
        issues.append("Color image required (3 channels).")

    ext = (request.contentType or request.filename or "").lower()
    fmt = "unknown"
    if "png" in ext or image.shape[2] == 4 and "png" not in ext:
        fmt = "png"
    elif "webp" in ext:
        fmt = "webp"
    elif "bmp" in ext:
        fmt = "bmp"
    elif "jpg" in ext or "jpeg" in ext or ext == "":
        fmt = "jpeg"
    if not ext and request.filename and "." in request.filename:
        fmt = request.filename.rsplit(".", 1)[-1].lower() or "jpeg"

    return ImageValidateResponse(
        width=width,
        height=height,
        channels=channels,
        format=fmt,
        aspectRatio=aspect,
        orientation=orientation_label(width, height),
        isValid=is_valid,
        fileSizeBytes=byte_size,
        issues=issues,
    )


@app.post("/ai/image/analyze", response_model=ImageAnalyzeResponse, dependencies=[Depends(verify_api_key)])
def image_analyze(request: ImageBase64Request) -> ImageAnalyzeResponse:
    image, _ = decode_base64_image(request.imageBase64)
    height, width = image.shape[:2]

    dominant = kmeans_dominant_colors(image, k=5)
    is_furniture, is_room, brightness, contrast, sharpness, edge_density = classify_furniture_or_room(image)

    recommendations = build_recommendations(
        width=width,
        height=height,
        brightness=brightness,
        contrast=contrast,
        sharpness=sharpness,
        edge_density=edge_density,
        is_likely_furniture=is_furniture,
        is_likely_room=is_room,
    )

    return ImageAnalyzeResponse(
        width=width,
        height=height,
        dominantColors=dominant,
        brightness=brightness,
        contrast=contrast,
        sharpness=sharpness,
        edgeDensity=edge_density,
        isLikelyFurniture=is_furniture,
        isLikelyRoom=is_room,
        recommendations=recommendations,
    )


@app.post("/ai/image/compare", response_model=ImageCompareResponse, dependencies=[Depends(verify_api_key)])
def image_compare(request: ImageCompareRequest) -> ImageCompareResponse:
    image_a, _ = decode_base64_image(request.imageBase64A)
    image_b, _ = decode_base64_image(request.imageBase64B)

    size = (256, 256)
    a_resized = cv2.resize(image_a, size, interpolation=cv2.INTER_AREA)
    b_resized = cv2.resize(image_b, size, interpolation=cv2.INTER_AREA)

    a_hsv = cv2.cvtColor(a_resized, cv2.COLOR_BGR2HSV)
    b_hsv = cv2.cvtColor(b_resized, cv2.COLOR_BGR2HSV)

    a_hist = cv2.calcHist([a_hsv], [0, 1], None, [50, 60], [0, 180, 0, 256])
    b_hist = cv2.calcHist([b_hsv], [0, 1], None, [50, 60], [0, 180, 0, 256])
    cv2.normalize(a_hist, a_hist)
    cv2.normalize(b_hist, b_hist)
    hist_distance = round(float(cv2.compareHist(a_hist, b_hist, cv2.HISTCMP_BHATTACHARYYA)), 4)

    a_gray = cv2.cvtColor(a_resized, cv2.COLOR_BGR2GRAY)
    b_gray = cv2.cvtColor(b_resized, cv2.COLOR_BGR2GRAY)
    structural_distance = round(
        float(np.mean((a_gray.astype(np.float32) - b_gray.astype(np.float32)) ** 2)) / (255.0 ** 2),
        4,
    )

    similarity = round(max(0.0, 1.0 - (hist_distance * 0.6 + structural_distance * 0.4)), 4)
    same_scene = similarity >= 0.78

    return ImageCompareResponse(
        similarity=similarity,
        histogramDistance=hist_distance,
        structuralDistance=structural_distance,
        sameScene=same_scene,
    )
