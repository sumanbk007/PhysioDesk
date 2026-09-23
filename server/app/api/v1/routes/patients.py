"""Patient HTTP endpoints."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import PaginationParams, get_db
from app.schemas.appointment import AppointmentListItem
from app.schemas.common import MessageResponse, Page
from app.schemas.patient import (
    PatientCreate,
    PatientListItem,
    PatientRead,
    PatientUpdate,
)
from app.services import appointment_service as appt_service
from app.services import patient_service as service

router = APIRouter()


@router.get(
    "",
    response_model=Page[PatientListItem],
    summary="List patients (search + filter + pagination)",
)
def list_patients(
    search: str | None = Query(None, description="Search by name or phone"),
    therapist_id: int | None = Query(None, description="Filter by assigned therapist"),
    status: str | None = Query(
        None, description="Filter by status (Active / Completed / Due for follow-up)"
    ),
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
) -> Page[PatientListItem]:
    items, total = service.list_patients(
        db,
        search=search,
        therapist_id=therapist_id,
        status=status,
        offset=pagination.offset,
        limit=pagination.limit,
    )
    pages = (total + pagination.page_size - 1) // pagination.page_size
    return Page[PatientListItem](
        items=[PatientListItem.model_validate(p) for p in items],
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        pages=pages,
    )


@router.post(
    "",
    response_model=PatientRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a patient",
)
def create_patient(
    payload: PatientCreate,
    db: Session = Depends(get_db),
) -> PatientRead:
    patient = service.create_patient(db, payload)
    return PatientRead.model_validate(patient)


@router.get(
    "/meta/statuses",
    response_model=list[str],
    summary="Distinct status values (for filter dropdowns)",
)
def list_statuses(db: Session = Depends(get_db)) -> list[str]:
    return service.list_statuses(db)


@router.get(
    "/{patient_id}",
    response_model=PatientRead,
    summary="Get one patient",
)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
) -> PatientRead:
    patient = service.get_or_404(db, patient_id)
    return PatientRead.model_validate(patient)


@router.patch(
    "/{patient_id}",
    response_model=PatientRead,
    summary="Update a patient (partial)",
)
def update_patient(
    patient_id: int,
    payload: PatientUpdate,
    db: Session = Depends(get_db),
) -> PatientRead:
    patient = service.update_patient(db, patient_id, payload)
    return PatientRead.model_validate(patient)


@router.delete(
    "/{patient_id}",
    response_model=MessageResponse,
    summary="Delete a patient (cascades to notes, reports, notifications)",
)
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
) -> MessageResponse:
    service.delete_patient(db, patient_id)
    return MessageResponse(message=f"Patient {patient_id} deleted.")


@router.get(
    "/{patient_id}/appointments",
    response_model=Page[AppointmentListItem],
    summary="List this patient's appointments (session history)",
)
def list_patient_appointments(
    patient_id: int,
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
) -> Page[AppointmentListItem]:
    items, total = appt_service.list_for_patient(
        db, patient_id, offset=pagination.offset, limit=pagination.limit
    )
    pages = (total + pagination.page_size - 1) // pagination.page_size
    return Page[AppointmentListItem](
        items=[AppointmentListItem.model_validate(a) for a in items],
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        pages=pages,
    )
