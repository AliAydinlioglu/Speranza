from fastapi import APIRouter
from backend.app.core.models import (
    GDPRExportResponse,
    GDPRPolicyResponse,
    GDPRPurgeResponse,
)
from backend.app.services import gdpr_service

router = APIRouter(prefix="/gdpr", tags=["GDPR & Privacy"])


@router.get("/policy", response_model=GDPRPolicyResponse)
async def get_gdpr_policy():
    return gdpr_service.get_privacy_policy()


@router.get("/export", response_model=GDPRExportResponse)
async def export_gdpr_data():
    return gdpr_service.export_all_user_data()


@router.post("/erase", response_model=GDPRPurgeResponse)
async def erase_gdpr_data():
    return gdpr_service.purge_all_user_data()
