from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.product_service import ProductIntelligenceService

router = APIRouter(
    prefix="/products",
    tags=["products"]
)

class ProductAnalyseRequest(BaseModel):
    description: str

class ProductAnalyseResponse(BaseModel):
    product_name: str
    category: str
    material: str
    usage: str
    missing_information: List[str]

@router.post("/analyse", response_model=ProductAnalyseResponse)
def analyse_product(request: ProductAnalyseRequest):
    """
    Convert natural language product description into a structured profile.
    """
    if not request.description or len(request.description.strip()) < 3:
        raise HTTPException(status_code=400, detail="Product description is too short.")
        
    service = ProductIntelligenceService()
    result = service.analyze_product_description(request.description)
    
    return ProductAnalyseResponse(**result)
