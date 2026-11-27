from .health import router as health_router
from .disease import router as disease_router
from .history import router as history_router

__all__ = ["health_router", "disease_router", "history_router"]
