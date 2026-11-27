import asyncio
import json
from collections import defaultdict
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from app.config import settings
from app.services.image_service import image_service
from app.services.video_service import video_service
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

    def _build_prediction_response(
        self,
        predictions: List[Tuple[str, float]],
        inference_time_ms: float,
        filename: str,
        user_id: Optional[str],
        db: Optional[Session],
        save_history: bool,
    ) -> DiseasePredictResponse:
        if not predictions:
            raise RuntimeError("Model returned no predictions.")

        top_class_name, top_confidence = predictions[0]
        crop_name, disease_name = disease_info_service.parse_class_name(top_class_name)

        is_uncertain = top_confidence < settings.CONFIDENCE_THRESHOLD
        uncertainty_warning: Optional[str] = None

        if is_uncertain:
            uncertainty_warning = (
                f"Prediction confidence is low ({top_confidence:.2f}% < {settings.CONFIDENCE_THRESHOLD:.1f}%). "
                "The image may be blurry, poorly lit, captured at an extreme angle, or depicts a non-leaf/unsupported subject. "
                "Please capture a clearer, well-lit leaf photo or consult a local agricultural extension expert."
            )

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

        raw_info = disease_info_service.get_info(top_class_name)
        disease_info = DiseaseInformation(**raw_info)

        now_utc = datetime.now(timezone.utc)
        iso_timestamp = now_utc.isoformat()

        if db is not None and save_history:
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
                    image_path=None,
                    top_alternatives=alternatives_json,
                    timestamp=now_utc,
                )
                db.add(history_entry)
                db.commit()
            except Exception as e:
                db.rollback()
                import logging
                logging.getLogger("agrisense.prediction").error(f"Failed to record detection history: {e}")

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
            inference_time_ms=round(inference_time_ms, 2),
            timestamp=iso_timestamp,
        )

    async def predict_image(
        self,
        file_bytes: bytes,
        filename: str = "",
        user_id: Optional[str] = None,
        db: Optional[Session] = None,
        save_history: bool = True,
    ) -> DiseasePredictResponse:
        """
        Execute full end-to-end plant disease prediction workflow for an image.
        """
        pil_img, _ = await asyncio.to_thread(
            image_service.validate_and_process, file_bytes, filename
        )

        predictions, inference_time_ms = await asyncio.to_thread(
            model_service.predict, pil_img, top_k=3
        )

        return self._build_prediction_response(
            predictions=predictions,
            inference_time_ms=inference_time_ms,
            filename=filename,
            user_id=user_id,
            db=db,
            save_history=save_history,
        )

    async def predict_video(
        self,
        file_bytes: bytes,
        filename: str = "",
        user_id: Optional[str] = None,
        db: Optional[Session] = None,
        save_history: bool = True,
        max_frames: int = 6,
    ) -> DiseasePredictResponse:
        """
        Sample frames from an uploaded video, classify each frame, and return
        aggregated consensus predictions.
        """
        frames = await asyncio.to_thread(
            video_service.extract_frames, file_bytes, filename, max_frames
        )

        def _infer_frames():
            score_totals: Dict[str, float] = defaultdict(float)
            total_ms = 0.0
            for frame in frames:
                preds, ms = model_service.predict(frame, top_k=3)
                total_ms += ms
                for class_name, conf in preds:
                    score_totals[class_name] += conf
            averaged = [
                (cls, round(total / len(frames), 2))
                for cls, total in score_totals.items()
            ]
            averaged.sort(key=lambda item: item[1], reverse=True)
            return averaged[:3], total_ms

        predictions, inference_time_ms = await asyncio.to_thread(_infer_frames)

        return self._build_prediction_response(
            predictions=predictions,
            inference_time_ms=inference_time_ms,
            filename=filename,
            user_id=user_id,
            db=db,
            save_history=save_history,
        )


prediction_service = PredictionService()
