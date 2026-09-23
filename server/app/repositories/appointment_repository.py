"""Data access for Appointment."""

from datetime import date as date_type
from datetime import time as time_type

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.appointment import Appointment


def get(db: Session, appointment_id: int) -> Appointment | None:
    return db.get(Appointment, appointment_id)


def list_for_therapist_on_date(
    db: Session, therapist_id: int, date: date_type
) -> list[Appointment]:
    return (
        db.query(Appointment)
        .filter(
            Appointment.therapist_id == therapist_id,
            Appointment.date == date,
        )
        .order_by(Appointment.start_time.asc())
        .all()
    )


def list_for_patient(
    db: Session,
    patient_id: int,
    *,
    offset: int = 0,
    limit: int = 20,
) -> tuple[list[Appointment], int]:
    q = db.query(Appointment).filter(Appointment.patient_id == patient_id)
    total = q.with_entities(func.count(Appointment.id)).scalar() or 0
    items = (
        q.order_by(Appointment.date.desc(), Appointment.start_time.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return items, total


def find_conflict(
    db: Session,
    therapist_id: int,
    date: date_type,
    start_time: time_type,
    exclude_id: int | None = None,
) -> Appointment | None:
    """Return an existing appointment in the same (therapist, date, start_time) slot."""
    q = db.query(Appointment).filter(
        Appointment.therapist_id == therapist_id,
        Appointment.date == date,
        Appointment.start_time == start_time,
        Appointment.status != "Cancelled",
    )
    if exclude_id is not None:
        q = q.filter(Appointment.id != exclude_id)
    return q.first()


def create(db: Session, data: dict) -> Appointment:
    appt = Appointment(**data)
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt


def update(db: Session, appt: Appointment, data: dict) -> Appointment:
    for field, value in data.items():
        setattr(appt, field, value)
    db.commit()
    db.refresh(appt)
    return appt


def delete(db: Session, appt: Appointment) -> None:
    db.delete(appt)
    db.commit()


__all__ = [
    "get",
    "list_for_therapist_on_date",
    "list_for_patient",
    "find_conflict",
    "create",
    "update",
    "delete",
]
