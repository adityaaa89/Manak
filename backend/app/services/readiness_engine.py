from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.models.all_models import Standard, TestRequirement

class ReadinessEngineService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_readiness(self, standard_id: int, responses: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates factory readiness based on user responses vs standard requirements.
        """
        standard = self.db.query(Standard).filter(Standard.id == standard_id).first()

        if not standard:
            return {"error": f"Standard {standard_id} not found"}

        # Basic prototype assessment algorithm
        requirements = self.db.query(TestRequirement).filter(TestRequirement.standard_id == standard.id).all()
        
        # We'll use the user's explicit responses for the score + basic testing validation
        total_checks = 3 # based on the 3 inputs provided
        completed = 0
        critical_gaps = []
        recommended_actions = []

        if responses.get("testing_equipment_available"):
            completed += 1
        else:
            critical_gaps.append({
                "requirement": "In-house Testing Equipment",
                "severity": "critical",
                "recommended_action": "Procure testing equipment for mandatory 'R' type tests."
            })
            
        if responses.get("calibration_valid"):
            completed += 1
        else:
            critical_gaps.append({
                "requirement": "Calibration certificate",
                "severity": "critical",
                "recommended_action": "Renew calibration of all testing equipment."
            })
            
        if responses.get("quality_records_available"):
            completed += 1
        else:
            critical_gaps.append({
                "requirement": "Quality Records",
                "severity": "high",
                "recommended_action": "Establish daily quality record keeping."
            })
            
        score = int((completed / total_checks) * 100) if total_checks > 0 else 0
        
        # Persist to database
        assessment_id = None
        try:
            from app.models.all_models import FactoryReadiness
            # For the prototype, we assume manufacturer_id=1 and product_id=1 for the demo user
            readiness_record = FactoryReadiness(
                manufacturer_id=1,
                product_id=1,
                readiness_score=score,
                assessment_data=responses,
                critical_gaps=critical_gaps
            )
            self.db.add(readiness_record)
            self.db.commit()
            self.db.refresh(readiness_record)
            assessment_id = readiness_record.id
        except Exception as e:
            self.db.rollback()
            return {"error": f"Failed to save assessment: {str(e)}"}
            
        return {
            "standard_id": standard.id,
            "standard_number": standard.standard_number,
            "assessment_id": str(assessment_id),
            "overall_score": score,
            "sections": [
                {
                    "name": "Testing Equipment",
                    "score": score,
                    "items": []
                }
            ],
            "critical_gaps": critical_gaps,
            "recommended_actions": [g["recommended_action"] for g in critical_gaps]
        }
