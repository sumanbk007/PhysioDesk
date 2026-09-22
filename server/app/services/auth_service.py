"""Authentication service: verify credentials, issue tokens."""

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AuthenticationError
from app.core.security import create_access_token, verify_password
from app.models.user import User


def authenticate(db: Session, username: str, password: str) -> User:
    """Return the user if credentials are valid; raise AuthenticationError otherwise."""
    user = db.query(User).filter(User.username == username).first()

    # Same error for "no such user" and "wrong password" — don't leak which
    if user is None or not verify_password(password, user.hashed_password):
        raise AuthenticationError("Incorrect username or password.")

    if not user.is_active:
        raise AuthenticationError("Account is inactive.")

    return user


def issue_token(user: User) -> tuple[str, int]:
    """Return (access_token, expires_in_seconds)."""
    expires_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    token = create_access_token(subject=user.id, expires_minutes=expires_minutes)
    return token, expires_minutes * 60


__all__ = ["authenticate", "issue_token"]
