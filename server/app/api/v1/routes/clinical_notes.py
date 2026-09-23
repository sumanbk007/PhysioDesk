"""Clinical note HTTP endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import PaginationParams, get_db
from app.schemas.clinical_note import (
    ClinicalNoteCreate,
    ClinicalNoteListItem,
    ClinicalNoteRead,
    ClinicalNoteUpdate,
)
from app.schemas.common import MessageResponse, Page
from app.services import clinical_note_service as service

router = APIRouter()


@router.get(
    "/patients/{patient_id}/clinical-notes",
    response_model=Page[ClinicalNoteListItem],
    summary="List clinical notes for a patient (newest first)",
)
def list_notes(
    patient_id: int,
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
) -> Page[ClinicalNoteListItem]:
    items, total = service.list_for_patient(
        db, patient_id, offset=pagination.offset, limit=pagination.limit
    )
    pages = (total + pagination.page_size - 1) // pagination.page_size
    return Page[ClinicalNoteListItem](
        items=[ClinicalNoteListItem.model_validate(n) for n in items],
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        pages=pages,
    )


@router.post(
    "/patients/{patient_id}/clinical-notes",
    response_model=ClinicalNoteRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a clinical note for a patient",
)
def create_note(
    patient_id: int,
    payload: ClinicalNoteCreate,
    db: Session = Depends(get_db),
) -> ClinicalNoteRead:
    note = service.create_note(db, patient_id, payload)
    return ClinicalNoteRead.model_validate(note)


@router.get(
    "/clinical-notes/{note_id}",
    response_model=ClinicalNoteRead,
    summary="Get one clinical note",
)
def get_note(
    note_id: int,
    db: Session = Depends(get_db),
) -> ClinicalNoteRead:
    note = service.get_or_404(db, note_id)
    return ClinicalNoteRead.model_validate(note)


@router.patch(
    "/clinical-notes/{note_id}",
    response_model=ClinicalNoteRead,
    summary="Update a clinical note (partial)",
)
def update_note(
    note_id: int,
    payload: ClinicalNoteUpdate,
    db: Session = Depends(get_db),
) -> ClinicalNoteRead:
    note = service.update_note(db, note_id, payload)
    return ClinicalNoteRead.model_validate(note)


@router.delete(
    "/clinical-notes/{note_id}",
    response_model=MessageResponse,
    summary="Delete a clinical note",
)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
) -> MessageResponse:
    service.delete_note(db, note_id)
    return MessageResponse(message=f"ClinicalNote {note_id} deleted.")
