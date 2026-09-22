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

from app.db.base_class import Base


class ClinicalNote(Base):
    """A SOAP-style treatment note for one session."""

    __tablename__ = "clinical_notes"
    __table_args__ = (
        CheckConstraint(
            "pain_score IS NULL OR (pain_score >= 0 AND pain_score <= 10)",
            name="ck_clinical_notes_pain_score_range",
        ),
        CheckConstraint(
            "rom_score IS NULL OR (rom_score >= 0 AND rom_score <= 100)",
            name="ck_clinical_notes_rom_score_range",
        ),
        CheckConstraint(
            "strength_score IS NULL OR (strength_score >= 0 AND strength_score <= 5)",
            name="ck_clinical_notes_strength_score_range",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    therapist_id: Mapped[int] = mapped_column(
        ForeignKey("therapists.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    appointment_id: Mapped[int | None] = mapped_column(
        ForeignKey("appointments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    note_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )

    chief_complaint: Mapped[str | None] = mapped_column(Text, nullable=True)
    pain_location: Mapped[str | None] = mapped_column(String(120), nullable=True)
    pain_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
    assessment: Mapped[str | None] = mapped_column(Text, nullable=True)
    rom: Mapped[str | None] = mapped_column(Text, nullable=True)
    rom_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    strength: Mapped[str | None] = mapped_column(Text, nullable=True)
    strength_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    special_tests: Mapped[str | None] = mapped_column(Text, nullable=True)
    treatment: Mapped[str | None] = mapped_column(Text, nullable=True)
    exercises: Mapped[str | None] = mapped_column(Text, nullable=True)
    patient_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    hep: Mapped[str | None] = mapped_column(Text, nullable=True)
    plan: Mapped[str | None] = mapped_column(Text, nullable=True)
    therapist_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    milestone: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    patient: Mapped["Patient"] = relationship(  # noqa: F821
        back_populates="clinical_notes",
    )
    therapist: Mapped["Therapist"] = relationship(  # noqa: F821
        back_populates="clinical_notes",
    )
    appointment: Mapped["Appointment | None"] = relationship(  # noqa: F821
        back_populates="clinical_note",
    )

    def __repr__(self) -> str:
        return (
            f"<ClinicalNote id={self.id} patient_id={self.patient_id} "
            f"therapist_id={self.therapist_id} date={self.note_date}>"
        )
