"""Verify that all schema-level constraints are enforced by the database.

Run with: poetry run python -m scripts.verify_schema
Exits non-zero on any failure.
"""

from __future__ import annotations

import sys
from datetime import date, time
from decimal import Decimal

from sqlalchemy.exc import IntegrityError

# IMPORTANT: import Base first so all models register with SQLAlchemy
from app.db.base import Base  # noqa: F401
from app.db.session import SessionLocal
from app.models.appointment import Appointment
from app.models.clinical_note import ClinicalNote
from app.models.invoice import Invoice
from app.models.patient import Patient
from app.models.payment import Payment
from app.models.therapist import Therapist

PASS = "\033[92mPASS\033[0m"
FAIL = "\033[91mFAIL\033[0m"

results: list[tuple[str, bool, str]] = []


def check(name: str, passed: bool, detail: str = "") -> None:
    results.append((name, passed, detail))
    marker = PASS if passed else FAIL
    print(f"[{marker}] {name}" + (f" — {detail}" if detail else ""))


def cleanup(db) -> None:
    """Delete all rows in dependency order."""
    db.query(Payment).delete()
    db.query(Invoice).delete()
    db.query(ClinicalNote).delete()
    db.query(Appointment).delete()
    db.query(Patient).delete()
    db.query(Therapist).delete()
    db.commit()


def make_therapist(db, name: str = "T-Test") -> Therapist:
    t = Therapist(
        name=name,
        specialty="Test Specialty",
        work_days=["Mon", "Tue", "Wed"],
        start_time=time(9, 0),
        end_time=time(17, 0),
        slot_minutes=30,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


def make_patient(db, therapist_id: int, name: str = "P-Test", age: int = 30) -> Patient:
    p = Patient(
        name=name,
        age=age,
        gender="Male",
        phone="9800000000",
        condition="Test condition",
        therapist_id=therapist_id,
        sessions_total=10,
        sessions_used=0,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


def run() -> int:
    print("=" * 60)
    print("PhysioDesk — Schema Verification")
    print("=" * 60)

    with SessionLocal() as db:
        # Start from a clean slate
        cleanup(db)

        # -------- Test 1: patients.age CHECK --------
        t = make_therapist(db, "T-AgeTest")
        try:
            make_patient(db, t.id, age=999)
            check("CHECK ck_patients_age_range rejects age=999", False, "no error raised")
        except IntegrityError as e:
            db.rollback()
            check(
                "CHECK ck_patients_age_range rejects age=999",
                "ck_patients_age_range" in str(e),
                str(e).splitlines()[0] if str(e) else "",
            )
        cleanup(db)

        # -------- Test 2: patients.sessions_used <= sessions_total --------
        t = make_therapist(db, "T-SessionTest")
        p = make_patient(db, t.id, "P-SessionTest")
        try:
            p.sessions_used = 999  # > sessions_total (10)
            db.commit()
            check("CHECK ck_patients_sessions_used_le_total enforced", False, "no error raised")
        except IntegrityError as e:
            db.rollback()
            check(
                "CHECK ck_patients_sessions_used_le_total enforced",
                "ck_patients_sessions_used_le_total" in str(e),
            )
        cleanup(db)

        # -------- Test 3: appointments double-booking --------
        t = make_therapist(db, "T-BookingTest")
        p = make_patient(db, t.id, "P-BookingTest")
        a1 = Appointment(
            patient_id=p.id, therapist_id=t.id,
            date=date(2026, 5, 20),
            start_time=time(10, 0), end_time=time(10, 30),
        )
        db.add(a1)
        db.commit()
        check("First booking accepted", True)

        try:
            a2 = Appointment(
                patient_id=p.id, therapist_id=t.id,
                date=date(2026, 5, 20),
                start_time=time(10, 0), end_time=time(10, 30),
            )
            db.add(a2)
            db.commit()
            check("UNIQUE uq_appointments_therapist_date_start prevents double-booking", False, "second insert succeeded")
        except IntegrityError as e:
            db.rollback()
            check(
                "UNIQUE uq_appointments_therapist_date_start prevents double-booking",
                "uq_appointments_therapist_date_start" in str(e),
            )
        cleanup(db)

        # -------- Test 4: appointments end_time > start_time --------
        t = make_therapist(db, "T-TimeTest")
        p = make_patient(db, t.id, "P-TimeTest")
        try:
            a = Appointment(
                patient_id=p.id, therapist_id=t.id,
                date=date(2026, 5, 21),
                start_time=time(11, 0), end_time=time(10, 0),  # bad
            )
            db.add(a)
            db.commit()
            check("CHECK ck_appointments_end_after_start enforced", False, "no error raised")
        except IntegrityError as e:
            db.rollback()
            check(
                "CHECK ck_appointments_end_after_start enforced",
                "ck_appointments_end_after_start" in str(e),
            )
        cleanup(db)

        # -------- Test 5: therapist RESTRICT when patients exist --------
        t = make_therapist(db, "T-RestrictTest")
        make_patient(db, t.id, "P-RestrictTest")
        try:
            db.delete(t)
            db.commit()
            check("FK RESTRICT blocks therapist delete with patients", False, "delete succeeded")
        except IntegrityError as e:
            db.rollback()
            check(
                "FK RESTRICT blocks therapist delete with patients",
                "patients" in str(e).lower(),
            )
        cleanup(db)

        # -------- Test 6: clinical_notes.pain_score range --------
        t = make_therapist(db, "T-PainTest")
        p = make_patient(db, t.id, "P-PainTest")
        try:
            n = ClinicalNote(
                patient_id=p.id, therapist_id=t.id,
                pain_score=15,  # > 10
            )
            db.add(n)
            db.commit()
            check("CHECK ck_clinical_notes_pain_score_range enforced", False, "no error raised")
        except IntegrityError as e:
            db.rollback()
            check(
                "CHECK ck_clinical_notes_pain_score_range enforced",
                "ck_clinical_notes_pain_score_range" in str(e),
            )

        # -------- Test 7: clinical_notes.rom_score range --------
        try:
            n = ClinicalNote(
                patient_id=p.id, therapist_id=t.id,
                rom_score=-5,  # < 0
            )
            db.add(n)
            db.commit()
            check("CHECK ck_clinical_notes_rom_score_range enforced", False, "no error raised")
        except IntegrityError as e:
            db.rollback()
            check(
                "CHECK ck_clinical_notes_rom_score_range enforced",
                "ck_clinical_notes_rom_score_range" in str(e),
            )

        # -------- Test 8: clinical_notes.strength_score range --------
        try:
            n = ClinicalNote(
                patient_id=p.id, therapist_id=t.id,
                strength_score=9,  # > 5
            )
            db.add(n)
            db.commit()
            check("CHECK ck_clinical_notes_strength_score_range enforced", False, "no error raised")
        except IntegrityError as e:
            db.rollback()
            check(
                "CHECK ck_clinical_notes_strength_score_range enforced",
                "ck_clinical_notes_strength_score_range" in str(e),
            )

        # -------- Test 9: valid clinical note is accepted --------
        try:
            n = ClinicalNote(
                patient_id=p.id, therapist_id=t.id,
                pain_score=5, rom_score=75, strength_score=4,
                chief_complaint="Test complaint",
            )
            db.add(n)
            db.commit()
            check("Valid clinical note accepted", True)
        except IntegrityError as e:
            db.rollback()
            check("Valid clinical note accepted", False, str(e))

        # -------- Test 10: invoice discount <= amount --------
        try:
            inv = Invoice(
                invoice_number="INV-TEST-0001",
                patient_id=p.id,
                service="Session",
                amount=Decimal("1000.00"),
                discount=Decimal("2000.00"),  # > amount
            )
            db.add(inv)
            db.commit()
            check("CHECK ck_invoices_discount_le_amount enforced", False, "no error raised")
        except IntegrityError as e:
            db.rollback()
            check(
                "CHECK ck_invoices_discount_le_amount enforced",
                "ck_invoices_discount_le_amount" in str(e),
            )

        # -------- Test 11: invoice discount >= 0 --------
        try:
            inv = Invoice(
                invoice_number="INV-TEST-0002",
                patient_id=p.id,
                service="Session",
                amount=Decimal("1000.00"),
                discount=Decimal("-50.00"),  # < 0
            )
            db.add(inv)
            db.commit()
            check("CHECK ck_invoices_discount_nonneg enforced", False, "no error raised")
        except IntegrityError as e:
            db.rollback()
            check(
                "CHECK ck_invoices_discount_nonneg enforced",
                "ck_invoices_discount_nonneg" in str(e),
            )

        # -------- Test 12: valid invoice accepted --------
        inv = None
        try:
            inv = Invoice(
                invoice_number="INV-TEST-0003",
                patient_id=p.id,
                service="Session",
                amount=Decimal("1000.00"),
                discount=Decimal("100.00"),
            )
            db.add(inv)
            db.commit()
            db.refresh(inv)
            check("Valid invoice accepted", True)
        except IntegrityError as e:
            db.rollback()
            check("Valid invoice accepted", False, str(e))

        # -------- Test 13: payment amount != 0 --------
        if inv is not None:
            try:
                pay = Payment(
                    invoice_id=inv.id,
                    amount=Decimal("0.00"),
                    method="Cash",
                )
                db.add(pay)
                db.commit()
                check("CHECK ck_payments_amount_nonzero enforced", False, "no error raised")
            except IntegrityError as e:
                db.rollback()
                check(
                    "CHECK ck_payments_amount_nonzero enforced",
                    "ck_payments_amount_nonzero" in str(e),
                )

            # -------- Test 14: payment is_refund sign consistency --------
            try:
                pay = Payment(
                    invoice_id=inv.id,
                    amount=Decimal("500.00"),  # positive
                    method="Cash",
                    is_refund=True,            # but flagged as refund
                )
                db.add(pay)
                db.commit()
                check("CHECK ck_payments_refund_sign_consistency enforced", False, "no error raised")
            except IntegrityError as e:
                db.rollback()
                check(
                    "CHECK ck_payments_refund_sign_consistency enforced",
                    "ck_payments_refund_sign_consistency" in str(e),
                )

            # -------- Test 15: valid payment accepted --------
            try:
                pay = Payment(
                    invoice_id=inv.id,
                    amount=Decimal("500.00"),
                    method="Cash",
                    is_refund=False,
                )
                db.add(pay)
                db.commit()
                check("Valid payment accepted", True)
            except IntegrityError as e:
                db.rollback()
                check("Valid payment accepted", False, str(e))

        # -------- Test 16: valid refund accepted --------
        if inv is not None:
            try:
                refund = Payment(
                    invoice_id=inv.id,
                    amount=Decimal("-200.00"),  # negative
                    method="Cash",
                    is_refund=True,
                )
                db.add(refund)
                db.commit()
                check("Valid refund accepted", True)
            except IntegrityError as e:
                db.rollback()
                check("Valid refund accepted", False, str(e))

        # -------- Cleanup --------
        cleanup(db)
        print()
        print("Cleanup done. Database is empty.")

    # -------- Summary --------
    passed = sum(1 for _, ok, _ in results if ok)
    total = len(results)
    print()
    print("=" * 60)
    print(f"Results: {passed}/{total} passed")
    print("=" * 60)

    if passed != total:
        for name, ok, detail in results:
            if not ok:
                print(f"  FAILED: {name}" + (f" — {detail}" if detail else ""))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(run())
