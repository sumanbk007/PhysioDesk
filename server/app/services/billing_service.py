"""Aggregated billing queries for the dashboard."""

from datetime import date as date_type
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.appointment import Appointment
from app.models.invoice import Invoice
from app.models.patient import Patient
from app.models.payment import Payment
from app.schemas.billing import BillingDashboard


def build_dashboard(db: Session, today: date_type | None = None) -> BillingDashboard:
    today = today or date_type.today()

    today_revenue = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(
            func.date(Payment.created_at) == today,
            Payment.amount > 0,
        )
        .scalar()
    )

    pending = (
        db.query(
            func.coalesce(
                func.sum(Invoice.amount - Invoice.discount - Invoice.paid_amount), 0
            )
        )
        .filter(Invoice.status.in_(["Due", "Partial"]))
        .scalar()
    )

    total_patients = db.query(func.count(Patient.id)).scalar() or 0

    today_appts = (
        db.query(func.count(Appointment.id))
        .filter(Appointment.date == today)
        .scalar()
        or 0
    )

    return BillingDashboard(
        today_revenue=Decimal(str(today_revenue or 0)),
        pending_payments=Decimal(str(pending or 0)),
        total_patients=int(total_patients),
        today_appointments=int(today_appts),
    )


__all__ = ["build_dashboard"]
