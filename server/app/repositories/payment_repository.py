"""Data access for Payment."""

from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.payment import Payment


def get(db: Session, payment_id: int) -> Payment | None:
    return db.get(Payment, payment_id)


def list_for_invoice(db: Session, invoice_id: int) -> list[Payment]:
    return (
        db.query(Payment)
        .filter(Payment.invoice_id == invoice_id)
        .order_by(Payment.created_at.asc(), Payment.id.asc())
        .all()
    )


def sum_for_invoice(db: Session, invoice_id: int) -> Decimal:
    total = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(Payment.invoice_id == invoice_id)
        .scalar()
    )
    return Decimal(str(total or 0))


def has_refund(db: Session, invoice_id: int) -> bool:
    return (
        db.query(Payment.id)
        .filter(Payment.invoice_id == invoice_id, Payment.is_refund.is_(True))
        .first()
        is not None
    )


def create(db: Session, data: dict) -> Payment:
    p = Payment(**data)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


def delete(db: Session, payment: Payment) -> None:
    db.delete(payment)
    db.commit()


__all__ = ["get", "list_for_invoice", "sum_for_invoice", "has_refund", "create", "delete"]
