from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.database import get_db
from app.database.models import DetectionHistory
from app.schemas.history import (
    DetectionHistoryItem,
    DetectionHistoryListResponse,
    HistoryDeleteResponse,
)

router = APIRouter(prefix="/disease", tags=["Detection History"])


@router.get(
    "/history",
    response_model=DetectionHistoryListResponse,
    summary="Get Detection History",
)
def get_detection_history(
    skip: int = Query(0, ge=0, description="Records to skip for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Maximum records to retrieve"),
    crop: Optional[str] = Query(None, description="Filter history by crop name"),
    user_id: Optional[str] = Query(None, description="Filter history by user ID"),
    db: Session = Depends(get_db),
):
    """
    Retrieve previous plant disease detection records with pagination and optional crop filtering.
    """
    query = db.query(DetectionHistory)

    if crop:
        query = query.filter(DetectionHistory.crop_name.ilike(f"%{crop}%"))
    if user_id:
        query = query.filter(DetectionHistory.user_id == user_id)

    total = query.count()
    items = query.order_by(desc(DetectionHistory.timestamp)).offset(skip).limit(limit).all()

    return DetectionHistoryListResponse(
        total=total,
        items=[DetectionHistoryItem.model_validate(item) for item in items],
    )


@router.get(
    "/history/{detection_id}",
    response_model=DetectionHistoryItem,
    summary="Get Detection Record by ID",
)
def get_detection_by_id(
    detection_id: int,
    db: Session = Depends(get_db),
):
    """
    Retrieve full details for a single detection record by its database ID.
    """
    record = db.query(DetectionHistory).filter(DetectionHistory.id == detection_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Detection history record with ID {detection_id} was not found.",
        )
    return DetectionHistoryItem.model_validate(record)


@router.delete(
    "/history/{detection_id}",
    response_model=HistoryDeleteResponse,
    summary="Delete Detection Record",
)
def delete_detection_by_id(
    detection_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete a specific detection history entry from the database.
    """
    record = db.query(DetectionHistory).filter(DetectionHistory.id == detection_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Detection history record with ID {detection_id} was not found.",
        )

    db.delete(record)
    db.commit()

    return HistoryDeleteResponse(
        success=True,
        message=f"Detection record {detection_id} successfully deleted.",
        deleted_id=detection_id,
    )
