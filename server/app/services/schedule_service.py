"""Derive day-view slot grids from therapist hours, overrides, and bookings."""

from datetime import date as date_type
from datetime import datetime, time as time_type, timedelta

from sqlalchemy.orm import Session

from app.models.therapist import Therapist
from app.repositories import appointment_repository as appt_repo
from app.repositories import schedule_exception_repository as exc_repo
from app.repositories import therapist_repository as therapist_repo
from app.schemas.schedule import DaySchedule, SlotRead, TherapistDaySchedule

DAY_ABBREV = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def _day_code(d: date_type) -> str:
    return DAY_ABBREV[d.weekday()]


def _generate_time_slots(
    start: time_type, end: time_type, slot_minutes: int
) -> list[tuple[time_type, time_type]]:
    """Generate (start, end) tuples from start to end in slot_minutes steps."""
    slots: list[tuple[time_type, time_type]] = []
    cursor = datetime.combine(date_type.today(), start)
    end_dt = datetime.combine(date_type.today(), end)
    step = timedelta(minutes=slot_minutes)
    while cursor + step <= end_dt:
        slots.append((cursor.time(), (cursor + step).time()))
        cursor += step
    return slots


def _resolve_working_hours(
    therapist: Therapist, target_date: date_type, override
) -> tuple[bool, time_type | None, time_type | None, str | None]:
    """Return (is_off, start, end, reason) for a therapist on a given date."""
    if override is not None:
        if override.is_off:
            return True, None, None, override.reason
        if override.custom_start and override.custom_end:
            return False, override.custom_start, override.custom_end, override.reason

    if _day_code(target_date) not in therapist.work_days:
        return True, None, None, None

    return False, therapist.start_time, therapist.end_time, None


def build_therapist_day(
    db: Session, therapist: Therapist, target_date: date_type
) -> TherapistDaySchedule:
    override = exc_repo.get_by_therapist_and_date(db, therapist.id, target_date)
    is_off, start, end, reason = _resolve_working_hours(therapist, target_date, override)

    if is_off or start is None or end is None:
        return TherapistDaySchedule(
            therapist_id=therapist.id,
            therapist_name=therapist.name,
            is_off=True,
            override_reason=reason,
            working_hours=None,
            slot_minutes=therapist.slot_minutes,
            total_slots=0,
            booked_slots=0,
            free_slots=0,
            slots=[],
        )

    slot_pairs = _generate_time_slots(start, end, therapist.slot_minutes)

    booked = appt_repo.list_for_therapist_on_date(db, therapist.id, target_date)
    booked_by_start = {
        a.start_time: a for a in booked if a.status != "Cancelled"
    }

    slots: list[SlotRead] = []
    booked_count = 0
    for slot_start, slot_end in slot_pairs:
        appt = booked_by_start.get(slot_start)
        if appt is not None:
            booked_count += 1
            slots.append(
                SlotRead(
                    start_time=slot_start,
                    end_time=slot_end,
                    is_booked=True,
                    appointment_id=appt.id,
                    patient_id=appt.patient_id,
                    patient_name=appt.patient.name if appt.patient else None,
                    status=appt.status,
                )
            )
        else:
            slots.append(
                SlotRead(
                    start_time=slot_start,
                    end_time=slot_end,
                    is_booked=False,
                )
            )

    return TherapistDaySchedule(
        therapist_id=therapist.id,
        therapist_name=therapist.name,
        is_off=False,
        override_reason=reason,
        working_hours=(start, end),
        slot_minutes=therapist.slot_minutes,
        total_slots=len(slot_pairs),
        booked_slots=booked_count,
        free_slots=len(slot_pairs) - booked_count,
        slots=slots,
    )


def build_day_schedule(
    db: Session,
    target_date: date_type,
    therapist_id: int | None = None,
) -> DaySchedule:
    if therapist_id is not None:
        therapist = therapist_repo.get(db, therapist_id)
        therapists = [therapist] if therapist else []
    else:
        therapists = (
            db.query(Therapist)
            .filter(Therapist.is_active.is_(True))
            .order_by(Therapist.name.asc())
            .all()
        )

    entries = [build_therapist_day(db, t, target_date) for t in therapists]
    return DaySchedule(date=target_date, therapists=entries)


__all__ = ["build_therapist_day", "build_day_schedule"]
