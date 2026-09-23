"""Notification HTTP endpoints."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import PaginationParams, get_db
from app.schemas.common import MessageResponse, Page
from app.schemas.notification import (
    NotificationCreate,
    NotificationListItem,
    NotificationRead,
    NotificationUpdate,
)
from app.services import notification_service as service

router = APIRouter()


@router.get(
    "",
    response_model=Page[NotificationListItem],
    summary="List notifications (filter by type, status, channel, patient)",
)
def list_notifications(
    type: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    channel: str | None = Query(None),
    patient_id: int | None = Query(None),
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
) -> Page[NotificationListItem]:
    items, total = service.list_notifications(
        db,
        type=type,
        status=status_filter,
        channel=channel,
        patient_id=patient_id,
        offset=pagination.offset,
        limit=pagination.limit,
    )
    pages = (total + pagination.page_size - 1) // pagination.page_size
    return Page[NotificationListItem](
        items=[NotificationListItem.model_validate(n) for n in items],
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        pages=pages,
    )


@router.post(
    "",
    response_model=NotificationRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a reminder",
)
def create_notification(
    payload: NotificationCreate,
    db: Session = Depends(get_db),
) -> NotificationRead:
    n = service.create_notification(db, payload)
    return NotificationRead.model_validate(n)


@router.get(
    "/{notification_id}",
    response_model=NotificationRead,
    summary="Get one notification",
)
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
) -> NotificationRead:
    n = service.get_or_404(db, notification_id)
    return NotificationRead.model_validate(n)


@router.patch(
    "/{notification_id}",
    response_model=NotificationRead,
    summary="Update a notification (partial)",
)
def update_notification(
    notification_id: int,
    payload: NotificationUpdate,
    db: Session = Depends(get_db),
) -> NotificationRead:
    n = service.update_notification(db, notification_id, payload)
    return NotificationRead.model_validate(n)


@router.post(
    "/{notification_id}/mark-sent",
    response_model=NotificationRead,
    summary="Mark a notification as sent (uses the active sender)",
)
def mark_sent(
    notification_id: int,
    db: Session = Depends(get_db),
) -> NotificationRead:
    n = service.mark_as_sent(db, notification_id)
    return NotificationRead.model_validate(n)


@router.post(
    "/{notification_id}/cancel",
    response_model=NotificationRead,
    summary="Cancel a scheduled notification",
)
def cancel_notification(
    notification_id: int,
    db: Session = Depends(get_db),
) -> NotificationRead:
    n = service.cancel_notification(db, notification_id)
    return NotificationRead.model_validate(n)


@router.delete(
    "/{notification_id}",
    response_model=MessageResponse,
    summary="Delete a notification",
)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
) -> MessageResponse:
    service.delete_notification(db, notification_id)
    return MessageResponse(message=f"Notification {notification_id} deleted.")
