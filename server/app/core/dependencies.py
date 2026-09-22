"""Reusable FastAPI dependencies: DB session, current user, pagination."""

from fastapi import Depends, Query
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AuthenticationError
from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/token",
    auto_error=False,
)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not token:
        raise AuthenticationError("Missing authentication token.")
    try:
        payload = decode_token(token)
    except JWTError:
        raise AuthenticationError("Invalid or expired token.")
    sub = payload.get("sub")
    if sub is None:
        raise AuthenticationError("Token missing subject.")
    try:
        user_id = int(sub)
    except (TypeError, ValueError):
        raise AuthenticationError("Invalid subject in token.")
    user = db.get(User, user_id)
    if user is None:
        raise AuthenticationError("User no longer exists.")
    if not user.is_active:
        raise AuthenticationError("User is inactive.")
    return user


class PaginationParams:
    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number (1-indexed)"),
        page_size: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    ):
        self.page = page
        self.page_size = page_size

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size


__all__ = ["get_db", "get_current_user", "PaginationParams", "oauth2_scheme"]
