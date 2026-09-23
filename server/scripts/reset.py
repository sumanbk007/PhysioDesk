"""Wipe all data from every table and reset ID sequences.

Run: poetry run python -m scripts.reset
"""

from __future__ import annotations

import logging

from sqlalchemy import text

from app.db.base import Base  # noqa: F401
from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("reset")


TABLES = [
    "notifications",
    "payments",
    "invoices",
    "report_files",
    "clinical_notes",
    "appointments",
    "schedule_exceptions",
    "patients",
    "therapists",
    "users",
]


def main() -> None:
    log.warning("This will delete ALL data from every table.")
    with SessionLocal() as db:
        for table in TABLES:
            db.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE"))
        db.commit()
    log.info("All tables truncated and sequences reset.")


if __name__ == "__main__":
    main()
