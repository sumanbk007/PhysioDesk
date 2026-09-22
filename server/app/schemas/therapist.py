"""Pydantic schemas for Therapist."""

from datetime import datetime, time
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

WorkDay = Literal["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]


class TherapistBase(BaseModel):
    """Fields shared across create/update/read."""

    name: str = Field(..., min_length=1, max_length=120)
    specialty: str = Field(..., min_length=1, max_length=120)
    phone: str | None = Field(None, max_length=20)
    email: EmailStr | None = None
    qualifications: str | None = None
    experience_years: int | None = Field(None, ge=0, le=80)
    bio: str | None = None
    avatar_url: str | None = Field(None, max_length=255)

    work_days: list[WorkDay] = Field(..., min_length=1)
    start_time: time
    end_time: time
    slot_minutes: int = Field(30, ge=5, le=240)
    is_active: bool = True

    @field_validator("work_days")
    @classmethod
    def dedupe_work_days(cls, v: list[str]) -> list[str]:
        seen: set[str] = set()
        out: list[str] = []
        for d in v:
            if d not in seen:
                seen.add(d)
                out.append(d)
        if not out:
            raise ValueError("work_days must contain at least one day")
        return out

    @field_validator("end_time")
    @classmethod
    def end_after_start(cls, v: time, info):
        start = info.data.get("start_time")
        if start is not None and v <= start:
            raise ValueError("end_time must be after start_time")
        return v


class TherapistCreate(TherapistBase):
    """Request body for POST /therapists."""


class TherapistUpdate(BaseModel):
    """Request body for PATCH /therapists/{id}. All fields optional."""

    name: str | None = Field(None, min_length=1, max_length=120)
    specialty: str | None = Field(None, min_length=1, max_length=120)
    phone: str | None = Field(None, max_length=20)
    email: EmailStr | None = None
    qualifications: str | None = None
    experience_years: int | None = Field(None, ge=0, le=80)
    bio: str | None = None
    avatar_url: str | None = Field(None, max_length=255)
    work_days: list[WorkDay] | None = Field(None, min_length=1)
    start_time: time | None = None
    end_time: time | None = None
    slot_minutes: int | None = Field(None, ge=5, le=240)
    is_active: bool | None = None

    @field_validator("work_days")
    @classmethod
    def dedupe_work_days(cls, v: list[str] | None) -> list[str] | None:
        if v is None:
            return None
        seen: set[str] = set()
        out: list[str] = []
        for d in v:
            if d not in seen:
                seen.add(d)
                out.append(d)
        return out


class TherapistRead(TherapistBase):
    """Response body for a single therapist."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class TherapistListItem(BaseModel):
    """Compact version for list endpoints."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    specialty: str
    phone: str | None
    email: EmailStr | None
    experience_years: int | None
    is_active: bool


__all__ = [
    "TherapistCreate",
    "TherapistUpdate",
    "TherapistRead",
    "TherapistListItem",
    "WorkDay",
]
