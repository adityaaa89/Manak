from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict
from app.database.database import get_db
from app.services.lab_ranker import LabRankerService

router = APIRouter(
    prefix="/laboratories",
    tags=["laboratories"]
)

class LabSearchRequest(BaseModel):
    standard_id: int
    required_tests: List[str]
    location: Dict[str, str]

class LabResult(BaseModel):
    name: str
    supported_tests: List[str]
    matching_reason: List[str]
    recognition_status: str

class LabSearchResponse(BaseModel):
    results: List[LabResult]

@router.post("/search", response_model=LabSearchResponse)
def search_labs(request: LabSearchRequest, db: Session = Depends(get_db)):
    """
    Recommend laboratories based on BIS testing requirements.
    """
    engine = LabRankerService(db)
    result = engine.search_and_rank_labs(request.standard_id, request.required_tests, request.location)
    
    return result
