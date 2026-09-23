"""Invoice and payment HTTP endpoints."""

from datetime import date as date_type

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import PaginationParams, get_current_user, get_db
from app.models.user import User
from app.schemas.common import MessageResponse, Page
from app.schemas.invoice import (
    InvoiceCreate,
    InvoiceListItem,
    InvoiceRead,
    InvoiceUpdate,
)
from app.schemas.payment import PaymentCreate, PaymentRead
from app.services import invoice_service as inv_service
from app.services import payment_service as pay_service

router = APIRouter()


@router.get(
    "",
    response_model=Page[InvoiceListItem],
    summary="List invoices (search + filter + pagination)",
)
def list_invoices(
    search: str | None = Query(None, description="Search invoice number or service"),
    status_filter: str | None = Query(None, alias="status"),
    patient_id: int | None = Query(None),
    date_from: date_type | None = Query(None),
    date_to: date_type | None = Query(None),
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
) -> Page[InvoiceListItem]:
    items, total = inv_service.list_invoices(
        db,
        search=search,
        status=status_filter,
        patient_id=patient_id,
        date_from=date_from,
        date_to=date_to,
        offset=pagination.offset,
        limit=pagination.limit,
    )
    pages = (total + pagination.page_size - 1) // pagination.page_size
    return Page[InvoiceListItem](
        items=[InvoiceListItem.model_validate(i) for i in items],
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        pages=pages,
    )


@router.post(
    "",
    response_model=InvoiceRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create an invoice",
)
def create_invoice(
    payload: InvoiceCreate,
    db: Session = Depends(get_db),
) -> InvoiceRead:
    inv = inv_service.create_invoice(db, payload)
    return InvoiceRead.model_validate(inv)


@router.get(
    "/{invoice_id}",
    response_model=InvoiceRead,
    summary="Get one invoice",
)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
) -> InvoiceRead:
    inv = inv_service.get_or_404(db, invoice_id)
    return InvoiceRead.model_validate(inv)


@router.patch(
    "/{invoice_id}",
    response_model=InvoiceRead,
    summary="Update an invoice (partial)",
)
def update_invoice(
    invoice_id: int,
    payload: InvoiceUpdate,
    db: Session = Depends(get_db),
) -> InvoiceRead:
    inv = inv_service.update_invoice(db, invoice_id, payload)
    return InvoiceRead.model_validate(inv)


@router.delete(
    "/{invoice_id}",
    response_model=MessageResponse,
    summary="Delete an invoice (cascades to its payments)",
)
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
) -> MessageResponse:
    inv_service.delete_invoice(db, invoice_id)
    return MessageResponse(message=f"Invoice {invoice_id} deleted.")


@router.get(
    "/{invoice_id}/payments",
    response_model=list[PaymentRead],
    summary="List the payment history for an invoice",
)
def list_payments(
    invoice_id: int,
    db: Session = Depends(get_db),
) -> list[PaymentRead]:
    items = pay_service.list_for_invoice(db, invoice_id)
    return [PaymentRead.model_validate(p) for p in items]


@router.post(
    "/{invoice_id}/payments",
    response_model=PaymentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Record a payment (positive) or refund (negative)",
)
def record_payment(
    invoice_id: int,
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaymentRead:
    payment = pay_service.record_payment(
        db, invoice_id, payload, created_by=current_user.id
    )
    return PaymentRead.model_validate(payment)


@router.delete(
    "/payments/{payment_id}",
    response_model=MessageResponse,
    summary="Delete a payment (recomputes invoice status)",
)
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
) -> MessageResponse:
    pay_service.delete_payment(db, payment_id)
    return MessageResponse(message=f"Payment {payment_id} deleted.")
