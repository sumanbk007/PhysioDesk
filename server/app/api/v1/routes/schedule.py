"""Day-view schedule grid endpoint."""

from datetime import date as date_type

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.schedule import DaySchedule
from app.services import schedule_service

router = APIRouter()


@router.get(
    "",
    response_model=DaySchedule,
    summary="Day-view schedule grid (slots per therapist for a given date)",
)
def get_day_schedule(
    date: date_type = Query(..., description="Date in YYYY-MM-DD format"),
    therapist_id: int | None = Query(
        None, description="Optional: restrict to a single therapist"
    ),
    db: Session = Depends(get_db),
) -> DaySchedule:
    return schedule_service.build_day_schedule(db, date, therapist_id=therapist_id)
