from sqlalchemy.orm import Session
from app.models.all_models import Standard, ProductStandardMapping
from app.services.qco_engine import QCOEngineService
from typing import Dict, Any, List

class StandardMatcherService:
    def __init__(self, db: Session):
        self.db = db
        self.qco_engine = QCOEngineService(db)

    def discover_standards(self, product_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Discover applicable standards for a given product profile.
        For the prototype, it searches by keyword matching on standard titles/scopes.
        """
        product_name = product_profile.get("product_name", "").lower()
        category = product_profile.get("category", "").lower()
        
        # Prototype simple keyword search
        search_terms = []
        if product_name and product_name != "unknown product":
            search_terms.append(product_name.split()[0]) # e.g. "electric" or "helmet"
            search_terms.append(product_name.split()[-1]) # e.g. "kettle"
        
        all_standards = self.db.query(Standard).all()
        matched = []
        
        for std in all_standards:
            title_lower = std.title.lower()
            scope_lower = std.scope.lower() if std.scope else ""
            
            # Simple match logic
            for term in search_terms:
                if term and len(term) > 3 and (term in title_lower or term in scope_lower):
                    qco_status = self.qco_engine.check_qco_status(std.id)
                    
                    matched.append({
                        "standard_id": std.id,
                        "standard_number": std.standard_number,
                        "title": std.title,
                        "scheme": std.scheme,
                        "qco_status": qco_status["status"],
                        "confidence_score": 0.95,
                        "matching_reason": [f"Matched keyword: {term}"]
                    })
                    break # Don't add same standard twice
                    
        # Fallback if no match found
        if not matched:
            return {
                "message": "No specific standard found based on the provided details.",
                "matches": []
            }
            
        return {
            "message": "Standards successfully matched.",
            "matches": matched
        }
