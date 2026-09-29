from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.database.database import get_db
from app.services.readiness_engine import ReadinessEngineService

router = APIRouter(
    prefix="/factory",
    tags=["factory"]
)

class FactoryAssessRequest(BaseModel):
    standard_id: int
    responses: Dict[str, Any]

class ReadinessSection(BaseModel):
    name: str
    score: float
    items: List[Any] = []

class CriticalGap(BaseModel):
    requirement: str
    severity: str
    recommended_action: str

class FactoryAssessResponse(BaseModel):
    standard_id: Optional[int] = None
    standard_number: Optional[str] = None
    assessment_id: Optional[str] = None
    overall_score: int
    sections: List[ReadinessSection]
    critical_gaps: List[CriticalGap]
    recommended_actions: List[str]

@router.post("/assess", response_model=FactoryAssessResponse)
def assess_factory(request: FactoryAssessRequest, db: Session = Depends(get_db)):
    """
    Assess whether a manufacturer is ready for BIS certification.
    """
    engine = ReadinessEngineService(db)
    result = engine.calculate_readiness(request.standard_id, request.responses)
    
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
        
    return result
