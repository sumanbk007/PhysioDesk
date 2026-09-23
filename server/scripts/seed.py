"""Seed PhysioDesk with realistic demo data covering every table.

Run:      poetry run python -m scripts.seed
Reset:    poetry run python -m scripts.reset && poetry run python -m scripts.seed
Idempotent — rerunning skips rows that already exist.
"""

from __future__ import annotations

import logging
from datetime import date as date_type
from datetime import datetime, time, timedelta, timezone
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.base import Base  # noqa: F401
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.appointment import Appointment
from app.models.clinical_note import ClinicalNote
from app.models.invoice import Invoice
from app.models.notification import Notification
from app.models.patient import Patient
from app.models.payment import Payment
from app.models.schedule_exception import ScheduleException
from app.models.therapist import Therapist
from app.models.user import User
from app.repositories.invoice_repository import next_invoice_number
from app.services import invoice_service

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("seed")

DAY_ABBREV = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
TODAY = date_type.today()


# ---------------------------------------------------------------- users

def seed_user(db: Session) -> User:
    existing = db.query(User).filter(User.username == "frontdesk").first()
    if existing:
        log.info("User 'frontdesk' already exists")
        return existing
    user = User(
        username="frontdesk",
        hashed_password=hash_password("frontdesk123"),
        full_name="Sunita (Front Desk)",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    log.info("Created user 'frontdesk'")
    return user


# ------------------------------------------------------------ therapists

THERAPISTS = [
    {
        "name": "Dr. Ramesh Sharma",
        "specialty": "Orthopedic Physiotherapy",
        "phone": "9841000001",
        "email": "ramesh.sharma@physiodesk.test",
        "qualifications": "MPT Ortho, BPT",
        "experience_years": 8,
        "bio": "Post-operative knee and shoulder rehabilitation.",
        "work_days": ["Sun", "Mon", "Tue", "Wed", "Thu"],
        "start_time": time(9, 0),
        "end_time": time(17, 0),
        "slot_minutes": 30,
    },
    {
        "name": "Dr. Sita Gurung",
        "specialty": "Sports Physiotherapy",
        "phone": "9841000002",
        "email": "sita.gurung@physiodesk.test",
        "qualifications": "MPT Sports, BPT",
        "experience_years": 6,
        "bio": "Sports injury prevention and return-to-play programs.",
        "work_days": ["Sun", "Mon", "Tue", "Wed", "Thu"],
        "start_time": time(10, 0),
        "end_time": time(18, 0),
        "slot_minutes": 30,
    },
    {
        "name": "Dr. Bikash Thapa",
        "specialty": "Neurological Physiotherapy",
        "phone": "9841000003",
        "email": "bikash.thapa@physiodesk.test",
        "qualifications": "MPT Neuro, BPT",
        "experience_years": 10,
        "bio": "Stroke and neuro-rehabilitation.",
        "work_days": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
        "start_time": time(8, 30),
        "end_time": time(16, 30),
        "slot_minutes": 45,
    },
]


def seed_therapists(db: Session) -> list[Therapist]:
    out: list[Therapist] = []
    for data in THERAPISTS:
        existing = (
            db.query(Therapist).filter(Therapist.email == data["email"]).first()
        )
        if existing:
            out.append(existing)
            continue
        t = Therapist(**data)
        db.add(t)
        db.commit()
        db.refresh(t)
        out.append(t)
    log.info("Therapists: %d", len(out))
    return out


# ---------------------------------------------------------------- patients

PATIENTS = [
    {
        "name": "Sunita Tamang",
        "age": 42,
        "gender": "Female",
        "phone": "9841111001",
        "address": "Baneshwor, Kathmandu",
        "condition": "Lower back pain (L4-L5 disc bulge)",
        "package": "10 sessions - Orthopedic Rehab",
        "sessions_total": 10,
        "status": "Active",
    },
    {
        "name": "Hari Bahadur Shrestha",
        "age": 55,
        "gender": "Male",
        "phone": "9841111002",
        "address": "Patan, Lalitpur",
        "condition": "Frozen shoulder (right)",
        "package": "8 sessions - Shoulder Rehab",
        "sessions_total": 8,
        "status": "Active",
    },
    {
        "name": "Kamala Devi Rai",
        "age": 38,
        "gender": "Female",
        "phone": "9841111003",
        "address": "Koteshwor, Kathmandu",
        "condition": "Post-ACL reconstruction rehab",
        "package": "12 sessions - Sports Rehab",
        "sessions_total": 12,
        "status": "Active",
    },
    {
        "name": "Bikash Adhikari",
        "age": 47,
        "gender": "Male",
        "phone": "9841111004",
        "address": "Bhaktapur",
        "condition": "Cervical radiculopathy",
        "package": "6 sessions - Orthopedic Rehab",
        "sessions_total": 6,
        "status": "Due for follow-up",
    },
    {
        "name": "Gita Kumari Yadav",
        "age": 61,
        "gender": "Female",
        "phone": "9841111005",
        "address": "Lazimpat, Kathmandu",
        "condition": "Post-stroke hemiplegia (left)",
        "package": "15 sessions - Neuro Rehab",
        "sessions_total": 15,
        "status": "Active",
    },
    {
        "name": "Ramesh Karki",
        "age": 34,
        "gender": "Male",
        "phone": "9841111006",
        "address": "Kalanki, Kathmandu",
        "condition": "Ankle sprain - grade 2",
        "package": "5 sessions - Sports Rehab",
        "sessions_total": 5,
        "status": "Active",
    },
    {
        "name": "Sabina Maharjan",
        "age": 28,
        "gender": "Female",
        "phone": "9841111007",
        "address": "Patan Dhoka, Lalitpur",
        "condition": "Carpal tunnel syndrome",
        "package": "6 sessions - Orthopedic Rehab",
        "sessions_total": 6,
        "status": "Completed",
    },
]


def seed_patients(db: Session, therapists: list[Therapist]) -> list[Patient]:
    out: list[Patient] = []
    for i, data in enumerate(PATIENTS):
        existing = db.query(Patient).filter(Patient.phone == data["phone"]).first()
        if existing:
            out.append(existing)
            continue
        therapist = therapists[i % len(therapists)]
        p = Patient(**data, therapist_id=therapist.id)
        db.add(p)
        db.commit()
        db.refresh(p)
        out.append(p)
    log.info("Patients: %d", len(out))
    return out


# ---------------------------------------------------------------- schedule exceptions

def seed_schedule_exceptions(db: Session, therapists: list[Therapist]) -> None:
    existing = db.query(ScheduleException).count()
    if existing:
        log.info("Schedule exceptions already present")
        return

    items = [
        (therapists[0].id, TODAY + timedelta(days=3), True, None, None, "Public holiday"),
        (therapists[0].id, TODAY + timedelta(days=5), False, time(10, 0), time(13, 0), "Half day"),
        (therapists[1].id, TODAY + timedelta(days=4), True, None, None, "Conference"),
    ]
    for therapist_id, d, is_off, start, end, reason in items:
        db.add(
            ScheduleException(
                therapist_id=therapist_id,
                date=d,
                is_off=is_off,
                custom_start=start,
                custom_end=end,
                reason=reason,
            )
        )
    db.commit()
    log.info("Schedule exceptions: %d", len(items))


# ---------------------------------------------------------------- appointments

def _next_working_date(therapist: Therapist, offset: int = 0) -> date_type:
    d = TODAY + timedelta(days=offset)
    for _ in range(21):
        if DAY_ABBREV[d.weekday()] in therapist.work_days:
            return d
        d += timedelta(days=1)
    return d


def _prev_working_date(therapist: Therapist, offset: int = 0) -> date_type:
    d = TODAY - timedelta(days=offset)
    for _ in range(21):
        if DAY_ABBREV[d.weekday()] in therapist.work_days:
            return d
        d -= timedelta(days=1)
    return d


APPOINTMENT_PLAN = [
    # (patient_idx, therapist_idx, when, start_hour, start_min, status, method)
    (0, 0, "past",     9, 0,  "Completed", "Cash"),
    (0, 0, "past",     10, 0, "Completed", "Cash"),
    (1, 1, "past",     11, 0, "Completed", "eSewa"),
    (2, 1, "past",     14, 0, "Completed", "Khalti"),
    (3, 2, "past",     9, 30, "No-show",   None),
    (4, 2, "past",     10, 30, "Completed", "Cash"),
    (5, 1, "today",    15, 0, "Booked",    "eSewa"),
    (6, 0, "today",    16, 0, "Booked",    "Cash"),
    (0, 0, "future",   9, 0,  "Booked",    "Cash"),
    (1, 1, "future",   11, 0, "Booked",    "eSewa"),
    (2, 1, "future",   14, 30, "Booked",   "Cash"),
    (3, 2, "future",   9, 0,  "Booked",    "Cash"),
    (4, 2, "future",   10, 30, "Cancelled", None),
]


def seed_appointments(
    db: Session, patients: list[Patient], therapists: list[Therapist]
) -> list[Appointment]:
    existing = db.query(Appointment).count()
    if existing:
        log.info("Appointments already present: %d", existing)
        return db.query(Appointment).all()

    created: list[Appointment] = []
    seen_slots: set[tuple] = set()

    for idx, (p_idx, t_idx, when, h, m, status, method) in enumerate(APPOINTMENT_PLAN):
        patient = patients[p_idx % len(patients)]
        therapist = therapists[t_idx % len(therapists)]

        if when == "past":
            d = _prev_working_date(therapist, offset=idx % 14 + 1)
        elif when == "today":
            d = TODAY
        else:
            d = _next_working_date(therapist, offset=idx % 10 + 1)

        start = time(h, m)
        key = (therapist.id, d, start)
        if key in seen_slots:
            continue
        seen_slots.add(key)

        end = (
            datetime.combine(d, start) + timedelta(minutes=therapist.slot_minutes)
        ).time()

        appt = Appointment(
            patient_id=patient.id,
            therapist_id=therapist.id,
            date=d,
            start_time=start,
            end_time=end,
            status=status,
            payment_method=method,
            payment_details=(
                {"txn_id": f"TXN-{3000 + idx}"} if method in ("eSewa", "Khalti") else None
            ),
            notes="Demo appointment" if idx % 3 == 0 else None,
        )
        db.add(appt)
        db.commit()
        db.refresh(appt)
        created.append(appt)

    log.info("Appointments: %d", len(created))
    return created


# ---------------------------------------------------------------- clinical notes

NOTE_TEMPLATES = [
    {
        "chief_complaint": "Lower back pain radiating to left leg",
        "pain_location": "Lumbar spine",
        "pain_score": 7,
        "diagnosis": "L4-L5 disc bulge",
        "assessment": "Positive SLR on left at 40 degrees",
        "rom": "Flexion 60, extension 15",
        "rom_score": 45,
        "strength": "Hip flexors 4/5, extensors 3+/5",
        "strength_score": 4,
        "special_tests": "SLR positive left",
        "treatment": "IFT, lumbar traction, core stability",
        "exercises": "Pelvic tilt, bird-dog",
        "patient_response": "Tolerated well",
        "hep": "Core exercises 2x/day",
        "plan": "Continue traction",
        "therapist_notes": "Progressing steadily.",
    },
    {
        "chief_complaint": "Shoulder pain on lifting arm",
        "pain_location": "Right shoulder",
        "pain_score": 5,
        "diagnosis": "Adhesive capsulitis stage 2",
        "assessment": "Abduction limited to 90 degrees",
        "rom": "Abduction 90, flexion 100",
        "rom_score": 55,
        "strength": "Deltoid 4/5",
        "strength_score": 4,
        "special_tests": "Neer's positive",
        "treatment": "Mobilisation, ultrasound",
        "exercises": "Pendulum, wall slides",
        "patient_response": "Mild soreness",
        "hep": "Pendulum 3x/day",
        "plan": "Progress mobility",
    },
    {
        "chief_complaint": "Knee stiffness after ACL surgery",
        "pain_location": "Right knee",
        "pain_score": 4,
        "diagnosis": "Post-ACL reconstruction week 4",
        "assessment": "Knee flexion 100 degrees",
        "rom": "Flexion 100, extension -5",
        "rom_score": 60,
        "strength": "Quadriceps 3/5",
        "strength_score": 3,
        "special_tests": "Lachman negative",
        "treatment": "Quad sets, patellar mobilisation",
        "exercises": "SLR, heel slides",
        "patient_response": "Good",
        "hep": "Quad sets 3x/day",
        "plan": "Add closed-chain exercises",
        "milestone": "Full extension achieved",
    },
    {
        "chief_complaint": "Neck pain with right arm tingling",
        "pain_location": "Cervical spine",
        "pain_score": 6,
        "diagnosis": "C6 radiculopathy",
        "assessment": "Reduced reflexes on right",
        "rom": "Rotation 50 each side",
        "rom_score": 65,
        "strength": "Biceps 4/5",
        "strength_score": 4,
        "special_tests": "Spurling positive",
        "treatment": "Cervical traction, IFT",
        "exercises": "Chin tucks, scapular retraction",
        "patient_response": "Some relief",
        "hep": "Chin tucks hourly",
        "plan": "Continue traction",
    },
    {
        "chief_complaint": "Weakness on left side after stroke",
        "pain_location": None,
        "pain_score": None,
        "diagnosis": "Left hemiplegia, MCA infarct",
        "assessment": "Left grip weak, gait impaired",
        "rom": "Full passive ROM",
        "rom_score": 90,
        "strength": "Left grip 2/5",
        "strength_score": 2,
        "special_tests": "Berg Balance 30/56",
        "treatment": "Gait training, task-specific practice",
        "exercises": "Sit-to-stand, reaching",
        "patient_response": "Motivated",
        "hep": "Home exercises 2x/day",
        "plan": "Progress to walking aids",
        "milestone": "First independent sit-to-stand",
    },
]


def seed_notes(
    db: Session,
    patients: list[Patient],
    therapists: list[Therapist],
    appointments: list[Appointment],
) -> None:
    existing = db.query(ClinicalNote).count()
    if existing:
        log.info("Clinical notes already present: %d", existing)
        return

    created = 0
    for i, patient in enumerate(patients):
        # Give each patient 2 notes if we have templates
        for offset in range(2):
            template = NOTE_TEMPLATES[(i + offset) % len(NOTE_TEMPLATES)]
            data = dict(template)
            # adjust pain trend downward across notes
            if data["pain_score"] is not None:
                data["pain_score"] = max(0, data["pain_score"] - offset)
            if data["rom_score"] is not None:
                data["rom_score"] = min(100, data["rom_score"] + offset * 5)
            if data["strength_score"] is not None:
                data["strength_score"] = min(5, data["strength_score"] + offset)

            therapist = therapists[(i + offset) % len(therapists)]
            appt = next(
                (a for a in appointments if a.patient_id == patient.id),
                None,
            )
            db.add(
                ClinicalNote(
                    patient_id=patient.id,
                    therapist_id=therapist.id,
                    appointment_id=appt.id if appt and offset == 0 else None,
                    **data,
                )
            )
            created += 1
    db.commit()

    # Recompute sessions_used for every patient
    for p in patients:
        count = (
            db.query(func.count(ClinicalNote.id))
            .filter(ClinicalNote.patient_id == p.id)
            .scalar()
            or 0
        )
        p.sessions_used = count
    db.commit()
    log.info("Clinical notes: %d", created)


# ---------------------------------------------------------------- invoices + payments

INVOICE_PLAN = [
    # (patient_idx, service, amount, discount, payment_amount, method, is_refund)
    (0, "10 sessions - Orthopedic Rehab", "10000.00", "0.00",  "10000.00", "Cash",   False),
    (1, "8 sessions - Shoulder Rehab",    "8000.00",  "500.00","3750.00",  "eSewa",  False),
    (2, "12 sessions - Sports Rehab",     "12000.00", "0.00",  "0.00",     None,     False),
    (3, "6 sessions - Orthopedic Rehab",  "6000.00",  "0.00",  "3000.00",  "Khalti", False),
    (4, "15 sessions - Neuro Rehab",      "15000.00", "1000.00","14000.00","Cash",  False),
    (5, "5 sessions - Sports Rehab",      "5000.00",  "0.00",  "5000.00",  "eSewa",  False),
    (6, "6 sessions - Orthopedic Rehab",  "6000.00",  "0.00",  "6000.00",  "Cash",   False),
]


def seed_invoices(db: Session, patients: list[Patient]) -> list[Invoice]:
    existing = db.query(Invoice).count()
    if existing:
        log.info("Invoices already present: %d", existing)
        return db.query(Invoice).all()

    created: list[Invoice] = []
    for p_idx, service, amount, discount, paid, method, is_refund in INVOICE_PLAN:
        patient = patients[p_idx % len(patients)]
        inv = Invoice(
            invoice_number=next_invoice_number(db, TODAY.year),
            patient_id=patient.id,
            service=service,
            amount=Decimal(amount),
            discount=Decimal(discount),
            paid_amount=Decimal("0.00"),
            status="Due",
            date=TODAY,
        )
        db.add(inv)
        db.commit()
        db.refresh(inv)
        created.append(inv)
    log.info("Invoices: %d", len(created))
    return created


def seed_payments(db: Session, invoices: list[Invoice]) -> None:
    existing = db.query(Payment).count()
    if existing:
        log.info("Payments already present: %d", existing)
        return

    created = 0
    for idx, inv in enumerate(invoices):
        _, _, _, _, paid_str, method, is_refund = INVOICE_PLAN[idx % len(INVOICE_PLAN)]
        if not method or Decimal(paid_str) == 0:
            continue

        p = Payment(
            invoice_id=inv.id,
            amount=Decimal(paid_str),
            method=method,
            method_details=(
                {"txn_id": f"TXN-{5000 + idx}"} if method in ("eSewa", "Khalti") else None
            ),
            is_refund=is_refund,
        )
        db.add(p)
        db.commit()
        db.refresh(p)
        invoice_service.recompute_status(db, inv)
        created += 1

    log.info("Payments: %d", created)


# ---------------------------------------------------------------- notifications

def seed_notifications(db: Session, patients: list[Patient]) -> None:
    existing = db.query(Notification).count()
    if existing:
        log.info("Notifications already present: %d", existing)
        return

    now = datetime.now(timezone.utc)
    items = [
        {
            "patient_id": patients[0].id,
            "type": "Appointment reminder",
            "channel": "SMS",
            "scheduled_for": now + timedelta(days=1),
            "message": "Reminder: your physio appointment is tomorrow at 10:00 AM.",
            "status": "Scheduled",
        },
        {
            "patient_id": patients[1].id,
            "type": "Payment reminder",
            "channel": "WhatsApp",
            "scheduled_for": now + timedelta(days=2),
            "message": "Namaste, your invoice balance is due. Kindly settle at your next visit.",
            "status": "Scheduled",
        },
        {
            "patient_id": patients[2].id,
            "type": "Follow-up reminder",
            "channel": "Viber",
            "scheduled_for": now + timedelta(days=7),
            "message": "Time for your follow-up physiotherapy session.",
            "status": "Scheduled",
        },
        {
            "patient_id": patients[3].id,
            "type": "Package nearing completion",
            "channel": "SMS",
            "scheduled_for": now + timedelta(days=3),
            "message": "Your session package is almost complete. Book your next block soon.",
            "status": "Scheduled",
        },
        {
            "patient_id": patients[4].id,
            "type": "Appointment confirmation",
            "channel": "Email",
            "scheduled_for": now - timedelta(hours=2),
            "message": "Your appointment on Monday is confirmed.",
            "status": "Sent",
            "sent_at": now - timedelta(hours=2),
        },
        {
            "patient_id": patients[5].id,
            "type": "Cancellation",
            "channel": "SMS",
            "scheduled_for": now - timedelta(days=1),
            "message": "Your appointment was cancelled. Please call to reschedule.",
            "status": "Cancelled",
        },
    ]
    for item in items:
        db.add(Notification(**item))
    db.commit()
    log.info("Notifications: %d", len(items))


# ---------------------------------------------------------------- main

def main() -> None:
    log.info("Seeding PhysioDesk demo data...")
    with SessionLocal() as db:
        seed_user(db)
        therapists = seed_therapists(db)
        patients = seed_patients(db, therapists)
        seed_schedule_exceptions(db, therapists)
        appointments = seed_appointments(db, patients, therapists)
        seed_notes(db, patients, therapists, appointments)
        invoices = seed_invoices(db, patients)
        seed_payments(db, invoices)
        seed_notifications(db, patients)

        log.info("--- Summary ---")
        log.info("Users:               %d", db.query(User).count())
        log.info("Therapists:          %d", db.query(Therapist).count())
        log.info("Schedule exceptions: %d", db.query(ScheduleException).count())
        log.info("Patients:            %d", db.query(Patient).count())
        log.info("Appointments:        %d", db.query(Appointment).count())
        log.info("Clinical notes:      %d", db.query(ClinicalNote).count())
        log.info("Invoices:            %d", db.query(Invoice).count())
        log.info("Payments:            %d", db.query(Payment).count())
        log.info("Notifications:       %d", db.query(Notification).count())
    log.info("Done.")


if __name__ == "__main__":
    main()
