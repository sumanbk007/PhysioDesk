"""
Aggregates all model imports so Alembic's autogenerate can see the full
metadata via `from app.db.base import Base`.
"""

from app.db.base_class import Base  # noqa: F401

from app.models.user import User  # noqa: E402, F401
from app.models.therapist import Therapist  # noqa: E402, F401
from app.models.schedule_exception import ScheduleException  # noqa: E402, F401
from app.models.patient import Patient  # noqa: E402, F401
from app.models.appointment import Appointment  # noqa: E402, F401
from app.models.clinical_note import ClinicalNote  # noqa: E402, F401
from app.models.report_file import ReportFile  # noqa: E402, F401
from app.models.invoice import Invoice  # noqa: E402, F401
from app.models.payment import Payment  # noqa: E402, F401
