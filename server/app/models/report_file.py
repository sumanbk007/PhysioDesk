from datetime import datetime

from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class ReportFile(Base):

    __tablename__ = "report_files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(64), nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)

    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    uploaded_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )

    # ----- Relationships -----
    patient: Mapped["Patient"] = relationship(  # noqa: F821
        back_populates="report_files",
    )
    uploader: Mapped["User | None"] = relationship(  # noqa: F821
        back_populates="uploaded_reports",
    )

    def __repr__(self) -> str:
        return (
            f"<ReportFile id={self.id} patient_id={self.patient_id} "
            f"filename={self.filename!r} size={self.size_bytes}>"
        )
