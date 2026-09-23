"""Abstract sender interface for notifications.

The default implementation writes to the application log. A real
provider (Twilio, Sparrow SMS, WhatsApp Cloud API, ...) can be
plugged in by implementing NotificationSender and swapping the
instance in app/notifications/__init__.py.
"""

from abc import ABC, abstractmethod

from app.models.notification import Notification


class NotificationSender(ABC):
    @abstractmethod
    def send(self, notification: Notification) -> bool:
        """Attempt to deliver the notification. Return True on success."""


__all__ = ["NotificationSender"]
