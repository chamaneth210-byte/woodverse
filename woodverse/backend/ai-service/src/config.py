from __future__ import annotations

import os
from typing import Any


_PLACEHOLDER_API_KEYS = {"", "change-me-in-production", "changeme"}

API_KEY_NAME = "x-api-key"
API_KEY = os.getenv("AI_SERVICE_API_KEY", "")
API_KEY_CONFIGURED = API_KEY.strip().lower() not in _PLACEHOLDER_API_KEYS

DATABASE_URL = os.getenv("DATABASE_URL", "")
DB_SSL = os.getenv("DB_SSL", "false").strip().lower() == "true"
DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "5"))

LLM_API_KEY = os.getenv("AI_LLM_API_KEY", "")
LLM_BASE_URL = os.getenv("AI_LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/")
LLM_MODEL = os.getenv("AI_LLM_MODEL", "gpt-4o-mini")
LLM_TIMEOUT_SECONDS = float(os.getenv("AI_LLM_TIMEOUT_SECONDS", "8"))
LLM_MAX_TOKENS = int(os.getenv("AI_LLM_MAX_TOKENS", "200"))

ORDER_SUMMARY_LIMIT = int(os.getenv("AI_ORDER_SUMMARY_LIMIT", "5"))


def llm_configured() -> bool:
    return bool(LLM_API_KEY.strip())


def describe() -> dict[str, Any]:
    return {
        "apiKeyConfigured": API_KEY_CONFIGURED,
        "databaseConfigured": bool(DATABASE_URL),
        "llmConfigured": llm_configured(),
        "llmModel": LLM_MODEL if llm_configured() else None,
    }
