"""Pydantic schemas for the derived schedule grid."""

from datetime import date as date_type
from datetime import time as time_type

from pydantic import BaseModel


class SlotRead(BaseModel):
    start_time: time_type
    end_time: time_type
    is_booked: bool
    appointment_id: int | None = None
    patient_id: int | None = None
    patient_name: str | None = None
    status: str | None = None


class TherapistDaySchedule(BaseModel):
    therapist_id: int
    therapist_name: str
    is_off: bool
    override_reason: str | None = None
    working_hours: tuple[time_type, time_type] | None = None
    slot_minutes: int
    total_slots: int
    booked_slots: int
    free_slots: int
    slots: list[SlotRead]


class DaySchedule(BaseModel):
    date: date_type
    therapists: list[TherapistDaySchedule]


__all__ = ["SlotRead", "TherapistDaySchedule", "DaySchedule"]
