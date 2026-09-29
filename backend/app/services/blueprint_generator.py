from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime
from app.models.all_models import ProductProfile, Standard, FactoryReadiness

# Import existing services
from app.services.standard_matcher import StandardMatcherService
from app.services.qco_engine import QCOEngineService
from app.services.testing_engine import TestingEngineService
from app.services.readiness_engine import ReadinessEngineService
from app.services.lab_ranker import LabRankerService

class BlueprintGeneratorService:
    def __init__(self, db: Session):
        self.db = db
        self.standard_matcher = StandardMatcherService(db)
        self.qco_engine = QCOEngineService(db)
        self.testing_engine = TestingEngineService(db)
        self.readiness_engine = ReadinessEngineService(db)
        self.lab_ranker = LabRankerService(db)

    def generate_blueprint(self, product_query: str, city: str = "Mumbai") -> Dict[str, Any]:
        """
        Generates a comprehensive compliance blueprint using structured mappings and engines.
        """
        from app.services.structured_retrieval_service import StructuredRetrievalService
        import json
        
        structured_service = StructuredRetrievalService()
        evidence = structured_service.get_structured_evidence(product_query)
        
        # 1. Product Mapping Layer
        product_info = evidence.get("product_info", {})
        product_out = {
            "name": product_info.get("product_name", "Unknown"),
            "category": product_info.get("category", "Unknown"),
            "description": product_info.get("description", "")
        }
        
        # 2. Standard Mapping Layer
        applicable_standard = {}
        standard_number = None
        if "applicable_standards" in product_info and product_info["applicable_standards"]:
            std = product_info["applicable_standards"][0]
            standard_number = std.get("standard_number")
            applicable_standard = {
                "number": standard_number,
                "title": std.get("title", "")
            }
            
        # 3. QCO Mapping Layer
        qco_info = evidence.get("qco_info", {})
        qco_out = {
            "status": qco_info.get("qco_status", "Unknown"),
            "effective_date": qco_info.get("effective_date", ""),
            "document": qco_info.get("qco_document", "")
        }
        
        # 4. Certification Mapping Layer
        cert_info = evidence.get("certification_info", {})
        scheme_name = cert_info.get("certification_scheme", "")
        applicable_standard["scheme"] = scheme_name
        cert_out = {
            "scheme": scheme_name,
            "type": cert_info.get("certification_type", ""),
            "marking": cert_info.get("marking", {})
        }
        
        # 5. Fetch Scheme Process from certification_reference.json
        licence_process = []
        required_documents = []
        try:
            import os
            data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "certification")
            with open(os.path.join(data_dir, "certification_reference.json"), "r", encoding="utf-8") as f:
                cert_refs = json.load(f)
                for ref in cert_refs:
                    if ref.get("scheme") == scheme_name:
                        licence_process = ref.get("process_steps", [])
                        required_documents = ref.get("required_documents", [])
                        break
        except Exception:
            pass
            
        # 6. Testing & Labs
        # Resolve standard_id from DB using standard_number
        standard_id = 1 # fallback
        if standard_number:
            std_record = self.db.query(Standard).filter(Standard.standard_number == standard_number).first()
            if std_record:
                standard_id = std_record.id
                
        testing_result = self.testing_engine.get_testing_requirements(standard_id)
        testing_out = []
        if "tests" in testing_result:
            for t in testing_result["tests"]:
                testing_out.append({
                    "name": t.get("test_name", ""),
                    "type": t.get("type", "")
                })
                
        required_test_names = [t["name"] for t in testing_out]
        lab_result = self.lab_ranker.search_and_rank_labs(
            standard_id=standard_id,
            required_tests=required_test_names,
            location={"city": city}
        )
        
        recommended_labs = []
        for lab in lab_result.get("results", [])[:3]:
            recommended_labs.append({
                "name": lab.get("name"),
                "matching_reason": lab.get("matching_reason", [])
            })
            
        readiness_result = self.readiness_engine.calculate_readiness(standard_id, {})
        readiness_out = {
            "score": readiness_result.get("overall_score", 0),
            "critical_gaps": readiness_result.get("critical_gaps", [])
        }
            
        sources = [
            "product_standard_mapping.json",
            "standard_qco_mapping.json",
            "standard_certification_mapping.json",
            "certification_reference.json"
        ]

        return {
            "product": product_out,
            "standard": applicable_standard,
            "qco_status": qco_out,
            "certification_scheme": cert_out,
            "readiness": readiness_out,
            "licence_process": licence_process,
            "required_documents": required_documents,
            "testing_requirements": testing_out,
            "recommended_labs": recommended_labs,
            "sources": sources,
            "generated_at": datetime.utcnow().isoformat()
        }
