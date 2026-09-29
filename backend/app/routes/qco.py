from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database.database import get_db
from app.services.qco_engine import QCOEngineService

router = APIRouter(
    prefix="/qco",
    tags=["qco"]
)

class QCOCheckRequest(BaseModel):
    enterprise_type: Optional[str] = "micro"
    current_date: Optional[str] = None

class QCOCheckResponse(BaseModel):
    status: str
    effective_date: Optional[str] = None
    reason: str

@router.post("/check/{standard_id}", response_model=QCOCheckResponse)
def check_qco(standard_id: int, request: QCOCheckRequest, db: Session = Depends(get_db)):
    """
    Determine whether a product standard is mandatory, upcoming, or voluntary.
    """
    engine = QCOEngineService(db)
    result = engine.check_qco_status(standard_id, request.enterprise_type)
    return result
