"""Data access for Invoice."""

from datetime import date as date_type

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.invoice import Invoice


def get(db: Session, invoice_id: int) -> Invoice | None:
    return db.get(Invoice, invoice_id)


def get_by_number(db: Session, number: str) -> Invoice | None:
    return db.query(Invoice).filter(Invoice.invoice_number == number).first()


def next_invoice_number(db: Session, year: int) -> str:
    prefix = f"INV-{year}-"
    count = (
        db.query(func.count(Invoice.id))
        .filter(Invoice.invoice_number.like(f"{prefix}%"))
        .scalar()
        or 0
    )
    return f"{prefix}{count + 1:04d}"


def list_paginated(
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
    q = db.query(Invoice)

    if search:
        pattern = f"%{search}%"
        q = q.filter(
            or_(
                Invoice.invoice_number.ilike(pattern),
                Invoice.service.ilike(pattern),
            )
        )
    if status:
        q = q.filter(Invoice.status == status)
    if patient_id is not None:
        q = q.filter(Invoice.patient_id == patient_id)
    if date_from is not None:
        q = q.filter(Invoice.date >= date_from)
    if date_to is not None:
        q = q.filter(Invoice.date <= date_to)

    total = q.with_entities(func.count(Invoice.id)).scalar() or 0
    items = (
        q.order_by(Invoice.date.desc(), Invoice.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return items, total


def create(db: Session, data: dict) -> Invoice:
    inv = Invoice(**data)
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv


def update(db: Session, inv: Invoice, data: dict) -> Invoice:
    for field, value in data.items():
        setattr(inv, field, value)
    db.commit()
    db.refresh(inv)
    return inv


def delete(db: Session, inv: Invoice) -> None:
    db.delete(inv)
    db.commit()


__all__ = [
    "get",
    "get_by_number",
    "next_invoice_number",
    "list_paginated",
    "create",
    "update",
    "delete",
]
