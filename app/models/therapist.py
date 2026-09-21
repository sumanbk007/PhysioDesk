from datetime import datetime, time

from sqlalchemy import Boolean, DateTime, Integer, String, Text, Time, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class Therapist(Base):
    """A physiotherapist. Has a weekly working schedule and per-date overrides."""

    __tablename__ = "therapists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
        index=True,
    )

    specialty: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
        index=True,
    )

    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)

    email: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
        unique=True,
    )

    qualifications: Mapped[str | None] = mapped_column(Text, nullable=True)

    experience_years: Mapped[int | None] = mapped_column(Integer, nullable=True)

    bio: Mapped[str | None] = mapped_column(Text, nullable=True)

    avatar_url: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # e.g. ["Sun", "Mon", "Tue", "Wed", "Thu"]
    work_days: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    start_time: Mapped[time] = mapped_column(Time, nullable=False)

    end_time: Mapped[time] = mapped_column(Time, nullable=False)

    slot_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=30,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
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

    def __repr__(self) -> str:
        return f"<Therapist id={self.id} name={self.name!r} specialty={self.specialty!r}>"
