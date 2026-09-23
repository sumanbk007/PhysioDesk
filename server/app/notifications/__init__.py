"""Exports the active NotificationSender instance.

Swap this line to plug in a real provider later.
"""

from app.notifications.console_sender import ConsoleSender

sender = ConsoleSender()

__all__ = ["sender"]
