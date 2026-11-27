from datetime import datetime, timezone
from fastapi import APIRouter
from app.config import settings
from app.services.model_service import model_service

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Backend Health Check")
async def health_check():
    """
    Check the health status of the AgriSense Disease Detection Backend.
    Returns status, version, uptime timestamp, and model availability.
    """
    return {
        "status": "healthy" if model_service.is_loaded else "degraded",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "model_loaded": model_service.is_loaded,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
