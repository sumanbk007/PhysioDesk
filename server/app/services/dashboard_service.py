"""Aggregated dashboard queries for §3.1."""

from datetime import date as date_type
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.payment import Payment
from app.models.therapist import Therapist
from app.schemas.dashboard import CapacityEntry, DashboardSummary, RecentPatient
from app.services import schedule_service


DAY_ABBREV = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def build_summary(db: Session, today: date_type | None = None) -> DashboardSummary:
    today = today or date_type.today()

    patients_seen = (
        db.query(func.count(Appointment.id))
        .filter(
            Appointment.date == today,
            Appointment.status == "Completed",
        )
        .scalar()
        or 0
    )

    day_code = DAY_ABBREV[today.weekday()]
    therapists = (
        db.query(Therapist).filter(Therapist.is_active.is_(True)).all()
    )
    on_duty_count = sum(1 for t in therapists if day_code in (t.work_days or []))

    revenue_today = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(
            func.date(Payment.created_at) == today,
            Payment.amount > 0,
        )
        .scalar()
    )

    schedule = schedule_service.build_day_schedule(db, today)
    open_slots = sum(t.free_slots for t in schedule.therapists)

    return DashboardSummary(
        date=today,
        patients_seen_today=int(patients_seen),
        therapists_on_duty=int(on_duty_count),
        revenue_today=Decimal(str(revenue_today or 0)),
        open_slots_today=int(open_slots),
    )


def build_capacity(db: Session, today: date_type | None = None) -> list[CapacityEntry]:
    today = today or date_type.today()
    schedule = schedule_service.build_day_schedule(db, today)
    return [
        CapacityEntry(
            therapist_id=t.therapist_id,
            therapist_name=t.therapist_name,
            total_slots=t.total_slots,
            booked_slots=t.booked_slots,
            free_slots=t.free_slots,
        )
        for t in schedule.therapists
    ]


def build_recent_patients(db: Session, limit: int = 5) -> list[RecentPatient]:
    rows = (
        db.query(Patient)
        .order_by(Patient.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        RecentPatient(
            id=p.id,
            name=p.name,
            phone=p.phone,
            status=p.status,
            therapist_id=p.therapist_id,
        )
        for p in rows
    ]


__all__ = ["build_summary", "build_capacity", "build_recent_patients"]
