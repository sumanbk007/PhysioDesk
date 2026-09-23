"""Business logic for Appointment CRUD."""

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.appointment import Appointment
from app.repositories import appointment_repository as repo
from app.repositories import patient_repository as patient_repo
from app.repositories import therapist_repository as therapist_repo
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate


def get_or_404(db: Session, appointment_id: int) -> Appointment:
    appt = repo.get(db, appointment_id)
    if appt is None:
        raise NotFoundError(f"Appointment {appointment_id} not found.")
    return appt


def list_for_patient(
    db: Session, patient_id: int, *, offset: int = 0, limit: int = 20
) -> tuple[list[Appointment], int]:
    if patient_repo.get(db, patient_id) is None:
        raise NotFoundError(f"Patient {patient_id} not found.")
    return repo.list_for_patient(db, patient_id, offset=offset, limit=limit)


def _verify_entities(db: Session, patient_id: int, therapist_id: int) -> None:
    if patient_repo.get(db, patient_id) is None:
        raise ValidationError(f"Patient {patient_id} does not exist.")
    if therapist_repo.get(db, therapist_id) is None:
        raise ValidationError(f"Therapist {therapist_id} does not exist.")


def create_appointment(db: Session, payload: AppointmentCreate) -> Appointment:
    _verify_entities(db, payload.patient_id, payload.therapist_id)

    conflict = repo.find_conflict(
        db,
        therapist_id=payload.therapist_id,
        date=payload.date,
        start_time=payload.start_time,
    )
    if conflict is not None:
        raise ConflictError(
            f"Therapist {payload.therapist_id} is already booked on "
            f"{payload.date} at {payload.start_time}."
        )

    return repo.create(db, payload.model_dump())


def update_appointment(
    db: Session, appointment_id: int, payload: AppointmentUpdate
) -> Appointment:
    appt = get_or_404(db, appointment_id)
    updates = payload.model_dump(exclude_unset=True)

    new_date = updates.get("date", appt.date)
    new_start = updates.get("start_time", appt.start_time)
    new_end = updates.get("end_time", appt.end_time)
    new_status = updates.get("status", appt.status)

    if new_end <= new_start:
        raise ValidationError("end_time must be after start_time.")

    if "start_time" in updates or "date" in updates:
        if new_status != "Cancelled":
            conflict = repo.find_conflict(
                db,
                therapist_id=appt.therapist_id,
                date=new_date,
                start_time=new_start,
                exclude_id=appt.id,
            )
            if conflict is not None:
                raise ConflictError(
                    f"Therapist {appt.therapist_id} is already booked on "
                    f"{new_date} at {new_start}."
                )

    return repo.update(db, appt, updates)


def delete_appointment(db: Session, appointment_id: int) -> None:
    appt = get_or_404(db, appointment_id)
    repo.delete(db, appt)


__all__ = [
    "get_or_404",
    "list_for_patient",
    "create_appointment",
    "update_appointment",
    "delete_appointment",
]
