"""Business logic for ScheduleException."""

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.schedule_exception import ScheduleException
from app.repositories import schedule_exception_repository as repo
from app.repositories import therapist_repository as therapist_repo
from app.schemas.schedule_exception import (
    ScheduleExceptionCreate,
    ScheduleExceptionUpdate,
)


def get_or_404(db: Session, exc_id: int) -> ScheduleException:
    exc = repo.get(db, exc_id)
    if exc is None:
        raise NotFoundError(f"ScheduleException {exc_id} not found.")
    return exc


def list_for_therapist(
    db: Session, therapist_id: int, *, upcoming_only: bool = False
) -> list[ScheduleException]:
    if therapist_repo.get(db, therapist_id) is None:
        raise NotFoundError(f"Therapist {therapist_id} not found.")
    return repo.list_for_therapist(db, therapist_id, upcoming_only=upcoming_only)


def create_for_therapist(
    db: Session, therapist_id: int, payload: ScheduleExceptionCreate
) -> ScheduleException:
    if therapist_repo.get(db, therapist_id) is None:
        raise NotFoundError(f"Therapist {therapist_id} not found.")

    if repo.get_by_therapist_and_date(db, therapist_id, payload.date) is not None:
        raise ConflictError(
            f"An override already exists for therapist {therapist_id} on {payload.date}."
        )

    _validate_exception_payload(
        payload.is_off, payload.custom_start, payload.custom_end
    )

    data = payload.model_dump()
    data["therapist_id"] = therapist_id
    return repo.create(db, data)


def update_exception(
    db: Session, exc_id: int, payload: ScheduleExceptionUpdate
) -> ScheduleException:
    exc = get_or_404(db, exc_id)
    updates = payload.model_dump(exclude_unset=True)

    new_is_off = updates.get("is_off", exc.is_off)
    new_start = updates.get("custom_start", exc.custom_start)
    new_end = updates.get("custom_end", exc.custom_end)

    _validate_exception_payload(new_is_off, new_start, new_end)

    return repo.update(db, exc, updates)


def delete_exception(db: Session, exc_id: int) -> None:
    exc = get_or_404(db, exc_id)
    repo.delete(db, exc)


def _validate_exception_payload(
    is_off: bool, custom_start, custom_end
) -> None:
    """If not a day off, custom hours must be provided and valid."""
    if is_off:
        return
    if custom_start is None or custom_end is None:
        raise ValidationError(
            "custom_start and custom_end are required when is_off is false."
        )
    if custom_end <= custom_start:
        raise ValidationError("custom_end must be after custom_start.")


__all__ = [
    "get_or_404",
    "list_for_therapist",
    "create_for_therapist",
    "update_exception",
    "delete_exception",
]
