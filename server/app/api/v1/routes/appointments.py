"""Appointment HTTP endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentRead,
    AppointmentUpdate,
)
from app.schemas.common import MessageResponse
from app.services import appointment_service as service

router = APIRouter()


@router.post(
    "",
    response_model=AppointmentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Book an appointment (rejects double-booking)",
)
def create_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
) -> AppointmentRead:
    appt = service.create_appointment(db, payload)
    return AppointmentRead.model_validate(appt)


@router.get(
    "/{appointment_id}",
    response_model=AppointmentRead,
    summary="Get one appointment",
)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
) -> AppointmentRead:
    appt = service.get_or_404(db, appointment_id)
    return AppointmentRead.model_validate(appt)


@router.patch(
    "/{appointment_id}",
    response_model=AppointmentRead,
    summary="Update an appointment (reschedule, cancel, change status/notes)",
)
def update_appointment(
    appointment_id: int,
    payload: AppointmentUpdate,
    db: Session = Depends(get_db),
) -> AppointmentRead:
    appt = service.update_appointment(db, appointment_id, payload)
    return AppointmentRead.model_validate(appt)


@router.delete(
    "/{appointment_id}",
    response_model=MessageResponse,
    summary="Delete an appointment",
)
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
) -> MessageResponse:
    service.delete_appointment(db, appointment_id)
    return MessageResponse(message=f"Appointment {appointment_id} deleted.")
