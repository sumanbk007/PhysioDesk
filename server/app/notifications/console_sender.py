"""Simulated sender used by default in this project."""

import logging

from app.models.notification import Notification
from app.notifications.base import NotificationSender

log = logging.getLogger("notifications")


class ConsoleSender(NotificationSender):
    def send(self, notification: Notification) -> bool:
        log.info(
            "[SIMULATED %s] to patient_id=%s: %s",
            notification.channel,
            notification.patient_id,
            notification.message,
        )
        return True


__all__ = ["ConsoleSender"]
