"""Data access for Therapist — no business logic here."""

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.therapist import Therapist


def get(db: Session, therapist_id: int) -> Therapist | None:
    return db.get(Therapist, therapist_id)


def get_by_email(db: Session, email: str) -> Therapist | None:
    return db.query(Therapist).filter(Therapist.email == email).first()


def list_paginated(
    db: Session,
    *,
    search: str | None = None,
    specialty: str | None = None,
    is_active: bool | None = None,
    offset: int = 0,
    limit: int = 20,
) -> tuple[list[Therapist], int]:
    """Return (items, total_count) matching the given filters."""
    query = db.query(Therapist)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                Therapist.name.ilike(pattern),
                Therapist.specialty.ilike(pattern),
                Therapist.phone.ilike(pattern),
            )
        )

    if specialty:
        query = query.filter(Therapist.specialty == specialty)

    if is_active is not None:
        query = query.filter(Therapist.is_active == is_active)

    total = query.with_entities(func.count(Therapist.id)).scalar() or 0

    items = (
        query.order_by(Therapist.name.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return items, total


def create(db: Session, data: dict) -> Therapist:
    therapist = Therapist(**data)
    db.add(therapist)
    db.commit()
    db.refresh(therapist)
    return therapist


def update(db: Session, therapist: Therapist, data: dict) -> Therapist:
    for field, value in data.items():
        setattr(therapist, field, value)
    db.commit()
    db.refresh(therapist)
    return therapist


def delete(db: Session, therapist: Therapist) -> None:
    db.delete(therapist)
    db.commit()


def count_patients(db: Session, therapist_id: int) -> int:
    """Number of patients assigned to this therapist (used by delete guard)."""
    from app.models.patient import Patient

    return (
        db.query(func.count(Patient.id))
        .filter(Patient.therapist_id == therapist_id)
        .scalar()
        or 0
    )


def distinct_specialties(db: Session) -> list[str]:
    """All distinct specialty values (for filter dropdowns)."""
    rows = (
        db.query(Therapist.specialty)
        .filter(Therapist.is_active.is_(True))
        .distinct()
        .order_by(Therapist.specialty)
        .all()
    )
    return [r[0] for r in rows]


__all__ = [
    "get",
    "get_by_email",
    "list_paginated",
    "create",
    "update",
    "delete",
    "count_patients",
    "distinct_specialties",
]
