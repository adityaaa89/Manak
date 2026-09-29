from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.models.all_models import TestRequirement, Standard

class TestingEngineService:
    def __init__(self, db: Session):
        self.db = db

    def get_testing_requirements(self, standard_id: int) -> Dict[str, Any]:
        """
        Retrieve all testing requirements for a specific standard.
        """
        # Verify the standard exists
        standard = self.db.query(Standard).filter(Standard.id == standard_id).first()
        if not standard:
            return {"error": "Standard not found"}
        
        # Query requirements
        requirements = self.db.query(TestRequirement).filter(
            TestRequirement.standard_id == standard_id
        ).all()
        
        tests = []
        for req in requirements:
            tests.append({
                "test_name": req.test_name,
                "clause": req.clause,
                "equipment": req.equipment,
                "type": req.type.value if req.type else None
            })
            
        return {
            "standard_id": standard.id,
            "standard_number": standard.standard_number,
            "tests": tests
        }
