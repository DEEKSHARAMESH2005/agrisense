import json
import logging
from typing import Dict, Any, Optional, List
from pathlib import Path
from app.config import settings

logger = logging.getLogger("agrisense.disease_info")

FALLBACK_UNAVAILABLE_MESSAGE = "Treatment information is currently unavailable. Please consult a local agricultural expert."


class DiseaseInfoService:
    """
    Service responsible for providing agricultural agronomy information
    associated with classified plant disease classes.
    """

    def __init__(self, data_file: Optional[Path] = None):
        self.data_file = data_file or settings.disease_info_path
        self._database: Dict[str, Dict[str, Any]] = {}
        self.load_database()

    def load_database(self) -> None:
        """Load the disease information JSON into memory."""
        try:
            if not self.data_file.exists():
                logger.error(f"Disease information file not found at {self.data_file}")
                self._database = {}
                return

            with open(self.data_file, "r", encoding="utf-8") as f:
                self._database = json.load(f)
            logger.info(f"Loaded disease knowledge base with {len(self._database)} classes.")
        except Exception as e:
            logger.error(f"Failed to load disease database: {e}", exc_info=True)
            self._database = {}

    def get_info(self, class_name: str) -> Dict[str, Any]:
        """
        Retrieve complete agronomic information for a given model class name.
        If class is unknown or missing, returns a safe fallback message.
        """
        if class_name in self._database:
            return self._database[class_name]

        # Safe fallback as mandated by specifications
        crop_name, disease_name = self.parse_class_name(class_name)
        return {
            "crop": crop_name,
            "disease": disease_name,
            "class_name": class_name,
            "is_healthy": "healthy" in class_name.lower(),
            "description": f"Information for {disease_name} affecting {crop_name}.",
            "symptoms": [],
            "causes": [],
            "treatment": {
                "organic": [FALLBACK_UNAVAILABLE_MESSAGE],
                "chemical": [FALLBACK_UNAVAILABLE_MESSAGE],
                "cultural": []
            },
            "prevention": [FALLBACK_UNAVAILABLE_MESSAGE],
            "references": []
        }

    @staticmethod
    def parse_class_name(class_name: str) -> tuple[str, str]:
        """
        Parse raw model label string into clean human-readable crop and disease names.
        Example: 'Corn_(maize)___Common_rust_' -> ('Corn (Maize)', 'Common Rust')
                 'Pepper,_bell___Bacterial_spot' -> ('Bell Pepper', 'Bacterial Spot')
                 'Tomato___Early_blight' -> ('Tomato', 'Early Blight')
        """
        if "___" in class_name:
            crop_part, disease_part = class_name.split("___", 1)
        else:
            return class_name.replace("_", " ").title(), "Unknown"

        # Format crop
        crop_clean = crop_part.replace("_", " ").strip()
        if "Cherry (including sour)" in crop_clean or "Cherry (including sour)" in crop_part:
            crop_name = "Cherry"
        elif "Corn (maize)" in crop_clean or "Corn (maize)" in crop_part:
            crop_name = "Corn (Maize)"
        elif "Pepper, bell" in crop_clean:
            crop_name = "Bell Pepper"
        elif "Orange" in crop_clean:
            crop_name = "Orange (Citrus)"
        else:
            crop_name = crop_clean.title()

        # Format disease
        disease_clean = disease_part.replace("_", " ").strip()
        if disease_clean.lower() == "healthy":
            disease_name = "Healthy Foliage"
        elif "haunglongbing" in disease_clean.lower():
            disease_name = "Huanglongbing (Citrus Greening)"
        elif "esca" in disease_clean.lower():
            disease_name = "Esca (Black Measles)"
        elif "spider mites" in disease_clean.lower():
            disease_name = "Spider Mites (Two-spotted Spider Mite)"
        elif "yellow leaf curl" in disease_clean.lower():
            disease_name = "Tomato Yellow Leaf Curl Virus"
        elif "mosaic virus" in disease_clean.lower():
            disease_name = "Tomato Mosaic Virus"
        else:
            disease_name = disease_clean.title()

        return crop_name, disease_name

    def list_all_classes(self) -> List[Dict[str, Any]]:
        """Return a structured list of all supported classes in the knowledge base."""
        results = []
        for idx, (class_name, data) in enumerate(self._database.items()):
            results.append({
                "id": idx,
                "class_name": class_name,
                "crop": data.get("crop", ""),
                "disease": data.get("disease", ""),
                "is_healthy": data.get("is_healthy", False),
            })
        return results

    @property
    def total_classes(self) -> int:
        return len(self._database)


disease_info_service = DiseaseInfoService()
