"""Data access for ScheduleException."""

from datetime import date as date_type

from sqlalchemy.orm import Session

from app.models.schedule_exception import ScheduleException


def get(db: Session, exc_id: int) -> ScheduleException | None:
    return db.get(ScheduleException, exc_id)


def get_by_therapist_and_date(
    db: Session, therapist_id: int, date: date_type
) -> ScheduleException | None:
    return (
        db.query(ScheduleException)
        .filter(
            ScheduleException.therapist_id == therapist_id,
            ScheduleException.date == date,
        )
        .first()
    )


def list_for_therapist(
    db: Session,
    therapist_id: int,
    *,
    upcoming_only: bool = False,
) -> list[ScheduleException]:
    q = db.query(ScheduleException).filter(
        ScheduleException.therapist_id == therapist_id
    )
    if upcoming_only:
        q = q.filter(ScheduleException.date >= date_type.today())
    return q.order_by(ScheduleException.date.asc()).all()


def create(db: Session, data: dict) -> ScheduleException:
    exc = ScheduleException(**data)
    db.add(exc)
    db.commit()
    db.refresh(exc)
    return exc


def update(db: Session, exc: ScheduleException, data: dict) -> ScheduleException:
    for field, value in data.items():
        setattr(exc, field, value)
    db.commit()
    db.refresh(exc)
    return exc


def delete(db: Session, exc: ScheduleException) -> None:
    db.delete(exc)
    db.commit()


__all__ = [
    "get",
    "get_by_therapist_and_date",
    "list_for_therapist",
    "create",
    "update",
    "delete",
]
