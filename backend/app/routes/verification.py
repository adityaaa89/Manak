from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.database.database import get_db
from app.services.verification_service import VerificationService

router = APIRouter(
    prefix="/verify",
    tags=["verification"]
)

class IdentifierInfo(BaseModel):
    type: str
    value: str

class VerificationStatus(BaseModel):
    status: str
    scope_match: bool
    message: Optional[str] = None

class VerificationResponse(BaseModel):
    ocr_text: str
    identifier: IdentifierInfo
    verification: VerificationStatus
    manufacturer: str
    standard: str
    valid_until: str

@router.post("/image", response_model=VerificationResponse)
async def verify_image(
    file: UploadFile = File(...), 
    product_name: Optional[str] = Form(""),
    db: Session = Depends(get_db)
):
    """
    Allow users to upload a product image and verify BIS certification.
    """
    try:
        image_bytes = await file.read()
        service = VerificationService(db)
        result = service.verify_product_image(image_bytes, provided_product_name=product_name)
        
        # Format explicitly for Pydantic (converting IDs to strings to avoid type issues if missing)
        return VerificationResponse(
            ocr_text=result.get("ocr_text", ""),
            identifier=result.get("identifier", {"type": "Unknown", "value": "None"}),
            verification=result.get("verification", {"status": "UNABLE_TO_VERIFY", "scope_match": False}),
            manufacturer=str(result.get("manufacturer", "")),
            standard=str(result.get("standard", "")),
            valid_until=str(result.get("valid_until", ""))
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")
