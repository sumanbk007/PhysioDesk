from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import PaymentMethod
from app.db.base_class import Base


class Payment(Base):
    """A single payment or refund event against an invoice.

    Payments are an append-only ledger:
      - Positive amount with is_refund=false = payment received
      - Negative amount with is_refund=true  = refund issued
    Rows are never edited; corrections are new rows. The invoice's
    paid_amount and status are recomputed by the billing service
    whenever a payment is created or deleted.
    """

    __tablename__ = "payments"
    __table_args__ = (
        CheckConstraint("amount != 0", name="ck_payments_amount_nonzero"),
        CheckConstraint(
            "(is_refund = true AND amount < 0) OR (is_refund = false AND amount > 0)",
            name="ck_payments_refund_sign_consistency",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    invoice_id: Mapped[int] = mapped_column(
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    method: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=PaymentMethod.CASH.value,
        index=True,
    )

    method_details: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    note: Mapped[str | None] = mapped_column(String(255), nullable=True)

    is_refund: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        index=True,
    )

    created_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )

    # ----- Relationships -----
    invoice: Mapped["Invoice"] = relationship(  # noqa: F821
        back_populates="payments",
    )
    creator: Mapped["User | None"] = relationship(  # noqa: F821
        back_populates="created_payments",
    )

    def __repr__(self) -> str:
        return (
            f"<Payment id={self.id} invoice_id={self.invoice_id} "
            f"amount={self.amount} method={self.method!r} "
            f"is_refund={self.is_refund}>"
        )
