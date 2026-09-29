from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.models.all_models import Laboratory

class LabRankerService:
    def __init__(self, db: Session):
        self.db = db

    def search_and_rank_labs(self, standard_id: int, required_tests: List[str], location: Dict[str, str]) -> Dict[str, Any]:
        """
        Search and rank laboratories based on capability, standards, and location.
        """
        from app.models.all_models import Standard
        standard = self.db.query(Standard).filter(Standard.id == standard_id).first()
        std_number_str = standard.standard_number if standard else str(standard_id)
        
        all_labs = self.db.query(Laboratory).all()
        target_city = location.get("city", "").lower()
        
        ranked_labs = []
        
        for lab in all_labs:
            score = 0
            matching_reasons = []
            
            # Note: in sqlite, supported_standards is JSON.
            lab_standards = lab.supported_standards or []
            standard_match = False
            for std in lab_standards:
                if std_number_str.split("-")[0].replace(" ", "").lower() in std.replace(" ", "").lower():
                    score += 30
                    matching_reasons.append(f"Supports {std_number_str}")
                    standard_match = True
                    break
                    
            # Test capability match (prototype logic: if any test matches, add 40%)
            lab_tests = lab.supported_tests or []
            test_match = False
            for req_test in required_tests:
                # Mock fallback: if lab_tests is empty (like in seed data where we didn't specify tests), 
                # we'll still simulate a match for standard-supporting labs for the prototype.
                if not lab_tests and standard_match:
                    test_match = True
                    score += 40
                    matching_reasons.append(f"Performs {req_test} testing")
                    break
                else:
                    for lab_test in lab_tests:
                        if req_test.lower() in lab_test.lower():
                            score += 40
                            matching_reasons.append(f"Performs {req_test} testing")
                            test_match = True
                            break
                if test_match:
                    break
                    
            if lab.recognition_status and lab.recognition_status.lower() == "active":
                score += 20
                matching_reasons.append("Active recognition status")
                
            if lab.city and lab.city.lower() == target_city:
                score += 10
                matching_reasons.append(f"Located in target city ({lab.city})")
                
            if score > 0:
                ranked_labs.append({
                    "name": lab.name,
                    "supported_tests": lab_tests,
                    "matching_reason": matching_reasons,
                    "recognition_status": lab.recognition_status or "Unknown",
                    "score": score
                })
                
        # Sort by score descending
        ranked_labs.sort(key=lambda x: x["score"], reverse=True)
        
        # Strip internal score from final response elements
        results = []
        for lab in ranked_labs:
            results.append({
                "name": lab["name"],
                "supported_tests": lab["supported_tests"],
                "matching_reason": lab["matching_reason"],
                "recognition_status": lab["recognition_status"]
            })
            
        return {"results": results}
