"""Data access for Patient."""

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.patient import Patient


def get(db: Session, patient_id: int) -> Patient | None:
    return db.get(Patient, patient_id)


def list_paginated(
    db: Session,
    *,
    search: str | None = None,
    therapist_id: int | None = None,
    status: str | None = None,
    offset: int = 0,
    limit: int = 20,
) -> tuple[list[Patient], int]:
    """Return (items, total) matching the filters."""
    query = db.query(Patient)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                Patient.name.ilike(pattern),
                Patient.phone.ilike(pattern),
            )
        )

    if therapist_id is not None:
        query = query.filter(Patient.therapist_id == therapist_id)

    if status:
        query = query.filter(Patient.status == status)

    total = query.with_entities(func.count(Patient.id)).scalar() or 0

    items = (
        query.order_by(Patient.name.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return items, total


def create(db: Session, data: dict) -> Patient:
    patient = Patient(**data)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def update(db: Session, patient: Patient, data: dict) -> Patient:
    for field, value in data.items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    return patient


def delete(db: Session, patient: Patient) -> None:
    db.delete(patient)
    db.commit()


def distinct_statuses(db: Session) -> list[str]:
    rows = (
        db.query(Patient.status)
        .distinct()
        .order_by(Patient.status)
        .all()
    )
    return [r[0] for r in rows]


__all__ = [
    "get",
    "list_paginated",
    "create",
    "update",
    "delete",
    "distinct_statuses",
]
