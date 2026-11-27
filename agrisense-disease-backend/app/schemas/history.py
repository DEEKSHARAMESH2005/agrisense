from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DetectionHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[str] = None
    crop_name: str
    disease_name: str
    class_name: str
    confidence: float
    is_uncertain: bool
    image_path: Optional[str] = None
    image_filename: Optional[str] = None
    top_alternatives: Optional[str] = None
    timestamp: datetime


class DetectionHistoryListResponse(BaseModel):
    total: int
    items: List[DetectionHistoryItem]


class HistoryDeleteResponse(BaseModel):
    success: bool
    message: str
    deleted_id: int
