"""Pydantic schemas for Invoice."""

from datetime import date as date_type
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class InvoiceBase(BaseModel):
    patient_id: int = Field(..., gt=0)
    appointment_id: int | None = Field(None, gt=0)
    service: str = Field(..., min_length=1, max_length=255)
    amount: Decimal = Field(..., ge=Decimal("0"))
    discount: Decimal = Field(Decimal("0"), ge=Decimal("0"))
    date: date_type | None = None
    due_date: date_type | None = None
    notes: str | None = None

    @field_validator("discount")
    @classmethod
    def discount_le_amount(cls, v: Decimal, info):
        amount = info.data.get("amount")
        if amount is not None and v > amount:
            raise ValueError("discount cannot exceed amount")
        return v


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceUpdate(BaseModel):
    service: str | None = Field(None, min_length=1, max_length=255)
    amount: Decimal | None = Field(None, ge=Decimal("0"))
    discount: Decimal | None = Field(None, ge=Decimal("0"))
    date: date_type | None = None
    due_date: date_type | None = None
    notes: str | None = None
    appointment_id: int | None = Field(None, gt=0)


class InvoiceRead(InvoiceBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    invoice_number: str
    paid_amount: Decimal
    status: str
    created_at: datetime
    updated_at: datetime


class InvoiceListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    invoice_number: str
    patient_id: int
    service: str
    amount: Decimal
    discount: Decimal
    paid_amount: Decimal
    status: str
    date: date_type


__all__ = ["InvoiceCreate", "InvoiceUpdate", "InvoiceRead", "InvoiceListItem"]
