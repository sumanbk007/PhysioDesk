"""Business logic for ReportFile."""

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationError
from app.models.report_file import ReportFile
from app.repositories import patient_repository as patient_repo
from app.repositories import report_file_repository as repo
from app.schemas.report_file import ReportFileWithUrl
from app.services import file_storage_service as storage


def _to_read(row: ReportFile) -> ReportFileWithUrl:
    return ReportFileWithUrl(
        id=row.id,
        patient_id=row.patient_id,
        filename=row.filename,
        mime_type=row.mime_type,
        size_bytes=row.size_bytes,
        description=row.description,
        uploaded_by=row.uploaded_by,
        uploaded_at=row.uploaded_at,
        url=storage.public_url(row.storage_path),
    )


def list_for_patient(db: Session, patient_id: int) -> list[ReportFileWithUrl]:
    if patient_repo.get(db, patient_id) is None:
        raise NotFoundError(f"Patient {patient_id} not found.")
    rows = repo.list_for_patient(db, patient_id)
    return [_to_read(r) for r in rows]


def get_or_404(db: Session, report_id: int) -> ReportFile:
    row = repo.get(db, report_id)
    if row is None:
        raise NotFoundError(f"Report {report_id} not found.")
    return row


async def upload(
    db: Session,
    patient_id: int,
    file: UploadFile,
    *,
    description: str | None,
    uploaded_by: int | None,
) -> ReportFileWithUrl:
    if patient_repo.get(db, patient_id) is None:
        raise NotFoundError(f"Patient {patient_id} not found.")

    content = await file.read()
    if not content:
        raise ValidationError("Uploaded file is empty.")

    try:
        storage_path, size = storage.save(file, content)
    except ValueError as e:
        raise ValidationError(str(e))

    row = repo.create(
        db,
        {
            "patient_id": patient_id,
            "filename": file.filename or "file",
            "storage_path": storage_path,
            "mime_type": file.content_type or "application/octet-stream",
            "size_bytes": size,
            "description": description,
            "uploaded_by": uploaded_by,
        },
    )
    return _to_read(row)


def delete(db: Session, patient_id: int, report_id: int) -> None:
    row = get_or_404(db, report_id)
    if row.patient_id != patient_id:
        raise NotFoundError(f"Report {report_id} does not belong to patient {patient_id}.")

    storage_path = row.storage_path
    repo.delete(db, row)
    storage.delete(storage_path)


__all__ = ["list_for_patient", "get_or_404", "upload", "delete"]
