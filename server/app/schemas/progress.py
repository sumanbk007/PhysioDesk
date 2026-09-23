"""Pydantic schemas for the derived patient progress endpoint."""

from datetime import datetime

from pydantic import BaseModel


class ProgressPoint(BaseModel):
    date: datetime
    value: float


class MilestoneItem(BaseModel):
    date: datetime
    text: str


class ProgressRead(BaseModel):
    patient_id: int
    pain: list[ProgressPoint]
    rom: list[ProgressPoint]
    strength: list[ProgressPoint]
    milestones: list[MilestoneItem]


__all__ = ["ProgressPoint", "MilestoneItem", "ProgressRead"]
