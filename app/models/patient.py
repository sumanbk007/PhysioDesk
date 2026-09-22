from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import PatientStatus
from app.db.base_class import Base


class Patient(Base):
    """A patient receiving physiotherapy care.

    Every patient has exactly one assigned therapist (a change of therapist
    is a manual edit of therapist_id, not history-tracked). Sessions count
    is denormalized: recomputed in the service layer whenever a clinical
    note is created/deleted.
    """

    __tablename__ = "patients"
    __table_args__ = (
        CheckConstraint("age >= 0 AND age <= 120", name="ck_patients_age_range"),
        CheckConstraint("sessions_total >= 0", name="ck_patients_sessions_total_nonneg"),
        CheckConstraint("sessions_used >= 0", name="ck_patients_sessions_used_nonneg"),
        CheckConstraint(
            "sessions_used <= sessions_total",
            name="ck_patients_sessions_used_le_total",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(16), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    condition: Mapped[str] = mapped_column(String(255), nullable=False)

    therapist_id: Mapped[int] = mapped_column(
        ForeignKey("therapists.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    package: Mapped[str | None] = mapped_column(String(120), nullable=True)

    sessions_total: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    sessions_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=PatientStatus.ACTIVE.value,
        index=True,
    )

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
    therapist: Mapped["Therapist"] = relationship(  # noqa: F821
        back_populates="patients",
    )

    def __repr__(self) -> str:
        return (
            f"<Patient id={self.id} name={self.name!r} "
            f"therapist_id={self.therapist_id} status={self.status!r}>"
        )
