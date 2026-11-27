import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.database import init_db
from app.services.model_service import model_service
from app.api.routes import health_router, disease_router, history_router

# Configure structured logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("agrisense")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager:
    - Runs on startup: initializes DB tables and pre-loads the Hugging Face AI model.
    - Runs on shutdown: cleans up model memory / database connections.
    """
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} [{settings.APP_ENV}]...")

    # 1. Initialize SQLite/PostgreSQL tables
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}", exc_info=True)

    # 2. Pre-load Hugging Face MobileNetV2 model once into memory
    model_loaded = model_service.load_model()
    if not model_loaded:
        logger.warning(
            "AI Model failed to load during startup. "
            "Endpoints relying on predictions will return 503 until resolved."
        )

    yield

    # Clean up resources on shutdown
    logger.info("Shutting down AgriSense Disease Detection Backend...")


# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Production-style REST API for plant leaf disease detection using Hugging Face "
        "MobileNetV2 (`neghani/plantvillage-mobilenetv2`). Provides image classification, "
        "confidence scoring, uncertainty handling, verified agronomic information, and detection history."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handler to avoid leaking internal stack traces
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal Server Error",
            "message": "An unexpected error occurred. Please contact the administrator.",
        },
    )


# Root route - convenient redirect to interactive API docs
@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")


# Register API v1 Routers
app.include_router(health_router, prefix="/api/v1")
app.include_router(disease_router, prefix="/api/v1")
app.include_router(history_router, prefix="/api/v1")
