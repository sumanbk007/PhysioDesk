"""Patient progress endpoint (derived from clinical notes)."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.progress import ProgressRead
from app.services import progress_service

router = APIRouter()


@router.get(
    "/patients/{patient_id}/progress",
    response_model=ProgressRead,
    summary="Pain/ROM/strength series + milestone timeline for a patient",
)
def get_progress(
    patient_id: int,
    db: Session = Depends(get_db),
) -> ProgressRead:
    return progress_service.build_progress(db, patient_id)
