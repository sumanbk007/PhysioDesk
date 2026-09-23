"""Pydantic schemas for the dashboard endpoints."""

from datetime import date as date_type
from decimal import Decimal

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    date: date_type
    patients_seen_today: int
    therapists_on_duty: int
    revenue_today: Decimal
    open_slots_today: int


class CapacityEntry(BaseModel):
    therapist_id: int
    therapist_name: str
    total_slots: int
    booked_slots: int
    free_slots: int


class RecentPatient(BaseModel):
    id: int
    name: str
    phone: str
    status: str
    therapist_id: int


__all__ = ["DashboardSummary", "CapacityEntry", "RecentPatient"]
