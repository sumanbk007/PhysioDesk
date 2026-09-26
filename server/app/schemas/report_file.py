"""Pydantic schemas for ReportFile."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ReportFileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    filename: str
    mime_type: str
    size_bytes: int
    description: str | None
    uploaded_by: int | None
    uploaded_at: datetime


class ReportFileWithUrl(ReportFileRead):
    """Report row with a URL the frontend can use to download the file."""

    url: str


__all__ = ["ReportFileRead", "ReportFileWithUrl"]
