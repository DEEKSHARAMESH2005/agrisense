from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class PredictionDetail(BaseModel):
    crop: str = Field(..., description="Crop/Plant name")
    disease: str = Field(..., description="Disease or health condition name")
    class_name: str = Field(..., description="Exact model class identifier")
    confidence: float = Field(..., description="Confidence percentage (0 - 100%)")


class AlternativePrediction(BaseModel):
    crop: str = Field(..., description="Crop name")
    disease: str = Field(..., description="Disease name")
    class_name: str = Field(..., description="Model class identifier")
    confidence: float = Field(..., description="Confidence percentage (0 - 100%)")


class TreatmentInfo(BaseModel):
    organic: List[str] = Field(default_factory=list, description="Organic & biological remedies")
    chemical: List[str] = Field(default_factory=list, description="Chemical fungicides/bactericides")
    cultural: List[str] = Field(default_factory=list, description="Cultural & sanitation practices")


class DiseaseInformation(BaseModel):
    crop: Optional[str] = None
    disease: Optional[str] = None
    class_name: Optional[str] = None
    is_healthy: Optional[bool] = False
    description: Optional[str] = None
    symptoms: List[str] = Field(default_factory=list)
    causes: List[str] = Field(default_factory=list)
    treatment: TreatmentInfo = Field(default_factory=TreatmentInfo)
    prevention: List[str] = Field(default_factory=list)
    references: List[str] = Field(default_factory=list)


class DiseasePredictResponse(BaseModel):
    success: bool = Field(True, description="Prediction execution status")
    is_uncertain: bool = Field(False, description="Flagged true if confidence is below threshold")
    uncertainty_warning: Optional[str] = Field(None, description="Advisory for uncertain classifications")
    prediction: PredictionDetail
    alternatives: List[AlternativePrediction] = Field(default_factory=list)
    disease_information: Optional[DiseaseInformation] = None
    inference_time_ms: float = Field(..., description="Inference latency in milliseconds")
    timestamp: str = Field(..., description="ISO-8601 prediction timestamp")
    disclaimer: str = Field(
        "AI predictions are not guaranteed diagnoses. Consult an agricultural expert.",
        description="Medical/diagnostic disclaimer"
    )


class ModelStatusResponse(BaseModel):
    model_name: str
    model_loaded: bool
    device: str
    supported_classes_count: int
    available: bool


class DiseaseClassItem(BaseModel):
    id: int
    class_name: str
    crop: str
    disease: str
    is_healthy: bool


class DiseaseClassesResponse(BaseModel):
    total: int
    classes: List[DiseaseClassItem]


class DiseasePredictBase64Request(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded plant leaf image string")
    filename: Optional[str] = Field("leaf_photo.jpg", description="Optional filename")
    user_id: Optional[str] = Field(None, description="Optional user ID for tracking detection history")
