"""Business logic for ClinicalNote.

Owns the invariant: patient.sessions_used == COUNT(clinical_notes for that patient).
Whenever a note is created or deleted, we recompute the counter rather than
incrementing, so the value can never drift.

Status-code policy:
  - Patient comes from the URL → missing patient is 404
  - Therapist / Appointment come from the body → missing is 400 (validation)
"""

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationError
from app.models.clinical_note import ClinicalNote
from app.repositories import appointment_repository as appt_repo
from app.repositories import clinical_note_repository as repo
from app.repositories import patient_repository as patient_repo
from app.repositories import therapist_repository as therapist_repo
from app.schemas.clinical_note import ClinicalNoteCreate, ClinicalNoteUpdate


def get_or_404(db: Session, note_id: int) -> ClinicalNote:
    note = repo.get(db, note_id)
    if note is None:
        raise NotFoundError(f"ClinicalNote {note_id} not found.")
    return note


def list_for_patient(
    db: Session, patient_id: int, *, offset: int = 0, limit: int = 20
) -> tuple[list[ClinicalNote], int]:
    if patient_repo.get(db, patient_id) is None:
        raise NotFoundError(f"Patient {patient_id} not found.")
    return repo.list_for_patient(db, patient_id, offset=offset, limit=limit)


def _verify_related_entities(
    db: Session,
    therapist_id: int,
    appointment_id: int | None,
    patient_id: int,
) -> None:
    if therapist_repo.get(db, therapist_id) is None:
        raise ValidationError(f"Therapist {therapist_id} does not exist.")
    if appointment_id is not None:
        appt = appt_repo.get(db, appointment_id)
        if appt is None:
            raise ValidationError(f"Appointment {appointment_id} does not exist.")
        if appt.patient_id != patient_id:
            raise ValidationError(
                f"Appointment {appointment_id} does not belong to patient {patient_id}."
            )


def _recompute_sessions_used(db: Session, patient_id: int) -> None:
    patient = patient_repo.get(db, patient_id)
    if patient is None:
        return
    count = repo.count_for_patient(db, patient_id)
    if patient.sessions_used != count:
        patient.sessions_used = count
        db.commit()


def create_note(
    db: Session, patient_id: int, payload: ClinicalNoteCreate
) -> ClinicalNote:
    if patient_repo.get(db, patient_id) is None:
        raise NotFoundError(f"Patient {patient_id} not found.")

    _verify_related_entities(
        db, payload.therapist_id, payload.appointment_id, patient_id
    )

    data = payload.model_dump(exclude_unset=False)
    data["patient_id"] = patient_id
    if data.get("note_date") is None:
        data.pop("note_date", None)

    note = repo.create(db, data)
    _recompute_sessions_used(db, patient_id)
    return note


def update_note(
    db: Session, note_id: int, payload: ClinicalNoteUpdate
) -> ClinicalNote:
    note = get_or_404(db, note_id)
    updates = payload.model_dump(exclude_unset=True)

    if "therapist_id" in updates:
        if therapist_repo.get(db, updates["therapist_id"]) is None:
            raise ValidationError(
                f"Therapist {updates['therapist_id']} does not exist."
            )

    if "appointment_id" in updates and updates["appointment_id"] is not None:
        appt = appt_repo.get(db, updates["appointment_id"])
        if appt is None:
            raise ValidationError(
                f"Appointment {updates['appointment_id']} does not exist."
            )
        if appt.patient_id != note.patient_id:
            raise ValidationError(
                f"Appointment {updates['appointment_id']} does not belong to patient {note.patient_id}."
            )

    return repo.update(db, note, updates)


def delete_note(db: Session, note_id: int) -> None:
    note = get_or_404(db, note_id)
    patient_id = note.patient_id
    repo.delete(db, note)
    _recompute_sessions_used(db, patient_id)


__all__ = [
    "get_or_404",
    "list_for_patient",
    "create_note",
    "update_note",
    "delete_note",
]
