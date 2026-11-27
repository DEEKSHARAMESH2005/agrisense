import io
from typing import Tuple
from PIL import Image, ImageOps, UnidentifiedImageError
from app.config import settings

# Supported image formats (uppercase)
ALLOWED_FORMATS = {"JPEG", "JPG", "PNG", "WEBP"}
MAX_DIMENSION = 4096  # Maximum allowed width/height to avoid memory exhaustion (decompression bomb)


class ImageValidationError(Exception):
    """Base exception for image validation failures."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class EmptyImageError(ImageValidationError):
    """Raised when uploaded file is zero bytes."""
    def __init__(self):
        super().__init__("The uploaded image file is empty (0 bytes).", status_code=400)


class ImageSizeExceededError(ImageValidationError):
    """Raised when file exceeds the maximum allowed size."""
    def __init__(self, size_mb: float, max_mb: int):
        super().__init__(
            f"Image size ({size_mb:.2f} MB) exceeds maximum allowed limit of {max_mb} MB.",
            status_code=413,
        )


class UnsupportedImageFormatError(ImageValidationError):
    """Raised when the image format is not in ALLOWED_FORMATS."""
    def __init__(self, detected_format: str):
        super().__init__(
            f"Unsupported image format '{detected_format}'. Allowed formats are JPG, JPEG, PNG, and WEBP.",
            status_code=415,
        )


class CorruptedImageError(ImageValidationError):
    """Raised when image bytes cannot be decoded or are truncated."""
    def __init__(self, details: str = ""):
        msg = f"The uploaded image file is corrupted or unreadable. {details}".strip()
        super().__init__(msg, status_code=400)


class ImageService:
    """Service responsible for validating, sanitizing, and preparing images for AI inference."""

    @staticmethod
    def validate_and_process(file_bytes: bytes, filename: str = "") -> Tuple[Image.Image, dict]:
        """
        Validate uploaded image bytes against security and format constraints,
        and convert safely to an RGB PIL Image.

        Returns:
            Tuple[Image.Image, dict]: Processed RGB PIL Image and metadata dict.
        """
        # 1. Check for empty file
        if not file_bytes or len(file_bytes) == 0:
            raise EmptyImageError()

        # 2. Check byte size limit
        file_size_bytes = len(file_bytes)
        if file_size_bytes > settings.max_upload_size_bytes:
            size_mb = file_size_bytes / (1024 * 1024)
            raise ImageSizeExceededError(size_mb=size_mb, max_mb=settings.MAX_UPLOAD_SIZE_MB)

        # 3. Validate image contents with Pillow
        try:
            image_stream = io.BytesIO(file_bytes)
            # Prevent decompression bomb denial of service
            Image.MAX_IMAGE_PIXELS = 16_000_000
            img = Image.open(image_stream)
            img.load()  # Force reading entire image buffer to detect truncated files
        except UnidentifiedImageError:
            raise CorruptedImageError("File content does not match any valid image format.")
        except Image.DecompressionBombError:
            raise ImageValidationError("Image dimensions are excessively large (decompression bomb detected).", 400)
        except Exception as e:
            raise CorruptedImageError(str(e))

        # 4. Check image format
        detected_format = (img.format or "").upper()
        if detected_format not in ALLOWED_FORMATS:
            # Check if JPG was parsed as JPEG
            if detected_format not in {"JPEG", "PNG", "WEBP"}:
                raise UnsupportedImageFormatError(detected_format or "Unknown")

        orig_width, orig_height = img.size

        # 5. Handle oversized dimensions safely
        if orig_width > MAX_DIMENSION or orig_height > MAX_DIMENSION:
            img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.Resampling.LANCZOS)

        # 6. Correct orientation based on EXIF tags (e.g. photos taken from smartphones)
        try:
            img = ImageOps.exif_transpose(img)
        except Exception:
            pass

        # 7. Safe conversion to RGB
        # Handles RGBA (transparent), P (palette), L (grayscale), CMYK safely
        if img.mode != "RGB":
            # If RGBA, paste on a neutral white background to avoid transparent black artifacts
            if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                background = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode != "RGBA":
                    img = img.convert("RGBA")
                background.paste(img, mask=img.split()[3])
                img = background
            else:
                img = img.convert("RGB")

        metadata = {
            "original_filename": filename,
            "detected_format": detected_format,
            "original_dimensions": (orig_width, orig_height),
            "processed_dimensions": img.size,
            "file_size_bytes": file_size_bytes,
        }

        return img, metadata


image_service = ImageService()
