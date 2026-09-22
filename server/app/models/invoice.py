from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import InvoiceStatus
from app.db.base_class import Base


class Invoice(Base):
    """A bill issued to a patient for a service or package."""

    __tablename__ = "invoices"
    __table_args__ = (
        CheckConstraint("amount >= 0", name="ck_invoices_amount_nonneg"),
        CheckConstraint("discount >= 0", name="ck_invoices_discount_nonneg"),
        CheckConstraint("discount <= amount", name="ck_invoices_discount_le_amount"),
        CheckConstraint("paid_amount >= 0", name="ck_invoices_paid_amount_nonneg"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    invoice_number: Mapped[str] = mapped_column(
        String(32),
        unique=True,
        nullable=False,
        index=True,
    )

    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    appointment_id: Mapped[int | None] = mapped_column(
        ForeignKey("appointments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    service: Mapped[str] = mapped_column(String(255), nullable=False)

    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    discount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=Decimal("0.00"),
    )
    paid_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    status: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
        default=InvoiceStatus.DUE.value,
        index=True,
    )

    date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        server_default=func.current_date(),
        index=True,
    )
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # ----- Relationships -----
    patient: Mapped["Patient"] = relationship(  # noqa: F821
        back_populates="invoices",
    )
    appointment: Mapped["Appointment | None"] = relationship(  # noqa: F821
        back_populates="invoices",
    )
    payments: Mapped[list["Payment"]] = relationship(  # noqa: F821
        back_populates="invoice",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    notifications: Mapped[list["Notification"]] = relationship(  # noqa: F821
        back_populates="related_invoice",
    )

    def __repr__(self) -> str:
        return (
            f"<Invoice id={self.id} number={self.invoice_number!r} "
            f"patient_id={self.patient_id} amount={self.amount} "
            f"status={self.status!r}>"
        )
