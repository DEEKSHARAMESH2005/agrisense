import asyncio
import json
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.services.image_service import image_service
from app.services.model_service import model_service
from app.services.disease_info_service import disease_info_service
from app.database.models import DetectionHistory
from app.schemas.disease import (
    DiseasePredictResponse,
    PredictionDetail,
    AlternativePrediction,
    DiseaseInformation,
)


class PredictionService:
    """
    High-level orchestrator coordinating image validation, model inference,
    uncertainty analysis, agricultural knowledge retrieval, and database logging.
    """

    async def predict_image(
        self,
        file_bytes: bytes,
        filename: str = "",
        user_id: Optional[str] = None,
        db: Optional[Session] = None,
    ) -> DiseasePredictResponse:
        """
        Execute full end-to-end plant disease prediction workflow.
        """
        # 1. Validate and prepare image (synchronous CPU task run in threadpool)
        pil_img, metadata = await asyncio.to_thread(
            image_service.validate_and_process, file_bytes, filename
        )

        # 2. Run model inference in threadpool to keep async event loop responsive
        predictions, inference_time_ms = await asyncio.to_thread(
            model_service.predict, pil_img, top_k=3
        )

        if not predictions:
            raise RuntimeError("Model returned no predictions.")

        # 3. Parse top prediction
        top_class_name, top_confidence = predictions[0]
        crop_name, disease_name = disease_info_service.parse_class_name(top_class_name)

        # 4. Check uncertainty against threshold
        is_uncertain = top_confidence < settings.CONFIDENCE_THRESHOLD
        uncertainty_warning: Optional[str] = None

        if is_uncertain:
            uncertainty_warning = (
                f"Prediction confidence is low ({top_confidence:.2f}% < {settings.CONFIDENCE_THRESHOLD:.1f}%). "
                "The image may be blurry, poorly lit, captured at an extreme angle, or depicts a non-leaf/unsupported subject. "
                "Please capture a clearer, well-lit leaf photo or consult a local agricultural extension expert."
            )

        # 5. Build alternatives list
        alternatives = []
        for class_name, conf in predictions:
            alt_crop, alt_disease = disease_info_service.parse_class_name(class_name)
            alternatives.append(
                AlternativePrediction(
                    crop=alt_crop,
                    disease=alt_disease,
                    class_name=class_name,
                    confidence=conf,
                )
            )

        # 6. Retrieve structured disease information
        raw_info = disease_info_service.get_info(top_class_name)
        disease_info = DiseaseInformation(**raw_info)

        # 7. Record to detection history database if session provided
        now_utc = datetime.now(timezone.utc)
        iso_timestamp = now_utc.isoformat()

        if db is not None:
            try:
                alternatives_json = json.dumps([alt.model_dump() for alt in alternatives])
                history_entry = DetectionHistory(
                    user_id=user_id,
                    crop_name=crop_name,
                    disease_name=disease_name,
                    class_name=top_class_name,
                    confidence=top_confidence,
                    is_uncertain=is_uncertain,
                    image_filename=filename or None,
                    image_path=None,  # Not saving raw uploaded files by default
                    top_alternatives=alternatives_json,
                    timestamp=now_utc,
                )
                db.add(history_entry)
                db.commit()
            except Exception as e:
                db.rollback()
                # Log error without failing client prediction
                import logging
                logging.getLogger("agrisense.prediction").error(f"Failed to record detection history: {e}")

        # 8. Build standardized response
        return DiseasePredictResponse(
            success=True,
            is_uncertain=is_uncertain,
            uncertainty_warning=uncertainty_warning,
            prediction=PredictionDetail(
                crop=crop_name,
                disease=disease_name,
                class_name=top_class_name,
                confidence=top_confidence,
            ),
            alternatives=alternatives,
            disease_information=disease_info,
            inference_time_ms=inference_time_ms,
            timestamp=iso_timestamp,
        )


prediction_service = PredictionService()
