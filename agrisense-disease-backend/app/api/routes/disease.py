import base64
import logging
from typing import Optional
from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.model_service import model_service, ModelServiceError
from app.services.disease_info_service import disease_info_service
from app.services.prediction_service import prediction_service
from app.services.image_service import ImageValidationError
from app.schemas.disease import (
    DiseasePredictResponse,
    DiseasePredictBase64Request,
    ModelStatusResponse,
    DiseaseClassesResponse,
    DiseaseClassItem,
    DiseaseInformation,
)

logger = logging.getLogger("agrisense.api.disease")

router = APIRouter(tags=["Disease Detection"])


@router.get("/model/status", response_model=ModelStatusResponse, summary="Get AI Model Status")
async def get_model_status():
    """
    Returns information regarding the Hugging Face MobileNetV2 model:
    - Model repository identifier
    - Loading status
    - Active device (CPU / CUDA)
    - Total supported classes count
    - Model availability flag
    """
    status_info = model_service.get_status()
    return ModelStatusResponse(
        model_name=status_info["model_name"],
        model_loaded=status_info["model_loaded"],
        device=status_info["device"],
        supported_classes_count=status_info["supported_classes_count"],
        available=status_info["available"],
    )


@router.get("/disease/classes", response_model=DiseaseClassesResponse, summary="List Supported Disease Classes")
async def get_supported_classes():
    """
    Returns the complete list of 38 plant disease classes supported by the model,
    derived from the actual model configuration and labeled knowledge base.
    """
    classes_list = disease_info_service.list_all_classes()
    items = [DiseaseClassItem(**c) for c in classes_list]
    return DiseaseClassesResponse(total=len(items), classes=items)


@router.get(
    "/disease/info/{class_name}",
    response_model=DiseaseInformation,
    summary="Get Disease Agronomic Information",
)
async def get_disease_info(class_name: str):
    """
    Returns symptoms, causes, organic/chemical/cultural treatment, and prevention
    guidelines for a given supported plant disease class.
    """
    info = disease_info_service.get_info(class_name)
    return DiseaseInformation(**info)


@router.post(
    "/disease/predict",
    response_model=DiseasePredictResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict Plant Disease from Leaf Image",
)
async def predict_disease(
    file: UploadFile = File(..., description="Plant leaf image (JPG, JPEG, PNG, WEBP, max 10MB)"),
    user_id: Optional[str] = Form(None, description="Optional user ID for tracking detection history"),
    db: Session = Depends(get_db),
):
    """
    Accepts an uploaded plant leaf image, validates contents, performs AI classification
    using the Hugging Face MobileNetV2 model, and returns:
    - Predicted crop and disease
    - Top three alternative predictions with percentage confidence
    - Uncertainty flag and advisory if confidence is under 50%
    - Verified symptoms, causes, treatment, and prevention advice
    - Inference execution latency in milliseconds
    """
    if not model_service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI Model is currently unavailable or still initializing. Please retry shortly.",
        )

    try:
        # Read file bytes
        file_bytes = await file.read()

        # Run full prediction pipeline
        response = await prediction_service.predict_image(
            file_bytes=file_bytes,
            filename=file.filename or "unknown.jpg",
            user_id=user_id,
            db=db,
        )
        return response

    except ImageValidationError as e:
        logger.warning(f"Image validation failed: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=e.message)

    except ModelServiceError as e:
        logger.error(f"Inference error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error occurred during analysis: {str(e)}",
        )

    except Exception as e:
        logger.error(f"Unexpected prediction failure: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected internal error occurred while processing the leaf image.",
        )


@router.post(
    "/disease/predict-base64",
    response_model=DiseasePredictResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict Plant Disease from Base64 Image (Mobile Friendly)",
)
async def predict_disease_base64(
    request: DiseasePredictBase64Request,
    db: Session = Depends(get_db),
):
    """
    Accepts a base64-encoded plant leaf image JSON payload.
    Avoids native multipart/form-data compatibility issues on React Native / mobile clients.
    """
    if not model_service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI Model is currently unavailable or still initializing. Please retry shortly.",
        )

    try:
        raw_b64 = request.image_base64
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",", 1)[1]

        file_bytes = base64.b64decode(raw_b64)

        response = await prediction_service.predict_image(
            file_bytes=file_bytes,
            filename=request.filename or "leaf_photo.jpg",
            user_id=request.user_id,
            db=db,
        )
        return response

    except ImageValidationError as e:
        logger.warning(f"Image validation failed: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=e.message)

    except ModelServiceError as e:
        logger.error(f"Inference error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error occurred during analysis: {str(e)}",
        )

    except Exception as e:
        logger.error(f"Base64 decoding or prediction failure: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid base64 image data.",
        )
