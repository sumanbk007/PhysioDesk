"""Data access for ReportFile."""

from sqlalchemy.orm import Session

from app.models.report_file import ReportFile


def get(db: Session, report_id: int) -> ReportFile | None:
    return db.get(ReportFile, report_id)


def list_for_patient(db: Session, patient_id: int) -> list[ReportFile]:
    return (
        db.query(ReportFile)
        .filter(ReportFile.patient_id == patient_id)
        .order_by(ReportFile.uploaded_at.desc(), ReportFile.id.desc())
        .all()
    )


def create(db: Session, data: dict) -> ReportFile:
    row = ReportFile(**data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def delete(db: Session, row: ReportFile) -> None:
    db.delete(row)
    db.commit()


__all__ = ["get", "list_for_patient", "create", "delete"]
