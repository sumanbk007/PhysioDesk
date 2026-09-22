"""Business logic for Therapist."""

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.therapist import Therapist
from app.repositories import therapist_repository as repo
from app.schemas.therapist import (
    TherapistCreate,
    TherapistUpdate,
)


def get_or_404(db: Session, therapist_id: int) -> Therapist:
    therapist = repo.get(db, therapist_id)
    if therapist is None:
        raise NotFoundError(f"Therapist {therapist_id} not found.")
    return therapist


def list_therapists(
    db: Session,
    *,
    search: str | None = None,
    specialty: str | None = None,
    is_active: bool | None = None,
    offset: int = 0,
    limit: int = 20,
) -> tuple[list[Therapist], int]:
    return repo.list_paginated(
        db,
        search=search,
        specialty=specialty,
        is_active=is_active,
        offset=offset,
        limit=limit,
    )


def create_therapist(db: Session, payload: TherapistCreate) -> Therapist:
    # Unique email check (nullable)
    if payload.email:
        existing = repo.get_by_email(db, payload.email)
        if existing is not None:
            raise ConflictError(f"A therapist with email {payload.email} already exists.")

    data = payload.model_dump()
    return repo.create(db, data)


def update_therapist(
    db: Session, therapist_id: int, payload: TherapistUpdate
) -> Therapist:
    therapist = get_or_404(db, therapist_id)

    # Only patch provided fields
    updates = payload.model_dump(exclude_unset=True)

    # If email is changing, verify it's not taken by someone else
    new_email = updates.get("email")
    if new_email and new_email != therapist.email:
        existing = repo.get_by_email(db, new_email)
        if existing is not None and existing.id != therapist.id:
            raise ConflictError(f"A therapist with email {new_email} already exists.")

    # Cross-field validation for time range (only when both are present after merge)
    new_start = updates.get("start_time", therapist.start_time)
    new_end = updates.get("end_time", therapist.end_time)
    if new_start is not None and new_end is not None and new_end <= new_start:
        raise ValidationError("end_time must be after start_time.")

    return repo.update(db, therapist, updates)


def delete_therapist(db: Session, therapist_id: int) -> None:
    therapist = get_or_404(db, therapist_id)

    patient_count = repo.count_patients(db, therapist_id)
    if patient_count > 0:
        raise ConflictError(
            f"Cannot delete therapist — {patient_count} patient(s) still assigned. "
            "Reassign or remove them first."
        )

    repo.delete(db, therapist)


def list_specialties(db: Session) -> list[str]:
    return repo.distinct_specialties(db)


__all__ = [
    "get_or_404",
    "list_therapists",
    "create_therapist",
    "update_therapist",
    "delete_therapist",
    "list_specialties",
]
