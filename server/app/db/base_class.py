from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models.

    This file imports NOTHING from app.models to avoid circular imports.
    Model files import Base from here.
    Alembic's metadata aggregation is handled in app/db/base.py.
    """

    pass