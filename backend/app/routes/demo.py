from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any
from app.database.database import get_db
from app.services.blueprint_generator import BlueprintGeneratorService

router = APIRouter(
    prefix="/demo",
    tags=["demo"]
)

class DemoRequest(BaseModel):
    product_description: str
    city: str = "Mumbai"

@router.post("/compliance-analysis")
def demo_compliance_analysis(request: DemoRequest, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Hackathon Demonstration Workflow API.
    Orchestrates the entire compliance analysis pipeline sequentially:
    1. Product Analysis
    2. Standards Discovery
    3. QCO Check
    4. Certification Mapping
    5. Testing Engine
    6. Laboratory Finder
    7. Blueprint Generation
    """
    # The BlueprintGeneratorService internally orchestrates all these layers
    # via StructuredRetrievalService (for Steps 1-4 mappings)
    # and TestingEngineService & LabRankerService (for Steps 5-6).
    # Finally, it aggregates everything into the Blueprint (Step 7).
    
    generator = BlueprintGeneratorService(db)
    blueprint = generator.generate_blueprint(product_query=request.product_description, city=request.city)
    
    return {
        "status": "success",
        "message": "Demo workflow executed successfully across all compliance modules.",
        "workflow_results": blueprint
    }
