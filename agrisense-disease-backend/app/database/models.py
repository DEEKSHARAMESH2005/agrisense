from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from .database import Base


class DetectionHistory(Base):
    """
    Detection History table storing plant disease prediction events.
    Compatible with SQLite and PostgreSQL.
    """
    __tablename__ = "detection_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(100), nullable=True, index=True)  # Optional user identifier for future auth
    crop_name = Column(String(100), nullable=False, index=True)
    disease_name = Column(String(150), nullable=False, index=True)
    class_name = Column(String(150), nullable=False)
    confidence = Column(Float, nullable=False)
    is_uncertain = Column(Boolean, default=False, nullable=False)
    image_path = Column(String(500), nullable=True)  # Path or reference if image saving is enabled
    image_filename = Column(String(255), nullable=True)
    top_alternatives = Column(Text, nullable=True)  # JSON-encoded array of alternative predictions
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f"<DetectionHistory(id={self.id}, crop={self.crop_name}, disease={self.disease_name}, confidence={self.confidence:.2f}%)>"
