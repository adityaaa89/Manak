from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database.database import get_db
from app.services.testing_engine import TestingEngineService

router = APIRouter(
    prefix="/testing",
    tags=["testing"]
)

class TestDetail(BaseModel):
    test_name: str
    clause: Optional[str] = None
    equipment: Optional[str] = None
    type: Optional[str] = None

class TestingRequirementsResponse(BaseModel):
    standard_id: int
    standard_number: Optional[str] = None
    tests: List[TestDetail]

@router.get("/requirements/{standard_id}", response_model=TestingRequirementsResponse)
def get_requirements(standard_id: int, db: Session = Depends(get_db)):
    """
    Retrieve all BIS testing requirements linked with a standard.
    """
    engine = TestingEngineService(db)
    result = engine.get_testing_requirements(standard_id)
    
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
        
    return result
