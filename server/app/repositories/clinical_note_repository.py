"""Data access for ClinicalNote."""

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.clinical_note import ClinicalNote


def get(db: Session, note_id: int) -> ClinicalNote | None:
    return db.get(ClinicalNote, note_id)


def list_for_patient(
    db: Session,
    patient_id: int,
    *,
    offset: int = 0,
    limit: int = 20,
) -> tuple[list[ClinicalNote], int]:
    q = db.query(ClinicalNote).filter(ClinicalNote.patient_id == patient_id)
    total = q.with_entities(func.count(ClinicalNote.id)).scalar() or 0
    items = (
        q.order_by(ClinicalNote.note_date.desc(), ClinicalNote.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return items, total


def count_for_patient(db: Session, patient_id: int) -> int:
    return (
        db.query(func.count(ClinicalNote.id))
        .filter(ClinicalNote.patient_id == patient_id)
        .scalar()
        or 0
    )


def list_milestones_for_patient(db: Session, patient_id: int) -> list[ClinicalNote]:
    return (
        db.query(ClinicalNote)
        .filter(
            ClinicalNote.patient_id == patient_id,
            ClinicalNote.milestone.is_not(None),
        )
        .order_by(ClinicalNote.note_date.asc())
        .all()
    )


def list_score_series(
    db: Session, patient_id: int, field: str
) -> list[tuple]:
    """Return (note_date, value) for a given numeric score column, ascending."""
    column = getattr(ClinicalNote, field)
    rows = (
        db.query(ClinicalNote.note_date, column)
        .filter(ClinicalNote.patient_id == patient_id, column.is_not(None))
        .order_by(ClinicalNote.note_date.asc())
        .all()
    )
    return rows


def create(db: Session, data: dict) -> ClinicalNote:
    note = ClinicalNote(**data)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def update(db: Session, note: ClinicalNote, data: dict) -> ClinicalNote:
    for field, value in data.items():
        setattr(note, field, value)
    db.commit()
    db.refresh(note)
    return note


def delete(db: Session, note: ClinicalNote) -> None:
    db.delete(note)
    db.commit()


__all__ = [
    "get",
    "list_for_patient",
    "count_for_patient",
    "list_milestones_for_patient",
    "list_score_series",
    "create",
    "update",
    "delete",
]
