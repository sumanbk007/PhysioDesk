from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models.

    Every model file must be imported at the bottom of this file so that:
      1. SQLAlchemy knows the class exists
      2. Alembic's autogenerate can see it in Base.metadata

    We'll uncomment imports as we create each model.
    """

    pass
