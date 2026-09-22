"""Aggregates all v1 routers under /api/v1."""

from fastapi import APIRouter, Depends

from app.api.v1.routes import auth
from app.core.dependencies import get_current_user

api_router = APIRouter()

# Public routes (no auth required)
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

# ---- Protected routers ----
# Add new feature routers below, using dependencies=[Depends(get_current_user)]
# so every route in them requires auth by default.
# Example:
# from app.api.v1.routes import patients
# api_router.include_router(
#     patients.router,
#     prefix="/patients",
#     tags=["Patients"],
#     dependencies=[Depends(get_current_user)],
# )
