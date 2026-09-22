from datetime import date, datetime, time

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Time,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import AppointmentStatus
from app.db.base_class import Base


class Appointment(Base):
    """A booked session between a patient and a therapist on a specific date."""

    __tablename__ = "appointments"
    __table_args__ = (
        UniqueConstraint(
            "therapist_id",
            "date",
            "start_time",
            name="uq_appointments_therapist_date_start",
        ),
        CheckConstraint("end_time > start_time", name="ck_appointments_end_after_start"),
        Index("ix_appointments_therapist_date", "therapist_id", "date"),
        Index("ix_appointments_patient_date", "patient_id", "date"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    therapist_id: Mapped[int] = mapped_column(
        ForeignKey("therapists.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)

    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=AppointmentStatus.BOOKED.value,
        index=True,
    )

    payment_method: Mapped[str | None] = mapped_column(String(32), nullable=True)
    payment_details: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

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
        back_populates="appointments",
    )
    therapist: Mapped["Therapist"] = relationship(  # noqa: F821
        back_populates="appointments",
    )
    clinical_note: Mapped["ClinicalNote | None"] = relationship(  # noqa: F821
        back_populates="appointment",
        uselist=False,
    )
    invoices: Mapped[list["Invoice"]] = relationship(  # noqa: F821
        back_populates="appointment",
    )

    def __repr__(self) -> str:
        return (
            f"<Appointment id={self.id} patient_id={self.patient_id} "
            f"therapist_id={self.therapist_id} date={self.date} "
            f"start={self.start_time} status={self.status!r}>"
        )
