from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.database.database import get_db
from app.services.blueprint_generator import BlueprintGeneratorService

router = APIRouter(
    prefix="/blueprint",
    tags=["blueprint"]
)

class BlueprintResponse(BaseModel):
    product: Dict[str, Any]
    standard: Dict[str, Any]
    qco_status: Dict[str, Any]
    certification_scheme: Dict[str, Any]
    readiness: Dict[str, Any]
    licence_process: List[Dict[str, Any]]
    required_documents: List[str]
    testing_requirements: List[Dict[str, Any]]
    recommended_labs: List[Dict[str, Any]]
    sources: List[str]
    generated_at: str
    explanation: Optional[Dict[str, Any]] = None

@router.get("/generate", response_model=BlueprintResponse)
def generate_blueprint(
    product_query: str = "Electric Kettle",
    city: str = "Mumbai",
    db: Session = Depends(get_db)
):
    """
    Generate a complete compliance roadmap using structured JSON mappings.
    """
    generator = BlueprintGeneratorService(db)
    result = generator.generate_blueprint(product_query, city)
    
    from app.services.explanation_service import ExplanationService
    
    explanation = ExplanationService.generate_explanation(
        decision=f"Generated blueprint for {result.get('product', {}).get('name')}",
        confidence="High",
        structured_evidence={
            "product_info": {"product_name": result.get('product', {}).get('name')},
            "qco_info": {
                "qco_status": result.get('qco_status', {}).get('status'), 
                "standard_number": result.get('standard', {}).get('number')
            },
            "certification_info": {"certification_scheme": result.get('certification_scheme', {}).get('scheme')},
            "testing_requirements": result.get('testing_requirements', [])
        }
    )
    result["explanation"] = explanation
    
    return result
