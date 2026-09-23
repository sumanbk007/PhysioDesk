"""Pydantic schemas for the billing dashboard."""

from decimal import Decimal

from pydantic import BaseModel


class BillingDashboard(BaseModel):
    today_revenue: Decimal
    pending_payments: Decimal
    total_patients: int
    today_appointments: int


__all__ = ["BillingDashboard"]
