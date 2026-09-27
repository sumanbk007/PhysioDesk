from datetime import date as date_type
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class InvoiceLineItem(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    amount: Decimal = Field(..., ge=Decimal("0"))
    date: date_type | None = None


class InvoiceBase(BaseModel):
    patient_id: int = Field(..., gt=0)
    appointment_id: int | None = Field(None, gt=0)
    service: str = Field("Multiple services", min_length=1, max_length=255)
    amount: Decimal = Field(Decimal("0.00"), ge=Decimal("0"))
    discount: Decimal = Field(Decimal("0.00"), ge=Decimal("0"))
    line_items: list[InvoiceLineItem] = Field(default_factory=list)
    date: date_type | None = None
    due_date: date_type | None = None
    notes: str | None = None


class InvoiceCreate(BaseModel):
    patient_id: int = Field(..., gt=0)
    appointment_id: int | None = Field(None, gt=0)
    service: str = Field("Multiple services", min_length=1, max_length=255)
    amount: Decimal = Field(Decimal("0.00"), ge=Decimal("0"))
    discount: Decimal = Field(Decimal("0.00"), ge=Decimal("0"))
    line_items: list[InvoiceLineItem] = Field(default_factory=list)
    date: date_type | None = None
    due_date: date_type | None = None
    notes: str | None = None


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


__all__ = [
    "InvoiceLineItem",
    "InvoiceCreate",
    "InvoiceUpdate",
    "InvoiceRead",
    "InvoiceListItem",
]
