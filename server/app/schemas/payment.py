"""Pydantic schemas for Payment."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.constants import PaymentMethod


class PaymentBase(BaseModel):
    amount: Decimal = Field(..., description="Positive for payment, negative for refund")
    method: str = Field(..., max_length=32)
    method_details: dict | None = None
    note: str | None = Field(None, max_length=255)

    @field_validator("method")
    @classmethod
    def validate_method(cls, v: str) -> str:
        valid = {m.value for m in PaymentMethod}
        if v not in valid:
            raise ValueError(f"method must be one of {sorted(valid)}")
        return v

    @field_validator("amount")
    @classmethod
    def amount_nonzero(cls, v: Decimal) -> Decimal:
        if v == 0:
            raise ValueError("amount must not be zero")
        return v


class PaymentCreate(PaymentBase):
    pass


class PaymentRead(PaymentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    invoice_id: int
    is_refund: bool
    created_by: int | None
    created_at: datetime


__all__ = ["PaymentCreate", "PaymentRead"]
