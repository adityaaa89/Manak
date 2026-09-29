from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.database.database import get_db
from app.services.standard_matcher import StandardMatcherService
from app.services.product_service import ProductIntelligenceService

router = APIRouter(
    prefix="/standards",
    tags=["standards"]
)

class StandardsDiscoverRequest(BaseModel):
    product_description: str
    material: Optional[str] = None
    usage: Optional[str] = None
    capacity: Optional[str] = None

class StandardMatchDetail(BaseModel):
    standard_id: int
    standard_number: str
    title: str
    scheme: Optional[str] = None
    qco_status: str
    confidence_score: float
    matching_reason: List[str]
    explanation: Optional[Dict[str, Any]] = None

class StandardsDiscoverResponse(BaseModel):
    message: str
    matches: List[StandardMatchDetail]

@router.post("/discover", response_model=StandardsDiscoverResponse)
def discover_standards(request: StandardsDiscoverRequest, db: Session = Depends(get_db)):
    """
    Identify applicable standards based on structured product attributes.
    """
    # 1. First extract the product profile using Product Intelligence Service
    prod_service = ProductIntelligenceService()
    profile = prod_service.analyze_product_description(request.product_description)
    
    # Optional overwrites from the explicit request fields
    if request.material: profile["material"] = request.material
    if request.usage: profile["usage"] = request.usage
    
    # 2. Feed the structured profile into the Standard Matcher
    matcher = StandardMatcherService(db)
    result = matcher.discover_standards(profile)
    
    from app.services.explanation_service import ExplanationService
    
    for match in result.get("matches", []):
        explanation = ExplanationService.generate_explanation(
            decision=f"Matched Standard {match.get('standard_number')}",
            confidence="High" if match.get("confidence_score", 0) > 80 else "Medium",
            structured_evidence={
                "product_info": {"product_name": profile.get("product_name")},
                "qco_info": {"qco_status": match.get("qco_status"), "standard_number": match.get("standard_number")}
            }
        )
        match["explanation"] = explanation
        
    return result
