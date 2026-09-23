"""Aggregates all v1 routers under /api/v1."""

from fastapi import APIRouter, Depends

from app.api.v1.routes import (
    appointments,
    auth,
    billing,
    clinical_notes,
    invoices,
    patients,
    progress,
    schedule,
    therapists,
)
from app.core.dependencies import get_current_user

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

_protected = [Depends(get_current_user)]

api_router.include_router(
    therapists.router,
    prefix="/therapists",
    tags=["Therapists"],
    dependencies=_protected,
)
api_router.include_router(
    patients.router,
    prefix="/patients",
    tags=["Patients"],
    dependencies=_protected,
)
api_router.include_router(
    schedule.router,
    prefix="/schedule",
    tags=["Schedule"],
    dependencies=_protected,
)
api_router.include_router(
    appointments.router,
    prefix="/appointments",
    tags=["Appointments"],
    dependencies=_protected,
)
api_router.include_router(
    clinical_notes.router,
    tags=["Clinical Notes"],
    dependencies=_protected,
)
api_router.include_router(
    progress.router,
    tags=["Progress"],
    dependencies=_protected,
)
api_router.include_router(
    invoices.router,
    prefix="/invoices",
    tags=["Invoices"],
    dependencies=_protected,
)
api_router.include_router(
    billing.router,
    prefix="/billing",
    tags=["Billing"],
    dependencies=_protected,
)
