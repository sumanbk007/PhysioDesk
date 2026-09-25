"""Shared Pydantic types for the API schemas."""

from typing import Annotated

from pydantic import AfterValidator
from email_validator import validate_email, EmailNotValidError


def _allow_reserved_email(value: str) -> str:
    try:
        validate_email(value, test_environment=True, check_deliverability=False)
    except EmailNotValidError as e:
        raise ValueError(str(e)) from e
    return value


DemoEmail = Annotated[str, AfterValidator(_allow_reserved_email)]
