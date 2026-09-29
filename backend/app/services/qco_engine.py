from sqlalchemy.orm import Session
from app.models.all_models import QCO, Standard
from typing import Dict, Any
from datetime import datetime

class QCOEngineService:
    def __init__(self, db: Session):
        self.db = db

    def check_qco_status(self, standard_id: int, enterprise_type: str = "micro") -> Dict[str, Any]:
        """
        Check QCO status for a given standard ID.
        """
        # Fetch the Standard and its QCO
        qco = self.db.query(QCO).filter(QCO.standard_id == standard_id).first()
        
        if not qco:
            return {
                "status": "Voluntary",
                "effective_date": None,
                "reason": "No Quality Control Order found for this standard."
            }
        
        return {
            "status": qco.status,
            "effective_date": qco.effective_date.isoformat() if qco.effective_date else None,
            "reason": qco.reason
        }
