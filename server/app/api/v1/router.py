"""Aggregates all v1 routers under /api/v1."""

from fastapi import APIRouter, Depends

from app.api.v1.routes import auth, patients, therapists
from app.core.dependencies import get_current_user

api_router = APIRouter()

# ---- Public routes ----
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

# ---- Protected routes ----
api_router.include_router(
    therapists.router,
    prefix="/therapists",
    tags=["Therapists"],
    dependencies=[Depends(get_current_user)],
)
api_router.include_router(
    patients.router,
    prefix="/patients",
    tags=["Patients"],
    dependencies=[Depends(get_current_user)],
)
