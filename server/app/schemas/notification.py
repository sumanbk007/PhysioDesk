"""Pydantic schemas for Notification."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.constants import (
    NotificationChannel,
    NotificationStatus,
    NotificationType,
)


class NotificationBase(BaseModel):
    patient_id: int = Field(..., gt=0)
    type: str = Field(..., max_length=48)
    channel: str = Field(..., max_length=24)
    scheduled_for: datetime
    message: str = Field(..., min_length=1)
    related_appointment_id: int | None = Field(None, gt=0)
    related_invoice_id: int | None = Field(None, gt=0)

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        valid = {t.value for t in NotificationType}
        if v not in valid:
            raise ValueError(f"type must be one of {sorted(valid)}")
        return v

    @field_validator("channel")
    @classmethod
    def validate_channel(cls, v: str) -> str:
        valid = {c.value for c in NotificationChannel}
        if v not in valid:
            raise ValueError(f"channel must be one of {sorted(valid)}")
        return v


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    type: str | None = Field(None, max_length=48)
    channel: str | None = Field(None, max_length=24)
    scheduled_for: datetime | None = None
    message: str | None = Field(None, min_length=1)
    status: str | None = Field(None, max_length=16)

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str | None) -> str | None:
        if v is None:
            return None
        valid = {t.value for t in NotificationType}
        if v not in valid:
            raise ValueError(f"type must be one of {sorted(valid)}")
        return v

    @field_validator("channel")
    @classmethod
    def validate_channel(cls, v: str | None) -> str | None:
        if v is None:
            return None
        valid = {c.value for c in NotificationChannel}
        if v not in valid:
            raise ValueError(f"channel must be one of {sorted(valid)}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        if v is None:
            return None
        valid = {s.value for s in NotificationStatus}
        if v not in valid:
            raise ValueError(f"status must be one of {sorted(valid)}")
        return v


class NotificationRead(NotificationBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: str
    sent_at: datetime | None
    created_at: datetime
    updated_at: datetime


class NotificationListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    patient_id: int
    type: str
    channel: str
    scheduled_for: datetime
    status: str
    message: str


__all__ = [
    "NotificationCreate",
    "NotificationUpdate",
    "NotificationRead",
    "NotificationListItem",
]
