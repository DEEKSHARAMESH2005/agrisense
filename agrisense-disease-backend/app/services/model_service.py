import time
import logging
from typing import List, Tuple, Optional, Dict
from PIL import Image
import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification
from app.config import settings

logger = logging.getLogger("agrisense.model")


class ModelServiceError(Exception):
    """Exception raised for errors during model operations."""
    pass


class ModelService:
    """
    Singleton service managing the Hugging Face MobileNetV2 plant disease classification model.
    Loads model once into memory during startup and handles thread-safe CPU/CUDA inference.
    """

    def __init__(self):
        self.model_id = settings.MODEL_ID
        self.model: Optional[AutoModelForImageClassification] = None
        self.processor: Optional[AutoImageProcessor] = None
        self.device: torch.device = torch.device("cpu")
        self.is_loaded: bool = False
        self.load_error: Optional[str] = None
        self.id2label: Dict[int, str] = {}
        self.supported_classes_count: int = 0
        self.init_duration_ms: float = 0.0

    def resolve_device(self) -> torch.device:
        """Determine whether to use CPU or CUDA based on configuration and hardware."""
        req_device = settings.MODEL_DEVICE.lower()
        if req_device == "cuda":
            if torch.cuda.is_available():
                return torch.device("cuda")
            logger.warning("CUDA was requested in settings but is unavailable. Falling back to CPU.")
            return torch.device("cpu")
        elif req_device == "cpu":
            return torch.device("cpu")
        else:  # "auto"
            if torch.cuda.is_available():
                logger.info(f"CUDA hardware detected: {torch.cuda.get_device_name(0)}. Using GPU.")
                return torch.device("cuda")
            return torch.device("cpu")

    def load_model(self) -> bool:
        """
        Load the image processor and neural network model weights from Hugging Face.
        Cached files in ~/.cache/huggingface will be used on subsequent startups.
        """
        if self.is_loaded:
            logger.info("Model is already loaded.")
            return True

        start_time = time.perf_counter()
        logger.info(f"Loading Hugging Face model: '{self.model_id}'...")

        try:
            self.device = self.resolve_device()
            logger.info(f"Selected computation device: {self.device.type.upper()}")

            # 1. Load preprocessor
            self.processor = AutoImageProcessor.from_pretrained(self.model_id)

            # 2. Load model architecture & weights
            self.model = AutoModelForImageClassification.from_pretrained(self.model_id)
            self.model.to(self.device)
            self.model.eval()  # Set to evaluation mode

            # 3. Read label configuration
            raw_id2label = self.model.config.id2label
            # Normalize keys to int
            self.id2label = {int(k): str(v) for k, v in raw_id2label.items()}
            self.supported_classes_count = len(self.id2label)

            self.init_duration_ms = (time.perf_counter() - start_time) * 1000.0
            self.is_loaded = True
            self.load_error = None

            logger.info(
                f"Model successfully loaded in {self.init_duration_ms:.1f}ms. "
                f"Supported classes: {self.supported_classes_count} on {self.device}."
            )
            return True

        except Exception as e:
            self.is_loaded = False
            self.load_error = str(e)
            logger.error(f"Failed to load Hugging Face model '{self.model_id}': {e}", exc_info=True)
            return False

    def predict(self, image: Image.Image, top_k: int = 3) -> Tuple[List[Tuple[str, float]], float]:
        """
        Run forward pass inference on a validated PIL RGB image.

        Args:
            image (Image.Image): RGB PIL Image.
            top_k (int): Number of top predictions to return (default 3).

        Returns:
            Tuple[List[Tuple[str, float]], float]:
                - List of tuples (class_name, confidence_percent)
                - Inference duration in milliseconds
        """
        if not self.is_loaded or self.model is None or self.processor is None:
            raise ModelServiceError("AI Model is not loaded. Please verify backend startup logs.")

        start_time = time.perf_counter()

        try:
            # 1. Preprocess image into PyTorch tensor
            inputs = self.processor(images=image, return_tensors="pt")
            # Move tensor to active device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            # 2. Run inference without gradient computation
            with torch.inference_mode():
                outputs = self.model(**inputs)
                logits = outputs.logits

                # 3. Compute softmax probabilities
                probabilities = torch.softmax(logits, dim=-1)[0]

                # 4. Extract top_k predictions
                top_probs, top_indices = torch.topk(probabilities, k=min(top_k, len(probabilities)))

            inference_ms = (time.perf_counter() - start_time) * 1000.0

            results: List[Tuple[str, float]] = []
            for prob, idx in zip(top_probs, top_indices):
                class_id = idx.item()
                class_name = self.id2label.get(class_id, f"Class_{class_id}")
                confidence_percent = round(prob.item() * 100.0, 2)
                results.append((class_name, confidence_percent))

            return results, round(inference_ms, 2)

        except Exception as e:
            logger.error(f"Inference execution failed: {e}", exc_info=True)
            raise ModelServiceError(f"AI Model inference error: {str(e)}")

    def get_status(self) -> Dict:
        """Return operational status and metadata of the AI model."""
        return {
            "model_name": self.model_id,
            "model_loaded": self.is_loaded,
            "device": self.device.type,
            "supported_classes_count": self.supported_classes_count,
            "available": self.is_loaded,
            "error": self.load_error,
        }


model_service = ModelService()
