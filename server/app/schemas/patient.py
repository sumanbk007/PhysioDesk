"""Pydantic schemas for Patient."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.constants import Gender, PatientStatus


class PatientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    age: int = Field(..., ge=0, le=120)
    gender: str = Field(..., min_length=1, max_length=16)
    phone: str = Field(..., min_length=1, max_length=20)
    address: str | None = Field(None, max_length=255)
    condition: str = Field(..., min_length=1, max_length=255)

    therapist_id: int = Field(..., gt=0)

    package: str | None = Field(None, max_length=120)
    sessions_total: int = Field(0, ge=0, le=1000)
    sessions_used: int = Field(0, ge=0, le=1000)

    status: str = Field(PatientStatus.ACTIVE.value, max_length=32)
    notes: str | None = None

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        valid = {g.value for g in Gender}
        if v not in valid:
            raise ValueError(f"gender must be one of {sorted(valid)}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid = {s.value for s in PatientStatus}
        if v not in valid:
            raise ValueError(f"status must be one of {sorted(valid)}")
        return v

    @field_validator("sessions_used")
    @classmethod
    def used_le_total(cls, v: int, info):
        total = info.data.get("sessions_total")
        if total is not None and v > total:
            raise ValueError("sessions_used cannot exceed sessions_total")
        return v


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=120)
    age: int | None = Field(None, ge=0, le=120)
    gender: str | None = Field(None, min_length=1, max_length=16)
    phone: str | None = Field(None, min_length=1, max_length=20)
    address: str | None = Field(None, max_length=255)
    condition: str | None = Field(None, min_length=1, max_length=255)
    therapist_id: int | None = Field(None, gt=0)
    package: str | None = Field(None, max_length=120)
    sessions_total: int | None = Field(None, ge=0, le=1000)
    sessions_used: int | None = Field(None, ge=0, le=1000)
    status: str | None = Field(None, max_length=32)
    notes: str | None = None

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: str | None) -> str | None:
        if v is None:
            return None
        valid = {g.value for g in Gender}
        if v not in valid:
            raise ValueError(f"gender must be one of {sorted(valid)}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        if v is None:
            return None
        valid = {s.value for s in PatientStatus}
        if v not in valid:
            raise ValueError(f"status must be one of {sorted(valid)}")
        return v


class PatientRead(PatientBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime


class PatientListItem(BaseModel):
    """Compact version for list views. Includes therapist name via join."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    age: int
    gender: str
    phone: str
    condition: str
    therapist_id: int
    status: str
    sessions_total: int
    sessions_used: int


__all__ = [
    "PatientCreate",
    "PatientUpdate",
    "PatientRead",
    "PatientListItem",
]
