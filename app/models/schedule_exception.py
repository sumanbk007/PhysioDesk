from datetime import date, datetime, time

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Time,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class ScheduleException(Base):
    """A per-date override for a therapist's default weekly schedule.

    If a row exists for (therapist_id, date):
      - is_off=True  -> therapist is not working that day
      - is_off=False -> therapist works custom hours (custom_start, custom_end)
    Otherwise, the therapist's default work_days/start_time/end_time apply.
    """

    __tablename__ = "schedule_exceptions"
    __table_args__ = (
        UniqueConstraint(
            "therapist_id",
            "date",
            name="uq_schedule_exception_therapist_date",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    therapist_id: Mapped[int] = mapped_column(
        ForeignKey("therapists.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    is_off: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    custom_start: Mapped[time | None] = mapped_column(Time, nullable=True)

    custom_end: Mapped[time | None] = mapped_column(Time, nullable=True)

    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # ----- Relationships -----
    therapist: Mapped["Therapist"] = relationship(  # noqa: F821
        back_populates="schedule_exceptions",
    )

    def __repr__(self) -> str:
        return (
            f"<ScheduleException id={self.id} therapist_id={self.therapist_id} "
            f"date={self.date} is_off={self.is_off}>"
        )
