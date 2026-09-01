# WoodVerse AI Service

FastAPI service for WoodVerse AI assistance and operational decisions.

## Stack

- FastAPI for HTTP APIs
- Scikit-learn for lightweight intent classification
- Uvicorn for local development

## Local Setup

```bash
cd backend/ai-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

## Endpoints

- `GET /health`
- `POST /ai/chat`
- `POST /ai/stock-decision`
- `POST /ai/quote-estimate`
- `POST /ai/customization-recommendations`
- `POST /ai/image/validate` — base64 image → size/format/orientation check
- `POST /ai/image/analyze` — base64 image → dominant colors, brightness, sharpness, furniture/room heuristic
- `POST /ai/image/compare` — two base64 images → similarity score

All AI endpoints require the `x-api-key` header matching `AI_SERVICE_API_KEY`.

## Role In The App

The Node/Express API calls this service through `AI_SERVICE_URL` and falls back to deterministic API responses if the AI service is offline. This lets React pages continue working during frontend-only development.
