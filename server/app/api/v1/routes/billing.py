"""Billing dashboard endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.billing import BillingDashboard
from app.services import billing_service

router = APIRouter()


@router.get(
    "/dashboard",
    response_model=BillingDashboard,
    summary="Billing dashboard stats",
)
def get_dashboard(db: Session = Depends(get_db)) -> BillingDashboard:
    return billing_service.build_dashboard(db)
