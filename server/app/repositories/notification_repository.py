"""Data access for Notification."""

from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.notification import Notification


def get(db: Session, notification_id: int) -> Notification | None:
    return db.get(Notification, notification_id)


def list_paginated(
    db: Session,
    *,
    type: str | None = None,
    status: str | None = None,
    channel: str | None = None,
    patient_id: int | None = None,
    offset: int = 0,
    limit: int = 20,
) -> tuple[list[Notification], int]:
    q = db.query(Notification)

    if type:
        q = q.filter(Notification.type == type)
    if status:
        q = q.filter(Notification.status == status)
    if channel:
        q = q.filter(Notification.channel == channel)
    if patient_id is not None:
        q = q.filter(Notification.patient_id == patient_id)

    total = q.with_entities(func.count(Notification.id)).scalar() or 0
    items = (
        q.order_by(Notification.scheduled_for.desc(), Notification.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return items, total


def create(db: Session, data: dict) -> Notification:
    n = Notification(**data)
    db.add(n)
    db.commit()
    db.refresh(n)
    return n


def update(db: Session, n: Notification, data: dict) -> Notification:
    for field, value in data.items():
        setattr(n, field, value)
    db.commit()
    db.refresh(n)
    return n


def delete(db: Session, n: Notification) -> None:
    db.delete(n)
    db.commit()


__all__ = ["get", "list_paginated", "create", "update", "delete"]
