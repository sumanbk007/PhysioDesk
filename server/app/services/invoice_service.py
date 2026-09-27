from datetime import date as date_type
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.constants import InvoiceStatus
from app.core.exceptions import NotFoundError, ValidationError
from app.models.invoice import Invoice
from app.repositories import invoice_repository as repo
from app.repositories import patient_repository as patient_repo
from app.repositories import payment_repository as pay_repo
from app.schemas.invoice import InvoiceCreate, InvoiceLineItem, InvoiceUpdate


def get_or_404(db: Session, invoice_id: int) -> Invoice:
    inv = repo.get(db, invoice_id)
    if inv is None:
        raise NotFoundError(f"Invoice {invoice_id} not found.")
    return inv


def list_invoices(
    db: Session,
    *,
    search: str | None = None,
    status: str | None = None,
    patient_id: int | None = None,
    date_from: date_type | None = None,
    date_to: date_type | None = None,
    offset: int = 0,
    limit: int = 20,
) -> tuple[list[Invoice], int]:
    return repo.list_paginated(
        db,
        search=search,
        status=status,
        patient_id=patient_id,
        date_from=date_from,
        date_to=date_to,
        offset=offset,
        limit=limit,
    )


def recompute_status(db: Session, invoice: Invoice) -> Invoice:
    paid = pay_repo.sum_for_invoice(db, invoice.id)
    has_refund = pay_repo.has_refund(db, invoice.id)
    net_due = invoice.amount - invoice.discount
    balance = net_due - paid

    if has_refund and paid <= 0:
        status = InvoiceStatus.REFUNDED.value
    elif balance <= 0:
        status = InvoiceStatus.PAID.value
    elif paid > 0:
        status = InvoiceStatus.PARTIAL.value
    else:
        status = InvoiceStatus.DUE.value

    if invoice.paid_amount != paid or invoice.status != status:
        invoice.paid_amount = paid
        invoice.status = status
        db.commit()
        db.refresh(invoice)
    return invoice


def _serialize_items(items: list[InvoiceLineItem]) -> tuple[list[dict], Decimal]:
    serialized: list[dict] = []
    total = Decimal("0.00")
    for it in items:
        amt = Decimal(str(it.amount))
        total += amt
        serialized.append({
            "title": it.title,
            "amount": str(amt),
            "date": it.date.isoformat() if it.date else None,
        })
    return serialized, total


def create_invoice(db: Session, payload: InvoiceCreate) -> Invoice:
    if patient_repo.get(db, payload.patient_id) is None:
        raise ValidationError(f"Patient {payload.patient_id} does not exist.")

    data = payload.model_dump()
    if data.get("date") is None:
        data["date"] = date_type.today()

    items = data.get("line_items") or []
    if items:
        serialized, total = _serialize_items(payload.line_items)
        data["line_items"] = serialized
        data["amount"] = total

    if data["discount"] > data["amount"]:
        raise ValidationError("discount cannot exceed amount")

    data["invoice_number"] = repo.next_invoice_number(db, data["date"].year)
    data["paid_amount"] = Decimal("0.00")
    data["status"] = InvoiceStatus.DUE.value

    return repo.create(db, data)


def update_invoice(
    db: Session, invoice_id: int, payload: InvoiceUpdate
) -> Invoice:
    inv = get_or_404(db, invoice_id)
    updates = payload.model_dump(exclude_unset=True)

    new_amount = updates.get("amount", inv.amount)
    new_discount = updates.get("discount", inv.discount)
    if new_discount > new_amount:
        raise ValidationError("discount cannot exceed amount")

    paid = pay_repo.sum_for_invoice(db, inv.id)
    new_net_due = new_amount - new_discount
    if paid > new_net_due:
        raise ValidationError(
            "Cannot reduce amount/discount below already-paid total."
        )

    inv = repo.update(db, inv, updates)
    return recompute_status(db, inv)


def delete_invoice(db: Session, invoice_id: int) -> None:
    inv = get_or_404(db, invoice_id)
    repo.delete(db, inv)


def add_line_item(
    db: Session, invoice_id: int, item: InvoiceLineItem
) -> Invoice:
    inv = get_or_404(db, invoice_id)

    items = list(inv.line_items or [])
    items.append({
        "title": item.title,
        "amount": str(item.amount),
        "date": item.date.isoformat() if item.date else None,
    })

    new_amount = sum(Decimal(str(li["amount"])) for li in items)

    inv = repo.update(db, inv, {"line_items": items, "amount": new_amount})
    return recompute_status(db, inv)


def remove_line_item(db: Session, invoice_id: int, index: int) -> Invoice:
    inv = get_or_404(db, invoice_id)

    items = list(inv.line_items or [])
    if index < 0 or index >= len(items):
        raise ValidationError(f"Line item index {index} out of range.")

    items.pop(index)
    new_amount = sum(Decimal(str(li["amount"])) for li in items)

    paid = pay_repo.sum_for_invoice(db, inv.id)
    if paid > new_amount:
        raise ValidationError(
            "Cannot remove - remaining amount would be below what's already paid."
        )

    inv = repo.update(db, inv, {"line_items": items, "amount": new_amount})
    return recompute_status(db, inv)


__all__ = [
    "get_or_404",
    "list_invoices",
    "recompute_status",
    "create_invoice",
    "update_invoice",
    "delete_invoice",
    "add_line_item",
    "remove_line_item",
]
