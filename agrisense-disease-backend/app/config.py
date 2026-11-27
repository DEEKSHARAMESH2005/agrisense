import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Load .env file from project root
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "AgriSense Disease Detection API")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # AI Model
    MODEL_ID: str = os.getenv("MODEL_ID", "neghani/plantvillage-mobilenetv2")
    MODEL_DEVICE: str = os.getenv("MODEL_DEVICE", "auto").lower()

    # Uncertainty handling threshold (0 - 100%)
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "50.0"))

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agrisense.db")

    # Image upload configuration
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
    SAVE_UPLOADED_IMAGES: bool = os.getenv("SAVE_UPLOADED_IMAGES", "False").lower() in ("true", "1", "yes")
    UPLOAD_DIR: Path = BASE_DIR / os.getenv("UPLOAD_DIR", "uploads")

    # CORS
    _cors_raw: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:8081,http://localhost:19006,http://localhost:3000,http://127.0.0.1:8081,*"
    )

    # Disable HF Windows Symlinks warning
    HF_HUB_DISABLE_SYMLINKS_WARNING: str = os.getenv("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

    @property
    def max_upload_size_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    @property
    def cors_origins(self) -> List[str]:
        if not self._cors_raw:
            return ["*"]
        origins = [origin.strip() for origin in self._cors_raw.split(",") if origin.strip()]
        return origins if origins else ["*"]

    @property
    def data_dir(self) -> Path:
        return Path(__file__).resolve().parent / "data"

    @property
    def disease_info_path(self) -> Path:
        return self.data_dir / "disease_information.json"


settings = Settings()

# Ensure uploads directory exists if saving is enabled
if settings.SAVE_UPLOADED_IMAGES:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Set environment variable for HF Hub
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = settings.HF_HUB_DISABLE_SYMLINKS_WARNING
