"""Domain-level exceptions.

These carry HTTP status codes and messages so the exception handlers can
translate them into consistent JSON error responses.
"""


class AppError(Exception):
    """Base class for application errors."""

    status_code: int = 400
    code: str = "app_error"

    def __init__(self, detail: str | None = None):
        self.detail = detail or self.__class__.__doc__ or "Application error"
        super().__init__(self.detail)


class NotFoundError(AppError):
    """The requested resource was not found."""

    status_code = 404
    code = "not_found"


class ConflictError(AppError):
    """The request conflicts with the current state (e.g. unique violation)."""

    status_code = 409
    code = "conflict"


class ValidationError(AppError):
    """The request was well-formed but semantically invalid."""

    status_code = 400
    code = "validation_error"


class AuthenticationError(AppError):
    """Authentication failed or is missing."""

    status_code = 401
    code = "authentication_error"


class PermissionDeniedError(AppError):
    """The authenticated user lacks permission for this action."""

    status_code = 403
    code = "permission_denied"


__all__ = [
    "AppError",
    "NotFoundError",
    "ConflictError",
    "ValidationError",
    "AuthenticationError",
    "PermissionDeniedError",
]
