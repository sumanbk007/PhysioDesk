"""Store and retrieve uploaded report files on local disk.

Abstracted behind this module so it can be swapped for S3/R2 later
without touching the report service or routes.
"""

import logging
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.core.config import settings

log = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}


def _upload_dir() -> Path:
    p = Path(settings.UPLOAD_DIR)
    p.mkdir(parents=True, exist_ok=True)
    return p


def validate_upload(file: UploadFile, size_bytes: int) -> None:
    """Raise ValueError if the file is not acceptable."""
    if file.content_type not in ALLOWED_MIME_TYPES:
        allowed = ", ".join(sorted(ALLOWED_MIME_TYPES))
        raise ValueError(f"Unsupported file type '{file.content_type}'. Allowed: {allowed}.")
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if size_bytes > max_bytes:
        raise ValueError(f"File exceeds {settings.MAX_UPLOAD_MB} MB limit.")


def save(file: UploadFile, content: bytes) -> tuple[str, int]:
    """Persist the file on disk. Returns (storage_path, size_bytes)."""
    size = len(content)
    validate_upload(file, size)

    ext = Path(file.filename or "file").suffix
    unique = f"{uuid.uuid4().hex}{ext}"
    target = _upload_dir() / unique

    target.write_bytes(content)
    log.info("Saved report file: %s (%d bytes)", target, size)

    # Return a relative path (portable across environments)
    return unique, size


def delete(storage_path: str) -> None:
    """Best-effort delete. Missing files are not an error."""
    target = _upload_dir() / storage_path
    try:
        target.unlink(missing_ok=True)
    except OSError as e:
        log.warning("Could not delete file %s: %s", target, e)


def public_url(storage_path: str) -> str:
    """URL the frontend can use to download the file."""
    return f"/static/uploads/reports/{storage_path}"


__all__ = ["validate_upload", "save", "delete", "public_url", "ALLOWED_MIME_TYPES"]
