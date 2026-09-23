"""Dashboard HTTP endpoints for §3.1."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.dashboard import CapacityEntry, DashboardSummary, RecentPatient
from app.services import dashboard_service

router = APIRouter()


@router.get(
    "/summary",
    response_model=DashboardSummary,
    summary="Today's summary stats",
)
def get_summary(db: Session = Depends(get_db)) -> DashboardSummary:
    return dashboard_service.build_summary(db)


@router.get(
    "/capacity",
    response_model=list[CapacityEntry],
    summary="Therapist capacity strip for today",
)
def get_capacity(db: Session = Depends(get_db)) -> list[CapacityEntry]:
    return dashboard_service.build_capacity(db)


@router.get(
    "/recent-patients",
    response_model=list[RecentPatient],
    summary="Most recently added patients",
)
def get_recent_patients(
    limit: int = Query(5, ge=1, le=50),
    db: Session = Depends(get_db),
) -> list[RecentPatient]:
    return dashboard_service.build_recent_patients(db, limit=limit)
