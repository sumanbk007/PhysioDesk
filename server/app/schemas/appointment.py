"""Pydantic schemas for Appointment."""

from datetime import date as date_type
from datetime import datetime
from datetime import time as time_type

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.constants import AppointmentStatus, PaymentMethod


class AppointmentBase(BaseModel):
    patient_id: int = Field(..., gt=0)
    therapist_id: int = Field(..., gt=0)
    date: date_type
    start_time: time_type
    end_time: time_type
    status: str = Field(AppointmentStatus.BOOKED.value, max_length=32)
    payment_method: str | None = Field(None, max_length=32)
    payment_details: dict | None = None
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid = {s.value for s in AppointmentStatus}
        if v not in valid:
            raise ValueError(f"status must be one of {sorted(valid)}")
        return v

    @field_validator("payment_method")
    @classmethod
    def validate_method(cls, v: str | None) -> str | None:
        if v is None:
            return None
        valid = {m.value for m in PaymentMethod}
        if v not in valid:
            raise ValueError(f"payment_method must be one of {sorted(valid)}")
        return v

    @field_validator("end_time")
    @classmethod
    def end_after_start(cls, v: time_type, info):
        start = info.data.get("start_time")
        if start is not None and v <= start:
            raise ValueError("end_time must be after start_time")
        return v


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    date: date_type | None = None
    start_time: time_type | None = None
    end_time: time_type | None = None
    status: str | None = Field(None, max_length=32)
    payment_method: str | None = Field(None, max_length=32)
    payment_details: dict | None = None
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        if v is None:
            return None
        valid = {s.value for s in AppointmentStatus}
        if v not in valid:
            raise ValueError(f"status must be one of {sorted(valid)}")
        return v

    @field_validator("payment_method")
    @classmethod
    def validate_method(cls, v: str | None) -> str | None:
        if v is None:
            return None
        valid = {m.value for m in PaymentMethod}
        if v not in valid:
            raise ValueError(f"payment_method must be one of {sorted(valid)}")
        return v


class AppointmentRead(AppointmentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime


class AppointmentListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    patient_id: int
    therapist_id: int
    date: date_type
    start_time: time_type
    end_time: time_type
    status: str


__all__ = [
    "AppointmentCreate",
    "AppointmentUpdate",
    "AppointmentRead",
    "AppointmentListItem",
]
