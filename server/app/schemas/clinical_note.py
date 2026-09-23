"""Pydantic schemas for ClinicalNote."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ClinicalNoteBase(BaseModel):
    appointment_id: int | None = Field(None, gt=0)
    note_date: datetime | None = None

    chief_complaint: str | None = None
    pain_location: str | None = Field(None, max_length=120)
    pain_score: int | None = Field(None, ge=0, le=10)

    diagnosis: str | None = None
    assessment: str | None = None

    rom: str | None = None
    rom_score: int | None = Field(None, ge=0, le=100)

    strength: str | None = None
    strength_score: int | None = Field(None, ge=0, le=5)

    special_tests: str | None = None
    treatment: str | None = None
    exercises: str | None = None
    patient_response: str | None = None
    hep: str | None = None
    plan: str | None = None
    therapist_notes: str | None = None
    milestone: str | None = None


class ClinicalNoteCreate(ClinicalNoteBase):
    therapist_id: int = Field(..., gt=0)


class ClinicalNoteUpdate(BaseModel):
    therapist_id: int | None = Field(None, gt=0)
    appointment_id: int | None = Field(None, gt=0)
    note_date: datetime | None = None

    chief_complaint: str | None = None
    pain_location: str | None = Field(None, max_length=120)
    pain_score: int | None = Field(None, ge=0, le=10)

    diagnosis: str | None = None
    assessment: str | None = None

    rom: str | None = None
    rom_score: int | None = Field(None, ge=0, le=100)

    strength: str | None = None
    strength_score: int | None = Field(None, ge=0, le=5)

    special_tests: str | None = None
    treatment: str | None = None
    exercises: str | None = None
    patient_response: str | None = None
    hep: str | None = None
    plan: str | None = None
    therapist_notes: str | None = None
    milestone: str | None = None


class ClinicalNoteRead(ClinicalNoteBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    therapist_id: int
    note_date: datetime
    created_at: datetime
    updated_at: datetime


class ClinicalNoteListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    therapist_id: int
    note_date: datetime
    pain_score: int | None
    rom_score: int | None
    strength_score: int | None
    milestone: str | None


__all__ = [
    "ClinicalNoteCreate",
    "ClinicalNoteUpdate",
    "ClinicalNoteRead",
    "ClinicalNoteListItem",
]
