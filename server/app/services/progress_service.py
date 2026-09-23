"""Derive progress series and milestone timeline from clinical notes."""

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.repositories import clinical_note_repository as note_repo
from app.repositories import patient_repository as patient_repo
from app.schemas.progress import MilestoneItem, ProgressPoint, ProgressRead


def _series(db: Session, patient_id: int, field: str) -> list[ProgressPoint]:
    rows = note_repo.list_score_series(db, patient_id, field)
    return [ProgressPoint(date=dt, value=float(val)) for dt, val in rows]


def build_progress(db: Session, patient_id: int) -> ProgressRead:
    if patient_repo.get(db, patient_id) is None:
        raise NotFoundError(f"Patient {patient_id} not found.")

    pain = _series(db, patient_id, "pain_score")
    rom = _series(db, patient_id, "rom_score")
    strength = _series(db, patient_id, "strength_score")

    milestone_notes = note_repo.list_milestones_for_patient(db, patient_id)
    milestones = [
        MilestoneItem(date=n.note_date, text=n.milestone or "")
        for n in milestone_notes
    ]

    return ProgressRead(
        patient_id=patient_id,
        pain=pain,
        rom=rom,
        strength=strength,
        milestones=milestones,
    )


__all__ = ["build_progress"]
