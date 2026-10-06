from __future__ import annotations

import os
from typing import Any


# ---------------------------------------------------------------------------
# API key for protecting the WoodVerse AI service itself
# ---------------------------------------------------------------------------

_PLACEHOLDER_API_KEYS = {
    "",
    "change-me-in-production",
    "changeme",
}

API_KEY_NAME = "x-api-key"
API_KEY = os.getenv("AI_SERVICE_API_KEY", "")
API_KEY_CONFIGURED = API_KEY.strip().lower() not in _PLACEHOLDER_API_KEYS


# ---------------------------------------------------------------------------
# Database configuration
# ---------------------------------------------------------------------------

DATABASE_URL = os.getenv("DATABASE_URL", "")

DB_SSL = (
    os.getenv("DB_SSL", "false")
    .strip()
    .lower()
    == "true"
)

DB_POOL_SIZE = int(
    os.getenv("DB_POOL_SIZE", "5")
)


# ---------------------------------------------------------------------------
# External LLM configuration
#
# The API key is NOT stored in this source code.
# It is loaded from the AI_LLM_API_KEY environment variable.
#
# For Groq:
# AI_LLM_BASE_URL=https://api.groq.com/openai/v1
# AI_LLM_MODEL=openai/gpt-oss-20b
# ---------------------------------------------------------------------------

LLM_API_KEY = os.getenv(
    "AI_LLM_API_KEY",
    ""
).strip()

LLM_BASE_URL = os.getenv(
    "AI_LLM_BASE_URL",
    "https://api.groq.com/openai/v1"
).rstrip("/")

LLM_MODEL = os.getenv(
    "AI_LLM_MODEL",
    "openai/gpt-oss-20b"
)

LLM_TIMEOUT_SECONDS = float(
    os.getenv("AI_LLM_TIMEOUT_SECONDS", "8")
)

LLM_MAX_TOKENS = int(
    os.getenv("AI_LLM_MAX_TOKENS", "200")
)


# ---------------------------------------------------------------------------
# Order configuration
# ---------------------------------------------------------------------------

ORDER_SUMMARY_LIMIT = int(
    os.getenv("AI_ORDER_SUMMARY_LIMIT", "5")
)


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def llm_configured() -> bool:
    """Return True when an external LLM API key is configured."""
    return bool(LLM_API_KEY)


def describe() -> dict[str, Any]:
    """
    Return safe configuration information.

    IMPORTANT:
    Never return the actual API key.
    """

    return {
        "apiKeyConfigured": API_KEY_CONFIGURED,
        "databaseConfigured": bool(DATABASE_URL),
        "llmConfigured": llm_configured(),
        "llmModel": LLM_MODEL if llm_configured() else None,
        "llmBaseUrl": LLM_BASE_URL if llm_configured() else None,
    }
