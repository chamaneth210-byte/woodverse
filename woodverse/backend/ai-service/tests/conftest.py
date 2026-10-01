from __future__ import annotations

import os
import pathlib
import sys


ROOT = pathlib.Path(__file__).resolve().parents[1]
# Import as `src.<module>` so the service's relative imports resolve the same way they
# do under `uvicorn src.main:app`.
sys.path.insert(0, str(ROOT))

# config.py reads the environment at import time, so set it before any project import.
os.environ["AI_SERVICE_API_KEY"] = os.getenv("TEST_SERVICE_KEY", "test-service-key")
os.environ["DATABASE_URL"] = os.getenv("TEST_DATABASE_URL", "")
os.environ["DB_SSL"] = "false"
os.environ["AI_LLM_API_KEY"] = os.getenv("TEST_LLM_API_KEY", "")
os.environ["AI_LLM_MODEL"] = "test-model"

import pytest  # noqa: E402


SERVICE_KEY = os.environ["AI_SERVICE_API_KEY"]


def short_ref(order_id: str) -> str:
    return f"#{str(order_id)[:8].upper()}"


@pytest.fixture
def has_database() -> bool:
    return bool(os.environ["DATABASE_URL"])


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    from src.main import app

    return TestClient(app)


@pytest.fixture
def auth_headers() -> dict[str, str]:
    return {"x-api-key": SERVICE_KEY}


CUSTOMER_A = "11111111-1111-4111-8111-111111111111"
CUSTOMER_B = "22222222-2222-4222-8222-222222222222"
VENDOR_USER = "33333333-3333-4333-8333-333333333333"
VENDOR_ID = "44444444-4444-4444-8444-444444444444"

ORDER_SHIPPED = "55555555-5555-4555-8555-555555555555"
ORDER_MANUFACTURING = "66666666-6666-4666-8666-666666666666"
ORDER_BELONGS_TO_B = "77777777-7777-4777-8777-777777777777"


@pytest.fixture
def seeded(has_database):
    """Insert a small deterministic fixture and return the ids tests need."""
    if not has_database:
        pytest.skip("TEST_DATABASE_URL is not set")

    import psycopg

    url = os.environ["DATABASE_URL"]
    with psycopg.connect(url, autocommit=True) as connection:
        with connection.cursor() as cursor:
            cursor.execute("TRUNCATE orders, vendors, users RESTART IDENTITY CASCADE")
            cursor.execute(
                "INSERT INTO users (id, email, full_name, role) VALUES "
                "(%s, 'a@example.com', 'Customer A', 'customer'), "
                "(%s, 'b@example.com', 'Customer B', 'customer'), "
                "(%s, 'vendor@example.com', 'Vendor User', 'vendor')",
                (CUSTOMER_A, CUSTOMER_B, VENDOR_USER),
            )
            cursor.execute(
                "INSERT INTO vendors (id, user_id, business_name, verification_status) "
                "VALUES (%s, %s, 'Lanka Teak Estates', 'approved')",
                (VENDOR_ID, VENDOR_USER),
            )
            cursor.execute(
                "INSERT INTO orders (id, customer_id, vendor_id, status, total_amount, "
                "requires_manufacturing, fulfillment_plan, created_at) VALUES "
                "(%s, %s, %s, 'shipped', 250000, FALSE, %s, NOW() - INTERVAL '10 days'), "
                "(%s, %s, %s, 'manufacturing', 480000, TRUE, %s, NOW() - INTERVAL '2 days'), "
                "(%s, %s, %s, 'processing', 99000, FALSE, %s, NOW() - INTERVAL '1 day')",
                (
                    ORDER_SHIPPED,
                    CUSTOMER_A,
                    VENDOR_ID,
                    '[{"name": "Maharaja Bed Frame", "quantity": 1}]',
                    ORDER_MANUFACTURING,
                    CUSTOMER_A,
                    VENDOR_ID,
                    '[{"name": "Teak Dining Table", "quantity": 2}]',
                    ORDER_BELONGS_TO_B,
                    CUSTOMER_B,
                    VENDOR_ID,
                    '[{"name": "Secret Order", "quantity": 1}]',
                ),
            )

    import src.db as db

    db.close_pool()
    return {
        "customerA": CUSTOMER_A,
        "customerB": CUSTOMER_B,
        "shipped": ORDER_SHIPPED,
        "manufacturing": ORDER_MANUFACTURING,
        "belongsToB": ORDER_BELONGS_TO_B,
    }
