from __future__ import annotations

import threading
from typing import Any

import psycopg
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from .config import DATABASE_URL, DB_POOL_SIZE, DB_SSL


DATABASE_CONFIGURED = bool(DATABASE_URL)

_pool: ConnectionPool | None = None
_pool_lock = threading.Lock()


class DatabaseUnavailableError(RuntimeError):
    """Raised when order data cannot be read because Postgres is not reachable."""


def _build_pool() -> ConnectionPool:
    return ConnectionPool(
        conninfo=DATABASE_URL,
        min_size=1,
        max_size=max(1, DB_POOL_SIZE),
        kwargs={"sslmode": "require" if DB_SSL else "prefer"},
        open=True,
        timeout=8.0,
    )


def get_pool() -> ConnectionPool:
    global _pool
    if _pool is None:
        with _pool_lock:
            if _pool is None:
                _pool = _build_pool()
    return _pool


def query(sql: str, params: tuple[Any, ...] | list[Any] | None = None) -> list[dict[str, Any]]:
    """Run one parameterized statement and return rows as dicts.

    Callers must never interpolate user or model supplied values into `sql`.
    """
    if not DATABASE_CONFIGURED:
        raise DatabaseUnavailableError("DATABASE_URL is not configured.")

    try:
        with get_pool().connection() as connection:
            with connection.cursor(row_factory=dict_row) as cursor:
                cursor.execute(sql, params or ())
                if cursor.description is None:
                    return []
                return list(cursor.fetchall())
    except DatabaseUnavailableError:
        raise
    except psycopg.Error as error:
        raise DatabaseUnavailableError(str(error).strip()) from error


def close_pool() -> None:
    global _pool
    with _pool_lock:
        if _pool is not None:
            _pool.close()
            _pool = None
