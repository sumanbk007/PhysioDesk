"""Business logic for Notification."""

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.constants import NotificationStatus
from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.notification import Notification
from app.notifications import sender
from app.repositories import appointment_repository as appt_repo
from app.repositories import invoice_repository as inv_repo
from app.repositories import notification_repository as repo
from app.repositories import patient_repository as patient_repo
from app.schemas.notification import NotificationCreate, NotificationUpdate


def get_or_404(db: Session, notification_id: int) -> Notification:
    n = repo.get(db, notification_id)
    if n is None:
        raise NotFoundError(f"Notification {notification_id} not found.")
    return n


def list_notifications(
    db: Session,
    *,
    type: str | None = None,
    status: str | None = None,
    channel: str | None = None,
    patient_id: int | None = None,
    offset: int = 0,
    limit: int = 20,
) -> tuple[list[Notification], int]:
    return repo.list_paginated(
        db,
        type=type,
        status=status,
        channel=channel,
        patient_id=patient_id,
        offset=offset,
        limit=limit,
    )


def _verify_links(
    db: Session,
    patient_id: int,
    related_appointment_id: int | None,
    related_invoice_id: int | None,
) -> None:
    if patient_repo.get(db, patient_id) is None:
        raise ValidationError(f"Patient {patient_id} does not exist.")
    if related_appointment_id is not None:
        appt = appt_repo.get(db, related_appointment_id)
        if appt is None:
            raise ValidationError(
                f"Appointment {related_appointment_id} does not exist."
            )
        if appt.patient_id != patient_id:
            raise ValidationError(
                f"Appointment {related_appointment_id} does not belong to patient {patient_id}."
            )
    if related_invoice_id is not None:
        inv = inv_repo.get(db, related_invoice_id)
        if inv is None:
            raise ValidationError(f"Invoice {related_invoice_id} does not exist.")
        if inv.patient_id != patient_id:
            raise ValidationError(
                f"Invoice {related_invoice_id} does not belong to patient {patient_id}."
            )


def create_notification(db: Session, payload: NotificationCreate) -> Notification:
    _verify_links(
        db,
        payload.patient_id,
        payload.related_appointment_id,
        payload.related_invoice_id,
    )

    data = payload.model_dump()
    data["status"] = NotificationStatus.SCHEDULED.value
    return repo.create(db, data)


def update_notification(
    db: Session, notification_id: int, payload: NotificationUpdate
) -> Notification:
    n = get_or_404(db, notification_id)
    updates = payload.model_dump(exclude_unset=True)

    if "status" in updates:
        new_status = updates["status"]
        if new_status == NotificationStatus.SENT.value and n.sent_at is None:
            updates["sent_at"] = datetime.now(timezone.utc)

    return repo.update(db, n, updates)


def mark_as_sent(db: Session, notification_id: int) -> Notification:
    n = get_or_404(db, notification_id)
    if n.status != NotificationStatus.SCHEDULED.value:
        raise ConflictError(
            f"Only scheduled notifications can be marked sent (current: {n.status})."
        )
    ok = sender.send(n)
    n.status = (
        NotificationStatus.SENT.value if ok else NotificationStatus.FAILED.value
    )
    n.sent_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(n)
    return n


def cancel_notification(db: Session, notification_id: int) -> Notification:
    n = get_or_404(db, notification_id)
    if n.status in (
        NotificationStatus.SENT.value,
        NotificationStatus.FAILED.value,
    ):
        raise ConflictError(f"Cannot cancel a notification that is {n.status}.")
    n.status = NotificationStatus.CANCELLED.value
    db.commit()
    db.refresh(n)
    return n


def delete_notification(db: Session, notification_id: int) -> None:
    n = get_or_404(db, notification_id)
    repo.delete(db, n)


__all__ = [
    "get_or_404",
    "list_notifications",
    "create_notification",
    "update_notification",
    "mark_as_sent",
    "cancel_notification",
    "delete_notification",
]
