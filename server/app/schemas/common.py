"""Shared Pydantic schemas: pagination envelope, error shape, message."""

from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    """Standard pagination envelope returned by all list endpoints."""

    items: list[T] = Field(..., description="Page of items")
    total: int = Field(..., description="Total number of matching items")
    page: int = Field(..., description="Current page (1-indexed)")
    page_size: int = Field(..., description="Items per page")
    pages: int = Field(..., description="Total number of pages")


class MessageResponse(BaseModel):
    """Generic success message."""

    message: str


class ErrorBody(BaseModel):
    code: str
    detail: str
    status: int


class ErrorResponse(BaseModel):
    error: ErrorBody


__all__ = ["Page", "MessageResponse", "ErrorBody", "ErrorResponse"]
