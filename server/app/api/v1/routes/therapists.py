"""Therapist HTTP endpoints."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import PaginationParams, get_db
from app.schemas.common import MessageResponse, Page
from app.schemas.therapist import (
    TherapistCreate,
    TherapistListItem,
    TherapistRead,
    TherapistUpdate,
)
from app.services import therapist_service as service

router = APIRouter()


# ---------- fixed-path routes FIRST ----------

@router.get(
    "",
    response_model=Page[TherapistListItem],
    summary="List therapists (search + filter + pagination)",
)
def list_therapists(
    search: str | None = Query(None, description="Search name, specialty, phone"),
    specialty: str | None = Query(None, description="Filter by exact specialty"),
    is_active: bool | None = Query(None, description="Filter by active flag"),
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
) -> Page[TherapistListItem]:
    items, total = service.list_therapists(
        db,
        search=search,
        specialty=specialty,
        is_active=is_active,
        offset=pagination.offset,
        limit=pagination.limit,
    )
    pages = (total + pagination.page_size - 1) // pagination.page_size
    return Page[TherapistListItem](
        items=[TherapistListItem.model_validate(t) for t in items],
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        pages=pages,
    )


@router.post(
    "",
    response_model=TherapistRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a therapist",
)
def create_therapist(
    payload: TherapistCreate,
    db: Session = Depends(get_db),
) -> TherapistRead:
    therapist = service.create_therapist(db, payload)
    return TherapistRead.model_validate(therapist)


@router.get(
    "/meta/specialties",
    response_model=list[str],
    summary="Distinct specialty values (for filter dropdowns)",
)
def list_specialties(db: Session = Depends(get_db)) -> list[str]:
    return service.list_specialties(db)


# ---------- parameterized routes AFTER ----------

@router.get(
    "/{therapist_id}",
    response_model=TherapistRead,
    summary="Get one therapist",
)
def get_therapist(
    therapist_id: int,
    db: Session = Depends(get_db),
) -> TherapistRead:
    therapist = service.get_or_404(db, therapist_id)
    return TherapistRead.model_validate(therapist)


@router.patch(
    "/{therapist_id}",
    response_model=TherapistRead,
    summary="Update a therapist (partial)",
)
def update_therapist(
    therapist_id: int,
    payload: TherapistUpdate,
    db: Session = Depends(get_db),
) -> TherapistRead:
    therapist = service.update_therapist(db, therapist_id, payload)
    return TherapistRead.model_validate(therapist)


@router.delete(
    "/{therapist_id}",
    response_model=MessageResponse,
    summary="Delete a therapist (blocked if patients assigned)",
)
def delete_therapist(
    therapist_id: int,
    db: Session = Depends(get_db),
) -> MessageResponse:
    service.delete_therapist(db, therapist_id)
    return MessageResponse(message=f"Therapist {therapist_id} deleted.")
