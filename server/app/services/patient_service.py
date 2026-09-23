"""Business logic for Patient."""

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationError
from app.models.patient import Patient
from app.repositories import patient_repository as repo
from app.repositories import therapist_repository as therapist_repo
from app.schemas.patient import PatientCreate, PatientUpdate


def get_or_404(db: Session, patient_id: int) -> Patient:
    patient = repo.get(db, patient_id)
    if patient is None:
        raise NotFoundError(f"Patient {patient_id} not found.")
    return patient


def list_patients(
    db: Session,
    *,
    search: str | None = None,
    therapist_id: int | None = None,
    status: str | None = None,
    offset: int = 0,
    limit: int = 20,
) -> tuple[list[Patient], int]:
    return repo.list_paginated(
        db,
        search=search,
        therapist_id=therapist_id,
        status=status,
        offset=offset,
        limit=limit,
    )


def _verify_therapist_exists(db: Session, therapist_id: int) -> None:
    if therapist_repo.get(db, therapist_id) is None:
        raise ValidationError(f"Therapist {therapist_id} does not exist.")


def create_patient(db: Session, payload: PatientCreate) -> Patient:
    _verify_therapist_exists(db, payload.therapist_id)

    data = payload.model_dump()
    return repo.create(db, data)


def update_patient(
    db: Session, patient_id: int, payload: PatientUpdate
) -> Patient:
    patient = get_or_404(db, patient_id)
    updates = payload.model_dump(exclude_unset=True)

    if "therapist_id" in updates:
        _verify_therapist_exists(db, updates["therapist_id"])

    # Cross-field check: sessions_used <= sessions_total
    new_used = updates.get("sessions_used", patient.sessions_used)
    new_total = updates.get("sessions_total", patient.sessions_total)
    if new_used is not None and new_total is not None and new_used > new_total:
        raise ValidationError("sessions_used cannot exceed sessions_total.")

    return repo.update(db, patient, updates)


def delete_patient(db: Session, patient_id: int) -> None:
    patient = get_or_404(db, patient_id)
    repo.delete(db, patient)


def list_statuses(db: Session) -> list[str]:
    return repo.distinct_statuses(db)


__all__ = [
    "get_or_404",
    "list_patients",
    "create_patient",
    "update_patient",
    "delete_patient",
    "list_statuses",
]
