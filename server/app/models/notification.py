from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import (
    NotificationChannel,
    NotificationStatus,
    NotificationType,
)
from app.db.base_class import Base


class Notification(Base):
    """A scheduled or sent reminder about a patient.

    Delivery is simulated in this assignment via ConsoleSender.
    The NotificationSender interface in app/notifications/ allows
    swapping in a real provider (Twilio, Sparrow SMS, WhatsApp
    Cloud API, etc.) without touching this model.
    """

    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    type: Mapped[str] = mapped_column(
        String(48),
        nullable=False,
        default=NotificationType.APPOINTMENT_REMINDER.value,
        index=True,
    )

    channel: Mapped[str] = mapped_column(
        String(24),
        nullable=False,
        default=NotificationChannel.SMS.value,
        index=True,
    )

    scheduled_for: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
        default=NotificationStatus.SCHEDULED.value,
        index=True,
    )

    message: Mapped[str] = mapped_column(Text, nullable=False)

    sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Optional context links — a reminder might reference the appointment
    # it's reminding about, or the invoice it's asking to be paid.
    related_appointment_id: Mapped[int | None] = mapped_column(
        ForeignKey("appointments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    related_invoice_id: Mapped[int | None] = mapped_column(
        ForeignKey("invoices.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # ----- Relationships -----
    patient: Mapped["Patient"] = relationship(  # noqa: F821
        back_populates="notifications",
    )
    related_appointment: Mapped["Appointment | None"] = relationship(  # noqa: F821
        back_populates="notifications",
    )
    related_invoice: Mapped["Invoice | None"] = relationship(  # noqa: F821
        back_populates="notifications",
    )

    def __repr__(self) -> str:
        return (
            f"<Notification id={self.id} patient_id={self.patient_id} "
            f"type={self.type!r} status={self.status!r}>"
        )
