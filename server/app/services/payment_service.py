"""Business logic for Payment: record payments and refunds."""

from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationError
from app.models.payment import Payment
from app.repositories import invoice_repository as inv_repo
from app.repositories import payment_repository as repo
from app.schemas.payment import PaymentCreate
from app.services import invoice_service


def list_for_invoice(db: Session, invoice_id: int) -> list[Payment]:
    if inv_repo.get(db, invoice_id) is None:
        raise NotFoundError(f"Invoice {invoice_id} not found.")
    return repo.list_for_invoice(db, invoice_id)


def record_payment(
    db: Session,
    invoice_id: int,
    payload: PaymentCreate,
    *,
    created_by: int | None = None,
) -> Payment:
    invoice = inv_repo.get(db, invoice_id)
    if invoice is None:
        raise NotFoundError(f"Invoice {invoice_id} not found.")

    amount = Decimal(str(payload.amount))
    is_refund = amount < 0
    net_due = invoice.amount - invoice.discount
    current_paid = repo.sum_for_invoice(db, invoice.id)
    balance = net_due - current_paid

    if is_refund:
        refund_amount = -amount
        if refund_amount > current_paid:
            raise ValidationError(
                f"Refund ({refund_amount}) cannot exceed amount paid ({current_paid})."
            )
    else:
        if amount > balance:
            raise ValidationError(
                f"Payment ({amount}) cannot exceed balance due ({balance})."
            )

    data = payload.model_dump()
    data["invoice_id"] = invoice.id
    data["is_refund"] = is_refund
    data["created_by"] = created_by

    payment = repo.create(db, data)
    invoice_service.recompute_status(db, invoice)
    return payment


def delete_payment(db: Session, payment_id: int) -> None:
    payment = repo.get(db, payment_id)
    if payment is None:
        raise NotFoundError(f"Payment {payment_id} not found.")
    invoice_id = payment.invoice_id
    repo.delete(db, payment)

    invoice = inv_repo.get(db, invoice_id)
    if invoice is not None:
        invoice_service.recompute_status(db, invoice)


__all__ = ["list_for_invoice", "record_payment", "delete_payment"]
