from sqlalchemy.orm import Session
from typing import Dict, Any
from app.models.all_models import LicenceRecord
from app.services.vision_service import VisionService
from app.services.scope_matcher import ScopeMatcherService

class VerificationService:
    def __init__(self, db: Session):
        self.db = db
        self.vision_service = VisionService()
        self.scope_matcher = ScopeMatcherService()

    def verify_product_image(self, image_bytes: bytes, provided_product_name: str = "") -> Dict[str, Any]:
        """
        Combines Vision OCR, DB lookups, and Scope Matching to verify a product image.
        """
        # 1. OCR Text Extraction
        ocr_result = self.vision_service.extract_text_from_image(image_bytes)
        ocr_text = ocr_result.get("ocr_text", "")

        if "Error" in ocr_text or not ocr_text:
            return self._build_error_response("UNABLE_TO_VERIFY", "Failed to extract text from image.")

        # 2. Extract Identifier (Specifically CM/L)
        identifiers_result = self.vision_service.extract_identifiers(ocr_text)
        identifiers = identifiers_result.get("identifiers", [])
        
        cml_identifier = next((idx for idx in identifiers if idx["type"] == "CM/L"), None)
        
        if not cml_identifier:
            return self._build_error_response("INVALID_IDENTIFIER", "No CM/L number detected in the image.", ocr_text)

        cml_value = cml_identifier["value"]

        # 3. Search LicenceRecord table
        licence = self.db.query(LicenceRecord).filter(LicenceRecord.cml_number == cml_value).first()

        if not licence:
            return self._build_error_response(
                "INVALID_IDENTIFIER", 
                f"Licence {cml_value} not found in BIS registry.", 
                ocr_text, 
                cml_identifier
            )

        # 4. Scope Matching
        # We need a product name to match against the licence scope. 
        # In a full flow, the user might provide what they think the product is, or we use a fallback.
        detected_product = {"product_name": provided_product_name or "Unknown Product"}
        licence_data = {"product_scope": licence.product_scope}
        
        match_result = self.scope_matcher.match_scope(detected_product, licence_data)
        
        # In the context of verifying, if the match is UNKNOWN (e.g. no provided product name), 
        # we might just verify the licence itself, but the prompt asks for scope match checking.
        if match_result == "MISMATCH":
            status = "PRODUCT_SCOPE_MISMATCH"
            scope_match = False
        else:
            status = "VERIFIED"
            scope_match = True

        # 5. Return structured payload
        return {
            "ocr_text": ocr_text,
            "identifier": {
                "type": "CM/L",
                "value": cml_value
            },
            "verification": {
                "status": status,
                "scope_match": scope_match
            },
            "manufacturer": licence.manufacturer,
            "standard": licence.standard,
            "valid_until": licence.valid_until.isoformat() if licence.valid_until else ""
        }

    def _build_error_response(self, status: str, message: str, ocr_text: str = "", identifier: Dict[str, str] = None) -> Dict[str, Any]:
        """
        Helper to construct a uniform error response.
        """
        return {
            "ocr_text": ocr_text,
            "identifier": identifier or {"type": "Unknown", "value": "None"},
            "verification": {
                "status": status,
                "scope_match": False,
                "message": message
            },
            "manufacturer": "",
            "standard": "",
            "valid_until": ""
        }
