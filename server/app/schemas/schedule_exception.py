"""Pydantic schemas for ScheduleException."""

from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ScheduleExceptionBase(BaseModel):
    date: date
    is_off: bool = False
    custom_start: time | None = None
    custom_end: time | None = None
    reason: str | None = Field(None, max_length=255)

    @field_validator("custom_end")
    @classmethod
    def end_after_start(cls, v: time | None, info):
        start = info.data.get("custom_start")
        if start is not None and v is not None and v <= start:
            raise ValueError("custom_end must be after custom_start")
        return v


class ScheduleExceptionCreate(ScheduleExceptionBase):
    pass


class ScheduleExceptionUpdate(BaseModel):
    is_off: bool | None = None
    custom_start: time | None = None
    custom_end: time | None = None
    reason: str | None = Field(None, max_length=255)


class ScheduleExceptionRead(ScheduleExceptionBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    therapist_id: int
    created_at: datetime


__all__ = [
    "ScheduleExceptionCreate",
    "ScheduleExceptionUpdate",
    "ScheduleExceptionRead",
]
