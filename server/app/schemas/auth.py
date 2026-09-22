"""Pydantic schemas for authentication."""

from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Seconds until token expiry")


class UserMe(BaseModel):
    """Authenticated user's own profile."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    role: str
    full_name: str | None
    is_active: bool


__all__ = ["LoginRequest", "TokenResponse", "UserMe"]
