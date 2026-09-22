"""Create (or reset) the seed admin user.

Run with: poetry run python -m scripts.seed_admin
"""

from sqlalchemy.orm import Session

# IMPORTANT: import Base first so all models register with SQLAlchemy
from app.db.base import Base  # noqa: F401
from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User


def upsert_admin(db: Session) -> None:
    username = settings.SEED_ADMIN_USERNAME
    password = settings.SEED_ADMIN_PASSWORD
    full_name = settings.SEED_ADMIN_FULLNAME

    existing = db.query(User).filter(User.username == username).first()
    if existing:
        existing.hashed_password = hash_password(password)
        existing.full_name = full_name
        existing.is_active = True
        db.commit()
        print(f"Updated existing user: {username}")
        return

    user = User(
        username=username,
        hashed_password=hash_password(password),
        full_name=full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"Created user: {user.username} (id={user.id}, role={user.role})")


def main() -> None:
    with SessionLocal() as db:
        upsert_admin(db)


if __name__ == "__main__":
    main()
